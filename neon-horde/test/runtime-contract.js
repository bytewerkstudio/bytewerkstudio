#!/usr/bin/env node
/* ============================================================
 * NEON HORDE — Runtime Contract Check (verlässlich)
 * Lädt alle VORHANDENEN Module im Sandbox-Kontext (wie smoke.js)
 * und prüft die Export-Funktionen gegen den api.js-Vertrag.
 * Fehlende Dateien zählen als SKIP (dürfen während R2 fehlen).
 * Aufruf: node test/runtime-contract.js
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const ORDER = [
  'loader.js', 'balance.js', 'api.js', 'lang.js',
  'audio.js', 'input.js', 'save.js', 'meta.js',
  'entities.js', 'weapons.js', 'waves.js', 'shop.js',
  'ui.js', 'game.js', 'main.js',
];

const EXPECTED = {
  audio: ['unlock', 'sfx', 'setVolume'],
  input: ['init', 'keys', 'axis', 'pointer', 'any'],
  save: ['load', 'save', 'reset'],
  meta: ['addBank', 'bank', 'shards', 'prestige', 'shardBonus', 'operatorLevel', 'operatorCheck',
         'dailyInfo', 'claimDaily', 'offlineReward', 'weeklyInfo', 'weeklyAdd', 'weeklyNew',
         'checkAchievements', 'claimAchievement', 'achProgress', 'runStatsUpdate', 'prestigeCost', 'doPrestige'],
  ents: ['reset', 'spawnEnemy', 'spawnBoss', 'spawnProjectile', 'chainFrom', 'spawnTurret',
         'spawnMineRing', 'spawnPickup', 'damageEnemy', 'killEnemy', 'update', 'render',
         'slowFactorAt', 'playerPos', 'activeBoss'],
  weapons: ['stats', 'update', 'target', 'fire', 'owned'],
  waves: ['budget', 'hpMult', 'dmgMult', 'speedMult', 'isBossWave', 'buildQueue', 'pickType',
          'waveBonus', 'bossBonus', 'recomputeBoss'],
  shop: ['open', 'close', 'reroll', 'buyWeapon', 'buyUpgrade', 'sellWeapon', 'startNextWave'],
  ui: ['init', 'updateHUD', 'showScreen', 'hideScreens', 'toast', 'banner', 'overlayOpen',
       'overlayClose', 'confirm', 'modal', 'renderAll'],
  game: ['init', 'state', 'run', 'player', 'startRun', 'resumeRun', 'enterShop', 'startNextWave',
         'addScrap', 'spendScrap', 'damagePlayer', 'gameOver', 'update', 'render',
         'hitstop', 'shake', 'scrapMultiplier', 'dpsMultiplier', 'addHitStop'],
  main: ['boot'],
};

/* ---------- Stubs (vereinfacht, aber ausreichend für Laden + Export-Prüfung) ---------- */
function makeEl(tag) {
  return {
    tagName: tag, children: [], style: {}, dataset: {}, attrs: {}, classList: {
      add() {}, remove() {}, contains() { return false; }, toggle() {},
    }, _text: '', _html: '',
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); },
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); this._text = String(v).replace(/<[^>]*>/g, ''); },
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild() {}, insertBefore() {}, addEventListener() {}, removeEventListener() {},
    contains() { return false; }, focus() {}, blur() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 720 }; },
    parentNode: null, firstChild: null, nextSibling: null,
  };
}
const ctxStub = new Proxy({}, { get(t, k) { if (k === 'measureText') return () => ({ width: 10 }); return () => {}; }, set() { return true; } });
const rafQueue = [];
function makeCanvasEl() {
  const el = makeEl('canvas');
  el.width = 1280; el.height = 720;
  el.getContext = () => ctxStub;
  return el;
}
const canvasEl = makeCanvasEl();
const doc = {
  createElement: makeEl, createTextNode: (t) => ({ nodeType: 3, text: String(t) }),
  querySelector: (sel) => (sel === '#game-canvas' ? canvasEl : null),
  querySelectorAll: () => [],
  getElementById: () => null, addEventListener() {}, removeEventListener() {},
  head: makeEl('head'), body: makeEl('body'), documentElement: makeEl('html'), hidden: false,
};
const store = {};
const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => {} };
class AC { constructor() { this.currentTime = 0; this.destination = {}; this.state = 'running'; } resume() { return Promise.resolve(); } createOscillator() { return { frequency: { setValueAtTime() {} }, type: 'square', connect() {}, start() {}, stop() {}, disconnect() {} }; } createGain() { return { gain: { setValueAtTime() {}, value: 1 }, connect() {}, disconnect() {} }; } createFilter() { return { frequency: { setValueAtTime() {} }, connect() {}, disconnect() {} }; } createBufferSource() { return { connect() {}, start() {}, stop() {} }; } createBuffer() { return { getChannelData: () => new Float32Array(4) }; } createWaveShaper() { return { connect() {}, disconnect() {} }; } createCompressor() { return { connect() {}, disconnect() {} }; } }
const sandbox = {
  window: null, document: doc, navigator: { language: 'de-DE' }, localStorage,
  AudioContext: AC, webkitAudioContext: AC, requestAnimationFrame: (cb) => rafQueue.push(cb),
  cancelAnimationFrame() {}, performance: { now: () => Date.now() },
  console, Math, JSON, Object, Array, String, Number, Boolean, Date, Set, Map, Promise,
  setTimeout, clearTimeout, setInterval, clearInterval,
  location: { href: 'file:///test' }, screen: { width: 1280, height: 720 }, devicePixelRatio: 1,
  addEventListener() {}, removeEventListener() {},
};

