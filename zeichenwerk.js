/* ============================================================
   BYTEWERK STUDIO — zeichenwerk.js
   ------------------------------------------------------------
   A small 3D letterpress: every wordmark is set from rounded
   paper tiles on a 5 x 7 grid, extruded, lit like a studio
   table. No build step, no network, no font files — the
   alphabet below is drawn as pixels so the scene always works
   offline and inside the strict Content-Security-Policy
   (script-src 'self').

   Instance contract
   <div data-zeichenwerk data-mode="band|page" data-word="BYTEWERK"
        data-material="terrakotta" data-depth="0.62">

   Behaviour
   - Drag / arrow keys rotate, double click resets the angle.
   - Typing re-sets the word: tiles drop in one after another.
   - prefers-reduced-motion: still image, no drift, no drop-in.
   - No WebGL, no JS or a failing import: a real text wordmark
     stays visible (.zw-static), the canvas is hidden.
   - Pauses outside the viewport and in a hidden tab.
   ============================================================ */

const STORE_KEY = 'bw-zeichenwerk';
const MAX_CHARS = 16;
const PITCH = 1;
const TILE = 0.925;
const ROWS = 7;
const CAPACITY = MAX_CHARS * 5 * ROWS;

/* ---------- 5 x 7 alphabet ---------- */
const GLYPHS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10011', '10101', '10101', '10101', '11001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
};

/* ---------- materials ---------- */
const PRESETS = {
  terrakotta: { base: '#b04f31', light: '#c4734f', deep: '#8e3f27', de: 'Terrakotta', en: 'Terracotta' },
  tusche: { base: '#27231f', light: '#3d372f', deep: '#171410', de: 'Tusche', en: 'Ink' },
  salbei: { base: '#4f7a63', light: '#668e78', deep: '#3d6350', de: 'Salbei', en: 'Sage' }
};

const VIEWS = {
  front: { yaw: 0, pitch: 0 },
  angle: { yaw: -0.34, pitch: -0.13 },
  top: { yaw: -0.2, pitch: 0.44 }
};

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const SMALL = window.matchMedia('(max-width: 720px)');
const reduced = () => REDUCED.matches;

const lang = () => ((document.documentElement.lang || 'de').toLowerCase().startsWith('en') ? 'en' : 'de');
const t = (de, en) => (lang() === 'en' ? en : de);

/* ---------- helpers ---------- */
function normalize(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/[^A-Z0-9 .&!?-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, MAX_CHARS);
}

/* Deterministic 0..1 from two integers, so the hand-set look is
   stable between renders and does not flicker while typing. */
function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function writeStore(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch (_) {
    return false;
  }
}

