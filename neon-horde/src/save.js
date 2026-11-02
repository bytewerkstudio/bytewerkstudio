/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * save.js — localStorage-Persistenz (Key 'bytewerk_neonhorde_v1')
 * Debounced 500 ms, kompaktes JSON, nie im Frame speichern.
 * Blockiert (Disabled/Quota) -> In-Memory-Fallback + blocked=true
 * + Toast 'nh:toast' {text: err.saveBlocked, color:'#ff6b6b'}.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  const KEY = 'bytewerk_neonhorde_v1';
  const DEBOUNCE_MS = 500;
  const TOAST_COLOR = '#ff6b6b';
  const TOAST_GAP_MS = 5000;      // Blockade-Toast nicht spammen
  const RUNSAVE_MAX_WEAPONS = 10;

  let data = _default();
  let _ok = null;                 // Speicher prüfbar? null = ungeprüft
  let _timer = null;              // Debounce-Timer
  let _lastToastAt = 0;
  let _unloadBound = false;

  /* ---------- Default-Datenstruktur (verbindlich, exakt diese Felder) ---------- */
  function _default() {
    return {
      bank: 0,
      shards: { hp: 0, dmg: 0, speed: 0, startscrap: 0, wlevel: 0 },
      prestige: 0,
      lastDaily: 0, streak: 0, dayIndex: 0, claimedToday: false, offlineTs: 0,
      weekly: { key: '', id: '', progress: 0, done: false },
      settings: { sound: true, shake: true, lang: (NH.lang && NH.lang.current === 'de') ? 'de' : 'en' },
      lifetime: { kills: 0, bankTotal: 0, maxWave: 0, bestCombo: 0, weaponsMax: 0, bossesKilled: 0, prestiges: 0, runs: 0, weekliesDone: 0 },
      achievements: {},
      runSave: null,
    };
  }

  function _obj(v) { return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; }

  /* Default + geladenen Stand zusammenführen: fehlende Felder auffüllen,
     vorhandene Werte (Bank, Shards, Fortschritt) behalten. */
  function _fill(def, src) {
    if (!src || typeof src !== 'object') return def;
    const out = Object.assign({}, def);
    for (const k in src) {
      if (k !== 'shards' && k !== 'settings' && k !== 'lifetime' && k !== 'weekly') out[k] = src[k];
    }
    out.shards = Object.assign({}, def.shards, _obj(src.shards));
    out.settings = Object.assign({}, def.settings, _obj(src.settings));
    out.lifetime = Object.assign({}, def.lifetime, _obj(src.lifetime));
    out.weekly = Object.assign({}, def.weekly, _obj(src.weekly));
    out.achievements = _obj(src.achievements);
    out.runSave = (src.runSave && typeof src.runSave === 'object') ? src.runSave : null;
    return out;
  }

  /* localStorage erreichbar? (SecurityError beim Probe -> blockiert) */
  function _canStore() {
    if (_ok === null) {
      try {
        if (typeof window === 'undefined' || !window.localStorage) throw new Error('no localStorage');
        const s = window.localStorage;
        const t = '__nh_probe__';
        s.setItem(t, '1');
        s.removeItem(t);
        _ok = true;
      } catch (e) { _ok = false; }
    }
    return _ok;
  }

  function _toastBlocked() {
    const now = Date.now();
    if (now - _lastToastAt < TOAST_GAP_MS) return;
    _lastToastAt = now;
    NH.events.emit('nh:toast', { text: NH.t('err.saveBlocked'), color: TOAST_COLOR });
  }

  /* Synchron schreiben; false wenn nicht persistiert (Daten bleiben in memory) */
  function _write() {
    if (!_canStore()) {
      NH.save.blocked = true;
      _toastBlocked();
      return false;
    }
    let raw;
    try { raw = JSON.stringify(data); }
    catch (e) { return false; }
    try {
      window.localStorage.setItem(KEY, raw);
      NH.save.blocked = false;
      return true;
    } catch (e) {
      _ok = false;                 // Quota/Disabled ab jetzt
      NH.save.blocked = true;
      _toastBlocked();
      return false;
    }
  }

  function _debounced() {
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(() => { _timer = null; _write(); }, DEBOUNCE_MS);
  }

  function _flushNow() {
    if (_timer) { clearTimeout(_timer); _timer = null; }
    _write();
  }

  /* Settings nach dem Laden anwenden: Sprache, Sound/Shake aktivieren.
     Shake-Konsument (game.js) liest settings.shake live aus
     NH.save.data — gleiches Muster wie audio.js bei settings.sound. */
  function _applySettings() {
    const s = data.settings;
    if (s.lang === 'de' || s.lang === 'en') NH.lang.set(s.lang);
    if (NH.audio) {
      try {
        NH.audio.enabled = !!s.sound;
        if (typeof NH.audio.setVolume === 'function') NH.audio.setVolume(s.sound ? 1 : 0);
      } catch (e) { /* Audio erst nach First-Gesture verfügbar */ }
    }
  }

  /* Letzten (noch debounced) Stand beim Tab-Schließen sichern */
  function _bindUnload() {
    if (_unloadBound || typeof window === 'undefined' || !window.addEventListener) return;
    _unloadBound = true;
    const sync = () => {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      _write();
    };
    window.addEventListener('beforeunload', sync);
    window.addEventListener('pagehide', sync);
  }

  /* ---------- Öffentliche API ---------- */
  NH.save = {
    KEY: KEY,
    blocked: false,
    data: data,

    /* Gibt Daten aus localStorage (Default bei Fehler/Blockade); wendet Settings an */
    load() {
      let src = null;
      const blocked = !_canStore();
      if (!blocked) {
        try {
          const raw = window.localStorage.getItem(KEY);
          if (raw !== null) src = JSON.parse(raw);   // kaputtes JSON -> Default
        } catch (e) { src = null; }
      }
      data = _fill(_default(), src);
      NH.save.data = data;
      NH.save.blocked = blocked;
      if (blocked) _toastBlocked();
      _applySettings();
      _bindUnload();
      return data;
    },

    /* Debounced 500 ms speichern; ruft meta.operatorCheck() NICHT selbst */
    save: _debounced,

    /* Kompletter Reset auf Default + sofort speichern (UI fragt vorher) */
    reset() {
      data = _default();
      NH.save.data = data;
      _flushNow();
      _applySettings();
      NH.events.emit('nh:meta');
    },

    /* Run-Snapshot sichern (Auto-Save bei Shop-Öffnung) — synchron, damit
       die Fortsetzung garantiert überlebt. */
    runSaveSpeichern(runSnapshot) {
      if (!runSnapshot || typeof runSnapshot !== 'object') return;
      const buffs = { hp: 0, speed: 0, regen: 0, magnet: 0, dodge: 0, crit: 0 };
      const b = _obj(runSnapshot.buffs);
      for (const k in buffs) buffs[k] = Math.max(0, (k === 'hp' ? ((b.hp | 0) || 0) : ((b[k] | 0) || 0)));
      data.runSave = {
        wave: Math.max(1, runSnapshot.wave | 0),
        scrap: Math.max(0, runSnapshot.scrap | 0),
        hp: Math.max(0, runSnapshot.hp | 0),
        maxHP: Math.max(1, runSnapshot.maxHP | 0),
        weapons: Array.isArray(runSnapshot.weapons)
          ? runSnapshot.weapons.slice(0, RUNSAVE_MAX_WEAPONS).map((w) => ({ id: String(w && w.id !== undefined ? w.id : ''), level: Math.max(1, (w && w.level) | 0) }))
          : [],
        buffs: buffs,
        stats: _obj(runSnapshot.stats),
        shardBonuses: _obj(runSnapshot.shardBonuses),
        timestamp: Date.now(),
      };
      _flushNow();
    },

    /* Geladener Run-Snapshot (tiefe Kopie) oder null */
    runSaveLaden() {
      if (!data.runSave || typeof data.runSave !== 'object') return null;
      try { return JSON.parse(JSON.stringify(data.runSave)); }
      catch (e) { return null; }
    },

    /* Run-Snapshot löschen + sofort speichern */
    runSaveLoeschen() {
      if (data.runSave === null) return;
      data.runSave = null;
      _flushNow();
    },
  };
})();