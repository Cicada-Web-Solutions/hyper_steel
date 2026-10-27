
/**
 * Hyper Steel Fabrication — Video Player
 * One native video element, one play/pause handler,
 * and one delegated playlist click handler.
 */

export function initVideoPlayer() {
  const player = document.querySelector(".cinema-player");
  if (!player || player.dataset.playerReady === "true") return;

  const video = player.querySelector(".cinema-player__video");
  const playButton = player.querySelector(".js-play-toggle");
  const title = player.querySelector(".cinema-player__title");
  const caption = player.querySelector(".cinema-player__caption");
  const playlist = document.querySelector(".video-playlist");

  if (!video || !playButton || !playlist) {
    console.error("[HyperSteel Player] Required HTML elements are missing.");
    return;
  }

  const cards = [...playlist.querySelectorAll(".video-thumb-card")];

  if (!cards.length) {
    console.error("[HyperSteel Player] No video cards found.");
    return;
  }

  player.dataset.playerReady = "true";

  // Prevent autoplay/loop attributes from interfering with controls.
  video.autoplay = false;
  video.loop = false;
  video.removeAttribute("autoplay");
  video.removeAttribute("loop");
  video.controls = false;
  video.playsInline = true;
  video.setAttribute("playsinline", "");

  const PLAY_ICON = `
    <svg class="control-btn__icon" viewBox="0 0 24 24"
      width="20" height="20" fill="currentColor" aria-hidden="true">
      <polygon points="6,4 20,12 6,20"></polygon>
    </svg>`;

  const PAUSE_ICON = `
    <svg class="control-btn__icon" viewBox="0 0 24 24"
      width="20" height="20" fill="currentColor" aria-hidden="true">
      <rect x="5.5" y="4" width="3.5" height="16" rx="1.5"></rect>
      <rect x="15" y="4" width="3.5" height="16" rx="1.5"></rect>
    </svg>`;

  let activeCard = null;
  let requestId = 0;

  function updateControls() {
    const playing = !video.paused && !video.ended;

    player.classList.toggle("is-playing", playing);
    playButton.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    playButton.setAttribute(
      "aria-label",
      playing ? "Pause video" : "Play video"
    );
    playButton.setAttribute("aria-pressed", String(playing));
  }

  function markActiveCard(card) {
    cards.forEach((item) => {
      const active = item === card;

      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
  }

  async function playVideo() {
    const thisRequest = ++requestId;

    try {
      await video.play();

      // Ignore an old playback request after another action.
      if (thisRequest !== requestId) return;

      updateControls();
    } catch (error) {
      if (thisRequest !== requestId) return;

      updateControls();
      console.error(
        "[HyperSteel Player] Could not play video:",
        video.currentSrc || video.src,
        error
      );
    }
  }

  function pauseVideo() {
    // Invalidates any earlier pending play request.
    requestId++;
    video.pause();
    updateControls();
  }

  async function selectVideo(card) {
    if (!card || !playlist.contains(card)) return;

    const src = card.getAttribute("data-video-src");
    const poster = card.getAttribute("data-video-poster");
    const newTitle = card.getAttribute("data-video-title");
    const newCaption = card.getAttribute("data-video-caption");

    if (!src) {
      console.error("[HyperSteel Player] This card has no data-video-src:", card);
      return;
    }

    // Invalidate any pending playback request and stop the current clip.
    requestId++;
    video.pause();

    activeCard = card;
    markActiveCard(card);

    if (title && newTitle) title.textContent = newTitle;
    if (caption && newCaption) caption.textContent = newCaption;

    if (poster) video.poster = new URL(poster, document.baseURI).href;

    // Load the selected file into the same video element.
    video.removeAttribute("src");
    video.src = new URL(src, document.baseURI).href;
    video.load();

    updateControls();

    // Play the newly selected clip.
    await playVideo();
  }

  // Playlist: a single click listener, no duplicate per-card listeners.
  playlist.addEventListener("click", (event) => {
    const card = event.target.closest(".video-thumb-card");
    if (!card || !playlist.contains(card)) return;

    selectVideo(card);
  });

  // Keyboard support for the custom thumbnail cards.
  playlist.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest(".video-thumb-card");
    if (!card || !playlist.contains(card)) return;

    event.preventDefault();
    selectVideo(card);
  });

  // Play/pause button.
  playButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      playVideo();
    } else {
      pauseVideo();
    }
  });

  // Clicking the video itself also toggles playback.
  video.addEventListener("click", () => {
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      playVideo();
    } else {
      pauseVideo();
    }
  });

  // Let actual browser media events control the button state.
  video.addEventListener("play", updateControls);
  video.addEventListener("playing", updateControls);
  video.addEventListener("pause", updateControls);
  video.addEventListener("ended", updateControls);
  video.addEventListener("waiting", updateControls);

  video.addEventListener("error", () => {
    updateControls();

    console.error("[HyperSteel Player] Video file failed to load.", {
      source: video.currentSrc || video.src,
      errorCode: video.error?.code,
      errorMessage: video.error?.message
    });
  });

  // Keep the initial card selected without autoplaying the video.
  const initialCard =
    cards.find((card) => card.classList.contains("is-active")) || cards[0];

  const initialSrc = initialCard.getAttribute("data-video-src");
  const initialPoster = initialCard.getAttribute("data-video-poster");

  activeCard = initialCard;
  markActiveCard(initialCard);

  if (initialSrc) {
    video.src = new URL(initialSrc, document.baseURI).href;
    if (initialPoster) {
      video.poster = new URL(initialPoster, document.baseURI).href;
    }
    video.load();
  }

  updateControls();

  console.info("[HyperSteel Player] Initialized.", {
    playlistCards: cards.length,
    initialSource: video.src
  });
}
