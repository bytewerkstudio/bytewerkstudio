/* ============================================================
   BYTEWERK STUDIO — PRODUKTBÜHNE
   ------------------------------------------------------------
   Prozedurale 3D-Bühne für die Produktseiten mit Logo-Hero.
   Kein Build, kein Netzwerk: three.js liegt lokal unter vendor/.
   Die CSP der Seiten erlaubt nur script-src 'self'.

   Verhalten
   - Ohne JavaScript, ohne WebGL oder bei Fehlern bleibt das
     bisherige Logo-Panel unverändert stehen.
   - prefers-reduced-motion: ein stehendes Bild statt Animation.
   - Pause außerhalb des Viewports und bei verstecktem Tab.
   - Zeiger bewegt die Bühne leicht, Ziehen dreht sie.

   Datenvertrag
   <div class="pd-hero app-mark-panel" data-buehne="lernreich">
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const C = {
  paper: 0xefe4cd,
  paper2: 0xe0d0b2,
  paper3: 0xcfbd9c,
  ink: 0x2b2722,
  accent: 0xb04f31,
  accent2: 0xc97a5c,
  sage: 0x4f7a63
};

/* ---------- Geometrie-Helfer ---------- */

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.min(r, Math.min(w, h) / 2 - 0.02);
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  s.closePath();
  return s;
}

/* Flache Platte mit weicher Fase, Dicke entlang +Y. */
function slab(w, h, depth, radius) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, radius), {
    depth: depth,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function mat(color, extra) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: color,
    roughness: 0.9,
    metalness: 0.0
  }, extra || {}));
}

function plate(w, h, depth, radius, color) {
  return new THREE.Mesh(slab(w, h, depth, radius), mat(color));
}

/* Weicher Kontaktschatten als Canvas-Textur, kein Shadow-Map-Aufwand. */
function shadowTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(58, 44, 30, 0.42)');
  g.addColorStop(0.55, 'rgba(58, 44, 30, 0.16)');
  g.addColorStop(1, 'rgba(58, 44, 30, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- Die fünf Bühnen ---------- */

function stageLernreich() {
  const g = new THREE.Group();
  const cards = [
    C.paper3, C.paper2, C.paper, C.paper, C.paper
  ];
  for (let i = 0; i < 5; i++) {
    const card = plate(1.85, 2.45, 0.05, 0.1, cards[i]);
    card.position.set((i - 2) * 0.075, i * 0.07, (i - 2) * 0.05);
    card.rotation.y = (i - 2) * 0.13;
    g.add(card);
  }
  /* Lesezeichen aus Terrakotta auf der obersten Karte */
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.018, 0.62), mat(C.accent, { roughness: 0.75 }));
  ribbon.position.set(0.66, 0.355, -0.54);
  ribbon.rotation.y = 0.26;
  g.add(ribbon);

  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.016, 28), mat(C.sage));
  dot.position.set(-0.3, 0.36, 0.6);
  dot.rotation.y = 0.26;
  g.add(dot);
  return g;
}

function stageUpdatepilot() {
  const g = new THREE.Group();

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.44, 40, 28), mat(C.paper));
  core.position.y = 0.52;
  g.add(core);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.034, 18, 96), mat(C.accent, { roughness: 0.7 }));
  ring1.position.y = 0.52;
  ring1.rotation.x = Math.PI / 2 - 0.32;
  ring1.rotation.z = 0.22;
  g.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.028, 18, 96), mat(C.paper3));
  ring2.position.y = 0.52;
  ring2.rotation.x = 0.18;
  ring2.rotation.y = 0.55;
  g.add(ring2);

  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.02, 14, 96), mat(C.sage, { roughness: 0.8 }));
  ring3.position.y = 0.52;
  ring3.rotation.x = 1.18;
  ring3.rotation.z = -0.4;
  g.add(ring3);

  /* kleine Marke auf der Bahn */
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), mat(C.accent2));
  moon.position.set(0.72, 0.52, 0.3);
  g.add(moon);

  return g;
}

