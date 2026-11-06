/**
 * HYPER STEEL — CATEGORY GALLERY
 * CSS handles desktop hover.
 * JavaScript handles touch and keyboard interaction.
 */

export function initCategoryGallery() {
  document.querySelectorAll('.category-gallery').forEach((gallery) => {
    if (gallery.dataset.galleryReady === 'true') return;

    const panels = [...gallery.querySelectorAll('.category-panel')];

    if (!panels.length) return;

    gallery.dataset.galleryReady = 'true';

    const touchMode = window.matchMedia(
      '(hover: none), (pointer: coarse)'
    );

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

    // Remove any stale state left by previous scripts.
    closeAll();

    panels.forEach((panel, index) => {
      panel.addEventListener('click', () => {
        // Desktop expansion is controlled by CSS :hover.
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

        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown'
        ) {
          event.preventDefault();
          panels[(index + 1) % panels.length].focus();
        }

        if (
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp'
        ) {
          event.preventDefault();
          panels[(index - 1 + panels.length) % panels.length].focus();
        }
      });
    });

    // Close expanded panels when tapping outside the gallery.
    document.addEventListener('pointerdown', (event) => {
      if (
        event.pointerType === 'touch' &&
        !gallery.contains(event.target)
      ) {
        closeAll();
      }
    });
  });
}

// Automatically initialize, even if this module loads after DOMContentLoaded.
if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initCategoryGallery,
    { once: true }
  );
} else {
  initCategoryGallery();
}