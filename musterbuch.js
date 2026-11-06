/* ============================================================
   BYTEWERK STUDIO — WERKPROBE
   ------------------------------------------------------------
   Two parts, one page:

   1. The sample sheet. Four choices (tone, type, density,
      edge) rewrite a set of custom properties on the preview
      frame. Everything else — the readout, the contrast check,
      the CSS export and the briefing link — is derived from
      that same state, so the page never drifts from the code.

   2. The sample book. Four paper leaves, one per tone, hinged
      like an open book. Hover and selection lift a leaf; the
      pointer turns the book. three.js is imported from
      vendor/ (r180) because the CSP allows only 'self'.

   Without JavaScript the preview keeps its paper defaults and
   the CSS deck stands in for the 3D book.
   Without WebGL the deck stays. Reduced motion renders one
   still frame and updates it only on interaction.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

/* ---------- palette ---------- */

const TONES = {
  papier: {
    de: 'Papier', en: 'Paper',
    bg: '#faf9f5', surface: '#ffffff', surface2: '#f6f2ea',
    ink: '#1f1e1d', inkSoft: '#3b3833', muted: '#6b665c',
    line: '#e6e1d4', accent: '#b04f31', accent700: '#8d3d26',
    onAccent: '#fffaf6', plate: '#f2ecdd', edge: '#ddd3bd'
  },
  terrakotta: {
    de: 'Terrakotta', en: 'Terracotta',
    bg: '#f7ede4', surface: '#fffaf6', surface2: '#fdf4ec',
    ink: '#2a1c15', inkSoft: '#4a2f22', muted: '#7a5c4c',
    line: '#ead7c6', accent: '#8c3a22', accent700: '#74301c',
    onAccent: '#fffaf6', plate: '#b04f31', edge: '#8d3d26'
  },
  salbei: {
    de: 'Salbei', en: 'Sage',
    bg: '#eef2ec', surface: '#fbfdf9', surface2: '#f5f9f4',
    ink: '#1b2a22', inkSoft: '#2c4236', muted: '#566b5f',
    line: '#d3e0d5', accent: '#3f6b52', accent700: '#32553f',
    onAccent: '#f7fbf8', plate: '#4f7a63', edge: '#40634f'
  },
  tusche: {
    de: 'Tusche', en: 'Ink',
    bg: '#1b1a19', surface: '#232120', surface2: '#2b2826',
    ink: '#f5f2ea', inkSoft: '#ded8cc', muted: '#b9b2a4',
    line: '#3a3632', accent: '#e0a184', accent700: '#f0bfa8',
    onAccent: '#201512', plate: '#242220', edge: '#141312'
  }
};

const FONTS = {
  serif: { de: 'Serif', display: "var(--display)", body: "var(--body)", tracking: '-0.022em' },
  sans:  { de: 'Sans',  display: "var(--body)",    body: "var(--body)", tracking: '-0.032em' }
};

const DENSITY = { luftig: 'Luftig', kompakt: 'Kompakt' };
const EDGE = { weich: 'Weich', praezise: 'Präzise' };

/* The deck reads its colours from the tone table above, so a new
   tone is added in exactly one place. */
const SLABS = [
  { tone: 'papier',     face: TONES.papier.plate,     side: TONES.papier.edge },
  { tone: 'terrakotta', face: TONES.terrakotta.plate, side: TONES.terrakotta.edge },
  { tone: 'salbei',     face: TONES.salbei.plate,     side: TONES.salbei.edge },
  { tone: 'tusche',     face: TONES.tusche.plate,     side: TONES.tusche.edge }
];

const DEFAULT = { tone: 'papier', font: 'serif', density: 'luftig', edge: 'weich' };
const KEYS = Object.keys(DEFAULT);
const STORE = 'bw-musterbuch';

/* ---------- boot ---------- */

const frame = document.querySelector('[data-mb-frame]');
const state = readState();

let book = null;

if (frame) {
  apply(state, { url: false, store: false });
  bind();
  book = initBook();
  book?.setTone(state.tone, true);
}

/* ---------- state ---------- */

function readState() {
  const out = { ...DEFAULT };
  const params = new URLSearchParams(location.search);

  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (_) {}

  if (stored && typeof stored === 'object') {
    KEYS.forEach((k) => { if (stored[k] in validFor(k)) out[k] = stored[k]; });
  }
  KEYS.forEach((k) => {
    const v = params.get(shortKey(k));
    if (v && v in validFor(k)) out[k] = v;
  });

  return out;
}

