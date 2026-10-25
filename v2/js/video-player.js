/**
 * HYPER STEEL — CINEMA VIDEO PLAYER MODULE
 * Unified Primary Video Player with Dynamic Clip Switching,
 * Native Media Event Synchronization, Promise-Safe Play/Pause,
 * and Permanent Muting Enforcement.
 */

export function initVideoPlayer() {
  const cinemaPlayer = document.querySelector('.cinema-player');
  const videoPlayer = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const playerTitle = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playlistCards = Array.from(document.querySelectorAll('.video-thumb-card'));
  const videoWrapper = document.querySelector('.cinema-player__video-wrapper');

  if (!cinemaPlayer || !videoPlayer) return;

  let currentSelectionId = 0;

  /**
   * Enforce muted state permanently across all playback and volume events
   */
  function enforceMuted() {
    videoPlayer.muted = true;
    videoPlayer.defaultMuted = true;
    videoPlayer.volume = 0;
  }
  enforceMuted();
  videoPlayer.addEventListener('volumechange', enforceMuted);

  /**
   * Synchronize Play / Pause button UI and Accessible Label
   */
  function updatePlaybackButton(isPlaying) {
    if (!playToggleBtn) return;
    if (isPlaying) {
      cinemaPlayer.classList.add('is-playing');
      playToggleBtn.setAttribute('aria-label', 'Pause video');
      playToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      `;
    } else {
      cinemaPlayer.classList.remove('is-playing');
      playToggleBtn.setAttribute('aria-label', 'Play video');
      playToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <polygon points="6 4 20 12 6 20 6 4"/>
        </svg>
      `;
    }
  }

  // Synchronize button UI with real HTML5 video media events
  videoPlayer.addEventListener('play', () => updatePlaybackButton(true));
  videoPlayer.addEventListener('playing', () => updatePlaybackButton(true));
  videoPlayer.addEventListener('pause', () => updatePlaybackButton(false));
  videoPlayer.addEventListener('ended', () => updatePlaybackButton(false));
  videoPlayer.addEventListener('error', () => updatePlaybackButton(false));

  /**
   * Update the playlist cards UI to reflect active selection
   */
  function updateSelectedVideoUI(activeCard, title, caption) {
    playlistCards.forEach((card) => {
      const isSelected = card === activeCard;
      card.classList.toggle('is-active', isSelected);
      card.setAttribute('aria-selected', String(isSelected));
    });

    if (playerTitle && title) playerTitle.textContent = title;
    if (playerCaption && caption) playerCaption.textContent = caption;
  }

  /**
   * Select and load new video footage into the primary player
   */
  async function selectVideo(card) {
    if (!card) return;
    const selectionId = ++currentSelectionId;

    const src = card.getAttribute('data-video-src');
    const poster = card.getAttribute('data-video-poster');
    const title = card.getAttribute('data-video-title');
    const caption = card.getAttribute('data-video-caption');

    if (!src) return;

    // 1. Pause existing playback immediately
    try {
      videoPlayer.pause();
    } catch (e) {}

    // 2. Ensure strictly muted
    enforceMuted();

    // 3. Assign new source and poster
    if (poster) videoPlayer.setAttribute('poster', poster);
    videoPlayer.src = src;

    // 4. Update UI before network load
    updateSelectedVideoUI(card, title, caption);
    updatePlaybackButton(false);

    // 5. Explicitly load the new media source
    videoPlayer.load();

    // 6. Attempt playback with promise handling
    try {
      const playPromise = videoPlayer.play();
      if (playPromise !== undefined) {
        await playPromise;

        // Ignore outdated playback results from an earlier selection
        if (selectionId !== currentSelectionId) return;

        updatePlaybackButton(!videoPlayer.paused);
      }
    } catch (error) {
      if (selectionId !== currentSelectionId) return;
      updatePlaybackButton(false);
      console.info('Autoplay deferred or user interaction required:', error);
    }
  }

  /**
   * Master Play / Pause Toggle Function
   */
  async function togglePlay() {
    enforceMuted();
    if (videoPlayer.paused || videoPlayer.ended) {
      if (videoPlayer.ended) {
        videoPlayer.currentTime = 0;
      }
      try {
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
          await playPromise;
          updatePlaybackButton(!videoPlayer.paused);
        }
      } catch (err) {
        updatePlaybackButton(false);
      }
    } else {
      try {
        videoPlayer.pause();
      } catch (err) {}
      updatePlaybackButton(false);
    }
  }

  // Play / Pause button click
  playToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  });

  // Video canvas click
  videoWrapper?.addEventListener('click', (e) => {
    e.preventDefault();
    togglePlay();
  });

  // Attach selection listeners to all thumbnail cards
  playlistCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      selectVideo(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectVideo(card);
      }
    });
  });

  // Initial UI synchronization based on initial video state
  updatePlaybackButton(!videoPlayer.paused);
}
