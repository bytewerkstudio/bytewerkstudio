import * as THREE from './vendor/three.module.min.js';

const stage = document.getElementById('marke-stage');

if (stage) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ui = {
    explode: document.querySelector('[data-marke-explode]'),
    labels: Array.from(document.querySelectorAll('[data-marke-parts], [data-marke-thread]'))
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    stage.classList.add('is-fallback');
    renderer = null;
  }

  if (renderer) build();

  function build() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);
    stage.classList.add('is-3d');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
    const CAM = new THREE.Vector3(0, 1.5, 15.4);

    const world = new THREE.Group();
    scene.add(world);

    // ---------- studio light ----------
    scene.add(new THREE.HemisphereLight(0xfffcf4, 0x8a7b66, 1.15));
    const key = new THREE.DirectionalLight(0xfff2de, 3.0);
    key.position.set(5.5, 8.5, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -7;
    key.shadow.camera.right = 7;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -7;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 34;
    key.shadow.bias = -0.0009;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd7b8, 2.0);
    rim.position.set(-6, 2.5, -5.5);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xfff8ec, 0.55);
    fill.position.set(-3, -6, 4);
    scene.add(fill);

    // ---------- the mark: 3 tiles + 1 dot, as real paper objects ----------
    const TILE = 2.75;          // 11.5 / 28 grid units
    const DOT_R = TILE * (5.95 / 11.5);
    const GAP = TILE * (2 / 11.5);
    const RADIUS = TILE * (3 / 11.5);
    const THICK = 0.46;

    const matPaper = new THREE.MeshStandardMaterial({ color: 0xf0e5d2, roughness: 0.93, metalness: 0 });
    const matPaperTop = new THREE.MeshStandardMaterial({ color: 0xf8f2e6, roughness: 0.9, metalness: 0 });
    const matInk = new THREE.MeshStandardMaterial({ color: 0x2b2723, roughness: 0.72, metalness: 0.02 });
    const matClay = new THREE.MeshStandardMaterial({ color: 0xa8492c, roughness: 0.55, metalness: 0.04 });

    function tileGeometry(size, radius, depth) {
      const r = Math.min(radius, size / 2 - 0.001);
      const s = new THREE.Shape();
      const x = -size / 2, y = -size / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + size - r, y);
      s.quadraticCurveTo(x + size, y, x + size, y + r);
      s.lineTo(x + size, y + size - r);
      s.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
      s.lineTo(x + r, y + size);
      s.quadraticCurveTo(x, y + size, x, y + size - r);
      s.lineTo(x, y + r);
      s.quadraticCurveTo(x, y, x + r, y);
      return new THREE.ExtrudeGeometry(s, {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.045,
        bevelSegments: 2,
        curveSegments: 10
      }).center();
    }

    const tileGeo = tileGeometry(TILE, RADIUS, THICK);
    const dotGeo = new THREE.SphereGeometry(DOT_R, 56, 40);

    // logo layout (28x28 grid): three tiles + one dot, centred
    const step = TILE + GAP;
    const layout = [
      { x: -step / 2, y: step / 2, mat: matPaper, name: 'tile-0' },
      { x: step / 2, y: step / 2, mat: matPaperTop, name: 'tile-1' },
      { x: -step / 2, y: -step / 2, mat: matInk, name: 'tile-2' },
      { x: step / 2, y: -step / 2, mat: matClay, name: 'dot', dot: true }
    ];

    const parts = layout.map((def, i) => {
      const holder = new THREE.Group();
      const mesh = new THREE.Mesh(def.dot ? dotGeo : tileGeo, def.mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      holder.add(mesh);

      const home = new THREE.Vector3(def.x, def.y, 0);
      // explode direction: outward from the centre, plus depth
      const dir = new THREE.Vector3(def.x, def.y, 0).normalize().multiplyScalar(1.05);
      dir.z = 1.5 + i * 0.22;
      const away = home.clone().add(dir);

      holder.userData = { home, away, name: def.name, i };
      holder.position.copy(home);
      world.add(holder);
      return holder;
    });

    // a terracotta thread that ties the mark together
    const threadPts = [];
    const LOOP = 260;
    const RING = (TILE + GAP) * 1.46;  // clears the tile corners (r ≈ 4.23)
    const RING_OPEN = RING * 1.42;     // the loop widens when the mark is taken apart
    for (let s = 0; s <= LOOP; s++) {
      const a = (s / LOOP) * Math.PI * 2;
      // A tilted loop: it passes in front of the top edge, behind the bottom
      // edge and around both sides, so it reads as one thread around the mark.
      const x = Math.cos(a) * RING;
      const y = Math.sin(a) * RING;
      const z = Math.sin(a) * 0.0 + Math.cos(a * 2) * 0.0;
      threadPts.push(new THREE.Vector3(x, y, z));
    }
    const thread = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(threadPts, true, 'catmullrom', 0.5), 480, 0.026, 6, true),
      new THREE.MeshStandardMaterial({ color: 0xa8492c, roughness: 0.42, metalness: 0.05, transparent: true, opacity: 0.9 })
    );
    thread.castShadow = true;
    world.add(thread);

    // ---------- soft shadow plane ----------
    {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 126);
      g.addColorStop(0, 'rgba(46,34,22,0.26)');
      g.addColorStop(0.44, 'rgba(46,34,22,0.10)');
      g.addColorStop(1, 'rgba(46,34,22,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -3.5;
      scene.add(plane);
    }

    // ---------- state ----------
    let exploded = false;
    let highlighted = [];
    let threadHighlighted = false;
    let openAmount = 0;
    let el = 0;
    let raf = 0;
    let running = false;
    let onScreen = false;

    const rot = { x: -0.10, y: 0.0, tx: -0.10, ty: 0.0 };
    const drag = { active: false, id: null, x: 0, y: 0, moved: 0 };
    const pointer = { inside: false, x: 0, y: 0, nx: 0, ny: 0 };

    function resize() {
      const w = stage.clientWidth || 1;
      const h = stage.clientHeight || 1;
      const aspect = w / h;
      camera.aspect = aspect;
      const pull = aspect < 1.05 ? 1 + (1.05 - aspect) * 0.85 : 1;
      camera.position.copy(CAM).multiplyScalar(pull);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const maxPixels = 2600000;
      const scale = Math.min(1, Math.sqrt(maxPixels / (w * h * dpr * dpr)));
      renderer.setPixelRatio(dpr * scale);
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    // ---------- interaction ----------
    function setExploded(on) {
      exploded = on;
      stage.classList.toggle('is-open', on);
      if (ui.explode) ui.explode.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (reduced.matches) {
        // no easing: jump straight to the new state and draw one frame
        openAmount = on ? 1 : 0;
        exploded = on;
        if (running) return;
        running = true;
        frame();
      } else {
        kick();
      }
    }

    if (ui.explode) ui.explode.addEventListener('click', () => setExploded(!exploded));

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      drag.active = true;
      drag.id = e.pointerId;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved = 0;
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', (e) => {
      pointer.inside = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      if (drag.active && e.pointerId === drag.id) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        rot.ty += dx * 0.006;
        rot.tx = clamp(rot.tx + dy * 0.004, -0.75, 0.75);
      }
    });

    stage.addEventListener('pointerup', (e) => {
      if (!drag.active || e.pointerId !== drag.id) return;
      drag.active = false;
      drag.id = null;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
      if (drag.moved < 7) setExploded(!exploded);
    });

    stage.addEventListener('pointercancel', () => { drag.active = false; drag.id = null; });
    stage.addEventListener('pointerleave', () => { pointer.inside = false; });
    // parts highlight on hover, so the loop must be running while the pointer moves
    stage.addEventListener('pointermove', () => { if (running === false) kick(); }, { passive: true });

    // pointer parallax
    stage.addEventListener('pointermove', () => {
      const r = stage.getBoundingClientRect();
      pointer.nx = clamp((pointer.x - r.left) / r.width - 0.5, -0.5, 0.5) * 2;
      pointer.ny = clamp((pointer.y - r.top) / r.height - 0.5, -0.5, 0.5) * 2;
    }, { passive: true });

    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) kick();
    }, { rootMargin: '160px 0px', threshold: 0 });
    io.observe(stage);

    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

    const clock = new THREE.Clock();
    function kick() {
      if (running) return;
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    }

    function frame() {
      raf = 0;
      if (!onScreen || document.hidden) { running = false; return; }
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced.matches) el += dt;

      openAmount += ((exploded ? 1 : 0) - openAmount) * 0.075;

      const parallaxX = pointer.inside && !drag.active ? pointer.nx * 0.28 : 0;
      const parallaxY = pointer.inside && !drag.active ? pointer.ny * 0.16 : 0;

      if (!drag.active && !reduced.matches) rot.ty += dt * 0.10;
      rot.y += (rot.ty + parallaxX - rot.y) * 0.06;
      rot.x += (rot.tx + parallaxY - rot.x) * 0.06;

      world.rotation.y = rot.y;
      world.rotation.x = rot.x;
      world.position.y = reduced.matches ? 0 : Math.sin(el * 0.5) * 0.06;

      parts.forEach((p, i) => {
        const { home, away } = p.userData;
        const ease = openAmount;
        p.position.x = home.x + (away.x - home.x) * ease;
        p.position.y = home.y + (away.y - home.y) * ease;
        p.position.z = home.z + (away.z - home.z) * ease;

        const spin = ease * (i % 2 ? 0.6 : -0.6);
        p.rotation.y = spin;
        p.rotation.x = ease * (i % 2 ? 0.34 : -0.28);

        const lift = (p.userData.hover ? 0.34 : 0) + (highlighted.indexOf(i) >= 0 ? 0.9 : 0);
        p.position.z += lift;

        if (!reduced.matches) {
          p.position.z += Math.sin(el * 0.6 + i * 1.2) * 0.03 * (1 - ease * 0.6);
        }
      });

      // the thread is a tilted ring: it crosses in front of and behind the tiles
      thread.rotation.z = (reduced.matches ? 0 : el * 0.05) + 0.14;
      thread.rotation.x = 0.42 + 0.42 * openAmount;
      thread.rotation.y = reduced.matches ? 0 : Math.sin(el * 0.2) * 0.06;
      thread.scale.setScalar((RING_OPEN / RING) * (0.15 + 0.85 * (1 - openAmount * 0.55)));
      thread.material.opacity = 0.84 - openAmount * 0.30;
      const threadLift = thread.userData.hover || threadHighlighted ? 1 : 0;
      thread.scale.setScalar(1 + threadLift * 0.06);
      thread.position.z = threadLift * 0.5;

      renderer.render(scene, camera);
      if (!reduced.matches) raf = requestAnimationFrame(frame);
      else running = false;
    }

    // Debug hook so headless checks can inspect the scene.
    window.__marke = { THREE, scene, camera, world, parts, renderer, render: () => renderer.render(scene, camera) };

    if (reduced.matches) {
      onScreen = true;
      running = true;
      frame();
    } else {
      kick();
    }

    if (reduced.addEventListener) {
      reduced.addEventListener('change', () => {
        if (!reduced.matches) kick();
        else if (!running) { running = true; frame(); }
      });
    }

    // expose a tiny hook for the part labels (progressive enhancement)
    ui.labels.forEach((btn) => {
      const isThread = btn.hasAttribute('data-marke-thread');
      const indices = isThread ? [] : String(btn.dataset.markeParts || '').split(',').map(Number).filter(n => !Number.isNaN(n));
      const group = indices.map(i => parts[i]).filter(Boolean);
      if (!group.length && !isThread) return;

      const setHover = (on) => {
        group.forEach(p => { p.userData.hover = on; });
        thread.userData.hover = on;
        kick();
      };

      btn.addEventListener('mouseenter', () => setHover(true));
      btn.addEventListener('mouseleave', () => setHover(false));
      btn.addEventListener('focus', () => setHover(true));
      btn.addEventListener('blur', () => setHover(false));

      btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        ui.labels.forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        highlighted = on ? indices : [];
        threadHighlighted = on && isThread;
        if (on) setExploded(true);
        kick();
      });
    });
  }
}

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
