/* ============================================================
   BYTEWERK STUDIO — THREE-STAGE
   ------------------------------------------------------------
   A survey drawing for the shop page head: contour lines over a
   procedural terrain, plotted once from left to right.

   - three.js r180 from vendor/ (CSP: script-src 'self')
   - screen-constant line weight, one draw call
   - pointer parallax only on fine pointers
   - respects prefers-reduced-motion, pauses off-screen
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const FIELD_W = 12;
const FIELD_H = 5;
const COLS = 220;
const ROWS = 96;
const LEVELS = 14;
const LINE_PX = 1.2;

const host = document.querySelector('[data-stage="shop"]');
if (host) init(host);

function init(stage) {
  const layer = stage.querySelector('.stage-layer');
  if (!layer) return;

  let renderer;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (error) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  const canvas = renderer.domElement;
  canvas.className = 'stage-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  layer.appendChild(canvas);

  const label = document.createElement('span');
  label.className = 'stage-label';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = 'M 1:200 · SCHNITT A–A';
  layer.appendChild(label);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const group = new THREE.Group();
  scene.add(group);

  const built = buildContours();
  const geometry = built.geometry;
  const halfWidth = FIELD_W / 2;
  canvas.dataset.segments = String(built.segments);

  const uniforms = {
    uReveal: { value: reduceMotion.matches ? halfWidth + 2 : -halfWidth - 2 },
    uOpacity: { value: 1 },
    uHalfWidth: { value: 0.004 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    vertexShader: [
      'attribute vec2 aPerp;',
      'attribute float aSide;',
      'attribute float aAlpha;',
      'attribute vec3 aColor;',
      'uniform float uReveal;',
      'uniform float uHalfWidth;',
      'varying float vAlpha;',
      'varying vec3 vColor;',
      'varying float vSide;',
      'void main() {',
      '  vec3 p = position + vec3(aPerp * aSide * uHalfWidth, 0.0);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
      '  float edge = 1.0 - smoothstep(uReveal - 0.35, uReveal + 0.35, position.x);',
      '  vAlpha = aAlpha * edge;',
      '  vColor = aColor;',
      '  vSide = aSide;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying float vAlpha;',
      'varying vec3 vColor;',
      'varying float vSide;',
      'uniform float uOpacity;',
      'void main() {',
      '  float cover = 1.0 - smoothstep(0.82, 1.0, abs(vSide));',
      '  gl_FragColor = vec4(vColor, vAlpha * cover * uOpacity);',
      '  #include <colorspace_fragment>',
      '}'
    ].join('\n')
  });

  const lines = new THREE.Mesh(geometry, material);
  lines.frustumCulled = false;
  group.add(lines);

  let width = 0;
  let height = 0;
  let viewHeight = 4.2;
  let baseY = 0;
  let running = false;
  let raf = 0;
  let last = 0;
  let plotStart = 0;
  let plotted = reduceMotion.matches;
  let visible = true;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);

    const aspect = width / height;
    viewHeight = 4.2;
    const viewWidth = viewHeight * aspect;
    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();

    uniforms.uHalfWidth.value = (viewHeight / height) * (LINE_PX / 2);
    baseY = aspect < 1.15 ? -0.72 : 0;
    group.position.y = baseY;
    renderer.render(scene, camera);
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return;
    last = now;

    if (!plotted) {
      const t = Math.min(1, (now - plotStart) / 2600);
      const eased = 1 - Math.pow(1 - t, 3);
      uniforms.uReveal.value = -halfWidth - 2 + (FIELD_W + 4) * eased;
      if (t >= 1) plotted = true;
    }

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    group.position.x = pointer.x * 0.035;
    group.position.y = baseY - pointer.y * 0.02;
    group.rotation.z = Math.sin(now / 26000) * 0.0012;

    renderer.render(scene, camera);
  }

  function start() {
    if (running || reduceMotion.matches || !visible || document.hidden) return;
    running = true;
    last = 0;
    if (!plotStart) plotStart = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    window.cancelAnimationFrame(raf);
  }

  function sync() {
    if (reduceMotion.matches) {
      stop();
      uniforms.uReveal.value = halfWidth + 2;
      group.position.x = 0;
      group.position.y = baseY;
      group.rotation.z = 0;
      renderer.render(scene, camera);
      return;
    }
    if (visible && !document.hidden) start();
    else stop();
  }

  function onPointer(event) {
    if (!finePointer.matches || reduceMotion.matches) return;
    pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
  }

  resize();
  stage.classList.add('stage-ready');

  if ('ResizeObserver' in window) {
    let resizeTimer = 0;
    const observer = new ResizeObserver(function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    });
    observer.observe(stage);
  } else {
    window.addEventListener('resize', resize);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 });
    io.observe(stage);
  }

  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pointermove', onPointer, { passive: true });

  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', sync);
  }

  if (reduceMotion.matches) {
    renderer.render(scene, camera);
  } else {
    start();
  }
}

/* ---------- terrain, contours and drafting marks ---------- */

