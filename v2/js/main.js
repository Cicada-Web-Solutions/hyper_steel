/**
 * HYPER STEEL — MAIN APPLICATION ENTRY POINT
 * Master GSAP Motion Orchestration & Component Initialization.
 * Concept: STEEL. SHADOW. ARCHITECTURE.
 */

import { initNavigation } from './navigation.js';
import { initCategoryGallery } from './category-gallery.js';
import { initVideoPlayer } from './video-player.js';
import { initProjects } from './projects.js';
import { initEnquiry } from './enquiry.js';

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize Lenis Smooth Scrolling if available
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    window.lenis = lenis;

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

  // 2. Register GSAP Plugins & Orchestrate Motion
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!prefersReducedMotion) {
      // 2A. Hero Entrance Timeline (Cinematic Architectural Reveal)
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .from('.site-header', {
          y: -25,
          opacity: 0,
          duration: 0.6,
          delay: 0.05
        })
        .from('.hero__headline-line', {
          y: 35,
          opacity: 0,
          stagger: 0.12,
          duration: 0.7
        }, '-=0.25')
        .from('.hero__lead', {
          y: 20,
          opacity: 0,
          duration: 0.55
        }, '-=0.35')
        .from('.hero__actions .btn', {
          y: 20,
          duration: 0.5,
          stagger: 0.08,
          clearProps: 'all'
        }, '-=0.25')
        .from('.hero__scroll-indicator', {
          opacity: 0,
          duration: 0.6
        }, '-=0.2');

      // 2B. Hero Background Parallax (Anchored Background Layer)
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.hero__bg', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });

        // Content slight lift & fade out as following section scrolls up
        gsap.to('.hero__content', {
          y: -35,
          opacity: 0.7,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // 2C. Section Header & Key Element Scroll Reveals
      if (typeof ScrollTrigger !== 'undefined') {
        const revealElements = document.querySelectorAll(
          '.section-header, .capability-card, .cinema-player, .video-playlist, .project-item'
        );

        revealElements.forEach((el) => {
          gsap.from(el, {
            y: 30,
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true
            }
          });
        });
      }
    }
  }

  // 3. Initialize Interactive Components
  initNavigation();
  initCategoryGallery();
  initVideoPlayer();
  initProjects();
  initEnquiry();

  // 4. Refresh ScrollTrigger on window resize and load
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
