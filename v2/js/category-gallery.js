/**
 * HYPER STEEL — SIGNATURE ACCORDION GALLERY MODULE
 * Architectural Horizontal Flex Accordion with Smooth GSAP Coordination.
 * Ensures robust pointer hover, rapid pointer traversal handling, keyboard focus, and mobile tap.
 */

export function initCategoryGallery() {
  const gallery = document.querySelector('.category-gallery');
  if (!gallery) return;

  const panels = Array.from(gallery.querySelectorAll('.category-panel'));
  if (panels.length === 0) return;

  let activeIndex = -1;
  let isMobile = window.innerWidth <= 900;

  // Track window resize for mobile vs desktop mode
  window.addEventListener('resize', () => {
    const currentIsMobile = window.innerWidth <= 900;
    if (currentIsMobile !== isMobile) {
      isMobile = currentIsMobile;
      resetGallery(true);
    }
  });

  /**
   * Reset all panels to default equal state
   */
  function resetGallery(immediate = false) {
    activeIndex = -1;

    panels.forEach((panel) => {
      panel.classList.remove('is-expanded', 'is-shrunk');
      panel.setAttribute('aria-expanded', 'false');

      if (!isMobile && typeof gsap !== 'undefined') {
        gsap.to(panel, {
          flexGrow: 1,
          opacity: 1,
          duration: immediate ? 0 : 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else if (isMobile && typeof gsap !== 'undefined') {
        gsap.set(panel, { clearProps: 'all' });
      }
    });
  }

  /**
   * Expand specific panel by index
   */
  function expandPanel(index) {
    if (index === activeIndex && !isMobile) return;
    activeIndex = index;

    panels.forEach((panel, i) => {
      const isTarget = i === index;
      const collapsedLabel = panel.querySelector('.category-panel__collapsed-label');
      const expandedContent = panel.querySelector('.category-panel__expanded-content');
      const img = panel.querySelector('.category-panel__img');

      if (isTarget) {
        panel.classList.add('is-expanded');
        panel.classList.remove('is-shrunk');
        panel.setAttribute('aria-expanded', 'true');

        if (!isMobile && typeof gsap !== 'undefined') {
          // GSAP smooth expand animation
          gsap.to(panel, {
            flexGrow: 5.5,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            overwrite: 'auto'
          });

          if (img) {
            gsap.to(img, {
              scale: 1.0,
              filter: 'brightness(0.85) contrast(1.02)',
              duration: 0.65,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }

          if (collapsedLabel) {
            gsap.to(collapsedLabel, {
              opacity: 0,
              duration: 0.2,
              overwrite: 'auto'
            });
          }

          if (expandedContent) {
            gsap.fromTo(
              expandedContent,
              { y: 14, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.45,
                delay: 0.1,
                ease: 'power2.out',
                overwrite: 'auto'
              }
            );
          }
        }
      } else {
        panel.classList.remove('is-expanded');
        panel.classList.add('is-shrunk');
        panel.setAttribute('aria-expanded', 'false');

        if (!isMobile && typeof gsap !== 'undefined') {
          gsap.to(panel, {
            flexGrow: 0.65,
            opacity: 0.6,
            duration: 0.55,
            ease: 'power3.out',
            overwrite: 'auto'
          });

          if (img) {
            gsap.to(img, {
              scale: 1.1,
              filter: 'brightness(0.6) contrast(1.05)',
              duration: 0.65,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }

          if (collapsedLabel) {
            gsap.to(collapsedLabel, {
              opacity: 1,
              duration: 0.35,
              delay: 0.1,
              overwrite: 'auto'
            });
          }

          if (expandedContent) {
            gsap.to(expandedContent, {
              opacity: 0,
              y: 10,
              duration: 0.2,
              overwrite: 'auto'
            });
          }
        }
      }
    });
  }

  // Initial State: Reset all to equal collapsed state
  resetGallery(true);

  // Desktop Hover Interactions
  panels.forEach((panel, index) => {
    panel.addEventListener('mouseenter', () => {
      if (!isMobile) {
        expandPanel(index);
      }
    });

    panel.addEventListener('focus', () => {
      expandPanel(index);
    });

    // Touch / Click Handler
    panel.addEventListener('click', (e) => {
      if (isMobile) {
        if (panel.classList.contains('is-expanded')) {
          resetGallery();
        } else {
          expandPanel(index);
        }
      } else {
        expandPanel(index);
      }
    });

    // Accessible Keyboard Navigation
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.classList.contains('is-expanded') ? resetGallery() : expandPanel(index);
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
      } else if (e.key === 'Escape') {
        resetGallery();
      }
    });
  });

  // Mouse Leaving Gallery Container
  gallery.addEventListener('mouseleave', () => {
    if (!isMobile) {
      resetGallery();
    }
  });
}
