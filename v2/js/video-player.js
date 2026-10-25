/**
 * HYPER STEEL — CINEMA VIDEO PLAYER MODULE
 * Unified Primary Video Player with Dynamic Clip Switching,
 * Native Media Event Synchronization, Promise-Safe Play/Pause,
 * Race-Condition Protected Selection, and Permanent Muting Enforcement.
 */

export const VIDEO_PLAYLIST = [
  {
    id: 'sliding-door',
    src: 'assets/sliding_door.mp4',
    poster: 'assets/video_posters/sliding_door_poster.jpg',
    title: 'Multi-Track Sliding Steel Grille Door',
    subtitle: 'Smooth effortless glide mechanism tested in front of architectural spiral stair'
  },
  {
    id: 'stylish-door',
    src: 'assets/stylish_door.mp4',
    poster: 'assets/video_posters/stylish_door_poster.jpg',
    title: 'Matte Black Louvered Architectural Entrance',
    subtitle: 'Cinematic upward reveal of a multi-panel black steel pivot entrance door'
  },
  {
    id: 'metal-gate-showcase',
    src: 'assets/metal_gate_showcase.mp4',
    poster: 'assets/video_posters/metal_gate_showcase_poster.jpg',
    title: 'Botanical Laser CNC Compound Gate',
    subtitle: 'Detailed panning view of laser-cut botanical steel panels with mirror backplate'
  },
  {
    id: 'exterior-work',
    src: 'assets/exterior_work.mp4',
    poster: 'assets/video_posters/exterior_work_poster.jpg',
    title: 'Architectural Villa Exterior Fabrication',
    subtitle: 'Full architectural villa exterior showcasing integrated steel facade screens'
  },
  {
    id: 'balcony-view',
    src: 'assets/balcony_view.mp4',
    poster: 'assets/video_posters/balcony_view_poster.jpg',
    title: 'Golden Louvered Balcony Shading',
    subtitle: 'Dynamic interior and exterior perspective of geometric golden steel facade louvers'
  },
  {
    id: 'roof-work',
    src: 'assets/roof_work.mp4',
    poster: 'assets/video_posters/roof_work_poster.jpg',
    title: 'Structural Glass Pergola & Canopy',
    subtitle: 'Walkthrough inspection of a steel framework supporting laminated safety glass on terrace'
  },
  {
    id: 'roof-work-2',
    src: 'assets/roof_work_2.mp4',
    poster: 'assets/video_posters/roof_work_2_poster.jpg',
    title: 'Terrace Canopy Beam Installation',
    subtitle: 'Close-up inspection of heavy tubular steel beams and glass seal gaskets'
  },
  {
    id: 'stylish-gate-2',
    src: 'assets/stylish_gate_2.mp4',
    poster: 'assets/video_posters/stylish_gate_2_poster.jpg',
    title: 'Double-Swing Compound Gate Test',
    subtitle: 'Operational swing motion test of black steel framed gate with vertical timber inserts'
  },
  {
    id: 'stylish-gate-3',
    src: 'assets/stylish_gate_3.mp4',
    poster: 'assets/video_posters/stylish_gate_3_poster.jpg',
    title: 'Compound Gate Full Perspective',
    subtitle: 'Full compound perspective showing vehicle gate and matching pedestrian entrance wicket'
  },
  {
    id: 'finished-exterior-2',
    src: 'assets/finished_exterior_2.mp4',
    poster: 'assets/video_posters/finished_exterior_2_poster.jpg',
    title: 'Contemporary Villa Exterior Overview',
    subtitle: 'Overview of finished residence showing completed compound gate and balcony balustrades'
  },
  {
    id: 'finished-exterior-3',
    src: 'assets/finished_exterior_3.mp4',
    poster: 'assets/video_posters/finished_exterior_3_poster.jpg',
    title: 'Architectural Compound Integration',
    subtitle: 'Wide site view demonstrating harmonized steel perimeter fencing and entrance gate'
  }
];

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
   * Enforce muted state permanently across all playback and volume changes
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
  function updateSelectedVideoUI(activeCard, title, subtitle) {
    playlistCards.forEach((card) => {
      const isSelected = card === activeCard;
      card.classList.toggle('is-active', isSelected);
      card.setAttribute('aria-selected', String(isSelected));
    });

    if (playerTitle && title) playerTitle.textContent = title;
    if (playerCaption && subtitle) playerCaption.textContent = subtitle;
  }

  /**
   * Select and load new video footage into the primary player
   */
  async function selectVideo(videoData, cardElement) {
    const selectionId = ++currentSelectionId;

    // 1. Pause existing playback immediately
    try {
      videoPlayer.pause();
    } catch (e) {}

    // 2. Ensure strictly muted
    enforceMuted();

    // 3. Assign new source and poster
    if (videoData.poster) {
      videoPlayer.setAttribute('poster', videoData.poster);
    }
    videoPlayer.src = videoData.src;

    // 4. Update UI before network load
    updateSelectedVideoUI(cardElement, videoData.title, videoData.subtitle);
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
      console.info('Playback requires user interaction or autoplay deferred:', error);
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
  playlistCards.forEach((card, index) => {
    // Match card to playlist item by data attributes or index
    const videoData = VIDEO_PLAYLIST[index] || {
      src: card.getAttribute('data-video-src'),
      poster: card.getAttribute('data-video-poster'),
      title: card.getAttribute('data-video-title'),
      subtitle: card.getAttribute('data-video-caption')
    };

    card.addEventListener('click', (e) => {
      e.preventDefault();
      selectVideo(videoData, card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectVideo(videoData, card);
      }
    });
  });

  // Initial UI synchronization based on initial video state
  updatePlaybackButton(!videoPlayer.paused);
}
