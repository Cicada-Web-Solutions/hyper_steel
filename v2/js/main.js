/**
 * HYPER STEEL INNOVATION — MAIN APPLICATION SCRIPT
 * Single, self-contained application file. No ES module dependencies (CORS-free for file:// and http://).
 * Architecture: Steel. Shadow. Precision Craftsmanship.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 01 — NAVIGATION & ACTIVE-SECTION HIGHLIGHTING MODULE
  // ==========================================================================
  function initNavigation() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.querySelector('.mobile-menu-btn');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const desktopLinks = Array.from(document.querySelectorAll('.site-nav__link'));
    const mobileLinks = Array.from(document.querySelectorAll('.mobile-drawer__link'));
    const allNavLinks = [...desktopLinks, ...mobileLinks];
    const heroSection = document.querySelector('#hero');

    const trackedSections = [
      { id: 'hero', targetHref: '#hero' },
      { id: 'craft', targetHref: '#craft' },
      { id: 'craft-videos', targetHref: '#craft' },
      { id: 'projects', targetHref: '#projects' },
      { id: 'capabilities', targetHref: '#capabilities' },
      { id: 'contact', targetHref: '#contact' }
    ];

    let isManualScrolling = false;
    let manualScrollTimeout = null;
    let currentActiveHref = null;

    function setActiveNav(targetHref) {
      if (currentActiveHref === targetHref) return;
      currentActiveHref = targetHref;

      desktopLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === targetHref);
      });
      mobileLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === targetHref);
      });
    }

    function forceActiveNav(targetHref) {
      currentActiveHref = targetHref;
      desktopLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === targetHref);
      });
      mobileLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === targetHref);
      });
    }

    function updateActiveSection() {
      if (isManualScrolling) return;

      const scrollY = (window.lenis && typeof window.lenis.scroll === 'number')
        ? window.lenis.scroll
        : (window.pageYOffset || document.documentElement.scrollTop || 0);

      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const maxScroll = docHeight - windowHeight;

      if (scrollY <= 80) {
        setActiveNav('#hero');
        return;
      }

      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const contactRect = contactEl.getBoundingClientRect();
        if (scrollY >= maxScroll - 80 || contactRect.top <= windowHeight * 0.65) {
          setActiveNav('#contact');
          return;
        }
      }

      const headerHeight = header ? header.offsetHeight : 80;
      const readingY = headerHeight + Math.min(160, windowHeight * 0.22);
      let matchedItem = null;

      for (let i = trackedSections.length - 1; i >= 0; i--) {
        const item = trackedSections[i];
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= readingY && rect.bottom > readingY) {
            matchedItem = item;
            break;
          }
        }
      }

      if (!matchedItem) {
        for (let i = trackedSections.length - 1; i >= 0; i--) {
          const item = trackedSections[i];
          const el = document.getElementById(item.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= readingY) {
              matchedItem = item;
              break;
            }
          }
        }
      }

      setActiveNav(matchedItem ? matchedItem.targetHref : '#hero');
    }

    function handleScroll() {
      const scrollY = (window.lenis && typeof window.lenis.scroll === 'number')
        ? window.lenis.scroll
        : (window.pageYOffset || document.documentElement.scrollTop || 0);

      if (header) {
        if (scrollY > 40) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      }

      updateActiveSection();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (window.lenis) {
      window.lenis.on('scroll', handleScroll);
    }

    function openMenu() {
      mobileToggle?.classList.add('is-active');
      mobileDrawer?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      mobileToggle?.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      mobileToggle?.classList.remove('is-active');
      mobileDrawer?.classList.remove('is-open');
      document.body.style.overflow = '';
      mobileToggle?.setAttribute('aria-expanded', 'false');
    }

    const mobileCloseBtn = document.querySelector('.mobile-drawer__close');
    mobileCloseBtn?.addEventListener('click', closeMenu);

    mobileToggle?.addEventListener('click', () => {
      const isOpen = mobileDrawer?.classList.contains('is-open');
      if (isOpen) closeMenu();
      else openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
        closeMenu();
      }
    });

    allNavLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            closeMenu();
            forceActiveNav(targetId);

            isManualScrolling = true;
            clearTimeout(manualScrollTimeout);

            const headerOffset = 76;
            const onScrollFinish = () => {
              isManualScrolling = false;
              updateActiveSection();
            };

            manualScrollTimeout = setTimeout(onScrollFinish, 1000);

            if (targetId === '#hero') {
              if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 0.9, onComplete: onScrollFinish });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            } else {
              if (window.lenis) {
                window.lenis.scrollTo(targetEl, {
                  offset: -headerOffset,
                  duration: 0.9,
                  onComplete: onScrollFinish
                });
              } else {
                const targetPosition =
                  targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
              }
            }
          }
        }
      });
    });

    forceActiveNav('#hero');
    updateActiveSection();
  }

  // ==========================================================================
  // 02 — CATEGORY GALLERY (TOUCH & ACCESSIBILITY)
  // ==========================================================================
  function initCategoryGallery() {
    document.querySelectorAll('.category-gallery').forEach((gallery) => {
      if (gallery.dataset.galleryReady === 'true') return;
      const panels = [...gallery.querySelectorAll('.category-panel')];
      if (!panels.length) return;

      gallery.dataset.galleryReady = 'true';
      const touchMode = window.matchMedia('(hover: none), (pointer: coarse)');

      function closeAll() {
        panels.forEach((panel) => {
          panel.classList.remove('is-expanded', 'is-shrunk');
          panel.setAttribute('aria-expanded', 'false');
        });
      }

      function expand(selectedPanel) {
        panels.forEach((panel) => {
          const selected = panel === selectedPanel;
          panel.classList.toggle('is-expanded', selected);
          panel.classList.toggle('is-shrunk', !selected);
          panel.setAttribute('aria-expanded', String(selected));
        });
      }

      closeAll();

      panels.forEach((panel, index) => {
        panel.addEventListener('click', () => {
          if (!touchMode.matches) return;
          if (panel.classList.contains('is-expanded')) {
            closeAll();
          } else {
            expand(panel);
          }
        });

        panel.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            closeAll();
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (panel.classList.contains('is-expanded')) {
              closeAll();
            } else {
              expand(panel);
            }
            return;
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            panels[(index + 1) % panels.length].focus();
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            panels[(index - 1 + panels.length) % panels.length].focus();
          }
        });
      });

      document.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch' && !gallery.contains(event.target)) {
          closeAll();
        }
      });
    });
  }

  // ==========================================================================
  // 03 — PROJECT LIGHTBOX MODULE
  // ==========================================================================
  function initProjects() {
    const projectItems = document.querySelectorAll('.project-item');
    const lightbox = document.querySelector('.project-lightbox');
    const lightboxImg = document.querySelector('.lightbox__image');
    const lightboxTitle = document.querySelector('.lightbox__title');
    const lightboxTag = document.querySelector('.lightbox__tag');
    const lightboxDesc = document.querySelector('.lightbox__desc');
    const lightboxClose = document.querySelector('.lightbox__close');
    const lightboxBackdrop = document.querySelector('.lightbox__backdrop');

    function openLightbox(item) {
      if (!lightbox) return;
      const img = item.querySelector('.project-item__img');
      const title = item.querySelector('.project-item__title')?.textContent || '';
      const tag = item.querySelector('.project-item__tag')?.textContent || '';
      const desc = item.getAttribute('data-detail-desc') || '';

      if (lightboxImg && img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxTag) lightboxTag.textContent = tag;
      if (lightboxDesc) lightboxDesc.textContent = desc;

      lightbox.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    projectItems.forEach((item) => {
      item.addEventListener('click', () => openLightbox(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxBackdrop?.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox?.classList.contains('is-active')) {
        closeLightbox();
      }
    });
  }

  // ==========================================================================
  // 04 — ENQUIRY CONSULTATION MODAL
  // ==========================================================================
  function initEnquiry() {
    const modal = document.querySelector('.enquiry-modal');
    const openBtns = document.querySelectorAll('.js-open-enquiry');
    const closeBtn = document.querySelector('.enquiry-modal__close');
    const backdrop = document.querySelector('.enquiry-modal__backdrop');
    const form = document.querySelector('#enquiry-form');

    if (!modal) return;

    function openModal(defaultService = '') {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      if (defaultService) {
        const serviceSelect = modal.querySelector('#enquiry-service');
        if (serviceSelect) serviceSelect.value = defaultService;
      }
      const firstInput = modal.querySelector('input');
      setTimeout(() => firstInput?.focus(), 100);
    }

    function closeModal() {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    openBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const service = btn.getAttribute('data-service') || '';
        openModal(service);
      });
    });

    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('#enquiry-name')?.value.trim() || 'Client';
        const phone = form.querySelector('#enquiry-phone')?.value.trim() || '';
        const service = form.querySelector('#enquiry-service')?.value || 'Architectural Steel Project';
        const location = form.querySelector('#enquiry-location')?.value.trim() || 'Madurai';
        const message = form.querySelector('#enquiry-message')?.value.trim() || '';

        const text = `Hello Hyper Steel,\n\nI would like to discuss an architectural steel project:\n- Name: ${name}\n- Contact: ${phone}\n- Category: ${service}\n- Project Location: ${location}\n- Scope & Notes: ${message}\n\nPlease let me know when we can schedule a consultation.`;
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/919944020815?text=${encodedText}`;

        closeModal();
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });
    }
  }

  // ==========================================================================
  // 05 — FABRICATION VIDEO PLAYER MODULE
  // ==========================================================================
  function initVideoPlayer() {
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

    // Ensure muted by default as required
    mainVideo.muted = true;

    // Helper: format seconds to M:SS
    function formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Toggle Play / Pause
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

    // Playback state listeners
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

    // Center button & play button clicks
    if (centerBtn) centerBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    if (playBtn) playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    mainVideo.addEventListener('click', togglePlay);

    // Auto-hide controls when playing and idle
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

    // Time & Progress Updates
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

    // Buffer progress
    mainVideo.addEventListener('progress', () => {
      if (mainVideo.buffered.length > 0 && mainVideo.duration) {
        const bufferedEnd = mainVideo.buffered.end(mainVideo.buffered.length - 1);
        const pct = (bufferedEnd / mainVideo.duration) * 100;
        if (bufferedBar) bufferedBar.style.width = `${pct}%`;
      }
    });

    // Scrubbing / Seek bar interaction
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

    // Fullscreen Toggle
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

    // Keyboard Shortcuts
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

    // Playlist Item Switching
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
          mainVideo.muted = true; // Always keep muted
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

    // Check if autoplay began
    if (!mainVideo.paused) {
      customPlayer.classList.add('is-playing');
    }
  }

  // ==========================================================================
  // 06 — MASTER BOOTSTRAP ORCHESTRATION
  // ==========================================================================
  function bootstrap() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize Lenis smooth scroll if loaded
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
      try {
        const lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 0.9,
        });

        window.lenis = lenis;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          lenis.on('scroll', ScrollTrigger.update);
          gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });
          gsap.ticker.lagSmoothing(0);
        } else {
          function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
          }
          requestAnimationFrame(raf);
        }
      } catch (err) {
        console.warn('Lenis initialization bypassed:', err);
      }
    }

    // Initialize Interactive Components
    try { initNavigation(); } catch (e) { console.error('Navigation error:', e); }
    try { initCategoryGallery(); } catch (e) { console.error('Category gallery error:', e); }
    try { initVideoPlayer(); } catch (e) { console.error('Video player error:', e); }
    try { initProjects(); } catch (e) { console.error('Projects error:', e); }
    try { initEnquiry(); } catch (e) { console.error('Enquiry error:', e); }

    // GSAP Scroll Animations
    if (typeof gsap !== 'undefined') {
      try {
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }

        if (!prefersReducedMotion) {
          // Hero entrance
          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
          heroTl
            .from('.hero__headline-line', { y: 35, opacity: 0, stagger: 0.12, duration: 0.7 })
            .from('.hero__lead', { y: 20, opacity: 0, duration: 0.55 }, '-=0.35')
            .from('.hero__actions .btn', { y: 20, duration: 0.5, stagger: 0.08, clearProps: 'all' }, '-=0.25')
            .from('.hero__scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.2');

          // Scroll reveals
          if (typeof ScrollTrigger !== 'undefined') {
            const revealElements = document.querySelectorAll(
              '.section-header, .capability-card, .project-item'
            );
            revealElements.forEach((el) => {
              gsap.from(el, {
                y: 30,
                opacity: 0,
                duration: 0.75,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 88%',
                  once: true
                }
              });
            });
          }
        }
      } catch (animErr) {
        console.warn('Animation bypassed:', animErr);
      }
    }
  }

  // Ensure execution on both DOM ready and immediate if ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
