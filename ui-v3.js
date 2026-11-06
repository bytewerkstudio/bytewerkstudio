/* ============================================================
   BYTEWORK STUDIO — ui-v3.js
   Scroll progress, animated counters, FAQ behaviour, pointer
   spotlight for the premium hero. No dependencies.
   ============================================================ */

(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress ---------- */
  (function () {
    if (document.querySelector('.scroll-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- Counters ---------- */
  (function () {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const animate = (el) => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      if (reduce || !isFinite(target)) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      const dur = 1100;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  })();

  /* ---------- FAQ: only one open ---------- */
  (function () {
    const items = document.querySelectorAll('.faq-list details');
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach(other => { if (other !== item) other.open = false; });
      });
    });
  })();

  /* ---------- Hero pointer spotlight ---------- */
  (function () {
    const hero = document.querySelector('.hero-v3');
    if (!hero || reduce) return;
    let raf = null;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        hero.classList.add('has-pointer');
      });
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('has-pointer'));
  })();

  /* ---------- Reveal fallback for injected content ---------- */
  (function () {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) el.classList.add('in');
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
})();