function buildContours() {
  const random = mulberry32(20261106);
  const n1 = lattice(random, 14, 8);
  const n2 = lattice(random, 28, 16);
  const n3 = lattice(random, 56, 32);

  const raw = new Float32Array(COLS * ROWS);
  const xs = new Float32Array(COLS);
  const ys = new Float32Array(ROWS);

  for (let i = 0; i < COLS; i++) xs[i] = (i / (COLS - 1) - 0.5) * FIELD_W;
  for (let j = 0; j < ROWS; j++) ys[j] = (0.5 - j / (ROWS - 1)) * FIELD_H;

  const bumps = [
    { x: 0.70, y: 0.40, a: 0.50, sx: 0.22, sy: 0.26 },
    { x: 0.62, y: 0.66, a: 0.36, sx: 0.30, sy: 0.11 },
    { x: 0.86, y: 0.72, a: 0.22, sx: 0.12, sy: 0.16 },
    { x: 0.50, y: 0.32, a: -0.18, sx: 0.15, sy: 0.18 }
  ];

  let min = Infinity;
  let max = -Infinity;

  for (let j = 0; j < ROWS; j++) {
    const v = j / (ROWS - 1);
    for (let i = 0; i < COLS; i++) {
      const u = i / (COLS - 1);
      let h = (u - 0.5) * 0.62 + (v - 0.5) * 0.22;
      for (let b = 0; b < bumps.length; b++) {
        const bump = bumps[b];
        const dx = (u - bump.x) / bump.sx;
        const dy = (v - bump.y) / bump.sy;
        h += bump.a * Math.exp(-(dx * dx + dy * dy));
      }
      h += (valueNoise(n1, u, v) - 0.5) * 0.20;
      h += (valueNoise(n2, u, v) - 0.5) * 0.10;
      h += (valueNoise(n3, u, v) - 0.5) * 0.045;
      raw[j * COLS + i] = h;
      if (h < min) min = h;
      if (h > max) max = h;
    }
  }

  const positions = [];
  const perps = [];
  const sides = [];
  const alphas = [];
  const colors = [];
  const ink = new THREE.Color(0x1f1e1d);
  const accent = new THREE.Color(0xb04f31);
  const sage = new THREE.Color(0x4f7a63);
  let segments = 0;

  function addSegment(p1, p2, alpha, color) {
    if (!p1 || !p2) return;
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.00001) return;
    const px = -dy / len;
    const py = dx / len;
    const quad = [
      [p1[0], p1[1], -1], [p1[0], p1[1], 1], [p2[0], p2[1], -1],
      [p2[0], p2[1], -1], [p1[0], p1[1], 1], [p2[0], p2[1], 1]
    ];
    for (let q = 0; q < quad.length; q++) {
      const point = quad[q];
      positions.push(point[0], point[1], 0);
      perps.push(px, py);
      sides.push(point[2]);
      alphas.push(alpha);
      colors.push(color.r, color.g, color.b);
    }
    segments++;
  }

  function edge(ax, ay, av, bx, by, bv, level) {
    const span = bv - av;
    const t = span === 0 ? 0.5 : (level - av) / span;
    return [ax + (bx - ax) * t, ay + (by - ay) * t];
  }

  const levels = [];
  for (let l = 1; l <= LEVELS; l++) {
    levels.push(min + (max - min) * (0.06 + 0.88 * (l / (LEVELS + 1))));
  }

  for (let l = 0; l < levels.length; l++) {
    const level = levels[l];
    const isAccent = l % 5 === 0;
    const color = isAccent ? accent : ink;
    const alpha = isAccent ? 0.55 : 0.33;

    for (let j = 0; j < ROWS - 1; j++) {
      const y0 = ys[j];
      const y1 = ys[j + 1];

      for (let i = 0; i < COLS - 1; i++) {
        const x0 = xs[i];
        const x1 = xs[i + 1];
        const v00 = raw[j * COLS + i];
        const v10 = raw[j * COLS + i + 1];
        const v11 = raw[(j + 1) * COLS + i + 1];
        const v01 = raw[(j + 1) * COLS + i];

        const index =
          (v00 > level ? 1 : 0) |
          (v10 > level ? 2 : 0) |
          (v11 > level ? 4 : 0) |
          (v01 > level ? 8 : 0);

        if (index === 0 || index === 15) continue;

        const b0 = index & 1;
        const b1 = index & 2;
        const b2 = index & 4;
        const b3 = index & 8;

        const eTop = b0 !== b1 ? edge(x0, y0, v00, x1, y0, v10, level) : null;
        const eRight = b1 !== b2 ? edge(x1, y0, v10, x1, y1, v11, level) : null;
        const eBottom = b3 !== b2 ? edge(x0, y1, v01, x1, y1, v11, level) : null;
        const eLeft = b0 !== b3 ? edge(x0, y0, v00, x0, y1, v01, level) : null;

        switch (index) {
          case 1:
            addSegment(eLeft, eTop, alpha, color);
            break;
          case 2:
            addSegment(eTop, eRight, alpha, color);
            break;
          case 3:
            addSegment(eLeft, eRight, alpha, color);
            break;
          case 4:
            addSegment(eRight, eBottom, alpha, color);
            break;
          case 5:
            addSegment(eLeft, eTop, alpha, color);
            addSegment(eBottom, eRight, alpha, color);
            break;
          case 6:
            addSegment(eTop, eBottom, alpha, color);
            break;
          case 7:
            addSegment(eLeft, eBottom, alpha, color);
            break;
          case 8:
            addSegment(eLeft, eBottom, alpha, color);
            break;
          case 9:
            addSegment(eTop, eBottom, alpha, color);
            break;
          case 10:
            addSegment(eLeft, eBottom, alpha, color);
            addSegment(eTop, eRight, alpha, color);
            break;
          case 11:
            addSegment(eRight, eBottom, alpha, color);
            break;
          case 12:
            addSegment(eLeft, eRight, alpha, color);
            break;
          case 13:
            addSegment(eLeft, eTop, alpha, color);
            break;
          case 14:
            addSegment(eTop, eRight, alpha, color);
            break;
          default:
            break;
        }
      }
    }
  }

  /* Section line A–A, dashed, with end ticks. */
  const sectionY = -1.62;
  const dash = 0.18;
  const gap = 0.12;
  for (let x = -4.8; x < 4.8; x += dash + gap) {
    addSegment([x, sectionY], [Math.min(x + dash, 4.8), sectionY], 0.3, sage);
  }
  addSegment([-4.8, sectionY - 0.12], [-4.8, sectionY + 0.12], 0.3, sage);
  addSegment([4.8, sectionY - 0.12], [4.8, sectionY + 0.12], 0.3, sage);

  /* Registration crosses at the sheet corners. */
  const marks = [[-4.62, -1.88], [4.62, -1.88], [-4.62, 1.88], [4.62, 1.88]];
  for (let m = 0; m < marks.length; m++) {
    const mx = marks[m][0];
    const my = marks[m][1];
    addSegment([mx - 0.12, my], [mx + 0.12, my], 0.28, sage);
    addSegment([mx, my - 0.12], [mx, my + 0.12], 0.28, sage);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aPerp', new THREE.Float32BufferAttribute(perps, 2));
  geometry.setAttribute('aSide', new THREE.Float32BufferAttribute(sides, 1));
  geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 8);

  return { geometry: geometry, segments: segments };
}

function lattice(random, nx, ny) {
  const values = new Float32Array((nx + 1) * (ny + 1));
  for (let i = 0; i < values.length; i++) values[i] = random();
  return { values: values, nx: nx, ny: ny };
}

function valueNoise(grid, u, v) {
  const fx = u * grid.nx;
  const fy = v * grid.ny;
  const x0 = Math.min(grid.nx - 1, Math.floor(fx));
  const y0 = Math.min(grid.ny - 1, Math.floor(fy));
  const tx = fx - x0;
  const ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const row = grid.nx + 1;
  const i00 = y0 * row + x0;
  const v00 = grid.values[i00];
  const v10 = grid.values[i00 + 1];
  const v01 = grid.values[i00 + row];
  const v11 = grid.values[i00 + row + 1];
  const a = v00 + (v10 - v00) * sx;
  const b = v01 + (v11 - v01) * sx;
  return a + (b - a) * sy;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
