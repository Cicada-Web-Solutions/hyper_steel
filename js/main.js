/**
 * HYPER STEEL — MAIN ENTRY POINT
 */

import { initNavigation } from './navigation.js';
import { initCategoryGallery } from './category-gallery.js';
import { initVideoPlayer } from './video-player.js';
import { initProjects } from './projects.js';
import { initEnquiry } from './enquiry.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Smooth Scrolling (Lenis) if available
  let lenis = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // 2. Register GSAP Plugins
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero Staggered Entrance Animation (Light Mode)
    if (!prefersReducedMotion) {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .from('.site-header', {
          y: -40,
          opacity: 0,
          duration: 0.8,
          delay: 0.1
        })
        .from('.hero__eyebrow', {
          y: 20,
          opacity: 0,
          duration: 0.7
        }, '-=0.4')
        .from('.hero__headline', {
          y: 40,
          opacity: 0,
          duration: 0.9
        }, '-=0.5')
        .from('.hero__lead', {
          y: 25,
          opacity: 0,
          duration: 0.75
        }, '-=0.5')
        .from('.hero__actions', {
          y: 20,
          opacity: 0,
          duration: 0.6
        }, '-=0.5')
        .from('.hero__bottom-bar', {
          y: 30,
          opacity: 0,
          duration: 0.8
        }, '-=0.4')
        .from('.hero__counter', {
          opacity: 0,
          x: 15,
          duration: 0.7
        }, '-=0.5');
    }

    // 3. One-Time Metrics Count-Up Animation
    const metricNumbers = document.querySelectorAll('.metric-item__number');
    if (metricNumbers.length > 0 && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      ScrollTrigger.batch(metricNumbers, {
        once: true,
        onEnter: (elements) => {
          elements.forEach((el) => {
            const targetVal = parseFloat(el.getAttribute('data-target') || '0');
            const isDecimal = el.getAttribute('data-decimal') === 'true';
            const countObj = { val: 0 };

            gsap.to(countObj, {
              val: targetVal,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                if (isDecimal) {
                  el.textContent = countObj.val.toFixed(1);
                } else {
                  el.textContent = Math.round(countObj.val).toLocaleString();
                }
              }
            });
          });
        }
      });
    }

    // 4. Subtle Section Fade-in Triggers
    if (!prefersReducedMotion && typeof ScrollTrigger !== 'undefined') {
      const fadeSections = document.querySelectorAll('.section-header, .capabilities-grid, .video-showcase-grid');
      fadeSections.forEach((sec) => {
        gsap.from(sec, {
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            once: true
          }
        });
      });
    }
  }

  // 5. Initialize Components
  initNavigation();
  initCategoryGallery();
  initVideoPlayer();
  initProjects();
  initEnquiry();

  // Refresh ScrollTrigger on window resize and load
  window.addEventListener('resize', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
});
