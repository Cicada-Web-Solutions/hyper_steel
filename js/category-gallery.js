/**
 * HYPER STEEL — CATEGORY GALLERY MODULE
 * Initial state: ALL panels equal compressed width (no panel open).
 * Hover state: hovered panel grows, others shrink.
 * Mouse leave: resets all panels to equal compressed state.
 */

export function initCategoryGallery() {
  const gallery = document.querySelector('.category-gallery');
  if (!gallery) return;

  const panels = Array.from(gallery.querySelectorAll('.category-panel'));
  if (panels.length === 0) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function resetAll() {
    panels.forEach((p) => {
      p.classList.remove('is-expanded');
      p.classList.remove('is-shrunk');
      p.setAttribute('aria-expanded', 'false');
    });
  }

  function expandPanel(index) {
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

  // Ensure initial state has no open panel
  resetAll();

  panels.forEach((panel, index) => {
    // Desktop hover
    panel.addEventListener('mouseenter', () => {
      if (!isTouchDevice && window.innerWidth > 900) {
        expandPanel(index);
      }
    });

    // Click / touch toggle
    panel.addEventListener('click', () => {
      if (panel.classList.contains('is-expanded')) {
        resetAll();
      } else {
        expandPanel(index);
      }
    });

    // Keyboard support
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (panel.classList.contains('is-expanded')) {
          resetAll();
        } else {
          expandPanel(index);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % panels.length;
        panels[nextIndex].focus();
        expandPanel(nextIndex);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + panels.length) % panels.length;
        panels[prevIndex].focus();
        expandPanel(prevIndex);
      }
    });
  });

  // When pointer leaves the gallery container, reset all to equal compressed state
  gallery.addEventListener('mouseleave', () => {
    if (!isTouchDevice && window.innerWidth > 900) {
      resetAll();
    }
  });
}
