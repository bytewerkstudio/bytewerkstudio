/* ============================================================
   BYTEWERK STUDIO — three-hero.js
   ------------------------------------------------------------
   "Papiergewebe": a woven paper cloth rendered with three.js.
   Warp and weft ribbons are swept along a soft paper surface,
   alternating over and under like a real weave. Warm studio
   light, paper fog, a single terracotta thread stitched across.

   The four disciplines in the hero panel lift their accent
   thread on hover or focus.

   Rules:
   - local three.js build only (CSP: script-src 'self')
   - prefers-reduced-motion: static still, no idle motion
   - pauses off-screen and in hidden tabs
   - no WebGL: .is-fallback keeps the CSS still life
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const stage = document.querySelector('[data-hero3d]');
if (stage) boot(stage);

function boot(stage) {
  const view = stage.querySelector('.hero3d-view');
  const canvas = stage.querySelector('.hero3d-canvas');
  if (!view || !canvas) return;

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = reduceMQ.matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    stage.classList.add('is-fallback');
    return;
  }
  if (!renderer || !renderer.getContext()) {
    stage.classList.add('is-fallback');
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  scene.environment = makeEnvironment(renderer);

  /* ---------- light ---------- */
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0x5d5247, 0.42));

  const key = new THREE.DirectionalLight(0xffedd2, 0.82);
  key.position.set(-5, 6.5, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -5.5;
  key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 26;
  key.shadow.bias = -0.0007;
  key.shadow.radius = 4;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc3d6c8, 0.16);
  fill.position.set(6, -1.5, 4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd2b6, 0.26);
  rim.position.set(2.5, 4.5, -6);
  scene.add(rim);

  /* ---------- shadow catcher ---------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12),
    new THREE.ShadowMaterial({ color: 0x3b3229, opacity: 0.3 })
  );
  ground.position.set(0, -0.25, -1.7);
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- paper palette ---------- */
  const COLORS = {
    paper: 0xcdb488,
    paperDeep: 0xa98c63,
    cream: 0xe8d9bd,
    terra: 0x8f3720,
    terraLight: 0xac5236,
    sage: 0x43604b,
    ink: 0x211f1c
  };

  function ribbonMaterial(hex) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.86,
      metalness: 0.0,
      side: THREE.DoubleSide,
      vertexColors: true,
      envMapIntensity: 0.22,
      emissive: new THREE.Color(hex),
      emissiveIntensity: 0
    });
  }

  const matPaper = ribbonMaterial(COLORS.paper);
  const matPaperDeep = ribbonMaterial(COLORS.paperDeep);
  const matCream = ribbonMaterial(COLORS.cream);

  /* ---------- geometry helpers ---------- */
  const HW = 2.4;   /* half width  */
  const HH = 1.45;  /* half height */
  const COLS = 9;
  const ROWS = 6;
  const WARP_STEP = (HW * 2) / (COLS - 1);
  const WEFT_STEP = (HH * 2) / (ROWS - 1);
  const WEAVE = 0.14;

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const tmpC = new THREE.Vector3();
  const tmpD = new THREE.Vector3();

  /* A soft sheet: gentle dome plus a slow wave. Edges droop away. */
  function surface(u, v, out) {
    const over = Math.max(0, Math.abs(v) - 1);
    const side = Math.max(0, Math.abs(u) - 1);
    const droop = over * over * 0.42 + side * side * 0.4;
    return out.set(
      u * HW + Math.sign(u || 1) * side * side * 0.16,
      v * HH,
      0.62 * Math.cos(u * Math.PI * 0.5) * Math.cos(v * Math.PI * 0.5) +
        0.2 * Math.sin(u * 2.3 + 0.6) * Math.cos(v * 2.4) -
        droop
    );
  }

  function surfaceNormal(u, v, out) {
    const e = 0.01;
    surface(u + e, v, tmpA);
    surface(u - e, v, tmpB);
    surface(u, v + e, tmpC);
    surface(u, v - e, tmpD);
    out.copy(tmpA).sub(tmpB).cross(tmpC.sub(tmpD)).normalize();
    return out;
  }

  function warpPoint(u, i, v, out) {
    surface(u, v, out);
    out.z += Math.cos((Math.PI * (v * HH)) / WEFT_STEP + (i % 2 ? Math.PI : 0)) * WEAVE;
    return out;
  }

  function weftPoint(v, j, u, out) {
    surface(u, v, out);
    out.z += Math.cos((Math.PI * (u * HW)) / WARP_STEP + (j % 2 ? Math.PI : 0)) * WEAVE;
    return out;
  }

  /* Sweep a flat rectangular strip along a curve. */
  function ribbonGeometry(pointAt, normalAt, samples, width, thickness) {
    const positions = new Float32Array(samples * 4 * 3);
    const indices = [];
    const p = new THREE.Vector3();
    const pa = new THREE.Vector3();
    const pb = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const nor = new THREE.Vector3();
    const bin = new THREE.Vector3();
    const up = new THREE.Vector3();
    const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    const hw = width / 2;
    const ht = thickness / 2;
    let o = 0;

    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      pointAt(t, p);
      const e = 0.004;
      pointAt(Math.max(0, t - e), pa);
      pointAt(Math.min(1, t + e), pb);
      tan.subVectors(pb, pa).normalize();
      normalAt(t, nor);
      nor.addScaledVector(tan, -nor.dot(tan)).normalize();
      bin.crossVectors(tan, nor).normalize();
      up.crossVectors(bin, tan).normalize();

      for (let k = 0; k < 4; k++) {
        const cw = corners[k][0] * hw;
        const ch = corners[k][1] * ht;
        positions[o++] = p.x + bin.x * cw + up.x * ch;
        positions[o++] = p.y + bin.y * cw + up.y * ch;
        positions[o++] = p.z + bin.z * cw + up.z * ch;
      }
    }

    for (let i = 0; i < samples - 1; i++) {
      for (let k = 0; k < 4; k++) {
        const a = i * 4 + k;
        const b = i * 4 + ((k + 1) % 4);
        const c = (i + 1) * 4 + ((k + 1) % 4);
        const d = (i + 1) * 4 + k;
        indices.push(a, b, c, a, c, d);
      }
    }

    const last = (samples - 1) * 4;
    indices.push(0, 2, 1, 0, 3, 2);
    indices.push(last, last + 1, last + 2, last, last + 2, last + 3);

    /* bake a light/shadow gradient into the vertices so the
       over-under relief reads even under soft studio light */
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (let i = 2; i < positions.length; i += 3) {
      if (positions[i] < minZ) minZ = positions[i];
      if (positions[i] > maxZ) maxZ = positions[i];
    }
    const span = Math.max(0.0001, maxZ - minZ);
    const colors = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      const k = (positions[i + 2] - minZ) / span;
      const shade = 0.55 + k * 0.45;
      colors[i] = colors[i + 1] = colors[i + 2] = shade;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function frac(n) {
    return n - Math.floor(n);
  }

  /* ---------- the cloth ---------- */
  const root = new THREE.Group();
  root.rotation.set(-0.46, -0.34, 0.09);
  scene.add(root);

  const cloth = new THREE.Group();
  root.add(cloth);

  const DISCIPLINES = [
    { color: COLORS.terra },
    { color: COLORS.sage },
    { color: COLORS.terraLight },
    { color: COLORS.ink }
  ];
  const bandIndex = { 1: 0, 3: 1, 5: 2, 7: 3 };
  const bands = [];

  for (let i = 0; i < COLS; i++) {
    const u = -1 + (2 * i) / (COLS - 1);
    const band = bandIndex[i];
    const material = band !== undefined
      ? ribbonMaterial(DISCIPLINES[band].color)
      : (i % 4 === 2 ? matPaperDeep : matPaper);
    const width = band !== undefined ? 0.15 : 0.46;

    const end = 1.18 + frac(i * 0.618) * 0.16;
    const start = -(1.16 + frac(i * 0.414) * 0.14);

    const geo = ribbonGeometry(
      (t, out) => warpPoint(u, i, start + t * (end - start), out),
      (t, out) => surfaceNormal(u, start + t * (end - start), out),
      54, width, 0.09
    );
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    cloth.add(mesh);

    if (band !== undefined) {
      bands[band] = { mesh: mesh, material: material };
    }
  }

  for (let j = 0; j < ROWS; j++) {
    const v = -1 + (2 * j) / (ROWS - 1);
    const material = j === 3 ? matPaperDeep : (j % 2 === 0 ? matCream : matPaper);
    const geo = ribbonGeometry(
      (t, out) => weftPoint(v, j, -1.2 + t * 2.4, out),
      (t, out) => surfaceNormal(-1.2 + t * 2.4, v, out),
      46, 0.44, 0.085
    );
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    cloth.add(mesh);
  }

  /* one terracotta thread stitched across the weave */
  (function stitch() {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const u = -1.08 + (2.16 * i) / 60;
      const v = 0.62 * Math.sin(u * 2.5 + 0.45);
      const p = new THREE.Vector3();
      surface(u, v, p);
      p.z += 0.09;
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 90, 0.0115, 5, false);
    const mesh = new THREE.Mesh(geo, ribbonMaterial(COLORS.terra));
    mesh.castShadow = true;
    cloth.add(mesh);
  })();

  /* a small sage thread near the lower edge */
  (function stitchTwo() {
    const pts = [];
    for (let i = 0; i <= 34; i++) {
      const u = -0.9 + (1.5 * i) / 34;
      const v = -0.82 + 0.1 * Math.sin(u * 3.4);
      const p = new THREE.Vector3();
      surface(u, v, p);
      p.z += 0.085;
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 50, 0.009, 5, false);
    cloth.add(new THREE.Mesh(geo, ribbonMaterial(COLORS.sage)));
  })();

  /* ---------- sizing ---------- */
  const FIT_W = 5.2;
  const FIT_H = 3.55;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function size() {
    width = view.clientWidth;
    height = view.clientHeight;
    if (!width || !height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    if (width * height * dpr * dpr > 2600000) {
      dpr = Math.sqrt(2600000 / (width * height));
    }
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    const vFov = (camera.fov * Math.PI) / 180;
    const fitH = FIT_H / 2 / Math.tan(vFov / 2);
    const fitW = FIT_W / 2 / (Math.tan(vFov / 2) * camera.aspect);
    camera.position.z = Math.max(fitH, fitW);
    camera.updateProjectionMatrix();

    renderFrame();
  }

  /* ---------- interaction ---------- */
  const state = {
    px: 0,
    py: 0,
    dragX: 0,
    dragY: 0,
    velocity: 0,
    hover: -1,
    touched: false
  };
  const BASE_X = -0.46;
  const BASE_Y = -0.34;
  const MAX_DRAG_X = 0.42;
  const MAX_DRAG_Y = 0.75;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastMove = 0;

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMove = performance.now();
    stage.classList.add('is-dragging');
    stage.classList.add('is-touched');
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
  });

  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    if (!dragging) {
      state.px = ((e.clientX - r.left) / r.width) * 2 - 1;
      state.py = ((e.clientY - r.top) / r.height) * 2 - 1;
      return;
    }
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    state.dragY = clamp(state.dragY + dx * 0.006, -MAX_DRAG_Y, MAX_DRAG_Y);
    state.dragX = clamp(state.dragX + dy * 0.004, -MAX_DRAG_X, MAX_DRAG_X);
    state.velocity = dx * 0.0016;
    lastMove = performance.now();
  });

  function release(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    if (performance.now() - lastMove > 120) state.velocity = 0;
    try { stage.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  stage.addEventListener('pointerleave', () => {
    if (!dragging) {
      state.px = 0;
      state.py = 0;
    }
  });

  stage.addEventListener('dblclick', () => {
    state.dragX = 0;
    state.dragY = 0;
    state.velocity = 0;
  });

  const panelItems = Array.prototype.slice.call(
    document.querySelectorAll('.hero-v3-panel .ed-idx')
  );
  panelItems.forEach((el, i) => {
    if (i > 3) return;
    const on = () => { state.hover = i; };
    const off = () => { if (state.hover === i) state.hover = -1; };
    el.addEventListener('pointerenter', on);
    el.addEventListener('pointerleave', off);
    el.addEventListener('focus', on);
    el.addEventListener('blur', off);
  });

  /* ---------- render ---------- */
  let raf = 0;
  let last = 0;
  let clock = 0;
  let visible = true;

  function renderFrame(dt) {
    const step = dt || 0.016;
    clock += reduce ? 0 : step;

    if (!reduce) {
      const idleY = Math.sin(clock * 0.16) * 0.055;
      const targetY = BASE_Y + state.px * 0.18 + state.dragY + idleY;
      const targetX = BASE_X + state.py * 0.1 + state.dragX;
      const ease = 1 - Math.exp(-step * 6);
      root.rotation.y += (targetY - root.rotation.y) * ease;
      root.rotation.x += (targetX - root.rotation.x) * ease;
      const breath = 1 + Math.sin(clock * 0.32) * 0.006;
      root.scale.setScalar(breath);
    } else {
      root.rotation.y = BASE_Y + state.dragY;
      root.rotation.x = BASE_X + state.dragX;
    }

    for (let i = 0; i < bands.length; i++) {
      const band = bands[i];
      if (!band) continue;
      const active = state.hover === i;
      band.mesh.position.z += ((active ? 0.16 : 0) - band.mesh.position.z) * 0.12;
      band.material.emissiveIntensity +=
        ((active ? 0.3 : 0) - band.material.emissiveIntensity) * 0.12;
    }

    renderer.render(scene, camera);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;

    if (state.velocity !== 0) {
      state.dragY = clamp(state.dragY + state.velocity, -MAX_DRAG_Y, MAX_DRAG_Y);
      state.velocity *= 0.94;
      if (Math.abs(state.velocity) < 0.0002) state.velocity = 0;
    }

    renderFrame(dt);
  }

  function start() {
    if (raf || reduce || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function syncMotion() {
    if (reduce) {
      stop();
      renderFrame();
    } else if (visible && !document.hidden) {
      start();
    } else {
      stop();
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      syncMotion();
    }, { threshold: 0.02 });
    io.observe(stage);
  }

  document.addEventListener('visibilitychange', syncMotion);

  if (typeof reduceMQ.addEventListener === 'function') {
    reduceMQ.addEventListener('change', (e) => {
      reduce = e.matches;
      renderFrame();
      syncMotion();
    });
  }

  let resizeTimer = 0;
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 60);
    });
    ro.observe(view);
  } else {
    window.addEventListener('resize', size);
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    stage.classList.add('is-fallback');
  });

  /* first paint */
  size();
  renderer.render(scene, camera);
  stage.classList.add('is-ready');
  syncMotion();

  function makeEnvironment(renderer) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const g = c.getContext('2d');

    const base = g.createLinearGradient(0, 0, 0, 256);
    base.addColorStop(0, '#fffaf0');
    base.addColorStop(0.42, '#f4ead8');
    base.addColorStop(0.72, '#d9cbb6');
    base.addColorStop(1, '#8f8578');
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 256);

    let glow = g.createRadialGradient(120, 54, 6, 120, 54, 150);
    glow.addColorStop(0, 'rgba(255, 236, 207, 0.95)');
    glow.addColorStop(1, 'rgba(255, 236, 207, 0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, 512, 256);

    glow = g.createRadialGradient(430, 120, 10, 430, 120, 170);
    glow.addColorStop(0, 'rgba(196, 214, 201, 0.55)');
    glow.addColorStop(1, 'rgba(196, 214, 201, 0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, 512, 256);

    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const target = pmrem.fromEquirectangular(tex);
    tex.dispose();
    pmrem.dispose();
    return target.texture;
  }
}
