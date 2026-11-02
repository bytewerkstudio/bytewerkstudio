/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * audio.js — WebAudio-Synth-Sound (keine externen Dateien)
 *
 * Vertrag (api.js):
 *   NH.audio.unlock()        erzeugt/resumt AudioContext (User-Geste, iOS)
 *   NH.audio.sfx(name,opts)  synth-SFX (25 Namen + bgm Drone)
 *   NH.audio.setVolume(v)    0..1
 *   NH.audio.enabled         bool, prüft save.data.settings.sound
 *
 * Design: Der Audio-Kern ist komplett lazy — beim Skript-Laden wird
 * nichts erstellt und nichts gespielt. Alles läuft hinter try/catch;
 * ohne AudioContext oder vor dem ersten Unlock ist jedes Modul ein
 * stiller No-Op, der nie wirft.
 * Juice: Jede Waffe hat einen eigenen Klangcharakter, alle Schüsse
 * erhalten zufällige Pitch-Variation, der kill-Sound steigt mit der
 * Combo.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  const A = {};
  let ctx = null;       // AudioContext (lazy, erst in unlock())
  let master = null;    // Master-Gain -> destination = 0.8 * Nutzer-Lautstärke
  let noiseBuf = null;  // 0.5 s weißes Rauschen (gefiltert für Percussion)
  let vol = 1;          // Nutzer-Lautstärke 0..1
  let sfxScale = 1;     // optionale Einzel-Lautstärke (opts.vol)
  let drone = null;     // laufender BGM-Drone {o1, o2, g}
  let unlocked = false; // erste User-Geste registriert

  /* ---------- Kern ---------- */

  function ensureCtx() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8; // Vertrag: masterGain 0.8
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) {
      ctx = null; master = null; noiseBuf = null;
    }
    return ctx;
  }

  // Nur spielen, wenn ein laufender Context existiert (iOS: erst nach unlock)
  function ready() {
    return !!(ctx && master && ctx.state === 'running');
  }

  function applyMaster() {
    if (!master || !ctx) return;
    try { master.gain.setTargetAtTime(0.8 * vol, ctx.currentTime, 0.02); }
    catch (e) { master.gain.value = 0.8 * vol; }
  }

  // Hüllkurve: 0.0001 -> peak (Attack) -> 0.0001 (Decay), exp. — klickfrei
  function env(g, t0, peak, atk, dec) {
    peak = Math.max(0.0001, peak);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + Math.max(0.001, atk));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.02, dec));
  }

  function tone(o) {
    // o: {type, f0, f1?, slideT?, t0, dur, vol, atk?, dec?, detune?}
    if (!ready()) return;
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    const f0 = Math.max(20, o.f0 || 220);
    const f1 = Math.max(20, o.f1 !== undefined ? o.f1 : f0);
    osc.frequency.setValueAtTime(f0, o.t0);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, o.t0 + (o.slideT || o.dur));
    if (o.detune) osc.detune.value = o.detune;
    const g = ctx.createGain();
    env(g, o.t0, (o.vol || 0.08) * sfxScale, o.atk !== undefined ? o.atk : 0.004, o.dec !== undefined ? o.dec : o.dur);
    osc.connect(g); g.connect(master);
    osc.start(o.t0);
    osc.stop(o.t0 + o.dur + 0.1);
    osc.onended = function () {
      try { osc.disconnect(); g.disconnect(); } catch (e) {}
    };
  }

  function noise(o) {
    // o: {t0, dur, vol, atk?, dec?, freq?, freq1?, filter?, q?}
    if (!ready() || !noiseBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    let node = src;
    if (o.freq || o.freq1) {
      const f = ctx.createBiquadFilter();
      f.type = o.filter || 'lowpass';
      f.Q.value = o.q || 0.8;
      f.frequency.setValueAtTime(o.freq || 1000, o.t0);
      if (o.freq1) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.freq1), o.t0 + o.dur);
      src.connect(f); node = f;
    }
    const g = ctx.createGain();
    env(g, o.t0, (o.vol || 0.06) * sfxScale, o.atk !== undefined ? o.atk : 0.005, o.dec !== undefined ? o.dec : o.dur);
    node.connect(g); g.connect(master);
    src.start(o.t0);
    src.stop(o.t0 + o.dur + 0.1);
    src.onended = function () {
      try { src.disconnect(); g.disconnect(); } catch (e) {}
    };
  }

  // Pitch-Variation: zufällig +/- cents (jeder Schuss klingt anders)
  function pv(f, cents) {
    return f * Math.pow(2, (Math.random() * 2 - 1) * cents / 1200);
  }

  /* ---------- BGM: optionaler Drone-Layer (2 detuned Osc, sehr leise) ---------- */

  function startDrone() {
    if (drone || !ready()) return; // nur bei aktivem AudioContext
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.5); // weiches Einschweben
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 220; f.Q.value = 0.4;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.type = 'sawtooth'; o1.frequency.value = 55; o1.detune.value = -9;
    o2.type = 'sawtooth'; o2.frequency.value = 55; o2.detune.value = 9;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(master);
    o1.start(); o2.start();
    drone = { o1: o1, o2: o2, g: g };
  }

  function stopDrone() {
    if (!drone) return;
    const d = drone; drone = null;
    try {
      d.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
      const at = ctx.currentTime + 1.2;
      d.o1.stop(at); d.o2.stop(at);
      d.o1.onended = function () { try { d.o1.disconnect(); } catch (e) {} };
      d.o2.onended = function () { try { d.o2.disconnect(); } catch (e) {} };
    } catch (e) {}
  }

  /* ---------- Sound-Table: alle Vertragsnamen ---------- */

  const SOUNDS = {
    // Blaster: kerniger square-Pew mit harmonischem Körper
    shoot_blaster: function (o, t) {
      const f = pv(430, 60);
      tone({ type: 'square', f0: f, f1: f * 0.42, t0: t, dur: 0.10, vol: 0.09, atk: 0.003, dec: 0.09 });
      tone({ type: 'sine', f0: f * 0.5, f1: f * 0.22, t0: t, dur: 0.08, vol: 0.08, atk: 0.003, dec: 0.07 });
    },
    // Scattergun: dumpfer Chunk + Noise-Puff (5 Kugeln wirken als ein Schlag)
    shoot_scattergun: function (o, t) {
      const f = pv(240, 80);
      tone({ type: 'square', f0: f, f1: f * 0.55, t0: t, dur: 0.13, vol: 0.10, atk: 0.002, dec: 0.12 });
      noise({ t0: t, dur: 0.12, vol: 0.07, atk: 0.002, dec: 0.11, freq: 1600, freq1: 300 });
    },
    // Piercer: schneller, hoher Sawtooth-Zing
    shoot_piercer: function (o, t) {
      const f = pv(980, 80);
      tone({ type: 'sawtooth', f0: f, f1: f * 0.35, t0: t, dur: 0.16, vol: 0.07, atk: 0.004, dec: 0.14 });
      tone({ type: 'sine', f0: f * 1.5, f1: f * 0.5, t0: t, dur: 0.10, vol: 0.05, atk: 0.004, dec: 0.08 });
    },
    // Chainbolt: elektrischer Doppel-Zap + bandgefiltertes Knistern
    shoot_chainbolt: function (o, t) {
      const f = pv(1300, 150);
      tone({ type: 'square', f0: f, f1: f * 0.3, t0: t, dur: 0.11, vol: 0.06, atk: 0.002, dec: 0.10 });
      tone({ type: 'sawtooth', f0: f * 1.3, f1: f * 0.25, t0: t + 0.02, dur: 0.12, vol: 0.05, atk: 0.002, dec: 0.11 });
      noise({ t0: t, dur: 0.09, vol: 0.05, freq: 3000, filter: 'bandpass', q: 6 });
    },
    // Triplaser: drei versetzte Strahlen als Akkord
    shoot_triplaser: function (o, t) {
      [1, 1.19, 1.42].forEach(function (m, i) {
        const f = pv(720 * m, 50);
        tone({ type: 'sine', f0: f, f1: f * 0.5, t0: t + i * 0.025, dur: 0.10, vol: 0.06, atk: 0.003, dec: 0.08 });
      });
    },
    // Nova: tiefer Sine-Boom + Noise-Explosion
    shoot_nova: function (o, t) {
      tone({ type: 'sine', f0: pv(300, 50), f1: 70, t0: t, dur: 0.35, vol: 0.12, atk: 0.008, dec: 0.32 });
      noise({ t0: t, dur: 0.32, vol: 0.08, atk: 0.008, dec: 0.30, freq: 900, freq1: 120 });
      tone({ type: 'triangle', f0: 160, f1: 60, t0: t, dur: 0.30, vol: 0.08, atk: 0.005, dec: 0.28 });
    },
    // Tesla: Absetzdrohne + heller Zap
    shoot_tesla: function (o, t) {
      tone({ type: 'sine', f0: pv(90, 40), f1: 55, t0: t, dur: 0.22, vol: 0.09, atk: 0.02, dec: 0.20 });
      tone({ type: 'square', f0: pv(1400, 200), f1: 200, t0: t + 0.06, dur: 0.14, vol: 0.05, atk: 0.002, dec: 0.12 });
      noise({ t0: t + 0.05, dur: 0.12, vol: 0.05, freq: 2500, filter: 'bandpass', q: 4 });
    },
    // Flamer: Rausch-Whoosh (fällt ab) + tiefes Sägen
    shoot_flamer: function (o, t) {
      noise({ t0: t, dur: 0.28, vol: 0.08, atk: 0.01, dec: 0.25, freq: 1400, freq1: 300 });
      tone({ type: 'sawtooth', f0: pv(160, 50), f1: 70, t0: t, dur: 0.26, vol: 0.06, atk: 0.015, dec: 0.23 });
      noise({ t0: t + 0.05, dur: 0.20, vol: 0.05, freq: 500, filter: 'highpass', q: 1 });
    },
    // Mines: zwei kurze Pop-Ticks (Mine auswerfen)
    shoot_mines: function (o, t) {
      const f = pv(340, 90);
      tone({ type: 'square', f0: f, f1: f * 0.6, t0: t, dur: 0.09, vol: 0.08, atk: 0.002, dec: 0.08 });
      tone({ type: 'sine', f0: f * 0.5, f1: f * 0.25, t0: t + 0.05, dur: 0.08, vol: 0.06, atk: 0.002, dec: 0.07 });
    },
    // Railgun: massiver Noise-Slam + brüllender Sweep
    shoot_railgun: function (o, t) {
      noise({ t0: t, dur: 0.40, vol: 0.12, atk: 0.003, dec: 0.38, freq: 2400, freq1: 200 });
      tone({ type: 'sawtooth', f0: pv(900, 100), f1: 80, t0: t, dur: 0.34, vol: 0.09, atk: 0.003, dec: 0.31 });
      tone({ type: 'square', f0: 220, f1: 50, t0: t, dur: 0.20, vol: 0.09, atk: 0.002, dec: 0.18 });
    },
    // Kill: Knall; Grundton steigt mit der Combo (opts.combo)
    kill: function (o, t) {
      const c = Math.min((o.combo || 0), 40);
      const f = pv(260 + c * 7, 60);
      tone({ type: 'square', f0: f, f1: f * 0.3, t0: t, dur: 0.16, vol: 0.11, atk: 0.002, dec: 0.14 });
      noise({ t0: t, dur: 0.12, vol: 0.07, freq: 1200, freq1: 250 });
      tone({ type: 'sine', f0: f * 0.55, f1: f * 0.18, t0: t + 0.02, dur: 0.14, vol: 0.08, atk: 0.002, dec: 0.12 });
    },
    // Hit: kurzer, spitzer Tick
    hit: function (o, t) {
      const f = pv(210, 70);
      tone({ type: 'triangle', f0: f, f1: f * 0.7, t0: t, dur: 0.06, vol: 0.06, atk: 0.002, dec: 0.05 });
      noise({ t0: t, dur: 0.05, vol: 0.04, freq: 1800, freq1: 800 });
    },
    // Combo x5: aufsteigende Zwei-Noten-Fanfare
    combo5: function (o, t) {
      tone({ type: 'sine', f0: 660, f1: 660, t0: t, dur: 0.14, vol: 0.08, atk: 0.004, dec: 0.12 });
      tone({ type: 'sine', f0: 990, f1: 990, t0: t + 0.07, dur: 0.16, vol: 0.08, atk: 0.004, dec: 0.14 });
    },
    // Combo x7: helles C-Dur-Arpeggio
    combo7: function (o, t) {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone({ type: 'sine', f0: f, f1: f, t0: t + i * 0.06, dur: 0.18, vol: 0.07, atk: 0.004, dec: 0.15 });
      });
    },
    // Buy: Münz-Funkeln nach oben
    buy: function (o, t) {
      tone({ type: 'sine', f0: 880, f1: 880, t0: t, dur: 0.09, vol: 0.08, atk: 0.003, dec: 0.08 });
      tone({ type: 'sine', f0: 1318, f1: 1318, t0: t + 0.06, dur: 0.17, vol: 0.08, atk: 0.003, dec: 0.15 });
      tone({ type: 'triangle', f0: 1760, f1: 1760, t0: t + 0.12, dur: 0.20, vol: 0.05, atk: 0.003, dec: 0.18 });
    },
    // Sell: Münz-Funkeln nach unten
    sell: function (o, t) {
      tone({ type: 'sine', f0: 1318, f1: 1318, t0: t, dur: 0.09, vol: 0.07, atk: 0.003, dec: 0.08 });
      tone({ type: 'sine', f0: 880, f1: 880, t0: t + 0.07, dur: 0.16, vol: 0.07, atk: 0.003, dec: 0.14 });
    },
    // Error: zwei tiefe Droh-Buzzes
    error: function (o, t) {
      tone({ type: 'square', f0: 130, f1: 100, t0: t, dur: 0.16, vol: 0.08, atk: 0.005, dec: 0.14 });
      tone({ type: 'square', f0: 98, f1: 84, t0: t + 0.13, dur: 0.18, vol: 0.08, atk: 0.005, dec: 0.16 });
    },
    // WaveStart: brachiale Horn-Fanfare (zwei Noten)
    waveStart: function (o, t) {
      tone({ type: 'sawtooth', f0: 220, f1: 220, t0: t, dur: 0.22, vol: 0.07, atk: 0.01, dec: 0.20 });
      tone({ type: 'sawtooth', f0: 277, f1: 277, t0: t + 0.14, dur: 0.30, vol: 0.07, atk: 0.01, dec: 0.28 });
      tone({ type: 'sine', f0: 440, f1: 440, t0: t + 0.14, dur: 0.25, vol: 0.05, atk: 0.01, dec: 0.22 });
    },
    // BossSiren: klassisches Auf-und-ab-Sirenensignal, ~1.3 s
    bossSiren: function (o, t) {
      for (var i = 0; i < 3; i++) {
        tone({ type: 'sawtooth', f0: 420, f1: 660, t0: t + i * 0.32, dur: 0.30, vol: 0.08, atk: 0.05, dec: 0.25 });
      }
      tone({ type: 'sawtooth', f0: 620, f1: 420, t0: t + 0.96, dur: 0.32, vol: 0.08, atk: 0.05, dec: 0.27 });
    },
    // Fanfare: triumphales Arpeggio mit Oktav-Obertönen
    fanfare: function (o, t) {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone({ type: 'square', f0: f, f1: f, t0: t + i * 0.09, dur: 0.24, vol: 0.06, atk: 0.006, dec: 0.21 });
        tone({ type: 'sine', f0: f * 2, f1: f * 2, t0: t + i * 0.09, dur: 0.20, vol: 0.04, atk: 0.006, dec: 0.17 });
      });
      tone({ type: 'sawtooth', f0: 1047, f1: 1047, t0: t + 0.36, dur: 0.45, vol: 0.07, atk: 0.01, dec: 0.40 });
    },
    // Achievement: zweistimmiges Leuchten
    achievement: function (o, t) {
      tone({ type: 'sine', f0: 1318, f1: 1318, t0: t, dur: 0.35, vol: 0.08, atk: 0.005, dec: 0.30 });
      tone({ type: 'sine', f0: 1760, f1: 1760, t0: t + 0.09, dur: 0.40, vol: 0.07, atk: 0.005, dec: 0.35 });
    },
    // Prestige: epischer Sweep + aufsteigende Arp-Glocken
    prestige: function (o, t) {
      tone({ type: 'sawtooth', f0: 180, f1: 1200, t0: t, dur: 0.70, vol: 0.09, atk: 0.02, dec: 0.65 });
      [523, 659, 784, 1047, 1319].forEach(function (f, i) {
        tone({ type: 'sine', f0: f, f1: f, t0: t + i * 0.08, dur: 0.35, vol: 0.07, atk: 0.005, dec: 0.30 });
      });
    },
    // Click: dezenter UI-Klick
    click: function (o, t) {
      tone({ type: 'square', f0: pv(620, 40), f1: 400, t0: t, dur: 0.05, vol: 0.045, atk: 0.002, dec: 0.045 });
    },
    // Heal: weiches, aufsteigendes Leuchten
    heal: function (o, t) {
      tone({ type: 'sine', f0: 440, f1: 880, t0: t, dur: 0.30, vol: 0.07, atk: 0.02, dec: 0.26 });
      tone({ type: 'triangle', f0: 660, f1: 1100, t0: t + 0.08, dur: 0.25, vol: 0.05, atk: 0.02, dec: 0.20 });
    },
    // Turret: Absetzer-Klack
    turret: function (o, t) {
      tone({ type: 'square', f0: pv(210, 50), f1: 120, t0: t, dur: 0.10, vol: 0.08, atk: 0.003, dec: 0.09 });
      noise({ t0: t, dur: 0.07, vol: 0.05, freq: 2000, freq1: 600 });
    },
  };

  /* ---------- Öffentliche API (Vertrag) ---------- */

  A.unlock = function () {
    try {
      const c = ensureCtx();
      if (!c) return false; // WebAudio nicht verfügbar -> still
      if (c.state === 'suspended') {
        const p = c.resume(); // iOS: nur in User-Geste erlaubt
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }
      punchUnlock(); // winziger Silent-Puffer erzwingt den Start
      if (!unlocked) {
        unlocked = true;
        NH.events.emit('nh:audioUnlock'); // erste User-Geste
      }
      return true;
    } catch (e) { return false; }
  };

  // 1-Sample-Stille im Gesten-Kontext: queued auf iOS-Browsern
  function punchUnlock() {
    try {
      if (!ctx) return;
      const b = ctx.createBuffer(1, 1, ctx.sampleRate);
      const s = ctx.createBufferSource();
      s.buffer = b;
      const g = ctx.createGain();
      g.gain.value = 0.0001;
      s.connect(g); g.connect(ctx.destination);
      s.start(0);
    } catch (e) {}
  }

  A.sfx = function (name, opts) {
    opts = opts || {};
    try {
      if (!A.enabled) { stopDrone(); return; } // Sound aus -> auch Drone stoppen
      if (name === 'bgm') { (opts.on ? startDrone : stopDrone)(); return; }
      const fn = SOUNDS[name];
      if (!fn) { console.warn('[NH:audio] unbekannter Sound:', name); return; }
      if (!ready()) return; // stiller No-Op bis unlock() (Context entsteht nur dort)
      sfxScale = (opts.vol && opts.vol > 0) ? Math.min(3, opts.vol) : 1;
      fn(opts, ctx.currentTime);
    } catch (e) { console.warn('[NH:audio]', e); } // nie werfen
  };

  A.setVolume = function (v) {
    vol = (typeof v === 'number' && !isNaN(v)) ? Math.min(1, Math.max(0, v)) : 1;
    applyMaster();
  };

  // enabled prüft die persistierte Einstellung; Setzen schreibt sie zurück
  Object.defineProperty(A, 'enabled', {
    get: function () {
      try {
        if (!NH.save || !NH.save.data || !NH.save.data.settings) return true;
        return NH.save.data.settings.sound !== false;
      } catch (e) { return true; }
    },
    set: function (v) {
      try {
        if (NH.save && NH.save.data) {
          if (!NH.save.data.settings) NH.save.data.settings = { sound: true, shake: true, lang: 'de' };
          NH.save.data.settings.sound = !!v;
        }
      } catch (e) {}
    },
  });

  NH.audio = A;
})();