#!/usr/bin/env node
/* ============================================================
 * NEON HORDE — Smoke-Test-Harness (Node, ohne Browser)
 * Stubbt DOM/Canvas/Audio/localStorage und führt die Module
 * in Ladereihenfolge aus; prüft Boot, Run-Start, Spawn, Frames.
 * Aufruf: node test/smoke.js [--frames N]
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
const FRAMES = process.argv.includes('--frames') ? parseInt(process.argv[process.argv.indexOf('--frames') + 1], 10) : 30;

/* ---------- minimale Stubs ---------- */
function makeEl(tag) {
  const el = {
    tagName: tag, children: [], style: {}, dataset: {}, attrs: {},
    classList: { _s: new Set(),
      add: function () { for (const c of arguments) this._s.add(c); },
      remove: function () { for (const c of arguments) this._s.delete(c); },
      contains: function (c) { return this._s.has(c); },
      toggle: function (c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } },
    _text: '', _html: '',
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); this._text = String(v).replace(/<[^>]*>/g, ''); },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    appendChild(c) { this.children.push(c); if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; },
    insertBefore(c, ref) { this.appendChild(c); return c; },
    addEventListener() {},
    removeEventListener() {},
    contains() { return false; },
    focus() {}, blur() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 720, x: 0, y: 0 }; },
    parentNode: null, firstChild: null, nextSibling: null,
  };
  return el;
}

const ctxStub = new Proxy({}, {
  get(t, k) {
    if (k === 'canvas' || k === 'measureText') return k === 'measureText' ? () => ({ width: 10 }) : {};
    if (typeof k === 'string') return () => {};
    return undefined;
  },
  set() { return true; },
});

const rafQueue = [];
const raf = (cb) => { rafQueue.push(cb); return rafQueue.length; };

const canvasStub = Object.assign(makeEl('canvas'), {
  width: 1280, height: 720,
  getContext: () => ctxStub,
});

const doc = {
  createElement: makeEl,
  createTextNode: (t) => ({ nodeType: 3, text: String(t), parentNode: null }),
  querySelector: (sel) => (sel === '#game-canvas' ? canvasStub : null),
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener() {},
  removeEventListener() {},
  head: makeEl('head'), body: makeEl('body'), documentElement: makeEl('html'),
  _readyState: 'complete',
  get readyState() { return this._readyState; },
  hidden: false,
};

const nav = { language: 'de-DE', userAgent: 'smoke', platform: 'Node' };

const store = {};
const localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; },
};

class AudioContextStub {
  constructor() { this.currentTime = 0; this.destination = {}; this.state = 'running'; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  createOscillator() { return { frequency: { setValueAtTime() {}, value: 0 }, type: 'square', connect() {}, start() {}, stop() {}, disconnect() {} }; }
  createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, value: 1 }, connect() {}, disconnect() {} }; }
  createFilter() { return { frequency: { setValueAtTime() {}, value: 0 }, type: 'lowpass', Q: { value: 1 }, connect() {}, disconnect() {} }; }
  createBufferSource() { return { buffer: null, connect() {}, start() {}, stop() {}, playbackRate: { value: 1 } }; }
  createBuffer() { return { getChannelData: () => new Float32Array(10) }; }
  createWaveShaper() { return { curve: null, connect() {}, disconnect() {} }; }
  createCompressor() { return { connect() {}, disconnect() {} }; }
}

const sandbox = {
  window: null, document: doc, navigator: nav, localStorage,
  AudioContext: AudioContextStub, webkitAudioContext: AudioContextStub,
  requestAnimationFrame: raf, cancelAnimationFrame() {},
  performance: { now: () => Date.now() },
  console, Math, JSON, Object, Array, String, Number, Boolean, Date, Set, Map, Promise,
  setTimeout, clearTimeout, setInterval, clearInterval,
  location: { href: 'file:///test', reload() {} },
  screen: { width: 1280, height: 720 },
  devicePixelRatio: 1,
  addEventListener() {}, removeEventListener() {},
};

