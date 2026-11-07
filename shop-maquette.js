/* ============================================================
   BYTEWERK STUDIO — SHOP-MAQUETTE
   ------------------------------------------------------------
   Zweite Ansicht fuer shop.html: der Katalog als physisches
   Modell. Elfk stehende Karten in einem flachen Bogen auf einem
   warmen Papiertisch, weiches Studiolicht, Kontaktschatten.

   Kein Build, kein Netzwerk: three.js liegt lokal unter vendor/,
   weil die CSP der Seiten nur script-src 'self' erlaubt.

   Verhalten
   - Das Raster bleibt Standard und die zugaengliche Liste.
   - Ohne WebGL, ohne JS oder bei einem Fehler bleibt der Shop
     unveraendert; der Umschalter erscheint dann gar nicht.
   - prefers-reduced-motion: keine Dauerbewegung, nur Interaktion.
   - Pause ausserhalb des Viewports und bei verstecktem Tab.

   Datenvertrag
   ui-v4.js bleibt die Quelle der Wahrheit. Dieses Modul liest die
   vorhandenen .prod-Karten, hoert auf bw:shop und bw:lang und
   schreibt selbst nichts in den Shop-Zustand.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const grid = document.querySelector('.shop-page-grid');
if (grid) start();

function start() {
  const products = readProducts();
  if (products.length < 2) return;
  if (!hasWebGL()) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lang = () => (document.documentElement.lang || 'de').toLowerCase().startsWith('en') ? 'en' : 'de';
  const T = (de, en) => (lang() === 'en' ? en : de);

  const ui = createStage();
  const filters = document.querySelector('.shop-filters');
  if (filters) filters.insertAdjacentElement('afterend', ui.root);
  else grid.insertAdjacentElement('beforebegin', ui.root);

  const toggle = createToggle();
  const tools = document.querySelector('.shop-tools');
  if (tools) {
    tools.classList.add('mq-tools');
    tools.appendChild(toggle.root);
  } else {
    grid.insertAdjacentElement('beforebegin', toggle.root);
  }

  const S = {
    view: storedView(),
    built: false,
    building: false,
    sel: 0,
    step: 0,
    visible: [],
    yaw: 0,
    yawTarget: 0,
    hover: null,
    dragging: false,
    pointer: null,
    lastX: 0,
    moved: 0,
    narrow: false,
    failed: false
  };

  const V = {
    renderer: null,
    scene: null,
    camera: null,
    rack: null,
    faces: [],
    raf: 0,
    last: 0,
    inView: false,
    observer: null
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  /* ---------- Daten aus dem Raster ---------- */

  function readProducts() {
    return Array.from(grid.querySelectorAll('.prod')).map((el, i) => {
      const img = el.querySelector('.ph img');
      return {
        el,
        index: i,
        href: el.getAttribute('href') || '#',
        name: text(el.querySelector('h3')),
        cat: text(el.querySelector('.cat')),
        price: text(el.querySelector('.price')).replace(/\s+/g, ' ').trim(),
        img,
        visible: true,
        slot: i,
        angle: 0,
        node: null,
        face: null,
        tex: null,
        canvas: null,
        lift: 0,
        tilt: 0
      };
    }).filter(p => p.name);
  }

  function text(el) {
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }

  function priceLabel(p) {
    const match = p.price.match(/^(.*?[€$]|Kostenlos|Free|Demo frei)/i);
    return (match ? match[1] : p.price).trim();
  }

  function hasWebGL() {
    try {
      const probe = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (probe.getContext('webgl2') || probe.getContext('webgl')));
    } catch (_) {
      return false;
    }
  }

  function storedView() {
    try { return localStorage.getItem('bw-shop-view') === '3d' ? '3d' : 'grid'; }
    catch (_) { return 'grid'; }
  }

  function storeView(view) {
    try { localStorage.setItem('bw-shop-view', view); } catch (_) { /* privater Modus */ }
  }

  /* ---------- Geruest ---------- */

  function createStage() {
    const root = document.createElement('div');
    root.className = 'mq-stage';
    root.hidden = true;

    const frame = document.createElement('div');
    frame.className = 'mq-frame';

    const canvas = document.createElement('canvas');
    canvas.className = 'mq-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    const kicker = document.createElement('span');
    kicker.className = 'mq-kicker';
    kicker.textContent = '// ' + T('Katalog', 'Catalogue');

    const num = document.createElement('span');
    num.className = 'mq-num';

    const hint = document.createElement('p');
    hint.className = 'mq-hint';
    hint.textContent = T('Ziehen dreht · Pfeiltasten wählen · Enter öffnet', 'Drag to turn · arrow keys select · Enter opens');

    const live = document.createElement('p');
    live.className = 'mq-live';
    live.setAttribute('aria-live', 'polite');

    const empty = document.createElement('div');
    empty.className = 'mq-empty';
    empty.hidden = true;
    const emptyTitle = document.createElement('b');
    emptyTitle.textContent = T('Keine Treffer', 'No matches');
    const emptyText = document.createElement('span');
    emptyText.textContent = T('Andere Suche oder Filter zurücksetzen.', 'Try another search or reset the filters.');
    empty.append(emptyTitle, emptyText);

    frame.append(canvas, kicker, num, hint, empty, live);

    const bar = document.createElement('div');
    bar.className = 'mq-bar';

    const copy = document.createElement('div');
    const cat = document.createElement('p');
    cat.className = 'mq-cat';
    const name = document.createElement('p');
    name.className = 'mq-name';
    const meta = document.createElement('p');
    meta.className = 'mq-meta';
    copy.append(cat, name, meta);

    const open = document.createElement('a');
    open.className = 'mq-open';
    open.href = '#';
    const openLabel = document.createElement('span');
    const openArrow = document.createElement('span');
    openArrow.setAttribute('aria-hidden', 'true');
    openArrow.textContent = '→';
    open.append(openLabel, openArrow);

    bar.append(copy, open);

    const rail = document.createElement('div');
    rail.className = 'mq-rail';
    rail.setAttribute('role', 'group');
    rail.setAttribute('aria-label', T('Produkte im Katalog', 'Products in the catalogue'));

    root.append(frame, bar, rail);

    return { root, frame, canvas, kicker, num, hint, live, empty, cat, name, meta, open, openLabel, rail };
  }

  function createToggle() {
    const root = document.createElement('div');
    root.className = 'mq-switch';
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', T('Shop-Ansicht', 'Shop view'));

    const gridBtn = document.createElement('button');
    gridBtn.type = 'button';
    gridBtn.dataset.view = 'grid';
    gridBtn.textContent = T('Raster', 'Grid');

    const threeBtn = document.createElement('button');
    threeBtn.type = 'button';
    threeBtn.dataset.view = '3d';
    threeBtn.textContent = '3D';

    root.append(gridBtn, threeBtn);
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      setView(btn.dataset.view);
    });

    return { root, gridBtn, threeBtn };
  }

  /* ---------- Ansicht wechseln ---------- */

  function setView(view) {
    if (S.failed) return;
    if (view === '3d') {
      ui.root.hidden = false;
      document.body.classList.add('mq-active');
      S.view = '3d';
      storeView('3d');
      paintToggle();
      ensureBuilt().then((ok) => {
        if (!ok) return;
        sync();
        startLoop();
      });
    } else {
      S.view = 'grid';
      storeView('grid');
      paintToggle();
      ui.root.hidden = true;
      document.body.classList.remove('mq-active');
      stopLoop();
    }
  }

  function paintToggle() {
    toggle.gridBtn.setAttribute('aria-pressed', String(S.view === 'grid'));
    toggle.threeBtn.setAttribute('aria-pressed', String(S.view === '3d'));
    ui.root.hidden = S.view !== '3d';
    document.body.classList.toggle('mq-active', S.view === '3d');
  }

  function fail() {
    S.failed = true;
    stopLoop();
    S.view = 'grid';
    document.body.classList.remove('mq-active');
    ui.root.remove();
    toggle.root.remove();
  }

  /* ---------- Szene ---------- */

  const CARD = { w: 0.92, h: 1.28, d: 0.05 };
  const RADIUS = 3.18;

  function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    const rr = Math.min(r, Math.min(w, h) / 2 - 0.01);
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

  async function ensureBuilt() {
    if (S.built) return true;
    if (S.building) return false;
    S.building = true;
    try {
      await build();
      S.built = true;
      S.building = false;
      ui.frame.classList.add('is-ready');
      return true;
    } catch (err) {
      S.building = false;
      fail();
      return false;
    }
  }

  async function build() {
    const renderer = new THREE.WebGLRenderer({
      canvas: ui.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearAlpha(0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1.7, 0.1, 60);

    const rack = new THREE.Group();
    scene.add(rack);

    /* Licht: warmes Studio, ein weiches Key-Light, ein Terrakotta-Rim. */
    scene.add(new THREE.HemisphereLight(0xfff8ec, 0xcfc3ab, 1.5));

    const key = new THREE.DirectionalLight(0xfff4e2, 2.5);
    key.position.set(2.9, 5.6, 5.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -5.4;
    key.shadow.camera.right = 5.4;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -2;
    key.shadow.bias = -0.0007;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffd3b8, 1.1);
    rim.position.set(-5.2, 2.8, -3.4);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xdfe9ff, 0.45);
    fill.position.set(-2.4, 1.2, 5.2);
    scene.add(fill);

    /* Boden: ein weicher Lichtfleck plus ein reiner Schattenfaenger. */
    const wash = new THREE.Mesh(
      new THREE.CircleGeometry(8.4, 64),
      new THREE.MeshBasicMaterial({ map: radialWash(), transparent: true, depthWrite: false })
    );
    wash.rotation.x = -Math.PI / 2;
    wash.position.y = -0.005;
    scene.add(wash);

    const catcher = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.ShadowMaterial({ color: 0x5a4632, opacity: 0.17 })
    );
    catcher.rotation.x = -Math.PI / 2;
    catcher.receiveShadow = true;
    scene.add(catcher);

    /* Karten */
    const geometry = cardGeometry();
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xe4d8c0, roughness: 0.94, metalness: 0 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xfbf6ea, roughness: 0.9, metalness: 0 });
    const faceGeo = new THREE.PlaneGeometry(CARD.w * 0.935, CARD.h * 0.95);

    await document.fonts.ready.catch(() => {});
    await Promise.all(products.map(preload));

    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    for (const p of products) {
      const node = new THREE.Group();
      node.visible = false;
      node.scale.setScalar(0.001);

      const body = new THREE.Mesh(geometry, [capMat, edgeMat]);
      body.castShadow = true;
      node.add(body);

      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 712;
      paintCard(cv, p);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;

      const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.84, metalness: 0 });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.set(0, CARD.h / 2, CARD.d / 2 + 0.012);
      face.userData.product = p;
      node.add(face);

      node.position.y = 0;
      rack.add(node);

      p.node = node;
      p.face = face;
      p.tex = tex;
      p.canvas = cv;
      V.faces.push(face);
    }

    V.renderer = renderer;
    V.scene = scene;
    V.camera = camera;
    V.rack = rack;

    resize();

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => resize()).observe(ui.frame);
    } else {
      window.addEventListener('resize', resize);
    }

    ui.frame.addEventListener('pointerdown', onDown);
    ui.frame.addEventListener('pointermove', onMove);
    ui.frame.addEventListener('pointerup', onUp);
    ui.frame.addEventListener('pointercancel', onUp);
    ui.frame.addEventListener('pointerleave', () => setHover(null));

    ui.rail.addEventListener('keydown', onRailKey);
    ui.rail.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-slot]');
      if (btn) select(Number(btn.dataset.slot));
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopLoop();
      else if (S.view === '3d' && V.inView) startLoop();
    });

    if ('IntersectionObserver' in window) {
      V.observer = new IntersectionObserver((entries) => {
        V.inView = entries.some((e) => e.isIntersecting);
        if (V.inView && S.view === '3d') startLoop();
        else stopLoop();
      }, { threshold: 0.08 });
      V.observer.observe(ui.frame);
    } else {
      V.inView = true;
    }
  }

  function cardGeometry() {
    const shape = roundedRect(CARD.w, CARD.h, 0.04);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: CARD.d,
      bevelEnabled: true,
      bevelSize: 0.007,
      bevelThickness: 0.007,
      bevelSegments: 2,
      curveSegments: 6
    });
    geo.translate(0, CARD.h / 2, -CARD.d / 2);
    geo.computeVertexNormals();
    return geo;
  }

  function radialWash() {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(255, 252, 243, 0.95)');
    g.addColorStop(0.55, 'rgba(247, 240, 226, 0.55)');
    g.addColorStop(1, 'rgba(238, 229, 211, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  async function preload(p) {
    const img = p.img;
    if (!img) return;
    try {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }
      if (img.decode) await img.decode().catch(() => {});
    } catch (_) { /* Bild fehlt: Initialen-Fallback */ }
  }

  /* ---------- Kartenbild ---------- */

  function paintCard(cv, p) {
    const W = cv.width;
    const H = cv.height;
    const ctx = cv.getContext('2d');
    const pad = 44;

    ctx.clearRect(0, 0, W, H);

    const paper = ctx.createLinearGradient(0, 0, 0, H);
    paper.addColorStop(0, '#fdfbf5');
    paper.addColorStop(0.58, '#f8f3e7');
    paper.addColorStop(1, '#f0e8d7');
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = '#8a7c63';
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const y = 22 + i * 27;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + ((i % 3) - 1) * 1.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(120, 104, 80, 0.26)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    /* Kopf */
    ctx.fillStyle = '#b04f31';
    ctx.font = '600 26px "Inter", system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(String(p.index + 1).padStart(2, '0'), pad, 82);

    const kind = (p.cat.split('·')[0] || '').trim().toUpperCase();
    ctx.fillStyle = '#8d8577';
    ctx.font = '500 16px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(kind.slice(0, 20), W - pad, 80);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(120, 104, 80, 0.2)';
    ctx.fillRect(pad, 104, W - pad * 2, 2);

    /* Logo */
    drawLogo(ctx, p, pad, 128, W - pad * 2, 288);

    /* Name */
    let size = 46;
    let lines = [];
    for (; size >= 26; size -= 2) {
      ctx.font = `500 ${size}px "Newsreader", Georgia, "Times New Roman", serif`;
      lines = wrap(ctx, p.name, W - pad * 2, 2);
      if (lines.length <= 2) break;
    }
    ctx.fillStyle = '#26231f';
    ctx.font = `500 ${size}px "Newsreader", Georgia, "Times New Roman", serif`;
    let baseline = 486;
    for (const line of lines) {
      ctx.fillText(line, pad, baseline);
      baseline += size * 1.08;
    }

    /* Kategorie */
    ctx.fillStyle = '#8d8577';
    ctx.font = '500 15px "Inter", system-ui, sans-serif';
    const catLine = p.cat.length > 34 ? p.cat.slice(0, 33) + '…' : p.cat;
    ctx.fillText(catLine, pad, Math.min(baseline + 16, H - 108));

    /* Preis */
    ctx.fillStyle = '#96402a';
    ctx.font = '500 31px "Newsreader", Georgia, serif';
    ctx.fillText(priceLabel(p), pad, H - 62);

    /* Pfeil */
    ctx.strokeStyle = '#b04f31';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W - pad - 30, H - 72);
    ctx.lineTo(W - pad, H - 72);
    ctx.moveTo(W - pad - 10, H - 80);
    ctx.lineTo(W - pad, H - 72);
    ctx.lineTo(W - pad - 10, H - 64);
    ctx.stroke();
  }

  function wrap(ctx, value, maxWidth, maxLines) {
    const words = String(value).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
        if (lines.length === maxLines) break;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    return lines.length ? lines : [''];
  }

  function drawLogo(ctx, p, x, y, w, h) {
    const img = p.img;
    const iw = img ? (img.naturalWidth || img.width || 0) : 0;
    const ih = img ? (img.naturalHeight || img.height || 0) : 0;
    if (img && iw && ih) {
      const scale = Math.min(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      try {
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        return;
      } catch (_) { /* Fallback unten */ }
    }
    const initials = p.name.split(/\s+/).slice(0, 2).map((word) => word[0] || '').join('').toUpperCase();
    ctx.fillStyle = 'rgba(176, 79, 49, 0.1)';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#96402a';
    ctx.font = '500 74px "Newsreader", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, x + w / 2, y + h / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  /* ---------- Layout & Synchronisation ---------- */

  function sync() {
    const previous = S.visible[S.sel];
    S.visible = products.filter((p) => !p.el.classList.contains('hide'));

    const count = S.visible.length;
    S.step = count > 1 ? Math.min(0.34, Math.max(0.17, 2.05 / (count - 1))) : 0;

    S.visible.forEach((p, i) => {
      p.visible = true;
      p.slot = i;
      p.angle = (i - (count - 1) / 2) * S.step;
    });

    products.forEach((p) => {
      if (S.visible.includes(p)) return;
      p.visible = false;
      p.slot = -1;
    });

    let index = 0;
    if (previous && previous.visible) index = S.visible.indexOf(previous);
    if (index < 0) index = 0;

    buildRail();
    select(index, { silent: true });

    ui.empty.hidden = count !== 0;
    ui.open.style.visibility = count ? '' : 'hidden';
    if (!count) {
      ui.cat.textContent = '';
      ui.name.textContent = T('Kein Produkt sichtbar', 'No product visible');
      ui.meta.textContent = '';
      ui.num.textContent = '00 / 00';
    }
  }

  function buildRail() {
    ui.rail.textContent = '';
    S.visible.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.slot = String(i);
      btn.setAttribute('aria-pressed', String(i === S.sel));
      const number = document.createElement('b');
      number.textContent = String(p.index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.textContent = p.name;
      btn.append(number, label);
      ui.rail.appendChild(btn);
    });
  }

  function select(index, options) {
    const count = S.visible.length;
    if (!count) return;
    S.sel = Math.max(0, Math.min(count - 1, index));
    S.yawTarget = -(S.sel - (count - 1) / 2) * S.step;
    if (S.dragging) S.yawTarget = S.yaw;

    paintBar();

    ui.rail.querySelectorAll('button[data-slot]').forEach((btn) => {
      const on = Number(btn.dataset.slot) === S.sel;
      btn.setAttribute('aria-pressed', String(on));
      if (on && !options?.silent && document.activeElement && ui.rail.contains(document.activeElement)) {
        btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
      }
    });
  }

  function paintBar() {
    const p = S.visible[S.sel];
    if (!p) return;
    ui.cat.textContent = p.cat;
    ui.name.textContent = p.name;
    ui.meta.textContent = priceLabel(p);
    ui.open.href = p.href;
    ui.openLabel.textContent = T('Produkt öffnen', 'Open product');
    ui.num.textContent = `${String(S.sel + 1).padStart(2, '0')} / ${String(S.visible.length).padStart(2, '0')}`;
    ui.live.textContent = `${p.name} — ${p.cat}`;
  }

  function setHover(product) {
    if (S.hover === product) return;
    S.hover = product;
    ui.frame.classList.toggle('is-hover', !!product);
  }

  /* ---------- Zeiger & Tastatur ---------- */

  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    S.dragging = true;
    S.pointer = e.pointerId;
    S.lastX = e.clientX;
    S.moved = 0;
    ui.frame.classList.add('is-grabbing');
    try { ui.frame.setPointerCapture(e.pointerId); } catch (_) { /* aeltere Browser */ }
    setHover(null);
  }

  function onMove(e) {
    if (S.dragging && e.pointerId === S.pointer) {
      const dx = e.clientX - S.lastX;
      S.lastX = e.clientX;
      S.moved += Math.abs(dx);
      S.yaw += dx * 0.0058;
      S.yawTarget = S.yaw;
      return;
    }
    if (e.pointerType === 'mouse') setHover(pickAt(e.clientX, e.clientY));
  }

  function onUp(e) {
    if (!S.dragging) return;
    S.dragging = false;
    ui.frame.classList.remove('is-grabbing');
    try { ui.frame.releasePointerCapture(S.pointer); } catch (_) { /* schon frei */ }
    S.pointer = null;

    if (S.moved < 6) {
      const product = pickAt(e.clientX, e.clientY);
      if (product && product.visible) {
        window.location.href = product.href;
        return;
      }
    }
    snap();
  }

  function snap() {
    const count = S.visible.length;
    if (!count) return;
    const center = (count - 1) / 2;
    const slot = Math.round(center - S.yaw / (S.step || 1));
    select(Math.max(0, Math.min(count - 1, slot)));
  }

  function pickAt(clientX, clientY) {
    if (!V.camera) return null;
    const rect = ui.canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, V.camera);
    const hit = raycaster.intersectObjects(V.faces, false)[0];
    return hit ? hit.object.userData.product : null;
  }

  function onRailKey(e) {
    const count = S.visible.length;
    if (!count) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      select(S.sel + delta);
      const btn = ui.rail.querySelector(`button[data-slot="${S.sel}"]`);
      if (btn) btn.focus({ preventScroll: true });
    }
  }

  /* ---------- Darstellung ---------- */

  function resize() {
    if (!V.renderer) return;
    const rect = ui.frame.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const aspect = width / height;
    S.narrow = width < 680;

    V.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, S.narrow ? 1.75 : 2));
    V.renderer.setSize(width, height, false);

    V.camera.aspect = aspect;
    V.camera.fov = S.narrow ? 44 : (aspect < 1.45 ? 39 : 34);
    V.camera.position.set(0, S.narrow ? 1.86 : 1.66, S.narrow ? 10.9 : 8.5);
    V.camera.lookAt(0, S.narrow ? 0.92 : 0.98, S.narrow ? 2.0 : 2.15);
    V.camera.updateProjectionMatrix();

    if (V.rack) V.rack.scale.setScalar(S.narrow ? 0.9 : 1);
    if (!V.raf) renderOnce();
  }

  function renderOnce() {
    if (V.renderer && V.scene && V.camera) V.renderer.render(V.scene, V.camera);
  }

  function startLoop() {
    if (V.raf || !V.renderer) return;
    V.last = performance.now();
    V.raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (!V.raf) return;
    cancelAnimationFrame(V.raf);
    V.raf = 0;
  }

  function tick(now) {
    V.raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, Math.max(0.001, (now - V.last) / 1000));
    V.last = now;

    const ease = 1 - Math.pow(0.0015, dt);
    if (!S.dragging) {
      S.yaw += (S.yawTarget - S.yaw) * ease;
      if (Math.abs(S.yawTarget - S.yaw) < 0.0004) S.yaw = S.yawTarget;
    }

    if (V.rack) V.rack.rotation.y = S.yaw;

    const time = reduced.matches ? 0 : now / 1000;
    const follow = 1 - Math.pow(0.02, dt);

    products.forEach((p) => {
      if (!p.node) return;

      const targetScale = p.visible ? 1 : 0.001;
      const scale = p.node.scale.x + (targetScale - p.node.scale.x) * follow;
      p.node.scale.setScalar(Math.max(0.001, scale));
      p.node.visible = scale > 0.02;

      p.node.rotation.y += (p.angle - p.node.rotation.y) * follow;

      const x = Math.sin(p.node.rotation.y) * RADIUS;
      const z = Math.cos(p.node.rotation.y) * RADIUS;
      p.node.position.x += (x - p.node.position.x) * follow;
      p.node.position.z += (z - p.node.position.z) * follow;

      const hovering = S.hover === p && p.visible;
      p.lift += ((hovering ? 0.085 : 0) - p.lift) * follow;
      p.tilt += ((hovering ? 0.075 : 0) - p.tilt) * follow;

      const breath = time ? Math.sin(time * 0.55 + p.index * 0.9) * 0.006 : 0;
      p.node.position.y = p.lift + breath;
      p.node.rotation.x = -p.tilt;

      if (p.face) p.face.visible = p.visible;
    });

    V.renderer.render(V.scene, V.camera);
  }

  /* ---------- Start ---------- */

  paintToggle();

  document.addEventListener('bw:shop', () => {
    if (!S.built) return;
    sync();
  });

  document.addEventListener('bw:lang', () => {
    if (!S.built) return;
    products.forEach((p) => {
      p.name = text(p.el.querySelector('h3'));
      p.cat = text(p.el.querySelector('.cat'));
      p.price = text(p.el.querySelector('.price')).replace(/\s+/g, ' ').trim();
      if (!p.canvas) return;
      paintCard(p.canvas, p);
      if (p.tex) p.tex.needsUpdate = true;
    });
    ui.kicker.textContent = '// ' + T('Katalog', 'Catalogue');
    ui.hint.textContent = T('Ziehen dreht · Pfeiltasten wählen · Enter öffnet', 'Drag to turn · arrow keys select · Enter opens');
    ui.openLabel.textContent = T('Produkt öffnen', 'Open product');
    sync();
  });

  if (S.view === '3d') {
    setView('3d');
  } else {
    paintToggle();
  }
}
