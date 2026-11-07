/* ============================================================
   BYTEWERK STUDIO — PAPIERSTADT  (stadt.js, ES module)
   ------------------------------------------------------------
   A small city builder on a 7 x 7 sheet of paper.

   • Three resources: paper, clay, sage. Each tier unlocks the
     next one, so the first two minutes always have a next goal.
   • Placement matters: same-kind neighbours, pottery next to
     clay pits, gardens next to pottery, towers along rows and
     columns, the centre plot.
   • Every ~45 s a storm band crosses the sheet. Roofs protect
     permanently, walls absorb one hit and break.
   • Renown from an "exhibition" (prestige) is permanent.
   • The save lives in localStorage; nothing leaves the page.

   three.js is imported from vendor/ — the CSP allows 'self'
   only, so there is no CDN and no fallback to one.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';

/* ---------- small helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'de');
const t = (de, en) => (lang() === 'en' ? en : de);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmtCache = new Map();
function fmt(n, digits = 0) {
  if (!isFinite(n)) n = 0;
  const l = lang();
  const compact = Math.abs(n) >= 100000;
  const key = l + '|' + digits + '|' + (compact ? 1 : 0);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(l === 'de' ? 'de-DE' : 'en-GB', compact
      ? { notation: 'compact', maximumFractionDigits: 1 }
      : { minimumFractionDigits: digits, maximumFractionDigits: digits });
    fmtCache.set(key, f);
  }
  return f.format(n);
}

/* ---------- rules ---------- */
const N = 7;
const CELLS = N * N;
const CENTRE = 3 * N + 3;

const RES = ['paper', 'clay', 'sage'];
const RES_DE = { paper: 'Papier', clay: 'Terrakotta', sage: 'Salbei' };
const RES_EN = { paper: 'paper', clay: 'clay', sage: 'sage' };
const resName = (r) => t(RES_DE[r], RES_EN[r]);

const DEFS = {
  mill: {
    de: 'Papierwerk', en: 'Paper mill',
    desc: { de: 'Legt Papier in Lagen und trocknet es an der Sonne.', en: 'Lays paper in sheets and dries it in the sun.' },
    cost: { paper: 10 }, growth: 1.15, out: { paper: 1.0 },
    unlock: null, shape: 'mill', top: 0.42,
  },
  pit: {
    de: 'Lehmgrube', en: 'Clay pit',
    desc: { de: 'Sticht Lehm aus dem Blatt. Braucht Papier für das Gerüst.', en: 'Cuts clay out of the sheet. Needs paper for the frame.' },
    cost: { paper: 30 }, growth: 1.20, out: { clay: 0.45 },
    unlock: { key: 'paper', amount: 120 }, shape: 'pit', top: 0.30,
  },
  wall: {
    de: 'Mauer', en: 'Wall',
    desc: { de: 'Schützt die vier Nachbarn einmal. Danach ist sie weg.', en: 'Protects its four neighbours once, then it is gone.' },
    cost: { clay: 15 }, growth: 1.12, out: {},
    unlock: { key: 'clay', amount: 12 }, shape: 'wall', top: 0.44,
  },
  pottery: {
    de: 'Töpferei', en: 'Pottery',
    desc: { de: 'Brennt Ton und stärkt jede Lehmgrube daneben um 25 %.', en: 'Fires clay and boosts every neighbouring pit by 25%.' },
    cost: { paper: 55, clay: 20 }, growth: 1.22, out: { paper: 1.8 },
    unlock: { key: 'clay', amount: 25 }, shape: 'pottery', top: 0.70,
  },
  garden: {
    de: 'Salbeigarten', en: 'Sage garden',
    desc: { de: 'Zieht Salbei. Ein Dach oder Ausbau wird damit bezahlt.', en: 'Grows sage. Roofs and upgrades are paid with it.' },
    cost: { paper: 90, clay: 45 }, growth: 1.24, out: { sage: 0.30 },
    unlock: { key: 'clay', amount: 60 }, shape: 'garden', top: 0.28,
  },
  tower: {
    de: 'Turm', en: 'Tower',
    desc: { de: 'Hebt jede Reihe und Spalte, in der er steht, um 10 %.', en: 'Lifts its whole row and column by 10%.' },
    cost: { paper: 150, clay: 70, sage: 20 }, growth: 1.30, out: {},
    unlock: { key: 'sage', amount: 30 }, shape: 'tower', top: 1.32,
  },
  press: {
    de: 'Druckerei', en: 'Press',
    desc: { de: 'Druckt in Bogen. Der größte Papierertrag im Spiel.', en: 'Prints in sheets. The biggest paper yield in the game.' },
    cost: { paper: 300, clay: 100, sage: 20 }, growth: 1.28, out: { paper: 6.0 },
    unlock: { key: 'paper', amount: 1200 }, shape: 'press', top: 0.72,
  },
};
const ORDER = ['mill', 'pit', 'wall', 'pottery', 'garden', 'tower', 'press'];

/* Footprint per type: a 1.0 cell should read as a built plot, not a model in
   a car park. Values are deliberately below 1 so roofs and walls fit. */
const TYPE_SCALE = {
  mill: 1.28, pit: 1.20, pottery: 1.24, garden: 1.14,
  tower: 1.20, press: 1.22, wall: 1.16,
};

const MAX_LEVEL = 5;
const LEVEL_BONUS = 0.45;      // +45% output per level above 1
const ROOF_BASE = 12;          // sage
const ROOF_STEP = 6;
const STORM_WARN = 10;
const SAVE_KEY = 'bw.papierstadt.v1';
const DAY_KEY = 'bw.papierstadt.day';

/* ---------- state ---------- */
const freshState = () => ({
  grid: new Array(CELLS).fill(null),
  res: { paper: 40, clay: 0, sage: 0 },
  life: { paper: 0, clay: 0, sage: 0 },
  ruhm: 0,
  storms: 0,
  known: ['mill'],
  sound: true,
  paused: false,
  storm: { t: 62, band: null, flash: 0 },
  morning: 0,
  lastDay: '',
  day: '',
  born: Date.now(),
  log: [],
});

let state = freshState();
let selectedType = null;
let selectedCell = -1;
let hoverCell = -1;
let cursorCell = 24;
let alertTimer = 0;

/* ---------- derived numbers ---------- */
function rc(i) { return [Math.floor(i / N), i % N]; }

function neighbours(i) {
  const r = Math.floor(i / N), c = i % N;
  const out = [];
  if (r > 0) out.push(i - N);
  if (r < N - 1) out.push(i + N);
  if (c > 0) out.push(i - 1);
  if (c < N - 1) out.push(i + 1);
  return out;
}

function countOf(type) {
  let n = 0;
  for (const b of state.grid) if (b && b.t === type) n++;
  return n;
}

function costOf(type) {
  const d = DEFS[type];
  const f = Math.pow(d.growth, countOf(type));
  const out = {};
  for (const k of Object.keys(d.cost)) out[k] = Math.max(1, Math.round(d.cost[k] * f));
  return out;
}

function upgradeCost(b) {
  const d = DEFS[b.t];
  const f = 0.9 + 0.75 * b.l;
  const out = {};
  for (const k of Object.keys(d.cost)) out[k] = Math.max(2, Math.round(d.cost[k] * f));
  return out;
}

function roofCost() {
  let n = 0;
  for (const b of state.grid) if (b && b.roof) n++;
  return ROOF_BASE + ROOF_STEP * n;
}

function canPay(cost) {
  for (const k in cost) if (state.res[k] < cost[k]) return false;
  return true;
}

function pay(cost) {
  for (const k in cost) state.res[k] -= cost[k];
}

function refundOf(type) {
  const d = DEFS[type];
  const out = {};
  for (const k of Object.keys(d.cost)) out[k] = Math.floor(d.cost[k] * 0.5);
  return out;
}

function globalMult() {
  let m = 1 + 0.03 * state.ruhm;
  if (state.morning > 0) m += 0.5;
  return m;
}

/* Bonus breakdown for one cell — used for yields and for the inspect panel. */
function bonusOf(i, b) {
  const [, c] = rc(i);
  const r = Math.floor(i / N);
  let same = 0, pottery = 0, towers = 0;

  for (const n of neighbours(i)) {
    const o = state.grid[n];
    if (!o) continue;
    if (o.t === b.t) same++;
    if (o.t === 'pottery') pottery = 1;
  }

  for (let j = 0; j < N; j++) {
    const a = state.grid[r * N + j];
    const d = state.grid[j * N + c];
    if (a && a.t === 'tower' && r * N + j !== i) towers++;
    if (d && d.t === 'tower' && j * N + c !== i) towers++;
  }
  towers = Math.min(3, towers);

  const parts = [];
  if (same) parts.push({ key: 'same', label: t('Gleiche Nachbarn', 'Same neighbours'), value: 0.08 * same });
  if (b.t === 'pit' && pottery) parts.push({ key: 'pottery', label: t('Töpferei daneben', 'Pottery next door'), value: 0.25 });
  if (b.t === 'garden' && pottery) parts.push({ key: 'pottery', label: t('Töpferei daneben', 'Pottery next door'), value: 0.20 });
  if (i === CENTRE) parts.push({ key: 'centre', label: t('Mittelfeld', 'Centre plot'), value: 0.15 });
  if (towers) parts.push({ key: 'tower', label: t('Turm', 'Tower'), value: 0.10 * towers });

  let sum = 0;
  for (const p of parts) sum += p.value;
  return { parts, sum };
}

