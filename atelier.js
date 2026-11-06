/* ============================================================
   BYTEWERK STUDIO — ATELIER
   ------------------------------------------------------------
   Die 3D-Werkbank auf studio.html: vier Stationen (Entwurf,
   Bau, Pruefung, Uebergabe) liegen als Papierkoerper auf einer
   warmen Unterlage.

   Kein Build, kein Netzwerk: three.js liegt lokal unter vendor/,
   weil die CSP der Seiten nur script-src 'self' erlaubt.

   Markup-Vertrag
   - [data-atelier-stage]      Buehne (Quadrat via CSS)
   - .atl-tag[data-station]    vier Stationsknöpfe
   - .atl-step[data-station]   vier Textabschnitte (#atl-01..04)

   Verhalten
   - Ohne WebGL oder bei einem Fehler bleibt das SVG stehen.
   - prefers-reduced-motion: keine Dauerbewegung; die Szene
     rendert nur, solange sich etwas bewegt.
   - Pause ausserhalb des Viewports und bei verstecktem Tab.
   - Alle Inhalte stehen im HTML; die Buehne ist reine Grafik.
   ============================================================ */

const stage = document.querySelector('[data-atelier-stage]');

if (stage) {
  init(stage).catch(() => {
    stage.classList.remove('is-live');
  });
}

