/* ============================================================
   BYTEWERK STUDIO — KARTEIKASTEN (404)
   ------------------------------------------------------------
   Fuenf echte Ziele als Karteikarten in einem flachen Kasten.
   Ziehen dreht den Kasten, Zeigen hebt eine Karte, Klicken folgt
   dem Ziel. Die Karten sind nur die sichtbare Form: die Links im
   Register darunter bleiben die Quelle und der Tastaturweg.

   - three.js lokal (vendor/, r180) — die CSP erlaubt nur 'self'
   - ohne WebGL oder bei Fehlern bleibt die CSS-Fassung stehen
   - prefers-reduced-motion: keine Drift, nur Reaktion auf Eingabe
   - rendert nur im Viewport und bei sichtbarem Tab
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const TAB_COLORS = ['#b04f31', '#8f7a52', '#4f7a63', '#3f3a33', '#c1734f'];

const figure = document.querySelector('#notfound');

if (figure) {
  try {
    boot(figure);
  } catch (err) {
    const stage = figure.querySelector('.nf-stage');
    if (stage) stage.classList.add('is-flat');
    if (window.console && console.warn) console.warn('[karteikasten] fallback:', err);
  }
}

function boot(figure) {
  const stage = figure.querySelector('.nf-stage');
  const canvas = figure.querySelector('.nf-canvas');
  if (!stage || !canvas) return;

  /* ---------- Die Links sind die Wahrheit ---------- */
  const links = Array.from(document.querySelectorAll('[data-nf-card]'));
  if (!links.length) return;

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Renderer ---------- */
  /* Erst pruefen, dann bauen: ohne WebGL wuerde three.js selbst
     console.error schreiben. Der Fallback bleibt so still. */
  if (!hasWebGL()) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1.18, 0.1, 60);

  /* ---------- Licht: warmes Studio, kein Neon ---------- */
  scene.add(new THREE.HemisphereLight(0xfffbf3, 0xcbc0ab, 1.5));

  const key = new THREE.DirectionalLight(0xfff4e6, 2.1);
  key.position.set(-2.6, 4.6, 3.4);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffe9d6, 0.55);
  rim.position.set(3.4, 1.6, -2.6);
  scene.add(rim);

  /* ---------- Gemeinsame Texturen ---------- */
  const grain = grainTexture();
  const blob = softBlobTexture();

  function paper(color, roughness) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: roughness === undefined ? 0.94 : roughness,
      metalness: 0,
      bumpMap: grain,
      bumpScale: 0.003
    });
  }

  const mat = {
    tray: paper(0xece3d1, 0.96),
    rail: paper(0xdfd4bd, 0.94),
    lip: paper(0xb04f31, 0.88)
  };

  /* ---------- Kasten ---------- */
  const model = new THREE.Group();
  model.rotation.y = 0;
  scene.add(model);

  const CARD_W = 0.86;
  const CARD_H = 1.16;
  const SPACING = 0.735;
  const LEAN = -0.085;
  const FLOOR_Y = 0.072;

  const trayW = CARD_W + (links.length - 1) * SPACING + 0.56;

  const floor = slab(trayW, 0.98, 0.072, 0.14, mat.tray);
  const floorWidth = trayW;
  floor.position.y = 0;
  model.add(floor);

  const rail = slab(trayW, 0.075, 0.115, 0.04, mat.rail);
  rail.position.set(0, FLOOR_Y + 0.055, -0.46);
  model.add(rail);

  const lip = slab(trayW - 0.06, 0.06, 0.075, 0.02, mat.lip);
  lip.position.set(0, FLOOR_Y + 0.028, 0.46);
  model.add(lip);

  const underTray = new THREE.Mesh(
    new THREE.PlaneGeometry(trayW + 2.1, 3.4),
    new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, opacity: 0.85 })
  );
  underTray.rotation.x = -Math.PI / 2;
  underTray.position.y = -0.004;
  underTray.renderOrder = 0;
  model.add(underTray);

  /* ---------- Karten ---------- */
  const cards = links.map((link, index) => {
    const label = pickLabel(link);
    const number = String(index + 1).padStart(2, '0');
    const texture = cardTexture(number, label, pickHint(link));
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    /* Die Karte ist bedrucktes Papier: unbeleuchtet gerendert, damit
       Schrift und Register exakt die gezeichneten Farben behalten.
       Volumen und Licht kommen vom Kasten und den Schatten darunter. */
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.45,
      toneMapped: false
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), material);
    mesh.renderOrder = 3;

    mesh.userData = {
      link,
      index,
      texture,
      label,
      hint: pickHint(link),
      base: mesh.position.clone(),
      baseRot: new THREE.Euler(),
      lift: 0,
      hover: 0
    };

    model.add(mesh);

    /* weicher Kontaktschatten je Karte */
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W * 1.5, 0.52),
      new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false, opacity: 0.36 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(mesh.position.x, FLOOR_Y + 0.004, 0.16);
    shadow.renderOrder = 1;
    model.add(shadow);

    mesh.userData.shadow = shadow;
    return mesh;
  });

  /* ---------- Kamera einpassen ---------- */
  const center = new THREE.Vector3();
  let corners = [];
  const dir = new THREE.Vector3();
  const probe = new THREE.Vector3();
  let elev = 0.215;

  /* Zwei Anordnungen aus derselben Szene:
     - breite Buehne: fuenf Karten in einer Reihe
     - schmale Buehne: dieselben Karten als Diagonal-Kaskade
     So bleibt auf dem Telefon jede Karte gross genug zum Treffen. */
  function layout(aspect) {
    const cascade = aspect < 1.55;
    const tight = aspect < 1.2;
    const mid = (cards.length - 1) / 2;

    cards.forEach((card, index) => {
      const data = card.userData;

      if (tight) {
        /* Schmale Buehne: gestaffelter Stapel. Jede Karte bleibt
           gross, die Registerbaender liegen versetzt uebereinander. */
        const t = index - mid;
        card.position.set(
          t * 0.055,
          FLOOR_Y + Math.cos(LEAN) * CARD_H / 2 + t * 0.118,
          -t * 0.03
        );
        card.rotation.set(LEAN, 0, 0);
      } else if (cascade) {
        const t = index - mid;
        card.position.set(
          t * 0.245,
          FLOOR_Y + Math.cos(LEAN) * CARD_H / 2 - t * 0.145,
          -t * 0.07
        );
        card.rotation.set(LEAN, t * 0.028, t * -0.022);
      } else {
        card.position.set(
          (index - mid) * SPACING,
          FLOOR_Y + Math.cos(LEAN) * CARD_H / 2,
          0
        );
        card.rotation.set(LEAN, 0, 0);
      }

      data.base.copy(card.position);
      data.baseRot.set(card.rotation.x, card.rotation.y, card.rotation.z);

      if (data.shadow) {
        data.shadow.position.set(card.position.x, FLOOR_Y + 0.004, 0.16 - card.position.z);
      }
    });

    /* Tablett folgt der Anordnung. */
    const trayW = tight
      ? CARD_W + 0.5
      : (cascade ? 3.5 : CARD_W + (cards.length - 1) * SPACING + 0.56);
    floor.scale.x = trayW / floorWidth;
    rail.scale.x = trayW / floorWidth;
    lip.scale.x = (trayW - 0.06) / floorWidth;

    model.updateMatrixWorld(true);

    const box = new THREE.Box3();
    cards.forEach((m) => {
      m.geometry.computeBoundingBox();
      const bb = m.geometry.boundingBox.clone();
      bb.applyMatrix4(m.matrixWorld);
      box.union(bb);
    });

    box.getCenter(center);
    center.y = Math.min(center.y + 0.03, 0.92);
    corners = boxCorners(box);
    elev = cascade ? 0.30 : 0.215;
  }

  function place(distance) {
    const cy = Math.cos(elev);
    dir.set(Math.sin(yaw) * cy, Math.sin(elev), Math.cos(yaw) * cy);
    camera.position.copy(center).addScaledVector(dir, distance);
    camera.lookAt(center);
  }

  function fit() {
    const keepYaw = yaw;
    yaw = 0;
    const extent = (d) => {
      place(d);
      camera.updateMatrixWorld();
      let worst = 0;
      for (let c = 0; c < corners.length; c++) {
        probe.copy(corners[c]).project(camera);
        worst = Math.max(worst, Math.abs(probe.x), Math.abs(probe.y));
      }
      return worst;
    };

    /* Das Verhaeltnis ist monoton: naeher = groesser. Bisektion ist
       stabiler als eine Multiplikationsschleife, die um den Zielwert
       pendelt. Ziel: die Karten fuellen 94 % der kuerzeren Achse. */
    const target = 0.82;
    let near = 0.4;
    let far = 24;
    for (let i = 0; i < 26; i++) {
      const mid = (near + far) / 2;
      if (extent(mid) > target) near = mid;
      else far = mid;
    }
    yaw = keepYaw;
    return far;
  }

  /* ---------- Zustand ---------- */
  let distance = 6;
  let yaw = 0;
  let yawTarget = 0;
  let hoverIndex = -1;
  let dragging = false;
  let moved = 0;
  let pointerId = null;
  let lastX = 0;
  let raf = 0;
  let last = 0;
  let time = 0;
  let visible = true;

  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function setHover(index) {
    if (index === hoverIndex) return;
    hoverIndex = index;
    canvas.classList.toggle('is-over', index >= 0);

    cards.forEach((card, i) => {
      const link = card.userData.link;
      if (!link) return;
      if (i === index) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return -1;
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(cards, false);
    return hits.length ? hits[0].object.userData.index : -1;
  }

  /* ---------- Eingabe ---------- */
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    moved = 0;
    pointerId = event.pointerId;
    lastX = event.clientX;
    canvas.classList.add('is-dragging');
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(event.pointerId); } catch (err) { /* egal */ }
    }
    kick();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (dragging && event.pointerId === pointerId) {
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      moved += Math.abs(dx);
      yawTarget = clamp(yawTarget + dx * 0.0042, -0.34, 0.34);
      kick();
      return;
    }

    if (event.pointerType === 'touch') return;
    setHover(pick(event));
    kick();
  });

  function stop(event) {
    if (!dragging) return;
    dragging = false;
    pointerId = null;
    canvas.classList.remove('is-dragging');

    if (moved < 7) {
      const index = pick(event);
      if (index >= 0) {
        const card = cards[index];
        const href = card.userData.link.getAttribute('href');
        if (href) {
          window.location.assign(href);
          return;
        }
      }
    }
    kick();
  }

  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  canvas.addEventListener('pointerleave', () => {
    if (!dragging) setHover(-1);
  });

  canvas.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    setHover(pick(event));
  });

  /* Register loest die Karte mit aus: gleiche Sprache, ein Zustand. */
  links.forEach((link) => {
    const index = cards.findIndex((c) => c.userData.link === link);
    link.addEventListener('pointerenter', () => setHover(index));
    link.addEventListener('focus', () => { setHover(index); kick(); });
    link.addEventListener('blur', () => setHover(-1));
  });

  /* ---------- Zeichnen ---------- */
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;

    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    if (!reduceMQ.matches && !dragging) {
      time += dt;
      yawTarget = clamp(yawTarget + Math.sin(time * 0.26) * 0.00019, -0.2, 0.2);
    }

    yaw = reduceMQ.matches ? yawTarget : yaw + (yawTarget - yaw) * (1 - Math.exp(-7 * dt));

    cards.forEach((card, i) => {
      const on = i === hoverIndex;
      const data = card.userData;
      data.lift = data.lift + ((on ? 1 : 0) - data.lift) * (1 - Math.exp(-9 * dt));

      card.position.y = data.base.y + data.lift * 0.16;
      card.position.z = data.base.z + data.lift * 0.3;
      card.rotation.x = data.baseRot.x + data.lift * 0.12;

      if (data.shadow) {
        data.shadow.position.set(data.base.x, FLOOR_Y + 0.004, 0.16 - data.base.z + data.lift * 0.22);
        data.shadow.scale.setScalar(1 + data.lift * 0.1);
        data.shadow.material.opacity = 0.36 - data.lift * 0.12;
      }
    });

    place(distance);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);

    raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (raf || !visible || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  /* ---------- Groesse ---------- */
  function resize() {
    const w = Math.max(1, Math.round(stage.clientWidth));
    const h = Math.max(1, Math.round(stage.clientHeight));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout(w / h);
    distance = fit();
    place(distance);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  }

  /* ---------- Sprache ---------- */
  function relabel() {
    cards.forEach((card) => {
      const label = pickLabel(card.userData.link);
      const hint = pickHint(card.userData.link);
      if (label === card.userData.label && hint === card.userData.hint) return;
      card.userData.label = label;
      card.userData.hint = hint;
      drawCard(card.userData.texture.image, card.userData.index, label, hint);
      card.userData.texture.needsUpdate = true;
    });
  }

  document.addEventListener('bw:lang', relabel);

  /* ---------- Sichtbarkeit ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) kick();
    }, { rootMargin: '120px 0px' }).observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) kick();
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { resize(); kick(); }).observe(stage);
  } else {
    window.addEventListener('resize', () => { resize(); kick(); });
  }

  if (reduceMQ.addEventListener) {
    reduceMQ.addEventListener('change', () => {
      yaw = yawTarget;
      kick();
    });
  }

  /* ---------- Start ---------- */
  resize();
  stage.classList.remove('is-flat');
  kick();

  /* ---------- Bausteine ---------- */
  function cardTexture(number, label, hint) {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 860;
    drawCard(c, number, label, hint);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function drawCard(c, number, label, hint) {
    const ctx = c.getContext('2d');
    const W = c.width;
    const H = c.height;
    ctx.clearRect(0, 0, W, H);

    const index = Number(number) - 1;
    const TAB_H = 112;
    const R = 22;

    /* Karte */
    roundRect(ctx, 8, 8, W - 16, H - 16, R);
    const fill = ctx.createLinearGradient(0, TAB_H, W * 0.35, H);
    fill.addColorStop(0, '#fdfaf3');
    fill.addColorStop(0.6, '#f8f3e6');
    fill.addColorStop(1, '#ece2ce');
    ctx.fillStyle = fill;
    ctx.fill();

    /* Registerband */
    ctx.save();
    ctx.clip();
    ctx.fillStyle = TAB_COLORS[index % TAB_COLORS.length];
    ctx.fillRect(8, 8, W - 16, TAB_H);
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#fffaf3';
    for (let x = 8; x < W; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x, TAB_H + 8);
      ctx.stroke();
    }
    ctx.restore();

    /* Rand */
    roundRect(ctx, 8, 8, W - 16, H - 16, R);
    ctx.strokeStyle = 'rgba(150, 138, 116, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    /* Trennlinie unter dem Register */
    ctx.beginPath();
    ctx.moveTo(8, TAB_H + 8);
    ctx.lineTo(W - 8, TAB_H + 8);
    ctx.strokeStyle = 'rgba(150, 138, 116, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Nummer und Titel im Registerband */
    ctx.fillStyle = 'rgba(255, 250, 243, 0.98)';
    ctx.font = '600 54px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(number, 44, 80);

    let tsize = 34;
    ctx.font = '500 ' + tsize + 'px ui-monospace, "SF Mono", Menlo, monospace';
    const limit = W - 200;
    while (ctx.measureText(label.toUpperCase()).width > limit && tsize > 19) {
      tsize -= 2;
      ctx.font = '500 ' + tsize + 'px ui-monospace, "SF Mono", Menlo, monospace';
    }
    pushSpaced(ctx, label.toUpperCase(), 152, 78, tsize, 3.1, 'rgba(255, 250, 243, 0.98)');

    /* Notizlinien wie auf einer Karteikarte */
    ctx.strokeStyle = 'rgba(150, 138, 116, 0.22)';
    ctx.lineWidth = 1.5;
    for (let y = TAB_H + 300; y < H - 150; y += 42) {
      ctx.beginPath();
      ctx.moveTo(46, y);
      ctx.lineTo(W - 46, y);
      ctx.stroke();
    }

    /* Titel */
    let size = 116;
    ctx.font = '500 ' + size + 'px Georgia, "Times New Roman", serif';
    while (ctx.measureText(label).width > W - 132 && size > 52) {
      size -= 4;
      ctx.font = '500 ' + size + 'px Georgia, "Times New Roman", serif';
    }
    ctx.fillStyle = '#221f1c';
    ctx.fillText(label, 44, TAB_H + 208);

    /* Zielzeile unter dem Titel */
    if (hint) {
      ctx.fillStyle = '#8a7f6c';
      ctx.font = '400 25px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillText(hint, 46, TAB_H + 250);
    }

    /* Stempel: rund, dezent, terrakotta */
    ctx.save();
    ctx.translate(W - 106, H - 236);
    ctx.rotate(-0.14);
    ctx.strokeStyle = 'rgba(176, 79, 49, 0.34)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(176, 79, 49, 0.5)';
    ctx.font = '600 15px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BYTEWERK', 0, -6);
    ctx.fillText('STUDIO', 0, 14);
    ctx.restore();
    ctx.textAlign = 'left';

    /* Unterzeile */
    pushSpaced(ctx, 'BYTEWERKSTUDIO.COM', 46, H - 60, 17, 2.4, '#ac9f88');

    /* Pfeil */
    ctx.fillStyle = '#b04f31';
    ctx.font = '500 66px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'right';
    ctx.fillText('\u2192', W - 48, H - 46);
    ctx.textAlign = 'left';
  }

  function pushSpaced(ctx, text, x, y, size, spacing, color) {
    ctx.font = '500 ' + size + 'px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.fillStyle = color;
    let cursor = x;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], cursor, y);
      cursor += ctx.measureText(text[i]).width + spacing;
    }
  }

  function pickLabel(link) {
    const en = (document.documentElement.lang || 'de').toLowerCase().startsWith('en');
    if (en && link.dataset.nfEn) return link.dataset.nfEn;
    if (link.dataset.nfDe) return link.dataset.nfDe;
    return (link.textContent || '').trim();
  }

  function pickHint(link) {
    const en = (document.documentElement.lang || 'de').toLowerCase().startsWith('en');
    return (en ? link.dataset.nfHintEn : link.dataset.nfHintDe) || '';
  }
}

