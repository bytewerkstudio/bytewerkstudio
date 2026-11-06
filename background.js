/* ============================================================
   BYTEWERK STUDIO — background.js
   ------------------------------------------------------------
   A quiet, code-only ambient background: four slow colour
   fields and a drifting dot grid on the paper surface.
   No images, no libraries, no network requests.

   Motion is deliberately slow (48–72 s cycles) and low in
   contrast so the text stays the focus. The script respects
   prefers-reduced-motion and pauses in background tabs.
   ============================================================ */

(function () {
  'use strict';

  const CONFIG = {
    frameMs: 1000 / 30,
    maxDpr: 1.5,
    maxPixels: 6000000,

    grid: {
      size: 44,
      radius: 0.9,
      alpha: 0.09,
      driftX: 9,
      driftY: 11
    },

    blobs: [
      {
        color: [255, 251, 243],
        alpha: 0.34,
        x: 0.62, y: 0.42,
        dx: 0.10, dy: 0.08,
        radius: 0.52,
        period: 72,
        phase: 0.4
      },
      {
        color: [214, 190, 160],
        alpha: 0.10,
        x: 0.48, y: 0.88,
        dx: 0.18, dy: 0.10,
        radius: 0.62,
        period: 57,
        phase: 2.2
      },
      {
        color: [176, 79, 49],
        alpha: 0.075,
        x: 0.16, y: 0.20,
        dx: 0.16, dy: 0.14,
        radius: 0.55,
        period: 48,
        phase: 4.1
      },
      {
        color: [79, 122, 99],
        alpha: 0.055,
        x: 0.86, y: 0.30,
        dx: 0.12, dy: 0.18,
        radius: 0.58,
        period: 66,
        phase: 1.3
      }
    ]
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let canvas;
  let ctx;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let gridPattern = null;
  let frameId = 0;
  let lastFrame = 0;
  let startedAt = 0;
  let resizeTimer = 0;

  function createCanvas() {
    canvas = document.createElement('canvas');
    canvas.className = 'bw-bg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d', { alpha: true });
  }

  function buildGridPattern() {
    const size = CONFIG.grid.size;
    const tile = document.createElement('canvas');

    tile.width = size;
    tile.height = size;

    const tileCtx = tile.getContext('2d');
    tileCtx.fillStyle = 'rgba(31, 30, 29, 0.55)';
    tileCtx.beginPath();
    tileCtx.arc(size / 2, size / 2, CONFIG.grid.radius, 0, Math.PI * 2);
    tileCtx.fill();

    gridPattern = ctx.createPattern(tile, 'repeat');
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    width = window.innerWidth;
    height = window.innerHeight;

    // Soft gradients do not need native resolution on very large screens.
    if (width * height * dpr * dpr > CONFIG.maxPixels) {
      dpr = Math.sqrt(CONFIG.maxPixels / (width * height));
    }

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGridPattern();

    // Paint one frame immediately so the page never starts blank,
    // even if requestAnimationFrame is throttled in a hidden tab.
    draw(reducedMotion.matches ? 0.6 : 0.5);

    if (!reducedMotion.matches) {
      lastFrame = 0;
    }
  }

  function drawBlob(blob, time) {
    const angle = (time / blob.period) * Math.PI * 2 + blob.phase;
    const cx = (blob.x + Math.sin(angle) * blob.dx) * width;
    const cy = (blob.y + Math.cos(angle * 1.17) * blob.dy) * height;
    const radius = Math.max(width, height) * blob.radius * (1 + Math.sin(angle * 0.7) * 0.06);
    const [r, g, b] = blob.color;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + blob.alpha + ')');
    gradient.addColorStop(0.55, 'rgba(' + r + ',' + g + ',' + b + ',' + blob.alpha * 0.55 + ')');
    gradient.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGrid(time) {
    const offsetX = Math.sin(time / 43) * CONFIG.grid.driftX;
    const offsetY = Math.cos(time / 57) * CONFIG.grid.driftY;

    ctx.save();
    ctx.globalAlpha = CONFIG.grid.alpha;
    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = gridPattern;
    ctx.fillRect(-20, -20, width + 40, height + 40);
    ctx.restore();
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    for (const blob of CONFIG.blobs) {
      drawBlob(blob, time);
    }

    drawGrid(time);
  }

  function frame(now) {
    frameId = window.requestAnimationFrame(frame);

    if (now - lastFrame < CONFIG.frameMs) {
      return;
    }

    lastFrame = now;
    draw((now - startedAt) / 1000);
  }

  function start() {
    if (frameId || reducedMotion.matches) {
      return;
    }

    startedAt = performance.now() - 1000;
    lastFrame = 0;
    frameId = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function syncMotion() {
    if (reducedMotion.matches) {
      stop();
      draw(0.6);
    } else if (!document.hidden) {
      start();
    }
  }

  function init() {
    if (!document.body) {
      return;
    }

    createCanvas();
    resize();
    syncMotion();

    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        syncMotion();
      }
    });

    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', syncMotion);
    } else {
      reducedMotion.addListener(syncMotion);
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
