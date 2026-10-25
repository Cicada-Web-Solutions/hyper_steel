/**
 * HYPER STEEL — NAVIGATION & ACTIVE-SECTION HIGHLIGHTING MODULE
 * Bidirectional, scroll-aware navigation indicator with IntersectionObserver
 * and robust reading-point geometry.
 * Synchronizes desktop navbar and mobile drawer with zero flickering.
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

  // The 5 primary navbar destinations and their corresponding section anchors
  // Note: craft-videos is part of the Craft section experience and maps to #craft.
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
  let currentActiveHref = '#hero';

  /**
   * Set active link visually on both desktop and mobile navigation
   */
  function setActiveNav(targetHref) {
    if (currentActiveHref === targetHref) return;
    currentActiveHref = targetHref;

    desktopLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('is-active', href === targetHref);
    });

    mobileLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('is-active', href === targetHref);
    });
  }

  /**
   * Force active nav directly (used on click and init)
   */
  function forceActiveNav(targetHref) {
    currentActiveHref = targetHref;
    desktopLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === targetHref);
    });
    mobileLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === targetHref);
    });
  }

  /**
   * Calculate Active Section based on viewport reading position
   * Accounts for fixed header height (80px), variable section heights,
   * scrolling down, scrolling up, and document boundaries.
   */
  function updateActiveSection() {
    if (isManualScrolling) return;

    const scrollY = (window.lenis && typeof window.lenis.scroll === 'number')
      ? window.lenis.scroll
      : (window.pageYOffset || document.documentElement.scrollTop || 0);

    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // 1. Top of page boundary -> Home is active
    if (scrollY < 120) {
      setActiveNav('#hero');
      return;
    }

    // 2. Bottom of page boundary -> Contact is active
    if (scrollY + windowHeight >= docHeight - 50) {
      setActiveNav('#contact');
      return;
    }

    // 3. Viewport reading line (just below the fixed header, at ~35% viewport depth)
    const headerOffset = 80;
    const readingY = headerOffset + Math.min(180, windowHeight * 0.25);

    // Find the latest tracked section whose top has crossed the reading line
    let matchedItem = trackedSections[0];

    for (let i = 0; i < trackedSections.length; i++) {
      const item = trackedSections[i];
      const el = document.getElementById(item.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        // If the top of the section is at or above the reading line,
        // and its bottom is still below the top of the viewport (not completely scrolled away)
        if (rect.top <= readingY && rect.bottom > 0) {
          matchedItem = item;
        }
      }
    }

    if (matchedItem) {
      setActiveNav(matchedItem.targetHref);
    }
  }

  // Header background appearance and back-to-top visibility
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

    if (backToTopBtn) {
      const heroThreshold = heroSection ? heroSection.offsetHeight * 0.7 : 400;
      if (scrollY > heroThreshold) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    updateActiveSection();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  if (window.lenis) {
    window.lenis.on('scroll', handleScroll);
  }

  // Set up IntersectionObserver as a reactive watcher for section visibility shifts
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      () => {
        if (!isManualScrolling) {
          updateActiveSection();
        }
      },
      {
        rootMargin: '-80px 0px -40% 0px',
        threshold: [0, 0.2, 0.5]
      }
    );

    trackedSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

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
    if (isOpen) closeMenu();
    else openMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Smooth scroll and auto-close mobile drawer on link click
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
          manualScrollTimeout = setTimeout(() => {
            isManualScrolling = false;
            updateActiveSection();
          }, 950);

          const headerOffset = 76;
          if (targetId === '#hero') {
            if (window.lenis) {
              window.lenis.scrollTo(0, { duration: 0.9 });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          } else {
            if (window.lenis) {
              window.lenis.scrollTo(targetEl, { offset: -headerOffset, duration: 0.9 });
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

  // Back-to-top click handler
  backToTopBtn?.addEventListener('click', () => {
    forceActiveNav('#hero');
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 0.9 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Initial calculation on load
  forceActiveNav('#hero');
  setTimeout(updateActiveSection, 100);
}
