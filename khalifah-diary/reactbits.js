/* ═══════════════════════════════════════════════════════════
   Khalifah Diary – reactbits.js
   ReactBits-inspired motion layer, ported to vanilla JS.
   No dependencies, no eval / new Function (CSP-safe).
   Loaded AFTER app.js so it can enhance DOM that app.js builds.

   SplitText · BlurText · ShinyText · Aurora · SpotlightCard
   ClickSpark · Magnet · AnimatedContent · CountUp
   ═══════════════════════════════════════════════════════════ */

'use strict';

(function () {

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ═══════════════════════════════════════════
  // SPLIT TEXT
  // Wraps each character in its own span, then
  // paints a horizontal slice of the element's
  // original gradient onto every character so
  // the gradient still reads as one continuous
  // sweep across the whole word.
  //
  // The gradient lives on the CHARACTER, never
  // on the parent: background-clip:text on a
  // parent whose children are transformed is
  // the known Chromium/WebKit bug that renders
  // blank boxes instead of glyphs.
  // ═══════════════════════════════════════════
  const splitTargets = [];

  function splitChars(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const frag = document.createDocumentFragment();
    let i = 0;

    words.forEach((word, w) => {
      // Each word is its own inline-block so a line break can only ever
      // land between words, never between two characters.
      const wrap = document.createElement('span');
      wrap.className = 'rb-wordwrap';

      for (const ch of Array.from(word)) {
        // Two spans on purpose:
        //   .rb-char → carries transform / opacity / blur
        //   .rb-ink  → carries background-clip:text, never transformed
        // Keeping the clipped element free of its own transform and filter
        // is what avoids the blank-glyph compositing bug entirely.
        const span = document.createElement('span');
        span.className = 'rb-char';
        span.style.setProperty('--i', i++);

        const ink = document.createElement('span');
        ink.className = 'rb-ink';
        ink.textContent = ch;

        span.appendChild(ink);
        wrap.appendChild(span);
      }

      frag.appendChild(wrap);
      if (w < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });

    el.appendChild(frag);
    el.classList.add('rb-split');
  }

  function paintGradient(el) {
    const gradient = el._rbGradient;
    if (!gradient) return;

    const chars = $$('.rb-char', el);
    if (!chars.length) return;

    // Measure with transforms disabled so positions are the final ones
    el.classList.add('rb-measuring');

    let min = Infinity, max = -Infinity;
    const rects = chars.map(c => {
      const r = c.getBoundingClientRect();
      if (r.width || r.height) { min = Math.min(min, r.left); max = Math.max(max, r.right); }
      return r;
    });

    const width = max - min;
    if (isFinite(width) && width > 0) {
      chars.forEach((c, idx) => {
        const ink = c.firstElementChild;
        if (!ink) return;
        ink.style.backgroundImage      = gradient;
        ink.style.backgroundSize       = width.toFixed(1) + 'px 100%';
        ink.style.backgroundPosition   = (-(rects[idx].left - min)).toFixed(1) + 'px 0';
        ink.style.webkitBackgroundClip = 'text';
        ink.style.backgroundClip       = 'text';
        ink.style.webkitTextFillColor  = 'transparent';
      });
    }

    el.classList.remove('rb-measuring');
  }

  function setupSplit(el) {
    if (!el || el.dataset.rbSplit) return;
    // Capture the gradient BEFORE the .rb-split override strips it
    const bg = getComputedStyle(el).backgroundImage;
    el._rbGradient = (bg && bg !== 'none') ? bg : null;
    el.dataset.rbSplit = '1';
    splitChars(el);
    paintGradient(el);
    splitTargets.push(el);
  }

  function repaintAll() {
    splitTargets.forEach(paintGradient);
  }

  // ═══════════════════════════════════════════
  // HERO HEADER
  // Arabic line  → BlurText (never split: per-char
  //                spans break Arabic glyph shaping)
  // Latin line   → SplitText with gradient slices
  // ═══════════════════════════════════════════
  function initHero() {
    const title = $('.hero-title');
    if (!title) return;

    const arabic = $('.hero-title-top', title);
    const latin  = $('.hero-title-bottom', title);

    if (arabic) arabic.classList.add('rb-blur-in');
    if (latin)  setupSplit(latin);

    const subtitle = $('.hero-subtitle');
    if (subtitle) subtitle.classList.add('rb-shiny');

    const reveal = () => title.classList.add('rb-in');
    REDUCE ? reveal() : setTimeout(reveal, 420);
  }

  // ═══════════════════════════════════════════
  // SECTION TITLES
  // Reveal is driven by the existing
  // IntersectionObserver in app.js, which adds
  // .revealed to .section-header.
  // ═══════════════════════════════════════════
  function initSectionTitles() {
    $$('.section-header .section-title').forEach(setupSplit);
  }

  // ═══════════════════════════════════════════
  // AURORA — injected into the existing hero-bg
  // so no markup change is required upstream.
  // ═══════════════════════════════════════════
  function initAurora() {
    const bg = $('.hero-bg');
    if (!bg || $('.rb-aurora', bg)) return;

    const wrap = document.createElement('div');
    wrap.className = 'rb-aurora';
    wrap.setAttribute('aria-hidden', 'true');
    ['rb-b1', 'rb-b2', 'rb-b3'].forEach(cls => {
      const band = document.createElement('span');
      band.className = 'rb-aurora-band ' + cls;
      wrap.appendChild(band);
    });
    // Insert before the stars canvas so stars stay on top
    bg.insertBefore(wrap, bg.firstChild);
  }

  // ═══════════════════════════════════════════
  // GRAIN
  // ═══════════════════════════════════════════
  function initGrain() {
    if (REDUCE || $('.rb-grain')) return;
    const grain = document.createElement('div');
    grain.className = 'rb-grain';
    grain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(grain);
  }

  // ═══════════════════════════════════════════
  // SPOTLIGHT CARD
  // ═══════════════════════════════════════════
  function attachSpotlight(card) {
    if (!FINE || card.dataset.rbSpot) return;
    card.dataset.rbSpot = '1';

    const spot = document.createElement('span');
    spot.className = 'rb-spot';
    spot.setAttribute('aria-hidden', 'true');
    card.insertBefore(spot, card.firstChild);

    card.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  function initSpotlights() {
    $$('.glass-card').forEach(attachSpotlight);
  }

  // ═══════════════════════════════════════════
  // MAGNET — buttons lean toward the cursor
  // ═══════════════════════════════════════════
  function initMagnet() {
    if (!FINE || REDUCE) return;
    const STRENGTH = 0.28, MAX = 7;

    $$('.btn-primary, .hadith-btn, .cal-nav-btn').forEach(el => {
      el.classList.add('rb-magnet');

      el.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const x = Math.max(-MAX, Math.min(MAX, dx * STRENGTH));
        const y = Math.max(-MAX, Math.min(MAX, dy * STRENGTH));
        el.classList.add('rb-magnet-active');
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px, 0)`;
      }, { passive: true });

      el.addEventListener('pointerleave', () => {
        el.classList.remove('rb-magnet-active');
        el.style.transform = '';
      });
    });
  }

  // ═══════════════════════════════════════════
  // CLICK SPARK
  // Canvas is created lazily and the render loop
  // only runs while sparks are alive.
  // ═══════════════════════════════════════════
  const spark = { canvas: null, ctx: null, items: [], running: false, dpr: 1 };

  function sparkResize() {
    const c = spark.canvas;
    spark.dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width  = Math.round(window.innerWidth  * spark.dpr);
    c.height = Math.round(window.innerHeight * spark.dpr);
    spark.ctx.setTransform(spark.dpr, 0, 0, spark.dpr, 0, 0);
  }

  function sparkInit() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    document.body.appendChild(c);
    spark.canvas = c;
    spark.ctx = c.getContext('2d');
    sparkResize();
    window.addEventListener('resize', sparkResize);
  }

  function sparkLoop() {
    const ctx = spark.ctx;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = spark.items.length - 1; i >= 0; i--) {
      const s = spark.items[i];
      s.life -= 0.028;
      if (s.life <= 0) { spark.items.splice(i, 1); continue; }

      const dist = s.dist * (1 - s.life) + 6;
      const x1 = s.x + Math.cos(s.angle) * dist;
      const y1 = s.y + Math.sin(s.angle) * dist;
      const x2 = s.x + Math.cos(s.angle) * (dist + 9 * s.life);
      const y2 = s.y + Math.sin(s.angle) * (dist + 9 * s.life);

      ctx.strokeStyle = (s.teal ? 'rgba(56,217,169,' : 'rgba(46,168,213,') + (s.life * 0.9).toFixed(3) + ')';
      ctx.lineWidth = 1.6 * s.life + 0.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    if (spark.items.length) requestAnimationFrame(sparkLoop);
    else spark.running = false;
  }

  function initClickSpark() {
    if (REDUCE) return;

    document.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      if (!spark.canvas) sparkInit();

      const COUNT = 10;
      for (let i = 0; i < COUNT; i++) {
        spark.items.push({
          x: e.clientX,
          y: e.clientY,
          angle: (Math.PI * 2 * i) / COUNT + Math.random() * 0.3,
          dist: 16 + Math.random() * 12,
          life: 1,
          teal: Math.random() < 0.45
        });
      }

      if (!spark.running) { spark.running = true; requestAnimationFrame(sparkLoop); }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════
  // ANIMATED CONTENT — stagger prayer timeline
  // items and calendar cells as they render.
  // Classes are removed on animationend so they
  // never fight the hover / pulse transforms
  // already defined in style.css.
  // ═══════════════════════════════════════════
  function staggerChildren(container, selector, cls) {
    const kids = $$(selector, container);
    kids.forEach((el, i) => {
      el.style.setProperty('--i', i);
      el.classList.add(cls);
      el.addEventListener('animationend', () => {
        el.classList.remove(cls);
        el.style.removeProperty('--i');
      }, { once: true });
    });
  }

  function initStaggerObservers() {
    if (REDUCE) return;

    const timeline = $('#prayerCards');
    if (timeline) {
      new MutationObserver(() => staggerChildren(timeline, '.pw-item', 'rb-pop'))
        .observe(timeline, { childList: true });
    }

    const calBody = $('#calBody');
    if (calBody) {
      new MutationObserver(() => staggerChildren(calBody, '.cal-day:not(.empty)', 'rb-cell'))
        .observe(calBody, { childList: true });
    }
  }

  // ═══════════════════════════════════════════
  // COUNT UP — age calculator figures roll up
  // ═══════════════════════════════════════════
  function countUp(el, target) {
    const DURATION = 750;
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  function initCountUp() {
    if (REDUCE) return;

    ['umurMasihiNums', 'umurHijriNums'].forEach(id => {
      const host = document.getElementById(id);
      if (!host) return;
      new MutationObserver(() => {
        $$('.umur-num-v', host).forEach(el => {
          const target = parseInt(el.textContent, 10);
          if (!isNaN(target) && target > 0) countUp(el, target);
        });
      }).observe(host, { childList: true });
    });
  }

  // ═══════════════════════════════════════════
  // COUNTDOWN TICK — seconds blur-pop each beat
  // ═══════════════════════════════════════════
  function initTick() {
    if (REDUCE) return;
    const secs = document.getElementById('cdSeconds');
    if (!secs) return;

    new MutationObserver(() => {
      secs.classList.remove('rb-tick');
      void secs.offsetWidth;           // restart the animation
      secs.classList.add('rb-tick');
    }).observe(secs, { childList: true, characterData: true, subtree: true });
  }

  // ═══════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════
  function boot() {
    initAurora();
    initGrain();
    initHero();
    initSectionTitles();
    initSpotlights();
    initMagnet();
    initClickSpark();
    initStaggerObservers();
    initCountUp();
    initTick();

    // Re-slice gradients once webfonts settle and on resize
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(repaintAll).catch(() => {});
    }
    let t = null;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(repaintAll, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