function rateOf(i, b) {
  const d = DEFS[b.t];
  if (!d.out || !Object.keys(d.out).length) return null;
  const m = (1 + LEVEL_BONUS * (b.l - 1) + bonusOf(i, b).sum) * globalMult();
  const out = {};
  for (const k in d.out) out[k] = d.out[k] * m;
  return out;
}

function totalRates() {
  const r = { paper: 0, clay: 0, sage: 0 };
  for (let i = 0; i < CELLS; i++) {
    const b = state.grid[i];
    if (!b) continue;
    const rate = rateOf(i, b);
    if (!rate) continue;
    for (const k in rate) r[k] += rate[k];
  }
  return r;
}

/* ---------- persistence ---------- */
function saveNow() {
  try {
    const data = {
      v: 1,
      grid: state.grid.map(b => (b ? [b.t, b.l, b.roof ? 1 : 0] : 0)),
      res: state.res,
      life: state.life,
      ruhm: state.ruhm,
      storms: state.storms,
      known: Array.from(state.known),
      sound: state.sound,
      morning: Math.max(0, Math.round(state.morning)),
      lastDay: state.lastDay,
      ts: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* storage blocked — the game still runs in memory */ }
}

function loadState() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch { return; }
  if (!raw) return;
  let d;
  try { d = JSON.parse(raw); } catch { return; }
  if (!d || d.v !== 1 || !Array.isArray(d.grid) || d.grid.length !== CELLS) return;

  const next = freshState();
  for (let i = 0; i < CELLS; i++) {
    const e = d.grid[i];
    if (!e || !Array.isArray(e)) continue;
    const type = e[0];
    if (!DEFS[type]) continue;
    next.grid[i] = { t: type, l: clamp(Math.round(+e[1] || 1), 1, MAX_LEVEL), roof: !!e[2] };
  }
  for (const k of RES) {
    next.res[k] = Math.max(0, +((d.res || {})[k]) || 0);
    next.life[k] = Math.max(0, +((d.life || {})[k]) || 0);
  }
  next.ruhm = Math.max(0, Math.floor(+d.ruhm || 0));
  next.storms = Math.max(0, Math.floor(+d.storms || 0));
  if (Array.isArray(d.known)) next.known = d.known.filter(x => DEFS[x]);
  if (!next.known.includes('mill')) next.known.push('mill');
  next.sound = d.sound !== false;
  next.lastDay = typeof d.lastDay === 'string' ? d.lastDay : '';
  next.storm.t = Math.max(20, 48 - next.storms * 1.5);
  state = next;

  /* offline yield: half rate, capped at two hours */
  const elapsed = clamp((Date.now() - (+d.ts || Date.now())) / 1000, 0, 7200);
  if (elapsed > 45) {
    const rates = totalRates();
    const gain = {};
    let any = false;
    for (const k of RES) {
      gain[k] = Math.floor(rates[k] * elapsed * 0.5);
      if (gain[k] > 0) { state.res[k] += gain[k]; state.life[k] += gain[k]; any = true; }
    }
    if (any) {
      const mins = Math.round(elapsed / 60);
      log(t('Willkommen zurück nach ' + mins + ' Min: ' + gain.paper + ' Papier, ' + gain.clay + ' Terrakotta, ' + gain.sage + ' Salbei.',
        'Welcome back after ' + mins + ' min: ' + gain.paper + ' paper, ' + gain.clay + ' clay, ' + gain.sage + ' sage.'), 'good');
      flash(t('Willkommen zurück — die Stadt hat weitergearbeitet.', 'Welcome back — the city kept working.'), 5200);
    }
  }
}

/* ---------- log + alerts ---------- */
function log(text, kind) {
  state.log.unshift({ text, kind: kind || '', id: Math.random().toString(36).slice(2, 8) });
  state.log = state.log.slice(0, 4);
  renderLog();
}

let alertUntil = 0;
function flash(text, ms = 3200) {
  const el = $('#ps-alert');
  if (!el) return;
  el.textContent = text;
  el.classList.add('is-on');
  alertUntil = performance.now() + ms;
}

/* ---------- sound ---------- */
let actx = null;
function audio() {
  if (!state.sound) return null;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  } catch { return null; }
}
function tone(freq, dur, type, gainValue) {
  const ctx = audio();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gainValue || 0.05, ctx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch { /* ignore */ }
}
const sfx = {
  build: () => { tone(392, 0.12, 'sine', 0.045); setTimeout(() => tone(523, 0.14, 'sine', 0.035), 55); },
  upgrade: () => { tone(523, 0.1, 'triangle', 0.04); setTimeout(() => tone(659, 0.16, 'triangle', 0.035), 70); },
  error: () => tone(174, 0.14, 'sine', 0.04),
  storm: () => { tone(110, 0.5, 'sawtooth', 0.025); setTimeout(() => tone(82, 0.7, 'sine', 0.03), 120); },
  fame: () => { tone(523, 0.16, 'triangle', 0.04); setTimeout(() => tone(784, 0.24, 'triangle', 0.035), 110); },
};

/* ---------- simulation ---------- */
let uiClock = 0;

function simulate(dt) {
  /* production */
  for (let i = 0; i < CELLS; i++) {
    const b = state.grid[i];
    if (!b) continue;
    const rate = rateOf(i, b);
    if (!rate) continue;
    for (const k in rate) {
      const add = rate[k] * dt;
      state.res[k] += add;
      state.life[k] += add;
    }
  }

  /* unlocks */
  for (const id of ORDER) {
    if (state.known.includes(id)) continue;
    const u = DEFS[id].unlock;
    if (!u) continue;
    if (state.life[u.key] >= u.amount) {
      state.known.push(id);
      log(t('Neu freigeschaltet: ' + DEFS[id].de + '.', 'Unlocked: ' + DEFS[id].en + '.'), 'good');
      flash(t(DEFS[id].de + ' ist jetzt verfügbar.', DEFS[id].en + ' is available now.'), 3600);
      tone(660, 0.12, 'triangle', 0.04);
      renderPalette();
    }
  }

  /* morning light */
  if (state.morning > 0) {
    state.morning -= dt;
    if (state.morning <= 0) {
      state.morning = 0;
      log(t('Das Morgenlicht ist vorbei.', 'The morning light has passed.'), '');
    }
  }

  /* storm */
  const s = state.storm;
  s.t -= dt;
  if (!s.band && s.t <= STORM_WARN) {
    s.band = pickBand();
    showBand(s.band);
    flash(t('Sturm angekündigt: ' + bandName(s.band) + ' in ' + Math.ceil(s.t) + ' Sekunden.',
      'Storm announced: ' + bandName(s.band) + ' in ' + Math.ceil(s.t) + ' seconds.'), 9000);
    tone(330, 0.18, 'sine', 0.035);
  }
  if (s.t <= 0) resolveStorm();

  uiClock += dt;
  if (uiClock > 0.22) {
    uiClock = 0;
    renderChips();
  }
}

function pickBand() {
  const axis = Math.random() < 0.5 ? 'row' : 'col';
  let i = Math.floor(Math.random() * N);
  const prev = state.storm.lastBand;
  if (prev && prev.axis === axis && prev.i === i) i = (i + 1 + Math.floor(Math.random() * 6)) % N;
  state.storm.lastBand = { axis, i };
  return { axis, i };
}

function bandName(band) {
  if (!band) return '—';
  return band.axis === 'row'
    ? t('Reihe ' + (band.i + 1), 'row ' + (band.i + 1))
    : t('Spalte ' + (band.i + 1), 'column ' + (band.i + 1));
}

function bandCells(band) {
  const out = [];
  for (let k = 0; k < N; k++) out.push(band.axis === 'row' ? band.i * N + k : k * N + band.i);
  return out;
}

function resolveStorm() {
  const band = state.storm.band || pickBand();
  const cells = bandCells(band);
  const usedWalls = new Set();
  let damaged = 0, destroyed = 0, savedRoof = 0, savedWall = 0;

  for (const i of cells) {
    const b = state.grid[i];
    if (!b || b.t === 'wall') continue;
    if (b.roof) { savedRoof++; continue; }

    let wall = -1;
    for (const n of neighbours(i)) {
      const o = state.grid[n];
      if (o && o.t === 'wall' && !usedWalls.has(n) && cells.indexOf(n) === -1) { wall = n; break; }
    }
    if (wall !== -1) {
      usedWalls.add(wall);
      state.grid[wall] = null;
      savedWall++;
      continue;
    }
    if (b.l > 1) {
      b.l--;
      damaged++;
    } else {
      state.grid[i] = null;
      destroyed++;
    }
  }

  /* every wall standing inside the band breaks */
  for (const i of cells) {
    const b = state.grid[i];
    if (b && b.t === 'wall') { state.grid[i] = null; usedWalls.add(i); }
  }

  state.storms++;
  state.storm.t = Math.max(30, 46 - state.storms * 1.5);
  state.storm.band = null;
  state.storm.flash = 1.4;
  hideBand();
  shakeBand(cells);

  const bits = [];
  if (destroyed) bits.push(t(destroyed + ' zerstört', destroyed + ' destroyed'));
  if (damaged) bits.push(t(damaged + ' beschädigt', damaged + ' damaged'));
  if (savedRoof) bits.push(t(savedRoof + ' durch Dächer gerettet', savedRoof + ' saved by roofs'));
  if (savedWall) bits.push(t(savedWall + ' durch Mauern gerettet', savedWall + ' saved by walls'));
  if (!bits.length) bits.push(t('nichts getroffen', 'nothing hit'));

  const msg = t('Sturm über ' + bandName(band) + ': ' + bits.join(', ') + '.',
    'Storm over ' + bandName(band) + ': ' + bits.join(', ') + '.');
  log(msg, destroyed || damaged ? 'bad' : '');
  flash(msg, 4200);
  sfx.storm();
  announce(msg);

  for (let i = 0; i < CELLS; i++) syncCell(i);
  renderPalette();
  renderInspect();
  saveNow();
}

