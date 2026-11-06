/* ============================================================
   BYTEWERK STUDIO — scene-studio.js
   ------------------------------------------------------------
   Hero stage: a physical model of a digital product.
   Layers (data, logic, interface) plus app shell and product
   blocks, drawn with three.js in the studio's paper/terracotta
   palette.

   - Local three.js build (CSP: script-src 'self')
   - Progressive: without WebGL the SVG exploded view stays
   - Hover/keyboard on the discipline list moves the model
   - Drag to orbit, button toggles the exploded view
   - Pauses off-screen, respects prefers-reduced-motion
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const stage = document.getElementById('studio-stage');
if (stage) boot();

function boot() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let canvas;
  let renderer;
  try {
    canvas = document.createElement('canvas');
    if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  canvas.className = 'bs-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  stage.classList.add('is-live');

  /* ---------- Scene ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  camera.position.set(3.65, 3.65, 5.0);
  camera.lookAt(0, 0.82, 0);

  scene.add(new THREE.HemisphereLight(0xfff8ec, 0xd6ccb8, 0.95));

  const key = new THREE.DirectionalLight(0xfff2de, 2.15);
  key.position.set(5.4, 8.2, 5.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 3;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe6eeff, 0.6);
  fill.position.set(-6.5, 3.4, -4.2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.45);
  rim.position.set(-2.5, 2.2, 7);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ color: 0x2b2822, opacity: 0.20 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  /* ---------- Materials ---------- */
  const mat = (color, roughness, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const PAPERS = {
    plinth: mat(0xe4dac6, 0.96),
    paper2: mat(0xf7f2e7, 0.95),
    data: mat(0xf4eddc, 0.94),
    ui: mat(0xfdfaf2, 0.88),
    terracotta: mat(0xb8573a, 0.62),
    terracottaDeep: mat(0x8f3f27, 0.7),
    ink: mat(0x2b2822, 0.58, 0.12),
    olive: mat(0x4f7a63, 0.62),
    brass: mat(0xb08d57, 0.34, 0.62),
  };

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x2b2822,
    transparent: true,
    opacity: 0.16,
  });
  const edgeMatHot = new THREE.LineBasicMaterial({
    color: 0x8f3f27,
    transparent: true,
    opacity: 0.55,
  });

  /* ---------- Geometry helpers ---------- */
  function roundedShape(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    const rr = Math.max(0.001, Math.min(r, Math.min(w, h) / 2));
    shape.moveTo(x + rr, y);
    shape.lineTo(x + w - rr, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + rr);
    shape.lineTo(x + w, y + h - rr);
    shape.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    shape.lineTo(x + rr, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - rr);
    shape.lineTo(x, y + rr);
    shape.quadraticCurveTo(x, y, x + rr, y);
    return shape;
  }

  function extrude(shape, depth, bevel) {
    return new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, depth - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 6,
      steps: 1,
    });
  }

  // Flat slab: w along X, d along Z, thickness t along Y, bottom at y = 0.
  function slabGeo(w, d, t, r) {
    const b = Math.min(0.02, t * 0.3, w * 0.02);
    const geo = extrude(roundedShape(w - b * 2, d - b * 2, r - b), t, b);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, b, 0);
    return geo;
  }

  // Standing panel in the XY plane, thickness along Z, centred.
  function panelGeo(w, h, t, r) {
    const b = Math.min(0.018, t * 0.3, w * 0.02);
    const geo = extrude(roundedShape(w - b * 2, h - b * 2, r - b), t, b);
    geo.translate(0, 0, -t / 2 + b);
    return geo;
  }

  function mesh(geo, material, edges = true) {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    m.receiveShadow = true;
    if (edges) {
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 24), edgeMat));
    }
    return m;
  }

  /* ---------- Textures drawn in code ---------- */
  function dotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(110,100,82,0.55)';
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        ctx.beginPath();
        ctx.arc(8 + i * 16, 8 + j * 16, 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  function planTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(31,30,29,0.13)';
    ctx.lineWidth = 1;
    for (let i = 32; i < 512; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }

    // A quiet floor plan: rooms, a corridor, one solid core.
    ctx.strokeStyle = 'rgba(31,30,29,0.32)';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, 432, 432);
    ctx.beginPath();
    ctx.moveTo(40, 250); ctx.lineTo(300, 250); ctx.lineTo(300, 472);
    ctx.moveTo(300, 120); ctx.lineTo(472, 120); ctx.lineTo(472, 250);
    ctx.stroke();

    ctx.fillStyle = 'rgba(176,79,49,0.55)';
    ctx.fillRect(72, 72, 96, 96);
    ctx.fillStyle = 'rgba(79,122,99,0.45)';
    ctx.fillRect(330, 290, 112, 112);
    ctx.fillStyle = 'rgba(31,30,29,0.14)';
    ctx.fillRect(72, 300, 150, 62);
    ctx.fillRect(330, 150, 110, 60);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  /* ---------- Parts ---------- */
  // One small massing model: plinth, software tower, web deck,
  // app shell and product blocks. Each volume maps to a discipline.
  const model = new THREE.Group();
  model.rotation.y = -0.30;
  scene.add(model);

  const parts = [];
  function addPart(id, index, object, base, explode) {
    object.position.set(base[0], base[1], base[2]);
    object.userData.part = { id, index, base: new THREE.Vector3(...base), explode: new THREE.Vector3(...explode), lift: 0, liftTarget: 0 };
    model.add(object);
    parts.push(object);
    return object;
  }

  function tagMeshes(object, part) {
    object.traverse((o) => { if (o.isMesh) o.userData.part = part; });
    return object;
  }

  // Plinth with a thin step.
  const base = new THREE.Group();
  base.add(mesh(slabGeo(3.40, 2.60, 0.26, 0.10), PAPERS.plinth));
  const step = mesh(slabGeo(3.06, 2.28, 0.05, 0.07), PAPERS.paper2);
  step.position.y = 0.245;
  base.add(step);
  addPart('base', -1, base, [0, 0, 0], [0, 0, 0]);

  // 01 Software: a tall terracotta volume with a small roof block.
  const software = new THREE.Group();
  software.add(mesh(slabGeo(0.94, 0.94, 1.42, 0.05), PAPERS.terracotta));
  const roof = mesh(slabGeo(0.48, 0.42, 0.20, 0.04), PAPERS.ui);
  roof.position.set(-0.13, 1.42, 0.11);
  software.add(roof);
  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.30, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x8f3f27, roughness: 0.7 })
  );
  seam.position.set(0.44, 0.72, 0.44);
  software.add(seam);
  addPart('software', 0, software, [-1.02, 0.295, -0.58], [-0.26, 0.86, -0.10]);

  // 02 Web: a wide deck with a floor plan drawn on top.
  const web = new THREE.Group();
  web.add(mesh(slabGeo(1.56, 1.08, 0.40, 0.06), PAPERS.data));
  const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(1.40, 0.94),
    new THREE.MeshBasicMaterial({ map: planTexture(), transparent: true, opacity: 0.8 })
  );
  plan.rotation.x = -Math.PI / 2;
  plan.position.y = 0.401;
  web.add(plan);
  const lip = mesh(slabGeo(1.56, 0.07, 0.07, 0.02), PAPERS.terracottaDeep);
  lip.position.set(0, 0.40, 0.505);
  web.add(lip);
  addPart('web', 1, web, [0.42, 0.295, 0.52], [0.12, 0.46, 0.22]);

  // 03 Apps: a standing device shell with a warm screen.
  const apps = new THREE.Group();
  apps.add(mesh(panelGeo(0.84, 1.14, 0.10, 0.10), PAPERS.ink));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 0.94),
    new THREE.MeshStandardMaterial({ color: 0xf7f1e4, roughness: 0.9 })
  );
  screen.position.z = 0.052;
  apps.add(screen);
  const screenBar = new THREE.Mesh(
    new THREE.PlaneGeometry(0.40, 0.04),
    new THREE.MeshBasicMaterial({ color: 0xb04f31, transparent: true, opacity: 0.9 })
  );
  screenBar.position.set(-0.11, 0.29, 0.053);
  apps.add(screenBar);
  const screenBlock = new THREE.Mesh(
    new THREE.PlaneGeometry(0.40, 0.24),
    new THREE.MeshBasicMaterial({ color: 0x4f7a63, transparent: true, opacity: 0.35 })
  );
  screenBlock.position.set(-0.11, -0.06, 0.053);
  apps.add(screenBlock);
  apps.rotation.set(0.02, -0.44, 0.035);
  addPart('apps', 2, apps, [1.04, 0.295 + 0.57, -0.66], [0.44, 0.86, -0.16]);

  // 04 Products: a small cluster of blocks.
  const products = new THREE.Group();
  const blocks = [
    [1.34, 0.44, 0.42, PAPERS.brass, 0.30],
    [1.48, -0.08, 0.32, PAPERS.olive, 0.08],
    [-0.55, 0.06, 0.28, PAPERS.terracottaDeep, 0.55],
  ];
  blocks.forEach(([x, z, s, material, rot]) => {
    const b = mesh(slabGeo(s, s, s * 0.92, s * 0.14), material);
    b.position.set(x, 0, z);
    b.rotation.y = rot;
    products.add(b);
  });
  addPart('products', 3, products, [0, 0.295, 0], [0.32, 0.74, 0.26]);

  // Tag every mesh with its part record for picking.
  parts.forEach((p) => tagMeshes(p, p.userData.part));

  /* ---------- Picking / panel link ---------- */
  const panelRows = Array.from(document.querySelectorAll('.hero-v3-panel .ed-idx'));
  const hudIndex = stage.querySelector('.bs-hud b');
  const hudLabel = stage.querySelector('.bs-hud span');
  const hudIdleDe = hudLabel ? (hudLabel.dataset.de || hudLabel.textContent) : '';
  const hudIdleEn = hudLabel ? (hudLabel.dataset.en || hudIdleDe) : '';
  const hudIdle = () => (document.documentElement.lang === 'en' ? hudIdleEn : hudIdleDe);
  const toggle = stage.querySelector('[data-bs-toggle]');

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(2, 2);
  const pickables = [];
  parts.forEach((p) => p.traverse((o) => { if (o.isMesh && o.geometry.type !== 'PlaneGeometry') pickables.push(o); }));

  const setHud = (index) => {
    if (!hudIndex || !hudLabel) return;
    if (index < 0) {
      hudIndex.textContent = '00';
      hudLabel.textContent = hudIdle();
      return;
    }
    const row = panelRows[index];
    const name = row ? (row.querySelector('.t > span')?.textContent || '').trim() : '';
    const num = row ? (row.querySelector('.n')?.textContent || '').trim() : '';
    hudIndex.textContent = num || String(index + 1).padStart(2, '0');
    hudLabel.textContent = name || hudIdle();
  };

  let activePart = -1;
  document.addEventListener('bw:lang', () => setHud(activePart));

  const setHover = (index) => {
    activePart = index;
    parts.forEach((p) => {
      const it = p.userData.part;
      it.liftTarget = (it.index >= 0 && it.index === index) ? 1 : 0;
      p.traverse((o) => {
        if (o.isLineSegments) o.material = (it.index >= 0 && it.index === index) ? edgeMatHot : edgeMat;
      });
    });
    panelRows.forEach((row, i) => row.classList.toggle('is-bs', i === index));
    setHud(index);
  };

  panelRows.forEach((row, i) => {
    row.addEventListener('mouseenter', () => setHover(i));
    row.addEventListener('focus', () => setHover(i));
    row.addEventListener('mouseleave', () => setHover(-1));
    row.addEventListener('blur', () => setHover(-1));
  });

  let hovered = -1;
  let pointerInside = false;
  const pick = () => {
    if (!pointerInside || dragMoved) return;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    const index = hit && hit.object.userData.part ? hit.object.userData.part.index : -1;
    if (index !== hovered) {
      hovered = index;
      setHover(index);
    }
  };

  /* ---------- Drag to orbit ---------- */
  let dragging = false;
  let dragStart = 0;
  let dragDelta = 0;
  let userSpin = 0;
  let dragMoved = false;

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a')) return;
    dragging = true;
    dragMoved = false;
    dragStart = e.clientX;
    stage.classList.add('is-dragging');
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    stage.classList.remove('is-dragging');
    setTimeout(() => { dragMoved = false; }, 0);
  });
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointerInside = true;
    if (dragging) {
      dragDelta = e.clientX - dragStart;
      userSpin += dragDelta * 0.005;
      userSpin = Math.max(-1.1, Math.min(1.1, userSpin));
      dragStart = e.clientX;
      if (Math.abs(dragDelta) > 2) dragMoved = true;
    }
    pick();
  });
  stage.addEventListener('pointerleave', () => {
    pointerInside = false;
    pointer.set(0, 0);
    if (hovered !== -1) { hovered = -1; setHover(-1); }
  });

  /* ---------- Exploded view ---------- */
  let explodeTarget = reduceMotion ? 0 : 1;
  let explode = explodeTarget;
  if (toggle) {
    toggle.setAttribute('aria-pressed', 'false');
    toggle.addEventListener('click', () => {
      const on = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(on));
      explodeTarget = on ? 1 : 0;
    });
  }

  /* ---------- Sizing ---------- */
  const resize = () => {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    camera.aspect = r.width / r.height;
    // Keep the whole model in frame on narrow stages.
    const fit = Math.max(1, 1.18 / camera.aspect);
    camera.position.set(3.65 * fit, 3.65 * fit, 5.0 * fit);
    camera.lookAt(0, 0.82, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(Math.round(r.width), Math.round(r.height), false);
  };
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);

  /* ---------- Loop ---------- */
  const clock = new THREE.Clock();
  let visible = false;
  let started = false;
  let raf = 0;
  let spin = 0;
  let pointerX = 0;
  let pointerY = 0;

  const render = () => {
    raf = requestAnimationFrame(render);
    const dt = Math.min(0.05, clock.getDelta());

    // intro: model assembles when it enters the viewport
    if (visible && !started && !reduceMotion) {
      started = true;
      explodeTarget = 0;
    }

    explode += (explodeTarget - explode) * Math.min(1, dt * 4.2);

    pointerX += (pointer.x * 0.16 - pointerX) * Math.min(1, dt * 5);
    pointerY += (pointer.y * 0.055 - pointerY) * Math.min(1, dt * 5);
    if (!dragging) userSpin *= (1 - Math.min(1, dt * 0.9));
    if (!reduceMotion) spin += dt * 0.045;

    model.rotation.y = -0.34 + spin + userSpin + pointerX;
    model.rotation.x = pointerY * 0.6;
    model.position.y = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.55) * 0.014;

    parts.forEach((p) => {
      const it = p.userData.part;
      it.lift += (it.liftTarget - it.lift) * Math.min(1, dt * 7);
      p.position.set(
        it.base.x + it.explode.x * explode,
        it.base.y + it.explode.y * explode + it.lift * 0.11,
        it.base.z + it.explode.z * explode
      );
    });

    renderer.render(scene, camera);
  };

  const start = () => {
    if (raf) return;
    clock.getDelta();
    render();
  };
  const stop = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  // Draw a first frame right away: a stage that waits for an observer
  // callback can stay blank if the callback is throttled.
  visible = true;
  start();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      const e = entries[0];
      visible = e.isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: '120px' }).observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    stop();
    stage.classList.remove('is-live');
    document.documentElement.classList.add('no-webgl');
  });

  if (location.search.indexOf('bsdebug') >= 0) {
    window.__bs = { THREE, scene, camera, renderer, model, parts, stage, start, stop, state: () => ({ visible, started, raf, explode, explodeTarget }) };
  }

  // Reduced motion: one static frame, no loop.
  if (reduceMotion) {
    visible = true;
    resize();
    renderer.render(scene, camera);
  }
}
