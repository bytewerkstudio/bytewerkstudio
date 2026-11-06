/* ============================================================
   BYTEWERK STUDIO — showroom-scene.js  (three.js)
   ------------------------------------------------------------
   A shelf of printed product plates on a warm paper stage.
   Every plate is a rounded, bevelled card with a canvas-drawn
   face (index, product mark, serif name, price).

   Local three.js only: the page CSP allows 'self' scripts, so
   the module imports vendor/three.module.min.js (r180) which in
   turn pulls vendor/three.core.min.js. No network at runtime.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const stage = document.getElementById('sr-stage');
const canvas = document.getElementById('sr-canvas');
const api = window.bwShowroom;

if (stage && canvas && api) {
  boot().catch((err) => {
    console.warn('Showroom: 3D could not start.', err);
    if (api && api.fail) api.fail();
  });
}

async function boot() {
  'use strict';

  /* The site's own motion switch in scene3d.js writes `bw-motion`;
     the showroom follows it, so one switch calms every page. */
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff = REDUCE.matches;
  try {
    const stored = localStorage.getItem('bw-motion');
    if (stored === 'off') motionOff = true;
    else if (stored === 'on') motionOff = false;
  } catch (e) {}
  const reduceMotion = {
    get matches() {
      return motionOff;
    }
  };
  let products = api.products;

  /* Ask the browser once, without letting three.js log an error. */
  const probe = document.createElement('canvas');
  const probeGl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!probeGl) {
    api.fail();
    return;
  }
  const lose = probeGl.getExtension('WEBGL_lose_context');
  if (lose) lose.loseContext();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    api.fail();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.1, 60);

  /* ---------- light ---------- */
  const hemi = new THREE.HemisphereLight(0xfff6e6, 0xd9d0bd, 1.45);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff3e0, 2.6);
  key.position.set(2.6, 4.4, 6.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe9efe6, 0.9);
  fill.position.set(-4.2, 1.6, 4.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd9b8, 0.7);
  rim.position.set(0.4, -2.2, -5.0);
  scene.add(rim);

  /* ---------- material helpers ---------- */
  const SHADOW = makeShadowTexture();
  const MAX_ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const GAP = 1.46;
  const CARD_W = 1.35;
  const CARD_H = 1.9;
  const DEPTH = 0.085;
  const BEVEL = 0.012;
  const FACE_Z = DEPTH / 2 + BEVEL + 0.002;
  const TOTAL = products.length;
  const rowX = (i) => (i - (TOTAL - 1) / 2) * GAP;
  const CARD_GEO = cardGeometry();

  const shelf = new THREE.Group();
  scene.add(shelf);

  const shadowGroup = new THREE.Group();
  scene.add(shadowGroup);

  /* ---------- fonts + marks ---------- */
  await waitForFonts();
  const images = await Promise.all(products.map((p) => loadImage(p.icon)));

  /* ---------- build plates ---------- */
  const plates = [];

  for (let i = 0; i < TOTAL; i++) {
    const p = products[i];
    const accent = p.family === 'game' ? 0x4f7a63 : 0xb04f31;

    const faceTex = new THREE.CanvasTexture(drawCard(p, images[i]));
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.anisotropy = MAX_ANISO;
    faceTex.needsUpdate = true;

    const capMat = new THREE.MeshStandardMaterial({
      color: 0xfcfaf4,
      roughness: 0.92,
      metalness: 0,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0
    });
    const sideMat = new THREE.MeshStandardMaterial({
      color: accent,
      roughness: 0.62,
      metalness: 0,
      emissive: new THREE.Color(accent),
      emissiveIntensity: 0
    });

    const card = new THREE.Mesh(CARD_GEO, [capMat, sideMat]);
    card.position.set(rowX(i), 0, 0);
    card.rotation.y = 0;
    card.userData.index = i;

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W - 0.045, CARD_H - 0.045),
      new THREE.MeshBasicMaterial({
        map: faceTex,
        color: 0xffffff,
        toneMapped: false
      })
    );
    face.position.z = FACE_Z;
    face.userData.index = i;
    card.add(face);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 0.95),
      new THREE.MeshBasicMaterial({
        map: SHADOW,
        transparent: true,
        opacity: 0.27,
        depthWrite: false,
        color: 0x2b2419
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(rowX(i), -1.0, 0.16);
    shadow.renderOrder = -1;
    shadowGroup.add(shadow);

    shelf.add(card);
    plates.push({
      index: i,
      card,
      face,
      capMat,
      sideMat,
      shadow,
      baseX: rowX(i),
      target: { x: rowX(i), y: 0, z: 0, scale: 1, ry: 0 },
      hover: false
    });
  }

  /* ---------- layout ---------- */
  const view = { height: 2.95, panX: 0, targetPanX: 0 };
  const focusState = { index: api.state.index, filter: api.state.filter };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const drag = { active: false, startX: 0, dx: 0, moved: false };
  let needsResize = true;
  let running = true;
  let raf = 0;
  let last = 0;
  let time = 0;

  function cameraDistance() {
    const fov = (camera.fov * Math.PI) / 180;
    return view.height / (2 * Math.tan(fov / 2));
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    view.height = camera.aspect < 1.2 ? 2.5 : 2.95;
    camera.updateProjectionMatrix();
    needsResize = false;
  }

  function focusIndex(i) {
    focusState.index = Math.max(0, Math.min(TOTAL - 1, i));
    view.targetPanX = rowX(focusState.index);
    for (let n = 0; n < plates.length; n++) {
      const pl = plates[n];
      const isFocus = pl.index === focusState.index;
      const active = api.matches(products[pl.index]);
      pl.target.x = pl.baseX;
      pl.target.y = isFocus ? 0.045 : (active ? 0 : -0.3);
      const dist = Math.abs(pl.index - focusState.index);
      pl.target.z = (isFocus ? 0.3 : 0) - Math.min(dist, 4) * 0.22;
      pl.target.scale = isFocus ? 1.035 : (active ? 1 : 0.95);
      pl.target.ry = -(pl.index - focusState.index) * 0.08;
      pl.dim = !active;
    }
  }

  api.subscribe((ev) => {
    focusState.filter = ev.filter;
    focusIndex(ev.index);
    if (reduceMotion.matches) settle();
    if (ev.type === 'init') {
      view.panX = view.targetPanX;
      if (reduceMotion.matches) settle();
    }
  });

  /* Language switch: redraw every printed face in the new language. */
  document.addEventListener('bw:lang', () => {
    products = api.products;
    for (let i = 0; i < plates.length; i++) {
      const next = new THREE.CanvasTexture(drawCard(products[i], images[i]));
      next.colorSpace = THREE.SRGBColorSpace;
      next.anisotropy = MAX_ANISO;
      next.needsUpdate = true;
      const old = plates[i].face.material.map;
      plates[i].face.material.map = next;
      plates[i].face.material.needsUpdate = true;
      if (old) old.dispose();
    }
    if (reduceMotion.matches) settle();
  });

  /* ---------- pointer ---------- */
  function pointerPos(e) {
    const r = stage.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  }

  stage.addEventListener('pointermove', (e) => {
    pointerPos(e);
    if (!drag.active) {
      hoverTest(e);
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.dx = e.clientX - drag.startX;
    if (Math.abs(drag.dx) > 6) drag.moved = true;
  });

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    drag.active = true;
    drag.moved = false;
    drag.startX = e.clientX;
    drag.dx = 0;
    stage.classList.add('is-dragging');
  });

  window.addEventListener('pointerup', (e) => {
    if (!drag.active) return;
    drag.active = false;
    stage.classList.remove('is-dragging');
    const dist = drag.dx;
    drag.dx = 0;
    if (Math.abs(dist) > 48) {
      api.step(dist < 0 ? 1 : -1);
    } else if (!drag.moved) {
      clickTest(e);
    }
  });

  stage.addEventListener('pointercancel', () => {
    drag.active = false;
    drag.dx = 0;
    stage.classList.remove('is-dragging');
  });

  stage.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
    stage.classList.remove('is-over-card');
    for (const pl of plates) pl.hover = false;
  });

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function pick(e) {
    const r = stage.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(plates.map((p) => p.face), false);
    return hits.length ? hits[0].object.userData.index : -1;
  }

  function hoverTest(e) {
    const i = pick(e);
    let any = false;
    for (const pl of plates) {
      pl.hover = pl.index === i;
      if (pl.hover) any = true;
    }
    stage.classList.toggle('is-over-card', any && i !== focusState.index);
  }

  function clickTest(e) {
    const i = pick(e);
    if (i < 0) return;
    if (i === focusState.index) api.open();
    else api.focus(i);
  }

  /* ---------- render loop ---------- */
  function tick(now) {
    if (!running) return;
    raf = window.requestAnimationFrame(tick);
    if (!last) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;

    if (needsResize) resize();

    const ease = reduceMotion.matches ? 0.4 : 0.085;
    const factor = 1 - Math.pow(1 - ease, dt * 60);

    pointer.x += (pointer.tx - pointer.x) * Math.min(1, factor * 0.7);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, factor * 0.7);

    view.panX += (view.targetPanX - view.panX) * factor;

    for (const pl of plates) {
      const t = pl.target;
      const hoverLift = pl.hover && pl.index !== focusState.index ? 0.05 : 0;
      const bob = reduceMotion.matches ? 0 : Math.sin(time * 1.15 + pl.index * 0.7) * 0.008;

      pl.card.position.x += (t.x - pl.card.position.x) * factor;
      pl.card.position.y += (t.y + bob + hoverLift - pl.card.position.y) * factor;
      pl.card.position.z += (t.z + (pl.hover ? 0.06 : 0) - pl.card.position.z) * factor;
      const s = pl.card.scale.x + (t.scale + (pl.hover && pl.index !== focusState.index ? 0.012 : 0) - pl.card.scale.x) * factor;
      pl.card.scale.setScalar(s);

      const ryTarget = t.ry + (pl.dim ? 0.04 : 0);
      pl.card.rotation.y += (ryTarget - pl.card.rotation.y) * factor;

      const emiss = pl.index === focusState.index ? 0.22 : (pl.hover ? 0.1 : 0);
      pl.sideMat.emissiveIntensity += (emiss - pl.sideMat.emissiveIntensity) * factor;
      pl.capMat.emissiveIntensity += ((pl.index === focusState.index ? 0.03 : 0) - pl.capMat.emissiveIntensity) * factor;

      const dimTarget = pl.dim ? 0.42 : 1;
      const cur = pl.face.material.color.r;
      const next = cur + (dimTarget - cur) * factor;
      pl.face.material.color.setRGB(next, next * 0.985, next * 0.955);
      pl.capMat.color.setRGB(next, next * 0.99, next * 0.96);

      pl.shadow.position.x = pl.card.position.x;
      pl.shadow.position.z = pl.card.position.z * 0.5 + 0.16;
      const sh = 0.27 + (pl.index === focusState.index ? 0.1 : 0) + (pl.hover ? 0.04 : 0);
      pl.shadow.material.opacity += (sh - pl.shadow.material.opacity) * factor;
      const sw = 1 + (pl.card.position.z * 0.5);
      pl.shadow.scale.setScalar(sw);
    }

    const camX = view.panX + pointer.x * 0.16 - (drag.active ? drag.dx * 0.006 : 0);
    const camY = 0.62 - pointer.y * 0.07;
    camera.position.x += (camX - camera.position.x) * factor;
    camera.position.y += (camY - camera.position.y) * factor;
    camera.position.z = cameraDistance();
    camera.lookAt(view.panX + pointer.x * 0.05, -0.02, 0);

    renderer.render(scene, camera);
  }

  /* ---------- visibility ---------- */
  function start() {
    if (raf) return;
    if (reduceMotion.matches) {
      settle();
      return;
    }
    running = true;
    last = 0;
    raf = window.requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) start();
        else stop();
      }
    }, { rootMargin: '180px 0px' });
    io.observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  /* The switch in the toolbar: pause means "stop the loop and set the
     stage once", resume restarts the loop where it left off. */
  document.addEventListener('bw:showroom-motion', (e) => {
    const on = !!(e.detail && e.detail.on);
    motionOff = !on;
    if (motionOff) { stop(); settle(); }
    else { start(); }
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      needsResize = true;
      if (reduceMotion.matches) { resize(); settle(); }
    }).observe(stage);
  } else {
    window.addEventListener('resize', () => { needsResize = true; });
  }

  window.addEventListener('resize', () => {
    needsResize = true;
    if (reduceMotion.matches) { resize(); settle(); }
  });

  /* ---------- go ---------- */
  resize();
  focusIndex(focusState.index);
  for (const pl of plates) {
    pl.card.position.set(pl.target.x, pl.target.y - 0.25, pl.target.z);
    pl.card.scale.setScalar(0.96);
  }
  camera.position.set(0, 0.62, cameraDistance());
  camera.lookAt(0, -0.02, 0);
  renderer.render(scene, camera);
  stage.classList.add('is-ready');
  api.ready();
  start();

  function settle() {
    if (!plates.length) return;
    view.panX = view.targetPanX;
    for (const pl of plates) {
      pl.card.position.set(pl.target.x, pl.target.y, pl.target.z);
      pl.card.scale.setScalar(pl.target.scale);
      pl.card.rotation.y = pl.target.ry;
      pl.face.material.color.setRGB(pl.dim ? 0.42 : 1, pl.dim ? 0.4137 : 0.985, pl.dim ? 0.4011 : 0.955);
      pl.capMat.color.setRGB(pl.dim ? 0.42 : 1, pl.dim ? 0.4158 : 0.99, pl.dim ? 0.4032 : 0.96);
      pl.sideMat.emissiveIntensity = pl.index === focusState.index ? 0.22 : 0;
      pl.capMat.emissiveIntensity = pl.index === focusState.index ? 0.03 : 0;
      pl.shadow.position.x = pl.target.x;
      pl.shadow.material.opacity = 0.27 + (pl.index === focusState.index ? 0.1 : 0);
    }
    camera.position.set(view.panX, 0.62, cameraDistance());
    camera.lookAt(view.panX, -0.02, 0);
    renderer.render(scene, camera);
  }

  /* ============ helpers ============ */

  function cardGeometry() {
    const shape = roundedRectShape(CARD_W, CARD_H, 0.085);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 2,
      curveSegments: 8,
      steps: 1
    });
    geo.center();
    return geo;
  }
}