/* ---------- actions ---------- */
function place(i) {
  if (i < 0 || i >= CELLS) return;
  const existing = state.grid[i];
  if (existing) { selectCell(i); return; }
  if (!selectedType) {
    flash(t('Wähle zuerst ein Gebäude aus der Liste.', 'Pick a building from the list first.'), 2600);
    return;
  }
  if (!state.known.includes(selectedType)) {
    const u = DEFS[selectedType].unlock;
    flash(t('Noch gesperrt: ' + unlockText(u) + '.', 'Still locked: ' + unlockText(u) + '.'), 3000);
    return;
  }
  const cost = costOf(selectedType);
  if (!canPay(cost)) {
    flash(t('Es fehlt noch: ' + missingText(cost) + '.', 'Still missing: ' + missingText(cost) + '.'), 2600);
    sfx.error();
    return;
  }
  pay(cost);
  state.grid[i] = { t: selectedType, l: 1, roof: false };
  syncCell(i);
  sfx.build();
  renderChips();
  renderPalette();
  log(t(DEFS[selectedType].de + ' gebaut.', DEFS[selectedType].en + ' built.'), 'good');
  announce(t(DEFS[selectedType].de + ' auf ' + cellName(i) + ' gebaut.', DEFS[selectedType].en + ' built on ' + cellName(i) + '.'));
  hideHint();
  saveNow();
}

function upgrade(i) {
  const b = state.grid[i];
  if (!b) return;
  if (b.l >= MAX_LEVEL) { flash(t('Höchste Stufe erreicht.', 'Maximum level reached.'), 2200); return; }
  const cost = upgradeCost(b);
  if (!canPay(cost)) { flash(t('Es fehlt noch: ' + missingText(cost) + '.', 'Still missing: ' + missingText(cost) + '.'), 2600); sfx.error(); return; }
  pay(cost);
  b.l++;
  syncCell(i);
  sfx.upgrade();
  renderChips();
  renderInspect();
  log(t(DEFS[b.t].de + ' auf Stufe ' + b.l + ' ausgebaut.', DEFS[b.t].en + ' upgraded to level ' + b.l + '.'), 'good');
  saveNow();
}

function buyRoof(i) {
  const b = state.grid[i];
  if (!b) return;
  if (b.roof) return;
  const cost = { sage: roofCost() };
  if (!canPay(cost)) { flash(t('Es fehlt noch: ' + missingText(cost) + '.', 'Still missing: ' + missingText(cost) + '.'), 2600); sfx.error(); return; }
  pay(cost);
  b.roof = true;
  syncCell(i);
  sfx.upgrade();
  renderChips();
  renderInspect();
  renderPalette();
  log(t('Dach auf ' + cellName(i) + ' gesetzt — dieser Sturm kann dem Gebäude nichts tun.', 'Roof on ' + cellName(i) + ' — this storm cannot touch it.'), 'good');
  saveNow();
}

function demolish(i) {
  const b = state.grid[i];
  if (!b) return;
  const refund = refundOf(b.t);
  for (const k in refund) state.res[k] += refund[k];
  state.grid[i] = null;
  syncCell(i);
  selectedCell = -1;
  renderInspect();
  renderChips();
  renderPalette();
  log(t(DEFS[b.t].de + ' abgerissen.', DEFS[b.t].en + ' demolished.'), '');
  saveNow();
}

function cellName(i) {
  const [r, c] = rc(i);
  return t('Reihe ' + (r + 1) + ', Spalte ' + (c + 1), 'row ' + (r + 1) + ', column ' + (c + 1));
}

function missingText(cost) {
  const bits = [];
  for (const k in cost) {
    const need = Math.ceil(cost[k] - state.res[k]);
    if (need > 0) bits.push(fmt(need) + ' ' + resName(k));
  }
  return bits.join(', ');
}

function unlockText(u) {
  if (!u) return t('sofort', 'from the start');
  return t(fmt(u.amount) + ' ' + resName(u.key) + ' gesammelt', fmt(u.amount) + ' ' + resName(u.key) + ' collected');
}

/* ---------- prestige / reset ---------- */
function prestigeGain() {
  let levels = 0;
  for (const b of state.grid) if (b) levels += b.l;
  return Math.max(0, Math.floor(Math.sqrt(levels * 2) + state.storms * 0.5));
}

function prestigeReady() {
  let levels = 0;
  for (const b of state.grid) if (b) levels += b.l;
  return state.storms >= 2 && levels >= 12;
}

function doPrestige() {
  if (!prestigeReady()) return;
  const gain = prestigeGain();
  state.ruhm += gain;
  state.grid = new Array(CELLS).fill(null);
  state.res = { paper: 40, clay: 0, sage: 0 };
  state.life = { paper: 0, clay: 0, sage: 0 };
  state.storms = 0;
  state.storm = { t: 62, band: null, flash: 0 };
  selectedCell = -1;
  selectedType = null;
  for (let i = 0; i < CELLS; i++) syncCell(i);
  renderPalette();
  renderInspect();
  renderChips();
  hideBand();
  sfx.fame();
  log(t('Ausstellung eröffnet: +' + gain + ' Ruhm. Jedes Gebäude produziert jetzt ' + fmt(3 * state.ruhm) + ' % mehr.',
    'Exhibition opened: +' + gain + ' renown. Every building now produces ' + fmt(3 * state.ruhm) + '% more.'), 'good');
  flash(t('+' + gain + ' Ruhm. Die Stadt beginnt von vorn — mit mehr Ertrag.', '+' + gain + ' renown. The city starts over — with more yield.'), 5000);
  saveNow();
}

function doReset() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  const sound = state.sound;
  state = freshState();
  state.sound = sound;
  selectedCell = -1;
  selectedType = null;
  for (let i = 0; i < CELLS; i++) syncCell(i);
  renderPalette();
  renderInspect();
  renderChips();
  hideBand();
  log(t('Neues Blatt. Alles auf Anfang.', 'New sheet. Back to the start.'), '');
  saveNow();
}

/* ---------- day bonus ---------- */
function checkDay() {
  let today = '';
  try { today = new Date().toISOString().slice(0, 10); } catch { /* ignore */ }
  if (!today) return;
  if (state.lastDay === today) return;
  state.lastDay = today;
  state.morning = 120;
  log(t('Morgenlicht: zwei Minuten lang 50 % mehr Ertrag.', 'Morning light: 50% more yield for two minutes.'), 'good');
  flash(t('Morgenlicht — 50 % mehr Ertrag für zwei Minuten.', 'Morning light — 50% more yield for two minutes.'), 6000);
}

/* ============================================================
   three.js scene
   ============================================================ */
const stage = $('#ps-stage');
const canvas = $('#ps-canvas');

let renderer = null, scene = null, camera = null, sun = null;
let boardGroup = null, bandMesh = null, bandEdges = null, wind = null;
let highlight = null, ghost = null, ghostType = null;
const visuals = new Map();
let cam = { az: 0.66, pol: 0.80, dist: 18, baseAz: 0.66, fit: 18, zoom: 1, lift: 0.62 };
let dragging = null;
const pointers = new Map();
let pinchStart = 0, pinchDist = 0;
let windT = -1;
let shakeT = 0;
let shakeCells = [];
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const tmpVec = new THREE.Vector3();

const COL = {
  paper: 0xfffcf3,
  paperMid: 0xfdf5e4,
  paperDeep: 0xf0e4c8,
  terra: 0xb04f31,
  terraLight: 0xc97a5c,
  sage: 0x4f7a63,
  sageLight: 0x7d9b88,
  soil: 0x6f6a60,
  ink: 0x1f1e1d,
  rubble: 0xb2a894,
};

function mat(hex, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: hex, roughness: 0.94, metalness: 0, flatShading: true,
  }, opts || {}));
}

function addEdges(mesh, opacity) {
  const geo = new THREE.EdgesGeometry(mesh.geometry, 30);
  const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
    color: COL.ink, transparent: true, opacity: opacity === undefined ? 0.38 : opacity,
  }));
  mesh.add(line);
  return mesh;
}

function box(w, h, d, color, x, y, z, ry) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  if (ry) m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  addEdges(m);
  return m;
}

function cyl(rt, rb, h, seg, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  addEdges(m, 0.16);
  return m;
}