async function init(root) {
  if (!hasWebGL()) return;

  let THREE;
  try {
    THREE = await import('./vendor/three.module.min.js');
  } catch (err) {
    return;
  }

  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Gleiche Regel wie scene3d.js: der Schalter der Seite schreibt
     'bw-motion' in localStorage, 'off' pausiert auch hier. */
  function motionWanted() {
    let stored = null;
    try { stored = localStorage.getItem('bw-motion'); } catch (e) { /* Storage gesperrt */ }
    if (stored === 'off') return false;
    if (stored === 'on') return true;
    return !reducedQuery.matches;
  }

  let reduced = !motionWanted();

  const C = {
    paper: 0xfaf7ef,
    paper2: 0xefe7d6,
    paper3: 0xe2d7c1,
    bench: 0xdfd2b8,
    ink: 0x2b2722,
    accent: 0xb04f31,
    sage: 0x4f7a63
  };

  /* ---------- Geometrie ---------- */

  function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2 - 0.005));
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

  function material(color, extra) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color,
      roughness: 0.93,
      metalness: 0
    }, extra || {}));
  }

  /* Feine Tuschekante: gibt den Papierkoerpern Halt vor hellem Grund. */
  function withInk(mesh, geo, opacity) {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 26),
      new THREE.LineBasicMaterial({
        color: 0x3a342b,
        transparent: true,
        opacity: opacity === undefined ? 0.34 : opacity,
        depthWrite: false
      })
    );
    mesh.add(edges);
    return mesh;
  }

  function board(w, d, t, r, mat, ink) {
    const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
      depth: t,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 2,
      curveSegments: 6,
      steps: 1
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -t / 2, 0);
    geo.computeVertexNormals();
    return withInk(new THREE.Mesh(geo, mat), geo, ink);
  }

  function panel(w, h, t, r, mat, ink) {
    const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
      depth: t,
      bevelEnabled: true,
      bevelSize: 0.005,
      bevelThickness: 0.005,
      bevelSegments: 2,
      curveSegments: 6,
      steps: 1
    });
    geo.translate(0, 0, -t / 2);
    geo.computeVertexNormals();
    return withInk(new THREE.Mesh(geo, mat), geo, ink);
  }

  function shadowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(74, 58, 40, 0.42)');
    g.addColorStop(0.5, 'rgba(74, 58, 40, 0.18)');
    g.addColorStop(1, 'rgba(74, 58, 40, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function glowTexture() {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(176, 79, 49, 0.34)');
    g.addColorStop(0.48, 'rgba(176, 79, 49, 0.14)');
    g.addColorStop(1, 'rgba(176, 79, 49, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* Punktpapier: ruhiger als ein Liniengitter und passt zum Atelier. */
  function dotTexture(rendererInstance) {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const step = 32;
    for (let y = step / 2; y < size; y += step) {
      for (let x = step / 2; x < size; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 134, 106, 0.62)';
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(9, 9);
    tex.anisotropy = Math.min(4, rendererInstance.capabilities.getMaxAnisotropy());
    return tex;
  }

  /* ---------- Die vier Stationen ---------- */

  /* 01 Entwurf: geschichtete Blaetter mit Raster und Markierung. */
  function stationDraft() {
    const g = new THREE.Group();
    const layers = [C.paper3, C.paper2, C.paper, C.paper];

    for (let i = 0; i < 4; i++) {
      const plate = board(1.24, 0.96, 0.07, 0.05, material(layers[i]), 0.32);
      plate.position.set(i * 0.016, i * 0.115, -i * 0.022);
      plate.rotation.y = (i - 1.5) * 0.04;
      g.add(plate);
    }

    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.004, 0.012),
        material(C.ink, { roughness: 0.9 })
      );
      line.position.set(0, 0.386, -0.3 + i * 0.2);
      line.rotation.y = 0.06;
      g.add(line);
    }
    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.004, 0.66),
        material(C.ink, { roughness: 0.9 })
      );
      line.position.set(-0.3 + i * 0.2, 0.386, 0);
      line.rotation.y = 0.06;
      g.add(line);
    }

    const mark = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.014, 24),
      material(C.accent, { roughness: 0.75 })
    );
    mark.position.set(0.24, 0.395, 0.14);
    g.add(mark);

    return g;
  }

  /* 02 Bau: gestapelte Bauteile, eine Ebene schwebt darueber. */
  function stationBuild() {
    const g = new THREE.Group();

    const base = board(1.26, 1.0, 0.12, 0.05, material(C.paper3), 0.34);
    base.position.y = 0.06;
    g.add(base);

    const mid = board(0.92, 0.72, 0.1, 0.05, material(C.paper2), 0.32);
    mid.position.set(-0.03, 0.19, 0.02);
    mid.rotation.y = -0.06;
    g.add(mid);

    const top = board(0.6, 0.46, 0.08, 0.04, material(C.paper), 0.34);
    top.position.set(0.04, 0.3, -0.03);
    top.rotation.y = 0.05;
    g.add(top);

    const flying = board(0.44, 0.34, 0.05, 0.035, material(C.accent, { roughness: 0.78 }), 0.22);
    flying.position.set(0.3, 0.66, 0.16);
    flying.rotation.set(0.06, 0.32, -0.08);
    g.add(flying);

    [[-0.56, -0.42], [0.56, -0.42], [-0.56, 0.42], [0.56, 0.42]].forEach((p) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, 0.2, 10),
        material(C.sage, { roughness: 0.85 })
      );
      post.position.set(p[0], 0.22, p[1]);
      g.add(post);
    });

    return g;
  }

  /* 03 Pruefung: Geraetekorpus mit Pruefhaken und Lineal. */
  function stationCheck() {
    const g = new THREE.Group();

    const body = panel(0.78, 1.14, 0.08, 0.1, material(C.paper), 0.34);
    body.position.set(-0.08, 0.6, 0.02);
    body.rotation.set(-0.05, 0.1, -0.02);
    g.add(body);

    const screen = panel(0.64, 0.94, 0.03, 0.07, material(C.ink, { roughness: 0.6 }), 0.12);
    screen.position.set(-0.08, 0.62, 0.08);
    screen.rotation.set(-0.05, 0.1, -0.02);
    g.add(screen);

    [0.92, 0.76, 0.6].forEach((y, i) => {
      const row = panel(0.44, 0.07, 0.012, 0.03, material(i < 2 ? C.sage : C.paper3, { roughness: 0.85 }), 0.1);
      row.position.set(-0.14, y, 0.105);
      row.rotation.set(-0.05, 0.1, -0.02);
      g.add(row);

      const dot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.012, 16),
        material(i < 2 ? C.paper : C.accent, { roughness: 0.8 })
      );
      dot.rotation.x = Math.PI / 2;
      dot.position.set(0.1, y, 0.112);
      dot.rotation.z = 0.1;
      g.add(dot);
    });

    const ruler = board(0.16, 0.94, 0.035, 0.02, material(C.paper2), 0.3);
    ruler.position.set(0.42, 0.02, 0.24);
    ruler.rotation.y = -0.2;
    g.add(ruler);

    return g;
  }

  /* 04 Uebergabe: Kiste mit Deckel, Band und Dokumenten. */
  function stationHandover() {
    const g = new THREE.Group();

    const box = board(0.92, 0.7, 0.46, 0.05, material(C.paper2), 0.34);
    box.position.set(-0.1, 0.23, 0.04);
    g.add(box);

    const lid = board(1.0, 0.78, 0.07, 0.05, material(C.paper), 0.34);
    lid.position.set(-0.1, 0.5, 0.04);
    lid.rotation.y = 0.04;
    g.add(lid);

    const band = board(0.2, 0.74, 0.48, 0.02, material(C.accent, { roughness: 0.8 }), 0.16);
    band.position.set(0.1, 0.23, 0.04);
    g.add(band);

    [0, 1].forEach((i) => {
      const doc = panel(0.42, 0.56, 0.025, 0.02, material(i === 0 ? C.paper : C.paper3), 0.3);
      doc.position.set(0.5 - i * 0.05, 0.44 + i * 0.03, -0.14 - i * 0.05);
      doc.rotation.set(-0.42, 0.28 + i * 0.06, 0);
      g.add(doc);
    });

    return g;
  }

  /* ---------- Szene ---------- */

  const scene = new THREE.Scene();

  /* Blickwinkel so gewaehlt, dass die vier Koerper das Quadrat fuellen,
     ohne die Randbereiche der Buehne zu beruehren. */
  const ELEVATION = 34 * Math.PI / 180;
  const DISTANCE = 8.9;
  const TARGET = new THREE.Vector3(0, 0.52, 0);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setClearAlpha(0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  root.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd6c7ad, 1.2));

  const key = new THREE.DirectionalLight(0xfff5e6, 2.15);
  key.position.set(4.6, 9, 6.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe9f2e9, 0.55);
  fill.position.set(-7, 4, 1);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe9d8, 0.45);
  rim.position.set(-2, 3.4, -8);
  scene.add(rim);

  const world = new THREE.Group();
  scene.add(world);

  /* Die Unterlage ist absichtlich groesser als der Ausschnitt: sie
     laeuft an allen Kanten aus dem Bild und bildet so den Grund. */
  const bench = board(20, 20, 0.22, 1.6, material(C.bench, { roughness: 0.99 }), 0.12);
  bench.position.set(0, -0.11, -2);
  world.add(bench);

  const dots = new THREE.Mesh(
    new THREE.PlaneGeometry(19.4, 19.4),
    new THREE.MeshBasicMaterial({ map: dotTexture(renderer), transparent: true, depthWrite: false, opacity: 0.5 })
  );
  dots.rotation.x = -Math.PI / 2;
  dots.position.set(0, 0.004, -2);
  world.add(dots);

  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.9
  });

  const glowMap = glowTexture();

  const builders = [stationDraft, stationBuild, stationCheck, stationHandover];

  /* 01 hinten links, 03 hinten rechts, 02 vorn links, 04 vorn rechts:
     die erhoehte Pruefstation steht frei, die flachen Koerper davor. */
  const layout = [
    { x: -0.68, z: -0.64, ry: -0.04 },
    { x: -1.22, z: 0.50, ry: 0.09 },
    { x: 0.68, z: -0.66, ry: 0.12 },
    { x: 1.20, z: 0.52, ry: -0.07 }
  ];

  const unit = 0.86;

  const stations = builders.map((build, i) => {
    const group = build();
    group.position.set(layout[i].x, 0, layout[i].z);
    group.rotation.y = layout[i].ry;
    group.scale.setScalar(unit);
    group.userData.phase = i * 1.4;
    group.userData.lift = 0;
    group.userData.baseRy = layout[i].ry;
    world.add(group);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 1.72), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.setScalar(unit);
    shadow.position.set(layout[i].x, 0.008, layout[i].z);
    world.add(shadow);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.9),
      new THREE.MeshBasicMaterial({ map: glowMap, transparent: true, depthWrite: false, opacity: 0 })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(layout[i].x, 0.011, layout[i].z);
    world.add(glow);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.712, 72),
      new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.scale.setScalar(unit);
    ring.position.set(layout[i].x, 0.013, layout[i].z);
    world.add(ring);

    return { group, ring, glow, index: i };
  });

  /* ---------- Zustand ---------- */

  const tags = Array.from(document.querySelectorAll('.atl-tag[data-station]'));
  const steps = Array.from(document.querySelectorAll('.atl-step[data-station]'));
  const status = document.querySelector('[data-atelier-status]');

  let active = 0;
  let spin = 0;
  let spinTarget = 0;
  let tilt = 0;
  let tiltTarget = 0;
  let px = 0;
  let py = 0;
  let pxTarget = 0;
  let pyTarget = 0;
  let dragging = false;
  let moved = false;
  let dragStart = null;
  let elapsed = 0;
  let last = 0;
  let running = false;
  let frame = 0;
  let inView = true;
  let pageVisible = true;

  function setActive(index, announce) {
    active = index;

    tags.forEach((tag, i) => {
      const on = i === index;
      tag.classList.toggle('is-active', on);
      tag.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === index);
    });

    if (announce && status && tags[index]) {
      const label = tags[index].querySelector('span');
      status.textContent = 'Station ' + (index + 1) + ': ' + (label ? label.textContent : '');
    }

    wake();
  }

  tags.forEach((tag, i) => {
    tag.addEventListener('pointerenter', () => setActive(i, false));
    tag.addEventListener('focus', () => setActive(i, true));
    tag.addEventListener('click', () => setActive(i, true));
  });

  /* ---------- Zeiger ---------- */

  const canvas = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  /* Die Tuschekanten sind Linien; ohne kleines Limit wuerden sie
     schon aus einem Weltmeter Entfernung getroffen. */
  raycaster.params.Line.threshold = 0.015;
  const pointer = new THREE.Vector2();

  function localPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1
    };
  }

  function isDescendant(node, parent) {
    let cur = node;
    while (cur) {
      if (cur === parent) return true;
      cur = cur.parent;
    }
    return false;
  }

  function stationAt(e) {
    const p = localPoint(e);
    pointer.set(p.x, -p.y);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(stations.map((s) => s.group), true);
    if (!hits.length) return -1;
    const owner = stations.find((s) => isDescendant(hits[0].object, s.group));
    return owner ? owner.index : -1;
  }

  canvas.addEventListener('pointermove', (e) => {
    if (dragging && dragStart) {
      spinTarget = clamp(dragStart.spin + (e.clientX - dragStart.x) * 0.0052, -0.3, 0.3);
      tiltTarget = clamp(dragStart.tilt + (e.clientY - dragStart.y) * 0.0022, -0.05, 0.09);
      if (Math.abs(e.clientX - dragStart.x) > 4 || Math.abs(e.clientY - dragStart.y) > 4) moved = true;
      wake();
      return;
    }

    const p = localPoint(e);
    pxTarget = p.x * 0.05;
    pyTarget = p.y * 0.03;

    const index = stationAt(e);
    if (index >= 0 && index !== active) setActive(index, false);
    else wake();
  });

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    dragStart = { x: e.clientX, y: e.clientY, spin: spinTarget, tilt: tiltTarget };
    canvas.setPointerCapture(e.pointerId);
    root.style.cursor = 'grabbing';
    wake();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    dragStart = null;
    root.style.cursor = '';
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    wake();
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => {
    pxTarget = 0;
    pyTarget = 0;
    wake();
  });

  canvas.addEventListener('click', (e) => {
    if (moved) return;
    const index = stationAt(e);
    if (index >= 0) setActive(index, true);
  });

  /* ---------- Tastatur ---------- */

  root.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (/^[1-4]$/.test(e.key)) {
      e.preventDefault();
      setActive(parseInt(e.key, 10) - 1, true);
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((active + 1) % stations.length, true);
      const tag = tags[active];
      if (tag) tag.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((active - 1 + stations.length) % stations.length, true);
      const tag = tags[active];
      if (tag) tag.focus();
    }
  });

  /* ---------- Groesse ---------- */

  function resize() {
    const rect = root.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 520 ? 1.75 : 2));
    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.fov = 34;
    camera.position.set(0, TARGET.y + DISTANCE * Math.sin(ELEVATION), DISTANCE * Math.cos(ELEVATION));
    camera.lookAt(TARGET);
    camera.updateProjectionMatrix();

    renderFrame();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(root);

  /* ---------- Rendern ---------- */

  /* Gibt zurueck, ob sich noch etwas bewegt: im Reduced-Modus
     laeuft die Schleife nur bis zum Stillstand. */
  function renderFrame() {
    let moving = false;

    stations.forEach((s, i) => {
      const isActive = i === active;
      const liftTarget = isActive ? 0.14 : 0;
      const lift = lerp(s.group.userData.lift, liftTarget, 0.14);
      s.group.userData.lift = lift;

      const bob = (!reduced && running) ? Math.sin(elapsed * 0.7 + s.group.userData.phase) * 0.011 : 0;
      s.group.position.y = lift + bob;

      const ryTarget = s.group.userData.baseRy + (isActive ? 0.07 : 0);
      const ry = lerp(s.group.rotation.y, ryTarget, 0.13);
      s.group.rotation.y = ry;

      const scaleTarget = unit * (isActive ? 1.045 : 1);
      const scale = lerp(s.group.scale.x, scaleTarget, 0.13);
      s.group.scale.setScalar(scale);

      s.ring.material.opacity = lerp(s.ring.material.opacity, isActive ? 0.72 : 0, 0.13);
      s.glow.material.opacity = lerp(s.glow.material.opacity, isActive ? 0.9 : 0, 0.13);

      if (Math.abs(lift - liftTarget) > 0.001 ||
          Math.abs(scale - scaleTarget) > 0.001 ||
          Math.abs(ry - ryTarget) > 0.0015 ||
          Math.abs(s.ring.material.opacity - (isActive ? 0.72 : 0)) > 0.003 ||
          Math.abs(s.glow.material.opacity - (isActive ? 0.9 : 0)) > 0.004) {
        moving = true;
      }
    });

    renderer.render(scene, camera);
    return moving;
  }

  function loop(now) {
    frame = 0;
    if (!running) return;

    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    elapsed += dt;

    const ease = 1 - Math.pow(0.002, dt);
    spin = lerp(spin, spinTarget, ease);
    tilt = lerp(tilt, tiltTarget, ease);
    px = lerp(px, pxTarget, 1 - Math.pow(0.01, dt));
    py = lerp(py, pyTarget, 1 - Math.pow(0.01, dt));

    world.rotation.y = spin + px + (reduced ? 0 : Math.sin(elapsed * 0.14) * 0.03);
    world.rotation.x = tilt + py;

    const moving = renderFrame();

    const settled = Math.abs(spin - spinTarget) < 0.0006 &&
      Math.abs(tilt - tiltTarget) < 0.0006 &&
      Math.abs(px - pxTarget) < 0.0006 &&
      Math.abs(py - pyTarget) < 0.0006;

    if (reduced && !moving && settled && !dragging) {
      running = false;
      last = 0;
      return;
    }

    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || !inView || !pageVisible) return;
    running = true;
    last = 0;
    if (!frame) frame = requestAnimationFrame(loop);
  }

  function wake() {
    start();
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  const io = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    if (inView) start();
    else stop();
  }, { rootMargin: '160px 0px' });
  io.observe(root);

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (pageVisible) start();
    else stop();
  });

  reducedQuery.addEventListener('change', () => {
    reduced = !motionWanted();
    start();
  });

  window.addEventListener('storage', (e) => {
    if (e.key !== 'bw-motion') return;
    reduced = !motionWanted();
    start();
  });

  /* ---------- Start ---------- */

  setActive(0);
  resize();
  root.classList.add('is-live');
  start();

  requestAnimationFrame(() => resize());
}

/* ---------- Helfer ---------- */

function clamp(v, min, max) {
  return v < min ? min : (v > max ? max : v);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (err) {
    return false;
  }
}
