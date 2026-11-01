/**
 * HYPER STEEL INNOVATION — FABRICATION VIDEO PLAYER MODULE
 * Custom controls, permanent muted audio, playlist with architectural titles & subheadings.
 */

export function initVideoPlayer() {
  const mainVideo = document.getElementById('mainPlayerVideo');
  const mainVideoScreen = document.getElementById('mainVideoScreen');
  const playBtn = document.getElementById('videoPlayBtn');
  const centerPlayBtn = document.getElementById('videoPlayCenter');
  const scrubber = document.getElementById('videoScrubber');
  const progress = document.getElementById('videoProgress');
  const buffered = document.getElementById('videoBuffered');
  const currentTimeEl = document.getElementById('videoCurrentTime');
  const durationEl = document.getElementById('videoDuration');
  const fullscreenBtn = document.getElementById('videoFullscreenBtn');
  const controls = document.getElementById('videoControls');
  const mainTitle = document.getElementById('mainVideoTitle');
  const mainSubheading = document.getElementById('mainVideoSubheading');
  const listVideos = document.querySelectorAll('.video-player-container .video-list .vid');

  if (!mainVideo || !listVideos.length) return;

  // Strict Permanent Mute Enforcement
  mainVideo.muted = true;
  mainVideo.defaultMuted = true;
  mainVideo.addEventListener('volumechange', () => {
    if (!mainVideo.muted) {
      mainVideo.muted = true;
    }
  });

  let isScrubbing = false;
  let idleTimer = null;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function togglePlay() {
    if (mainVideo.paused || mainVideo.ended) {
      mainVideo.muted = true;
      mainVideo.play().catch(() => {});
    } else {
      mainVideo.pause();
    }
  }

  function resetIdleTimer() {
    if (!controls) return;
    controls.classList.remove('is-idle');
    clearTimeout(idleTimer);
    if (!mainVideo.paused && !mainVideo.ended) {
      idleTimer = setTimeout(() => {
        if (!mainVideo.paused && !isScrubbing) {
          controls.classList.add('is-idle');
        }
      }, 2400);
    }
  }

  // Video events
  mainVideo.addEventListener('play', () => {
    mainVideoScreen?.classList.add('is-playing');
    playBtn?.setAttribute('aria-label', 'Pause video');
    resetIdleTimer();
  });

  mainVideo.addEventListener('pause', () => {
    mainVideoScreen?.classList.remove('is-playing');
    playBtn?.setAttribute('aria-label', 'Play video');
    controls?.classList.remove('is-idle');
    clearTimeout(idleTimer);
  });

  mainVideo.addEventListener('ended', () => {
    mainVideo.currentTime = 0;
    mainVideo.play().catch(() => {});
  });

  mainVideo.addEventListener('timeupdate', () => {
    if (isScrubbing || !mainVideo.duration) return;
    const cur = mainVideo.currentTime;
    const dur = mainVideo.duration;
    const pct = (cur / dur) * 100;

    if (progress) progress.style.width = `${pct}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(cur);

    if (buffered && mainVideo.buffered.length > 0) {
      try {
        const bufEnd = mainVideo.buffered.end(mainVideo.buffered.length - 1);
        buffered.style.width = `${(bufEnd / dur) * 100}%`;
      } catch (e) {}
    }
  });

  mainVideo.addEventListener('loadedmetadata', () => {
    if (durationEl && mainVideo.duration) {
      durationEl.textContent = formatTime(mainVideo.duration);
    }
  });

  // Toggle playback controls
  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  centerPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  mainVideo.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // Idle controls handling
  mainVideoScreen?.addEventListener('mousemove', resetIdleTimer);
  mainVideoScreen?.addEventListener('mouseleave', () => {
    if (!mainVideo.paused) {
      controls?.classList.add('is-idle');
    }
  });

  // Scrubber interaction
  function handleScrubberSeek(e) {
    if (!scrubber || !mainVideo.duration) return;
    const rect = scrubber.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
    if (clientX === undefined) return;

    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = offsetX / rect.width;
    mainVideo.currentTime = ratio * mainVideo.duration;

    if (progress) progress.style.width = `${ratio * 100}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(mainVideo.currentTime);
  }

  if (scrubber) {
    const onMove = (e) => {
      if (!isScrubbing) return;
      handleScrubberSeek(e);
    };

    const onUp = () => {
      if (isScrubbing) {
        isScrubbing = false;
        scrubber.classList.remove('is-scrubbing');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        resetIdleTimer();
      }
    };

    scrubber.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      scrubber.classList.add('is-scrubbing');
      handleScrubberSeek(e);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    scrubber.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      scrubber.classList.add('is-scrubbing');
      handleScrubberSeek(e);
      document.addEventListener('touchmove', onMove, { passive: true });
      document.addEventListener('touchend', onUp);
    }, { passive: true });
  }

  // Fullscreen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (mainVideoScreen?.requestFullscreen) {
        mainVideoScreen.requestFullscreen();
      } else if (mainVideo.requestFullscreen) {
        mainVideo.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  fullscreenBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  // Playlist Selection
  listVideos.forEach((video) => {
    const activate = () => {
      listVideos.forEach((vid) => vid.classList.remove('active'));
      video.classList.add('active');

      const vidElem = video.querySelector('video');
      const titleElem = video.querySelector('.title');
      const subheadingElem = video.querySelector('.subheading');

      if (vidElem && mainVideo) {
        const src = vidElem.getAttribute('src');
        const poster = vidElem.getAttribute('poster');

        if (src && mainVideo.getAttribute('src') !== src) {
          mainVideo.src = src;
          if (poster) mainVideo.poster = poster;
          mainVideo.muted = true;
          mainVideo.currentTime = 0;
          mainVideo.load();
          if (progress) progress.style.width = '0%';
          if (currentTimeEl) currentTimeEl.textContent = '00:00';

          const playPromise = mainVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              mainVideo.muted = true;
              mainVideo.play().catch(() => {});
            });
          }
        }
      }

      if (titleElem && mainTitle) {
        mainTitle.textContent = titleElem.textContent.trim();
      }
      if (subheadingElem && mainSubheading) {
        mainSubheading.textContent = subheadingElem.textContent.trim();
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
}

// Auto-run if loaded directly as a module
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoPlayer, { once: true });
} else {
  initVideoPlayer();
}