/* ---------- Modul-Exekution ---------- */
function load(file) {
  const p = path.join(SRC, file);
  if (!fs.existsSync(p)) {
    console.log('SKIP  ' + file + ' fehlt (noch nicht geschrieben)');
    return false;
  }
  const code = fs.readFileSync(p, 'utf8');
  vm.runInNewContext(code, sandbox, { filename: file });
  return true;
}

function main() {
  // window == globalThis des Sandbox-Kontextes
  const { runInNewContext } = vm;
  const global = runInNewContext('this', sandbox);
  sandbox.window = global;
  global.document = doc;

  let msgs = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => msgs.push('log: ' + a.join(' '));
  console.error = (...a) => msgs.push('err: ' + a.join(' '));

  try {
    for (const f of ORDER) load(f);
    const NH = global.NH;
    if (!NH) throw new Error('NH-Namespace fehlt');

    // Syntax + Boot
    NH.main.boot();
    const bootErrs = msgs.filter((m) => m.startsWith('err:'));
    if (bootErrs.length) console.error('BOOT-FEHLER:\n' + bootErrs.join('\n'));

    // Ein paar Frames laufen lassen (Menu)
    pump(2);

    // Run starten
    if (typeof NH.game.startRun !== 'function') throw new Error('game.startRun fehlt');
    // Ersten Lauf-Tutorial überspringen (sonst bleibt state=MENU bis Tutorial durchgeklickt)
    if (NH.save.data && NH.save.data.lifetime) NH.save.data.lifetime.runs = 1;
    NH.game.startRun(true);
    NH.game.startNextWave?.(false);
    pump(20);

    // Assertions
    const asserts = [];
    asserts.push(['game.state RUN/SHOP (aktuell: ' + NH.game.state + ')', NH.game.state === 'run' || NH.game.state === 'shop']);
    asserts.push(['run.scrap >= 0', typeof NH.game.run.scrap === 'number' && NH.game.run.scrap >= 0]);
    asserts.push(['blaster vorhanden', Array.isArray(NH.game.run.weapons) && NH.game.run.weapons.some((w) => w.id === 'blaster')]);
    asserts.push(['ents wirksam', NH.ents && Array.isArray(NH.ents.enemies)]);
    asserts.push(['balance 10 Waffen', NH.balance.weapons.length === 10]);
    asserts.push(['balance 9 Gegner + 2 Bosse', NH.balance.enemies.length === 9 && NH.balance.bosses.length === 2]);
    asserts.push(['lang de geladen', NH.t('ui.play') === 'Spielen' || NH.t('ui.play') === 'Play']);

    let failed = 0;
    // Zuerst alle gesammelten Log-/Error-Zeilen ausgeben, sonst sieht man nichts
    for (const m of msgs) origLog(m);

    for (const [name, ok] of asserts) {
      origLog((ok ? 'PASS' : 'FAIL') + '  ' + name);
      if (!ok) failed++;
    }

    // Alle Module vorhanden?
    for (const f of ORDER) {
      if (!fs.existsSync(path.join(SRC, f))) {
        origLog('FAIL  Datei fehlt: ' + f);
        failed++;
      } else {
        origLog('PASS  Datei da: ' + f);
      }
    }

    origLog('\nsmoke: ' + (failed === 0 && bootErrs.length === 0 ? 'OK' : 'FEHLGESCHLAGEN (' + failed + ' Assert-Fehler, ' + bootErrs.length + ' Boot-Errors)'));
    process.exitCode = failed || bootErrs.length ? 1 : 0;
  } catch (e) {
    console.error('SMOKE-CRASH: ' + (e && e.stack ? e.stack : e));
    process.exitCode = 1;
  } finally {
    console.log = origLog;
    console.error = origErr;
  }

  function pump(n) {
    for (let i = 0; i < n; i++) {
      const cb = rafQueue.shift();
      if (cb) cb(performance.now() + i * 16);
    }
  }
}

main();