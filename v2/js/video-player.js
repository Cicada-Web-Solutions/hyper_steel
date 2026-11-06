/**
 * HYPER STEEL INNOVATION — FABRICATION VIDEO PLAYER MODULE
 * Clean, minimalistic two-column interactive video player with custom video controls,
 * scrollable playlist, muted autoplay, and heading/subheading updates.
 */

export function initVideoPlayer() {
  const customPlayer = document.getElementById('customVideoPlayer');
  const mainVideo = document.getElementById('mainPlayerVideo');
  const listVideos = document.querySelectorAll('.video-player-container .video-list .vid');
  const titleElem = document.querySelector('.main-video-title');
  const subtitleElem = document.querySelector('.main-video-subheading');

  if (!mainVideo || !customPlayer) return;

  const playBtn = customPlayer.querySelector('.player-play-btn');
  const centerBtn = customPlayer.querySelector('.player-center-btn');
  const fullscreenBtn = customPlayer.querySelector('.player-fullscreen-btn');
  const progressBar = customPlayer.querySelector('.player-progress');
  const playedBar = customPlayer.querySelector('.player-progress-played');
  const bufferedBar = customPlayer.querySelector('.player-progress-buffered');
  const progressThumb = customPlayer.querySelector('.player-progress-thumb');
  const timeCurrent = customPlayer.querySelector('.time-current');
  const timeDuration = customPlayer.querySelector('.time-duration');

  // Keep video muted by default
  mainVideo.muted = true;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function togglePlay() {
    if (mainVideo.paused || mainVideo.ended) {
      mainVideo.muted = true;
      const playPromise = mainVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      mainVideo.pause();
    }
  }

  mainVideo.addEventListener('play', () => {
    customPlayer.classList.add('is-playing');
    if (centerBtn) centerBtn.setAttribute('aria-label', 'Pause video');
    if (playBtn) playBtn.setAttribute('aria-label', 'Pause video');
    resetIdleTimer();
  });

  mainVideo.addEventListener('pause', () => {
    customPlayer.classList.remove('is-playing');
    customPlayer.classList.remove('is-idle');
    if (centerBtn) centerBtn.setAttribute('aria-label', 'Play video');
    if (playBtn) playBtn.setAttribute('aria-label', 'Play video');
    clearTimeout(idleTimeout);
  });

  mainVideo.addEventListener('ended', () => {
    customPlayer.classList.remove('is-playing');
    customPlayer.classList.remove('is-idle');
    clearTimeout(idleTimeout);
  });

  if (centerBtn) centerBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  if (playBtn) playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  mainVideo.addEventListener('click', togglePlay);

  let idleTimeout = null;
  function resetIdleTimer() {
    clearTimeout(idleTimeout);
    customPlayer.classList.remove('is-idle');
    if (!mainVideo.paused) {
      idleTimeout = setTimeout(() => {
        if (!mainVideo.paused) {
          customPlayer.classList.add('is-idle');
        }
      }, 2400);
    }
  }

  customPlayer.addEventListener('mousemove', resetIdleTimer);
  customPlayer.addEventListener('mouseenter', resetIdleTimer);
  customPlayer.addEventListener('mouseleave', () => {
    if (!mainVideo.paused) {
      customPlayer.classList.add('is-idle');
    }
  });

  mainVideo.addEventListener('timeupdate', () => {
    if (!mainVideo.duration) return;
    const pct = (mainVideo.currentTime / mainVideo.duration) * 100;
    if (playedBar) playedBar.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(pct).toString());
    if (timeCurrent) timeCurrent.textContent = formatTime(mainVideo.currentTime);
  });

  function updateDuration() {
    if (timeDuration && mainVideo.duration) {
      timeDuration.textContent = formatTime(mainVideo.duration);
    }
  }
  mainVideo.addEventListener('loadedmetadata', updateDuration);
  mainVideo.addEventListener('durationchange', updateDuration);
  if (mainVideo.duration) updateDuration();

  mainVideo.addEventListener('progress', () => {
    if (mainVideo.buffered.length > 0 && mainVideo.duration) {
      const bufferedEnd = mainVideo.buffered.end(mainVideo.buffered.length - 1);
      const pct = (bufferedEnd / mainVideo.duration) * 100;
      if (bufferedBar) bufferedBar.style.width = `${pct}%`;
    }
  });

  if (progressBar) {
    let isDragging = false;

    function seek(e) {
      const rect = progressBar.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0, Math.min(1, pos));
      if (mainVideo.duration) {
        mainVideo.currentTime = pos * mainVideo.duration;
        if (playedBar) playedBar.style.width = `${pos * 100}%`;
        if (progressThumb) progressThumb.style.left = `${pos * 100}%`;
        if (timeCurrent) timeCurrent.textContent = formatTime(mainVideo.currentTime);
      }
    }

    progressBar.addEventListener('mousedown', (e) => {
      isDragging = true;
      progressBar.classList.add('is-dragging');
      seek(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) seek(e);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        progressBar.classList.remove('is-dragging');
      }
    });

    progressBar.addEventListener('touchstart', (e) => {
      isDragging = true;
      progressBar.classList.add('is-dragging');
      seek(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) seek(e);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        progressBar.classList.remove('is-dragging');
      }
    });
  }

  function toggleFullscreen() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFs) {
      if (customPlayer.requestFullscreen) {
        customPlayer.requestFullscreen();
      } else if (customPlayer.webkitRequestFullscreen) {
        customPlayer.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }

  function syncFullscreen() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    customPlayer.classList.toggle('is-fullscreen', isFs);
  }
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('webkitfullscreenchange', syncFullscreen);

  customPlayer.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (mainVideo.duration) {
        mainVideo.currentTime = Math.min(mainVideo.duration, mainVideo.currentTime + 5);
      }
    }
  });

  listVideos.forEach((video) => {
    const activate = () => {
      if (video.classList.contains('active')) return;

      listVideos.forEach((vid) => vid.classList.remove('active'));
      video.classList.add('active');

      const src = video.getAttribute('data-src');
      const poster = video.getAttribute('data-poster');
      const titleText = video.getAttribute('data-title');
      const subtitleText = video.getAttribute('data-subtitle');

      if (src && mainVideo.getAttribute('src') !== src) {
        mainVideo.src = src;
        if (poster) mainVideo.poster = poster;
        mainVideo.muted = true; // Always muted
        mainVideo.currentTime = 0;
        mainVideo.load();
        const playPromise = mainVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            mainVideo.muted = true;
            mainVideo.play().catch(() => {});
          });
        }
      }

      if (titleElem && titleText) {
        titleElem.textContent = titleText;
      }
      if (subtitleElem && subtitleText) {
        subtitleElem.textContent = subtitleText;
      }
    };

    video.addEventListener('click', activate);
    video.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  if (!mainVideo.paused) {
    customPlayer.classList.add('is-playing');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoPlayer, { once: true });
} else {
  initVideoPlayer();
}
