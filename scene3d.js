/* ============================================================
   BYTEWERK STUDIO — scene3d.js
   ------------------------------------------------------------
   The Three.js layer of the Claude look: paper surfaces, thin
   clay lines, one sage accent. No neon, no bloom, no noise.

   Declarative mounting — markup owns the slot, this file owns
   the picture:

     <div class="hero-scene" data-scene3d="stratum" aria-hidden="true"></div>
     <div class="page-head-bg" data-scene3d="contour" aria-hidden="true"></div>

   Optional per-element switches:
     data-scene3d-mobile="off"     skip the scene below 720 px
     data-scene3d="stratum|contour"

   Why vendored: the CSP on every page is script-src 'self'.
   three.js therefore lives in vendor/ and is imported on demand,
   after the hero has painted, and only when the slot is near the
   viewport. Without WebGL the slot keeps its CSS gradient.

   Runtime duties: pause off-screen and in background tabs,
   follow prefers-reduced-motion, offer a motion switch, and
   drop quality once if frames stay slow.
   ============================================================ */

(function () {
  'use strict';

  var ROOT = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  var MOTION_KEY = 'bw-motion';
  var PIXEL_BUDGET = 2600000;

  /* Mirrors the tokens in styles-claude.css. three.js cannot read
     oklch(), so the palette is duplicated here on purpose. */
  var PALETTE = {
    paper: 0xfaf9f5,
    surface: 0xfffdf8,
    clay: 0xb04f31,
    sage: 0x4f7a63,
    ink: 0x1f1e1d
  };

  var LABEL = {
    pause: { de: 'Bewegung pausieren', en: 'Pause motion', es: 'Pausar el movimiento' },
    play: { de: 'Bewegung fortsetzen', en: 'Resume motion', es: 'Reanudar el movimiento' }
  };
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="6.5" width="3.1" height="11" rx="1.1"/><rect x="13.9" y="6.5" width="3.1" height="11" rx="1.1"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 6.4v11.2L18 12z"/></svg>';

  var script = document.currentScript;
  var BASE = script && script.src ? new URL('.', script.src) : new URL('./', location.href);

  var state = {
    lib: null,
    loading: null,
    scenes: [],
    toggle: null,
    motion: true,
    degraded: false,
    failed: false
  };

  /* ---------- motion preference ---------- */

  function storedMotion() {
    try {
      var v = localStorage.getItem(MOTION_KEY);
      if (v === 'off') return false;
      if (v === 'on') return true;
    } catch (e) { /* storage blocked — fall through to the OS setting */ }
    return !REDUCE.matches;
  }

  function rememberMotion(on) {
    try { localStorage.setItem(MOTION_KEY, on ? 'on' : 'off'); } catch (e) { /* ignore */ }
  }

  state.motion = storedMotion();

  /* ---------- capability checks ---------- */

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  function isLite() {
    if (window.matchMedia('(max-width: 760px)').matches) return true;
    var cores = navigator.hardwareConcurrency || 4;
    return cores <= 4;
  }

  /* ---------- geometry helpers ---------- */

  function roundedRect(THREE, w, h, r) {
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

  function gridLines(THREE, size, segments) {
    var pts = [];
    var half = size / 2;
    var step = size / segments;
    for (var i = 0; i <= segments; i++) {
      var v = -half + i * step;
      for (var j = 0; j < segments; j++) {
        var a = -half + j * step;
        var b = a + step;
        pts.push(a, 0, v, b, 0, v);   // row
        pts.push(v, 0, a, v, 0, b);   // column
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }

  /* ---------- scene 1: stratum (hero) ----------
     A drafting-table model: seven paper plates on a slow axis,
     two hairline struts, a fine ground ring. Read as an
     architectural sketch rather than a render. */

  function makeStratum(THREE, ctx) {
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PALETTE.paper, 8.4, 19);

    var camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
    camera.position.set(0, 0.42, 9.3);
    camera.lookAt(0, 0.02, 0);

    var group = new THREE.Group();
    scene.add(group);

    var plateX = 2.42;
    var plateY = 1.52;
    var shape = roundedRect(THREE, plateX, plateY, 0.24);
    var fillGeo = new THREE.ShapeGeometry(shape, 14);

    var outline = shape.getPoints(72);
    var outlinePts = outline.map(function (p) { return new THREE.Vector3(p.x, p.y, 0); });
    outlinePts.push(outlinePts[0].clone());
    var outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePts);

    var layers = ctx.lite ? 5 : 7;
    var clay = new THREE.Color(PALETTE.clay);
    var sage = new THREE.Color(PALETTE.sage);

    for (var i = 0; i < layers; i++) {
      var k = layers > 1 ? i / (layers - 1) : 0;
      var isAccent = i === layers - 2;

      var plate = new THREE.Group();

      var fill = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({
        color: PALETTE.surface,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      }));
      fill.position.z = -0.045;

      var back = new THREE.Line(outlineGeo, new THREE.LineBasicMaterial({
        color: PALETTE.ink,
        transparent: true,
        opacity: 0.13
      }));
      back.position.z = -0.05;

      var front = new THREE.Line(outlineGeo, new THREE.LineBasicMaterial({
        color: isAccent ? sage : clay,
        transparent: true,
        opacity: isAccent ? 0.55 : 0.44
      }));

      plate.add(fill, back, front);
      plate.position.y = -1.32 + k * 2.64;
      plate.rotation.y = -0.42 + i * 0.17;
      plate.scale.setScalar(1 - k * 0.085);
      group.add(plate);
    }

    var strut = new THREE.BufferGeometry();
    strut.setAttribute('position', new THREE.Float32BufferAttribute([
      -1.02, -1.44, -0.05, -1.02, 1.44, -0.05,
      1.02, -1.44, -0.05, 1.02, 1.44, -0.05
    ], 3));
    group.add(new THREE.LineSegments(strut, new THREE.LineBasicMaterial({
      color: PALETTE.ink,
      transparent: true,
      opacity: 0.1
    })));

    var ground = new THREE.Group();
    [2.42, 3.06].forEach(function (r, idx) {
      var ring = new THREE.RingGeometry(r, r + 0.008, 140);
      ring.rotateX(-Math.PI / 2);
      var line = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({
        color: idx === 0 ? PALETTE.clay : PALETTE.ink,
        transparent: true,
        opacity: idx === 0 ? 0.22 : 0.09,
        side: THREE.DoubleSide,
        depthWrite: false
      }));
      line.position.y = -1.62;
      ground.add(line);
    });
    group.add(ground);

    var baseY = 0;
    var spin = 0;

    return {
      scene: scene,
      camera: camera,
      resize: function (w, h) {
        var aspect = w / h;
        var wide = aspect > 1.12;
        group.position.x = wide ? 1.82 : 0;
        baseY = wide ? 0.04 : -0.12;
        group.position.y = baseY;
        group.scale.setScalar(wide ? 1 : Math.min(0.74, aspect * 1.32));
      },
      update: function (t, dt, pointer) {
        spin += dt * 0.055;
        group.rotation.y = spin + pointer.x * 0.3;
        group.rotation.x = -0.03 + pointer.y * 0.13;
        group.position.y = baseY + Math.sin(t * 0.52) * 0.045;
        ground.rotation.y = -spin * 0.4;
      }
    };
  }

  /* ---------- scene 2: contour (page heads) ----------
     A wire terrain drawn with a tiny shader so the waves cost
     nothing per frame. Two layers, clay over sage. */

  var CONTOUR_VERT = [
    'uniform float uTime;',
    'uniform float uAmp;',
    'varying float vDepth;',
    'varying float vEdge;',
    'void main() {',
    '  vec3 p = position;',
    '  float radial = length(p.xz);',
    '  float edge = 1.0 - smoothstep(2.4, 6.6, radial);',
    '  float wave = sin(p.x * 0.58 + uTime * 0.46) * 0.5 + cos(p.z * 0.47 - uTime * 0.34) * 0.5;',
    '  p.y += wave * uAmp * edge;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  vDepth = -mv.z;',
    '  vEdge = edge;',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');

  var CONTOUR_FRAG = [
    'uniform vec3 uColor;',
    'uniform float uOpacity;',
    'varying float vDepth;',
    'varying float vEdge;',
    'void main() {',
    '  float depth = 1.0 - smoothstep(4.6, 14.0, vDepth);',
    '  float a = uOpacity * depth * (0.3 + 0.7 * vEdge);',
    '  if (a < 0.002) discard;',
    '  gl_FragColor = vec4(uColor, a);',
    '}'
  ].join('\n');

  function coneLayer(THREE, opts) {
    var uniforms = {
      uTime: { value: 0 },
      uAmp: { value: opts.amp },
      uColor: { value: new THREE.Color(opts.color) },
      uOpacity: { value: opts.opacity }
    };
    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: CONTOUR_VERT,
      fragmentShader: CONTOUR_FRAG,
      transparent: true,
      depthWrite: false
    });
    var lines = new THREE.LineSegments(gridLines(THREE, opts.size, opts.segments), material);
    lines.position.y = opts.y || 0;
    return { object: lines, uniforms: uniforms };
  }

  function makeContour(THREE, ctx) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
    camera.position.set(0, 2.95, 7.1);
    camera.lookAt(0, 0.06, -0.5);

    var group = new THREE.Group();
    group.rotation.y = -0.18;
    scene.add(group);

    var near = coneLayer(THREE, {
      size: 12.5, segments: ctx.lite ? 30 : 42, amp: 0.34,
      color: PALETTE.clay, opacity: 0.19, y: 0
    });
    var far = coneLayer(THREE, {
      size: 19, segments: ctx.lite ? 18 : 26, amp: 0.6,
      color: PALETTE.sage, opacity: 0.1, y: -0.05
    });
    group.add(far.object, near.object);

    var drift = 0;

    return {
      scene: scene,
      camera: camera,
      resize: function (w, h) {
        var aspect = w / h;
        group.scale.setScalar(aspect > 1.4 ? 1 : Math.max(0.72, aspect * 1.05));
      },
      update: function (t, dt, pointer) {
        near.uniforms.uTime.value = t;
        far.uniforms.uTime.value = t * 0.72;
        drift += dt * 0.02;
        group.rotation.y = -0.18 + Math.sin(drift) * 0.22 + pointer.x * 0.08;
        group.rotation.x = Math.cos(drift * 0.8) * 0.01 - pointer.y * 0.04;
      }
    };
  }

  var SCENES = { stratum: makeStratum, contour: makeContour };

  /* ---------- mount ---------- */

  function loadLib() {
    if (state.lib) return Promise.resolve(state.lib);
    if (state.loading) return state.loading;
    var url = new URL('vendor/three.module.min.js', BASE).href;
    state.loading = import(url).then(function (mod) {
      state.lib = mod;
      return mod;
    }).catch(function (err) {
      state.failed = true;
      ROOT.classList.add('no-scene3d');
      if (window.console && console.warn) console.warn('[scene3d] three.js could not load', err);
      throw err;
    });
    return state.loading;
  }

  function mount(el) {
    var type = el.getAttribute('data-scene3d');
    var factory = SCENES[type];
    if (!factory) return;
    if (el.getAttribute('data-scene3d-mobile') === 'off' && window.matchMedia('(max-width: 720px)').matches) return;
    if (el.dataset.scene3dReady) return;
    el.dataset.scene3dReady = '1';

    loadLib().then(function (THREE) {
      var canvas = document.createElement('canvas');
      canvas.className = 'scene3d-canvas';
      el.appendChild(canvas);
      el.classList.add('has-scene3d');

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: !isLite(),
          powerPreference: 'low-power'
        });
      } catch (err) {
        el.classList.remove('has-scene3d');
        el.classList.add('scene3d-failed');
        ROOT.classList.add('no-scene3d');
        return;
      }

      renderer.setClearAlpha(0);
      if (THREE.SRGBColorSpace && 'outputColorSpace' in renderer) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }

      var world = factory(THREE, { lite: isLite() });
      var scene = world.scene;
      var camera = world.camera;

      var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      var raf = 0;
      var time = 0;
      var last = 0;
      var slowFrames = 0;
      var frameCount = 0;
      var visible = true;

      function measure() {
        var w = el.clientWidth;
        var h = el.clientHeight;
        if (!w || !h) return false;

        var dpr = Math.min(window.devicePixelRatio || 1, isLite() ? 1.5 : 2);
        if (state.degraded) dpr = Math.min(dpr, 1);
        if (w * h * dpr * dpr > PIXEL_BUDGET) {
          dpr = Math.max(1, Math.sqrt(PIXEL_BUDGET / (w * h)));
        }

        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (world.resize) world.resize(w, h, dpr);
        return true;
      }

      function draw() {
        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;
        if (world.update) world.update(time, 1 / 60, pointer);
        renderer.render(scene, camera);
      }

      function loop(now) {
        raf = window.requestAnimationFrame(loop);
        if (!last) last = now;
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        time += dt;

        if (world.update) world.update(time, dt, pointer);
        renderer.render(scene, camera);

        /* One quality step, then leave it. Measured on real frames. */
        frameCount++;
        if (!state.degraded && frameCount > 90) {
          slowFrames = dt > 0.028 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
          if (slowFrames > 30) {
            state.degraded = true;
            measure();
            if (world.degrade) world.degrade();
          }
        }
      }

      function start() {
        if (raf || !state.motion || document.hidden || !visible) return;
        last = 0;
        raf = window.requestAnimationFrame(loop);
      }

      function stop() {
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      }

      function settle() {
        stop();
        draw();
      }

      var instance = {
        el: el,
        resize: function () {
          if (!measure()) return;
          if (state.motion && visible && !document.hidden) start();
          else settle();
        },
        start: function () { visible = true; start(); },
        stop: function () { visible = false; stop(); },
        settle: settle,
        destroy: function () {
          stop();
          if (world.dispose) world.dispose();
          renderer.dispose();
        }
      };

      if (!measure()) {
        /* The slot may still be laid out on the next frame. */
        window.requestAnimationFrame(instance.resize);
      }
      state.scenes.push(instance);
      ensureToggle();
      if (state.motion) start(); else settle();

      if ('ResizeObserver' in window) {
        var ro = new ResizeObserver(function () { instance.resize(); });
        ro.observe(el);
        instance.observer = ro;
      } else {
        window.addEventListener('resize', instance.resize, { passive: true });
      }

      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('pointerleave', function () {
        pointer.tx = 0;
        pointer.ty = 0;
      });

      function onPointer(e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        pointer.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
        pointer.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      }
    }).catch(function () { /* already reported */ });
  }

  /* ---------- motion switch ---------- */

  function activeLang() {
    var lang = (ROOT.lang || 'de').slice(0, 2).toLowerCase();
    return lang === 'en' || lang === 'es' ? lang : 'de';
  }

  function paintToggle() {
    if (!state.toggle) return;
    var key = state.motion ? 'pause' : 'play';
    var text = LABEL[key][activeLang()];
    state.toggle.innerHTML = (state.motion ? ICON_PAUSE : ICON_PLAY) +
      '<span>' + text + '</span>';
    state.toggle.setAttribute('aria-label', text);
    state.toggle.setAttribute('aria-pressed', state.motion ? 'true' : 'false');
    state.toggle.setAttribute('title', text);
  }

  function setMotion(on, remember) {
    state.motion = on;
    if (remember !== false) rememberMotion(on);
    ROOT.classList.toggle('scene3d-paused', !on);
    paintToggle();
    state.scenes.forEach(function (s) {
      if (on) { s.start(); s.resize(); } else { s.settle(); }
    });
  }

  function ensureToggle() {
    if (state.toggle || !state.scenes.length) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scene3d-toggle';
    btn.addEventListener('click', function () { setMotion(!state.motion); });
    document.body.appendChild(btn);
    state.toggle = btn;
    paintToggle();
  }

  document.addEventListener('bw:lang', paintToggle);

  /* Small public surface: other layers and later pages can pause
     the scenes, ask how many are live, or force a re-measure
     after a layout change (tab switch, drawer, font swap). */
  window.bwScene3D = {
    setMotion: function (on) { setMotion(!!on); },
    isMotion: function () { return state.motion; },
    count: function () { return state.scenes.length; },
    refresh: function () {
      state.scenes.forEach(function (s) { s.resize(); });
    }
  };

  if (REDUCE.addEventListener) {
    REDUCE.addEventListener('change', function () {
      if (REDUCE.matches) setMotion(false, false);
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      state.scenes.forEach(function (s) { s.stop(); });
    } else if (state.motion) {
      state.scenes.forEach(function (s) { s.start(); });
    }
  });

  /* ---------- boot ---------- */

  var slots = Array.prototype.slice.call(document.querySelectorAll('[data-scene3d]'));
  if (!slots.length) return;

  if (!hasWebGL()) {
    ROOT.classList.add('no-scene3d');
    return;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        mount(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '320px 0px', threshold: 0.01 });
    slots.forEach(function (el) { io.observe(el); });
  } else {
    slots.forEach(mount);
  }
})();
