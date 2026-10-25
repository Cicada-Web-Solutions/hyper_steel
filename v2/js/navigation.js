/**
 * HYPER STEEL — NAVIGATION & ACTIVE-SECTION HIGHLIGHTING MODULE
 * Automatic active-section indicator via IntersectionObserver + reading-band geometry.
 * Handles scroll down, scroll up, variable section heights, fixed navbar offset,
 * desktop and mobile drawer synchronization.
 */

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const desktopLinks = Array.from(document.querySelectorAll('.site-nav__link'));
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-drawer__link'));
  const allNavLinks = [...desktopLinks, ...mobileLinks];
  const backToTopBtn = document.querySelector('.back-to-top');
  const heroSection = document.querySelector('#hero');

  // Ordered section mapping for the 5 navbar items
  // Note: Craft Film section (#craft-videos) also maps to #craft in the main 5-item navigation.
  const sectionNavMap = [
    { sectionId: 'hero', targetHref: '#hero' },
    { sectionId: 'craft', targetHref: '#craft' },
    { sectionId: 'craft-videos', targetHref: '#craft' },
    { sectionId: 'projects', targetHref: '#projects' },
    { sectionId: 'capabilities', targetHref: '#capabilities' },
    { sectionId: 'contact', targetHref: '#contact' }
  ];

  let isManualScrolling = false;
  let manualScrollTimeout = null;

  // Header scroll appearance & Back-to-top visibility
  function handleScroll() {
    const scrollY = (window.lenis && typeof window.lenis.scroll === 'number')
      ? window.lenis.scroll
      : (window.pageYOffset || document.documentElement.scrollTop || 0);

    // Header styling on scroll
    if (header) {
      if (scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    // Back-to-top button visibility
    if (backToTopBtn) {
      const heroThreshold = heroSection ? heroSection.offsetHeight * 0.75 : 450;
      if (scrollY > heroThreshold) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    if (!isManualScrolling) {
      calculateActiveSection(scrollY);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  if (window.lenis) {
    window.lenis.on('scroll', handleScroll);
  }
  handleScroll();

  // Back-to-top click handler
  backToTopBtn?.addEventListener('click', () => {
    setActiveNav('#hero');
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.1 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });

  // Mobile menu open / close
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

  mobileToggle?.addEventListener('click', () => {
    const isOpen = mobileDrawer?.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Set active link visually on both desktop and mobile
  function setActiveNav(targetHref) {
    desktopLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === targetHref) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });

    mobileLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === targetHref) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  // Smooth scroll and auto-close mobile drawer on link click
  allNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          closeMenu();

          setActiveNav(targetId);

          isManualScrolling = true;
          clearTimeout(manualScrollTimeout);
          manualScrollTimeout = setTimeout(() => {
            isManualScrolling = false;
            calculateActiveSection();
          }, 1100);

          const headerOffset = 76;
          if (window.lenis) {
            window.lenis.scrollTo(targetEl, { offset: -headerOffset, duration: 1.0 });
          } else {
            const targetPosition =
              targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      }
    });
  });

  /**
   * Automatic Active Section Calculation
   * Measures section intersections within the active viewport reading zone.
   * Accurately accounts for fixed navbar (76px) and viewport bottom.
   */
  function calculateActiveSection(customScrollY) {
    const scrollY = typeof customScrollY === 'number'
      ? customScrollY
      : ((window.lenis && typeof window.lenis.scroll === 'number')
          ? window.lenis.scroll
          : (window.pageYOffset || document.documentElement.scrollTop || 0));

    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Boundary 1: Top of page -> Home is always active
    if (scrollY < 180) {
      setActiveNav('#hero');
      return;
    }

    // Boundary 2: Bottom of page -> Contact is active
    if (scrollY + windowHeight >= docHeight - 70) {
      setActiveNav('#contact');
      return;
    }

    const headerHeight = 80;
    const readingZoneTop = headerHeight + 15;
    const readingZoneBottom = windowHeight * 0.65;

    let bestMatchHref = null;
    let maxVisibleHeight = -Infinity;

    sectionNavMap.forEach(({ sectionId, targetHref }) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const rect = section.getBoundingClientRect();

      // Check overlap between section and reading zone
      const overlapTop = Math.max(rect.top, readingZoneTop);
      const overlapBottom = Math.min(rect.bottom, readingZoneBottom);
      const visibleHeight = Math.max(0, overlapBottom - overlapTop);

      if (visibleHeight > maxVisibleHeight && visibleHeight > 24) {
        maxVisibleHeight = visibleHeight;
        bestMatchHref = targetHref;
      }
    });

    if (bestMatchHref) {
      setActiveNav(bestMatchHref);
    }
  }

  // Set up IntersectionObserver as a supplementary native watcher
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrolling) return;
        let intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          calculateActiveSection();
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0, 0.25, 0.5]
      }
    );

    sectionNavMap.forEach(({ sectionId }) => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });
  }

  // Initial calculation on load
  setTimeout(calculateActiveSection, 150);
}
