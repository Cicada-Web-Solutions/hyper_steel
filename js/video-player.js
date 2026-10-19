/**
 * HYPER STEEL — VIDEO SHOWCASE MODULE
 * Muted autoplay cinema player with reliable playlist switching and 90-degree upright correction.
 */

export function initVideoPlayer() {
  const cinemaPlayer = document.querySelector('.cinema-player');
  const mainVideo    = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const playerTitle   = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playlistItems = document.querySelectorAll('.video-thumb-card');

  if (!cinemaPlayer || !mainVideo) return;

  /* ---- Always keep muted ---- */
  function enforceMuted() {
    mainVideo.muted        = true;
    mainVideo.defaultMuted = true;
    mainVideo.volume       = 0;
  }
  enforceMuted();

  /* ---- Play / pause icon sync ---- */
  function updatePlayIcons(playing) {
    if (!playToggleBtn) return;
    playToggleBtn.setAttribute('aria-label', playing ? 'Pause Video' : 'Play Video');
    playToggleBtn.innerHTML = playing
      ? `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  }

  mainVideo.addEventListener('play',  () => { cinemaPlayer.classList.add('is-playing');    updatePlayIcons(true);  });
  mainVideo.addEventListener('pause', () => { cinemaPlayer.classList.remove('is-playing'); updatePlayIcons(false); });
  mainVideo.addEventListener('volumechange', () => { if (!mainVideo.muted) mainVideo.muted = true; });

  /* ---- Toggle play/pause ---- */
  function togglePlay() {
    if (mainVideo.paused) {
      enforceMuted();
      mainVideo.play().catch(console.warn);
    } else {
      mainVideo.pause();
    }
  }
  playToggleBtn?.addEventListener('click', togglePlay);

  /* ---- Switch to a different video card ---- */
  function selectVideo(card) {
    if (!card) return;

    /* Update active indicator */
    playlistItems.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    });
    card.classList.add('is-active');
    card.setAttribute('aria-selected', 'true');

    const videoSrc    = card.getAttribute('data-video-src');
    const videoPoster = card.getAttribute('data-video-poster');
    const title       = card.getAttribute('data-video-title');
    const caption     = card.getAttribute('data-video-caption');
    const rotate      = card.getAttribute('data-rotate');

    if (!videoSrc) return;

    /* Update text */
    if (playerTitle   && title)   playerTitle.textContent   = title;
    if (playerCaption && caption) playerCaption.textContent = caption;

    /* Rotation correction for portrait/sideways footage */
    if (rotate === '90') {
      mainVideo.classList.add('is-rotated-90');
    } else {
      mainVideo.classList.remove('is-rotated-90');
    }

    /* Poster update */
    if (videoPoster) mainVideo.setAttribute('poster', videoPoster);

    /* ---- Robust source switch ---- */
    enforceMuted();
    mainVideo.pause();

    // Remove any existing <source> children and rely on src attribute
    Array.from(mainVideo.querySelectorAll('source')).forEach(s => s.remove());

    mainVideo.removeAttribute('src');
    mainVideo.load(); // reset media element

    mainVideo.src = videoSrc;
    mainVideo.load();

    const p = mainVideo.play();
    if (p !== undefined) {
      p.then(() => {
        cinemaPlayer.classList.add('is-playing');
        updatePlayIcons(true);
      }).catch(() => {
        cinemaPlayer.classList.remove('is-playing');
        updatePlayIcons(false);
      });
    }
  }

  /* ---- Bind clicks on all playlist cards ---- */
  playlistItems.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectVideo(card);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectVideo(card);
      }
    });
  });

  /* ---- Initial autoplay ---- */
  enforceMuted();
  mainVideo.play().catch(() => { /* Waiting for user gesture */ });

  /* ---- Auto-pause when scrolled out of view ---- */
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !mainVideo.paused) {
          mainVideo.pause();
        } else if (entry.isIntersecting && mainVideo.paused && cinemaPlayer.classList.contains('is-playing')) {
          enforceMuted();
          mainVideo.play().catch(() => {});
        }
      });
    }, { threshold: 0.25 });
    obs.observe(cinemaPlayer);
  }
}
