/**
 * HYPER STEEL — CATEGORY GALLERY MODULE
 * Initial state: ALL panels equal compressed width (no panel open).
 * Hover state (desktop): hovered panel grows, siblings shrink.
 * Touch (mobile): click to expand / collapse.
 * Mouse leave gallery: resets all panels to equal compressed state.
 */

export function initCategoryGallery() {
  const gallery = document.querySelector('.category-gallery');
  if (!gallery) return;

  const panels = Array.from(gallery.querySelectorAll('.category-panel'));
  if (panels.length === 0) return;

  /* ---- State helpers ---- */
  function resetAll() {
    panels.forEach((p) => {
      p.classList.remove('is-expanded', 'is-shrunk');
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

  /* ---- Initial: equal compressed state ---- */
  resetAll();

  /* ---- Desktop hover interaction ---- */
  panels.forEach((panel, index) => {
    panel.addEventListener('mouseenter', () => {
      expandPanel(index);
    });
  });

  gallery.addEventListener('mouseleave', () => {
    resetAll();
  });

  /* ---- Touch / click toggle ---- */
  panels.forEach((panel, index) => {
    panel.addEventListener('click', () => {
      if (panel.classList.contains('is-expanded')) {
        resetAll();
      } else {
        expandPanel(index);
      }
    });

    /* ---- Keyboard navigation ---- */
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.classList.contains('is-expanded') ? resetAll() : expandPanel(index);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % panels.length;
        panels[next].focus();
        expandPanel(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + panels.length) % panels.length;
        panels[prev].focus();
        expandPanel(prev);
      }
    });
  });
}
