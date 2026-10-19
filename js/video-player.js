/**
 * HYPER STEEL — VIDEO SHOWCASE MODULE
 * Autoplaying cinema player with playlist switching and mute toggle
 */

export function initVideoPlayer() {
  const cinemaPlayer = document.querySelector('.cinema-player');
  const mainVideo = document.querySelector('.cinema-player__video');
  const playToggleBtn = document.querySelector('.js-play-toggle');
  const muteToggleBtn = document.querySelector('.js-mute-toggle');
  const playerTitle = document.querySelector('.cinema-player__title');
  const playerCaption = document.querySelector('.cinema-player__caption');
  const playlistItems = document.querySelectorAll('.video-thumb-card');

  if (!cinemaPlayer || !mainVideo) return;

  // Autoplay video on load (muted)
  mainVideo.muted = true;
  mainVideo.play().then(() => {
    cinemaPlayer.classList.add('is-playing');
    updatePlayIcons(true);
  }).catch((err) => {
    console.log('Autoplay deferred until user interaction:', err);
  });

  // Toggle play/pause
  function togglePlay() {
    if (mainVideo.paused) {
      mainVideo.play().then(() => {
        cinemaPlayer.classList.add('is-playing');
        updatePlayIcons(true);
      }).catch((err) => {
        console.warn('Playback prevented:', err);
      });
    } else {
      mainVideo.pause();
      cinemaPlayer.classList.remove('is-playing');
      updatePlayIcons(false);
    }
  }

  function updatePlayIcons(isPlaying) {
    if (playToggleBtn) {
      playToggleBtn.setAttribute('aria-label', isPlaying ? 'Pause Video' : 'Play Video');
      playToggleBtn.innerHTML = isPlaying
        ? `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
        : `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    }
  }

  // Toggle mute
  function toggleMute() {
    mainVideo.muted = !mainVideo.muted;
    if (muteToggleBtn) {
      muteToggleBtn.setAttribute('aria-label', mainVideo.muted ? 'Unmute Audio' : 'Mute Audio');
      muteToggleBtn.innerHTML = mainVideo.muted
        ? `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
        : `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
    }
  }

  playToggleBtn?.addEventListener('click', togglePlay);
  muteToggleBtn?.addEventListener('click', toggleMute);

  // Switch video from playlist
  playlistItems.forEach((card) => {
    card.addEventListener('click', () => {
      playlistItems.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');

      const videoSrc = card.getAttribute('data-video-src');
      const videoPoster = card.getAttribute('data-video-poster');
      const title = card.getAttribute('data-video-title');
      const caption = card.getAttribute('data-video-caption');

      if (videoSrc) {
        mainVideo.src = videoSrc;
        if (videoPoster) mainVideo.poster = videoPoster;
        if (playerTitle && title) playerTitle.textContent = title;
        if (playerCaption && caption) playerCaption.textContent = caption;

        mainVideo.load();
        mainVideo.play().then(() => {
          cinemaPlayer.classList.add('is-playing');
          updatePlayIcons(true);
        }).catch(() => {
          cinemaPlayer.classList.remove('is-playing');
          updatePlayIcons(false);
        });
      }
    });
  });

  // Auto-pause video when scrolled out of view to preserve resources
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && !mainVideo.paused) {
          mainVideo.pause();
          cinemaPlayer.classList.remove('is-playing');
          updatePlayIcons(false);
        } else if (entry.isIntersecting && mainVideo.paused) {
          mainVideo.play().then(() => {
            cinemaPlayer.classList.add('is-playing');
            updatePlayIcons(true);
          }).catch(() => {});
        }
      });
    }, { threshold: 0.25 });

    observer.observe(cinemaPlayer);
  }
}
