/* ============================================================
   BYTEWERK STUDIO — PAPIERREGAL (arbeiten.html)
   ------------------------------------------------------------
   Eleven products, eleven printed sheets of paper.
   Each sheet is a real card: the print is drawn with the
   Canvas 2D API into a texture at load time, so there is no
   image request, no CDN and nothing to break offline.

   three.js r180 is vendored locally because the site CSP is
   script-src 'self' — a CDN import would be blocked.

   Progressive enhancement: the HTML list is the real
   navigation and works without this file. Without WebGL the
   static CSS deck stays visible.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const ROOT = document.querySelector('[data-papierregal]');
if (ROOT) boot(ROOT);

function boot(root) {
  const stageEl = root.querySelector('.shw-stage');
  const frameEl = root.querySelector('.shw-frame') || stageEl;
  const canvas = root.querySelector('.shw-canvas');
  const items = Array.from(root.querySelectorAll('.shw-item'));
  const chips = Array.from(root.querySelectorAll('.shw-chip'));
  const outIndex = root.querySelector('[data-shw-index]');
  const outName = root.querySelector('[data-shw-name]');
  const outCat = root.querySelector('[data-shw-cat]');

  if (!stageEl || !frameEl || !canvas || items.length < 2) return;

  /* ---------- DOM layer: works with or without WebGL ---------- */
  let active = 0;
  let onChange = null; // set by the 3D layer
  let onVisibility = null; // set by the 3D layer

  function setActive(i, fromPointer) {
    if (i < 0 || i >= items.length) return;
    const li = items[i].closest('li');
    if (li && li.hidden) return;
    active = i;

    items.forEach((el, n) => el.classList.toggle('is-active', n === i));
    if (outName) outName.textContent = items[i].dataset.name || '';
    if (outCat) outCat.textContent = items[i].dataset.cat || '';
    if (outIndex) outIndex.textContent = String(i + 1).padStart(2, '0');
    onChange?.(i);

    if (fromPointer) {
      const row = items[i].closest('li');
      if (row) {
        const r = row.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight - 16) {
          row.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
        }
      }
    }
  }

  items.forEach((el, i) => {
    el.addEventListener('mouseenter', () => setActive(i));
    el.addEventListener('focus', () => setActive(i));
  });

  function matches(el, f) {
    if (f === 'all') return true;
    if (f === 'free') return (el.dataset.tags || '').includes('free');
    return el.dataset.group === f;
  }

  let filterActive = 0;
  function applyFilter(next) {
    chips.forEach((chip) => {
      const on = chip.dataset.filter === next;
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', String(on));
    });

    let first = -1;
    items.forEach((el, i) => {
      const ok = matches(el, next);
      const li = el.closest('li');
      if (li) li.hidden = !ok;
      if (ok && first < 0) first = i;
      onVisibility?.(i, ok);
    });
    if (first >= 0) setActive(first);
  }

  chips.forEach((chip) => chip.addEventListener('click', () => applyFilter(chip.dataset.filter)));

  /* Keyboard: the stage is a focusable group, so the deck can be
     browsed without touching the list. Enter opens the active product. */
  function visibleIndices() {
    return items.map((el, i) => ({ el, i })).filter(({ el }) => !el.closest('li')?.hidden).map(({ i }) => i);
  }

  stageEl.addEventListener('keydown', (e) => {
    const list = visibleIndices();
    if (!list.length) return;
    const at = list.indexOf(active);
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = list[(at + 1 + list.length) % list.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = list[(at - 1 + list.length) % list.length];
    else if (e.key === 'Home') next = list[0];
    else if (e.key === 'End') next = list[list.length - 1];
    else if (e.key === 'Enter' && items[active]) { window.location.href = items[active].getAttribute('href'); return; }
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  });

  // A hash like #keyforge-vault preselects that sheet.
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) {
    const hit = items.findIndex((el) => {
      const href = (el.getAttribute('href') || '').toLowerCase().replace(/\/$/, '').replace(/\.html$/, '');
      return href === hash || href.split('/').pop() === hash;
    });
    if (hit >= 0) setActive(hit);
  }

  setActive(active);

  /* ---------- Bail out before the 3D layer if WebGL is missing ---------- */
  if (!hasWebGL2()) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  motionQuery.addEventListener?.('change', (e) => { reduced = e.matches; });

  /* ---------- Palette read from the page ---------- */
  const css = getComputedStyle(document.documentElement);
  const tk = (name, fallback) => (css.getPropertyValue(name) || '').trim() || fallback;
  const C = {
    paper: tk('--surface', '#ffffff'),
    ink: tk('--ink', '#1f1e1d'),
    soft: tk('--ink-soft', '#3b3833'),
    muted: tk('--muted', '#6b665c'),
    line: tk('--line', '#e6e1d4'),
    app: tk('--accent', '#b04f31'),
    game: tk('--accent-2', '#4f7a63'),
    cream: tk('--paper-2', '#f3f0e8')
  };

  /* ---------- Renderer ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    return; // the CSS deck stays
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);

  /* ---------- Light: one warm key, soft fill, warm rim ---------- */
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xcfc4b2, 1.7));

  const key = new THREE.DirectionalLight(0xfff0dc, 2.1);
  key.position.set(2.6, 5.2, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3.2;
  key.shadow.camera.right = 3.2;
  key.shadow.camera.top = 4.2;
  key.shadow.camera.bottom = -1.4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 14;
  key.shadow.bias = -0.0011;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 3;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe6eef7, 0.8);
  fill.position.set(-4.2, 2.4, 2.0);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd7b8, 0.9);
  rim.position.set(-0.6, 2.6, -4.2);
  scene.add(rim);

  /* ---------- Ground shadow catcher ---------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ color: 0x2f2822, opacity: 0.16 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- Card geometry ---------- */
  const CARD_W = 1.24;
  const CARD_H = 1.68;
  const STACK_Y = 0.024;
  const STACK_Z = 0.030;

  function roundedShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  const bodyGeo = new THREE.ExtrudeGeometry(roundedShape(CARD_W, CARD_H, 0.055), {
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 8,
    steps: 1
  });
  bodyGeo.center();

  const FACE_W = CARD_W - 0.048;
  const FACE_H = CARD_H - 0.048;
  const faceGeo = new THREE.PlaneGeometry(FACE_W, FACE_H);

  /* ---------- The print ---------- */
  const PRINT_PX = 640;
  const PRINT_H = Math.round(PRINT_PX * (FACE_H / FACE_W));

  function wrapLines(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function paint(data) {
    const cv = document.createElement('canvas');
    cv.width = PRINT_PX;
    cv.height = PRINT_H;
    const g = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    const PAD = Math.round(W * 0.085);
    const accent = data.group === 'games' ? C.game : C.app;
    const isGame = data.group === 'games';

    // paper: warm for apps, cooler green-tinted for games so the
    // fan reads as two families at a glance
    const bg = g.createLinearGradient(0, 0, W * 0.5, H);
    if (isGame) {
      bg.addColorStop(0, '#f7faf6');
      bg.addColorStop(0.6, '#eef4ee');
      bg.addColorStop(1, '#e2ece2');
    } else {
      bg.addColorStop(0, '#fffdf7');
      bg.addColorStop(0.6, '#fdf6ec');
      bg.addColorStop(1, '#f6e9d8');
    }
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // accent band across the top
    const bandH = Math.round(H * 0.052);
    g.fillStyle = accent;
    g.fillRect(0, 0, W, bandH);

    // big ghosted index as the main graphic
    g.save();
    g.globalAlpha = 0.14;
    g.fillStyle = accent;
    g.font = `600 ${Math.round(W * 0.5)}px "Newsreader", Georgia, serif`;
    g.textAlign = 'right';
    g.textBaseline = 'alphabetic';
    g.fillText(data.index, W - PAD * 0.35, H * 0.66);
    g.restore();

    // category inside the band
    g.fillStyle = '#fffaf4';
    g.font = `600 ${Math.round(W * 0.028)}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
    g.textBaseline = 'middle';
    g.fillText(data.cat.toUpperCase(), PAD * 0.62, bandH / 2);
    g.textAlign = 'right';
    g.fillText(isGame ? 'GAME' : 'APP', W - PAD * 0.62, bandH / 2);
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';

    // product name
    const nameSize = Math.round(W * (data.name.length > 16 ? 0.096 : 0.118));
    g.font = `500 ${nameSize}px "Newsreader", Georgia, "Times New Roman", serif`;
    g.fillStyle = C.ink;
    const lines = wrapLines(g, data.name, W - PAD * 1.9).slice(0, 3);
    let ty = bandH + nameSize * 1.5;
    lines.forEach((line) => {
      g.fillText(line, PAD, ty);
      ty += nameSize * 1.04;
    });

    // claim
    const claimSize = Math.round(W * 0.041);
    g.font = `400 ${claimSize}px "Inter", system-ui, -apple-system, sans-serif`;
    g.fillStyle = C.soft;
    const claim = wrapLines(g, data.claim, W - PAD * 1.9).slice(0, 4);
    ty += claimSize * 0.55;
    claim.forEach((line) => {
      g.fillText(line, PAD, ty);
      ty += claimSize * 1.42;
    });

    // footer rule + price
    const footY = H - PAD * 0.72;
    g.strokeStyle = 'rgba(31,30,29,0.22)';
    g.lineWidth = Math.max(1, W * 0.0018);
    g.beginPath();
    g.moveTo(PAD, footY - claimSize * 1.9);
    g.lineTo(W - PAD, footY - claimSize * 1.9);
    g.stroke();

    g.fillStyle = accent;
    g.font = `600 ${Math.round(W * 0.042)}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
    g.fillText(data.price, PAD, footY);

    g.fillStyle = C.muted;
    g.font = `400 ${Math.round(W * 0.026)}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
    g.textAlign = 'right';
    g.fillText('bytewerkstudio.com', W - PAD, footY);
    g.textAlign = 'left';

    return cv;
  }

  /* ---------- Build the eleven sheets ---------- */
  const deck = new THREE.Group();
  scene.add(deck);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(C.paper),
    roughness: 0.95,
    metalness: 0
  });

  const cards = items.map((el, i) => {
    const group = el.dataset.group === 'games' ? 'games' : 'apps';
    const canvasTex = paint({
      index: String(i + 1).padStart(2, '0'),
      cat: el.dataset.cat || '',
      name: el.dataset.name || '',
      claim: el.querySelector('small')?.textContent?.trim() || '',
      price: el.dataset.price || '',
      group
    });

    const texture = new THREE.CanvasTexture(canvasTex);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    const faceMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0,
      transparent: true,
      opacity: 1
    });

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.cardIndex = i;

    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.019;
    face.userData.cardIndex = i;

    const card = new THREE.Group();
    card.add(body, face);
    card.userData = {
      i,
      href: el.getAttribute('href'),
      faceMat,
      group,
      canvas: canvasTex,
      visible: true,
      base: { x: 0, y: 0, z: 0 }
    };
    el.__card = i;
    deck.add(card);
    return card;
  });

  /* Redraw the print once the webfonts are ready,
     so the serif names match the rest of the site. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      cards.forEach((card, i) => {
        const el = items[i];
        const next = paint({
          index: String(i + 1).padStart(2, '0'),
          cat: el.dataset.cat || '',
          name: el.dataset.name || '',
          claim: el.querySelector('small')?.textContent?.trim() || '',
          price: el.dataset.price || '',
          group: card.userData.group
        });
        const tex = new THREE.CanvasTexture(next);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        card.userData.faceMat.map?.dispose();
        card.userData.faceMat.map = tex;
        card.userData.faceMat.needsUpdate = true;
        card.userData.canvas = next;
      });
    }).catch(() => {});
  }

  /* ---------- Shelf ---------- */
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(CARD_W + 1.15, 0.045, 1.15),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(C.cream),
      roughness: 0.97,
      metalness: 0
    })
  );
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  scene.add(shelf);

  const SHELF_TOP = 0.29;

  /* ---------- Layout: a squared stack of prints ----------
     The front sheet is fully legible; the other ten sit behind
     it, each nudged up and right so its printed band and index
     stay visible. Calm, editorial, no spinning carousel. */
  const STEP_X = 0.052;
  const STEP_Y = 0.050;
  const STEP_Z = 0.085;

  function layout() {
    const n = cards.length;
    cards.forEach((card, i) => {
      const level = n - 1 - i;
      card.userData.base.x = level * STEP_X;
      card.userData.base.y = SHELF_TOP + CARD_H / 2 + level * STEP_Y;
      card.userData.base.z = -level * STEP_Z;
      card.userData.base.ry = 0;
      card.renderOrder = i;
    });
    shelf.position.set(0, SHELF_TOP - 0.0225, 0.02);
    ground.position.y = 0.001;
  }

  /* ---------- Per-frame targets ---------- */
  function applyTargets(card, i, instant) {
    const base = card.userData.base;
    const visible = card.userData.visible;
    const lifted = i === active;
    const hinted = i === hovered && i !== active;

    // The active sheet comes to the front of the stack, squared
    // up and slightly larger. Hinted sheets only lean in a little.
    const tz = base.z + (lifted ? 1.05 : hinted ? 0.06 : 0) - (visible ? 0 : 0.5);
    const ty = base.y + (lifted ? 0.02 : 0) - (visible ? 0 : 0.12);
    const tx = base.x + (lifted ? -0.16 : 0);
    const ry = lifted || hinted ? 0 : base.ry;
    const rx = lifted ? -0.012 : 0;
    const scale = lifted ? 1.05 : 1;
    const opacity = visible ? 1 : 0.08;

    const k = instant || reduced ? 1 : 0.16;
    card.position.x += (tx - card.position.x) * k;
    card.position.y += (ty - card.position.y) * k;
    card.position.z += (tz - card.position.z) * k;
    card.rotation.y += (ry - card.rotation.y) * k;
    card.rotation.x += (rx - card.rotation.x) * k;
    card.scale.x += (scale - card.scale.x) * k;
    card.scale.y += (scale - card.scale.y) * k;
    card.scale.z += (scale - card.scale.z) * k;
    card.userData.faceMat.opacity += (opacity - card.userData.faceMat.opacity) * k;
  }

  /* ---------- Camera framing: fixed design volume ----------
     Framing against a fixed volume (instead of the live object
     bounds) keeps the composition identical on every viewport
     and stops the deck from jumping when the active card moves. */
  const FILL = 0.88;
  const ELEVATION = 0.055;
  const AZIMUTH = -0.10;
  const bounds = new THREE.Box3();
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  const CENTER = new THREE.Vector3();

  function measure() {
    // Rest pose of every sheet, plus the active sheet stepped out,
    // so the framing never changes while browsing.
    cards.forEach((card) => {
      card.position.set(card.userData.base.x, card.userData.base.y, card.userData.base.z);
      card.rotation.set(0, card.userData.base.ry, 0);
      card.scale.set(1, 1, 1);
    });
    const a = cards[active];
    if (a) {
      a.position.set(a.userData.base.x - 0.16, a.userData.base.y + 0.02, a.userData.base.z + 1.05);
      a.rotation.set(-0.012, 0, 0);
      a.scale.set(1.05, 1.05, 1.05);
    }
    deck.rotation.set(0, 0, 0);
    deck.updateMatrixWorld(true);

    bounds.setFromObject(cards[0]);
    cards.forEach((card) => bounds.expandByObject(card));
    bounds.getSize(size);
    bounds.getCenter(center);
  }

  function resize() {
    const w = frameEl.clientWidth;
    const h = frameEl.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout();
    measure();

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    // Use the projected width of the rotated box so the fan's
    // diagonal spread is accounted for.
    const yawSpan = Math.abs(Math.sin(AZIMUTH)) * size.z + Math.abs(Math.cos(AZIMUTH)) * size.x;
    const dV = (size.y / 2) / Math.tan(vFov / 2) / FILL;
    const dH = (yawSpan / 2) / Math.tan(hFov / 2) / FILL;
    const dist = Math.max(dV, dH);

    CENTER.set(center.x, center.y + size.y * 0.01, center.z);
    camera.position.set(
      CENTER.x + Math.sin(AZIMUTH) * dist,
      CENTER.y + Math.sin(ELEVATION) * dist,
      CENTER.z + Math.cos(AZIMUTH) * Math.cos(ELEVATION) * dist
    );
    camera.lookAt(CENTER.x, CENTER.y - size.y * 0.02, CENTER.z);
    camera.updateProjectionMatrix();
  }

  /* ---------- State (3D side) ---------- */
  let hovered = -1;
  let ready = false;

  /* React to the DOM layer instead of owning the state. */
  onChange = (i) => { hovered = -1; };
  onVisibility = (i, ok) => { cards[i].userData.visible = ok; };

  /* ---------- Pointer ---------- */
  const pointer = new THREE.Vector2(-10, -10);
  const raycaster = new THREE.Raycaster();
  let dragging = false;
  let dragDistance = 0;
  let startX = 0;
  let startY = 0;
  let yaw = 0;
  let yawStart = 0;
  let tilt = 0;
  let tiltStart = 0;
  let hoverDirty = false;

  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 2 - 1,
      y: -((e.clientY - r.top) / r.height) * 2 + 1
    };
  }

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(deck.children, true);
    if (!hits.length) return -1;
    let node = hits[0].object;
    let idx = node.userData.cardIndex;
    while (idx === undefined && node.parent) {
      node = node.parent;
      idx = node.userData.cardIndex;
    }
    if (idx === undefined) return -1;
    return cards[idx].userData.visible ? idx : -1;
  }

  stageEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    dragDistance = 0;
    startX = e.clientX;
    startY = e.clientY;
    yawStart = yaw;
    tiltStart = tilt;
    stageEl.setPointerCapture?.(e.pointerId);
  });

  stageEl.addEventListener('pointermove', (e) => {
    const p = toLocal(e);
    pointer.set(p.x, p.y);
    hoverDirty = true;

    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    dragDistance = Math.max(dragDistance, Math.hypot(dx, dy));
    yaw = THREE.MathUtils.clamp(yawStart + dx * 0.005, -0.65, 0.65);
    tilt = THREE.MathUtils.clamp(tiltStart + dy * 0.0018, -0.05, 0.09);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stageEl.releasePointerCapture?.(e.pointerId);
    if (dragDistance < 8) {
      const idx = pick();
      if (idx >= 0) window.location.href = cards[idx].userData.href;
    }
  }
  stageEl.addEventListener('pointerup', endDrag);
  stageEl.addEventListener('pointercancel', () => { dragging = false; });
  stageEl.addEventListener('pointerleave', () => {
    if (dragging) return;
    hovered = -1;
    pointer.set(-10, -10);
    stageEl.style.cursor = '';
  });

  /* ---------- Loop ---------- */
  let raf = 0;
  let last = performance.now();
  let clock = 0;
  let inView = true;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!inView || document.hidden) return;
    clock += dt;

    if (hoverDirty && !dragging) {
      hoverDirty = false;
      const idx = pick();
      if (idx !== hovered) {
        hovered = idx;
        stageEl.style.cursor = idx >= 0 ? 'pointer' : '';
        if (idx >= 0) setActive(idx, true);
      }
    }

    const idle = reduced ? 0 : Math.sin(clock * 0.4) * 0.018;
    deck.rotation.y += ((yaw + idle) - deck.rotation.y) * 0.1;
    deck.rotation.x += (tilt - deck.rotation.x) * 0.1;

    cards.forEach((card, i) => applyTargets(card, i, false));

    renderer.render(scene, camera);

    if (!ready) {
      ready = true;
      stageEl.classList.add('is-live');
    }
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { inView = entry.isIntersecting; });
  }, { rootMargin: '140px' });
  io.observe(stageEl);

  document.addEventListener('visibilitychange', () => { last = performance.now(); });

  /* ---------- Responsive ---------- */
  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });
  ro.observe(frameEl);

  /* ---------- Boot ---------- */
  resize();
  cards.forEach((card, i) => applyTargets(card, i, true));
  raf = requestAnimationFrame(frame);

  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

function hasWebGL2() {
  try {
    const probe = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && probe.getContext('webgl2'));
  } catch (err) {
    return false;
  }
}
