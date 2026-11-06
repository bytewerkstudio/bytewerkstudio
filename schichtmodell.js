/* ============================================================
   BYTEWERK STUDIO — ATELIER (3D)
   ------------------------------------------------------------
   A product as four physical paper layers: surface, logic,
   data, operations. three.js r180, loaded from ./vendor,
   because the site CSP allows same-origin scripts only.

   The HTML layer (buttons, panels, labels) works without
   WebGL and without JavaScript. three.js is imported
   dynamically; if it or WebGL fails, the drawn SVG stage
   stays visible and the tabs keep working.

   No tracking, no network requests beyond the two local
   three.js files.
   ============================================================ */

(function () {
  'use strict';

  const section = document.getElementById('schichtmodell');
  if (!section) return;

  const rows = Array.prototype.slice.call(section.querySelectorAll('[data-schm-row]'));
  const panels = Array.prototype.slice.call(section.querySelectorAll('.schm-panel'));
  const plates = Array.prototype.slice.call(section.querySelectorAll('[data-fallback-layer]'));
  const list = section.querySelector('.schm-list');
  const stage = section.querySelector('.schm-stage');
  const canvas = section.querySelector('#schichtmodell-canvas');
  const fallback = section.querySelector('.schm-fallback');
  const resetBtn = section.querySelector('.schm-reset');

  if (!rows.length || !stage || !canvas) return;

  let active = 0;
  let scene = null;
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- UI layer (works without three.js) ---------- */

  function paint(index) {
    rows.forEach(function (row, i) {
      const on = i === index;
      row.setAttribute('aria-selected', on ? 'true' : 'false');
      row.tabIndex = on ? 0 : -1;
    });

    panels.forEach(function (panel, i) {
      panel.hidden = i !== index;
    });

    plates.forEach(function (plate) {
      const i = Number(plate.getAttribute('data-fallback-layer'));
      plate.classList.toggle('is-active', i === index);
      plate.classList.toggle('is-dim', i !== index);
    });
  }

  function select(index, moveFocus) {
    if (index < 0 || index >= rows.length) return;
    active = index;
    paint(index);
    if (scene) scene.setActive(index);
    if (moveFocus) rows[index].focus();
  }

  function preview(index) {
    rows.forEach(function (row, i) {
      row.classList.toggle('is-hover', i === index && i !== active);
    });
    if (scene) scene.setHover(index);
  }

  rows.forEach(function (row, i) {
    row.addEventListener('click', function () { select(i); });
    row.addEventListener('mouseenter', function () { preview(i); });
    row.addEventListener('mouseleave', function () { preview(-1); });
    row.addEventListener('focus', function () { preview(i); });
    row.addEventListener('blur', function () { preview(-1); });
  });

  if (list) {
    list.addEventListener('keydown', function (event) {
      const key = event.key;
      let next = -1;

      if (key === 'ArrowDown' || key === 'ArrowRight') next = (active + 1) % rows.length;
      else if (key === 'ArrowUp' || key === 'ArrowLeft') next = (active - 1 + rows.length) % rows.length;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = rows.length - 1;

      if (next > -1) {
        event.preventDefault();
        select(next, true);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      select(0);
      if (scene) scene.reset();
    });
  }

  paint(active);

  /* ---------- Language ---------- */

  function lang() {
    return document.documentElement.lang === 'en' ? 'en' : 'de';
  }

  document.addEventListener('bw:lang', function () {
    if (scene) scene.setLang();
  });

  /* ---------- Motion preference ---------- */

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function onMotionChange(event) {
    reduced = event.matches;
    if (scene) scene.setReduced(reduced);
  }

  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

  /* ---------- WebGL check + lazy load ---------- */

  function hasWebGL() {
    try {
      const probe = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
        (probe.getContext('webgl2') || probe.getContext('webgl'))
      );
    } catch (error) {
      return false;
    }
  }

  if (!hasWebGL()) return;

  let loading = null;

  function loadScene() {
    if (loading) return loading;

    loading = import('./vendor/three.module.min.js')
      .then(function (THREE) {
        scene = createScene(THREE);
        scene.setReduced(reduced);
        scene.setLang();
        scene.setActive(active);
        scene.start();
      })
      .catch(function (error) {
        if (window.console) console.warn('[schichtmodell]', error);
      });

    return loading;
  }

  // three.js is ~720 KB. Load it only when the section is close to the viewport.
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        loader.disconnect();
        loadScene();
      }
    }, { rootMargin: '700px 0px' });
    loader.observe(section);
  } else {
    loadScene();
  }

  /* ---------- Scene ---------- */

  function createScene(THREE) {
    const ACCENTS = [0xb04f31, 0x3b3833, 0x4f7a63, 0x9a7834];
    /* Deeper paper tints: the stack has to separate from the ivory stage. */
    const TINTS = [0xfbf3e0, 0xe8d6b4, 0xd4bd95, 0xbfa578];
    const PLATE_W = 3.9;
    const PLATE_D = 2.55;
    const PLATE_T = 0.075;
    const GAP = 0.86;
    const TOTAL_PLATES = 4;

    const stageEl = stage;
    const canvasEl = canvas;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setClearAlpha(0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    const model = new THREE.Group();
    scene3.add(model);

    let baseCamera = new THREE.Vector3(0, 4.4, 8.2);
    let lookAt = new THREE.Vector3(0, 0.05, 0);

    /* ---- lights ---- */

    const hemi = new THREE.HemisphereLight(0xfff8ec, 0xa89880, 0.42);
    scene3.add(hemi);

    const key = new THREE.DirectionalLight(0xfff2de, 2.35);
    key.position.set(4.6, 8.4, 5.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4.6;
    key.shadow.camera.right = 4.6;
    key.shadow.camera.top = 4.6;
    key.shadow.camera.bottom = -4.6;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.025;
    scene3.add(key);

    const rim = new THREE.DirectionalLight(0xdfe9e1, 0.45);
    rim.position.set(-5.2, 3.2, -4.4);
    scene3.add(rim);

    const fill = new THREE.DirectionalLight(0xffe9cf, 0.2);
    fill.position.set(-2.5, 1.8, 6.5);
    scene3.add(fill);

    /* ---- shadow catcher ---- */

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 9),
      new THREE.ShadowMaterial({ color: 0x3a2a1c, opacity: 0.22 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -((TOTAL_PLATES - 1) / 2) * GAP - 0.42;
    shadowPlane.receiveShadow = true;
    scene3.add(shadowPlane);

    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 4.2),
      new THREE.MeshBasicMaterial({
        map: contactTexture(),
        transparent: true,
        opacity: 0.3,
        depthWrite: false
      })
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = -((TOTAL_PLATES - 1) / 2) * GAP - 0.41;
    scene3.add(contact);

    function contactTexture() {
      const size = 256;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
      g.addColorStop(0, 'rgba(74, 52, 34, 0.52)');
      g.addColorStop(0.44, 'rgba(74, 52, 34, 0.24)');
      g.addColorStop(1, 'rgba(74, 52, 34, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    /* ---- paper grain: one shared bump texture ---- */

    function grainTexture() {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 132 + Math.random() * 60;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 3);
      return tex;
    }

    const grain = grainTexture();

    /* ---- geometry helpers ---- */

    function plateGeometry(w, d, t, radius) {
      const x = -w / 2;
      const y = -d / 2;
      const r = Math.min(radius, w / 2, d / 2);

      const shape = new THREE.Shape();
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + d - r);
      shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
      shape.lineTo(x + r, y + d);
      shape.quadraticCurveTo(x, y + d, x, y + d - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: t,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.018,
        bevelThickness: 0.016,
        curveSegments: 8
      });

      geo.rotateX(-Math.PI / 2);
      geo.translate(0, -t / 2, 0);
      geo.computeVertexNormals();
      return geo;
    }

    function makeBox(w, h, d, color, x, y, z) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.86, metalness: 0.0 })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    function indexTexture(index) {
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 256, 256);

      ctx.font = '600 96px "SFMono-Regular", Menlo, monospace';
      ctx.fillStyle = 'rgba(150, 64, 42, 0.92)';
      ctx.fillText(String(index + 1).padStart(2, '0'), 8, 108);

      ctx.fillStyle = 'rgba(31, 30, 29, 0.22)';
      ctx.fillRect(8, 126, 148, 3);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return tex;
    }

    /* ---- layers ---- */

    const layers = [];
    const TOTAL = TOTAL_PLATES;
    const layerTops = [];

    for (let i = 0; i < TOTAL; i++) {
      const group = new THREE.Group();
      const baseY = (i - (TOTAL - 1) / 2) * GAP;
      group.position.y = baseY;
      group.position.x = (i - (TOTAL - 1) / 2) * 0.115;
      group.position.z = (i - (TOTAL - 1) / 2) * 0.055;
      group.rotation.y = (i - (TOTAL - 1) / 2) * -0.022;
      model.add(group);

      const geo = plateGeometry(PLATE_W, PLATE_D, PLATE_T, 0.16);
      const mat = new THREE.MeshStandardMaterial({
        color: TINTS[i],
        roughness: 0.96,
        metalness: 0.0,
        bumpMap: grain,
        bumpScale: 0.01
      });
      const plate = new THREE.Mesh(geo, mat);
      plate.castShadow = true;
      plate.receiveShadow = true;
      plate.userData.layer = i;
      group.add(plate);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 24),
        new THREE.LineBasicMaterial({
          color: 0x4a443a,
          transparent: true,
          opacity: 0.5
        })
      );
      edges.userData.layer = i;
      group.add(edges);

      /* Thin accent tab on the front edge, like a divider label. */
      const tab = makeBox(0.7, 0.02, 0.045, ACCENTS[i], -1.2, PLATE_T / 2 + 0.018, PLATE_D / 2 - 0.075);
      tab.castShadow = false;
      group.add(tab);

      const topY = PLATE_T / 2 + 0.021;
      layerTops.push(topY);

      addContents(group, i, topY);
      layers.push({ group: group, baseY: baseY, targetY: baseY, x: group.position.x, y: baseY });
    }

    /* Etched detail: thin bars and lines that read as technical drafting,
       not as plastic blocks. Everything stays inside the plate bounds. */
    function etch(group, w, d, x, z, y, color, opacity) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, d),
        new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: opacity,
          depthWrite: false
        })
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y, z);
      mesh.renderOrder = 1;
      group.add(mesh);
      return mesh;
    }

    function addContents(group, index, topY) {
      const y = topY + 0.002;

      if (index === 0) {
        /* Surface: three wireframe panels, a title bar and a primary button. */
        etch(group, 1.28, 0.82, -0.66, -0.14, y, 0xffffff, 0.8);
        etch(group, 0.88, 0.52, 0.9, -0.36, y, 0xffffff, 0.56);
        etch(group, 0.68, 0.42, 0.76, 0.48, y, 0xffffff, 0.4);

        etch(group, 0.52, 0.045, -0.9, -0.48, y + 0.001, 0x3b3833, 0.7);
        etch(group, 0.34, 0.028, -0.99, -0.3, y + 0.001, 0x6b665c, 0.42);
        etch(group, 0.42, 0.028, -0.95, -0.18, y + 0.001, 0x6b665c, 0.28);

        etch(group, 0.38, 0.11, -0.85, 0.18, y + 0.002, 0xb04f31, 0.9);
        etch(group, 0.16, 0.028, -0.96, 0.18, y + 0.003, 0xffffff, 0.75);
        return;
      }

      if (index === 1) {
        /* Logic: a small graph of nodes with straight links. */
        const nodes = [
          [-0.92, 0.42],
          [-0.34, -0.3],
          [0.42, 0.36],
          [0.94, -0.28],
          [0.16, 0.74]
        ];
        const links = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 2], [1, 4]];

        const positions = [];
        links.forEach(function (pair) {
          const a = nodes[pair[0]];
          const b = nodes[pair[1]];
          positions.push(a[0], y, a[1], b[0], y, b[1]);
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const graph = new THREE.LineSegments(
          geometry,
          new THREE.LineBasicMaterial({ color: 0x3b3833, transparent: true, opacity: 0.55 })
        );
        graph.renderOrder = 1;
        graph.userData.layer = index;
        group.add(graph);

        nodes.forEach(function (n, nIndex) {
          const node = new THREE.Mesh(
            new THREE.CircleGeometry(nIndex === 0 ? 0.082 : 0.058, 24),
            new THREE.MeshBasicMaterial({
              color: nIndex === 0 ? 0xb04f31 : 0x3b3833,
              transparent: true,
              opacity: nIndex === 0 ? 0.95 : 0.7,
              depthWrite: false
            })
          );
          node.rotation.x = -Math.PI / 2;
          node.position.set(n[0], y + 0.002, n[1]);
          node.renderOrder = 2;
          node.userData.layer = index;
          group.add(node);
        });

        etch(group, 0.5, 0.035, -1.02, 0.72, y, 0x6b665c, 0.4);
        etch(group, 0.3, 0.035, 0.98, 0.7, y, 0x6b665c, 0.28);
        return;
      }

      if (index === 2) {
        /* Data: three rings (records) and a table of rows. */
        for (let d = 0; d < 3; d++) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.132, 40),
            new THREE.MeshBasicMaterial({
              color: 0x4f7a63,
              transparent: true,
              opacity: 0.78 - d * 0.16,
              side: THREE.DoubleSide,
              depthWrite: false
            })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(-0.95 + d * 0.29, y + 0.002, 0.48);
          ring.renderOrder = 2;
          ring.userData.layer = index;
          group.add(ring);
        }

        for (let r = 0; r < 5; r++) {
          const width = 1.0 - r * 0.09;
          etch(group, width, 0.085, 0.42, -0.62 + r * 0.16, y, r === 0 ? 0x4f7a63 : 0x6b665c, r === 0 ? 0.55 : 0.22);
        }
        return;
      }

      /* Operations: a rack outline, three slots and a status dot. */
      etch(group, 0.82, 0.56, 0.62, 0.1, y, 0x3b3833, 0.5);
      etch(group, 0.66, 0.4, 0.62, 0.1, y + 0.001, 0xf6efe0, 0.9);

      for (let sIdx = 0; sIdx < 3; sIdx++) {
        etch(group, 0.54, 0.035, 0.62, -0.02 + sIdx * 0.1, y + 0.002, 0x6b665c, 0.45);
      }

      const led = new THREE.Mesh(
        new THREE.CircleGeometry(0.048, 20),
        new THREE.MeshBasicMaterial({ color: 0xb04f31, transparent: true, opacity: 0.95, depthWrite: false })
      );
      led.rotation.x = -Math.PI / 2;
      led.position.set(0.34, y + 0.003, 0.32);
      led.renderOrder = 3;
      led.userData.layer = index;
      group.add(led);

      etch(group, 1.5, 0.03, -0.55, -0.62, y, 0x6b665c, 0.4);
      etch(group, 1.1, 0.03, -0.7, 0.72, y, 0x6b665c, 0.28);
    }

    /* ---- stamped index on each layer ---- */

    const indexStamps = [];

    for (let i = 0; i < TOTAL; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: indexTexture(i),
        transparent: true,
        depthWrite: false,
        toneMapped: false
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), material);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(-1.28, PLATE_T / 2 + 0.028, 0.68);
      plane.renderOrder = 2;
      layers[i].group.add(plane);
      indexStamps.push(plane);
    }

    // Every mesh of a layer resolves to that layer on hover/click.
    layers.forEach(function (layer, i) {
      layer.group.traverse(function (object) {
        object.userData.layer = i;
      });
    });

    function setLang() {
      /* All copy lives in the HTML layer, so DE/EN needs no redraw. */
    }

    /* ---- state ---- */

    let activeIndex = 0;
    let hoverIndex = -1;
    let reducedMotion = false;
    let visible = false;
    let running = false;
    let rafId = 0;
    let lastTime = 0;
    let elapsed = 0;

    let yaw = -0.62;
    let targetYaw = -0.62;
    let tilt = 0.015;
    let targetTilt = 0.015;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let lastInteraction = 0;

    let dragging = false;
    let dragMoved = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let activePointer = null;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    /* ---- layout ---- */

    function fit() {
      const width = stageEl.clientWidth;
      const height = stageEl.clientHeight;
      if (!width || !height) return;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.fov = width < 560 ? 38 : 30;
      camera.updateProjectionMatrix();

      const box = new THREE.Box3().setFromObject(model);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      lookAt = sphere.center.clone();
      lookAt.y = sphere.center.y - 0.1;

      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const distance = Math.max(
        sphere.radius / Math.sin(vFov / 2),
        sphere.radius / Math.sin(hFov / 2)
      ) * 1.08;

      const dir = new THREE.Vector3(0, 0.52, 1).normalize();
      baseCamera = lookAt.clone().add(dir.multiplyScalar(distance));
      camera.position.copy(baseCamera);
      camera.lookAt(lookAt);
      renderOnce();
    }

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(function () { fit(); });
      ro.observe(stageEl);
    } else {
      window.addEventListener('resize', fit);
    }

    /* ---- pointer ---- */

    function updateNdc(event) {
      const rect = canvasEl.getBoundingClientRect();
      ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function pick() {
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(model.children, true);
      for (let i = 0; i < hits.length; i++) {
        const index = hits[i].object.userData.layer;
        if (typeof index === 'number') return index;
      }
      return -1;
    }

    canvasEl.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      activePointer = event.pointerId;
      dragging = true;
      dragMoved = 0;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastInteraction = performance.now();
      canvasEl.classList.add('is-dragging');
      try { canvasEl.setPointerCapture(event.pointerId); } catch (error) { /* noop */ }
    });

    canvasEl.addEventListener('pointermove', function (event) {
      updateNdc(event);

      if (dragging && activePointer === event.pointerId) {
        const dx = event.clientX - lastPointerX;
        const dy = event.clientY - lastPointerY;
        dragMoved += Math.abs(dx) + Math.abs(dy);
        targetYaw += dx * 0.0062;
        targetTilt = THREE.MathUtils.clamp(targetTilt + dy * 0.0032, -0.16, 0.22);
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        lastInteraction = performance.now();
        wake();
        return;
      }

      // Parallax only for fine pointers.
      if (event.pointerType === 'mouse') {
        const rect = canvasEl.getBoundingClientRect();
        pointerTargetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerTargetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        wake();
      }

      const hit = pick();
      canvasEl.classList.toggle('is-over', hit > -1);
      setHover(hit);
    });

    function endDrag(event) {
      if (activePointer !== null && event.pointerId !== activePointer) return;
      const wasDragging = dragMoved;
      dragging = false;
      activePointer = null;
      canvasEl.classList.remove('is-dragging');
      try { canvasEl.releasePointerCapture(event.pointerId); } catch (error) { /* noop */ }

      if (wasDragging < 8) {
        updateNdc(event);
        const hit = pick();
        if (hit > -1) {
          activeIndex = hit;
          if (typeof window !== 'undefined') {
            // Mirror the click into the HTML tabs.
            const row = rows[hit];
            if (row) row.click();
          }
        }
      }
      lastInteraction = performance.now();
      wake();
    }

    canvasEl.addEventListener('pointerup', endDrag);
    canvasEl.addEventListener('pointercancel', function (event) {
      dragging = false;
      activePointer = null;
      canvasEl.classList.remove('is-dragging');
      try { canvasEl.releasePointerCapture(event.pointerId); } catch (error) { /* noop */ }
      wake();
    });

    canvasEl.addEventListener('pointerleave', function () {
      if (!dragging) {
        canvasEl.classList.remove('is-over');
        setHover(-1);
        pointerTargetX = 0;
        pointerTargetY = 0;
      }
    });

    /* ---- loop ---- */

    function settled() {
      const layersSettled = layers.every(function (layer) {
        return Math.abs(layer.group.position.y - layer.targetY) < 0.002;
      });
      return layersSettled &&
        Math.abs(yaw - targetYaw) < 0.002 &&
        Math.abs(tilt - targetTilt) < 0.002 &&
        Math.abs(pointerX - pointerTargetX) < 0.004 &&
        Math.abs(pointerY - pointerTargetY) < 0.004;
    }

    function renderOnce() {
      renderer.render(scene3, camera);
    }

    function tick(now) {
      rafId = 0;
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.05);
      lastTime = now;
      elapsed += dt;

      update(dt);
      renderOnce();

      if (!running) return;

      if (reducedMotion) {
        if (settled()) {
          running = false;
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function update(dt) {
      const idleFor = performance.now() - lastInteraction;

      if (!reducedMotion && !dragging && idleFor > 3200) {
        targetYaw += dt * 0.06;
      }

      const ease = 1 - Math.pow(0.001, dt);
      yaw += (targetYaw - yaw) * ease;
      tilt += (targetTilt - tilt) * ease;
      pointerX += (pointerTargetX - pointerX) * ease * 0.7;
      pointerY += (pointerTargetY - pointerY) * ease * 0.7;

      model.rotation.y = yaw;
      model.rotation.x = tilt;

      camera.position.set(
        baseCamera.x + pointerX * 0.24,
        baseCamera.y - pointerY * 0.12,
        baseCamera.z + Math.abs(pointerX) * 0.04
      );
      camera.lookAt(lookAt);

      layers.forEach(function (layer, i) {
        let target = layer.baseY;
        if (i === activeIndex) target += 0.36;
        else if (i === hoverIndex) target += 0.14;
        else if (hoverIndex > -1) target -= 0.04;

        if (!reducedMotion) {
          target += Math.sin(elapsed * 0.55 + i * 1.4) * 0.006;
        }

        layer.targetY = target;
        layer.group.position.y += (target - layer.group.position.y) * Math.min(1, dt * 9);
      });
    }

    function wake() {
      if (!visible) return;
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    /* ---- visibility ---- */

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) wake();
        else stop();
      }, { threshold: 0.03 });
      io.observe(stageEl);
    } else {
      visible = true;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible) wake();
    });

    window.addEventListener('pagehide', function () {
      stop();
      renderer.dispose();
    });

    /* ---- public API ---- */

    function setActive(index) {
      activeIndex = index;
      lastInteraction = performance.now();
      wake();
    }

    function setHover(index) {
      hoverIndex = index;
      canvasEl.classList.toggle('is-over', index > -1);
      wake();
    }

    function reset() {
      targetYaw = -0.62;
      targetTilt = 0.015;
      pointerTargetX = 0;
      pointerTargetY = 0;
      lastInteraction = performance.now();
      wake();
    }

    function setReduced(value) {
      reducedMotion = value;
      lastInteraction = performance.now();
      wake();
    }

    function start() {
      fit();
      // Reveal the canvas only after the first successful frame.
      requestAnimationFrame(function () {
        renderOnce();
        canvasEl.classList.add('is-live');
        if (fallback) {
          fallback.classList.add('is-out');
          window.setTimeout(function () { fallback.hidden = true; }, 520);
        }
        visible = true;
        lastInteraction = performance.now();
        wake();
      });
    }

    // Fit once now (the stage may already be laid out).
    fit();

    return {
      start: start,
      setActive: setActive,
      setHover: setHover,
      reset: reset,
      setReduced: setReduced,
      setLang: setLang
    };
  }
})();
