/*!
 * floral-anim.js — Elegant Floral Animation System
 * Non-invasive: creates only a fixed overlay layer.
 * Modifies NOTHING in the existing DOM, CSS, or JS.
 * © 2026 Undangan Pernikahan — Burhan & Fira
 */
(function () {
  'use strict';

  /* ── Guard: respect accessibility preference ─────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Device detection ────────────────────────────────────── */
  const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                 || window.innerWidth < 768;

  /* ── Tuning constants ────────────────────────────────────── */
  const MAX_PETALS     = IS_MOBILE ? 3 : 6;
  const PETAL_INTERVAL = IS_MOBILE ? 8000 : 5000; // ms between new petals
  const FLOWER_SLOTS   = IS_MOBILE ? 6 : 11;       // how many fixed flowers

  /* ══════════════════════════════════════════════════════════
     SVG TEMPLATES — white-toned, consistent across sections
     Flowers appear as soft watermark art at very low opacity
  ══════════════════════════════════════════════════════════ */

  const SVG = {
    rose: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <ellipse cx="40" cy="40" rx="19" ry="11.5" stroke="white" stroke-width="0.9"/>
      <ellipse cx="40" cy="40" rx="19" ry="11.5" stroke="white" stroke-width="0.9" transform="rotate(30 40 40)"/>
      <ellipse cx="40" cy="40" rx="19" ry="11.5" stroke="white" stroke-width="0.9" transform="rotate(60 40 40)"/>
      <ellipse cx="40" cy="40" rx="19" ry="11.5" stroke="white" stroke-width="0.9" transform="rotate(90 40 40)"/>
      <ellipse cx="40" cy="40" rx="19" ry="11.5" stroke="white" stroke-width="0.9" transform="rotate(120 40 40)"/>
      <ellipse cx="40" cy="40" rx="19" ry="11.5" stroke="white" stroke-width="0.9" transform="rotate(150 40 40)"/>
      <circle cx="40" cy="40" r="6" fill="white" fill-opacity="0.18"/>
      <circle cx="40" cy="40" r="2.5" fill="white" fill-opacity="0.5"/>
    </svg>`,

    blossom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" fill="none">
      <ellipse cx="35" cy="13" rx="9" ry="16" fill="white" fill-opacity="0.42"/>
      <ellipse cx="35" cy="13" rx="9" ry="16" fill="white" fill-opacity="0.40" transform="rotate(72 35 35)"/>
      <ellipse cx="35" cy="13" rx="9" ry="16" fill="white" fill-opacity="0.42" transform="rotate(144 35 35)"/>
      <ellipse cx="35" cy="13" rx="9" ry="16" fill="white" fill-opacity="0.40" transform="rotate(216 35 35)"/>
      <ellipse cx="35" cy="13" rx="9" ry="16" fill="white" fill-opacity="0.42" transform="rotate(288 35 35)"/>
      <circle cx="35" cy="35" r="6" fill="white" fill-opacity="0.65"/>
      <circle cx="35" cy="35" r="2.8" fill="white" fill-opacity="0.90"/>
    </svg>`,

    leaf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80" fill="none">
      <path d="M30,3 Q57,18 51,52 Q41,73 30,77 Q19,73 9,52 Q3,18 30,3 Z"
            stroke="white" stroke-width="1.1" fill="white" fill-opacity="0.10"/>
      <line x1="30" y1="5"  x2="30" y2="76" stroke="white" stroke-width="0.65"/>
      <path d="M30,26 Q44,30 51,37"  stroke="white" stroke-width="0.55"/>
      <path d="M30,26 Q16,30  9,37"  stroke="white" stroke-width="0.55"/>
      <path d="M30,46 Q41,49 48,55"  stroke="white" stroke-width="0.45"/>
      <path d="M30,46 Q19,49 12,55"  stroke="white" stroke-width="0.45"/>
    </svg>`,

    magnolia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="10" rx="10"  ry="19" fill="white" fill-opacity="0.34"/>
      <ellipse cx="32" cy="10" rx="10"  ry="19" fill="white" fill-opacity="0.31" transform="rotate(60 32 32)"/>
      <ellipse cx="32" cy="10" rx="10"  ry="19" fill="white" fill-opacity="0.34" transform="rotate(120 32 32)"/>
      <ellipse cx="32" cy="10" rx="10"  ry="19" fill="white" fill-opacity="0.31" transform="rotate(180 32 32)"/>
      <ellipse cx="32" cy="10" rx="10"  ry="19" fill="white" fill-opacity="0.34" transform="rotate(240 32 32)"/>
      <ellipse cx="32" cy="10" rx="10"  ry="19" fill="white" fill-opacity="0.31" transform="rotate(300 32 32)"/>
      <circle cx="32" cy="32" r="6.5"  fill="white" fill-opacity="0.50"/>
      <circle cx="32" cy="32" r="2.8"  fill="white" fill-opacity="0.78"/>
    </svg>`,

    peony: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none">
      <ellipse cx="30" cy="30" rx="13" ry="8"   stroke="white" stroke-width="0.85"
               fill="white" fill-opacity="0.11" transform="rotate(0 30 30)"/>
      <ellipse cx="30" cy="30" rx="13" ry="8"   stroke="white" stroke-width="0.85"
               fill="white" fill-opacity="0.09" transform="rotate(45 30 30)"/>
      <ellipse cx="30" cy="30" rx="13" ry="8"   stroke="white" stroke-width="0.85"
               fill="white" fill-opacity="0.11" transform="rotate(90 30 30)"/>
      <ellipse cx="30" cy="30" rx="13" ry="8"   stroke="white" stroke-width="0.85"
               fill="white" fill-opacity="0.09" transform="rotate(135 30 30)"/>
      <ellipse cx="30" cy="30" rx="7.5" ry="4.5" stroke="white" stroke-width="0.70"
               fill="white" fill-opacity="0.17" transform="rotate(22 30 30)"/>
      <ellipse cx="30" cy="30" rx="7.5" ry="4.5" stroke="white" stroke-width="0.70"
               fill="white" fill-opacity="0.17" transform="rotate(67 30 30)"/>
      <ellipse cx="30" cy="30" rx="7.5" ry="4.5" stroke="white" stroke-width="0.70"
               fill="white" fill-opacity="0.17" transform="rotate(112 30 30)"/>
      <circle cx="30" cy="30" r="3.8"  fill="white" fill-opacity="0.44"/>
    </svg>`,
  };

  /* Falling petal SVG (used per-instance with variable opacity) */
  function makePetalSVG(fo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" fill="none">
      <path d="M13,1 Q22,7 20,20 Q18,30 13,33 Q8,30 6,20 Q4,7 13,1 Z"
            fill="white" fill-opacity="${fo}"
            stroke="white" stroke-width="0.45" stroke-opacity="${(fo * 0.6).toFixed(2)}"/>
      <path d="M13,2 Q13,17 13,33"
            stroke="white" stroke-width="0.35" stroke-opacity="${(fo * 0.4).toFixed(2)}"/>
    </svg>`;
  }

  /* ══════════════════════════════════════════════════════════
     PLACEMENT DEFINITIONS
     Positioned ONLY at viewport edges — never over main content.
     Partially off-screen (negative left/right/top) so they bleed
     elegantly without obscuring any readable content.
  ══════════════════════════════════════════════════════════ */

  /*
   * pos   — CSS position string (e.g. "left:-14px;top:4vh")
   * key   — SVG key from SVG object above
   * sz    — size in px
   * op    — base opacity  (very low: 0.09–0.15)
   * rb    — rotate base degrees (initial tilt angle)
   * fy    — float Y amplitude (px, max upward travel)
   * fx    — sway X amplitude (px, positive = right, negative = left)
   * dur   — animation duration (seconds)
   * del   — animation delay (seconds)
   */
  const ALL_PLACEMENTS = [
    // 0 — Top-left corner, large rose
    { pos:'left:-14px;top:4vh',      key:'rose',     sz:90,  op:0.13, rb:-14, fy:18, fx: 6,  dur:7.2,  del:0.0  },
    // 1 — Top-right corner, blossom
    { pos:'right:-10px;top:3vh',     key:'blossom',  sz:72,  op:0.12, rb: 12, fy:15, fx:-5,  dur:8.6,  del:1.4  },
    // 2 — Left side, upper, leaf
    { pos:'left:-16px;top:21vh',     key:'leaf',     sz:66,  op:0.11, rb:-22, fy:17, fx: 5,  dur:6.8,  del:0.7  },
    // 3 — Right side, upper, magnolia
    { pos:'right:-12px;top:18vh',    key:'magnolia', sz:80,  op:0.12, rb: 18, fy:21, fx:-7,  dur:9.1,  del:2.2  },
    // 4 — Left side, center, peony
    { pos:'left:-18px;top:42vh',     key:'peony',    sz:82,  op:0.12, rb: -7, fy:16, fx: 6,  dur:7.7,  del:1.6  },
    // 5 — Right side, center, rose
    { pos:'right:-14px;top:40vh',    key:'rose',     sz:64,  op:0.10, rb: 10, fy:19, fx:-6,  dur:8.3,  del:0.4  },
    // 6 — Left side, lower, blossom
    { pos:'left:-12px;top:63vh',     key:'blossom',  sz:76,  op:0.12, rb:-11, fy:14, fx: 5,  dur:7.1,  del:2.9  },
    // 7 — Right side, lower, leaf
    { pos:'right:-16px;top:60vh',    key:'leaf',     sz:60,  op:0.11, rb: 22, fy:17, fx:-5,  dur:6.6,  del:1.1  },
    // 8 — Bottom-left, magnolia
    { pos:'left:-10px;bottom:4vh',   key:'magnolia', sz:70,  op:0.12, rb:-17, fy:13, fx: 5,  dur:8.9,  del:0.5  },
    // 9 — Bottom-right, peony
    { pos:'right:-12px;bottom:3vh',  key:'peony',    sz:84,  op:0.12, rb:  8, fy:16, fx:-6,  dur:7.5,  del:1.9  },
    // 10 — Top, near left, small rose
    { pos:'left:1.5%;top:-12px',     key:'rose',     sz:56,  op:0.09, rb:-26, fy:12, fx: 4,  dur:9.3,  del:3.1  },
  ];

  const placements = ALL_PLACEMENTS.slice(0, FLOWER_SLOTS);

  /* ══════════════════════════════════════════════════════════
     INJECT CSS KEYFRAMES
     One unique animation per flower so each moves distinctly.
  ══════════════════════════════════════════════════════════ */
  const styleEl = document.createElement('style');
  styleEl.id = 'floral-anim-keyframes';

  let kfCSS = '';

  /* Per-flower float+sway+rotate keyframes */
  placements.forEach(({ fy, fx, rb }, i) => {
    const y1 = +(fy * 0.55).toFixed(1);
    const y2 = fy;
    const y3 = +(fy * 0.70).toFixed(1);
    const x1 = fx;
    const x2 = +(fx * 0.5).toFixed(1);
    const r0 = rb;
    const r1 = +(rb + 2.0).toFixed(1);
    const r2 = +(rb + 3.5).toFixed(1);

    kfCSS += `
@keyframes floral_${i} {
  0%   { transform: translateY(0px)    translateX(0px)  rotate(${r0}deg) scale(1);     }
  25%  { transform: translateY(-${y1}px) translateX(${x1}px) rotate(${r1}deg) scale(1.015); }
  50%  { transform: translateY(-${y2}px) translateX(0px)  rotate(${r2}deg) scale(1.026); }
  75%  { transform: translateY(-${y3}px) translateX(${x2}px) rotate(${r1}deg) scale(1.012); }
  100% { transform: translateY(0px)    translateX(0px)  rotate(${r0}deg) scale(1);     }
}`;
  });

  /* Shared glow pulse — desktop only, subtle */
  kfCSS += `
@keyframes floralGlow {
  0%, 100% { filter: drop-shadow(0 0 4px  rgba(255,255,255,0.10)); }
  50%       { filter: drop-shadow(0 0 12px rgba(255,255,255,0.28)); }
}`;

  /* Falling petal — uses per-element CSS custom properties for sway path */
  kfCSS += `
@keyframes petalFall {
  0%   { transform: translateY(-30px) translateX(0)          rotate(0deg);        opacity: 0;    }
  5%   {                                                                            opacity: 1;    }
  28%  { transform: translateY(28vh)  translateX(var(--f-x1)) rotate(var(--f-r1)); }
  55%  { transform: translateY(56vh)  translateX(var(--f-x2)) rotate(var(--f-r2)); }
  80%  { transform: translateY(82vh)  translateX(var(--f-x3)) rotate(var(--f-r3)); }
  95%  {                                                                            opacity: 0.35; }
  100% { transform: translateY(112vh) translateX(0)          rotate(var(--f-r4)); opacity: 0;    }
}`;

  styleEl.textContent = kfCSS;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════════════
     FIXED LAYER — contains all floating flower elements
  ══════════════════════════════════════════════════════════ */
  const layer = document.createElement('div');
  layer.id    = 'floral-anim-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = [
    'position:fixed',
    'inset:0',
    'pointer-events:none',
    'z-index:3',
    'overflow:visible',
  ].join(';');
  document.body.appendChild(layer);

  /* ══════════════════════════════════════════════════════════
     CREATE FLOWER ELEMENTS
     Two-level structure separates parallax (wrapper) from float+sway (inner).
  ══════════════════════════════════════════════════════════ */
  const parallaxItems = []; // { el: wrapperEl, factor: number }

  placements.forEach((p, i) => {
    /* ── Outer wrapper: parallax target (JS updates transform) ── */
    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      'position:absolute',
      p.pos,
      `width:${p.sz}px`,
      `height:${p.sz}px`,
      'will-change:transform',
    ].join(';');

    /* ── Inner element: CSS float/sway/rotate/glow animation ── */
    const inner = document.createElement('div');
    const glowAnim = IS_MOBILE
      ? ''
      : `, floralGlow ${(p.dur * 1.35).toFixed(1)}s ease-in-out ${(p.del * 0.6).toFixed(1)}s infinite`;

    inner.style.cssText = [
      'width:100%',
      'height:100%',
      `opacity:${p.op}`,
      `animation: floral_${i} ${p.dur}s ease-in-out ${p.del}s infinite${glowAnim}`,
      'will-change:transform,filter',
    ].join(';');
    inner.innerHTML = SVG[p.key];

    /* ── Hover effect (desktop only) ── */
    if (!IS_MOBILE) {
      wrapper.style.pointerEvents = 'auto';

      wrapper.addEventListener('mouseenter', () => {
        inner.style.animationPlayState = 'paused';
        inner.style.transition = [
          'transform 0.38s cubic-bezier(0.34,1.56,0.64,1)',
          'opacity 0.35s ease',
          'filter 0.35s ease',
        ].join(',');
        inner.style.transform = `scale(1.16) rotate(${p.rb + 5}deg)`;
        inner.style.opacity   = String(Math.min(p.op * 2.5, 0.40));
        inner.style.filter    = 'drop-shadow(0 0 18px rgba(255,255,255,0.42))';
      });

      wrapper.addEventListener('mouseleave', () => {
        inner.style.transition = 'opacity 0.55s ease, filter 0.55s ease';
        inner.style.transform  = '';
        inner.style.opacity    = String(p.op);
        inner.style.filter     = '';
        // Resume CSS animation after transition finishes
        setTimeout(() => {
          inner.style.animationPlayState = 'running';
        }, 580);
      });
    }

    wrapper.appendChild(inner);
    layer.appendChild(wrapper);

    /* Slightly vary parallax factor per element for natural depth */
    parallaxItems.push({ el: wrapper, factor: 0.050 + i * 0.009 });
  });

  /* ══════════════════════════════════════════════════════════
     PARALLAX ON SCROLL
     Flowers drift slightly in the scroll direction, appearing
     at a different depth plane than the page content.
  ══════════════════════════════════════════════════════════ */
  const MAX_DRIFT = 180; // px cap — prevents flowers straying too far
  let   rafPending = false;

  function applyParallax() {
    const sy = window.scrollY;
    parallaxItems.forEach(({ el, factor }) => {
      const offset = Math.min(sy * factor, MAX_DRIFT);
      el.style.transform = `translateY(${offset}px)`;
    });
    rafPending = false;
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(applyParallax);
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════
     FALLING PETALS SYSTEM
     CSS-animated SVG petals that gently descend from the top.
     Spawned at random intervals; self-cleaning after animation.
  ══════════════════════════════════════════════════════════ */
  let activePetals = 0;

  function spawnPetal() {
    if (activePetals >= MAX_PETALS) return;
    activePetals++;

    /* Randomised parameters */
    const size  = 13 + Math.random() * 22;                   // 13–35 px
    const xPos  = 3  + Math.random() * 94;                   // 3%–97% from left
    const dur   = 12 + Math.random() * 11;                   // 12–23 s
    const del   = Math.random() * 1.8;
    const fOpac = (0.55 + Math.random() * 0.28).toFixed(2);  // 0.55–0.83

    /* Sway path variables (used in petalFall keyframe via var()) */
    const x1 = r(-35, 35)  + 'px';
    const x2 = r(-45, 45)  + 'px';
    const x3 = r(-28, 28)  + 'px';
    const r1 = r(40,  120) + 'deg';
    const r2 = r(130, 220) + 'deg';
    const r3 = r(230, 300) + 'deg';
    const r4 = r(300, 400) + 'deg';

    const petal = document.createElement('div');
    petal.setAttribute('aria-hidden', 'true');
    petal.style.cssText = [
      'position:fixed',
      `left:${xPos.toFixed(1)}%`,
      'top:0',
      `width:${size.toFixed(0)}px`,
      `height:${(size * 1.3).toFixed(0)}px`,
      'pointer-events:none',
      'z-index:3',
      'will-change:transform,opacity',
      /* CSS custom props for the sway path */
      `--f-x1:${x1}`,
      `--f-x2:${x2}`,
      `--f-x3:${x3}`,
      `--f-r1:${r1}`,
      `--f-r2:${r2}`,
      `--f-r3:${r3}`,
      `--f-r4:${r4}`,
      `animation:petalFall ${dur.toFixed(1)}s ease-in ${del.toFixed(1)}s 1 forwards`,
    ].join(';');
    petal.innerHTML = makePetalSVG(fOpac);

    document.body.appendChild(petal);

    /* Self-clean after animation completes */
    setTimeout(() => {
      petal.remove();
      activePetals--;
    }, (dur + del + 0.4) * 1000);
  }

  /* Helper: random integer between min and max */
  function r(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  /* Initial spawn + recurring interval */
  setTimeout(() => {
    spawnPetal();
    setInterval(spawnPetal, PETAL_INTERVAL);
  }, 2800);

  /* ══════════════════════════════════════════════════════════
     RESPONSIVE: hide/show extra flowers on narrow viewports
  ══════════════════════════════════════════════════════════ */
  // Extra flowers (slots 6+) are desktop-only — hide on narrow screens
  let resizeTimer;
  function applyResponsive() {
    const narrow = window.innerWidth < 768;
    layer.querySelectorAll('div').forEach((el, i) => {
      if (i >= 6) el.style.display = narrow ? 'none' : '';
    });
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyResponsive, 400);
  });

  applyResponsive(); // run once on init

})();