let contactTex = null;
function contactShadow() {
  if (!contactTex) {
    const S = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    const grad = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(60,46,26,0.42)');
    grad.addColorStop(0.55, 'rgba(60,46,26,0.20)');
    grad.addColorStop(1, 'rgba(60,46,26,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    contactTex = new THREE.CanvasTexture(cv);
    contactTex.colorSpace = THREE.SRGBColorSpace;
  }
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1.16, 1.16),
    new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, opacity: 0.9 })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.006;
  m.renderOrder = 1;
  return m;
}

function makeBuilding(type, level, roof) {
  const g = new THREE.Group();
  const d = DEFS[type];

  if (type === 'mill') {
    g.add(box(0.68, 0.10, 0.54, COL.paperMid, 0, 0.05, 0));
    g.add(box(0.58, 0.10, 0.46, COL.paper, 0, 0.15, 0, 0.14));
    g.add(box(0.48, 0.10, 0.38, COL.paperMid, 0, 0.25, 0, -0.1));
    g.add(box(0.07, 0.20, 0.07, COL.terraLight, 0.18, 0.40, 0.10));
  } else if (type === 'pit') {
    g.add(cyl(0.44, 0.36, 0.16, 14, COL.terraLight, 0, 0.08, 0));
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.02, 14), mat(0x8d6b58));
    hole.position.y = 0.165;
    hole.receiveShadow = true;
    g.add(hole);
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 0), mat(COL.terraLight)));
    g.children[g.children.length - 1].position.set(0.28, 0.16, 0.18);
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), mat(COL.terra)));
    g.children[g.children.length - 1].position.set(-0.26, 0.14, -0.2);
    for (const c of g.children) if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
  } else if (type === 'pottery') {
    g.add(box(0.52, 0.34, 0.44, COL.paper, 0, 0.17, 0));
    const roofM = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.26, 4), mat(COL.terra));
    roofM.position.y = 0.47;
    roofM.rotation.y = Math.PI / 4;
    roofM.castShadow = true;
    addEdges(roofM, 0.2);
    g.add(roofM);
    g.add(cyl(0.07, 0.09, 0.16, 8, COL.terra, -0.32, 0.08, 0.26));
    g.add(cyl(0.06, 0.08, 0.13, 8, COL.terraLight, 0.33, 0.065, -0.24));
  } else if (type === 'garden') {
    g.add(box(0.80, 0.09, 0.80, COL.paperMid, 0, 0.045, 0));
    g.add(box(0.70, 0.07, 0.70, COL.soil, 0, 0.115, 0));
    for (const [x, z] of [[-0.2, -0.2], [0.18, -0.12], [0.02, 0.19], [-0.22, 0.16], [0.24, 0.2]]) {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.105, 0), mat(COL.sage));
      leaf.position.set(x, 0.19, z);
      leaf.castShadow = true;
      g.add(leaf);
    }
    for (const [x, z, w, d2] of [[0, -0.40, 0.80, 0.03], [0, 0.40, 0.80, 0.03], [-0.40, 0, 0.03, 0.80], [0.40, 0, 0.03, 0.80]]) {
      g.add(box(w, 0.10, d2, COL.paperDeep, x, 0.14, z));
    }
  } else if (type === 'tower') {
    g.add(box(0.44, 0.08, 0.44, COL.paperMid, 0, 0.04, 0));
    g.add(box(0.32, 0.90, 0.32, COL.paper, 0, 0.49, 0));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.30, 0.28, 4), mat(COL.terra));
    cap.position.y = 1.08;
    cap.rotation.y = Math.PI / 4;
    cap.castShadow = true;
    addEdges(cap, 0.2);
    g.add(cap);
    g.add(box(0.02, 0.17, 0.12, COL.sage, 0.17, 1.24, 0));
  } else if (type === 'press') {
    g.add(box(0.66, 0.44, 0.52, COL.paper, 0, 0.22, 0));
    g.add(box(0.72, 0.07, 0.56, COL.terraLight, 0, 0.475, 0));
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.62, 10), mat(COL.terra));
    roller.rotation.z = Math.PI / 2;
    roller.position.set(0, 0.56, 0);
    roller.castShadow = true;
    addEdges(roller, 0.18);
    g.add(roller);
    const sheet = box(0.32, 0.015, 0.42, 0xfdfcf8, 0.27, 0.50, 0, 0.12);
    sheet.rotation.z = -0.35;
    g.add(sheet);
  } else if (type === 'wall') {
    g.add(box(0.88, 0.22, 0.16, COL.terraLight, 0, 0.11, 0));
    for (const x of [-0.28, 0, 0.28]) g.add(box(0.14, 0.12, 0.16, COL.terraLight, x, 0.28, 0));
  }

  if (roof) {
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.2, 4), mat(COL.terra));
    cap.position.y = (d.top || 0.4) + 0.1;
    cap.rotation.y = Math.PI / 4;
    cap.castShadow = true;
    addEdges(cap, 0.2);
    g.add(cap);
  }

  g.add(contactShadow());
  g.userData.level = level;
  const bulk = TYPE_SCALE[type] || 1;
  g.userData.bulk = bulk;
  g.scale.setScalar(bulk * (1 + 0.055 * (level - 1)));
  g.userData.top = (d.top || 0.4) + (roof ? 0.22 : 0);
  return g;
}

function makeGhost(type) {
  const g = makeBuilding(type, 1, false);
  g.traverse(o => {
    if (o.isMesh || o.isLineSegments) {
      o.material = o.material.clone();
      o.material.transparent = true;
      o.material.opacity = o.isLineSegments ? 0.35 : 0.42;
      o.material.depthWrite = false;
      o.castShadow = false;
      o.receiveShadow = false;
    }
  });
  return g;
}

function makeRubble() {
  const g = new THREE.Group();
  g.add(contactShadow());
  const spots = [[-0.12, 0.07, 0.06], [0.14, 0.05, -0.1], [0.02, 0.09, 0.16], [-0.2, 0.04, -0.18]];
  for (let i = 0; i < spots.length; i++) {
    const m = box(0.16 + Math.random() * 0.12, 0.08 + Math.random() * 0.08, 0.14 + Math.random() * 0.1,
      i % 2 ? COL.rubble : COL.paperDeep, spots[i][0], spots[i][1], spots[i][2], Math.random() * 2);
    m.rotation.z = (Math.random() - 0.5) * 0.5;
    g.add(m);
  }
  return g;
}

