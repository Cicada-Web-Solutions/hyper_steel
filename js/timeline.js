/**
 * HYPER STEEL — TIMELINE MODULE
 * GSAP ScrollTrigger pinned horizontal fabrication story
 */

export function initTimeline() {
  const section = document.querySelector('.timeline-section');
  const track = document.querySelector('.timeline-track');
  const progressFill = document.querySelector('.timeline-progress-fill');

  if (!section || !track || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // Desktop only (viewport width > 900px and no reduced motion)
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    function getScrollDistance() {
      const trackWidth = track.scrollWidth;
      const windowWidth = window.innerWidth;
      // Scroll until the last card is fully visible + margin
      return Math.max(0, trackWidth - windowWidth + 120);
    }

    const scrollDistance = getScrollDistance();
    if (scrollDistance <= 0) return;

    const timelineAnimation = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: 'top top',
        end: () => `+=${getScrollDistance() * 1.25}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressFill) {
            progressFill.style.width = `${self.progress * 100}%`;
          }
        }
      }
    });

    // Refresh once all images are loaded
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });

    return () => {
      timelineAnimation.kill();
      if (progressFill) progressFill.style.width = '0%';
      gsap.set(track, { clearProps: 'all' });
    };
  });

  // Mobile / Reduced Motion: Ensure clean vertical flow
  mm.add('(max-width: 900px), (prefers-reduced-motion: reduce)', () => {
    gsap.set(track, { clearProps: 'all' });
    if (progressFill) progressFill.style.width = '100%';
  });
}
