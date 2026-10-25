/**
 * HYPER STEEL — HORIZONTAL PROCESS TIMELINE MODULE
 * GSAP ScrollTrigger Pinned Horizontal Storytelling on Desktop
 * Clean, fluid horizontal translation with scroll-linked progress indicator.
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

  // Desktop only: Viewport > 900px and no reduced motion
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    function getScrollDistance() {
      const trackWidth = track.scrollWidth;
      const windowWidth = window.innerWidth;
      const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-gutter')) || 60;
      // Scroll until the last card is fully visible with comfortable end margin
      return Math.max(0, trackWidth - windowWidth + (gutter * 2) + 80);
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
        end: () => `+=${getScrollDistance() * 1.3}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressFill) {
            progressFill.style.width = `${Math.min(100, self.progress * 100)}%`;
          }
        }
      }
    });

    // Refresh ScrollTrigger when images load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });

    return () => {
      timelineAnimation.kill();
      if (progressFill) progressFill.style.width = '0%';
      gsap.set(track, { clearProps: 'all' });
    };
  });

  // Mobile or Reduced Motion: Reset props, clean native horizontal scroll or flow
  mm.add('(max-width: 900px), (prefers-reduced-motion: reduce)', () => {
    gsap.set(track, { clearProps: 'all' });
    if (progressFill) progressFill.style.width = '100%';
  });
}
