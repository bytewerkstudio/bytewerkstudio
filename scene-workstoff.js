/* ============================================================
   BYTEWERK STUDIO — WERKSTOFF
   ------------------------------------------------------------
   Materialstudie im Claude-Look: 72 Papierkarten, die sich beim
   Scrollen zwischen vier Zuständen formen (Raster, Lagen,
   Körper, Feld). Kein zweiter Klick-Dialog, keine Schleife.

   Kein Build, kein Netzwerk: three.js liegt lokal unter vendor/.
   Die CSP der Seiten erlaubt nur script-src 'self'.

   Verhalten
   - Ohne JavaScript, ohne WebGL oder bei einem Fehler bleibt das
     CSS-Poster im Markup stehen; die Bühne wird nie leer.
   - prefers-reduced-motion: ein fester Zustand, keine Neigung.
   - Pause außerhalb des Viewports und bei verstecktem Tab.
   - DPR-Deckel 2, Geometrie und Texturen werden freigegeben.

   Datenvertrag
   <div class="ws-stage" data-workstoff>
     <canvas></canvas>
   </div>
   Status via [data-ws-caption] und .ws-step in .ws-rail.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const COUNT = 72;
const CARD_W = 0.52;
const CARD_H = 0.70;
const CARD_D = 0.045;
const BASE_YAW = -0.10;       // leichte Grunddrehung, damit Tiefe lesbar ist
const REST_STATE = 2;         // fester Zustand bei reduzierter Bewegung

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Formzustände ---------- */

function layoutRaster() {
  const pos = [];
  const quat = [];
  const scale = [];
  for (let i = 0; i < COUNT; i++) {
    const col = i % 12;
    const row = Math.floor(i / 12);
    pos.push(new THREE.Vector3((col - 5.5) * 0.62, (2.5 - row) * 0.82, 0));
    quat.push(new THREE.Quaternion());
    scale.push(1);
  }
  return { pos, quat, scale };
}

function layoutLagen() {
  const pos = [];
  const quat = [];
  const scale = [];
  const sheets = 3;
  const perSheet = COUNT / sheets;   // 24 Karten pro Lage (8 x 3)
  for (let i = 0; i < COUNT; i++) {
    const sheet = Math.floor(i / perSheet);
    const rest = i % perSheet;
    const col = rest % 8;
    const row = Math.floor(rest / 8);
    const angle = (sheet - (sheets - 1) / 2) * 0.27;
    const lx = (col - 3.5) * 0.60;
    const lz = (sheet - (sheets - 1) / 2) * 0.58;
    pos.push(new THREE.Vector3(
      lx * Math.cos(angle),
      (1 - row) * 0.80 + (sheet - (sheets - 1) / 2) * 0.10,
      lz - lx * Math.sin(angle)
    ));
    quat.push(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0)));
    scale.push(1);
  }
  return { pos, quat, scale };
}

function layoutKoerper() {
  const pos = [];
  const quat = [];
  const scale = [];
  for (let i = 0; i < COUNT; i++) {
    const layer = Math.floor(i / 24);
    const rest = i % 24;
    const col = rest % 8;
    const row = Math.floor(rest / 8);
    pos.push(new THREE.Vector3(
      (col - 3.5) * 0.585,
      (1 - row) * 0.775,
      (layer - 1) * 0.13
    ));
    quat.push(new THREE.Quaternion());
    scale.push(1);
  }
  return { pos, quat, scale };
}

function layoutFeld() {
  const pos = [];
  const quat = [];
  const scale = [];
  const radius = 2.55;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const normal = new THREE.Vector3(0, 0, 1);
  const roll = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const p = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius);
    pos.push(p);
    const q = new THREE.Quaternion().setFromUnitVectors(normal, p.clone().normalize());
    roll.setFromAxisAngle(zAxis, Math.sin(i * 2.9) * 0.45);
    quat.push(q.multiply(roll));
    scale.push(0.94);
  }
  return { pos, quat, scale };
}

/* ---------- Geometrie ---------- */

function cardGeometry() {
  const w = CARD_W / 2;
  const h = CARD_H / 2;
  const r = 0.085;
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: CARD_D,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 1,
    curveSegments: 3,
    steps: 1
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/* ---------- Animation ---------- */

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch (err) {
    return false;
  }
}