function paperTexture() {
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  g.fillStyle = '#d9c39a';
  g.fillRect(0, 0, S, S);

  /* fibres */
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * S, y = Math.random() * S;
    const a = Math.random() * 0.05;
    g.fillStyle = Math.random() < 0.5 ? `rgba(120,108,86,${a})` : `rgba(255,255,255,${a * 1.4})`;
    g.fillRect(x, y, 1 + Math.random() * 1.6, 1);
  }

  const cell = S / N;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 0) continue;
      g.fillStyle = 'rgba(96,74,40,0.07)';
      g.fillRect(c * cell, r * cell, cell, cell);
    }
  }

  g.strokeStyle = 'rgba(58,44,24,0.46)';
  g.lineWidth = 1.8;
  for (let k = 0; k <= N; k++) {
    const p = Math.round(k * cell) + 0.5;
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, S); g.stroke();
    g.beginPath(); g.moveTo(0, p); g.lineTo(S, p); g.stroke();
  }

  g.strokeStyle = 'rgba(74,62,42,0.20)';
  g.lineWidth = 2;
  for (let k = 1; k < N; k++) {
    const p = Math.round(k * cell * 1.0) + 0.5;
    g.beginPath(); g.setLineDash([2, 8]); g.moveTo(p, 6); g.lineTo(p, S - 6); g.stroke();
    g.beginPath(); g.moveTo(6, p); g.lineTo(S - 6, p); g.stroke();
    g.setLineDash([]);
  }

  /* plot marks: one lighter square inside every cell */
  g.strokeStyle = 'rgba(255,250,238,0.34)';
  g.lineWidth = 1.3;
  const inset = cell * 0.055;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      g.strokeRect(c * cell + inset, r * cell + inset, cell - inset * 2, cell - inset * 2);
    }
  }
  /* the centre plot is marked with a small cross, it earns +15% */
  g.strokeStyle = 'rgba(160,64,36,0.42)';
  g.lineWidth = 2;
  const cx = CENTRE % N * cell + cell / 2;
  const cz = Math.floor(CENTRE / N) * cell + cell / 2;
  g.beginPath(); g.moveTo(cx - 12, cz); g.lineTo(cx + 12, cz); g.stroke();
  g.beginPath(); g.moveTo(cx, cz - 12); g.lineTo(cx, cz + 12); g.stroke();

  g.fillStyle = 'rgba(58,44,24,0.70)';
  g.font = 'italic 26px Georgia, "Times New Roman", serif';
  g.fillText('PAPIERSTADT', 26, 42);
  g.font = 'italic 20px Georgia, "Times New Roman", serif';
  g.fillText('M 1:100 · BLATT 01', S - 232, S - 24);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (renderer) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function buildScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0xf2ecdd, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);

  /* three.js lights are physical: radiance ≈ intensity / π. Keeping the sum
     near 2.8 leaves white paper just below clipping, so folds stay visible
     instead of burning out. */
  /* Total irradiance stays near π so a white surface renders white and the
     kraft board keeps its own colour instead of washing out. */
  scene.add(new THREE.HemisphereLight(0xfffdf8, 0xb3a894, 1.55));
  sun = new THREE.DirectionalLight(0xfff4e2, 1.55);
  sun.position.set(7, 12.5, 5.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 32;
  sun.shadow.bias = -0.0007;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: 0.22 })
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.38;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  boardGroup = new THREE.Group();
  scene.add(boardGroup);

  /* the loose sheet under the model */
  const sheet = box(9.7, 0.05, 9.7, 0xd8c7a3, 0, -0.34, 0, 0.028);
  sheet.castShadow = true;
  sheet.receiveShadow = true;
  boardGroup.add(sheet);

  /* the model board */
  /* the block sits below the surface; its top face is 5 cm under the print,
     so the two never share a depth plane */
  const base = box(8.0, 0.22, 8.0, 0xe3d5b4, 0, -0.16, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  boardGroup.add(base);

  const top = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 8.0), new THREE.MeshStandardMaterial({
    map: paperTexture(), roughness: 0.97, metalness: 0,
  }));
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0;
  top.receiveShadow = true;
  boardGroup.add(top);

  /* desk props: pencil, ruler, clips */
  const pencil = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.2, 6), mat(0xe9dfc9));
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  pencil.add(body);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 6), mat(COL.terra));
  tip.rotation.z = -Math.PI / 2;
  tip.position.x = 1.21;
  tip.castShadow = true;
  pencil.add(tip);
  pencil.position.set(-5.5, -0.30, 3.2);
  pencil.rotation.y = 0.28;
  boardGroup.add(pencil);

  const ruler = box(3.0, 0.045, 0.28, COL.sageLight, 5.15, -0.30, 2.7, -0.42);
  boardGroup.add(ruler);

  for (const [x, z, ry] of [[5.3, -3.4, 0.4], [-5.2, -3.9, -0.7]]) {
    const clip = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 14, Math.PI * 1.5), mat(COL.ink, { roughness: 0.6 }));
    clip.rotation.x = -Math.PI / 2;
    clip.rotation.z = ry;
    clip.position.set(x, -0.30, z);
    clip.castShadow = true;
    boardGroup.add(clip);
  }

  /* hover / selection marker */
  highlight = new THREE.Group();
  const hi = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.94), new THREE.MeshBasicMaterial({
    color: COL.sage, transparent: true, opacity: 0.18, depthWrite: false,
  }));
  hi.rotation.x = -Math.PI / 2;
  hi.position.y = 0.003;
  highlight.add(hi);
  const hiEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.96, 0.96)),
    new THREE.LineBasicMaterial({ color: COL.sage, transparent: true, opacity: 0.7 })
  );
  hiEdge.rotation.x = -Math.PI / 2;
  hiEdge.position.y = 0.005;
  highlight.add(hiEdge);
  highlight.visible = false;
  boardGroup.add(highlight);

  /* storm band */
  const bandGeo = new THREE.PlaneGeometry(7.0, 1.0);
  bandMesh = new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({
    color: COL.terra, transparent: true, opacity: 0.13, depthWrite: false,
  }));
  bandMesh.rotation.x = -Math.PI / 2;
  bandMesh.position.y = 0.012;
  bandMesh.visible = false;
  boardGroup.add(bandMesh);

  bandEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(bandGeo),
    new THREE.LineBasicMaterial({ color: COL.terra, transparent: true, opacity: 0.55 })
  );
  bandEdges.rotation.x = -Math.PI / 2;
  bandEdges.position.y = 0.014;
  bandEdges.visible = false;
  boardGroup.add(bandEdges);

  /* wind dashes */
  const windGeo = new THREE.BufferGeometry();
  const pts = new Float32Array(26 * 6);
  for (let i = 0; i < 26; i++) {
    const x = (Math.random() - 0.5) * 7.4;
    const z = (Math.random() - 0.5) * 7.4;
    const len = 0.14 + Math.random() * 0.26;
    pts[i * 6 + 0] = x; pts[i * 6 + 1] = 0.08 + Math.random() * 0.5; pts[i * 6 + 2] = z;
    pts[i * 6 + 3] = x + len; pts[i * 6 + 4] = pts[i * 6 + 1]; pts[i * 6 + 5] = z;
  }
  windGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  wind = new THREE.LineSegments(windGeo, new THREE.LineBasicMaterial({
    color: COL.ink, transparent: true, opacity: 0.22,
  }));
  wind.visible = false;
  scene.add(wind);

  resize();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener('resize', resize);
  }
  /* Layout can settle after the first frame (header injection, fonts, the
     sidebar palette). Re-fit until the framebuffer matches the CSS box. */
  requestAnimationFrame(() => { resize(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => resize()).catch(() => {});
  }
  window.addEventListener('load', () => { resize(); }, { once: true });
}

/* How much of the frame the board±margin would fill at a given distance.
   1.0 means the outermost corner touches the edge. */
function boardFill(dist) {
  /* fit the board surface, not a bounding box that also spans the tower
     height — that made the sheet shrink to two thirds of the frame. */
  const half = 4.34;
  const target = new THREE.Vector3(0, cam.lift, 0);
  const pos = new THREE.Vector3(
    Math.sin(cam.pol) * Math.sin(cam.az),
    Math.cos(cam.pol),
    Math.sin(cam.pol) * Math.cos(cam.az)
  ).multiplyScalar(dist).add(target);
  const fwd = target.clone().sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, fwd);
  const tv = Math.tan((camera.fov * Math.PI) / 360);
  const th = tv * camera.aspect;
  const v = new THREE.Vector3();
  let worst = 0;
  for (const x of [-half, half]) {
    for (const z of [-half, half]) {
      for (const y of [0, 0.06]) {
        v.set(x, y, z).sub(pos);
        const depth = v.dot(fwd);
        if (depth <= 0.1) return 99;
        worst = Math.max(worst, Math.abs(v.dot(right)) / (depth * th), Math.abs(v.dot(up)) / (depth * tv));
      }
    }
  }
  return worst;
}

/* Binary search the smallest distance that keeps the whole sheet inside the
   frame with a small margin — independent of screen size and aspect. */
function fitDistance() {
  let lo = 7, hi = 46;
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2;
    if (boardFill(mid) > 0.94) lo = mid;
    else hi = mid;
  }
  return hi;
}

function resize() {
  if (!renderer || !camera) return;
  const w = Math.max(1, stage.clientWidth);
  const h = Math.max(1, stage.clientHeight);
  /* keep the framebuffer under ~2.6 million pixels */
  const dpr = clamp(Math.min(window.devicePixelRatio || 1, Math.sqrt(2600000 / (w * h))), 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  /* setSize(..., false) leaves the CSS box alone — the stylesheet owns it.
     Make sure the drawing buffer agrees with it. */
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    renderer.setSize(w, h, false);
  }
  camera.aspect = w / h;
  camera.fov = w < 640 ? 40 : 34;
  camera.updateProjectionMatrix();
  cam.fit = fitDistance();
  cam.dist = clamp(cam.fit * cam.zoom, cam.fit * 0.58, cam.fit * 1.5);
}

/* ---------- cell <-> world ---------- */
function cellPos(i) {
  const [r, c] = rc(i);
  return new THREE.Vector3(c - 3, 0, r - 3);
}

function cellAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({ x: nx, y: ny }, camera);
  if (!raycaster.ray.intersectPlane(groundPlane, tmpVec)) return -1;
  const x = tmpVec.x + 3.5;
  const z = tmpVec.z + 3.5;
  if (x < 0 || x >= 7 || z < 0 || z >= 7) return -1;
  const c = Math.floor(x);
  const r = Math.floor(z);
  return r * N + c;
}

function syncCell(i) {
  if (!boardGroup) return;
  const b = state.grid[i];
  const old = visuals.get(i);
  const key = b ? b.t + '|' + b.l + '|' + (b.roof ? 1 : 0) : 'rubble';
  if (old && old.key === key) return;

  if (old) {
    boardGroup.remove(old.group);
    disposeGroup(old.group);
    visuals.delete(i);
  }

  if (!b) {
    if (!old) return;
    const rub = makeRubble();
    rub.position.copy(cellPos(i));
    rub.position.y = 0.0;
    rub.userData.born = performance.now();
    boardGroup.add(rub);
    visuals.set(i, { key, group: rub });
    return;
  }

  const g = makeBuilding(b.t, b.l, b.roof);
  g.position.copy(cellPos(i));
  g.userData.born = performance.now();
  g.userData.idx = i;
  boardGroup.add(g);
  visuals.set(i, { key, group: g });
}

function disposeGroup(g) {
  g.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
      else o.material.dispose();
    }
  });
}

/* ---------- band visuals ---------- */
function showBand(band) {
  if (!bandMesh) return;
  bandMesh.visible = true;
  bandEdges.visible = true;
  if (band.axis === 'row') {
    bandMesh.position.set(0, 0.012, band.i - 3);
    bandEdges.position.set(0, 0.014, band.i - 3);
    bandMesh.rotation.z = 0;
    bandEdges.rotation.z = 0;
  } else {
    bandMesh.position.set(band.i - 3, 0.012, 0);
    bandEdges.position.set(band.i - 3, 0.014, 0);
    bandMesh.rotation.z = Math.PI / 2;
    bandEdges.rotation.z = Math.PI / 2;
  }
}

function hideBand() {
  if (!bandMesh) return;
  bandMesh.visible = false;
  bandEdges.visible = false;
}

