/* ============================================================
   BYTEWERK STUDIO — scene3d.js
   ------------------------------------------------------------
   Eine Three.js-Schicht für die ganze Site.
   Szenen:
     stratum  — geschichtete Papierskulptur im Hero
     contour  — feines Draht-Höhenfeld in Seitenköpfen

   Regeln (siehe docs/SZENE3D.md):
   - ein Build: vendor/three.module.min.js (r180), kein CDN
   - DPR ≤ 2 (schmale Geräte 1,5), Pixeldeckel 2,6 Mio.
   - Start erst im Viewport, Pause im Hintergrund-Tab
   - prefers-reduced-motion → Standbild, Bewegung nur auf Wunsch
   - ohne WebGL bleibt das CSS-Design vollständig

   Kein Build-Schritt, keine Abhängigkeiten außer Three.js.
   ============================================================ */

(function () {
  'use strict';

  var slots = Array.prototype.slice.call(document.querySelectorAll('[data-scene3d]'));
  if (!slots.length) return;

  var root = document.documentElement;
  var finePointer = window.matchMedia('(pointer: fine)');
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 1024px)');
  var STORE_KEY = 'bw-scene3d-motion';

  var instances = [];
  var THREE = null;
  var explicit = null;

  try { explicit = localStorage.getItem(STORE_KEY); } catch (e) { /* file:// o. Ä. */ }

  var motion = explicit === 'off' ? false : explicit === 'on' ? true : !reduceQuery.matches;

  var api = {
    count: 0,
    scenes: [],
    motion: motion,
    setMotion: setMotion,
    highlight: highlight
  };

  window.bwScene3D = api;

  /* ---------- Zufall (deterministisch, damit die Skulptur stabil bleibt) ---------- */
  var sceneSeed = 20261106;

  function rnd(n) {
    var x = Math.sin((n + sceneSeed) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  /* ---------- Start ---------- */

  function boot() {
    if (!hasWebGL()) return fallback();
    var url = new URL('vendor/three.module.min.js', document.baseURI).href;
    import(url).then(init).catch(fallback);
  }

  function init(module) {
    THREE = module;
    root.classList.add('scene3d-on');

    slots.forEach(function (slot) {
      try {
        build(slot);
      } catch (err) {
        slot.classList.add('scene3d-dead');
        if (window.console && console.warn) console.warn('[scene3d]', err);
      }
    });

    api.count = instances.length;
    if (!instances.length) {
      root.classList.remove('scene3d-on');
      root.classList.add('no-scene3d');
    }
  }

  function fallback() {
    root.classList.add('no-scene3d');
    root.classList.remove('scene3d-on');
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  /* ---------- Aufbau ---------- */

  function build(slot) {
    var kind = slot.getAttribute('data-scene3d') || 'stratum';
    var canvas = document.createElement('canvas');
    canvas.className = 'scene3d-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    slot.appendChild(canvas);

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);

    var inst = {
      kind: kind,
      slot: slot,
      canvas: canvas,
      renderer: renderer,
      scene: scene,
      camera: camera,
      clock: 0,
      last: 0,
      raf: 0,
      visible: false,
      needsRender: true,
      px: 0,
      py: 0,
      tx: 0,
      ty: 0,
      interval: kind === 'contour' ? 1000 / 30 : 1000 / 45,
      highlightAt: -1
    };

    if (kind === 'contour') buildContour(inst);
    else buildStratum(inst);

    slot.classList.add('scene3d-ready');
    api.scenes.push(inst);
    instances.push(inst);

    fit(inst);
    observe(inst);

    if (kind === 'stratum') {
      var hero = slot.closest('.hero-v3');
      if (hero) hero.classList.add('hero-v3--scene');
      buildToggle(inst);
      wirePanel(inst);
      bindPointer(inst);
    }

    start(inst);
  }

  /* ---------- Szene: stratum ---------- */

  function buildStratum(inst) {
    var scene = inst.scene;
    inst.target = new THREE.Vector3(0, 1.5, 0);
    inst.camera.fov = 30;

    scene.add(new THREE.HemisphereLight(0xfffbf2, 0xcfc6b2, 2.6));

    var key = new THREE.DirectionalLight(0xfff2df, 2.4);
    key.position.set(5, 9, 7);
    scene.add(key);

    var rim = new THREE.DirectionalLight(0xdfeae2, 1.15);
    rim.position.set(-7, 4, -6);
    scene.add(rim);

    var fill = new THREE.DirectionalLight(0xffffff, 0.55);
    fill.position.set(0, 2, 8);
    scene.add(fill);

    var group = new THREE.Group();
    scene.add(group);
    inst.group = group;

    var mats = {
      paper: new THREE.MeshStandardMaterial({ color: 0xf7f3e9, roughness: 0.92, metalness: 0 }),
      bone:  new THREE.MeshStandardMaterial({ color: 0xefe9da, roughness: 0.95, metalness: 0 }),
      accent: new THREE.MeshStandardMaterial({ color: 0xb04f31, roughness: 0.78, metalness: 0 }),
      sage:  new THREE.MeshStandardMaterial({ color: 0x4f7a63, roughness: 0.86, metalness: 0 })
    };

    var edgeMats = [0, 1, 2, 3].map(function () {
      return new THREE.LineBasicMaterial({ color: 0x9d9480, transparent: true, opacity: 0.4 });
    });

    var layers = [];
    var y = 0;
    var N = 19;

    for (var i = 0; i < N; i++) {
      var t = i / (N - 1);
      var w = (2.6 + rnd(i) * 0.52) * (1 - 0.17 * t);
      var d = (1.86 + rnd(i + 11) * 0.44) * (1 - 0.14 * t);
      var h = i < 2 ? 0.26 : 0.1 + rnd(i + 23) * 0.11;
      var band = i < 5 ? 0 : i < 10 ? 1 : i < 15 ? 2 : 3;

      var material = mats.paper;
      if (i === 6) material = mats.sage;
      else if (i === 13) material = mats.accent;
      else if (i % 3 === 0) material = mats.bone;

      var geo = slabGeometry(w, d, h, 0.16);
      var mesh = new THREE.Mesh(geo, material);
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 34), edgeMats[band]);

      mesh.position.set((rnd(i + 41) - 0.5) * 0.3, y, (rnd(i + 51) - 0.5) * 0.24);
      mesh.rotation.y = (rnd(i + 31) - 0.5) * 0.05;
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);

      mesh.userData = { baseY: y, band: band, edges: edges, lift: 0 };
      group.add(mesh);
      group.add(edges);
      layers.push(mesh);

      y += h + 0.014;
    }

    inst.layers = layers;
    inst.edgeMats = edgeMats;
    inst.stackTop = y;

    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.55, 0.018, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0x4f7a63, transparent: true, opacity: 0.38 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = Math.min(2.55, y * 0.74);
    group.add(ring);
    inst.ring = ring;

    var shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 7.5),
      new THREE.MeshBasicMaterial({
        map: shadowTexture(),
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.012;
    scene.add(shadow);
  }

  function slabGeometry(w, d, h, r) {
    var x = -w / 2;
    var y = -d / 2;
    var s = new THREE.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r);
    s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d);
    s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);

    var geo = new THREE.ExtrudeGeometry(s, {
      depth: h,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 1,
      curveSegments: 6,
      steps: 1
    });

    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    var bb = geo.boundingBox;
    geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    return geo;
  }

  function shadowTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(128, 128, 8, 128, 128, 126);
    grd.addColorStop(0, 'rgba(62, 56, 45, 0.30)');
    grd.addColorStop(0.52, 'rgba(62, 56, 45, 0.11)');
    grd.addColorStop(1, 'rgba(62, 56, 45, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ---------- Szene: contour ---------- */

  function buildContour(inst) {
    var scene = inst.scene;
    var group = new THREE.Group();
    scene.add(group);

    var cols = 54;
    var rows = 26;
    var W = 38;
    var D = 18;
    var segments = (rows + 1) * cols + (cols + 1) * rows;
    var pos = new Float32Array(segments * 2 * 3);

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);

    var material = new THREE.LineBasicMaterial({
      color: 0x677f70,
      transparent: true,
      opacity: 0.44
    });

    group.add(new THREE.LineSegments(geo, material));

    inst.grid = { cols: cols, rows: rows, W: W, D: D, pos: pos, geo: geo };
    inst.camera.fov = 34;
    inst.camera.position.set(0, 9.8, 12.6);
    inst.camera.lookAt(0, 0, 1.2);

    updateContour(inst, 0);
  }

  function updateContour(inst, time) {
    var g = inst.grid;
    var p = g.pos;
    var i = 0;
    var x0 = -g.W / 2;
    var z0 = -g.D / 2;
    var dx = g.W / g.cols;
    var dz = g.D / g.rows;

    function height(x, z) {
      return 0.52 * Math.sin(x * 0.4 + time * 0.5) * Math.cos(z * 0.52 - time * 0.32)
        + 0.26 * Math.sin((x + z) * 0.26 - time * 0.22)
        + 0.1 * Math.sin(x * 1.12 + 1.3) * Math.cos(z * 0.88);
    }

    var c, r, x, z, xa, xb, za, zb;

    for (r = 0; r <= g.rows; r++) {
      z = z0 + r * dz;
      for (c = 0; c < g.cols; c++) {
        xa = x0 + c * dx;
        xb = xa + dx;
        p[i++] = xa; p[i++] = height(xa, z); p[i++] = z;
        p[i++] = xb; p[i++] = height(xb, z); p[i++] = z;
      }
    }

    for (c = 0; c <= g.cols; c++) {
      x = x0 + c * dx;
      for (r = 0; r < g.rows; r++) {
        za = z0 + r * dz;
        zb = za + dz;
        p[i++] = x; p[i++] = height(x, za); p[i++] = za;
        p[i++] = x; p[i++] = height(x, zb); p[i++] = zb;
      }
    }

    g.geo.attributes.position.needsUpdate = true;
    inst.needsRender = true;
  }

  /* ---------- Kamera & Größe ---------- */

  function fit(inst) {
    var w = inst.slot.clientWidth;
    var h = inst.slot.clientHeight;
    if (!w || !h) return;

    var dpr = Math.min(window.devicePixelRatio || 1, narrow.matches ? 1.5 : 2);
    var pixels = w * h * dpr * dpr;
    if (pixels > 2600000) dpr = Math.sqrt(2600000 / (w * h));

    inst.renderer.setPixelRatio(dpr);
    inst.renderer.setSize(w, h, false);

    inst.camera.aspect = w / h;

    if (inst.kind === 'stratum') {
      var target = inst.target;
      var radius = w / h < 0.95 ? 12.4 : 10.4;
      if (h < 340) radius = 9.6;
      inst.camera.position.set(target.x + 4.1, target.y + 3.3, target.z + radius);
      inst.camera.lookAt(target);
    } else {
      inst.camera.position.set(0, 9.8, 12.6);
      inst.camera.lookAt(0, 0, 1.2);
      updateContour(inst, inst.clock);
    }

    inst.camera.updateProjectionMatrix();
    inst.needsRender = true;
  }

  /* ---------- Schleife ---------- */

  function start(inst) {
    if (inst.raf) return;
    inst.raf = requestAnimationFrame(function loop(now) {
      inst.raf = requestAnimationFrame(loop);
      if (!inst.visible || document.hidden) return;

      var moving = motion;
      if (!moving && !inst.needsRender) return;
      if (now - inst.last < inst.interval) return;

      var dt = inst.last ? Math.min(0.08, (now - inst.last) / 1000) : 0;
      inst.last = now;
      if (moving) inst.clock += dt;

      step(inst, dt, moving);
      inst.renderer.render(inst.scene, inst.camera);
      inst.needsRender = false;
    });
  }

  function step(inst, dt, moving) {
    if (inst.kind === 'contour') {
      if (moving) {
        updateContour(inst, inst.clock);
        inst.camera.position.x = Math.sin(inst.clock * 0.1) * 1.4;
        inst.camera.position.y = 9.8 + Math.sin(inst.clock * 0.07) * 0.25;
        inst.camera.lookAt(0, 0, 1.2);
      }
      return;
    }

    var ease = moving ? 1 - Math.pow(0.002, dt) : 1;
    inst.px += (inst.tx - inst.px) * ease;
    inst.py += (inst.ty - inst.py) * ease;

    var g = inst.group;
    g.rotation.y = -0.36 + (moving ? Math.sin(inst.clock * 0.16) * 0.1 : 0) + inst.px * 0.24;
    g.rotation.x = -0.015 + inst.py * 0.055;
    g.position.y = moving ? Math.sin(inst.clock * 0.45) * 0.025 : 0;

    if (inst.ring) {
      inst.ring.rotation.z = moving ? inst.clock * 0.035 : 0;
    }

    for (var i = 0; i < inst.layers.length; i++) {
      var mesh = inst.layers[i];
      var d = mesh.userData;
      var goal = d.band === inst.highlightAt ? 0.26 : 0;
      d.lift += (goal - d.lift) * ease;
      mesh.position.y = d.baseY + d.lift;
      d.edges.position.y = mesh.position.y;

      var edge = inst.edgeMats[d.band];
      var hot = inst.highlightAt === d.band;
      var col = hot ? 0xb04f31 : 0x9d9480;
      edge.color.lerp(new THREE.Color(col), ease * 0.3);
      edge.opacity += ((hot ? 0.85 : 0.4) - edge.opacity) * ease;
    }
  }

  /* ---------- Sichtbarkeit ---------- */

  function observe(inst) {
    if (!('IntersectionObserver' in window)) {
      inst.visible = true;
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inst.visible = entry.isIntersecting;
        if (inst.visible) {
          inst.needsRender = true;
          start(inst);
        }
      });
    }, { rootMargin: '180px 0px' });

    io.observe(inst.slot);

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { fit(inst); });
      ro.observe(inst.slot);
    } else {
      window.addEventListener('resize', function () { fit(inst); });
    }
  }

  /* ---------- Zeiger ---------- */

  function bindPointer(inst) {
    if (!finePointer.matches) return;
    var hero = inst.slot.closest('.hero-v3') || inst.slot.parentElement;
    if (!hero) return;

    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      inst.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      inst.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });

    hero.addEventListener('pointerleave', function () {
      inst.tx = 0;
      inst.ty = 0;
    });
  }

  /* ---------- Kopplung an das Hero-Panel ---------- */

  function wirePanel(inst) {
    var links = document.querySelectorAll('.hero-v3-panel .ed-idx');
    if (!links.length) return;

    Array.prototype.forEach.call(links, function (link, index) {
      function on() {
        inst.highlightAt = index;
        inst.needsRender = true;
      }
      function off() {
        inst.highlightAt = -1;
        inst.needsRender = true;
      }
      link.addEventListener('mouseenter', on);
      link.addEventListener('mouseleave', off);
      link.addEventListener('focus', on);
      link.addEventListener('blur', off);
      link.addEventListener('touchstart', on, { passive: true });
    });
  }

  function highlight(index) {
    instances.forEach(function (inst) {
      if (inst.kind !== 'stratum') return;
      inst.highlightAt = typeof index === 'number' ? index : -1;
      inst.needsRender = true;
    });
  }

  /* ---------- Bewegungsschalter ---------- */

  function buildToggle(inst) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'scene3d-toggle';
    b.innerHTML =
      '<svg class="scene3d-i scene3d-i-pause" viewBox="0 0 16 16" aria-hidden="true">' +
      '<rect x="4.5" y="3.5" width="2.4" height="9" rx="1"></rect>' +
      '<rect x="9.1" y="3.5" width="2.4" height="9" rx="1"></rect></svg>' +
      '<svg class="scene3d-i scene3d-i-play" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M5.2 3.4 12.4 8l-7.2 4.6z"></path></svg>' +
      '<span class="scene3d-sr"></span>';
    b.addEventListener('click', function () {
      setMotion(!motion);
    });
    inst.slot.appendChild(b);
    updateToggleUI();
  }

  function updateToggleUI() {
    var buttons = document.querySelectorAll('.scene3d-toggle');
    Array.prototype.forEach.call(buttons, function (b) {
      b.setAttribute('data-paused', motion ? 'false' : 'true');
      b.setAttribute('title', motion ? '3D-Bewegung pausieren' : '3D-Bewegung starten');
      var label = b.querySelector('.scene3d-sr');
      if (label) label.textContent = b.getAttribute('title');
    });
  }

  function setMotion(on) {
    motion = !!on;
    api.motion = motion;
    try { localStorage.setItem(STORE_KEY, motion ? 'on' : 'off'); } catch (e) { /* egal */ }
    updateToggleUI();
    instances.forEach(function (inst) {
      inst.needsRender = true;
      inst.last = 0;
    });
  }

  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', function (e) {
      if (explicit) return;
      motion = !e.matches;
      api.motion = motion;
      updateToggleUI();
    });
  }

  boot();
})();
