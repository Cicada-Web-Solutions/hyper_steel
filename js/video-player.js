/**
 * HYPER STEEL — VIDEO SHOWCASE MODULE
 * Muted cinema player with smooth video switching, play/pause controls, and metadata updates.
 */

export function initVideoPlayer() {
  const cinemaPlayer  = document.querySelector('.cinema-player');
  const mainVideo     = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const playerTitle   = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playerBadge   = document.querySelector('.cinema-player__badge');
  const playlistItems = document.querySelectorAll('.video-thumb-card');

  if (!cinemaPlayer || !mainVideo) return;

  /* ---- Always keep muted and prevent unmuting ---- */
  function enforceMuted() {
    mainVideo.muted        = true;
    mainVideo.defaultMuted = true;
    mainVideo.volume       = 0;
  }
  enforceMuted();
  mainVideo.addEventListener('volumechange', enforceMuted);

  /* ---- Play / pause icon sync ---- */
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

  /* ---- Toggle play/pause ---- */
  function togglePlay() {
    enforceMuted();
    if (mainVideo.paused) {
      const p = mainVideo.play();
      if (p !== undefined) {
        p.then(() => {
          cinemaPlayer.classList.add('is-playing');
          updatePlayIcons(true);
        }).catch((err) => {
          console.warn('Play interrupted:', err);
        });
      }
    } else {
      mainVideo.pause();
    }
  }

  playToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    togglePlay();
  });

  mainVideo.addEventListener('click', togglePlay);

  /* ---- Switch to a different video card ---- */
  function selectVideo(card) {
    if (!card) return;

    const videoSrc    = card.getAttribute('data-video-src');
    const videoPoster = card.getAttribute('data-video-poster');
    const title       = card.getAttribute('data-video-title');
    const caption     = card.getAttribute('data-video-caption');
    const category    = card.getAttribute('data-video-category');

    if (!videoSrc) return;

    /* Update active indicator across all cards */
    const allCards = document.querySelectorAll('.video-thumb-card');
    allCards.forEach((c) => {
      c.classList.remove('is-active');
      c.setAttribute('aria-selected', 'false');
    });
    card.classList.add('is-active');
    card.setAttribute('aria-selected', 'true');

    /* Update text metadata */
    if (playerTitle   && title)   playerTitle.textContent   = title;
    if (playerCaption && caption) playerCaption.textContent = caption;
    if (playerBadge   && category) playerBadge.textContent = category;

    /* Poster update */
    if (videoPoster) mainVideo.setAttribute('poster', videoPoster);

    /* ---- Source switch and reload ---- */
    enforceMuted();
    mainVideo.pause();

    // Cleanly assign source and load
    mainVideo.src = videoSrc;
    mainVideo.load();

    const p = mainVideo.play();
    if (p !== undefined) {
      p.then(() => {
        cinemaPlayer.classList.add('is-playing');
        updatePlayIcons(true);
      }).catch((err) => {
        cinemaPlayer.classList.remove('is-playing');
        updatePlayIcons(false);
        console.log('Video ready to play:', err.message);
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

  /* ---- Initial autoplay attempt ---- */
  enforceMuted();
  const initPromise = mainVideo.play();
  if (initPromise !== undefined) {
    initPromise.then(() => {
      cinemaPlayer.classList.add('is-playing');
      updatePlayIcons(true);
    }).catch(() => {
      cinemaPlayer.classList.remove('is-playing');
      updatePlayIcons(false);
    });
  }

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