function shakeBand(cells) {
  if (REDUCED) return;
  shakeT = 0.9;
  shakeCells = cells.slice();
  windT = 0;
  if (wind) {
    wind.visible = true;
    wind.material.opacity = 0.26;
  }
}

/* ---------- camera ---------- */
function updateCamera(dt) {
  if (!camera) return;
  const target = new THREE.Vector3(0, cam.lift, 0);
  if (!REDUCED && !dragging && state.morning > 0) {
    cam.az += Math.sin(performance.now() * 0.00018) * dt * 0.02;
  }
  const sp = Math.sin(cam.pol), cp = Math.cos(cam.pol);
  camera.position.set(
    target.x + cam.dist * sp * Math.sin(cam.az),
    target.y + cam.dist * cp,
    target.z + cam.dist * sp * Math.cos(cam.az)
  );
  camera.lookAt(target);
}

/* ---------- input ---------- */
function bindPointer() {
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragging = { x: e.clientX, y: e.clientY, moved: 0, az: cam.az, pol: cam.pol };
    } else if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
      pinchDist = cam.dist;
      dragging = null;
    }
    hideHint();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      cam.dist = clamp(pinchDist * (pinchStart / d), cam.fit * 0.58, cam.fit * 1.5);
      cam.zoom = cam.dist / cam.fit;
      return;
    }

    if (dragging) {
      const dx = e.clientX - dragging.x;
      const dy = e.clientY - dragging.y;
      dragging.moved = Math.max(dragging.moved, Math.hypot(dx, dy));
      if (dragging.moved > 4) {
        cam.az = clamp(dragging.az - dx * 0.008, cam.baseAz - 0.85, cam.baseAz + 0.85);
        cam.pol = clamp(dragging.pol - dy * 0.005, 0.52, 1.22);
        canvas.classList.add('is-dragging');
      }
      return;
    }

    if (e.pointerType === 'mouse') {
      hoverCell = cellAt(e.clientX, e.clientY);
      updateHighlight();
    }
  });

  const end = (e) => {
    const wasDrag = dragging && dragging.moved > 5;
    if (dragging && !wasDrag && pointers.size === 1) {
      const i = cellAt(e.clientX, e.clientY);
      if (i >= 0) place(i);
    }
    pointers.delete(e.pointerId);
    if (pointers.size === 0) { dragging = null; canvas.classList.remove('is-dragging'); }
    else if (pointers.size === 1) {
      const [a] = Array.from(pointers.values());
      dragging = { x: a.x, y: a.y, moved: 6, az: cam.az, pol: cam.pol };
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  canvas.addEventListener('pointerleave', () => {
    if (!dragging) { hoverCell = -1; updateHighlight(); }
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cam.dist = clamp(cam.dist + Math.sign(e.deltaY) * cam.fit * 0.045, cam.fit * 0.58, cam.fit * 1.5);
    cam.zoom = cam.dist / cam.fit;
  }, { passive: false });

  canvas.addEventListener('keydown', (e) => {
    const [r, c] = rc(cursorCell);
    let handled = true;
    if (e.key === 'ArrowUp') cursorCell = ((r + N - 1) % N) * N + c;
    else if (e.key === 'ArrowDown') cursorCell = ((r + 1) % N) * N + c;
    else if (e.key === 'ArrowLeft') cursorCell = r * N + ((c + N - 1) % N);
    else if (e.key === 'ArrowRight') cursorCell = r * N + ((c + 1) % N);
    else if (e.key === 'Enter' || e.key === ' ') place(cursorCell);
    else if (e.key === 'u' || e.key === 'U') upgrade(selectedCell >= 0 ? selectedCell : cursorCell);
    else if (e.key === 'd' || e.key === 'D') buyRoof(selectedCell >= 0 ? selectedCell : cursorCell);
    else if (e.key === 'x' || e.key === 'X') demolish(selectedCell >= 0 ? selectedCell : cursorCell);
    else if (e.key === 'Escape') { selectedCell = -1; selectedType = null; renderInspect(); renderPalette(); }
    else handled = false;
    if (!handled) return;
    e.preventDefault();
    hoverCell = cursorCell;
    updateHighlight();
    const b = state.grid[cursorCell];
    announce(b
      ? t(cellName(cursorCell) + ': ' + DEFS[b.t].de + ', Stufe ' + b.l, cellName(cursorCell) + ': ' + DEFS[b.t].en + ', level ' + b.l)
      : t(cellName(cursorCell) + ': frei', cellName(cursorCell) + ': empty'));
  });

  /* keep the keyboard cursor in view */
  canvas.addEventListener('focus', () => {
    hoverCell = cursorCell;
    updateHighlight();
  });
  canvas.addEventListener('blur', () => {
    hoverCell = -1;
    updateHighlight();
  });
}

function updateHighlight() {
  if (!highlight) return;
  const i = hoverCell >= 0 ? hoverCell : selectedCell;
  if (i < 0) {
    highlight.visible = false;
    if (ghost) ghost.visible = false;
    return;
  }
  highlight.visible = true;
  highlight.position.copy(cellPos(i));
  highlight.position.y = 0.007;

  const b = state.grid[i];
  const color = b ? COL.terra : (selectedType ? COL.sage : COL.ink);
  highlight.children[0].material.color.setHex(color);
  highlight.children[1].material.color.setHex(color);

  if (!b && selectedType && hoverCell >= 0) {
    if (!ghost || ghostType !== selectedType) {
      if (ghost) { boardGroup.remove(ghost); disposeGroup(ghost); }
      ghost = makeGhost(selectedType);
      ghostType = selectedType;
      boardGroup.add(ghost);
    }
    ghost.visible = true;
    ghost.position.copy(cellPos(i));
    ghost.position.y = 0.0;
    const ok = canPay(costOf(selectedType)) && state.known.includes(selectedType);
    ghost.traverse(o => {
      if (o.isMesh || o.isLineSegments) {
        o.material.color.setHex(ok ? COL.sage : COL.terra);
      }
    });
  } else if (ghost) {
    ghost.visible = false;
  }
}

function hideHint() {
  const h = $('#ps-hint');
  if (h) h.classList.add('is-off');
}

function announce(text) {
  const el = $('#ps-live');
  if (el) el.textContent = text;
}

/* ============================================================
   UI
   ============================================================ */
const palette = $('#ps-palette');
const inspect = $('#ps-inspect');
const logEl = $('#ps-log');

const ICONS = {
  mill: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M9 28h18l-3-7H12z" fill="#e8dfcb"/><path d="M12 21h12l-2.5-6h-7z" fill="#f2ebdc"/><path d="M14.5 15h7l-2-5h-3z" fill="#e8dfcb"/><path d="M23 8h2.4v7H23z" fill="#b04f31"/><g fill="none" stroke="#1f1e1d" stroke-opacity=".26" stroke-width="1"><path d="M9 28h18l-3-7H12z"/><path d="M12 21h12l-2.5-6h-7z"/><path d="M14.5 15h7l-2-5h-3z"/></g></svg>',
  pit: '<svg viewBox="0 0 36 36" aria-hidden="true"><ellipse cx="17" cy="22" rx="11" ry="6" fill="#c97a5c"/><ellipse cx="17" cy="21" rx="7" ry="3.4" fill="#8d6b58"/><circle cx="28" cy="14" r="3" fill="#b04f31"/><circle cx="10" cy="12" r="2.2" fill="#c97a5c"/></svg>',
  wall: '<svg viewBox="0 0 36 36" aria-hidden="true"><g fill="#c97a5c" stroke="#1f1e1d" stroke-opacity=".22"><rect x="6" y="21" width="24" height="5"/><rect x="6" y="27" width="24" height="4"/><rect x="7" y="15" width="5" height="5"/><rect x="15.5" y="15" width="5" height="5"/><rect x="24" y="15" width="5" height="5"/></g></svg>',
  pottery: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M14 12h8l-1.6 3c3 2 4.6 5 4.6 8 0 4-3 6-7 6s-7-2-7-6c0-3 1.6-6 4.6-8z" fill="#c97a5c"/><rect x="13" y="9" width="10" height="3" rx="1" fill="#b04f31"/><path d="M14 12h8l-1.6 3c3 2 4.6 5 4.6 8 0 4-3 6-7 6s-7-2-7-6c0-3 1.6-6 4.6-8z" fill="none" stroke="#1f1e1d" stroke-opacity=".24"/></svg>',
  garden: '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="6" y="27" width="24" height="4" rx="1" fill="#e8dfcb"/><path d="M10 27c0-6 3-10 8-10s8 4 8 10z" fill="#4f7a63"/><path d="M18 17v10" stroke="#3c6150" stroke-width="1.4"/><circle cx="11" cy="14" r="3" fill="#7d9b88"/><circle cx="25" cy="13" r="2.4" fill="#7d9b88"/></svg>',
  tower: '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="14" y="13" width="8" height="17" fill="#f2ebdc" stroke="#1f1e1d" stroke-opacity=".24"/><path d="M12 13h12l-6-6z" fill="#b04f31"/><path d="M18 7v-3l5 1.5L18 7z" fill="#4f7a63"/><rect x="11" y="30" width="14" height="3" fill="#e8dfcb"/></svg>',
  press: '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="8" y="14" width="20" height="15" rx="1" fill="#f2ebdc" stroke="#1f1e1d" stroke-opacity=".24"/><rect x="7" y="11" width="22" height="4" rx="1" fill="#c97a5c"/><circle cx="18" cy="11" r="2.2" fill="#b04f31"/><path d="M14 19h8M14 23h8" stroke="#6b665c" stroke-width="1.2"/></svg>',
};

const LBL = {
  out: () => t('Ertrag', 'Yield'),
  level: () => t('Stufe', 'Level'),
  cost: () => t('Kosten', 'Cost'),
  locked: () => t('gesperrt', 'locked'),
  perSec: () => t('/s', '/s'),
};

function costText(cost) {
  return Object.keys(cost).map(k => fmt(cost[k]) + ' ' + resName(k)).join(' · ');
}

function outText(type) {
  const d = DEFS[type];
  if (!Object.keys(d.out).length) {
    if (type === 'tower') return t('+10 % Reihe/Spalte', '+10% row/col');
    if (type === 'wall') return t('Schutz', 'shield');
    return '—';
  }
  return Object.keys(d.out).map(k => '+' + fmt(d.out[k], d.out[k] < 1 ? 2 : 1) + ' ' + resName(k) + LBL.perSec()).join(' · ');
}

function buildPalette() {
  if (!palette) return;
  palette.innerHTML = '';
  for (const id of ORDER) {
    const d = DEFS[id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ps-card';
    btn.dataset.type = id;
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML =
      '<span class="ps-card-icon">' + ICONS[id] + '</span>' +
      '<span class="ps-card-main"><span class="ps-card-name">' + (lang() === 'en' ? d.en : d.de) + '</span>' +
      '<span class="ps-card-cost"></span></span>' +
      '<span class="ps-card-out' + (Object.keys(d.out).length ? '' : ' is-empty') + '">' + outText(id) + '</span>';
    btn.addEventListener('click', () => pickType(id));
    palette.appendChild(btn);
  }
  renderPalette();
}

function pickType(id) {
  if (!state.known.includes(id)) {
    const u = DEFS[id].unlock;
    flash(t('Noch gesperrt: ' + unlockText(u) + '.', 'Still locked: ' + unlockText(u) + '.'), 3000);
    sfx.error();
    return;
  }
  selectedType = selectedType === id ? null : id;
  selectedCell = -1;
  renderInspect();
  renderPalette();
  updateHighlight();
  hideHint();
  if (selectedType) {
    tone(520, 0.06, 'sine', 0.02);
    announce(t(DEFS[id].de + ' gewählt. Tippe auf einen freien Bauplatz.', DEFS[id].en + ' selected. Tap an empty plot.'));
  }
}

function renderPalette() {
  if (!palette) return;
  for (const id of ORDER) {
    const btn = palette.querySelector('[data-type="' + id + '"]');
    if (!btn) continue;
    const known = state.known.includes(id);
    const cost = costOf(id);
    const poor = known && !canPay(cost);
    const costEl = btn.querySelector('.ps-card-cost');

    btn.classList.toggle('is-locked', !known);
    btn.classList.toggle('is-poor', poor);
    btn.setAttribute('aria-pressed', selectedType === id ? 'true' : 'false');
    btn.setAttribute('aria-disabled', known ? 'false' : 'true');

    if (costEl) {
      costEl.textContent = known
        ? costText(cost)
        : t('ab ' + fmt(DEFS[id].unlock.amount) + ' ' + resName(DEFS[id].unlock.key), 'at ' + fmt(DEFS[id].unlock.amount) + ' ' + resName(DEFS[id].unlock.key));
    }
  }
}

function renderInspect() {
  if (!inspect) return;
  const i = selectedCell;
  const b = i >= 0 ? state.grid[i] : null;
  if (!b) {
    inspect.hidden = true;
    inspect.innerHTML = '';
    return;
  }
  inspect.hidden = false;
  const d = DEFS[b.t];
  const bonus = bonusOf(i, b);
  const rate = rateOf(i, b);
  const up = upgradeCost(b);
  const rCost = roofCost();

  let rateLine = '—';
  if (rate) {
    rateLine = Object.keys(rate).map(k => '+' + fmt(rate[k], rate[k] < 10 ? 2 : 1) + ' ' + resName(k) + '/s').join(' · ');
  } else if (b.t === 'tower') {
    rateLine = t('+10 % für Reihe und Spalte', '+10% for row and column');
  } else if (b.t === 'wall') {
    rateLine = t('Schützt die Nachbarn einmal', 'Protects neighbours once');
  }

  const bonusRows = bonus.parts.map(p =>
    '<div><dt>' + p.label + '</dt><dd class="is-pos">+' + Math.round(p.value * 100) + ' %</dd></div>'
  ).join('');

  const upDisabled = b.l >= MAX_LEVEL || !canPay(up);
  const roofDisabled = b.roof || !canPay({ sage: rCost });

  inspect.innerHTML =
    '<div class="ps-ins-head">' +
      '<span class="ps-card-icon">' + ICONS[b.t] + '</span>' +
      '<div class="ps-ins-title"><h3>' + (lang() === 'en' ? d.en : d.de) + '</h3>' +
      '<span>' + LBL.level() + ' ' + b.l + ' / ' + MAX_LEVEL + ' · ' + cellName(i) + '</span></div>' +
      '<button type="button" class="ps-ins-close" aria-label="' + t('Schließen', 'Close') + '">×</button>' +
    '</div>' +
    '<dl class="ps-ins-stats">' +
      '<div><dt>' + LBL.out() + '</dt><dd class="' + (rate ? 'is-pos' : '') + '">' + rateLine + '</dd></div>' +
      bonusRows +
      '<div><dt>' + t('Dach', 'Roof') + '</dt><dd class="' + (b.roof ? 'is-pos' : 'is-warn') + '">' +
        (b.roof ? t('geschützt', 'protected') : t('keins', 'none')) + '</dd></div>' +
      '<div><dt>' + t('Ausbau', 'Upgrade') + '</dt><dd>' +
        (b.l >= MAX_LEVEL ? t('Maximal', 'maxed') : costText(up)) + '</dd></div>' +
    '</dl>' +
    '<div class="ps-ins-actions">' +
      '<button type="button" class="ps-btn ps-btn-accent" data-act="up"' + (upDisabled ? ' disabled' : '') + '>' +
        (b.l >= MAX_LEVEL ? t('Höchste Stufe', 'Maximum level') : t('Ausbauen', 'Upgrade')) +
        (b.l >= MAX_LEVEL ? '' : ' · ' + costText(up)) + '</button>' +
      '<button type="button" class="ps-btn" data-act="roof"' + (roofDisabled ? ' disabled' : '') + '>' +
        (b.roof ? t('Dach vorhanden', 'Roof in place') : t('Dach kaufen', 'Buy roof') + ' · ' + fmt(rCost) + ' ' + resName('sage')) + '</button>' +
      '<button type="button" class="ps-btn ps-btn-danger" data-act="sell">' +
        t('Abriss', 'Demolish') + ' · +' + costText(refundOf(b.t)) + '</button>' +
    '</div>';

  inspect.querySelector('.ps-ins-close').addEventListener('click', () => {
    selectedCell = -1;
    renderInspect();
    updateHighlight();
  });
  const upBtn = inspect.querySelector('[data-act="up"]');
  if (upBtn) upBtn.addEventListener('click', () => upgrade(selectedCell));
  const roofBtn = inspect.querySelector('[data-act="roof"]');
  if (roofBtn) roofBtn.addEventListener('click', () => buyRoof(selectedCell));
  inspect.querySelector('[data-act="sell"]').addEventListener('click', () => demolish(selectedCell));
}

function selectCell(i) {
  selectedCell = i;
  selectedType = null;
  renderInspect();
  renderPalette();
  updateHighlight();
  const b = state.grid[i];
  if (b) {
    const rate = rateOf(i, b);
    announce(t(cellName(i) + ': ' + DEFS[b.t].de + ', Stufe ' + b.l + (rate ? '' : ''), cellName(i) + ': ' + DEFS[b.t].en + ', level ' + b.l));
  }
}

function renderChips() {
  const rates = totalRates();
  for (const k of RES) {
    const el = $('[data-res="' + k + '"]');
    if (el) el.textContent = fmt(Math.floor(state.res[k]));
    const rt = $('[data-rate="' + k + '"]');
    if (rt) rt.textContent = '+' + fmt(rates[k], rates[k] < 10 ? 2 : 1) + '/s';
  }

  const stormEl = $('[data-storm]');
  const chip = $('[data-chip="storm"]');
  if (stormEl) {
    const secs = Math.max(0, Math.ceil(state.storm.t));
    stormEl.textContent = secs + t(' s', ' s');
    if (chip) {
      const soon = secs <= STORM_WARN;
      chip.classList.toggle('is-soon', soon && !!state.storm.band);
      chip.classList.toggle('is-warn', secs <= 3);
    }
  }

  const fameEl = $('[data-fame]');
  if (fameEl) fameEl.textContent = fmt(state.ruhm);
  renderBuff();
}

let buffChip = null;
function renderBuff() {
  const topbar = $('.ps-topbar');
  if (!topbar) return;
  if (!buffChip) {
    buffChip = document.createElement('div');
    buffChip.className = 'ps-chip ps-chip-buff';
    buffChip.setAttribute('data-chip', 'buff');
    buffChip.innerHTML = '<i aria-hidden="true"></i><span class="ps-chip-label">' + t('Morgenlicht', 'Morning light') + '</span><b>0:00</b>';
    topbar.appendChild(buffChip);
  }
  if (state.morning <= 0) {
    buffChip.hidden = true;
    return;
  }
  buffChip.hidden = false;
  const s = Math.ceil(state.morning);
  const b = buffChip.querySelector('b');
  if (b) b.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function renderLog() {
  if (!logEl) return;
  logEl.innerHTML = state.log.map((e, i) =>
    '<span class="' + (i === 0 ? 'is-new ' : '') + (e.kind === 'bad' ? 'is-bad' : '') + '">' + e.text + '</span>'
  ).join('');
}

/* ---------- side buttons ---------- */
function bindSide() {
  $$('[data-tool="pause"]').forEach(btn => {
    btn.setAttribute('aria-pressed', state.paused ? 'true' : 'false');
    btn.addEventListener('click', () => {
      state.paused = !state.paused;
      btn.setAttribute('aria-pressed', state.paused ? 'true' : 'false');
      flash(state.paused ? t('Pause.', 'Paused.') : t('Weiter.', 'Running.'), 1600);
      if (state.paused) saveNow();
    });
  });

  $$('[data-tool="sound"]').forEach(btn => {
    btn.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
    btn.addEventListener('click', () => {
      state.sound = !state.sound;
      btn.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
      if (state.sound) tone(660, 0.1, 'sine', 0.04);
      saveNow();
    });
  });

  $$('[data-tool="view"]').forEach(btn => {
    btn.addEventListener('click', () => {
      cam.az = cam.baseAz;
      cam.pol = 0.80;
      cam.zoom = 1;
      cam.dist = cam.fit;
      flash(t('Ansicht zurückgesetzt.', 'View reset.'), 1600);
    });
  });

  const reset = $('[data-action="reset"]');
  if (reset) {
    let armed = false;
    reset.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        reset.querySelector('span').textContent = t('Wirklich löschen? Noch einmal klicken.', 'Really delete? Click again.');
        reset.classList.add('is-armed');
        setTimeout(() => {
          armed = false;
          reset.querySelector('span').textContent = t('Neues Blatt', 'New sheet');
          reset.classList.remove('is-armed');
        }, 4000);
        return;
      }
      doReset();
      armed = false;
      reset.querySelector('span').textContent = t('Neues Blatt', 'New sheet');
      reset.classList.remove('is-armed');
    });
  }

  const prestige = $('[data-action="prestige"]');
  if (prestige) {
    prestige.addEventListener('click', () => {
      if (!prestigeReady()) {
        const levels = state.grid.reduce((n, b) => n + (b ? b.l : 0), 0);
        flash(t('Noch nicht bereit: 2 Stürme und 12 Gebäudestufen. Du hast ' + state.storms + ' Stürme und ' + levels + ' Stufen.',
          'Not ready: 2 storms and 12 building levels. You have ' + state.storms + ' storms and ' + levels + ' levels.'), 4200);
        return;
      }
      doPrestige();
    });
  }
}

