/**
 * HYPER STEEL FABRICATION — WORK VIDEOS GALLERY
 * Click-to-play fullscreen-style video overlay with muted autoplay,
 * native aspect ratio protection (9:16 portrait & 16:9 landscape), and mobile support.
 */

export function initVideoPlayer() {
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const modalViewport = document.getElementById("modalViewport");
  const modalAmbient = document.getElementById("modalAmbient");
  const modalTitle = document.getElementById("modalVideoTitle");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalPlayBtn = document.getElementById("modalPlayBtn");
  const modalCenterToggle = document.getElementById("modalCenterToggle");
  const modalMuteBtn = document.getElementById("modalMuteBtn");
  const modalFullscreenBtn = document.getElementById("modalFullscreenBtn");
  const modalScrubber = document.getElementById("modalScrubber");
  const modalProgress = document.getElementById("modalProgress");
  const modalBuffered = document.getElementById("modalBuffered");
  const modalCurrentTime = document.getElementById("modalCurrentTime");
  const modalTotalDuration = document.getElementById("modalTotalDuration");

  if (!modal || !modalVideo) {
    console.error("[Hyper Steel Gallery] Modal or video element not found.");
    return;
  }

  // Avoid duplicate registration
  if (window.__hyperSteelVideoPlayerInitialized) return;
  window.__hyperSteelVideoPlayerInitialized = true;

  let lastActiveButton = null;
  let isScrubbing = false;

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function updatePlayUI() {
    if (!modalVideo) return;
    const isPlaying = !modalVideo.paused && !modalVideo.ended;
    modal.classList.toggle("is-playing", isPlaying);

    if (modalPlayBtn) {
      modalPlayBtn.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
      modalPlayBtn.classList.toggle("is-active", isPlaying);
    }
  }

  function openVideoModal(item) {
    lastActiveButton = item;

    const src = item.dataset.videoSrc || item.getAttribute("data-video-src");
    const poster = item.dataset.poster || item.getAttribute("data-poster");
    const orientation = item.dataset.orientation || item.getAttribute("data-orientation") || "portrait";
    const title = item.dataset.title || item.getAttribute("data-title") || "Fabrication Showcase";
    const duration = item.dataset.duration || item.getAttribute("data-duration") || "00:00";

    if (!src) {
      console.error("[Hyper Steel Gallery] No video source specified on clicked item:", item);
      return;
    }

    // 1. Set orientation state
    if (modalViewport) {
      modalViewport.setAttribute("data-orientation", orientation);
    }

    // 2. Ambient backdrop
    if (modalAmbient && poster) {
      modalAmbient.style.backgroundImage = `url('${poster}')`;
    }

    // 3. Title readout
    if (modalTitle) {
      modalTitle.textContent = title;
    }

    // 4. Scrubber & Time resets
    if (modalProgress) modalProgress.style.width = "0%";
    if (modalBuffered) modalBuffered.style.width = "0%";
    if (modalCurrentTime) modalCurrentTime.textContent = "00:00";
    if (modalTotalDuration) modalTotalDuration.textContent = duration;

    // 5. Video setup: Critical for immediate autoplay
    // Set muted = true and playsinline BEFORE src and play() to satisfy browser autoplay policy
    modalVideo.muted = true;
    modalVideo.defaultMuted = true;
    modalVideo.playsInline = true;
    modalVideo.setAttribute("playsinline", "");
    modalVideo.setAttribute("webkit-playsinline", "");
    modalVideo.setAttribute("muted", "");

    if (poster) modalVideo.poster = poster;
    modalVideo.src = src;
    modalVideo.currentTime = 0;
    modalVideo.load();

    // 6. Open Modal & Lock Body Scroll
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-modal-open");
    document.documentElement.classList.add("gallery-modal-open");

    // Pause Lenis smooth scrolling if present
    if (window.lenis && typeof window.lenis.stop === "function") {
      try { window.lenis.stop(); } catch (e) {}
    }

    // 7. Trigger Playback and properly handle returned Promise
    const playPromise = modalVideo.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updatePlayUI();
        })
        .catch((err) => {
          console.warn("[Hyper Steel Gallery] Autoplay warning:", err);
          // Retry muted play immediately
          modalVideo.muted = true;
          modalVideo.play().catch(() => {});
          updatePlayUI();
        });
    }

    // Sync volume/mute icon
    if (modalMuteBtn) {
      modalMuteBtn.classList.toggle("is-muted", modalVideo.muted);
      modalMuteBtn.setAttribute("aria-label", modalVideo.muted ? "Unmute audio" : "Mute audio");
    }

    // Focus close button for accessibility
    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 80);
  }

  function closeVideoModal() {
    if (!modal.classList.contains("is-open")) return;

    // Completely halt playback and unload media
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.removeAttribute("src");
      modalVideo.load();
    }

    modal.classList.remove("is-open");
    modal.classList.remove("is-playing");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-modal-open");
    document.documentElement.classList.remove("gallery-modal-open");

    // Resume Lenis smooth scrolling if present
    if (window.lenis && typeof window.lenis.start === "function") {
      try { window.lenis.start(); } catch (e) {}
    }

    if (lastActiveButton) {
      lastActiveButton.focus();
    }
  }

  function togglePlay() {
    if (!modalVideo) return;
    if (modalVideo.paused || modalVideo.ended) {
      if (modalVideo.ended) modalVideo.currentTime = 0;
      modalVideo.play().catch((e) => console.warn("Play error:", e));
    } else {
      modalVideo.pause();
    }
    updatePlayUI();
  }

  function toggleMute() {
    if (!modalVideo) return;
    modalVideo.muted = !modalVideo.muted;
    if (modalMuteBtn) {
      modalMuteBtn.classList.toggle("is-muted", modalVideo.muted);
      modalMuteBtn.setAttribute("aria-label", modalVideo.muted ? "Unmute audio" : "Mute audio");
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (modalViewport && modalViewport.requestFullscreen) {
        modalViewport.requestFullscreen();
      } else if (modalVideo && modalVideo.requestFullscreen) {
        modalVideo.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  function updateProgress() {
    if (!modalVideo || isScrubbing || isNaN(modalVideo.duration) || modalVideo.duration === 0) return;

    const cur = modalVideo.currentTime;
    const dur = modalVideo.duration;
    const pct = Math.min(100, Math.max(0, (cur / dur) * 100));

    if (modalProgress) modalProgress.style.width = `${pct}%`;
    if (modalScrubber) modalScrubber.setAttribute("aria-valuenow", String(Math.round(pct)));
    if (modalCurrentTime) modalCurrentTime.textContent = formatTime(cur);
    if (modalTotalDuration && dur > 0) modalTotalDuration.textContent = formatTime(dur);

    if (modalVideo.buffered.length > 0 && modalBuffered) {
      try {
        const bufferedEnd = modalVideo.buffered.end(modalVideo.buffered.length - 1);
        const bufPct = Math.min(100, Math.max(0, (bufferedEnd / dur) * 100));
        modalBuffered.style.width = `${bufPct}%`;
      } catch (e) {}
    }
  }

  function handleScrubberSeek(e) {
    if (!modalScrubber || !modalVideo || isNaN(modalVideo.duration) || modalVideo.duration <= 0) return;
    const rect = modalScrubber.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (clientX === undefined) return;

    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = offsetX / rect.width;
    const target = ratio * modalVideo.duration;

    modalVideo.currentTime = target;
    if (modalProgress) modalProgress.style.width = `${ratio * 100}%`;
    if (modalCurrentTime) modalCurrentTime.textContent = formatTime(target);
  }

  // EVENT HANDLING

  // 1. Robust Event Delegation on document for gallery item clicks
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;

    e.preventDefault();
    e.stopPropagation();
    openVideoModal(item);
  });

  // 2. Close Button Click
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeVideoModal();
    });
  }

  // 3 & 4. Click outside viewport (Backdrop or modal padding area)
  modal.addEventListener("click", (e) => {
    if (!e.target.closest(".video-modal__viewport") && !e.target.closest(".video-modal__close")) {
      closeVideoModal();
    }
  });

  // 5. Keyboard Navigation (Escape to close, Space to toggle play, M to mute)
  window.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeVideoModal();
    } else if (e.key === " " || e.key.toLowerCase() === "k") {
      if (document.activeElement !== modalCloseBtn) {
        e.preventDefault();
        togglePlay();
      }
    } else if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      toggleMute();
    } else if (e.key === "ArrowLeft") {
      if (modalVideo) {
        e.preventDefault();
        modalVideo.currentTime = Math.max(0, modalVideo.currentTime - 3);
      }
    } else if (e.key === "ArrowRight") {
      if (modalVideo) {
        e.preventDefault();
        modalVideo.currentTime = Math.min(modalVideo.duration || 10, modalVideo.currentTime + 3);
      }
    }
  });

  // 6. Video Events
  modalVideo.addEventListener("play", updatePlayUI);
  modalVideo.addEventListener("playing", updatePlayUI);
  modalVideo.addEventListener("pause", updatePlayUI);
  modalVideo.addEventListener("ended", () => {
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
    updatePlayUI();
  });
  modalVideo.addEventListener("timeupdate", updateProgress);

  // Click directly on video screen to toggle play
  modalVideo.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // 7. Minimal Controls Buttons
  if (modalPlayBtn) modalPlayBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
  if (modalCenterToggle) modalCenterToggle.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
  if (modalMuteBtn) modalMuteBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleMute(); });
  if (modalFullscreenBtn) modalFullscreenBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleFullscreen(); });

  // 8. Scrubber Dragging
  if (modalScrubber) {
    const onScrubberMove = (e) => {
      if (!isScrubbing) return;
      handleScrubberSeek(e);
    };

    const onScrubberUp = () => {
      if (isScrubbing) {
        isScrubbing = false;
        modalScrubber.classList.remove("is-scrubbing");
        document.removeEventListener("mousemove", onScrubberMove);
        document.removeEventListener("mouseup", onScrubberUp);
        document.removeEventListener("touchmove", onScrubberMove);
        document.removeEventListener("touchend", onScrubberUp);
      }
    };

    modalScrubber.addEventListener("mousedown", (e) => {
      isScrubbing = true;
      modalScrubber.classList.add("is-scrubbing");
      handleScrubberSeek(e);
      document.addEventListener("mousemove", onScrubberMove);
      document.addEventListener("mouseup", onScrubberUp);
    });

    modalScrubber.addEventListener("touchstart", (e) => {
      isScrubbing = true;
      modalScrubber.classList.add("is-scrubbing");
      handleScrubberSeek(e);
      document.addEventListener("touchmove", onScrubberMove, { passive: true });
      document.addEventListener("touchend", onScrubberUp);
    }, { passive: true });
  }
}

// Auto-run if loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVideoPlayer, { once: true });
} else {
  initVideoPlayer();
}