function validFor(key) {
  if (key === 'tone') return TONES;
  if (key === 'font') return FONTS;
  if (key === 'density') return DENSITY;
  return EDGE;
}

function shortKey(key) {
  return { tone: 'ton', font: 'schrift', density: 'dichte', edge: 'ecken' }[key];
}

function apply(next, opts = {}) {
  Object.assign(state, next);

  const t = TONES[state.tone];
  const f = FONTS[state.font];

  frame.style.setProperty('--p-bg', t.bg);
  frame.style.setProperty('--p-surface', t.surface);
  frame.style.setProperty('--p-ink', t.ink);
  frame.style.setProperty('--p-ink-soft', t.inkSoft);
  frame.style.setProperty('--p-muted', t.muted);
  frame.style.setProperty('--p-line', t.line);
  frame.style.setProperty('--p-accent', t.accent);
  frame.style.setProperty('--p-on-accent', t.onAccent);
  frame.style.setProperty('--p-display', f.display);
  frame.style.setProperty('--p-body', f.body);
  frame.style.setProperty('--p-tracking', f.tracking);

  frame.dataset.font = state.font;
  frame.dataset.density = state.density;
  frame.dataset.edge = state.edge;

  document.querySelectorAll('.mb-controls [data-key], [data-mb-tones] [data-tone]').forEach((btn) => {
    const key = btn.dataset.key || 'tone';
    btn.setAttribute('aria-pressed', String(state[key] === btn.dataset.val || state.tone === btn.dataset.tone));
  });

  const labels = {
    tone: lang() === 'en' ? t.en : t.de,
    font: f.de,
    density: lang() === 'en' ? (state.density === 'luftig' ? 'Airy' : 'Compact') : DENSITY[state.density],
    edge: lang() === 'en' ? (state.edge === 'weich' ? 'Soft' : 'Precise') : EDGE[state.edge]
  };
  Object.entries(labels).forEach(([key, value]) => {
    const el = document.querySelector('[data-mb-value="' + key + '"]');
    if (el) el.textContent = value;
  });

  const readout = document.querySelector('[data-mb-readout]');
  if (readout) {
    const sep = ' · ';
    readout.textContent = lang() === 'en'
      ? [t.en, f.de, state.density === 'luftig' ? 'Airy' : 'Compact', state.edge === 'weich' ? 'Soft' : 'Precise'].join(sep)
      : [t.de, f.de, DENSITY[state.density], EDGE[state.edge]].join(sep);
  }

  updateContrast(t);
  updateCss(t, f);
  updateBriefing(t, f);

  if (opts.url !== false) {
    const url = new URL(location.href);
    KEYS.forEach((k) => url.searchParams.set(shortKey(k), state[k]));
    try { history.replaceState(null, '', url); } catch (_) {}
  }
  if (opts.store !== false) {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_) {}
  }
}

function lang() {
  return (document.documentElement.lang || 'de').toLowerCase().startsWith('en') ? 'en' : 'de';
}

/* ---------- contrast (WCAG 2.1) ---------- */

