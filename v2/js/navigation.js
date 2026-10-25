/**
 * HYPER STEEL — NAVIGATION & ACTIVE-SECTION HIGHLIGHTING MODULE
 * Bidirectional, scroll-aware navigation indicator.
 * Synchronizes desktop navbar and mobile drawer with zero flickering.
 * Supports clicking, manual scrolling down, and scrolling back up.
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

  // Tracked sections and their navbar href mappings.
  // Note: craft-videos belongs to the Craft section experience and maps to #craft.
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
   * Force active nav directly (used on link click)
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
   * Calculate Active Section based on viewport reading position.
   * Handles sections of different heights, scrolling down, scrolling up,
   * fixed header offset, and the bottom of the page for #contact.
   */
  function updateActiveSection() {
    if (isManualScrolling) return;

    const scrollY = (window.lenis && typeof window.lenis.scroll === 'number')
      ? window.lenis.scroll
      : (window.pageYOffset || document.documentElement.scrollTop || 0);

    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const maxScroll = docHeight - windowHeight;

    // 1. Top of page boundary -> Home (#hero) is active
    if (scrollY <= 80) {
      setActiveNav('#hero');
      return;
    }

    // 2. Bottom of page boundary or footer in view -> Contact (#contact) is active
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const contactRect = contactEl.getBoundingClientRect();
      // If user is near the bottom of scroll OR footer occupies lower screen
      if (scrollY >= maxScroll - 80 || contactRect.top <= windowHeight * 0.65) {
        setActiveNav('#contact');
        return;
      }
    }

    // 3. Viewport reading line just below fixed header (accounting for ~80px header)
    const headerHeight = header ? header.offsetHeight : 80;
    const readingY = headerHeight + Math.min(160, windowHeight * 0.22);

    // Find which tracked section currently contains the reading line
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

    // Fallback: if in between sections (e.g. metrics section), find the latest section above reading line
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

    if (matchedItem) {
      setActiveNav(matchedItem.targetHref);
    } else {
      setActiveNav('#hero');
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

  // Attach scroll listeners
  window.addEventListener('scroll', handleScroll, { passive: true });
  if (window.lenis) {
    window.lenis.on('scroll', handleScroll);
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

  // Smooth scroll and active underline on navigation click
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
              window.lenis.scrollTo(0, {
                duration: 0.9,
                onComplete: onScrollFinish
              });
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
  updateActiveSection();
}