/* ---------- loop ---------- */
let lastFrame = 0;
let raf = 0;

function frame(now) {
  raf = requestAnimationFrame(frame);
  const dt = lastFrame ? Math.min(0.25, (now - lastFrame) / 1000) : 0;
  lastFrame = now;

  if (!state.paused && !document.hidden) simulate(dt);

  /* building drop-in */
  for (const [, v] of visuals) {
    const born = v.group.userData.born || 0;
    const k = REDUCED ? 1 : clamp((now - born) / 380, 0, 1);
    const s = (v.group.userData.bulk || 1) * (1 + 0.055 * ((v.group.userData.level || 1) - 1));
    if (k < 1) {
      const e = 1 + 1.7 * Math.pow(k - 1, 3) + 0.7 * Math.pow(k - 1, 2); // ease-out-back-ish
      v.group.scale.setScalar(Math.max(0.05, e) * s);
    } else if (v.group.scale.x !== s) {
      v.group.scale.setScalar(s);
    }
  }

  /* storm shake */
  if (shakeT > 0 && !REDUCED) {
    shakeT -= dt;
    const amp = Math.max(0, shakeT) * 0.035;
    for (const i of shakeCells) {
      const v = visuals.get(i);
      if (!v) continue;
      v.group.position.x = cellPos(i).x + Math.sin(now * 0.045 + i) * amp;
      v.group.position.z = cellPos(i).z + Math.cos(now * 0.05 + i * 1.7) * amp;
    }
    if (shakeT <= 0) {
      for (const i of shakeCells) {
        const v = visuals.get(i);
        if (v) v.group.position.copy(cellPos(i));
      }
      shakeCells = [];
    }
  }

  /* wind dashes */
  if (windT >= 0 && wind) {
    windT += dt;
    const pos = wind.geometry.attributes.position;
    const band = state.storm.lastBand;
    const dir = band && band.axis === 'row' ? 1 : 0;
    for (let i = 0; i < pos.count; i += 2) {
      let x = pos.getX(i), z = pos.getZ(i);
      if (dir) { x += dt * 6; if (x > 4) { x = -4; } }
      else { z += dt * 6; if (z > 4) { z = -4; } }
      const len = Math.abs(pos.getX(i + 1) - pos.getX(i)) || 0.2;
      pos.setX(i, x); pos.setZ(i, z);
      pos.setX(i + 1, dir ? x + len : x);
      pos.setZ(i + 1, dir ? z : z + len);
    }
    pos.needsUpdate = true;
    wind.material.opacity = Math.max(0, 0.26 - windT * 0.16);
    if (windT > 1.9) { wind.visible = false; windT = -1; }
  }

  /* storm band pulse */
  if (bandMesh && bandMesh.visible) {
    bandMesh.material.opacity = 0.11 + Math.sin(now * 0.006) * 0.05;
  }

  updateCamera(dt);

  /* alert timeout */
  if (alertUntil && now > alertUntil) {
    const el = $('#ps-alert');
    if (el) el.classList.remove('is-on');
    alertUntil = 0;
  }

  if (renderer) renderer.render(scene, camera);
}

