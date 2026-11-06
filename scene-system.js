/* ============================================================
   BYTEWERK STUDIO — scene-system.js
   ------------------------------------------------------------
   Interaktives Systemmodell fuer die Seite
   softwareentwicklung-ludwigshafen.html.

   Vier Schichten, die zusammen eine Anwendung ergeben:
     Oberflaeche · Logik · Daten · Betrieb

   Die Schichten liegen als Platten im Raum. Zeiger, Fokus oder
   Klick auf eine Zeile hebt die passende Platte heraus und
   blendet ihren Aufbau ein. Ziehen dreht den Stapel.

   Kein Build, kein Netzwerk: three.js liegt lokal unter vendor/
   (die CSP erlaubt nur script-src 'self'). Ohne WebGL bleibt die
   Beschreibungsliste vollstaendig stehen.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

const C = {
  paper: 0xf7f2e7,
  paper2: 0xefe8db,
  ink: 0x2b2722,
  accent: 0xb04f31,
  warm: 0xfff4e2,
  shade: 0x8d8474
};

const TUNE = {
  gap: 1.02,
  step: 0.0,
  depth: 0.0,
  lift: 0.24,
  camZ: 8.2,
  camY: 3.15,
  camX: 1.15,
  spin: 0.06,
  ease: 0.08,
  parallax: 0.11,
  tilt: 0.0
};

/* ---------- Geometrie ---------- */

function roundedShape(w, h, r) {
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

function slabGeometry(w, h, depth) {
  const g = new THREE.ExtrudeGeometry(roundedShape(w, h, 0.18), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 10
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

function paper(tint) {
  return new THREE.MeshStandardMaterial({
    color: tint,
    roughness: 0.52,
    metalness: 0.04
  });
}

/* Dunkler Koerper fuer den Blickfang einer Schicht. */
function ink(tint) {
  return new THREE.MeshStandardMaterial({
    color: tint,
    roughness: 0.42,
    metalness: 0.08
  });
}

function outline(opacity) {
  return new THREE.LineBasicMaterial({
    color: C.accent,
    transparent: true,
    opacity,
    depthWrite: false
  });
}

function inkOutline(opacity) {
  return new THREE.LineBasicMaterial({
    color: C.ink,
    transparent: true,
    opacity,
    depthWrite: false
  });
}

/* Weicher Kontaktschatten, im Browser gezeichnet. */
function shadowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(58, 48, 38, 0.38)');
  g.addColorStop(0.45, 'rgba(58, 48, 38, 0.14)');
  g.addColorStop(1, 'rgba(58, 48, 38, 0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- Die vier Aufbauten ---------- */

/* Oberflaeche: Raster aus Kacheln */
function buildSurface() {
  const group = new THREE.Group();
  const positions = [-0.62, 0, 0.62];

  for (const x of positions) {
    for (const z of [-0.3, 0.3]) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.06, 0.44),
        paper(z > 0 ? C.paper2 : C.paper)
      );
      tile.position.set(x, 0.28, z);
      group.add(tile);
    }
  }

  return group;
}

/* Logik: verschachtelte Rahmen */
function buildLogic() {
  const group = new THREE.Group();

  for (let i = 0; i < 3; i += 1) {
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.7 - i * 0.42, 0.34, 1.0 - i * 0.22)),
      outline(0.55 - i * 0.12)
    );
    frame.position.set(i * 0.05, 0.3 + i * 0.02, 0);
    group.add(frame);
  }

  const core = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.34, 0.34),
    new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.5, metalness: 0.05 })
  );
  core.position.y = 0.3;
  group.add(core);

  return group;
}

/* Daten: zylindrische Speicher */
function buildData() {
  const group = new THREE.Group();

  for (let i = 0; i < 3; i += 1) {
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4 - i * 0.05, 0.4 - i * 0.05, 0.13, 40),
      paper(i % 2 ? C.paper2 : C.paper)
    );
    disc.position.set((i - 1) * 0.72, 0.3, 0);
    group.add(disc);

    const ring = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.41 - i * 0.05, 0.41 - i * 0.05, 0.14, 24)),
      outline(0.4)
    );
    ring.position.copy(disc.position);
    group.add(ring);
  }

  return group;
}