/* ------------------------------------------------------------
   Card artwork: a printed museum label for each product.
   ------------------------------------------------------------ */
function drawCard(p, img) {
  const W = 600;
  const H = 840;
  const c = document.createElement('canvas');
  const SCALE = 512 / W;
  c.width = 512;
  c.height = Math.round(H * SCALE);
  const ctx = c.getContext('2d');
  ctx.scale(SCALE, SCALE);

  const paper = ctx.createLinearGradient(0, 0, 0, H);
  paper.addColorStop(0, '#fffefa');
  paper.addColorStop(0.55, '#fdfaf3');
  paper.addColorStop(1, '#f8f3e8');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // very light paper grain
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#7a6a4f';
  for (let i = 0; i < 900; i++) {
    const x = (i * 97.31) % W;
    const y = (i * 53.77) % H;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();

  const accent = p.family === 'game' ? '#4f7a63' : '#b04f31';

  // book spine
  const spine = ctx.createLinearGradient(0, 0, 26, 0);
  spine.addColorStop(0, accent);
  spine.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = spine;
  ctx.fillRect(0, 0, 26, H);
  ctx.restore();

  // oversized ghost numeral
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#1f1e1d';
  ctx.font = '500 430px "Newsreader", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(pad2(p.index + 1), W / 2 + 8, 720);
  ctx.restore();

  // frame
  ctx.strokeStyle = 'rgba(31,30,29,0.22)';
  ctx.lineWidth = 1.6;
  roundRect(ctx, 28, 28, W - 56, H - 56, 16);
  ctx.stroke();

  // top row
  ctx.textBaseline = 'alphabetic';
  ctx.font = '500 20px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = '#8d8577';
  setSpacing(ctx, '2px');
  ctx.textAlign = 'left';
  ctx.fillText(pad2(p.index + 1), 58, 72);

  ctx.textAlign = 'right';
  ctx.fillStyle = accent;
  ctx.font = '500 17px "Inter", system-ui, sans-serif';
  setSpacing(ctx, '3px');
  ctx.fillText((p.kind || 'APP').toUpperCase(), W - 58, 72);
  setSpacing(ctx, '0px');

  // icon tile
  const size = 132;
  const ix = (W - size) / 2;
  const iy = 104;
  ctx.save();
  roundRect(ctx, ix, iy, size, size, 30);
  ctx.clip();
  ctx.fillStyle = '#efe8d8';
  ctx.fillRect(ix, iy, size, size);
  if (img && img.width) {
    drawCover(ctx, img, ix, iy, size, size);
  } else {
    ctx.fillStyle = accent;
    ctx.font = '500 64px "Newsreader", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText((p.name || '?').charAt(0), W / 2, iy + 88);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(31,30,29,0.18)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, ix, iy, size, size, 30);
  ctx.stroke();

  // name
  ctx.textAlign = 'center';
  ctx.fillStyle = '#201f1d';
  const lines = wrapLines(ctx, p.name, W - 120, 56, 2, '500');
  let font = lines.size;
  ctx.font = '500 ' + font + 'px "Newsreader", Georgia, serif';
  setSpacing(ctx, '-0.5px');
  let y = 320 + (lines.length === 1 ? 18 : 0);
  for (const line of lines.lines) {
    ctx.fillText(line, W / 2, y);
    y += font * 1.02;
  }
  setSpacing(ctx, '0px');

  // category
  const catY = Math.max(y + 12, 404);
  ctx.fillStyle = '#7b7466';
  ctx.font = '500 17px "Inter", system-ui, sans-serif';
  setSpacing(ctx, '3.4px');
  ctx.fillText((p.cat || '').toUpperCase(), W / 2, catY);
  setSpacing(ctx, '0px');

  // short accent rule
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 17, catY + 26);
  ctx.lineTo(W / 2 + 17, catY + 26);
  ctx.stroke();

  // bottom plate: rule, price, license
  ctx.strokeStyle = 'rgba(31,30,29,0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(58, 604);
  ctx.lineTo(W - 58, 604);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#8d8577';
  ctx.font = '500 12px "JetBrains Mono", ui-monospace, monospace';
  setSpacing(ctx, '3px');
  ctx.fillText((p.license || '').toUpperCase(), 58, 636);
  setSpacing(ctx, '0px');

  ctx.fillStyle = '#96402a';
  ctx.font = '500 46px "Newsreader", Georgia, serif';
  setSpacing(ctx, '-0.3px');
  ctx.fillText(p.price || '', 56, 690);
  setSpacing(ctx, '0px');

  ctx.textAlign = 'right';
  ctx.fillStyle = '#8d8577';
  ctx.font = '500 15px "JetBrains Mono", ui-monospace, monospace';
  setSpacing(ctx, '2.6px');
  ctx.fillText((p.platform || '').toUpperCase(), W - 58, 688);
  setSpacing(ctx, '0px');

  // fine frame around the bottom specimen band
  ctx.strokeStyle = 'rgba(31,30,29,0.09)';
  ctx.lineWidth = 1;
  roundRect(ctx, 46, 588, W - 92, 132, 10);
  ctx.stroke();

  // signature
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(31,30,29,0.34)';
  ctx.font = '500 12px "JetBrains Mono", ui-monospace, monospace';
  setSpacing(ctx, '4px');
  ctx.fillText('BYTEWERK STUDIO', W / 2, H - 52);
  setSpacing(ctx, '0px');

  return c;
}

function wrapLines(ctx, text, maxWidth, size, maxLines, weight) {
  if (size < 26) {
    return { lines: [String(text || '')], size: size };
  }
  ctx.font = weight + ' ' + size + 'px "Newsreader", Georgia, serif';
  const words = String(text || '').split(/\s+/);
  let lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    // try one size down before truncating
    const smaller = Math.round(size * 0.84);
    return wrapLines(ctx, text, maxWidth, smaller, maxLines, weight);
  }
  return { lines: lines, size: size };
}

function drawCover(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const r = w / h;
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (ir > r) {
    dh = h;
    dw = h * ir;
    dx = x - (dw - w) / 2;
  } else {
    dw = w;
    dh = w / ir;
    dy = y - (dh - h) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function setSpacing(ctx, value) {
  try {
    ctx.letterSpacing = value;
  } catch (err) { /* older browsers simply ignore it */ }
}

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function roundedRectShape(w, h, r) {
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

function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 64, 6, 128, 64, 120);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.38)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function loadImage(src) {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    const done = () => resolve(img);
    img.onload = done;
    img.onerror = () => resolve(null);
    img.src = src;
    window.setTimeout(() => resolve(img), 2600);
  });
}

function waitForFonts() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const loads = [
    document.fonts.load('500 56px "Newsreader"'),
    document.fonts.load('500 17px "Inter"'),
    document.fonts.load('500 20px "JetBrains Mono"')
  ].map((p) => p.catch(() => null));
  return Promise.race([
    Promise.all(loads),
    new Promise((resolve) => window.setTimeout(resolve, 1600))
  ]);
}