/* ---------- boot ---------- */
function boot() {
  loadState();
  checkDay();

  try {
    buildScene();
  } catch (err) {
    const note = document.createElement('div');
    note.className = 'ps-fallback';
    note.innerHTML = '<b>' + t('Dieser Browser kann kein WebGL.', 'This browser cannot run WebGL.') + '</b>' +
      '<span>' + t('Das Spiel braucht Hardwarebeschleunigung. Die Regeln unten gelten trotzdem.', 'The game needs hardware acceleration. The rules below still apply.') + '</span>';
    stage.appendChild(note);
    console.warn('[papierstadt] WebGL unavailable', err);
  }

  for (let i = 0; i < CELLS; i++) syncCell(i);
  buildPalette();
  bindSide();
  if (camera) bindPointer();
  renderChips();
  renderLog();

  if (state.morning > 0) flash(t('Morgenlicht läuft: 50 % mehr Ertrag.', 'Morning light active: 50% more yield.'), 4200);

  if (!state.log.length) {
    log(t('Willkommen auf dem Blatt. Baue zuerst drei Papierwerke.', 'Welcome to the sheet. Start with three paper mills.'), '');
  }

  document.addEventListener('bw:lang', () => {
    buildPalette();
    renderInspect();
    renderLog();
    if (buffChip) {
      const lbl = buffChip.querySelector('.ps-chip-label');
      if (lbl) lbl.textContent = t('Morgenlicht', 'Morning light');
    }
    flash(t('Sprache gewechselt.', 'Language switched.'), 1400);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveNow();
    else lastFrame = 0;
  });
  window.addEventListener('pagehide', saveNow);
  setInterval(saveNow, 5000);

  saveNow();
  raf = requestAnimationFrame(frame);

  /* tiny API for tests and for the curious console */
  window.bwStadt = {
    state: () => state,
    rates: totalRates,
    place: (i, type) => { const prev = selectedType; selectedType = type || prev; place(i); selectedType = prev; },
    cellAt,
    reveal: () => { state.known = ORDER.slice(); renderPalette(); },
    fill: () => boardFill(cam.dist),
    /* world → CSS pixel inside the canvas; used by the end-to-end tests */
    screenOf: (x, y, z) => {
      if (!camera || !canvas) return null;
      const v = new THREE.Vector3(x, y, z).project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: Math.round((v.x * 0.5 + 0.5) * r.width), y: Math.round((-v.y * 0.5 + 0.5) * r.height) };
    },
    info: () => (renderer ? {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      dpr: renderer.getPixelRatio(),
      camera: { az: cam.az, pol: cam.pol, dist: +cam.dist.toFixed(2), fit: +cam.fit.toFixed(2), aspect: +camera.aspect.toFixed(3), fov: camera.fov },
      objects: boardGroup ? boardGroup.children.length : 0,
    } : null),
    tick: (seconds) => {
      const step = 1 / 30;
      for (let s = 0; s < seconds; s += step) simulate(step);
      renderChips();
      return { res: state.res, rates: totalRates() };
    },
  };
}

if (canvas && stage) {
  try {
    boot();
  } catch (err) {
    console.error('[papierstadt] boot failed', err);
  }
}
