/**
 * HYPER STEEL — PROCESS VIDEO PLAYER MODULE
 * Dominant Cinema Video Player with Dynamic Clip Switching,
 * Real Play/Pause Controls, Strict Muting Enforcement, and Media Synchronization.
 */

export function initVideoPlayer() {
  const cinemaPlayer = document.querySelector('.cinema-player');
  const mainVideo = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const playerTitle = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playlistItems = document.querySelectorAll('.video-thumb-card');

  if (!cinemaPlayer || !mainVideo) return;

  /**
   * Enforce muted state permanently
   */
  function enforceMuted() {
    mainVideo.muted = true;
    mainVideo.defaultMuted = true;
    mainVideo.volume = 0;
  }
  enforceMuted();
  mainVideo.addEventListener('volumechange', enforceMuted);

  /**
   * Synchronize Play / Pause button UI and Accessible Label
   */
  function updatePlayButtonUI(isPlaying) {
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

  // Hook actual HTML5 video events to UI synchronization
  mainVideo.addEventListener('play', () => updatePlayButtonUI(true));
  mainVideo.addEventListener('playing', () => updatePlayButtonUI(true));
  mainVideo.addEventListener('pause', () => updatePlayButtonUI(false));
  mainVideo.addEventListener('ended', () => updatePlayButtonUI(false));
  mainVideo.addEventListener('error', () => updatePlayButtonUI(false));

  /**
   * Safe Play Helper handling Browser Autoplay Policies
   */
  function attemptPlay() {
    enforceMuted();
    try {
      const playPromise = mainVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            updatePlayButtonUI(true);
          })
          .catch((err) => {
            // Autoplay rejected or aborted due to clip switch
            if (err.name !== 'AbortError') {
              updatePlayButtonUI(false);
            }
          });
      }
    } catch (e) {
      updatePlayButtonUI(false);
    }
  }

  /**
   * Safe Pause Helper
   */
  function attemptPause() {
    mainVideo.pause();
    updatePlayButtonUI(false);
  }

  /**
   * Toggle Play / Pause
   */
  function togglePlay() {
    if (mainVideo.paused || mainVideo.ended) {
      if (mainVideo.ended) {
        mainVideo.currentTime = 0;
      }
      attemptPlay();
    } else {
      attemptPause();
    }
  }

  playToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  });

  const videoWrapper = document.querySelector('.cinema-player__video-wrapper');
  videoWrapper?.addEventListener('click', togglePlay);

  /**
   * Switch Active Video Clip
   */
  function selectVideo(card) {
    if (!card) return;

    const videoSrc = card.getAttribute('data-video-src');
    const videoPoster = card.getAttribute('data-video-poster');
    const title = card.getAttribute('data-video-title');
    const caption = card.getAttribute('data-video-caption');

    if (!videoSrc) return;

    // 1. Update Thumbnail Selector Active State
    playlistItems.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    });
    card.classList.add('is-active');
    card.setAttribute('aria-selected', 'true');

    // 2. Update Overlay Title & Subtitle
    if (playerTitle && title) playerTitle.textContent = title;
    if (playerCaption && caption) playerCaption.textContent = caption;

    // 3. Stop and reset previous footage
    mainVideo.pause();
    mainVideo.currentTime = 0;

    // 4. Load new video footage
    if (videoPoster) mainVideo.setAttribute('poster', videoPoster);
    mainVideo.src = videoSrc;
    mainVideo.load();
    enforceMuted();

    // 5. Autoplay new footage
    attemptPlay();
  }

  // Bind all thumbnail cards
  playlistItems.forEach((card) => {
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

  // Initial player state
  updatePlayButtonUI(false);
  enforceMuted();
  attemptPlay();
}
