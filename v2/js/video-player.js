/**
 * HYPER STEEL INNOVATION — FABRICATION VIDEO PLAYER MODULE
 * Clean, minimalistic two-column interactive video player with scrollable playlist.
 */

export function initVideoPlayer() {
  const listVideos = document.querySelectorAll('.video-player-container .video-list .vid');
  const mainVideo = document.querySelector('.video-player-container .main-video video');
  const title = document.querySelector('.video-player-container .main-video .title');

  if (!mainVideo || !listVideos.length) return;

  listVideos.forEach((video) => {
    const activate = () => {
      listVideos.forEach((vid) => vid.classList.remove('active'));
      video.classList.add('active');

      const vidElem = video.querySelector('video') || video.children[0];
      const titleElem = video.querySelector('.title') || video.children[1];

      if (vidElem && mainVideo) {
        const src = vidElem.getAttribute('src');
        const poster = vidElem.getAttribute('poster');

        if (src && mainVideo.getAttribute('src') !== src) {
          mainVideo.src = src;
          if (poster) mainVideo.poster = poster;
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
      }

      if (titleElem && title) {
        title.innerHTML = titleElem.innerHTML;
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