const global = vm.runInNewContext('this', sandbox);
sandbox.window = global;
global.document = doc;

let failed = false;
let skipped = 0, checked = 0;
for (const f of ORDER) {
  const mod = f.replace('.js', '');
  const file = path.join(SRC, f);
  if (!fs.existsSync(file)) {
    console.log('SKIP  ' + mod + '.js fehlt (noch nicht geschrieben)');
    skipped++;
    continue;
  }
  const code = fs.readFileSync(file, 'utf8');
  try {
    vm.runInNewContext(code, sandbox, { filename: f });
  } catch (e) {
    console.log('FAIL  ' + mod + '.js ladet nicht: ' + (e && e.message ? e.message : e));
    failed = true;
    continue;
  }
  checked++;
  const exp = EXPECTED[mod];
  if (!exp) continue;
  const nh = global.NH && global.NH[mod];
  // Daten-Eigenschaften (z.B. keys/axis/pointer bei input) sind keine Funktionen
  const DATA_PROPS = {
    input: ['keys', 'axis', 'pointer'],
    game: ['state', 'run', 'player', 'hitstop', 'shake', 'bossWarn'],
  };
  // Lazy-Eigenschaften: werden erst zur Laufzeit (Run-Start) befüllt, beim Laden ok
  const LAZY_PROPS = { game: ['run'] };
  const missing = exp.filter((n) => {
    if (!nh) return true;
    if (typeof nh[n] === 'function') return false;
    if (DATA_PROPS[mod] && DATA_PROPS[mod].includes(n)) {
      if (nh[n] !== undefined && nh[n] !== null) return false;
      return !(LAZY_PROPS[mod] && LAZY_PROPS[mod].includes(n));
    }
    return true;
  });
  if (missing.length) {
    console.log('FAIL  ' + mod + '.js fehlt zur Laufzeit: ' + missing.join(', ') + (nh ? '' : ' (NH.' + mod + ' existiert nicht)'));
    failed = true;
  } else {
    console.log('PASS  ' + mod + '.js: alle ' + exp.length + ' Exporte zur Laufzeit vorhanden');
  }
}
// Top-Level-Exporte (z.B. NH.disp von ui.js)
const TOP_LEVEL = { ui: ['disp'] };
for (const [mod, names] of Object.entries(TOP_LEVEL)) {
  const nh = global.NH;
  const missing = names.filter((n) => typeof nh[n] !== 'function');
  if (missing.length) {
    console.log('FAIL  ' + mod + '.js fehlt top-level: ' + missing.join(', '));
    failed = true;
  } else {
    console.log('PASS  ' + mod + '.js: top-level ' + names.join(', ') + ' vorhanden');
  }
}
console.log('\nruntime-contract: ' + (failed ? 'FEHLGESCHLAGEN' : 'OK') + ' | geprüft: ' + checked + ', übersprungen: ' + skipped);
process.exitCode = failed ? 1 : 0;