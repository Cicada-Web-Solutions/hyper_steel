/**
 * HYPER STEEL — PROCESS VIDEO PLAYER MODULE
 * Dominant Cinema Video Player with Smooth Clip Switching, Reliable Play/Pause Controls,
 * Safe Async Play Handling, and Strict Muting Enforcement.
 */

export function initVideoPlayer() {
  const cinemaPlayer  = document.querySelector('.cinema-player');
  const mainVideo     = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const playerTitle   = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playlistItems = document.querySelectorAll('.video-thumb-card');

  if (!cinemaPlayer || !mainVideo) return;

  let isPlayingDesired = true;
  let activePlayPromise = null;

  /* ---- Always keep muted and prevent unmuting ---- */
  function enforceMuted() {
    mainVideo.muted        = true;
    mainVideo.defaultMuted = true;
    mainVideo.volume       = 0;
  }
  enforceMuted();
  mainVideo.addEventListener('volumechange', enforceMuted);

  /* ---- Sync Play/Pause Icons ---- */
  function updatePlayIcons(playing) {
    if (!playToggleBtn) return;
    playToggleBtn.setAttribute('aria-label', playing ? 'Pause Video' : 'Play Video');
    playToggleBtn.innerHTML = playing
      ? `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }

  mainVideo.addEventListener('play', () => {
    cinemaPlayer.classList.add('is-playing');
    updatePlayIcons(true);
  });

  mainVideo.addEventListener('pause', () => {
    cinemaPlayer.classList.remove('is-playing');
    updatePlayIcons(false);
  });

  mainVideo.addEventListener('ended', () => {
    // Seamless loop
    mainVideo.currentTime = 0;
    playVideo();
  });

  /* ---- Safe Play Helper ---- */
  function playVideo() {
    enforceMuted();
    isPlayingDesired = true;

    try {
      const promise = mainVideo.play();
      if (promise !== undefined) {
        activePlayPromise = promise;
        promise
          .then(() => {
            activePlayPromise = null;
            cinemaPlayer.classList.add('is-playing');
            updatePlayIcons(true);
          })
          .catch((err) => {
            activePlayPromise = null;
            // Ignore AbortError when switching videos or pausing
            if (err.name !== 'AbortError') {
              cinemaPlayer.classList.remove('is-playing');
              updatePlayIcons(false);
            }
          });
      }
    } catch (e) {
      activePlayPromise = null;
    }
  }

  /* ---- Safe Pause Helper ---- */
  function pauseVideo() {
    isPlayingDesired = false;

    if (activePlayPromise) {
      activePlayPromise
        .then(() => {
          mainVideo.pause();
          cinemaPlayer.classList.remove('is-playing');
          updatePlayIcons(false);
        })
        .catch(() => {
          cinemaPlayer.classList.remove('is-playing');
          updatePlayIcons(false);
        });
    } else {
      mainVideo.pause();
      cinemaPlayer.classList.remove('is-playing');
      updatePlayIcons(false);
    }
  }

  /* ---- Toggle Play / Pause ---- */
  function togglePlay() {
    enforceMuted();
    if (mainVideo.paused || mainVideo.ended) {
      if (mainVideo.ended) {
        mainVideo.currentTime = 0;
      }
      playVideo();
    } else {
      pauseVideo();
    }
  }

  playToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  });

  const wrapper = document.querySelector('.cinema-player__video-wrapper');
  wrapper?.addEventListener('click', togglePlay);

  /* ---- Switch Active Video Clip ---- */
  function selectVideo(card) {
    if (!card) return;

    const videoSrc    = card.getAttribute('data-video-src');
    const videoPoster = card.getAttribute('data-video-poster');
    const title       = card.getAttribute('data-video-title');
    const caption     = card.getAttribute('data-video-caption');

    if (!videoSrc) return;

    /* Update Active Thumbnail Indicator */
    playlistItems.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    });
    card.classList.add('is-active');
    card.setAttribute('aria-selected', 'true');

    /* Update Titles */
    if (playerTitle && title) playerTitle.textContent = title;
    if (playerCaption && caption) playerCaption.textContent = caption;

    /* Poster Update */
    if (videoPoster) mainVideo.setAttribute('poster', videoPoster);

    /* Safe switch source */
    enforceMuted();
    mainVideo.pause();
    mainVideo.currentTime = 0;
    mainVideo.src = videoSrc;
    mainVideo.load();

    playVideo();
  }

  /* ---- Bind Thumbnails ---- */
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

  /* ---- Initial Autoplay Attempt ---- */
  enforceMuted();
  playVideo();

  /* ---- Viewport Visibility Observer (Pause when off-screen) ---- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          if (!mainVideo.paused) {
            mainVideo.pause();
          }
        } else {
          if (isPlayingDesired && mainVideo.paused) {
            playVideo();
          }
        }
      });
    }, { threshold: 0.25 });

    observer.observe(cinemaPlayer);
  }
}