/* Betrieb: Ring aus Knoten */
function buildOps() {
  const group = new THREE.Group();
  const hub = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.26, 1),
    ink(C.accent)
  );
  hub.position.y = 0.34;
  group.add(hub);

  const torus = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.TorusGeometry(0.72, 0.02, 8, 48)),
    outline(0.5)
  );
  torus.position.y = 0.34;
  torus.rotation.x = Math.PI / 2;
  group.add(torus);

  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 12),
      paper(C.paper)
    );
    node.position.set(Math.cos(angle) * 0.72, 0.34, Math.sin(angle) * 0.72);
    group.add(node);
  }

  group.userData.spinRing = torus;
  return group;
}

const BUILDERS = [buildSurface, buildLogic, buildData, buildOps];

/* ---------- Buehne ---------- */

function boot(host) {
  const rows = Array.from(host.parentElement.querySelectorAll('.sys-layer')).slice(0, 4);
  if (rows.length < 4) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (_) {
    return;
  }

  if (!renderer || !renderer.getContext()) return;

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  host.dataset.ready = 'true';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(TUNE.camX, TUNE.camY, TUNE.camZ);
  camera.lookAt(0, 0.12, 0);

  scene.add(new THREE.HemisphereLight(C.warm, C.shade, 1.35));

  const key = new THREE.DirectionalLight(0xfff3e0, 2.2);
  key.position.set(4.4, 7.4, 5.2);
  scene.add(key);

  const rim = new THREE.PointLight(C.accent, 7.0, 26, 2);
  rim.position.set(-5.2, 2.2, 3.0);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xe6efe9, 0.5);
  fill.position.set(-3, -2, -4);
  scene.add(fill);

  const stack = new THREE.Group();
  stack.rotation.x = TUNE.tilt;
  scene.add(stack);

  const layers = [];
  const mid = 1.5;

  for (let i = 0; i < 4; i += 1) {
    const layer = new THREE.Group();
    /* Kaskade: jede Schicht sitzt etwas hoeher, weiter rechts und weiter hinten. */
    layer.position.set(
      (i - mid) * TUNE.step,
      (i - mid) * TUNE.gap,
      (i - mid) * -TUNE.depth
    );

    const plate = new THREE.Mesh(
      slabGeometry(3.0, 1.62, 0.05),
      paper(i % 2 ? 0xf1e9d8 : 0xfdfaf3)
    );
    layer.add(plate);

    /* Dunkle Kante unten: trennt die Platten auch bei hellem Licht. */
    const under = new THREE.Mesh(
      slabGeometry(2.98, 1.60, 0.02),
      ink(0x2f2a24)
    );
    under.position.y = -0.04;
    layer.add(under);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(slabGeometry(3.03, 1.65, 0.07)),
      inkOutline(0.34)
    );
    layer.add(edge);

    const rim = new THREE.LineSegments(
      new THREE.EdgesGeometry(slabGeometry(3.0, 1.62, 0.05)),
      outline(0.62)
    );
    layer.add(rim);

    const body = BUILDERS[i]();

    /* Aufbau auf Hoehe des Zwischenraums normieren und auf die Platte stellen.
       So bleibt jeder Koerper sichtbar, egal wie hoch er gebaut ist. */
    body.updateMatrixWorld(true);
    const raw = new THREE.Box3().setFromObject(body, true);
    const rawSize = raw.getSize(new THREE.Vector3());
    const room = TUNE.gap * 0.74;
    const fitScale = Math.min(room / Math.max(rawSize.y, 0.001), 1.55);

    body.scale.setScalar(fitScale);
    body.position.set(0, 0.035 - raw.min.y * fitScale, 0.10);
    layer.add(body);

    stack.add(layer);
    layers.push({ group: layer, edge, rim, body, index: i });
  }

  /* Rueckgrat: verbindet die vier Schichten zu einem System. */
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 3.7, 12),
    new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.42, metalness: 0.1 })
  );
  spine.position.set(-1.28, 0, 0.58);
  stack.add(spine);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 3.0),
    new THREE.MeshBasicMaterial({
      map: shadowTexture(),
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -2.42, 0);
  scene.add(shadow);

  /* ---------- Zustand ---------- */

  const state = {
    active: -1,
    yaw: -0.36,
    yawTarget: -0.36,
    pitch: TUNE.tilt,
    pointerX: 0,
    pointerY: 0,
    dragYaw: 0,
    dragging: false,
    lastX: 0,
    assemble: 0
  };

  function setActive(index) {
    state.active = index;
    rows.forEach((row, i) => {
      row.classList.toggle('is-active', i === index);
      row.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
  }

  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', () => setActive(i));
    row.addEventListener('focus', () => setActive(i));
    row.addEventListener('click', () => setActive(i));
    row.addEventListener('pointerleave', () => setActive(-1));
    row.addEventListener('blur', () => setActive(-1));
  });

  /* Pfeiltasten wandern durch die Schichten, ohne die Tab-Reihenfolge zu stoeren. */
  host.parentElement.addEventListener('keydown', (event) => {
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;

    const current = rows.indexOf(document.activeElement);
    if (current === -1) return;

    event.preventDefault();
    const next = (current + step + rows.length) % rows.length;
    rows[next].focus();
  });

  /* ---------- Zeiger ---------- */

  host.addEventListener('pointermove', (event) => {
    const rect = host.getBoundingClientRect();
    state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    if (state.dragging) {
      state.dragYaw += (event.clientX - state.lastX) * 0.008;
      state.lastX = event.clientX;
    }
  }, { passive: true });

  host.addEventListener('pointerleave', () => {
    state.pointerX = 0;
    state.pointerY = 0;
    state.dragging = false;
    host.removeAttribute('data-dragging');
  }, { passive: true });

  canvas.addEventListener('pointerdown', (event) => {
    state.dragging = true;
    state.lastX = event.clientX;
    host.setAttribute('data-dragging', 'true');
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
    }
  });

  window.addEventListener('pointerup', () => {
    state.dragging = false;
    host.removeAttribute('data-dragging');
  }, { passive: true });

  /* ---------- Groesse ---------- */

  /* Passt den Abstand so an, dass der ganze Stapel im Bild liegt. */
  const bounds = new THREE.Box3();
  const corner = new THREE.Vector3();

  function fit() {
    /* Ruhezustand messen, nicht den halb zusammengebauten Stapel. */
    const savedYaw = stack.rotation.y;
    const savedPitch = stack.rotation.x;

    stack.rotation.set(TUNE.tilt, -0.36, 0);

    const saved = layers.map((layer) => {
      const snap = {
        x: layer.group.position.x,
        y: layer.group.position.y,
        z: layer.group.position.z,
        s: layer.group.scale.x
      };
      layer.group.position.set(
        (layer.index - mid) * TUNE.step,
        (layer.index - mid) * TUNE.gap,
        (layer.index - mid) * -TUNE.depth
      );
      layer.group.scale.setScalar(1);
      return snap;
    });

    stack.updateMatrixWorld(true);
    bounds.setFromObject(stack, true);

    layers.forEach((layer, i) => {
      const snap = saved[i];
      layer.group.position.set(snap.x, snap.y, snap.z);
      layer.group.scale.setScalar(snap.s);
    });

    stack.rotation.set(savedPitch, savedYaw, 0);

    if (bounds.isEmpty()) return;

    const center = bounds.getCenter(new THREE.Vector3());

    /* Kamera auf einer Kugel um das Modell: Azimut aus camX, Hoehe aus camY. */
    const radius = Math.sqrt(TUNE.camX * TUNE.camX + TUNE.camY * TUNE.camY + TUNE.camZ * TUNE.camZ);
    let z = radius;
    const place = (distance) => {
      camera.position.set(
        center.x + (TUNE.camX / radius) * distance,
        center.y + (TUNE.camY / radius) * distance,
        center.z + (TUNE.camZ / radius) * distance
      );
      camera.lookAt(center.x, center.y, center.z);
      camera.updateMatrixWorld(true);
    };

    for (let pass = 0; pass < 3; pass += 1) {
      place(z);

      let need = z;
      for (let i = 0; i < 8; i += 1) {
        corner.set(
          i & 1 ? bounds.max.x : bounds.min.x,
          i & 2 ? bounds.max.y : bounds.min.y,
          i & 4 ? bounds.max.z : bounds.min.z
        ).project(camera);

        const overX = Math.abs(corner.x) / 0.86;
        const overY = Math.abs(corner.y) / 0.86;
        const worst = Math.max(overX, overY, 1);
        need = Math.max(need, z * worst);
      }

      if (need <= z * 1.004) break;
      z = need;
    }

    place(z);
    camera.updateProjectionMatrix();
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);

    camera.aspect = Math.max(0.4, rect.width / Math.max(1, rect.height));
    camera.updateProjectionMatrix();
    fit();
  }

  /* ---------- Animation ---------- */

  let frameId = 0;
  let last = 0;
  let visible = true;
  let started = 0;

  function still() {
    stack.rotation.set(TUNE.tilt, -0.36, 0);
    renderer.render(scene, camera);
  }

  function draw(now) {
    frameId = window.requestAnimationFrame(draw);
    if (now - last < 1000 / 40) return;
    last = now;

    const t = (now - started) / 1000;

    /* Zusammenbau: die Schichten kommen von aussen in den Stapel. */
    state.assemble += (1 - state.assemble) * 0.045;
    const spread = (1 - state.assemble) * 1.5;

    state.yawTarget = -0.36 + Math.sin(t * TUNE.spin) * 0.16 + state.dragYaw + state.pointerX * TUNE.parallax;
    state.yaw += (state.yawTarget - state.yaw) * 0.06;
    state.pitch += ((TUNE.tilt + state.pointerY * 0.12) - state.pitch) * 0.05;

    stack.rotation.y = state.yaw;
    stack.rotation.x = state.pitch;

    const anyActive = state.active !== -1;

    for (const layer of layers) {
      const on = state.active === layer.index;

      /* Beim Zusammenbau faehrt jede Platte aus ihrer Richtung heran. */
      const dir = layer.index - mid;
      const fade = Math.min(1, state.assemble * 1.4);

      const xTarget = dir * (TUNE.step + spread * 0.5);
      const yTarget = dir * (TUNE.gap + spread * 0.35) + (on ? TUNE.lift : 0) +
        Math.sin(t * 0.7 + layer.index) * 0.012;
      const zTarget = dir * -TUNE.depth + (on ? 0.30 : (anyActive ? -0.10 : 0));

      layer.group.visible = fade > 0.02;

      const scale = (on ? 1.04 : (anyActive ? 0.985 : 1)) * (0.9 + state.assemble * 0.1);
      const edgeTarget = on ? 0.30 : (anyActive ? 0.12 : 0.22);
      const rimTarget = on ? 1.0 : (anyActive ? 0.18 : 0.5);

      layer.group.position.x += (xTarget - layer.group.position.x) * TUNE.ease;
      layer.group.position.y += (yTarget - layer.group.position.y) * TUNE.ease;
      layer.group.position.z += (zTarget - layer.group.position.z) * TUNE.ease;
      layer.group.scale.x += (scale - layer.group.scale.x) * TUNE.ease;
      layer.group.scale.y = layer.group.scale.x;
      layer.group.scale.z = layer.group.scale.x;

      layer.edge.material.opacity += (edgeTarget - layer.edge.material.opacity) * TUNE.ease;
      layer.rim.material.opacity += (rimTarget - layer.rim.material.opacity) * TUNE.ease;

      if (layer.body.userData.spinRing) {
        layer.body.userData.spinRing.rotation.z = t * 0.35;
      }
    }

    shadow.material.opacity = 0.34 - Math.min(0.14, Math.abs(state.pitch) * 0.4);
    renderer.render(scene, camera);
  }

  function start() {
    if (frameId || REDUCED.matches) return;
    started = performance.now();
    state.assemble = 0;
    last = 0;
    frameId = window.requestAnimationFrame(draw);
  }

  function stop() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function sync() {
    if (REDUCED.matches) {
      stop();
      still();
    } else if (visible && !document.hidden) {
      start();
    } else {
      stop();
    }
  }

  resize();
  sync();

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      resize();
      if (REDUCED.matches) still();
    });
    ro.observe(host);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        sync();
      });
    }, { rootMargin: '120px' });
    io.observe(host);
  }

  document.addEventListener('visibilitychange', sync);

  if (typeof REDUCED.addEventListener === 'function') {
    REDUCED.addEventListener('change', sync);
  } else if (typeof REDUCED.addListener === 'function') {
    REDUCED.addListener(sync);
  }
}

/* ---------- Start ---------- */

function init() {
  const host = document.querySelector('[data-system-stage]');
  if (!host) return;

  try {
    boot(host);
  } catch (error) {
    host.dataset.failed = 'true';
    if (window.console && console.warn) {
      console.warn('Systemmodell nicht verfuegbar:', error && error.message);
    }
  }
}

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init, { once: true });
}
