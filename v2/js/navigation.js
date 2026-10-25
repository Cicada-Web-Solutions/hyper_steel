/**
 * HYPER STEEL — NAVIGATION & BACK-TO-TOP MODULE
 */

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.site-nav__link, .mobile-drawer__link');
  const backToTopBtn = document.querySelector('.back-to-top');
  const heroSection = document.querySelector('#hero');

  // Header scroll appearance & Back-to-top visibility
  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header styling
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
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Back-to-top click handler
  backToTopBtn?.addEventListener('click', () => {
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

  // Smooth scroll and auto-close mobile drawer
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          closeMenu();
          const headerOffset = 70;
          if (window.lenis) {
            window.lenis.scrollTo(targetEl, { offset: -headerOffset, duration: 1.1 });
          } else {
            const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      }
    });
  });

  // Active section indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    const scrollY = window.pageYOffset;
    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll(`.site-nav__link[href*="#${sectionId}"]`).forEach((l) => {
          l.classList.add('is-active');
        });
      } else {
        document.querySelectorAll(`.site-nav__link[href*="#${sectionId}"]`).forEach((l) => {
          l.classList.remove('is-active');
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
}