function stagePdf() {
  const g = new THREE.Group();

  for (let i = 0; i < 3; i++) {
    const sheet = plate(1.9, 2.5, 0.035, 0.05, i === 2 ? C.paper : C.paper2);
    sheet.position.y = i * 0.04;
    sheet.rotation.y = (i - 1) * 0.02;
    g.add(sheet);
  }

  const topY = 0.08 + 0.035;

  /* Textzeilen */
  const rows = [1.25, 0.95, 1.4, 0.72, 1.1];
  const rowZ = [-0.62, -0.36, -0.1, 0.16, 0.42];
  rows.forEach((w, i) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.014, 0.07),
      mat(i === 2 ? C.accent : C.paper3)
    );
    bar.position.set((i % 2 ? 0.06 : -0.06), topY + 0.007, rowZ[i]);
    g.add(bar);
  });

  /* Eselsohr */
  const foldShape = new THREE.Shape();
  foldShape.moveTo(0, 0);
  foldShape.lineTo(-0.34, 0);
  foldShape.lineTo(0, -0.34);
  foldShape.closePath();
  const fold = new THREE.Mesh(
    new THREE.ShapeGeometry(foldShape),
    new THREE.MeshStandardMaterial({ color: C.paper3, roughness: 0.95, side: THREE.DoubleSide })
  );
  fold.rotation.x = -Math.PI / 2;
  fold.position.set(0.95, topY + 0.002, -1.25);
  g.add(fold);
  return g;
}

function stageLumaweek() {
  const g = new THREE.Group();

  const heights = [0.07, 0.17, 0.1, 0.06, 0.12, 0.08, 0.2];
  let k = 0;
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 2; row++) {
      if (col === 3 && row === 1) continue;
      const h = heights[k];
      const tile = plate(0.46, 0.46, h, 0.07, k === 6 ? C.accent : (k === 2 ? C.sage : C.paper));
      tile.position.set(-0.84 + col * 0.56, h, -0.3 + row * 0.6);
      g.add(tile);
      k++;
    }
  }

  /* Wochenlinie */
  const line = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.012, 0.03), mat(C.sage));
  line.position.set(0, 0.02, 0.02);
  g.add(line);
  return g;
}

function stageBurgenwerk() {
  const g = new THREE.Group();

  const towerPos = [
    [-0.82, -0.58, 0.86],
    [0.82, -0.58, 0.72],
    [-0.82, 0.58, 0.72],
    [0.82, 0.58, 0.94]
  ];

  towerPos.forEach(function (t, i) {
    const h = t[2];
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.23, h, 22),
      mat(i === 3 ? C.paper : C.paper3)
    );
    tower.position.set(t[0], h / 2 + 0.02, t[1]);
    g.add(tower);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.4, 8),
      mat(i % 2 ? C.accent2 : C.accent, { roughness: 0.75 })
    );
    roof.position.set(t[0], h + 0.2, t[1]);
    roof.rotation.y = Math.PI / 8;
    g.add(roof);
  });

  /* Mauern */
  [-0.58, 0.58].forEach(function (z) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.34, 0.14), mat(C.paper3));
    wall.position.set(0, 0.19, z);
    g.add(wall);
  });
  [-0.82, 0.82].forEach(function (x) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.34, 0.9), mat(C.paper3));
    wall.position.set(x, 0.19, 0);
    g.add(wall);
  });

  /* Fahne */
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.55, 10), mat(C.ink));
  pole.position.set(0.82, 1.2, 0.58);
  g.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), mat(C.accent, { side: THREE.DoubleSide }));
  flag.position.set(0.98, 1.34, 0.58);
  g.add(flag);
  return g;
}

const STAGES = {
  lernreich: stageLernreich,
  updatepilot: stageUpdatepilot,
  pdf: stagePdf,
  lumaweek: stageLumaweek,
  burgenwerk: stageBurgenwerk
};

/* ---------- Bühnenaufbau ---------- */