function luminance(hex) {
  const c = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function updateContrast(t) {
  const pairs = [
    contrast(t.ink, t.bg),
    contrast(t.muted, t.bg),
    contrast(t.accent, t.bg),
    contrast(t.onAccent, t.accent)
  ];
  const min = Math.min(...pairs);
  const grade = min >= 7 ? 'AAA' : min >= 4.5 ? 'AA' : '—';

  const box = document.querySelector('[data-mb-contrast]');
  const text = document.querySelector('[data-mb-contrast-text]');
  if (!box || !text) return;

  const value = min.toFixed(2).replace('.', ',');
  box.classList.toggle('is-low', min < 4.5);
  text.textContent = lang() === 'en'
    ? 'Contrast ' + value + ':1 · WCAG ' + grade
    : 'Kontrast ' + value + ':1 · WCAG ' + grade;
}

/* ---------- CSS export ---------- */

function cssBlock(t, f) {
  const font = state.font === 'serif'
    ? "'Newsreader', Georgia, 'Times New Roman', serif"
    : "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

  return [
    '/* Bytewerk Studio — Musterbuch',
    '   ' + [t.de, f.de, DENSITY[state.density], EDGE[state.edge]].join(' · '),
    '   ' + shareUrl() + ' */',
    ':root {',
    '  --paper: ' + t.bg + ';',
    '  --surface: ' + t.surface + ';',
    '  --surface-2: ' + t.surface2 + ';',
    '  --ink: ' + t.ink + ';',
    '  --ink-soft: ' + t.inkSoft + ';',
    '  --muted: ' + t.muted + ';',
    '  --line: ' + t.line + ';',
    '  --accent: ' + t.accent + ';',
    '  --accent-700: ' + t.accent700 + ';',
    '  --on-accent: ' + t.onAccent + ';',
    '  --radius-lg: ' + (state.edge === 'praezise' ? '4px' : '18px') + ';',
    '  --display: ' + font + ';',
    '  --tracking-display: ' + f.tracking + ';',
    '}'
  ].join('\n');
}

function updateCss(t, f) {
  const code = document.querySelector('[data-mb-css]');
  if (code) code.textContent = cssBlock(t, f);
}

/* ---------- briefing ---------- */

function shareUrl() {
  const url = new URL(location.href);
  url.hash = '';
  return url.toString();
}

function updateBriefing(t, f) {
  const link = document.querySelector('[data-mb-briefing]');
  if (!link) return;

  const lines = lang() === 'en'
    ? [
        'Work sample: ' + [t.en, f.de, state.density === 'luftig' ? 'Airy' : 'Compact', state.edge === 'weich' ? 'Soft' : 'Precise'].join(' · '),
        '',
        'Tone: ' + t.en,
        'Type: ' + (state.font === 'serif' ? 'Newsreader (serif)' : 'Inter (sans)'),
        'Density: ' + (state.density === 'luftig' ? 'Airy' : 'Compact'),
        'Edge: ' + (state.edge === 'weich' ? 'Soft' : 'Precise'),
        '',
        'Preview: ' + shareUrl()
      ]
    : [
        'Musterbuch: ' + [t.de, f.de, DENSITY[state.density], EDGE[state.edge]].join(' · '),
        '',
        'Ton: ' + t.de,
        'Schrift: ' + (state.font === 'serif' ? 'Newsreader (Serif)' : 'Inter (Sans)'),
        'Dichte: ' + DENSITY[state.density],
        'Kante: ' + EDGE[state.edge],
        '',
        'Vorschau: ' + shareUrl()
      ];

  const subject = lang() === 'en'
    ? 'Work sample: ' + [t.en, f.de].join(' · ')
    : 'Musterbuch: ' + [t.de, f.de].join(' · ');

  link.href = 'mailto:Haqmalh@icloud.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
}

/* ---------- events ---------- */

function bind() {
  document.querySelectorAll('.mb-controls [data-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (!(key in DEFAULT)) return;
      apply({ [key]: btn.dataset.val });
      if (key === 'tone') book?.setTone(state.tone);
    });
  });

  document.querySelectorAll('[data-mb-tones] [data-tone]').forEach((btn) => {
    btn.addEventListener('click', () => {
      apply({ tone: btn.dataset.tone });
      book?.setTone(state.tone);
    });
    btn.addEventListener('pointerenter', () => book?.hover(toneIndex(btn.dataset.tone)));
    btn.addEventListener('focus', () => book?.hover(toneIndex(btn.dataset.tone)));
    btn.addEventListener('pointerleave', () => book?.hover(-1));
    btn.addEventListener('blur', () => book?.hover(-1));
  });

  document.querySelector('[data-mb-reset]')?.addEventListener('click', () => {
    apply({ ...DEFAULT });
    book?.setTone(DEFAULT.tone);
  });

  document.querySelector('[data-mb-copy]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const text = cssBlock(TONES[state.tone], FONTS[state.font]);
    copy(text).then((ok) => flash(button, ok));
  });

  document.addEventListener('bw:lang', () => apply({}));
}

function flash(button, ok) {
  const original = button.dataset.label || button.textContent;
  button.dataset.label = original;
  button.textContent = ok
    ? (lang() === 'en' ? 'Copied ✓' : 'Kopiert ✓')
    : (lang() === 'en' ? 'Select below ↓' : 'Unten markieren ↓');
  if (!ok) document.querySelector('.mb-css')?.setAttribute('open', '');
  window.setTimeout(() => { button.textContent = original; }, 2200);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    area.remove();
    return ok;
  }
}

function toneIndex(key) {
  return ['papier', 'terrakotta', 'salbei', 'tusche'].indexOf(key);
}

/* ---------- 3D sample fan ---------- */

/*
   A colour fan: four paper cards on one hinge, splayed like a
   swatch book. The selected card swings to the front; hovering
   a tone dot lifts the matching card. Cards are real extruded
   paper with a bevel, lit flat and graphic — no bloom, no
   particles. One object, one camera.

   Everything is framed from the object's own projected corners,
   so the fan fills the card at 1440 px and at 390 px alike.
*/

