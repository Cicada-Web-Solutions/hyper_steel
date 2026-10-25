/**
 * HYPER STEEL — SIGNATURE ACCORDION GALLERY MODULE
 * Architectural Horizontal Flex Accordion.
 * Class-driven flex transition system ensuring zero layout jumping, zero container overflow,
 * fluid pointer traversal, keyboard navigation, and mobile touch support.
 */

export function initCategoryGallery() {
  const gallery = document.querySelector('.category-gallery');
  if (!gallery) return;

  const panels = Array.from(gallery.querySelectorAll('.category-panel'));
  if (panels.length === 0) return;

  let activeIndex = 0; // Default active panel: 0 (Entrances)
  let isMobile = window.innerWidth <= 800;
  let resetDebounce = null;

  /**
   * Set the active panel by index
   */
  function setPanel(index) {
    if (index < 0 || index >= panels.length) return;
    clearTimeout(resetDebounce);
    activeIndex = index;

    gallery.classList.add('has-active');

    panels.forEach((panel, i) => {
      if (i === index) {
        panel.classList.add('is-expanded');
        panel.classList.remove('is-shrunk');
        panel.setAttribute('aria-expanded', 'true');
      } else {
        panel.classList.remove('is-expanded');
        panel.classList.add('is-shrunk');
        panel.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Reset to deliberate default state (panel 0 expanded)
   */
  function resetToDefault() {
    clearTimeout(resetDebounce);
    resetDebounce = setTimeout(() => {
      if (!isMobile) {
        setPanel(0);
      }
    }, 180);
  }

  // Set initial default panel
  setPanel(0);

  // Responsive breakpoint tracking
  window.addEventListener('resize', () => {
    const nextIsMobile = window.innerWidth <= 800;
    if (nextIsMobile !== isMobile) {
      isMobile = nextIsMobile;
      if (isMobile) {
        gallery.classList.remove('has-active');
        panels.forEach((p, i) => {
          if (i === 0) {
            p.classList.add('is-expanded');
            p.setAttribute('aria-expanded', 'true');
          } else {
            p.classList.remove('is-expanded', 'is-shrunk');
            p.setAttribute('aria-expanded', 'false');
          }
        });
      } else {
        setPanel(activeIndex);
      }
    }
  });

  panels.forEach((panel, index) => {
    // Desktop pointer enter
    panel.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && !isMobile) {
        setPanel(index);
      }
    });

    // Keyboard focus activation
    panel.addEventListener('focus', () => {
      setPanel(index);
    });

    // Click & Touch activation
    panel.addEventListener('click', (e) => {
      if (isMobile) {
        const isCurrentExpanded = panel.classList.contains('is-expanded');
        panels.forEach((p) => {
          p.classList.remove('is-expanded', 'is-shrunk');
          p.setAttribute('aria-expanded', 'false');
        });
        if (!isCurrentExpanded) {
          panel.classList.add('is-expanded');
          panel.setAttribute('aria-expanded', 'true');
        }
      } else {
        setPanel(index);
      }
    });

    // Accessible keyboard arrow navigation
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setPanel(index);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % panels.length;
        panels[next].focus();
        setPanel(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + panels.length) % panels.length;
        panels[prev].focus();
        setPanel(prev);
      } else if (e.key === 'Escape') {
        resetToDefault();
      }
    });
  });

  // Pointer leaves entire accordion container
  gallery.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !isMobile) {
      resetToDefault();
    }
  });
}
