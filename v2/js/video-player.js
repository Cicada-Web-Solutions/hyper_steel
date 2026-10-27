/**
 * HYPER STEEL — CINEMA VIDEO PLAYER MODULE
 * Authoritative Single Native HTML5 Video Player.
 * 
 * Features:
 * - Clean professional inline SVG pause/play icons (no text characters or Unicode symbols)
 * - Rock-solid video switching: reads source directly from selector element or dataset,
 *   immediately marks active selector, pauses old footage, sets src on same video element,
 *   calls video.load(), updates title/subtitle, enforces muted, safely attempts play().
 * - Event delegation on playlist container + direct card listeners for maximum compatibility.
 * - Race-condition protected clip switching.
 * - Native HTML5 media event synchronization (playing, pause, ended, error).
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

// Clean inline SVG icons: pause with two vertical rounded bars, play with right-pointing triangle
const PAUSE_SVG = `<svg class="control-btn__icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="5.5" y="4" width="3.5" height="16" rx="1.5"/><rect x="15" y="4" width="3.5" height="16" rx="1.5"/></svg>`;
const PLAY_SVG = `<svg class="control-btn__icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><polygon points="6,4 20,12 6,20"/></svg>`;

export function initVideoPlayer() {
  const cinemaPlayer = document.querySelector('.cinema-player');
  const videoElement = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const playerTitle = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playlistContainer = document.querySelector('.video-playlist');
  const playlistCards = Array.from(document.querySelectorAll('.video-thumb-card'));
  const videoWrapper = document.querySelector('.cinema-player__video-wrapper');

  if (!cinemaPlayer || !videoElement) return;

  let currentSelectionId = 0;

  /**
   * Enforce muted property permanently across playback
   */
  function ensureMuted() {
    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.volume = 0;
  }
  ensureMuted();
  videoElement.addEventListener('volumechange', ensureMuted);

  /**
   * Synchronize the play/pause toggle button with actual playback state
   */
  function updateButtonUI(isPlaying) {
    if (!playToggleBtn) return;
    if (isPlaying) {
      cinemaPlayer.classList.add('is-playing');
      playToggleBtn.setAttribute('aria-label', 'Pause video');
      playToggleBtn.innerHTML = PAUSE_SVG;
    } else {
      cinemaPlayer.classList.remove('is-playing');
      playToggleBtn.setAttribute('aria-label', 'Play video');
      playToggleBtn.innerHTML = PLAY_SVG;
    }
  }

  // Native media events drive interface synchronization
  videoElement.addEventListener('playing', () => updateButtonUI(true));
  videoElement.addEventListener('pause', () => updateButtonUI(false));
  videoElement.addEventListener('ended', () => updateButtonUI(false));
  videoElement.addEventListener('error', () => updateButtonUI(false));

  /**
   * Handles selection of a video from a card element
   * Follows the exact 9-step specification:
   * 1. Immediately mark newly selected selector as active
   * 2. Pause currently playing video
   * 3. Read correct source path from selector's actual data or configuration
   * 4. Assign new source to SAME video element
   * 5. Call video.load() after changing source
   * 6. Update title and subtitle
   * 7. Keep video muted
   * 8. Attempt playback with error handling
   * 9. Prevent previous video from continuing
   */
  async function selectCard(card) {
    if (!card) return;
    const selectionId = ++currentSelectionId;

    // 1. Immediately mark newly selected selector as active
    playlistCards.forEach((c) => {
      const isSelected = (c === card);
      c.classList.toggle('is-active', isSelected);
      c.setAttribute('aria-selected', String(isSelected));
    });

    // 2. Pause currently playing video
    try {
      videoElement.pause();
    } catch (e) {}

    // 3. Read correct source path from selector's actual data or configuration
    const cardIndex = playlistCards.indexOf(card);
    const config = (cardIndex >= 0 && VIDEO_PLAYLIST[cardIndex]) ? VIDEO_PLAYLIST[cardIndex] : null;

    const src = card.getAttribute('data-video-src') || card.dataset.videoSrc || config?.src;
    const poster = card.getAttribute('data-video-poster') || card.dataset.videoPoster || config?.poster;
    const title = card.getAttribute('data-video-title') || card.dataset.videoTitle || config?.title;
    const subtitle = card.getAttribute('data-video-caption') || card.dataset.videoCaption || config?.subtitle;

    if (!src) return;

    // 4. Assign new source to the SAME video element
    if (poster) {
      videoElement.poster = poster;
      videoElement.setAttribute('poster', poster);
    }

    // Remove any nested <source> tags to ensure video.src is authoritative
    const childSources = videoElement.querySelectorAll('source');
    childSources.forEach(s => s.remove());

    videoElement.src = src;
    videoElement.setAttribute('src', src);
    videoElement.currentTime = 0;

    // 5. Call video.load() after changing source
    videoElement.load();

    // 6. Update title and subtitle to match selected video
    if (playerTitle && title) {
      playerTitle.textContent = title;
    }
    if (playerCaption && subtitle) {
      playerCaption.textContent = subtitle;
    }

    // 7. Keep video muted
    ensureMuted();

    // 8. Attempt playback and handle any rejected play() promise
    try {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      if (selectionId !== currentSelectionId) return;
      updateButtonUI(false);
      return;
    }

    // 9. Ensure previous video cannot overwrite or interfere
    if (selectionId !== currentSelectionId) return;

    updateButtonUI(!videoElement.paused);
  }

  /**
   * Master play/pause toggle
   */
  async function togglePlay() {
    ensureMuted();
    if (videoElement.paused || videoElement.ended) {
      if (videoElement.ended) {
        videoElement.currentTime = 0;
      }
      try {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        updateButtonUI(false);
      }
    } else {
      try {
        videoElement.pause();
      } catch (err) {}
      updateButtonUI(false);
    }
  }

  // Toggle button click listener
  playToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  });

  // Video canvas click listener
  videoWrapper?.addEventListener('click', (e) => {
    e.preventDefault();
    togglePlay();
  });

  // Event Delegation on Playlist Container (catches clicks on images, text, badges, cards)
  playlistContainer?.addEventListener('click', (e) => {
    const card = e.target.closest('.video-thumb-card');
    if (!card) return;
    e.preventDefault();
    selectCard(card);
  });

  // Direct card click and keyboard listeners (double guarantee across all environments)
  playlistCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      selectCard(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCard(card);
      }
    });
  });

  // Select first valid video on initial page load
  const firstCard = playlistCards[0];
  if (firstCard) {
    selectCard(firstCard);
  }
}
