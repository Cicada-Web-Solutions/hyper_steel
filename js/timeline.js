/**
 * HYPER STEEL FABRICATION — TIMELINE MODULE
 * GSAP ScrollTrigger pinned horizontal fabrication story
 */

export function initTimeline() {
  const section = document.querySelector('.timeline-section');
  const pinnedContainer = document.querySelector('.timeline-pinned-container');
  const trackWrapper = document.querySelector('.timeline-track-wrapper');
  const track = document.querySelector('.timeline-track');
  const progressFill = document.querySelector('.timeline-progress-fill');

  if (!section || !trackWrapper || !track || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // Desktop only (viewport width > 900px and no reduced motion)
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    function getScrollDistance() {
      const containerWidth = trackWrapper.clientWidth;
      const trackWidth = track.scrollWidth;
      // Add a slight padding so the final stage is fully comfortable in viewport
      return Math.max(0, trackWidth - containerWidth + 80);
    }

    const scrollDistance = getScrollDistance();

    if (scrollDistance <= 0) return;

    const timelineAnimation = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: pinnedContainer,
        start: 'top top',
        end: () => `+=${getScrollDistance() * 1.15}`,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressFill) {
            progressFill.style.width = `${self.progress * 100}%`;
          }
        }
      }
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
