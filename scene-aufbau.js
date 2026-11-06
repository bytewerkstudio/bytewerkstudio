/* ============================================================
   BYTEWERK STUDIO — scene-bauplan.js
   ------------------------------------------------------------
   Die interaktive Buehne der Seite bauplan.html.

   Vier Platten, vier Schichten: Oberflaeche, Logik, Daten,
   Betrieb. Die Platten liegen als gesprengtes Modell
   uebereinander, tragen eine technische Beschriftung und
   lassen sich drehen. Ein Klick auf eine Platte oeffnet die
   passende Schicht; die Schaltflaechen rechts steuern dasselbe
   Modell.

   three.js liegt lokal unter vendor/ (CSP: script-src 'self').
   Das Modul wird erst geladen, wenn die Buehne im Blickfeld ist.
   Ohne WebGL bleibt die CSS-Grafik aus styles-bauplan.css
   stehen; alle Inhalte sind ohnehin echtes HTML.
   ============================================================ */

(function () {
  'use strict';

  var stage = document.querySelector('[data-bauplan]');
  if (!stage) return;

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.bp-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.bp-panel'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var api = null;
  var active = 0;

  /* ---------- Schichten: Reiter und Texte ---------- */

  function paintTabs(index) {
    active = index;
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (panel, i) {
      if (i === index) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
  }

  function activate(index, focus) {
    var i = Math.max(0, Math.min(tabs.length - 1, index));
    paintTabs(i);
    if (api) api.select(i);
    if (focus && tabs[i]) tabs[i].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(i); });

    tab.addEventListener('keydown', function (event) {
      var key = event.key;
      var step = 0;

      if (key === 'ArrowDown' || key === 'ArrowRight') step = 1;
      else if (key === 'ArrowUp' || key === 'ArrowLeft') step = -1;
      else if (key === 'Home') { event.preventDefault(); activate(0, true); return; }
      else if (key === 'End') { event.preventDefault(); activate(tabs.length - 1, true); return; }
      else return;

      event.preventDefault();
      activate((i + step + tabs.length) % tabs.length, true);
    });
  });

  paintTabs(0);

  /* ---------- Start ---------- */

  function hasWebGL() {
    try {
      var probe = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (probe.getContext('webgl2') || probe.getContext('webgl')));
    } catch (err) {
      return false;
    }
  }

  function boot() {
    if (!hasWebGL()) {
      stage.classList.add('is-flat');
      return;
    }

    var loaded = import('./vendor/three.module.min.js').then(function (THREE) {
      return document.fonts && document.fonts.ready
        ? document.fonts.ready.then(function () { return THREE; }).catch(function () { return THREE; })
        : Promise.resolve(THREE);
    }).then(function (THREE) {
      create(THREE);
      stage.classList.add('is-live');
      stage.classList.remove('is-flat');
    });

    loaded.catch(function () {
      /* Erwarteter Fallback: die CSS-Platten bleiben stehen. */
      stage.classList.add('is-flat');
    });
  }

  /* ---------- Szene ---------- */

  function create(THREE) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    stage.appendChild(canvas);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      stage.classList.add('is-flat');
      canvas.remove();
      return;
    }

    renderer.setClearAlpha(0);
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    var group = new THREE.Group();
    scene.add(group);

    var PAPER = new THREE.Color(0xfaf9f5);
    var INK = 0x1f1e1d;

    /* Licht: warmes Papier, ein weicher Schatten. */
    scene.add(new THREE.HemisphereLight(0xfff8ec, 0xd8d0bf, 1.55));

    var key = new THREE.DirectionalLight(0xfff3df, 1.9);
    key.position.set(4.2, 7.4, 5.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 22;
    key.shadow.bias = -0.0006;
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xe6eef0, 0.55);
    fill.position.set(-5, 3.4, -4.5);
    scene.add(fill);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.42;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---------- Geometrie ---------- */

    var LAYERS = [
      { w: 3.55, h: 2.25, color: 0xfffdf8, accent: '#b04f31', num: '01', label: 'Oberfläche', en: 'Interface' },
      { w: 3.20, h: 2.05, color: 0xfbf6ec, accent: '#9a7733', num: '02', label: 'Logik', en: 'Logic' },
      { w: 2.85, h: 1.85, color: 0xf1f4ee, accent: '#4f7a63', num: '03', label: 'Daten', en: 'Data' },
      { w: 2.50, h: 1.65, color: 0xf3ece0, accent: '#4b6478', num: '04', label: 'Betrieb', en: 'Operations' }
    ];

    var GAP = 0.64;
    var THICK = 0.1;
    var plates = [];
    var pickable = [];

    function roundedShape(w, h, r) {
      var s = new THREE.Shape();
      var x = -w / 2;
      var y = -h / 2;
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

    var labels = [];

    function currentLang() {
      return (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
    }

    function drawLabel(cv, layer) {
      var W = cv.width;
      var H = cv.height;
      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var english = currentLang() === 'en';

      ctx.clearRect(0, 0, W, H);

      /* technisches Raster */
      ctx.strokeStyle = 'rgba(31,30,29,0.07)';
      ctx.lineWidth = 1;
      var i;
      for (i = 1; i < 8; i++) {
        var gx = (W * i) / 8;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (i = 1; i < 5; i++) {
        var gy = (H * i) / 5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      /* Rahmen */
      ctx.strokeStyle = 'rgba(31,30,29,0.16)';
      ctx.strokeRect(22, 22, W - 44, H - 44);

      /* Nummer */
      ctx.fillStyle = layer.accent;
      ctx.font = '500 30px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(layer.num, 46, 40);

      /* Name in der aktiven Sprache */
      ctx.fillStyle = '#1f1e1d';
      ctx.font = '500 76px Newsreader, Georgia, serif';
      ctx.fillText(english ? layer.en : layer.label, 44, 92);

      /* die jeweils andere Sprache als leise Zeile */
      ctx.fillStyle = 'rgba(31,30,29,0.42)';
      ctx.font = '400 25px Inter, system-ui, sans-serif';
      ctx.fillText((english ? layer.label : layer.en).toUpperCase(), 47, 198);
    }

    function labelTexture(layer) {
      var ratio = layer.w / layer.h;
      var W = 1024;
      var H = Math.round(W / ratio);
      var cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;

      drawLabel(cv, layer);

      var texture = new THREE.CanvasTexture(cv);
      if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
      if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      }
      labels.push({ cv: cv, texture: texture, layer: layer });
      return texture;
    }

    function repaintLabels() {
      labels.forEach(function (entry) {
        drawLabel(entry.cv, entry.layer);
        entry.texture.needsUpdate = true;
      });
    }

    document.addEventListener('bw:lang', repaintLabels);

    LAYERS.forEach(function (layer, index) {
      var shape = roundedShape(layer.w, layer.h, 0.16);
      var geometry = new THREE.ExtrudeGeometry(shape, {
        depth: THICK,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
        curveSegments: 18
      });
      geometry.rotateX(-Math.PI / 2);
      geometry.computeVertexNormals();

      var material = new THREE.MeshStandardMaterial({
        color: layer.color,
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 1
      });

      var mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.y = index * GAP;
      mesh.userData.bpIndex = index;

      var edgeMaterial = new THREE.LineBasicMaterial({
        color: INK,
        transparent: true,
        opacity: 0.16
      });
      var edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 28),
        edgeMaterial
      );
      mesh.add(edges);

      var texture = labelTexture(layer);
      if (texture) {
        var labelGeometry = new THREE.PlaneGeometry(layer.w * 0.9, layer.h * 0.9);
        labelGeometry.rotateX(-Math.PI / 2);
        var label = new THREE.Mesh(
          labelGeometry,
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
          })
        );
        label.position.y = THICK + 0.004;
        mesh.add(label);
      }

      group.add(mesh);
      pickable.push(mesh);
      plates.push({
        mesh: mesh,
        material: material,
        edges: edgeMaterial,
        baseColor: new THREE.Color(layer.color),
        baseY: index * GAP,
        lift: 0,
        shift: 0,
        index: index
      });
    });

    /* ---------- Blick und Groesse ---------- */

    var spin = -0.55;
    var targetSpin = -0.55;
    var tilt = 0;
    var targetTilt = 0;

    function measure() {
      var w = stage.clientWidth;
      var h = stage.clientHeight;
      if (!w || !h) return false;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);

      var narrow = w < 640;
      camera.aspect = w / h;
      camera.fov = narrow ? 36 : 30;
      camera.position.set(narrow ? 0 : 4.6, narrow ? 5.0 : 4.4, narrow ? 9.8 : 8.4);
      camera.lookAt(0, narrow ? 0.92 : 0.98, 0);
      camera.updateProjectionMatrix();

      group.scale.setScalar(narrow ? 0.82 : 1);
      return true;
    }

    /* ---------- Zeiger ---------- */

    var raycaster = new THREE.Raycaster();
    var pointer = { x: 0, y: 0 };
    var dragging = false;
    var moved = 0;
    var lastX = 0;
    var lastY = 0;

    function onDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      dragging = true;
      moved = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      stage.classList.add('is-dragging');
      if (stage.setPointerCapture) {
        try { stage.setPointerCapture(event.pointerId); } catch (err) { /* ignore */ }
      }
      stage.classList.add('is-live');
      start();
    }

    function onMove(event) {
      if (!dragging) return;
      var dx = event.clientX - lastX;
      var dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      moved += Math.abs(dx) + Math.abs(dy);

      targetSpin += dx * 0.008;
      targetTilt = Math.max(-0.2, Math.min(0.4, targetTilt + dy * 0.004));
    }

    function onUp(event) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      if (moved < 7) pick(event);
    }

    function pick(event) {
      var rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      var ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera({ x: nx, y: ny }, camera);

      var hits = raycaster.intersectObjects(pickable, true);
      if (!hits.length) return;

      var node = hits[0].object;
      while (node && node.userData.bpIndex === undefined) node = node.parent;
      if (!node) return;

      var index = node.userData.bpIndex;
      if (typeof index !== 'number') return;

      active = index;
      paintTabs(index);
    }

    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    stage.addEventListener('dblclick', function () {
      targetSpin = -0.55;
      targetTilt = 0;
      start();
    });

    /* ---------- Laufzeit ---------- */

    var raf = 0;
    var last = 0;
    var visible = true;
    var stopAt = 0;
    var frames = 0;
    var slow = 0;
    var degraded = false;

    function loop(now) {
      if (!last) last = now;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!dragging && !reduce.matches) targetSpin += dt * 0.05;

      spin += (targetSpin - spin) * 0.08;
      tilt += (targetTilt - tilt) * 0.08;
      group.rotation.y = spin;
      group.rotation.x = tilt;

      for (var i = 0; i < plates.length; i++) {
        var p = plates[i];
        var on = p.index === active;
        var liftTarget = on ? 0.3 : 0;
        var shiftTarget = on ? 0.16 : 0;

        p.lift += (liftTarget - p.lift) * 0.12;
        p.shift += (shiftTarget - p.shift) * 0.12;
        p.mesh.position.y = p.baseY + p.lift;
        p.mesh.position.x = p.shift;

        if (on) p.material.color.lerpColors(p.baseColor, PAPER, 0);
        else p.material.color.lerpColors(p.baseColor, PAPER, 0.45);

        p.edges.opacity = on ? 0.22 : 0.1;
      }

      renderer.render(scene, camera);

      /* Qualitaet einmalig senken, wenn die Bilder dauerhaft langsam sind. */
      frames++;
      if (!degraded && frames > 90) {
        slow = dt > 0.03 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 26) {
          degraded = true;
          renderer.shadowMap.enabled = false;
          key.castShadow = false;
        }
      }

      if (reduce.matches && !dragging && now > stopAt) {
        raf = 0;
        last = 0;
        return;
      }

      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (raf || !visible || document.hidden) return;
      stopAt = performance.now() + 1200;
      last = 0;
      raf = window.requestAnimationFrame(loop);
    }

    function stop() {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    }

    /* ---------- API fuer die Reiter ---------- */

    api = {
      select: function (index) {
        active = index;
        if (reduce.matches) {
          stopAt = performance.now() + 900;
        }
        start();
      }
    };

    /* ---------- Beobachtung ---------- */

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        if (measure()) start();
      });
      ro.observe(stage);
    } else {
      window.addEventListener('resize', function () {
        if (measure()) start();
      }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        });
      }, { rootMargin: '200px 0px', threshold: 0.01 });
      io.observe(stage);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    if (reduce.addEventListener) {
      reduce.addEventListener('change', function () {
        if (reduce.matches) {
          stopAt = performance.now() + 600;
          start();
        }
      });
    }

    measure();
    start();
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(boot, { timeout: 1200 });
  } else {
    window.setTimeout(boot, 120);
  }
})();
