/* ============================================================
   BYTEWERK STUDIO — scene-sicherheit.js
   ------------------------------------------------------------
   A wireframe shell around a single terracotta core: the policy
   as a closed surface, one small thing worth protecting inside.
   Drag-free, pointer only tilts the model a little.

   Rules (AGENTS.md)
   - local three.js only, no network requests
   - DPR <= 2, canvas capped by CSS
   - pauses off-screen and in background tabs
   - prefers-reduced-motion: one static frame
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

const host = document.getElementById('sec-stage');

if (host) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    renderer = null;
  }

  if (!renderer) {
    host.classList.add('is-fallback');
  } else {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0.15, 6.6);
    camera.lookAt(0, 0, 0);

    const model = new THREE.Group();
    scene.add(model);

    const shellGeo = new THREE.IcosahedronGeometry(1.95, 1);
    const shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(shellGeo),
      new THREE.LineBasicMaterial({ color: 0x3b3833, transparent: true, opacity: 0.38 })
    );
    model.add(shell);

    const inner = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.12, 0)),
      new THREE.LineBasicMaterial({ color: 0xb04f31, transparent: true, opacity: 0.42 })
    );
    model.add(inner);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.MeshBasicMaterial({ color: 0xb04f31 })
    );
    model.add(core);

    const nodes = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', shellGeo.attributes.position.clone()),
      new THREE.PointsMaterial({ color: 0x1f1e1d, size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.5 })
    );
    model.add(nodes);

    /* A single hairline orbit, like a drawn circle on paper. */
    const orbitPts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      orbitPts.push(new THREE.Vector3(Math.cos(a) * 2.42, Math.sin(a) * 0.32, Math.sin(a) * 2.42));
    }
    const orbit = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(orbitPts),
      new THREE.LineBasicMaterial({ color: 0xd8d1c0, transparent: true, opacity: 0.9 })
    );
    orbit.rotation.x = 0.42;
    model.add(orbit);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    host.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; });

    function resize() {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }

    let raf = 0;
    let running = false;
    let onScreen = true;
    const clock = new THREE.Clock();

    function frame() {
      const t = clock.getElapsedTime();
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      model.rotation.y = t * 0.12 + pointer.x * 0.22;
      model.rotation.x = -0.06 + pointer.y * 0.16;
      inner.rotation.y = -t * 0.24;
      inner.rotation.z = t * 0.08;
      core.position.y = Math.sin(t * 0.8) * 0.045;
      orbit.rotation.z = t * 0.04;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      clock.start();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function drawOnce() {
      renderer.render(scene, camera);
    }

    resize();
    if (reduceMotion) drawOnce(); else start();

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => resize());
      ro.observe(host);
    } else {
      window.addEventListener('resize', resize);
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        if (onScreen && !document.hidden) start();
        else stop();
      }, { threshold: 0.05 });
      io.observe(host);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    });

    window.__secScene = { scene, camera, renderer, model };
  }
}