function initBook() {
  const stage = document.querySelector('[data-mb-stage]');
  const mount = stage?.querySelector('[data-mb-mount]');
  if (!stage || !mount) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    if (!renderer.getContext()) return null;
  } catch (_) {
    return null;
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.domElement.style.opacity = '0';
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 80);

  scene.add(new THREE.HemisphereLight(0xfffdf7, 0xc3b59c, 1.45));
  const key = new THREE.DirectionalLight(0xfff4e2, 1.7);
  key.position.set(-3.2, 5.0, 5.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(4.8, 1.4, -3.4);
  scene.add(rim);
  const bounce = new THREE.DirectionalLight(0xffe9d2, 0.45);
  bounce.position.set(0.5, -4.0, 2.0);
  scene.add(bounce);

  /* board = the object's own frame. Tilting it gives the fan a
     little depth without turning it into a spinning widget. */
  const board = new THREE.Group();
  board.rotation.set(-0.04, -0.10, 0);
  scene.add(board);

  const CARD_W = 1.12;
  const CARD_H = 2.10;
  const THICK = 0.05;
  const HINGE_Y = -1.06;
  const SPREAD = 0.285;

  /* Pivot sits near the bottom edge: the cards fan out from the
     hand, exactly like a colour fan. */
  const fan = new THREE.Group();
  fan.position.set(0, HINGE_Y, 0);
  board.add(fan);

  const leaves = SLABS.map((spec, i) => {
    const geometry = cardGeometry(CARD_W, CARD_H, THICK, 0.06);
    const face = new THREE.MeshLambertMaterial({ color: spec.face });
    const edge = new THREE.MeshLambertMaterial({ color: spec.side });
    const mesh = new THREE.Mesh(geometry, [face, edge]);

    /* pivot owns the fan angle and the lift. The card offset lives
       on the mesh, so the two never mix in one position vector. */
    const pivot = new THREE.Group();
    const restZ = (i - 1.5) * SPREAD;
    pivot.rotation.z = restZ;
    pivot.position.z = i * 0.105;
    mesh.position.y = CARD_H / 2 + 0.02;
    pivot.add(mesh);
    fan.add(pivot);

    return {
      pivot, mesh, index: i, tone: spec.tone,
      restZ,
      restDepth: i * 0.115
    };
  });

  /* Contact shadow under the hinge. */
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W * 2.6, CARD_H * 1.1),
    new THREE.MeshBasicMaterial({
      map: shadowTexture(),
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, HINGE_Y - 0.13, 0.16);
  board.add(shadow);

  /* ---------- state ---------- */

  let active = 0;
  let hovered = -1;
  let dragY = 0;
  let dragZ = 0;
  let running = false;
  let raf = 0;
  let last = 0;
  let visible = false;

  const pointer = { down: false, x: 0, y: 0, id: null };

  size();

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) start(); else stop();
  }, { rootMargin: '140px' });
  io.observe(stage);

  new ResizeObserver(() => size()).observe(stage);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.mb-tone')) return;
    pointer.down = true;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.id = e.pointerId;
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
  });

  stage.addEventListener('pointermove', (e) => {
    if (!pointer.down) return;
    dragY = clamp(dragY + (e.clientX - pointer.x) * 0.0060, -0.6, 0.6);
    dragZ = clamp(dragZ + (e.clientY - pointer.y) * 0.0030, -0.16, 0.20);
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    schedule();
  });

  const release = () => {
    if (!pointer.down) return;
    pointer.down = false;
    try { stage.releasePointerCapture(pointer.id); } catch (_) {}
    pointer.id = null;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  /* ---------- api ---------- */

  function setTone(tone, instant) {
    const index = SLABS.findIndex((s) => s.tone === tone);
    if (index < 0) return;
    active = index;
    if (instant) {
      leaves.forEach((leaf) => {
        const t = targets(leaf);
        leaf.pivot.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
        leaf.pivot.position.set(t.position.x, t.position.y, t.position.z);
      });
    }
    if (reduce.matches) renderOnce(); else schedule();
  }

  function hover(index) {
    hovered = index;
    if (reduce.matches) renderOnce(); else schedule();
  }

  /* ---------- loop ---------- */

  function start() {
    if (!visible) return;
    running = true;
    if (reduce.matches) { renderOnce(); return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function schedule() {
    if (!running || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function renderOnce() {
    update(0, false);
    renderer.render(scene, camera);
    renderer.domElement.style.opacity = '1';
    stage.classList.add('is-live');
  }

  function tick(now) {
    raf = 0;
    if (!running) return;

    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;

    update(dt, true);
    renderer.render(scene, camera);

    if (renderer.domElement.style.opacity !== '1') renderer.domElement.style.opacity = '1';
    if (!stage.classList.contains('is-live')) stage.classList.add('is-live');

    raf = requestAnimationFrame(tick);
  }

  /* The active card stands upright and comes forward; the others
     keep their place in the fan. Values are absolute, derived
     from rest geometry, so nothing accumulates. */
  function targets(leaf) {
    const lifted = leaf.index === active;
    const near = leaf.index === hovered && !lifted;

    const position = {
      x: 0,
      y: lifted ? 0.13 : near ? 0.045 : 0,
      z: leaf.restDepth + (lifted ? 0.62 : near ? 0.14 : 0)
    };

    const rotation = {
      x: lifted ? -0.02 : 0,
      y: 0,
      z: lifted ? 0 : leaf.restZ * (near ? 0.94 : 1)
    };

    return { position, rotation };
  }

  function update(dt, animate) {
    const k = animate ? 1 - Math.pow(0.0018, dt) : 1;

    leaves.forEach((leaf) => {
      const t = targets(leaf);
      leaf.pivot.position.x += (t.position.x - leaf.pivot.position.x) * k;
      leaf.pivot.position.y += (t.position.y - leaf.pivot.position.y) * k;
      leaf.pivot.position.z += (t.position.z - leaf.pivot.position.z) * k;
      leaf.pivot.rotation.x += (t.rotation.x - leaf.pivot.rotation.x) * k;
      leaf.pivot.rotation.y += (t.rotation.y - leaf.pivot.rotation.y) * k;
      leaf.pivot.rotation.z += (t.rotation.z - leaf.pivot.rotation.z) * k;
    });

    const drift = reduce.matches ? 0 : Math.sin(performance.now() * 0.00022) * 0.055;
    const ease = animate ? 1 - Math.pow(0.004, dt) : 1;
    board.rotation.y += ((-0.10 + drift + dragY) - board.rotation.y) * ease;
    board.rotation.x += ((-0.04 + dragZ) - board.rotation.x) * ease;
  }

  /* ---------- sizing ---------- */

  function size() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;

    let dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 2);
    const maxPixels = 2600000;
    if (w * h * dpr * dpr > maxPixels) dpr = Math.sqrt(maxPixels / (w * h));

    renderer.setPixelRatio(Math.max(1, dpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    frameCamera();
    schedule();
  }

  function frameCamera() {
    board.updateWorldMatrix(true, true);

    const box = new THREE.Box3();
    leaves.forEach((leaf) => box.expandByObject(leaf.mesh));

    const center = box.getCenter(new THREE.Vector3());
    const dir = new THREE.Vector3(0.10, 0.06, 0.99).normalize();

    const corners = [];
    [box.min.x, box.max.x].forEach((x) => {
      [box.min.y, box.max.y].forEach((y) => {
        [box.min.z, box.max.z].forEach((z) => corners.push(new THREE.Vector3(x, y, z)));
      });
    });

    const margin = 0.93;
    let distance = 8;

    for (let pass = 0; pass < 4; pass += 1) {
      camera.position.copy(center).addScaledVector(dir, distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();

      let worst = 0;
      corners.forEach((corner) => {
        const p = corner.clone().project(camera);
        worst = Math.max(worst, Math.abs(p.x), Math.abs(p.y));
      });

      distance *= worst / margin;
    }

    camera.position.copy(center).addScaledVector(dir, distance);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }

  return { setTone, hover };
}

/* ---------- helpers ---------- */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}


/* A rounded paper card: an extruded rounded rectangle with a
   small bevel. Cheap (one geometry per card) and it catches the
   key light on the corner the way real paper does. */
function cardGeometry(width, height, depth, radius) {
  const w = width / 2 - radius;
  const h = height / 2 - radius;

  const shape = new THREE.Shape();
  shape.moveTo(-w, -height / 2);
  shape.lineTo(w, -height / 2);
  shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -h);
  shape.lineTo(width / 2, h);
  shape.quadraticCurveTo(width / 2, height / 2, w, height / 2);
  shape.lineTo(-w, height / 2);
  shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, h);
  shape.lineTo(-width / 2, -h);
  shape.quadraticCurveTo(-width / 2, -height / 2, -w, -height / 2);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 8
  });
  geometry.center();
  return geometry;
}

function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 124);
  gradient.addColorStop(0, 'rgba(28, 22, 14, 0.5)');
  gradient.addColorStop(0.42, 'rgba(28, 22, 14, 0.22)');
  gradient.addColorStop(1, 'rgba(28, 22, 14, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
