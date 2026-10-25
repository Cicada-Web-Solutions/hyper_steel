/**
 * HYPER STEEL — SIGNATURE ACCORDION GALLERY MODULE
 * Architectural Horizontal Flex Accordion.
 * Fluid flex transition system with unified active-state management.
 * Supports desktop hover, keyboard navigation, and touchscreen tapping.
 */

export function initCategoryGallery() {
  const gallery = document.querySelector('.category-gallery');
  if (!gallery) return;

  const panels = Array.from(gallery.querySelectorAll('.category-panel'));
  if (panels.length === 0) return;

  /**
   * Robust Active Panel Management
   * Toggles active state cleanly on panels and synchronizes ARIA attributes.
   */
  function setActivePanel(activePanel) {
    if (!activePanel) return;

    panels.forEach((panel) => {
      const isActive = panel === activePanel;
      panel.classList.toggle('is-active', isActive);
      panel.classList.toggle('is-expanded', isActive);
      panel.classList.remove('is-shrunk');
      panel.setAttribute('aria-expanded', String(isActive));
    });
  }

  // Initialize with the first panel expanded by default
  setActivePanel(panels[0]);

  // Attach event handlers to each panel
  panels.forEach((panel, index) => {
    // 1. Desktop Hover: mouseenter & mouseover & pointerenter
    panel.addEventListener('mouseenter', () => {
      setActivePanel(panel);
    });

    panel.addEventListener('pointerenter', () => {
      setActivePanel(panel);
    });

    panel.addEventListener('mouseover', (e) => {
      if (e.target === panel || panel.contains(e.target)) {
        setActivePanel(panel);
      }
    });

    // 2. Click / Touch Tap: expands clicked panel
    panel.addEventListener('click', () => {
      setActivePanel(panel);
    });

    // 3. Keyboard Focus
    panel.addEventListener('focus', () => {
      setActivePanel(panel);
    });

    // 4. Accessible Keyboard Arrow Navigation
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActivePanel(panel);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % panels.length;
        panels[nextIndex].focus();
        setActivePanel(panels[nextIndex]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + panels.length) % panels.length;
        panels[prevIndex].focus();
        setActivePanel(panels[prevIndex]);
      }
    });
  });
}
