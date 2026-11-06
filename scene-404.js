/* ============================================================
   BYTEWERK STUDIO — scene-404.js
   ------------------------------------------------------------
   The Bytewerk mark, taken apart: three plates and one disc
   floating on warm paper. Drag to turn, click to assemble.

   Progressive enhancement. Without JS, without WebGL or after
   an error the static SVG in 404.html stays visible. With
   prefers-reduced-motion the mark starts assembled and only
   moves when the visitor drags it.

   three.js r180 is vendored locally because the CSP allows
   script-src 'self' only.
   ============================================================ */

const stage = document.querySelector('[data-nf-scene]');
const canvas = document.getElementById('nf-canvas');
const homeBtn = document.querySelector('[data-nf-home]');
const toggleBtn = document.querySelector('[data-nf-toggle]');
const caption = document.querySelector('[data-nf-caption]');

/* Probe for WebGL before touching three.js: a failed context used to
   print three console errors and pull 700 KB for nothing. */
function hasWebGL() {
  try {
    const probe = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl')));
  } catch (_) {
    return false;
  }
}

(async function () {
  if (!stage || !canvas) return;

  if (!hasWebGL()) {
    stage.setAttribute('data-scene', 'off');
    return;
  }

  let THREE;
  try {
    THREE = await import('./vendor/three.module.min.js');
  } catch (_) {
    stage.setAttribute('data-scene', 'off');
    return;
  }

  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power'
    });
  } catch (_) {
    renderer = null;
  }

  if (!renderer) {
    stage.setAttribute('data-scene', 'off');
    return;
  }

  build();

  function build() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* ---------- Palette ---------- */
    const C = {
      ink: 0x221f1b,
      inkSoft: 0x2d2925,
      graphite: 0x37322c,
      accent: 0xb04f31,
      edge: 0xf0e4cd
    };

    /* ---------- Root ---------- */
    const rig = new THREE.Group();
    scene.add(rig);

    /* ---------- Light ---------- */
    const hemi = new THREE.HemisphereLight(0xfff8ec, 0xcdbfa5, 1.15);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff4e0, 3.1);
    key.position.set(5.5, 8.5, 7.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 4;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -12;
    key.shadow.camera.right = 12;
    key.shadow.camera.top = 12;
    key.shadow.camera.bottom = -12;
    key.shadow.radius = 4;
    key.shadow.bias = -0.0012;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xdde8e0, 0.62);
    fill.position.set(-7, -3.5, 6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffdfc4, 0.85);
    rim.position.set(-3, 6, -7);
    scene.add(rim);

    /* ---------- Warm halo behind the mark ---------- */
    (function halo() {
      const size = 256;
      const cv = document.createElement('canvas');
      cv.width = cv.height = size;
      const g = cv.getContext('2d');
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, 'rgba(255, 250, 238, 0.95)');
      grad.addColorStop(0.55, 'rgba(250, 240, 222, 0.38)');
      grad.addColorStop(1, 'rgba(250, 240, 222, 0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 18),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 })
      );
      mesh.position.z = -4.5;
      scene.add(mesh);
    })();

    /* ---------- Geometry helpers ---------- */
    // The mark is drawn on a 28x28 grid in logo.svg: plates span
    // 1.5–13 and 15–26.5, so their centres sit 6.75 units from the
    // middle of the mark. Same proportions here.
    const UNIT = 0.40;
    const SIDE = 11.5 * UNIT;          // plate edge       -> 4.60
    const GAP = 6.75 * UNIT;           // centre offset    -> 2.70
    const THICK = 0.34;
    const DOT = 5.95 * UNIT;

    function roundedSquare(edge, radius) {
      const s = new THREE.Shape();
      const h = edge / 2;
      const r = Math.min(radius, h - 0.001);
      s.moveTo(-h + r, -h);
      s.lineTo(h - r, -h);
      s.quadraticCurveTo(h, -h, h, -h + r);
      s.lineTo(h, h - r);
      s.quadraticCurveTo(h, h, h - r, h);
      s.lineTo(-h + r, h);
      s.quadraticCurveTo(-h, h, -h, h - r);
      s.lineTo(-h, -h + r);
      s.quadraticCurveTo(-h, -h, -h + r, -h);
      s.closePath();
      return s;
    }

    function plateGeometry() {
      const geo = new THREE.ExtrudeGeometry(roundedSquare(SIDE, SIDE * 0.26), {
        depth: THICK,
        bevelEnabled: true,
        bevelThickness: 0.035,
        bevelSize: 0.035,
        bevelSegments: 2,
        curveSegments: 10
      });
      geo.center();
      return geo;
    }

    const plateGeo = plateGeometry();
    const edgeGeo = new THREE.EdgesGeometry(plateGeo, 26);

    const materials = [
      new THREE.MeshStandardMaterial({ color: C.ink, roughness: 0.44, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: C.inkSoft, roughness: 0.48, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: C.graphite, roughness: 0.52, metalness: 0.05 })
    ];
    const edgeMat = new THREE.LineBasicMaterial({
      color: C.edge,
      transparent: true,
      opacity: 0.13
    });

    function makePlate(mat) {
      const g = new THREE.Group();
      const mesh = new THREE.Mesh(plateGeo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      g.add(new THREE.LineSegments(edgeGeo, edgeMat));
      return g;
    }

    /* ---------- The four parts ---------- */
    const parts = [];

    // The parts keep the arrangement of the mark when they come apart,
    // so the shape stays readable. Only the spacing and a slight tilt
    // change; no part is flung to a random corner.
    const SPREAD = 1.72;

    const layout = [
      // assembled x/y, exploded x/y/z, exploded rotation (xyz), float phase
      { ax: -GAP, ay: GAP, ex: -GAP * SPREAD, ey: GAP * SPREAD, ez: -1.90, rx: -0.16, ry: 0.42, rz: 0.10, ph: 0.0, mat: materials[0] },
      { ax: GAP, ay: GAP, ex: GAP * SPREAD, ey: GAP * SPREAD * 0.96, ez: 1.35, rx: 0.20, ry: -0.46, rz: -0.09, ph: 1.7, mat: materials[1] },
      { ax: -GAP, ay: -GAP, ex: -GAP * SPREAD * 0.98, ey: -GAP * SPREAD, ez: -0.55, rx: 0.12, ry: 0.34, rz: 0.20, ph: 3.4, mat: materials[2] }
    ];

    layout.forEach((d, i) => {
      const g = makePlate(d.mat);
      g.userData = d;
      g.userData.assembled = new THREE.Vector3(d.ax, d.ay, 0);
      g.userData.exploded = new THREE.Vector3(d.ex, d.ey, d.ez);
      g.userData.explodedRot = new THREE.Euler(d.rx, d.ry, d.rz);
      g.position.copy(d.assembled);
      rig.add(g);
      parts.push(g);
    });

    /* disc: the terracotta dot, bottom right */
    (function disc() {
      const geo = new THREE.CylinderGeometry(DOT, DOT, THICK, 64, 1);
      geo.rotateX(Math.PI / 2);
      geo.center();

      const g = new THREE.Group();
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: C.accent, roughness: 0.42, metalness: 0.06 })
      );
      g.add(mesh);
      g.userData = {
        ax: GAP, ay: -GAP,
        ex: GAP * SPREAD, ey: -GAP * SPREAD * 0.98, ez: 1.10,
        rx: -0.22, ry: 0.30, rz: 0.06,
        ph: 5.1
      };
      g.userData.assembled = new THREE.Vector3(GAP, -GAP, 0);
      g.userData.exploded = new THREE.Vector3(GAP * SPREAD, -GAP * SPREAD * 0.98, -0.55);
      g.userData.explodedRot = new THREE.Euler(-0.22, 0.30, 0.06);
      g.position.copy(g.userData.assembled);
      rig.add(g);
      parts.push(g);
    })();

    /* ---------- Ghost outlines ----------
       Dashed silhouettes where each part belongs, the way a technical
       drawing marks a position. They fade out as the mark closes. */
    const platePoints = roundedSquare(SIDE, SIDE * 0.26).getPoints(24)
      .map((p) => new THREE.Vector3(p.x, p.y, 0));
    platePoints.push(platePoints[0].clone());

    const dotPoints = [];
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      dotPoints.push(new THREE.Vector3(Math.cos(a) * DOT, Math.sin(a) * DOT, 0));
    }

    const guides = parts.map((g, i) => {
      const geo = new THREE.BufferGeometry().setFromPoints(i === 3 ? dotPoints : platePoints);
      const mat = new THREE.LineDashedMaterial({
        color: 0xb3a894,
        dashSize: 0.115,
        gapSize: 0.155,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      line.position.copy(g.userData.assembled);
      line.position.z = -THICK * 0.7;
      rig.add(line);
      return line;
    });

    /* ---------- Shadow catcher ---------- */
    (function floor() {
      const geo = new THREE.PlaneGeometry(60, 60);
      const mat = new THREE.ShadowMaterial({ opacity: 0.26 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = -1.9;
      mesh.receiveShadow = true;
      scene.add(mesh);
    })();

    /* ---------- Camera fit ----------
       Measure the real extent of the exploded layout (position plus
       the plate's half diagonal) and place the camera so that sphere
       fills the frame. Guessing a fixed size left the mark tiny. */
    const HALF_DIAG = (SIDE / 2) * Math.SQRT2;
    let HALF_W = 6;
    let HALF_H = 6;

    (function measure() {
      HALF_W = 0;
      HALF_H = 0;
      parts.forEach((g, i) => {
        const p = g.userData.exploded;
        const reach = i === 3 ? DOT : HALF_DIAG;
        HALF_W = Math.max(HALF_W, Math.abs(p.x) + reach);
        HALF_H = Math.max(HALF_H, Math.abs(p.y) + reach);
      });
    })();

    function fit() {
      const w = stage.clientWidth || 1;
      const h = stage.clientHeight || 1;
      camera.aspect = w / h;

      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const tanV = Math.tan(vFov / 2);
      const tanH = tanV * camera.aspect;

      // Box fit with a little breathing room for the scene chrome.
      const distV = (HALF_H * 1.26) / tanV;
      const distH = (HALF_W * 1.20) / tanH;
      const d = Math.max(distV, distH);

      camera.position.set(0, 0, d);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      dirty = true;
    }

    /* ---------- State ---------- */
    let mode = REDUCE.matches ? 'assembled' : 'exploded';
    let anim = null;             // { from, to, start, dur }
    let dirty = true;
    let raf = 0;
    let running = false;
    let dragYaw = 0;
    let dragPitch = 0;
    let px = 0;
    let py = 0;
    let clock = new THREE.Clock();
    let elapsed = 0;
    let inView = true;

    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function updateLabels() {
      const en = document.documentElement.lang === 'en';
      if (toggleBtn) {
        toggleBtn.textContent = mode === 'assembled'
          ? (en ? 'Take apart' : 'Wieder zerlegen')
          : (en ? 'Assemble' : 'Zusammensetzen');
      }
      if (caption) {
        caption.textContent = mode === 'assembled'
          ? (en ? 'The mark, complete' : 'Das Zeichen, vollstaendig')
          : (en ? 'The mark, in four parts' : 'Das Zeichen, in vier Teilen');
      }
      if (canvas) {
        canvas.setAttribute('aria-label', en
          ? 'The Bytewerk mark in four parts. Drag to turn it, use the button to assemble.'
          : 'Das Bytewerk-Zeichen in vier Teilen. Ziehen dreht es, der Knopf setzt es zusammen.');
      }
    }

    function applyMode(next) {
      mode = next;
      anim = { start: performance.now(), dur: REDUCE.matches ? 1 : 1000 };
      updateLabels();
      dirty = true;
      start();
    }

    function toggle() {
      applyMode(mode === 'assembled' ? 'exploded' : 'assembled');
    }

    /* ---------- Render loop ---------- */
    function frame() {
      raf = 0;
      if (!running) return;
      raf = requestAnimationFrame(frame);

      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      let moving = false;

      if (anim) {
        const p = Math.min(1, (performance.now() - anim.start) / anim.dur);
        const e = easeInOut(p);
        const to = mode === 'assembled' ? 'assembled' : 'exploded';

        parts.forEach((g) => {
          const d = g.userData;
          const target = to === 'assembled' ? d.assembled : d.exploded;
          const targetRot = to === 'assembled' ? new THREE.Euler(0, 0, 0) : d.explodedRot;

          if (!g.userData.fromPos) {
            g.userData.fromPos = g.position.clone();
            g.userData.fromRot = new THREE.Euler().copy(g.rotation);
          }

          g.position.set(
            THREE.MathUtils.lerp(g.userData.fromPos.x, target.x, e),
            THREE.MathUtils.lerp(g.userData.fromPos.y, target.y, e),
            THREE.MathUtils.lerp(g.userData.fromPos.z, target.z, e)
          );
          g.rotation.set(
            THREE.MathUtils.lerp(g.userData.fromRot.x, targetRot.x, e),
            THREE.MathUtils.lerp(g.userData.fromRot.y, targetRot.y, e),
            THREE.MathUtils.lerp(g.userData.fromRot.z, targetRot.z, e)
          );
        });

        guides.forEach((line) => {
          line.material.opacity = (to === 'assembled' ? 0.5 * (1 - e) : 0.5 * e);
          line.visible = line.material.opacity > 0.01;
        });

        if (p >= 1) {
          anim = null;
          parts.forEach((g) => { g.userData.fromPos = null; g.userData.fromRot = null; });
        }
        moving = true;
      } else if (!REDUCE.matches) {
        // Slow float, only while the mark is apart.
        if (mode === 'exploded') {
          parts.forEach((g) => {
            const d = g.userData;
            g.position.set(
              d.exploded.x + Math.sin(elapsed * 0.52 + d.ph) * 0.13,
              d.exploded.y + Math.cos(elapsed * 0.44 + d.ph * 1.3) * 0.16,
              d.exploded.z + Math.sin(elapsed * 0.37 + d.ph * 0.7) * 0.12
            );
            g.rotation.set(
              d.explodedRot.x + Math.sin(elapsed * 0.31 + d.ph) * 0.05,
              d.explodedRot.y + Math.cos(elapsed * 0.27 + d.ph) * 0.06,
              d.explodedRot.z + Math.sin(elapsed * 0.23 + d.ph) * 0.04
            );
          });
        } else {
          parts.forEach((g) => {
            const d = g.userData;
            g.position.set(d.assembled.x, d.assembled.y, d.assembled.z + Math.sin(elapsed * 0.5 + d.ph) * 0.02);
            g.rotation.set(0, 0, 0);
          });
        }
        moving = true;
      }

      const idle = (!REDUCE.matches && mode === 'exploded') ? Math.sin(elapsed * 0.16) * 0.10 : 0;
      const targetYaw = dragYaw + px * 0.16 + idle;
      const targetPitch = dragPitch + py * 0.11;

      rig.rotation.y += (targetYaw - rig.rotation.y) * Math.min(1, dt * 6.5);
      rig.rotation.x += (targetPitch - rig.rotation.x) * Math.min(1, dt * 6.5);

      if (Math.abs(targetYaw - rig.rotation.y) > 0.0005 ||
          Math.abs(targetPitch - rig.rotation.x) > 0.0005) moving = true;

      if (moving || dirty) {
        renderer.render(scene, camera);
        dirty = false;
      }
    }

    function start() {
      if (running || !inView || document.hidden) return;
      running = true;
      clock.getDelta();
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    /* ---------- Pointer ---------- */
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;

    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.classList.add('dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
      start();
    });

    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;

      if (!dragging) { start(); return; }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      dragYaw += dx * 0.0055;
      dragPitch = Math.max(-0.62, Math.min(0.62, dragPitch + dy * 0.0045));
      lastX = e.clientX;
      lastY = e.clientY;
      start();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
      if (!moved) toggle();
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', () => {
      dragging = false;
      stage.classList.remove('dragging');
    });
    stage.addEventListener('pointerleave', () => {
      px = 0;
      py = 0;
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
      });
    }

    /* ---------- Call to action: assemble, then go home ---------- */
    if (homeBtn) {
      homeBtn.addEventListener('click', (e) => {
        const href = homeBtn.getAttribute('href');
        if (!href) return;
        if (!REDUCE.matches) {
          e.preventDefault();
          dragYaw = 0;
          dragPitch = 0;
          px = 0;
          py = 0;
          applyMode('assembled');
          window.setTimeout(() => { window.location.href = href; }, 1050);
        }
      });
    }

    /* ---------- Visibility & resize ---------- */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          inView = en.isIntersecting;
          if (inView) start(); else stop();
        });
      }, { threshold: 0.05 }).observe(stage);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(fit, 90);
    };

    if ('ResizeObserver' in window) {
      new ResizeObserver(onResize).observe(stage);
    } else {
      window.addEventListener('resize', onResize);
    }

    document.addEventListener('bw:lang', updateLabels);

    /* ---------- Boot ---------- */
    stage.setAttribute('data-scene', 'on');
    canvas.setAttribute('aria-hidden', 'false');
    canvas.setAttribute('role', 'img');

    fit();

    // Place parts in their start state without animating on first paint.
    parts.forEach((g) => {
      const toAssembled = mode === 'assembled';
      const d = g.userData;
      const target = toAssembled ? d.assembled : d.exploded;
      g.position.copy(target);
      if (toAssembled) g.rotation.set(0, 0, 0); else g.rotation.copy(d.explodedRot);
    });

    guides.forEach((line) => {
      line.visible = mode !== 'assembled';
      line.material.opacity = mode === 'assembled' ? 0 : 0.5;
    });

    updateLabels();
    anim = null;
    parts.forEach((g) => { g.userData.fromPos = null; g.userData.fromRot = null; });
    renderer.render(scene, camera);
    start();
  }
})();