function slug(value) {
  return normalize(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'wortmarke';
}

/* ------------------------------------------------------------
   One letterpress stage
   ------------------------------------------------------------ */
function createStage(THREE, host) {
  const canvas = host.querySelector('canvas');
  const staticWord = host.querySelector('.zw-static');
  if (!canvas) return null;

  const mode = host.dataset.mode === 'band' ? 'band' : 'page';
  const interactive = host.dataset.interactive !== 'false';

  const state = {
    text: normalize(host.dataset.word) || 'BYTEWERK',
    material: PRESETS[host.dataset.material] ? host.dataset.material : 'terrakotta',
    depth: Number(host.dataset.depth) || 0.62,
    cols: 0,
    tiles: [],
    yaw: VIEWS.angle.yaw,
    pitch: VIEWS.angle.pitch,
    targetYaw: VIEWS.angle.yaw,
    targetPitch: VIEWS.angle.pitch
  };

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  /* No tone mapping on purpose: the plates should keep the exact
     paper/terracotta values of the brand palette instead of being
     rolled off into pastel by a film curve. */
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 200);

  /* Slow ambient drift sits on its own group so the user's angle
     stays untouched while the scene breathes. */
  const root = new THREE.Group();
  const word = new THREE.Group();
  root.add(word);
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xfffbf2, 0xd8cbb2, 1.16));

  const key = new THREE.DirectionalLight(0xfff4e4, 1.5);
  key.position.set(-6, 9, 11);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffe9d2, 0.43);
  fill.position.set(8, 4, 9);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xd9e7dd, 0.27);
  rim.position.set(4, 8, -9);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xfff8ec, 0.16));

  /* Rounded square, extruded along +Z, centred around the origin. */
  const shape = new THREE.Shape();
  (function rounded(r) {
    const a = -0.5;
    const b = 0.5;
    shape.moveTo(a + r, a);
    shape.lineTo(b - r, a);
    shape.quadraticCurveTo(b, a, b, a + r);
    shape.lineTo(b, b - r);
    shape.quadraticCurveTo(b, b, b - r, b);
    shape.lineTo(a + r, b);
    shape.quadraticCurveTo(a, b, a, b - r);
    shape.lineTo(a, a + r);
    shape.quadraticCurveTo(a, a, a + r, a);
  })(0.11);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1,
    bevelEnabled: true,
    bevelSize: 0.028,
    bevelThickness: 0.028,
    bevelSegments: 2,
    curveSegments: 3
  });
  geometry.translate(0, 0, -0.5);

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.86,
    metalness: 0.02
  });

  const mesh = new THREE.InstancedMesh(geometry, material, CAPACITY);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  word.add(mesh);

  /* Faked contact shadow: a radial gradient sprite behind the
     plates. Cheaper than a shadow map and always soft. */
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const shadowCtx = shadowCanvas.getContext('2d');
  if (shadowCtx) {
    const grad = shadowCtx.createRadialGradient(128, 128, 6, 128, 128, 122);
    grad.addColorStop(0, 'rgba(84, 58, 40, 0.30)');
    grad.addColorStop(0.48, 'rgba(84, 58, 40, 0.13)');
    grad.addColorStop(1, 'rgba(84, 58, 40, 0)');
    shadowCtx.fillStyle = grad;
    shadowCtx.fillRect(0, 0, 256, 256);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
  );
  shadow.position.set(0, -0.8, -1.5);
  word.add(shadow);

  /* The print block the type sits on. A thin paper plate, slightly
     larger than the wordmark, with its own darker edge — the same
     way a letterpress sits on a wooden block. It travels with the
     word, so the angle always reads as a physical object. */
  const blockShape = new THREE.Shape();
  (function block(r) {
    const a = -0.5;
    const b = 0.5;
    blockShape.moveTo(a + r, a);
    blockShape.lineTo(b - r, a);
    blockShape.quadraticCurveTo(b, a, b, a + r);
    blockShape.lineTo(b, b - r);
    blockShape.quadraticCurveTo(b, b, b - r, b);
    blockShape.lineTo(a + r, b);
    blockShape.quadraticCurveTo(a, b, a, b - r);
    blockShape.lineTo(a, a + r);
    blockShape.quadraticCurveTo(a, a, a + r, a);
  })(0.075);

  const blockGeometry = new THREE.ExtrudeGeometry(blockShape, {
    depth: 1,
    bevelEnabled: true,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    bevelSegments: 1,
    curveSegments: 2
  });
  blockGeometry.translate(0, 0, -0.5);

  const block = new THREE.Mesh(
    blockGeometry,
    new THREE.MeshStandardMaterial({ color: 0xe9ddc6, roughness: 0.97, metalness: 0 })
  );
  block.position.set(0, 0, -1.15);
  word.add(block);

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const color = new THREE.Color();

  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  let started = 0;
  let drag = null;

  /* ---------- layout ---------- */
  /* A composing stick wraps at word boundaries: a wordmark that is
     too wide for the frame is set on two or three lines instead of
     shrinking into unreadable tiles. */
  function wrap(text) {
    const maxChars = SMALL.matches ? 8 : 11;
    const words = text.split(' ').filter(Boolean);
    const lines = [];
    let current = '';

    const pushHard = (word) => {
      let rest = word;
      while (rest.length > maxChars) {
        lines.push(rest.slice(0, maxChars));
        rest = rest.slice(maxChars);
      }
      current = rest;
    };

    words.forEach((word) => {
      if (!current) {
        if (word.length > maxChars) pushHard(word);
        else current = word;
        return;
      }
      if ((current + ' ' + word).length <= maxChars) {
        current += ' ' + word;
        return;
      }
      lines.push(current);
      if (word.length > maxChars) pushHard(word);
      else current = word;
    });

    if (current) lines.push(current);
    return lines.length ? lines.slice(0, 4) : ['BYTEWERK'];
  }

  function build() {
    const lines = wrap(state.text);
    const LINE_GAP = 1.7;
    const lineCols = lines.map((line) => Math.max(1, line.length * 6 - 1));
    const cols = Math.max.apply(null, lineCols);
    const totalRows = lines.length * ROWS + (lines.length - 1) * LINE_GAP;
    const offsetX = (cols - 1) / 2;
    const offsetY = (totalRows - 1) / 2;
    const preset = PRESETS[state.material];
    const shades = [preset.base, preset.light, preset.deep].map((hex) => new THREE.Color(hex));

    state.cols = cols;
    state.rows = totalRows;
    state.lines = lines.length;
    state.tiles = [];

    const wordWidth = cols * PITCH - (PITCH - TILE);
    shadow.scale.set(wordWidth + 4.2, totalRows * PITCH + 3.0, 1);
    shadow.position.y = -0.62;

    let index = 0;
    lines.forEach((line, lineIndex) => {
      const glyphs = Array.from(line);
      const lineOffsetX = (cols - lineCols[lineIndex]) / 2;
      const top = lineIndex * (ROWS + LINE_GAP);

      for (let i = 0; i < glyphs.length; i++) {
        const rows = GLYPHS[glyphs[i]];
        if (!rows) continue;

        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < 5; x++) {
            if (rows[y][x] !== '1') continue;

            const h = hash(lineIndex * 97 + i * 5 + x, y);
            let shade = shades[0];
            if (h > 0.9) shade = shades[1];
            else if (h < 0.08) shade = shades[2];

            state.tiles.push({
              x: (i * 6 + x + lineOffsetX - offsetX) * PITCH,
              y: (offsetY - (top + y)) * PITCH,
              z: (h - 0.5) * 0.035,
              size: TILE,
              depth: state.depth * (0.94 + h * 0.12),
              tilt: (h - 0.5) * 0.012,
              delay: (lineIndex * 220) + (i * 6 + x) * 8 + y * 4,
              shade: shade,
              index: index++
            });
          }
        }
      }
    });

    mesh.count = state.tiles.length;
    for (let i = 0; i < state.tiles.length; i++) {
      mesh.setColorAt(i, state.tiles[i].shade);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;

    started = performance.now();
    applyTiles(reduced() ? 1 : 0);
    updateStaticWord();
    frameWord();
    if (reduced()) renderStill();
  }

  function applyTiles(progress) {
    for (let i = 0; i < state.tiles.length; i++) {
      const tile = state.tiles[i];
      let grow = 1;

      if (progress < 1) {
        const span = 300;
        const local = Math.min(1, Math.max(0, (progress * 1000 - tile.delay) / span));
        grow = local <= 0 ? 0.001 : 0.001 + 0.999 * easeOutBack(local);
      }

      euler.set(0, 0, tile.tilt);
      quaternion.setFromEuler(euler);
      position.set(tile.x, tile.y, tile.z + (1 - grow) * 1.6);
      scale.set(tile.size * grow, tile.size * grow, tile.depth * grow);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  function layoutProgress(now) {
    const elapsed = now - started;
    const last = state.tiles.length ? state.tiles[state.tiles.length - 1].delay : 0;
    const total = last + 300 + 120;
    if (elapsed >= total) {
      applyTiles(1);
      return false;
    }
    applyTiles(Math.min(1, elapsed / 1000));
    return true;
  }

  function easeOutBack(value) {
    const c = 1.5;
    const p = value - 1;
    return 1 + (c + 1) * p * p * p + c * p * p;
  }

  /* ---------- camera ---------- */
  function frameWord() {
    const width = Math.max(2, state.cols * PITCH + 1.5);
    const height = Math.max(2, (state.rows || ROWS) * PITCH + 1.7);
    const ratio = Math.max(0.35, host.clientWidth / Math.max(1, host.clientHeight));
    const fov = (camera.fov * Math.PI) / 180;
    const margin = 1.04;

    const distV = (height * margin) / 2 / Math.tan(fov / 2);
    const distH = (width * margin) / 2 / (Math.tan(fov / 2) * ratio);

    const distance = Math.max(distV, distH) + 2.6;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);

    /* The print block fills the frame, the type sits inside it.
       This keeps the stage a calm, filled composition instead of a
       word floating in empty space — and it works for one letter
       as well as for two lines. */
    const blockDepth = distance + 1.15;
    const visibleH = 2 * blockDepth * Math.tan(fov / 2);
    const visibleW = visibleH * ratio;
    const blockW = visibleW * 0.93;
    const blockH = visibleH * 0.93;

    block.scale.set(blockW, blockH, 0.34);
    shadow.scale.set(blockW * 1.08, blockH * 1.16, 1);
    shadow.position.y = -blockH * 0.06;
  }

  /* ---------- resize ---------- */
  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, SMALL.matches ? 1.5 : 2);

    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    frameWord();
  }

  /* ---------- text ---------- */
  function updateStaticWord() {
    if (staticWord) staticWord.textContent = state.text;
  }

  function setText(raw, source) {
    const next = normalize(raw) || 'BYTEWERK';
    if (next === state.text && source !== 'init') return;
    state.text = next;
    build();
    syncInputs(source);
    updateAria();
    paintSpec();
    persist();
    announce();
  }

  function setMaterial(name) {
    if (!PRESETS[name] || name === state.material) return;
    state.material = name;
    build();
    syncControls();
    persist();
    announce();
  }

  function setDepth(value) {
    const depth = Math.min(1.3, Math.max(0.22, Number(value) || 0.62));
    if (Math.abs(depth - state.depth) < 0.001) return;
    state.depth = depth;
    build();
    syncControls();
    persist();
  }

  function setView(name, immediate) {
    const view = VIEWS[name] || VIEWS.angle;
    state.targetYaw = view.yaw;
    state.targetPitch = view.pitch;
    if (immediate || reduced()) {
      state.yaw = view.yaw;
      state.pitch = view.pitch;
    }
  }

  function reset() {
    state.text = 'BYTEWERK';
    state.material = 'terrakotta';
    state.depth = 0.62;
    build();
    syncInputs();
    syncControls();
    setView('angle', true);
    persist();
    announce();
  }

  /* ---------- accessibility ---------- */
  function updateAria() {
    const preset = PRESETS[state.material];
    canvas.setAttribute(
      'aria-label',
      t(
        '3D-Schriftzug „' + state.text + '“ aus Papierplatten in ' + preset.de + '. Ziehen oder Pfeiltasten zum Drehen.',
        '3D wordmark “' + state.text + '” built from paper tiles in ' + preset.en + '. Drag or use the arrow keys to rotate.'
      )
    );
  }

  function announce() {
    const live = document.querySelector('[data-zw-live]');
    if (!live) return;
    const preset = PRESETS[state.material];
    live.textContent = t(
      'Wortmarke „' + state.text + '“ in ' + preset.de,
      'Wordmark “' + state.text + '” in ' + preset.en
    );
  }

  /* ---------- persistence ---------- */
  function persist() {
    writeStore({ text: state.text, material: state.material, depth: state.depth });
    if (mode === 'page' && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('t', state.text);
      url.searchParams.set('m', state.material);
      url.searchParams.set('d', state.depth.toFixed(2));
      window.history.replaceState(null, '', url.toString());
    }
  }

  function syncInputs(source) {
    document.querySelectorAll('[data-zw-input]').forEach((input) => {
      if (source !== 'input' || input.value !== state.text) {
        if (input.value !== state.text) input.value = state.text;
      }
    });
  }

  function syncControls() {
    document.querySelectorAll('[data-zw-preset]').forEach((button) => {
      const active = button.dataset.zwPreset === state.material;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    document.querySelectorAll('[data-zw-depth]').forEach((input) => {
      if (input.value !== String(state.depth)) input.value = String(state.depth);
    });
    paintSpec();
  }

  function paintSpec() {
    const preset = PRESETS[state.material];
    document.querySelectorAll('[data-zw-spec-chars]').forEach((el) => {
      el.textContent = state.text.trim().length + ' ' + t('Zeichen', 'chars');
    });
    document.querySelectorAll('[data-zw-spec-material]').forEach((el) => {
      el.textContent = preset ? preset[lang()] : '';
    });
    document.querySelectorAll('[data-zw-spec-depth]').forEach((el) => {
      el.textContent = t('Tiefe ', 'depth ') + state.depth.toFixed(2).replace('.', ',');
    });
  }

  /* ---------- export ---------- */
  function exportPng() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    const before = renderer.getPixelRatio();

    renderer.setPixelRatio(Math.min(3, Math.max(2, (window.devicePixelRatio || 1) * 1.5)));
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);

    let url = '';
    try {
      url = canvas.toDataURL('image/png');
    } catch (_) {
      url = '';
    }

    renderer.setPixelRatio(before);
    renderer.setSize(width, height, false);

    if (!url || url.length < 64) return false;

    const link = document.createElement('a');
    link.href = url;
    link.download = 'zeichenwerk-' + slug(state.text) + '.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  function shareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('t', state.text);
    url.searchParams.set('m', state.material);
    url.searchParams.set('d', state.depth.toFixed(2));
    return url.toString();
  }

  /* ---------- motion ---------- */
  function loop(now) {
    raf = window.requestAnimationFrame(loop);

    if (!visible || document.hidden) return;
    if (now - lastFrame < 1000 / 42) return;

    const dt = Math.min(64, now - lastFrame);
    lastFrame = now;

    layoutProgress(now);

    if (!reduced()) {
      root.rotation.y = Math.sin(now * 0.00022) * 0.055;
      root.rotation.x = Math.cos(now * 0.00017) * 0.018;
    }

    const ease = 1 - Math.pow(0.001, dt / 1000);
    state.yaw += (state.targetYaw - state.yaw) * ease;
    state.pitch += (state.targetPitch - state.pitch) * ease;
    word.rotation.y = state.yaw;
    word.rotation.x = state.pitch;

    renderer.render(scene, camera);
  }

  function start() {
    if (raf || reduced()) return;
    lastFrame = 0;
    raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (!raf) return;
    window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function renderStill() {
    word.rotation.y = state.yaw;
    word.rotation.x = state.pitch;
    root.rotation.set(0, 0, 0);
    applyTiles(1);
    renderer.render(scene, camera);
  }

  function syncMotion() {
    if (reduced()) {
      stop();
      renderStill();
    } else if (visible && !document.hidden) {
      start();
    } else {
      stop();
    }
  }

  /* ---------- input ---------- */
  if (interactive) {
    canvas.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: state.targetYaw, pitch: state.targetPitch };
      canvas.setPointerCapture && canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-dragging');
      host.classList.add('is-touched');
    });

    canvas.addEventListener('pointermove', (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      state.targetYaw = clamp(drag.yaw + (event.clientX - drag.x) * 0.006, -1.1, 1.1);
      state.targetPitch = clamp(drag.pitch + (event.clientY - drag.y) * 0.005, -0.62, 0.62);
        if (reduced()) {
        state.yaw = state.targetYaw;
        state.pitch = state.targetPitch;
        renderStill();
      }
    });

    const endDrag = (event) => {
      if (!drag || (event && drag.id !== event.pointerId)) return;
      drag = null;
      canvas.classList.remove('is-dragging');
    };

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('lostpointercapture', endDrag);

    canvas.addEventListener('dblclick', () => {
      setView('angle', false);
      });

    canvas.addEventListener('keydown', (event) => {
      const step = 0.1;
      let used = true;
      if (event.key === 'ArrowLeft') state.targetYaw = clamp(state.targetYaw - step, -1.1, 1.1);
      else if (event.key === 'ArrowRight') state.targetYaw = clamp(state.targetYaw + step, -1.1, 1.1);
      else if (event.key === 'ArrowUp') state.targetPitch = clamp(state.targetPitch + step, -0.62, 0.62);
      else if (event.key === 'ArrowDown') state.targetPitch = clamp(state.targetPitch - step, -0.62, 0.62);
      else if (event.key === 'Home') {
        state.targetYaw = VIEWS.angle.yaw;
        state.targetPitch = VIEWS.angle.pitch;
      } else used = false;

      if (used) {
        event.preventDefault();
        if (reduced()) {
          state.yaw = state.targetYaw;
          state.pitch = state.targetPitch;
          renderStill();
        }
          }
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ---------- boot ---------- */
  new ResizeObserver(() => {
    resize();
    if (reduced()) renderStill();
  }).observe(host);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) {
                    syncMotion();
          } else {
            stop();
          }
        });
      },
      { rootMargin: '240px 0px', threshold: 0 }
    ).observe(host);
  }

  document.addEventListener('visibilitychange', syncMotion);
  if (typeof REDUCED.addEventListener === 'function') {
    REDUCED.addEventListener('change', () => {
      if (reduced()) {
        applyTiles(1);
        renderStill();
      }
      syncMotion();
    });
  }

  updateAria();
  resize();
  build();
  host.classList.add('is-live');
  syncControls();
  syncMotion();
  if (reduced()) renderStill();

  return {
    setText: setText,
    setMaterial: setMaterial,
    setDepth: setDepth,
    setView: setView,
    reset: reset,
    exportPng: exportPng,
    shareUrl: shareUrl,
    refreshLabels: () => {
      updateAria();
      announce();
    },
    state: state,
    reduce: reduced,
    syncInputs: syncInputs
  };
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
(function () {
  const hosts = Array.from(document.querySelectorAll('[data-zeichenwerk]'));
  if (!hosts.length) return;

  const markFallback = () => {
    hosts.forEach((host) => {
      host.classList.remove('is-live');
      host.classList.add('is-fallback');
    });
    document.documentElement.classList.add('zw-no-webgl');

    /* Without WebGL the tool keeps the part that still works:
       the word and the material colour, set as plain type. */
    const staticWords = Array.from(document.querySelectorAll('.zw-static'));

    const paintWord = () => {
      const input = document.querySelector('[data-zw-input]');
      const value = normalize(input ? input.value : staticWords[0] && staticWords[0].textContent) || 'BYTEWERK';
      staticWords.forEach((el) => { el.textContent = value; });
      document.querySelectorAll('[data-zw-spec-chars]').forEach((el) => {
        el.textContent = value.length + ' ' + t('Zeichen', 'chars');
      });
    };

    const paintMaterial = () => {
      const active = document.querySelector('[data-zw-preset][aria-pressed="true"]');
      const preset = PRESETS[active && active.dataset.zwPreset] || PRESETS.terrakotta;
      staticWords.forEach((el) => { el.style.color = preset.base; });
      document.querySelectorAll('[data-zw-spec-material]').forEach((el) => {
        el.textContent = preset[lang()];
      });
    };

    document.querySelectorAll('[data-zw-input]').forEach((input) => {
      input.addEventListener('input', () => {
        const clean = normalize(input.value);
        if (input.value !== clean) input.value = clean;
        paintWord();
      });
    });

    document.querySelectorAll('[data-zw-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-zw-preset]').forEach((other) => {
          other.setAttribute('aria-pressed', String(other === button));
          other.classList.toggle('is-active', other === button);
        });
        paintMaterial();
      });
    });

    document.querySelectorAll('[data-zw-reset]').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-zw-input]').forEach((input) => { input.value = 'BYTEWERK'; });
        document.querySelectorAll('[data-zw-preset]').forEach((other) => {
          const active = other.dataset.zwPreset === 'terrakotta';
          other.setAttribute('aria-pressed', String(active));
          other.classList.toggle('is-active', active);
        });
        document.querySelectorAll('[data-zw-depth]').forEach((input) => { input.value = '0.62'; });
        paintDepth();
        paintWord();
        paintMaterial();
      });
    });

    const depthFallback = document.querySelector('[data-zw-depth]');
    const depthOutFallback = document.getElementById('zw-depth-out');

    function paintDepth() {
      if (!depthOutFallback) return;
      const value = Number(depthFallback && depthFallback.value) || 0.62;
      depthOutFallback.textContent = value.toFixed(2).replace('.', ',');
      document.querySelectorAll('[data-zw-spec-depth]').forEach((el) => {
        el.textContent = t('Tiefe ', 'depth ') + value.toFixed(2).replace('.', ',');
      });
    }

    if (depthFallback) depthFallback.addEventListener('input', paintDepth);

    paintWord();
    paintMaterial();
    paintDepth();
  };

  const boot = async () => {
    if (!webglAvailable()) {
      markFallback();
      return;
    }

    let THREE;
    try {
      THREE = await import('./vendor/three.module.min.js');
    } catch (_) {
      markFallback();
      return;
    }

    const stage = createStage(THREE, hosts[0]);
    if (!stage) {
      markFallback();
      return;
    }

    /* Stored settings first, then the URL wins (shareable setups). */
    const stored = readStore();
    const params = new URLSearchParams(window.location.search);

    const startText = normalize(params.get('t') || stored.text || document.querySelector('[data-zw-input]')?.value || hosts[0].dataset.word);
    const startMaterial = PRESETS[params.get('m')] ? params.get('m') : PRESETS[stored.material] ? stored.material : 'terrakotta';
    const startDepth = Math.min(1.3, Math.max(0.22, Number(params.get('d')) || Number(stored.depth) || 0.62));

    if (startText) stage.state.text = startText;
    stage.state.material = startMaterial;
    stage.state.depth = startDepth;
    stage.setText(startText || 'BYTEWERK', 'init');
    stage.setMaterial(startMaterial);
    stage.syncInputs('init');

    const depthInput = document.querySelector('[data-zw-depth]');
    if (depthInput) depthInput.value = String(stage.state.depth);

    const countEl = document.querySelector('[data-zw-input]') ? document.getElementById('zw-count') : null;
    const depthOut = document.getElementById('zw-depth-out');

    const paintCount = () => {
      if (!countEl) return;
      const value = document.querySelector('[data-zw-input]');
      countEl.textContent = (value ? value.value.length : 0) + '/' + MAX_CHARS;
    };

    const paintDepth = () => {
      if (!depthOut) return;
      depthOut.textContent = stage.state.depth.toFixed(2).replace('.', ',');
    };

    paintCount();
    paintDepth();

    document.querySelectorAll('[data-zw-input]').forEach((input) => {
      input.addEventListener('input', () => {
        const clean = normalize(input.value);
        if (input.value !== clean) {
          const pos = input.selectionStart;
          input.value = clean;
          if (pos !== null) input.setSelectionRange(Math.min(pos, clean.length), Math.min(pos, clean.length));
        }
        stage.setText(clean, 'input');
        paintCount();
      });
      input.addEventListener('change', () => stage.setText(input.value, 'input'));
    });

    document.querySelectorAll('[data-zw-preset]').forEach((button) => {
      button.addEventListener('click', () => stage.setMaterial(button.dataset.zwPreset));
    });

    document.querySelectorAll('[data-zw-depth]').forEach((input) => {
      input.addEventListener('input', () => {
        stage.setDepth(input.value);
        paintDepth();
      });
    });

    document.querySelectorAll('[data-zw-view]').forEach((button) => {
      button.addEventListener('click', () => {
        stage.setView(button.dataset.zwView, false);
        document.querySelectorAll('[data-zw-view]').forEach((other) => {
          other.setAttribute('aria-pressed', String(other === button));
        });
      });
    });

    document.querySelectorAll('[data-zw-png]').forEach((button) => {
      button.addEventListener('click', () => {
        const ok = stage.exportPng();
        const note = document.querySelector('[data-zw-note]');
        if (note) {
          note.textContent = ok
            ? t('PNG gesichert — transparent, 2-fache Auflösung.', 'PNG saved — transparent, 2x resolution.')
            : t('Das Bild konnte nicht gesichert werden.', 'The image could not be saved.');
        }
      });
    });

    document.querySelectorAll('[data-zw-link]').forEach((button) => {
      button.addEventListener('click', async () => {
        const url = stage.shareUrl();
        let copied = false;
        try {
          await navigator.clipboard.writeText(url);
          copied = true;
        } catch (_) {
          const field = document.createElement('textarea');
          field.value = url;
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.appendChild(field);
          field.select();
          try {
            copied = document.execCommand('copy');
          } catch (_) {
            copied = false;
          }
          field.remove();
        }
        const note = document.querySelector('[data-zw-note]');
        if (note) {
          note.textContent = copied
            ? t('Link kopiert — deine Wortmarke ist teilbar.', 'Link copied — your wordmark is shareable.')
            : t('Kopieren ging nicht. Der Link steht in der Adresszeile.', 'Copy failed. The link is in the address bar.');
        }
      });
    });

    document.querySelectorAll('[data-zw-reset]').forEach((button) => {
      button.addEventListener('click', () => {
        stage.reset();
        paintCount();
        paintDepth();
        document.querySelectorAll('[data-zw-input]').forEach((input) => { input.value = 'BYTEWERK'; });
        document.querySelectorAll('[data-zw-view]').forEach((other) => {
          other.setAttribute('aria-pressed', String(other.dataset.zwView === 'angle'));
        });
      });
    });

    document.addEventListener('bw:lang', () => {
      stage.refreshLabels();
      paintCount();
    });
  };

  boot();
})();