function initStage(host) {
  const variant = host.getAttribute('data-buehne');
  const build = STAGES[variant] || stageLernreich;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    host.classList.add('pb-fallback');
    return;
  }
  if (!renderer || !renderer.getContext()) {
    host.classList.add('pb-fallback');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 4.1, 6.2);
  camera.lookAt(0, 0.38, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;

  const canvas = renderer.domElement;
  canvas.className = 'pb-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  /* Licht */
  scene.add(new THREE.HemisphereLight(0xfff8ec, 0x8d8474, 0.85));

  const key = new THREE.DirectionalLight(0xfff1dc, 1.5);
  key.position.set(3.6, 5.2, 4.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xdde8e0, 0.55);
  rim.position.set(-4.2, 2.4, -3.4);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffffff, 0.22);
  fill.position.set(0.5, -2.5, 2.5);
  scene.add(fill);

  /* Objekt */
  const group = build();
  const stage = new THREE.Group();
  stage.add(group);

  /* Objekt auf die Tischplatte stellen */
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  group.position.x -= center.x;
  group.position.z -= center.z;
  group.position.y -= box.min.y;
  const groupBaseY = group.position.y;

  /* Gemeinsame Platte: gibt jedem Produkt einen ruhigen Stand */
  const podW = Math.max(size.x, 1.4) * 1.06;
  const podD = Math.max(size.z, 1.4) * 1.06;
  const podium = plate(podW, podD, 0.07, 0.18, C.paper2);
  podium.position.y = -0.07;
  stage.add(podium);

  /* Gleiche Bühnenwirkung auf allen Seiten: Fußabdruck auf 2.55 normieren */
  const stageBox = new THREE.Box3().setFromObject(stage);
  const stageSize = stageBox.getSize(new THREE.Vector3());
  const norm = 2.55 / Math.max(stageSize.x, stageSize.z);
  stage.scale.setScalar(norm);

  /* Kontaktschatten unter der Platte */
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 4.4),
    new THREE.MeshBasicMaterial({
      map: shadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.55
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.09;
  const shadowScale = Math.max(podW, podD) * 1.2 / 4.4;
  shadow.scale.set(shadowScale, shadowScale, 1);
  stage.add(shadow);
  scene.add(stage);

  /* Hinweis */
  const hint = document.createElement('span');
  hint.className = 'pb-hint';
  hint.setAttribute('aria-hidden', 'true');
  host.appendChild(hint);

  function setHint() {
    const en = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
    hint.textContent = en ? 'Drag to rotate' : 'Ziehen zum Drehen';
  }
  setHint();

  const langObserver = new MutationObserver(setHint);
  langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* Zustand */
  const baseY = -0.42;
  let spin = 0;
  let spinVel = 0;
  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let running = false;
  let visible = false;
  let raf = 0;
  let t = 0;
  let last = performance.now();

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderFrame(0);
  }

  function renderFrame(dt) {
    t += dt;
    if (!REDUCED.matches) {
      const sway = Math.sin(t * 0.32) * 0.14;
      spinVel *= 0.94;
      spin += spinVel;
      tiltX += (pointerY * 0.1 - tiltX) * 0.06;
      tiltY += (pointerX * 0.16 - tiltY) * 0.06;
      group.position.y = groupBaseY;
      stage.rotation.y = baseY + sway + spin + tiltY;
      stage.rotation.x = tiltX;
    } else {
      stage.rotation.y = baseY;
      stage.rotation.x = 0;
    }
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    renderFrame(dt);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || !visible || document.hidden) return;
    if (REDUCED.matches) {
      renderFrame(0);
      return;
    }
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function sync() {
    if (visible && !document.hidden) start();
    else stop();
  }

  /* Sichtbarkeit */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { rootMargin: '120px' });
    io.observe(host);
  } else {
    visible = true;
  }

  document.addEventListener('visibilitychange', sync);

  /* Zeiger und Ziehen */
  host.addEventListener('pointermove', function (e) {
    const r = host.getBoundingClientRect();
    pointerX = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointerY = ((e.clientY - r.top) / r.height) * 2 - 1;
  });

  host.addEventListener('pointerleave', function () {
    pointerX = 0;
    pointerY = 0;
  });

  let dragging = false;
  let lastX = 0;

  host.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    host.classList.add('pb-dragging');
    if (host.setPointerCapture) {
      try { host.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
    }
  });

  host.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    spinVel += dx * 0.00035;
    spin += dx * 0.006;
    if (REDUCED.matches) renderFrame(0);
  });

  function endDrag() {
    dragging = false;
    host.classList.remove('pb-dragging');
  }
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', endDrag);

  /* Größe */
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(host);
  } else {
    window.addEventListener('resize', resize);
  }

  resize();
  host.classList.add('pb-ready');

  REDUCED.addEventListener && REDUCED.addEventListener('change', function () {
    if (REDUCED.matches) { stop(); renderFrame(0); }
    else sync();
  });

  sync();
}

function boot() {
  const hosts = document.querySelectorAll('[data-buehne]');
  for (let i = 0; i < hosts.length; i++) {
    try {
      initStage(hosts[i]);
    } catch (err) {
      hosts[i].classList.add('pb-fallback');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
