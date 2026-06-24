/**
 * scroll-engine.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Lenis smooth scroll + GSAP ScrollTrigger animation system.
 * Loaded as a side-effect module by BaseLayout.astro.
 *
 * Contracts exposed via data-attributes for other components:
 *   [data-reveal]            → fade-up (default) | "left" | "right"
 *   [data-reveal-group]      → container: children stagger with delay 0.12s
 *   [data-parallax]          → scrubbed yPercent -15 → 15
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ─── Reduced-motion guard ─────────────────────────────────────────────────
// When the user prefers reduced motion: make all [data-reveal] elements
// instantly visible and bail out — no Lenis, no GSAP animations.
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
} else {
  init();
}

// ─── Initialization ───────────────────────────────────────────────────────
function init(): void {
  // ── Lenis smooth scroll ──
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  // Keep ScrollTrigger in sync with Lenis scroll position.
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from the GSAP ticker so both share one rAF loop.
  // GSAP ticker time is in seconds; Lenis.raf expects milliseconds.
  gsap.ticker.add((time: number) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ── Anchor hijack ──
  // Intercept in-page links so Lenis handles smooth scrolling and the
  // 80 px fixed navbar does not cover the target heading.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = anchor.getAttribute('href');
      if (target) lenis.scrollTo(target, { offset: -80 });
    });
  });

  // ── Breakpoint-adaptive animations ──
  const mm = gsap.matchMedia();

  mm.add('(min-width: 769px)', () => {
    initHero('desktop');
    initReveals();
  });

  mm.add('(max-width: 768px)', () => {
    initHero('mobile');
    initReveals();
  });

  // After all images decode and paint, refresh pin measurements.
  if (document.readyState === 'complete') {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
}

// ─── Hero animations ──────────────────────────────────────────────────────
function initHero(mode: 'desktop' | 'mobile'): void {
  const ingredients = gsap.utils.toArray<HTMLElement>('.ingredient-float');
  const bowl = document.querySelector<HTMLElement>('.hero__bowl-img');
  const copy = document.querySelector<HTMLElement>('.hero__content');

  if (mode === 'desktop') {
    // Pin the hero section and scrub a timeline across 120 % of viewport height.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        pin: true,
        scrub: true,
        start: 'top top',
        end: '+=120%',
      },
    });

    // ── Ingredient scatter ──
    // Compute the outward throw vector for each ingredient from the
    // viewport center — direction is derived automatically from position,
    // so no hardcoded per-element values are needed.
    const vCx = window.innerWidth / 2;
    const vCy = window.innerHeight / 2;
    const throwDist = 1.4 * Math.max(window.innerWidth, window.innerHeight);

    ingredients.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;

      // Direction vector from viewport center → element center
      const dx = elCx - vCx;
      const dy = elCy - vCy;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1; // guard against zero

      tl.to(
        el,
        {
          x: (dx / mag) * throwDist,
          y: (dy / mag) * throwDist,
          rotate: '+=40',
          opacity: 0,
          ease: 'power2.in',
        },
        0, // all ingredient tweens start at position 0 of the timeline
      );
    });

    // Bowl zooms in as content clears
    if (bowl) tl.to(bowl, { scale: 1.45, ease: 'power1.inOut' }, 0);

    // Hero copy fades and slides up
    if (copy) tl.to(copy, { opacity: 0, y: -40, ease: 'power1.in' }, 0);
  } else {
    // Mobile: no pin (avoids jank), lighter fade-out + gentle bowl scale.
    const mobileST = {
      trigger: '.hero',
      start: 'top top',
      end: '+=60%',
      scrub: true,
    };

    if (bowl) gsap.to(bowl, { scale: 1.2, scrollTrigger: mobileST });

    // Ingredients are hidden via CSS on mobile (display:none on the
    // .hero__ingredients container) but we animate them defensively.
    ingredients.forEach(el => gsap.to(el, { opacity: 0, scrollTrigger: mobileST }));
  }
}

// ─── Reveal system ────────────────────────────────────────────────────────
// Implements the data-attribute contract consumed by all other sections.
function initReveals(): void {
  // ── [data-parallax] ──
  // Scrubbed vertical parallax: -15 % → +15 % across the element's scroll range.
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(el => {
    gsap.fromTo(
      el,
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });

  // ── [data-reveal-group] ──
  // Prime the initial transform state for each child, then fire all
  // children as a staggered batch when the group enters the viewport.
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach(group => {
    const children = Array.from(
      group.querySelectorAll<HTMLElement>(':scope > [data-reveal]'),
    );
    if (!children.length) return;

    // CSS handles opacity:0 (via html.js selector); set initial x/y here.
    children.forEach(el => {
      const from = revealFrom(el.dataset.reveal);
      gsap.set(el, { x: from.x, y: from.y });
    });

    ScrollTrigger.batch(children, {
      start: 'top 82%',
      onEnter: (batch: Element[]) => {
        gsap.to(batch, {
          opacity: 1,
          x: 0,
          y: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: true,
        });
      },
      onLeaveBack: (batch: Element[]) => {
        (batch as HTMLElement[]).forEach(el => {
          const from = revealFrom(el.dataset.reveal);
          gsap.set(el, { opacity: 0, x: from.x, y: from.y, overwrite: true });
        });
      },
    });
  });

  // ── Standalone [data-reveal] ──
  // Skip elements already handled inside a [data-reveal-group].
  // These animate bidirectionally (reverse on scroll-back).
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
    if (el.closest('[data-reveal-group]')) return;

    const from = revealFrom(el.dataset.reveal);

    gsap.fromTo(el, from, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────
interface RevealVars {
  opacity: number;
  x: number;
  y: number;
}

/**
 * Returns the GSAP "from" state for a given data-reveal direction value.
 * "left"  → slide in from the left
 * "right" → slide in from the right
 * default → fade up (no value or "up")
 */
function revealFrom(dir: string | undefined): RevealVars {
  if (dir === 'left')  return { opacity: 0, x: -60, y: 0 };
  if (dir === 'right') return { opacity: 0, x: 60,  y: 0 };
  return { opacity: 0, x: 0, y: 48 };
}
