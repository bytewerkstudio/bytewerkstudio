/* ============================================================
   BYTEWERK STUDIO — ATELIER
   ------------------------------------------------------------
   Interactive 3D model for studio.html: four stations of the
   studio process on a paper workbench.

   - One Three.js build, imported only on this page.
   - No network requests, no textures on disk: the paper grain
     and grid are drawn to a canvas at runtime.
   - All content stays in real HTML. The model is decoration
     plus pointer/keyboard interaction; without WebGL the
     static SVG fallback remains.
   - Pauses offscreen and in hidden tabs, caps DPR and pixels,
     respects prefers-reduced-motion.
   ============================================================ */

(function () {
  'use strict';

  var stage = document.querySelector('[data-atelier-stage]');
  if (!stage) return;

  var steps = Array.prototype.slice.call(document.querySelectorAll('.atl-step'));
  var tags = Array.prototype.slice.call(stage.querySelectorAll('.atl-tag'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var PAPER = 0xf8f3e7;
  var PAPER_DEEP = 0xeee5d2;
  var INK = 0x35302a;
  var ACCENT = 0xb04f31;
  var SAGE = 0x4f7a63;

  var THREE = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var stations = [];
  var raycaster = null;
  var pointer = null;
  var clockLast = 0;
  var frameAcc = 0;
  var raf = 0;
  var visible = true;
  var active = 0;
  var hovered = -1;
  var yaw = 0.18;
  var pitch = 0.64;
  var yawShown = yaw;
  var pitchShown = pitch;
  var radius = 8.75;
  var dragging = false;
  var moved = false;
  var lastX = 0;
  var lastY = 0;
  var downX = 0;
  var downY = 0;
  var tmp = null;

  /* ---------- capability ---------- */
  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  /* ---------- paper ---------- */
  function paperTexture() {
    var size = 512;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');

    g.fillStyle = '#f7f2e5';
    g.fillRect(0, 0, size, size);

    var i;
    for (i = 0; i < 2600; i++) {
      g.fillStyle = 'rgba(84, 74, 58, ' + (Math.random() * 0.04).toFixed(3) + ')';
      g.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }

    g.strokeStyle = 'rgba(43, 39, 34, 0.042)';
    g.lineWidth = 1;
    for (i = 0; i <= size; i += 64) {
      g.beginPath();
      g.moveTo(i + 0.5, 0);
      g.lineTo(i + 0.5, size);
      g.stroke();
      g.beginPath();
      g.moveTo(0, i + 0.5);
      g.lineTo(size, i + 0.5);
      g.stroke();
    }

    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.2, 1.9);
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  function makeMaterials() {
    return {
      paper: new THREE.MeshStandardMaterial({ color: PAPER, roughness: 1, metalness: 0 }),
      deep: new THREE.MeshStandardMaterial({ color: PAPER_DEEP, roughness: 1, metalness: 0 }),
      board: new THREE.MeshStandardMaterial({ color: 0xded0b0, roughness: 1, metalness: 0 }),
      ink: new THREE.MeshStandardMaterial({ color: INK, roughness: 0.78, metalness: 0.04 }),
      accent: new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.68, metalness: 0.02 }),
      sage: new THREE.MeshStandardMaterial({ color: SAGE, roughness: 0.82, metalness: 0 }),
      panel: new THREE.MeshStandardMaterial({
        color: 0xfdfaf1, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.62
      }),
      grid: new THREE.LineBasicMaterial({ color: 0x6b665c, transparent: true, opacity: 0.4 }),
      line: new THREE.LineBasicMaterial({ color: 0x35302a, transparent: true, opacity: 0.42 })
    };
  }

  /* ---------- geometry helpers ---------- */
  function outline(mesh, color, opacity) {
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 24),
      new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity })
    );
    mesh.add(edges);
  }

  function box(w, h, d, mat, x, y, z) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  function stationDraft(M) {
    var g = new THREE.Group();
    var i;
    for (i = 0; i < 3; i++) {
      var sheet = box(1.46 - i * 0.05, 0.022, 1.06 - i * 0.04, M.paper, 0, 0.013 + i * 0.026, 0);
      sheet.rotation.y = (i - 1) * 0.04;
      outline(sheet, 0x8d8677, 0.42);
      g.add(sheet);
    }

    var pts = [];
    var w = 1.2;
    var h = 0.84;
    var y = 0.098;
    var cols = 6;
    var rows = 4;
    for (i = 0; i <= cols; i++) {
      var x = -w / 2 + (w / cols) * i;
      pts.push(x, y, -h / 2, x, y, h / 2);
    }
    for (i = 0; i <= rows; i++) {
      var z = -h / 2 + (h / rows) * i;
      pts.push(-w / 2, y, z, w / 2, y, z);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, M.grid));

    var dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 18), M.accent);
    dot.position.set(0.53, 0.11, 0.34);
    dot.castShadow = true;
    g.add(dot);

    return g;
  }

  function stationBuild(M) {
    var g = new THREE.Group();
    var W = 1.36;
    var H = 1.06;
    var D = 1.04;
    var t = 0.072;

    var vGeo = new THREE.BoxGeometry(t, H, t);
    var corners = [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]];
    var i;

    for (i = 0; i < corners.length; i++) {
      var v = new THREE.Mesh(vGeo, M.ink);
      v.position.set(corners[i][0], H / 2, corners[i][1]);
      v.castShadow = true;
      v.receiveShadow = true;
      g.add(v);
    }
    for (i = 0; i < 2; i++) {
      var zz = i ? D / 2 : -D / 2;
      var xx = i ? W / 2 : -W / 2;
      g.add(box(W, t, t, M.ink, 0, 0.025, zz));
      g.add(box(W, t, t, M.ink, 0, H - 0.025, zz));
      g.add(box(t, t, D, M.ink, xx, 0.025, 0));
      g.add(box(t, t, D, M.ink, xx, H - 0.025, 0));
    }

    var back = box(W - 0.12, H - 0.2, 0.018, M.panel, 0, H / 2, -D / 2 + 0.06);
    back.castShadow = false;
    g.add(back);

    var shelf = box(W - 0.1, 0.022, D - 0.12, M.deep, 0, H * 0.44, 0);
    g.add(shelf);

    var chip = box(0.34, 0.022, 0.24, M.accent, 0.28, H * 0.44 + 0.025, 0.16);
    chip.castShadow = true;
    g.add(chip);

    return g;
  }

  function stationCheck(M) {
    var g = new THREE.Group();
    var sheet = box(1.4, 0.022, 1.02, M.paper, 0, 0.014, 0);
    g.add(sheet);

    var i;
    for (i = 0; i < 3; i++) {
      g.add(box(0.84 - i * 0.17, 0.004, 0.028, M.deep, -0.12, 0.03, -0.2 + i * 0.14));
    }

    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 16, 48), M.accent);
    ring.position.set(0.02, 0.62, 0);
    ring.rotation.x = -0.14;
    ring.castShadow = true;
    g.add(ring);

    var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.52, 16), M.accent);
    handle.position.set(0.33, 0.29, 0.02);
    handle.rotation.z = -0.6;
    handle.castShadow = true;
    g.add(handle);

    var dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), M.sage);
    dot.position.set(-0.05, 0.63, 0.02);
    dot.castShadow = true;
    g.add(dot);

    return g;
  }

  function stationHandover(M) {
    var g = new THREE.Group();
    var env = box(1.36, 0.04, 0.94, M.paper, 0, 0.022, 0);
    outline(env, 0x8d8677, 0.42);
    g.add(env);

    var y = 0.048;
    var pts = [
      -0.68, y, 0.47, 0, y, 0.06,
      0, y, 0.06, 0.68, y, 0.47,
      -0.68, y, 0.47, -0.68, y, -0.47,
      -0.68, y, -0.47, 0.68, y, -0.47,
      0.68, y, -0.47, 0.68, y, 0.47
    ];
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.add(new THREE.LineSegments(geo, M.line));

    var seal = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.028, 32), M.accent);
    seal.position.set(0, 0.062, 0.075);
    seal.castShadow = true;
    g.add(seal);

    var stamp = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 12, 32), M.accent);
    stamp.position.set(0, 0.078, 0.075);
    stamp.rotation.x = -Math.PI / 2;
    g.add(stamp);

    return g;
  }

  /* ---------- scene ---------- */
  function build() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2(-10, -10);
    tmp = new THREE.Vector3();

    scene.add(new THREE.HemisphereLight(0xfff8ec, 0xcfc3ac, 1.35));

    var key = new THREE.DirectionalLight(0xfff2dd, 2.35);
    key.position.set(4.6, 7.6, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.bias = -0.0007;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 3;
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xe9efe6, 0.5);
    fill.position.set(-5, 3.2, -2.5);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(0xfffbf2, 0.28));

    var M = makeMaterials();

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 13),
      new THREE.MeshStandardMaterial({ color: 0xf4eddd, map: paperTexture(), roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    var builders = [stationDraft, stationBuild, stationCheck, stationHandover];
    var spots = [[-1.62, -1.38], [1.62, -1.38], [-1.62, 1.38], [1.62, 1.38]];

    for (var i = 0; i < 4; i++) {
      var sx = spots[i][0];
      var sz = spots[i][1];

      var board = box(2.46, 0.03, 1.98, M.board, sx, 0.015, sz);
      board.receiveShadow = true;
      scene.add(board);

      var ring = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.24, 64),
        new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(sx, 0.036, sz);
      scene.add(ring);

      var g = builders[i](M);
      g.scale.setScalar(1.06);
      g.position.set(sx, 0.032, sz);
      g.userData.si = i;
      scene.add(g);

      stations.push({
        group: g,
        ring: ring,
        lift: 0,
        target: 0,
        anchor: new THREE.Vector3(sx, 1.02, sz)
      });
    }

    resize();
    updateCamera();
    renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer) return;
    var rect = stage.getBoundingClientRect();
    var w = Math.max(1, rect.width);
    var h = Math.max(1, rect.height);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var maxPixels = 2400000;
    if (w * h * dpr * dpr > maxPixels) {
      dpr = Math.sqrt(maxPixels / (w * h));
    }
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function updateCamera() {
    camera.position.set(
      radius * Math.cos(pitchShown) * Math.sin(yawShown),
      radius * Math.sin(pitchShown),
      radius * Math.cos(pitchShown) * Math.cos(yawShown)
    );
    camera.lookAt(0, 0.12, 0);
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  /* ---------- state ---------- */
  function setActive(index, scroll) {
    active = clamp(index, 0, 3);
    var i;
    for (i = 0; i < stations.length; i++) {
      stations[i].target = i === active ? 0.075 : 0;
    }
    for (i = 0; i < tags.length; i++) {
      var on = i === active;
      tags[i].classList.toggle('is-active', on);
      if (on) tags[i].setAttribute('aria-current', 'true');
      else tags[i].removeAttribute('aria-current');
    }
    for (i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('is-active', i === active);
    }
    if (scroll && steps[active]) {
      steps[active].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function stationAt(event) {
    var rect = stage.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(stations.map(function (s) { return s.group; }), true);
    if (!hits.length) return -1;
    var o = hits[0].object;
    while (o) {
      if (o.userData && o.userData.si !== undefined) return o.userData.si;
      o = o.parent;
    }
    return -1;
  }

  function updateHover(event) {
    var idx = stationAt(event);
    if (idx === hovered) return;
    hovered = idx;
    stage.style.cursor = hovered >= 0 ? 'pointer' : 'grab';
  }

  /* ---------- interaction ---------- */
  function bind() {
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.atl-tag')) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
      stage.style.cursor = 'grabbing';
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging) {
        updateHover(e);
        return;
      }
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6) moved = true;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw -= dx * 0.006;
      pitch = clamp(pitch - dy * 0.0035, 0.24, 0.92);
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      stage.style.cursor = hovered >= 0 ? 'pointer' : 'grab';
      try { stage.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
      if (!moved) {
        var idx = stationAt(e);
        if (idx >= 0) setActive(idx, true);
      }
    }
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', function () { dragging = false; stage.style.cursor = 'grab'; });
    stage.addEventListener('pointerleave', function () {
      if (!dragging) {
        hovered = -1;
        stage.style.cursor = 'grab';
      }
    });

    stage.addEventListener('keydown', function (e) {
      var handled = true;
      if (e.key === 'ArrowLeft') yaw += 0.12;
      else if (e.key === 'ArrowRight') yaw -= 0.12;
      else if (e.key === 'ArrowUp') pitch = clamp(pitch + 0.08, 0.24, 0.92);
      else if (e.key === 'ArrowDown') pitch = clamp(pitch - 0.08, 0.24, 0.92);
      else if (e.key === '+' || e.key === '=') radius = clamp(radius - 0.6, 7.4, 13);
      else if (e.key === '-') radius = clamp(radius + 0.6, 7.4, 13);
      else if (e.key >= '1' && e.key <= '4') setActive(parseInt(e.key, 10) - 1, false);
      else handled = false;
      if (handled) e.preventDefault();
    });
    stage.tabIndex = 0;
    stage.style.outlineOffset = '-4px';
    stage.setAttribute('role', 'group');
    stage.setAttribute('aria-label', 'Interaktives Modell der vier Studio-Stationen: Entwurf, Bau, Prüfung, Übergabe.');

    for (var i = 0; i < tags.length; i++) {
      (function (idx) {
        tags[idx].addEventListener('mouseenter', function () { hovered = idx; });
        tags[idx].addEventListener('mouseleave', function () { hovered = -1; });
        tags[idx].addEventListener('focus', function () { setActive(idx, false); });
        tags[idx].addEventListener('click', function (e) { e.preventDefault(); setActive(idx, true); });
      })(i);
    }

    steps.forEach(function (step, idx) {
      step.addEventListener('focusin', function () { setActive(idx, false); });
    });

    var vis = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }, { rootMargin: '180px 0px' });
    vis.observe(stage);

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { resize(); }).observe(stage);
    } else {
      window.addEventListener('resize', resize);
    }
  }

  /* ---------- loop ---------- */
  function drawTags() {
    var rect = stage.getBoundingClientRect();
    for (var i = 0; i < stations.length; i++) {
      var tag = tags[i];
      if (!tag) continue;
      var p = tmp.copy(stations[i].anchor).project(camera);
      var x = (p.x * 0.5 + 0.5) * rect.width;
      var y = (-p.y * 0.5 + 0.5) * rect.height;
      var vis = p.z < 1;
      var cx = Math.min(Math.max(x, 46), Math.max(46, rect.width - 46));
      var cy = Math.min(Math.max(y, 20), Math.max(20, rect.height - 32));
      tag.style.opacity = vis ? '1' : '0';
      tag.style.pointerEvents = vis ? 'auto' : 'none';
      tag.style.transform = 'translate(-50%, -50%) translate(' + cx.toFixed(1) + 'px, ' + cy.toFixed(1) + 'px)';
    }
  }

  function tick(now) {
    if (!visible || document.hidden) { raf = 0; return; }
    raf = requestAnimationFrame(tick);
    if (!renderer) return;

    var dt = clockLast ? Math.min(0.06, (now - clockLast) / 1000) : 0.016;
    clockLast = now;

    if (!reduced.matches && !dragging) yaw += 0.02 * dt;
    var ease = reduced.matches ? 1 : Math.min(1, 0.14 * (dt / 0.016));
    yawShown += (yaw - yawShown) * ease;
    pitchShown += (pitch - pitchShown) * ease;

    var changed = false;
    for (var i = 0; i < stations.length; i++) {
      var s = stations[i];
      var near = (i === active || i === hovered) ? 1 : 0;
      s.target = near ? 0.075 : 0;
      s.lift += (s.target - s.lift) * ease;
      if (Math.abs(s.lift - s.target) < 0.001) s.lift = s.target;
      s.group.position.y = 0.032 + s.lift;
      var want = (i === active ? 0.5 : i === hovered ? 0.24 : 0);
      s.ring.material.opacity += (want - s.ring.material.opacity) * ease;
      if (Math.abs(s.ring.material.opacity - want) < 0.002) s.ring.material.opacity = want;
      if (s.lift !== 0 || s.ring.material.opacity !== 0) changed = true;
    }

    updateCamera();
    drawTags();

    frameAcc += dt;
    if (frameAcc >= 1 / 32 || changed) {
      frameAcc = 0;
      renderer.render(scene, camera);
    }
  }

  function start() {
    if (!renderer || raf) return;
    clockLast = 0;
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /* ---------- boot ---------- */
  async function init() {
    if (!hasWebGL()) return;
    try {
      THREE = await import('./vendor/three.module.min.js');
    } catch (err) {
      return;
    }
    try {
      build();
    } catch (err) {
      if (renderer && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer = null;
      return;
    }

    document.documentElement.classList.add('atl-ready');
    bind();
    setActive(0, false);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    reduced.addEventListener('change', function () {
      if (reduced.matches) {
        yawShown = yaw;
        pitchShown = pitch;
        updateCamera();
        renderer.render(scene, camera);
      }
    });

    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
