/**
 * HYPER STEEL FABRICATION — CATEGORY GALLERY MODULE
 * Bespoke 7-panel interactive expanding exhibition gallery
 */

export function initCategoryGallery() {
  const gallery = document.querySelector('.category-gallery');
  if (!gallery) return;

  const panels = Array.from(gallery.querySelectorAll('.category-panel'));
  if (panels.length === 0) return;

  let activeIndex = 0; // Default to first panel expanded for visual richness
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function activatePanel(index, retain = true) {
    panels.forEach((panel, i) => {
      if (i === index) {
        panel.classList.add('is-expanded');
        panel.setAttribute('aria-expanded', 'true');
      } else {
        panel.classList.remove('is-expanded');
        panel.setAttribute('aria-expanded', 'false');
      }
    });
    if (retain) {
      activeIndex = index;
    }
  }

  // Initial state
  activatePanel(0, true);

  // Mouse interactions for desktop
  panels.forEach((panel, index) => {
    // Hover expand
    panel.addEventListener('mouseenter', () => {
      if (!isTouchDevice && window.innerWidth > 900) {
        activatePanel(index, false);
      }
    });

    // Click / Tap
    panel.addEventListener('click', (e) => {
      // If clicking inside a button/link inside the expanded panel, don't toggle
      if (e.target.closest('a') || e.target.closest('button')) {
        return;
      }
      activatePanel(index, true);
    });

    // Keyboard support: Enter / Space / Arrow keys
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activatePanel(index, true);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % panels.length;
        panels[nextIndex].focus();
        activatePanel(nextIndex, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + panels.length) % panels.length;
        panels[prevIndex].focus();
        activatePanel(prevIndex, true);
      }
    });

    panel.addEventListener('focus', () => {
      if (window.innerWidth > 900) {
        activatePanel(index, false);
      }
    });
  });

  // When pointer leaves gallery on desktop, revert to last explicitly clicked/retained active panel
  gallery.addEventListener('mouseleave', () => {
    if (!isTouchDevice && window.innerWidth > 900) {
      activatePanel(activeIndex, true);
    }
  });
}