function mount(stage) {
  const canvas = stage.querySelector('canvas');
  if (!canvas || !hasWebGL()) return;

  const caption = document.querySelector('[data-ws-caption]');
  const steps = Array.from(document.querySelectorAll('.ws-step'));
  const captions = [
    { de: 'Raster — Ordnung, bevor gebaut wird.', en: 'Grid — order before the build.' },
    { de: 'Lagen — Schicht für Schicht zum Produkt.', en: 'Layers — sheet by sheet into a product.' },
    { de: 'Körper — Form, die man anfassen kann.', en: 'Body — a form you can hold.' },
    { de: 'Feld — alles hängt mit allem zusammen.', en: 'Field — everything holds together.' }
  ];

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  camera.position.set(0, 0.45, 12);

  const pivot = new THREE.Group();
  pivot.rotation.y = BASE_YAW;
  scene.add(pivot);

  const geo = cardGeometry();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.86,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  pivot.add(mesh);

  const paper = new THREE.Color('#f3ead9');
  const paperWarm = new THREE.Color('#e9dcc3');
  const accent = new THREE.Color('#b04f31');
  const tint = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    if (i % 13 === 4) tint.copy(accent);
    else if (i % 5 === 2) tint.copy(paperWarm);
    else tint.copy(paper);
    mesh.setColorAt(i, tint);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  scene.add(new THREE.HemisphereLight(0xfff8ec, 0xd8cbb4, 2.1));

  const key = new THREE.DirectionalLight(0xfff3e0, 2.4);
  key.position.set(4.5, 7.5, 6.5);
  key.castShadow = true;
  const shadowRes = Math.min(window.innerWidth, window.innerHeight) < 720 ? 512 : 1024;
  key.shadow.mapSize.set(shadowRes, shadowRes);
  key.shadow.camera.left = -4.6;
  key.shadow.camera.right = 4.6;
  key.shadow.camera.top = 4.6;
  key.shadow.camera.bottom = -4.6;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 26;
  key.shadow.bias = -0.0009;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe6efe4, 0.55);
  fill.position.set(-6, 1.5, -3.5);
  scene.add(fill);

  /* Weicher Standschatten als Textur. Ein echtes Schattenfangnetz
     läge bei dieser Kamerahöhe als dunkles Band am Bildrand. */
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(128, 128, 8, 128, 128, 122);
  grad.addColorStop(0, 'rgba(43, 39, 34, 0.28)');
  grad.addColorStop(0.42, 'rgba(43, 39, 34, 0.14)');
  grad.addColorStop(1, 'rgba(43, 39, 34, 0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 256, 256);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  const groundGeo = new THREE.PlaneGeometry(7.4, 7.4);
  const groundMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.85
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.94;
  scene.add(ground);

  const states = [layoutRaster(), layoutLagen(), layoutKoerper(), layoutFeld()];
  const curPos = states[0].pos.map(v => v.clone());
  const curQuat = states[0].quat.map(q => q.clone());
  const curScale = states[0].scale.slice();

  const matrix = new THREE.Matrix4();
  const scratchS = new THREE.Vector3();

  let needsRender = true;
  let shownIndex = -1;
  let progress = -1;
  let captionLang = document.documentElement.lang === 'en' ? 'en' : 'de';

  function writeMatrices() {
    for (let i = 0; i < COUNT; i++) {
      scratchS.setScalar(curScale[i]);
      matrix.compose(curPos[i], curQuat[i], scratchS);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  function showStep(index) {
    if (index === shownIndex) return;
    shownIndex = index;
    steps.forEach((el, k) => {
      el.classList.toggle('is-on', k === index);
      el.classList.toggle('is-past', k < index);
    });
    if (caption) caption.textContent = captions[index][captionLang];
  }

  /* x läuft stetig von 0 bis 3; an jeder ganzen Zahl steht eine
     Formation, dazwischen wird überblendet. */
  function applyProgress(x) {
    const lo = Math.min(Math.floor(x), states.length - 1);
    const hi = Math.min(lo + 1, states.length - 1);
    const f = easeInOut(x - lo);
    const A = states[lo];
    const B = states[hi];
    for (let i = 0; i < COUNT; i++) {
      curPos[i].lerpVectors(A.pos[i], B.pos[i], f);
      curQuat[i].slerpQuaternions(A.quat[i], B.quat[i], f);
      curScale[i] = A.scale[i] + (B.scale[i] - A.scale[i]) * f;
    }
    writeMatrices();
    showStep(Math.round(x));
    needsRender = true;
  }

  /* ---------- Größe, Sichtbarkeit, Scroll ---------- */

  function resize() {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    const halfH = 3.02;
    const halfW = 4.10;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const dV = halfH / Math.tan(vFov / 2);
    const dH = halfW / (Math.tan(vFov / 2) * aspect);
    camera.position.z = Math.max(dV, dH) * 1.07;
    camera.updateProjectionMatrix();
    needsRender = true;
  }

  let visible = false;
  let running = false;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      visible = entry.isIntersecting;
      sync();
    });
  }, { rootMargin: '140px' });
  io.observe(stage);

  function sync() {
    const shouldRun = visible && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    } else if (!shouldRun) {
      running = false;
    }
  }

  document.addEventListener('visibilitychange', sync);

  let userYaw = 0;
  let pitch = 0;
  let targetPitch = 0;
  let targetYawBias = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let last = 0;

  document.addEventListener('scroll', () => { needsRender = true; }, { passive: true, capture: true });
  window.addEventListener('resize', resize, { passive: true });

  stage.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    dragging = true;
    velocity = 0;
    lastX = ev.clientX;
    lastY = ev.clientY;
    stage.classList.add('is-drag');
    if (canvas.setPointerCapture) canvas.setPointerCapture(ev.pointerId);
  });

  stage.addEventListener('pointermove', ev => {
    if (REDUCED.matches) return;
    const rect = stage.getBoundingClientRect();
    if (!dragging) {
      targetYawBias = ((ev.clientX - rect.left) / rect.width - 0.5) * 0.16;
      targetPitch = ((ev.clientY - rect.top) / rect.height - 0.5) * 0.20;
      needsRender = true;
      return;
    }
    const dx = ev.clientX - lastX;
    const dy = ev.clientY - lastY;
    lastX = ev.clientX;
    lastY = ev.clientY;
    userYaw += dx * 0.006;
    pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.6, 0.6);
    targetPitch = pitch;
    velocity = dx * 0.006;
    needsRender = true;
  });

  function endDrag(ev) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-drag');
    if (ev && ev.pointerId !== undefined && canvas.releasePointerCapture) {
      try { canvas.releasePointerCapture(ev.pointerId); } catch (err) { /* schon freigegeben */ }
    }
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('pointerleave', ev => {
    targetYawBias = 0;
    targetPitch = 0;
    needsRender = true;
    endDrag(ev);
  });

  document.addEventListener('bw:lang', ev => {
    captionLang = ev.detail && ev.detail.lang === 'en' ? 'en' : 'de';
    if (caption && shownIndex >= 0) caption.textContent = captions[shownIndex][captionLang];
  });

  function tick(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!REDUCED.matches) {
      const vh = window.innerHeight;
      const rect = stage.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      /* Der Morph läuft genau in dem Fenster, in dem die Bühne ganz
         sichtbar ist: von der Unterkante bis knapp unter den festen
         Header. Dadurch geht keine Formation unter der Navigation
         verloren, egal wie hoch das Fenster ist. */
      const nav = document.querySelector('header.nav');
      const navH = nav ? nav.getBoundingClientRect().height : 0;
      const margin = 14;
      const start = vh - rect.height / 2 - margin;
      const end = navH + rect.height / 2 + margin;
      const raw = (start - center) / Math.max(120, start - end);
      const p = THREE.MathUtils.clamp(raw, 0, 1) * (states.length - 1);
      if (Math.abs(p - progress) > 0.0015) {
        progress = p;
        applyProgress(p);
      }
    }

    if (!dragging && Math.abs(velocity) > 0.0002) {
      userYaw += velocity;
      velocity *= 0.92;
      needsRender = true;
    }

    if (!REDUCED.matches) {
      if (Math.abs(targetPitch - pitch) > 0.0004) {
        pitch += (targetPitch - pitch) * Math.min(dt * 5, 1);
        needsRender = true;
      } else {
        pitch = targetPitch;
      }
    } else {
      pitch = 0;
    }

    pivot.rotation.y = BASE_YAW + userYaw + (REDUCED.matches ? 0 : targetYawBias);
    pivot.rotation.x = pitch;

    if (needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
    requestAnimationFrame(tick);
  }

  function dispose() {
    running = false;
    io.disconnect();
    geo.dispose();
    mat.dispose();
    groundGeo.dispose();
    groundMat.dispose();
    shadowTex.dispose();
    renderer.dispose();
  }

  window.addEventListener('pagehide', ev => {
    if (!ev.persisted) dispose();
  }, { once: true });

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();
  applyProgress(REDUCED.matches ? REST_STATE : 0);
  renderer.render(scene, camera);
  stage.dataset.ready = 'true';
  visible = true;
  sync();
}

try {
  const stage = document.querySelector('[data-workstoff]');
  if (stage) mount(stage);
} catch (err) {
  /* Das Poster im Markup bleibt sichtbar. */
  if (window.console && console.warn) console.warn('Werkstoff-Bühne inaktiv:', err);
}
