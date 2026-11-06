/* ============================================================
   BYTEWERK STUDIO — scene-probierstand.js
   ------------------------------------------------------------
   Fig. 02: a paper workbench with four extruded tools.

   · three.js r180 from ./vendor (no CDN — CSP is script-src 'self')
   · all geometry is built in code: no models, no textures, no images
   · the bench answers to pointer hover and click, and stays in sync
     with the tab rail through the `pb:tool` event
   · 30 fps, paused off-screen and in hidden tabs, still frame when
     prefers-reduced-motion is set; without WebGL the CSS grid remains
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const host = document.querySelector('[data-bench]');
if (host) {
  boot(host);
}

function boot(host) {
  const canvas = host.querySelector('canvas');
  if (!canvas) {
    host.classList.add('is-flat');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    host.classList.add('is-flat');
    return;
  }
  if (!renderer.getContext()) {
    host.classList.add('is-flat');
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 100);
  camera.position.set(0, 0.05, 13.3);

  /* ---------------- Light ---------------- */
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd9cdb8, 1.45));
  const key = new THREE.DirectionalLight(0xfff4e4, 2.1);
  key.position.set(-4.5, 6.5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8e2, 0.7);
  fill.position.set(5, -2.5, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(0, 2, -6);
  scene.add(rim);

  /* ---------------- Palette ---------------- */
  const PAPER = 0xf4ecdc;
  const TERRACOTTA = 0xb04f31;
  const CLAY = 0xc97a5c;
  const SAGE = 0x4f7a63;
  const INK = 0x2b2825;

  const paperMat = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.94, metalness: 0 });
  const toolMats = {
    pw: new THREE.MeshStandardMaterial({ color: TERRACOTTA, roughness: 0.48, metalness: 0.04 }),
    cd: new THREE.MeshStandardMaterial({ color: INK, roughness: 0.55, metalness: 0.06 }),
    text: new THREE.MeshStandardMaterial({ color: SAGE, roughness: 0.5, metalness: 0.03 }),
    week: new THREE.MeshStandardMaterial({ color: CLAY, roughness: 0.52, metalness: 0.03 })
  };
  const detailMat = new THREE.MeshStandardMaterial({ color: 0xfff8ec, roughness: 0.6, metalness: 0 });
  const darkDetailMat = new THREE.MeshStandardMaterial({ color: 0x1f1d1b, roughness: 0.7, metalness: 0 });

  /* ---------------- Paper sheet ---------------- */
  const bench = new THREE.Group();
  bench.rotation.set(-0.10, 0, -0.012);
  scene.add(bench);

  const sheetW = 6.7;
  const sheetH = 4.7;
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(sheetW, sheetH, 0.14), paperMat);
  sheet.position.z = -0.07;
  bench.add(sheet);

  const paperTop = new THREE.Mesh(
    new THREE.PlaneGeometry(sheetW, sheetH),
    new THREE.MeshStandardMaterial({ map: paperTexture(), roughness: 0.95, metalness: 0 })
  );
  paperTop.position.z = 0.001;
  bench.add(paperTop);

  const underShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7.9, 6.0),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.36, depthWrite: false, color: 0x2f281f })
  );
  underShadow.position.set(0.2, -0.4, -0.45);
  scene.add(underShadow);

  /* ---------------- Tools ---------------- */
  const slots = [
    { tool: 'pw', x: -1.66, y: 1.02, rot: 0.09, label: 'PASSWORT' },
    { tool: 'cd', x: 1.66, y: 1.02, rot: -0.07, label: 'COUNTDOWN' },
    { tool: 'text', x: -1.66, y: -1.02, rot: -0.05, label: 'TEXT' },
    { tool: 'week', x: 1.66, y: -1.02, rot: 0.06, label: 'WOCHE' }
  ];

  const builders = { pw: buildKey, cd: buildClock, text: buildSheetDoc, week: buildCalendar };
  const tools = [];
  const hitTargets = [];

  slots.forEach(slot => {
    const root = new THREE.Group();
    root.position.set(slot.x, slot.y, 0);
    root.rotation.z = slot.rot;

    const body = builders[slot.tool](toolMats[slot.tool]);
    body.scale.setScalar(1.22);
    body.position.y = 0.18;
    root.add(body);

    const caption = makeLabel(slot.label);
    caption.position.set(0, -1.02, 0.02);
    root.add(caption);

    /* Invisible, generous hit area: small parts stay clickable. */
    const hit = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 2.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.z = 0.3;
    hit.userData.tool = slot.tool;
    root.add(hit);

    root.userData = { tool: slot.tool, lift: 0, target: 0, caption, baseY: slot.y };
    bench.add(root);
    tools.push(root);
    hitTargets.push(hit);
  });

  /* ---------------- Geometry builders ---------------- */
  function buildKey(mat) {
    const g = new THREE.Group();

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.105, 20, 44), mat);
    ring.position.x = -0.52;
    g.add(ring);

    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.15, 0.19), mat);
    shaft.position.set(0.12, 0, 0);
    g.add(shaft);

    [0.28, 0.44].forEach((x, i) => {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.24 + i * 0.06, 0.19), mat);
      tooth.position.set(x, -0.18 - i * 0.03, 0);
      g.add(tooth);
    });

    g.rotation.z = 0.16;
    return g;
  }

  function buildClock(mat) {
    const g = new THREE.Group();

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.10, 18, 52), mat);
    g.add(ring);

    const face = new THREE.Mesh(new THREE.CircleGeometry(0.46, 44), detailMat);
    face.position.z = 0.005;
    g.add(face);

    const handHour = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.26, 0.05), darkDetailMat);
    handHour.position.set(0, 0.10, 0.045);
    handHour.rotation.z = -0.5;
    g.add(handHour);

    const handMinute = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.34, 0.05), darkDetailMat);
    handMinute.position.set(0.09, 0.12, 0.05);
    handMinute.rotation.z = 0.95;
    g.add(handMinute);

    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 18), darkDetailMat);
    pin.rotation.x = Math.PI / 2;
    pin.position.z = 0.06;
    g.add(pin);

    return g;
  }

  function buildSheetDoc(mat) {
    const g = new THREE.Group();

    const shape = roundedRect(0.92, 1.16, 0.09);
    const page = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 8 }),
      mat
    );
    page.position.z = -0.03;
    g.add(page);

    [0.30, 0.12, -0.06, -0.24].forEach((y, i) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(i === 3 ? 0.36 : 0.58, 0.045, 0.03), detailMat);
      line.position.set(-0.14, y, 0.075);
      g.add(line);
    });

    const fold = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.02), detailMat);
    fold.position.set(0.33, 0.46, 0.075);
    fold.rotation.z = Math.PI / 4;
    g.add(fold);

    g.rotation.z = -0.05;
    return g;
  }

  function buildCalendar(mat) {
    const g = new THREE.Group();

    const shape = roundedRect(1.02, 0.86, 0.08);
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 8 }),
      mat
    );
    body.position.z = -0.04;
    g.add(body);

    const header = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.14, 0.03), detailMat);
    header.position.set(0, 0.29, 0.06);
    g.add(header);

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 14), detailMat);
        dot.rotation.x = Math.PI / 2;
        dot.position.set(-0.30 + col * 0.20, 0.06 - row * 0.24, 0.06);
        g.add(dot);
      }
    }

    const rings = [-0.34, 0.34].map(x => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.02, 10, 18), detailMat);
      r.position.set(x, 0.44, 0.02);
      return r;
    });
    rings.forEach(r => g.add(r));

    return g;
  }

  function roundedRect(w, h, r) {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  /* ---------------- Caption texture ---------------- */
  function makeLabel(text) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 96);
    ctx.fillStyle = 'rgba(43, 40, 37, 0.46)';
    ctx.font = '500 42px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '10px';
    ctx.fillText(text, 256, 50);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.55, 0.29),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false })
    );
    return mesh;
  }

  function paperTexture() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 720;
    const ctx = c.getContext('2d');

    const g = ctx.createLinearGradient(0, 0, 900, 720);
    g.addColorStop(0, '#fbf5e8');
    g.addColorStop(0.6, '#f6eee0');
    g.addColorStop(1, '#efe5d3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 720);

    for (let i = 0; i < 320; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 720;
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(176,79,49,0.030)' : 'rgba(90,78,60,0.035)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 14 + Math.random() * 70, y + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }

    /* Faint grid: a workbench mat, not a blank page. */
    ctx.strokeStyle = 'rgba(43,40,37,0.055)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 720); ctx.stroke();
    }
    for (let y = 0; y <= 720; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    /* Corner registration marks. */
    ctx.strokeStyle = 'rgba(176,79,49,0.30)';
    ctx.lineWidth = 1.6;
    const corners = [[34, 34, 1, 1], [990, 34, -1, 1], [34, 686, 1, -1], [990, 686, -1, -1]];
    corners.forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 16);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 16, y);
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  function shadowTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
    g.addColorStop(0, 'rgba(0,0,0,0.62)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.30)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.NoColorSpace;
    return tex;
  }

  /* ---------------- Pointer ---------------- */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);
  const tilt = { x: 0, y: 0 };
  const tiltTarget = { x: 0, y: 0 };
  let hovered = null;
  let downAt = null;

  function setPointer(event) {
    const rect = host.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  host.addEventListener('pointermove', (event) => {
    setPointer(event);
    if (!finePointer || reduceMotion) return;
    tiltTarget.x = pointer.x;
    tiltTarget.y = pointer.y;
  }, { passive: true });

  host.addEventListener('pointerleave', () => {
    pointer.set(-10, -10);
    tiltTarget.x = 0;
    tiltTarget.y = 0;
  }, { passive: true });

  host.addEventListener('pointerdown', (event) => {
    downAt = { x: event.clientX, y: event.clientY };
  }, { passive: true });

  host.addEventListener('pointerup', (event) => {
    if (!downAt) return;
    const moved = Math.abs(event.clientX - downAt.x) + Math.abs(event.clientY - downAt.y);
    downAt = null;
    if (moved > 10) return;
    setPointer(event);
    const tool = pick();
    if (tool && window.bwProbier) window.bwProbier.selectTool(tool, false);
    if (tool) nudge(tool);
  }, { passive: true });

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    return hit ? hit.object.userData.tool : null;
  }

  function setHovered(tool) {
    if (hovered === tool) return;
    hovered = tool;
    tools.forEach(t => { t.userData.target = t.userData.tool === tool ? 0.30 : 0; });
    const live = document.querySelector('[data-bench-label]');
    if (live && tool && window.bwProbier) {
      live.textContent = window.bwProbier.labels[tool] || '';
    } else if (live) {
      const selected = document.querySelector('[data-bench-pick][aria-pressed="true"] span');
      if (selected) live.textContent = selected.textContent;
    }
    if (finePointer) host.style.cursor = tool ? 'pointer' : '';
  }

  function nudge(tool) {
    const target = tools.find(t => t.userData.tool === tool);
    if (!target) return;
    target.userData.target = 0.42;
    setTimeout(() => { target.userData.target = hovered === tool ? 0.30 : 0; }, 260);
  }

  /* External selection (tab rail, deep link, language switch). */
  document.addEventListener('pb:tool', (event) => {
    const tool = event.detail && event.detail.tool;
    if (!tool) return;
    tools.forEach(t => {
      t.userData.target = t.userData.tool === tool ? 0.34 : 0;
      t.userData.selected = t.userData.tool === tool;
    });
    if (!reduceMotion) start();
    else renderOnce();
  });

  /* ---------------- Loop ---------------- */
  let running = false;
  let visible = true;
  let last = 0;
  let raf = 0;

  function renderOnce() {
    renderer.render(scene, camera);
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (now - last < 1000 / 30) return;
    last = now;

    const t = now / 1000;

    if (!reduceMotion) {
      /* Hover / pick */
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitTargets, false)[0];
      setHovered(hit ? hit.object.userData.tool : null);
    }

    tools.forEach(tool => {
      const u = tool.userData;
      u.lift += (u.target - u.lift) * 0.14;
      tool.position.z = u.lift;
      const scale = 1 + u.lift * 0.05;
      tool.scale.setScalar(scale);
      if (u.caption) u.caption.material.opacity = 0.78 + u.lift;
    });

    tilt.x += (tiltTarget.x - tilt.x) * 0.06;
    tilt.y += (tiltTarget.y - tilt.y) * 0.06;

    bench.rotation.y = tilt.x * 0.10;
    bench.rotation.x = -0.10 + tilt.y * 0.07;
    bench.position.y = reduceMotion ? 0 : Math.sin(t * 0.42) * 0.035;

    renderer.render(scene, camera);
  }

  function start() {
    if (reduceMotion) { renderOnce(); return; }
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /* ---------------- Size ---------------- */
  function resize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1 ? 15.6 : 13.3;
    camera.updateProjectionMatrix();
    renderOnce();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(host);
  } else {
    window.addEventListener('resize', resize, { passive: true });
    resize();
  }

  /* ---------------- Visibility ---------------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      });
    }, { threshold: 0.05 });
    io.observe(host);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  /* ---------------- Boot ---------------- */
  resize();

  if (reduceMotion) {
    renderOnce();
  } else {
    start();
  }
}