/* ---------- Geometrie ---------- */
function slab(w, d, h, r, material) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  const rad = Math.min(r, w / 2, d / 2);

  shape.moveTo(x + rad, y);
  shape.lineTo(x + w - rad, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + rad);
  shape.lineTo(x + w, y + d - rad);
  shape.quadraticCurveTo(x + w, y + d, x + w - rad, y + d);
  shape.lineTo(x + rad, y + d);
  shape.quadraticCurveTo(x, y + d, x, y + d - rad);
  shape.lineTo(x, y + rad);
  shape.quadraticCurveTo(x, y, x + rad, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, h - 0.006),
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 6,
    steps: 1
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeBoundingBox();
  geometry.translate(0, -geometry.boundingBox.min.y, 0);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function boxCorners(box) {
  const out = [];
  [box.min.x, box.max.x].forEach((x) => {
    [box.min.y, box.max.y].forEach((y) => {
      [box.min.z, box.max.z].forEach((z) => out.push(new THREE.Vector3(x, y, z)));
    });
  });
  return out;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hasWebGL() {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch (err) {
    return false;
  }
}

/* ---------- Texturen ---------- */
function grainTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 170 + Math.floor(Math.random() * 80);
    image.data[i * 4] = v;
    image.data[i * 4 + 1] = v;
    image.data[i * 4 + 2] = v;
    image.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function softBlobTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(44, 38, 31, 0.30)');
  grad.addColorStop(0.38, 'rgba(44, 38, 31, 0.15)');
  grad.addColorStop(0.7, 'rgba(44, 38, 31, 0.045)');
  grad.addColorStop(1, 'rgba(44, 38, 31, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
