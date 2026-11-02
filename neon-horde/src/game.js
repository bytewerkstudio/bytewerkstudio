/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * game.js — Loop, State-Machine, Player, Combo, Integrator
 * Vertrag: api.js (GAME). Zahlen ausschließlich aus balance.* (SSOT).
 * Übergänge: MENU -> RUN -> SHOP -> RUN ... -> GAMEOVER -> MENU; PAUSED.
 * RunSave-Felder lt. save.js. Laufzeit-Abhängigkeiten (NH.ents/NH.weapons/
 * NH.shop/NH.ui/NH.meta/NH.save/NH.audio/NH.input) — nie zur Ladezeit.
 * Beim Laden: nur Event-Registrierung + NH-Objekte.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});
  NH.game = NH.game || {}; // Registrierung: Module dürfen NH.game füllen
  const W = 1280, H = 720; // Logik-Auflösung fest (Vertrag, kein Kamera-Scroll)
  const GS = NH.gameState;

  /* ---------- Laufzeit-Zustand (erst init()/startRun()) ---------- */
  let ctx = null;
  let rafId = 0;
  let last = 0;
  let hitstop = 0;        // s
  let shake = 0;          // px
  let bossWarn = 0;       // s bis Boss-Erscheinen (auch NH.game.bossWarn)
  let bossSpawnedWave = -1;
  let bossKilledBonus = 0;   // beim Boss-Tod ausbezahlter Bonus (Fix: genau EINMAL,
                             // 'nh:bossDie' ist die alleinige Auszahlungs-Quelle)
  let vignetteFlash = 0;  // 0..1 Treffer-Vignette
  let inited = false;
  let pauseFromShop = false; // Pause aus Shop-Phase: nur Pause-Overlay schließen

  const player = { x: W / 2, y: H / 2, radius: 14, invulnUntil: 0, dir: 1 };

  /* ---------- Helfers (Balance-SSO; nur Vertrags-/Struktur-Konstanten) ---------- */
  function bal() { return NH.balance || {}; }
  function sfx(name, opts) {
    try { if (NH.audio && typeof NH.audio.sfx === 'function') NH.audio.sfx(name, opts || {}); } catch (e) {}
  }
  function toast(text, color) {
    try {
      if (NH.ui && typeof NH.ui.toast === 'function') NH.ui.toast(text, color);
      else NH.events.emit('nh:toast', { text: text, color: color || '#35D2E8' });
    } catch (e) {}
  }
  function isBossWaveId(w) {
    return (NH.waves && typeof NH.waves.isBossWave === 'function') ? NH.waves.isBossWave(w) : null;
  }
  function waveDurationFor(w) {
    const b = bal().waves;
    return isBossWaveId(w) ? b.bossDuration : b.baseDuration;
  }
  function comboWindow() {
    const e = bal().economy;
    return (e && e.comboWindow > 0) ? e.comboWindow : 2;
  }
  function comboBoostDur() {
    const e = bal().economy;
    return (e && e.comboDmgDuration > 0) ? e.comboDmgDuration : 5;
  }
  function bossWarnTime() {
    const b = bal().waves;
    return (b && b.bossWarnTime > 0) ? b.bossWarnTime : 8;
  }
  function waveBonusFor(w, quick) {
    return (NH.waves && typeof NH.waves.waveBonus === 'function') ? NH.waves.waveBonus(w, quick) : 0;
  }
  function bossBonusFor(bossId, w) {
    return (NH.waves && typeof NH.waves.bossBonus === 'function') ? NH.waves.bossBonus(bossId, w) : 0;
  }
  function fmtTpl(tpl, v) {
    return String(tpl).replace('%s', v === undefined ? '' : String(v));
  }
  function shakeDisabled() {
    const d = NH.save && NH.save.data && NH.save.data.settings;
    return !!(d && d.shake === false);
  }

  /* ---------- Player-Pos für entities.js (Vertrag NH.ents.playerPos) ---------- */
  NH.ents = NH.ents || {};
  NH.ents.playerPos = function () { return { x: player.x, y: player.y }; };

  /* ---------- Upgrade-Werte aus balance (SSOT) ---------- */
  function upDef(id) {
    return (bal().upgrades || []).find(function (u) { return u.id === id; }) || null;
  }
  function buffEffect(id) {
    const d = upDef(id);
    return d ? d.effectPerLevel : 0;
  }
  // Aus Buff-Leveln abgeleitete Player-Statistik (balance.upgrades):
  // hp = absolut (+25 Max HP), speed/magnet/dodge/crit/regen prozentual bzw. 1:1
  function derivedStats(run) {
    const P = bal().player || {};
    const b = run.buffs || { hp: 0, speed: 0, regen: 0, magnet: 0, dodge: 0, crit: 0 };
    const baseHP = (P.baseMaxHP || 60) * (run.shardHpMult || 1);
    run.maxHP = Math.round(baseHP + (b.hp || 0) * (buffEffect('hp') || 0));
    run.speed = (P.baseSpeed || 240) * (run.shardSpeedMult || 1) * (1 + (b.speed || 0) * (buffEffect('speed') || 0));
    run.regen = (b.regen || 0) * (buffEffect('regen') || 0);
    run.magnet = Math.round((P.baseMagnet || 90) * (1 + (b.magnet || 0) * (buffEffect('magnet') || 0)));
    run.dodge = (b.dodge || 0) * (buffEffect('dodge') || 0);
    run.crit = (b.crit || 0) * (buffEffect('crit') || 0);
    if (run.hp > run.maxHP) run.hp = run.maxHP;
  }

  /* ---------- Run-Lebenszyklus ---------- */
  function emptyStats() {
    return {
      kills: 0, killsByWeapon: {}, scrapEarned: 0, bossesKilled: 0,
      maxWave: 0, earnedThisRun: 0, startTime: Date.now(),
      wave: 0, banked: 0, lost: 0, time: 0, maxWaveBest: 0,
      weaponMaxLv: 0, weaponsOwned: 0,
    };
  }

  function shardBonusInfo() {
    const m = (NH.meta && typeof NH.meta.shardBonus === 'function') ? NH.meta.shardBonus() : null;
    return m || { hpMult: 1, dmgMult: 1, speedMult: 1, startScrap: 0, startWeaponLevel: 0 };
  }

  function makeRun() {
    const P = bal().player || {};
    const shards = (NH.meta && typeof NH.meta.shards === 'function') ? NH.meta.shards() : { hp: 0, dmg: 0, speed: 0, startscrap: 0, wlevel: 0 };
    const sb = shardBonusInfo();
    const run = {
      wave: 1, waveTime: 0, waveDuration: 0, phase: 'combat',
      scrap: 0, earnedThisRun: 0,
      maxHP: 1, hp: 1, speed: 0, // derivedStats füllt unten
      regen: 0, magnet: 0, dodge: 0, crit: 0,
      buffs: { hp: 0, speed: 0, regen: 0, magnet: 0, dodge: 0, crit: 0 },
      shardHpMult: 1 + (P.shardMaxHPPer || 0.05) * (shards.hp || 0),
      shardSpeedMult: 1 + (P.shardSpeedPer || 0.03) * (shards.speed || 0),
      weapons: [{ id: 'blaster', level: 1 }],
      combo: 0, comboTimer: 0, bestCombo: 0, comboDuration: comboWindow(),
      comboBoostUntil: 0,
      queue: [], boss: null, waveBoss: null, waveTimer: 0, bossWarn: 0,
      quickStart: false,
      stats: emptyStats(),
      shardBonuses: sb,
    };
    derivedStats(run);
    run.hp = run.maxHP; // frischer Run startet voll (derivedStats clamp nur)
    return run;
  }

  function resetWorld() {
    try { if (NH.ents && typeof NH.ents.reset === 'function') NH.ents.reset(); } catch (e) {}
    try { if (NH.weapons && typeof NH.weapons.init === 'function') NH.weapons.init(); } catch (e) {}
    player.x = W / 2; player.y = H / 2; player.invulnUntil = 0; player.dir = 1;
    hitstop = 0; shake = 0; bossWarn = 0; vignetteFlash = 0;
    NH.game.bossWarn = 0;
    bossSpawnedWave = -1;
    bossKilledBonus = 0;
    pauseFromShop = false;
  }

  let tutorialShown = false; // einmal pro Session; verhindert Tutorial-Loop

  function startRun(newRun) {
    // Egal aus welchem Zustand (Menü, GameOver, Pause-Restart, Tutorial-Skip):
    // IMMER zuerst sauberen Zustand herstellen, bevor ein neuer Run gebaut wird.
    // (Fix: Tutorial-Run darf keinen 'aktiven' Run hinterlassen; sonst startet
    //  ein zweites 'Spielen' den Tutorial-Run doppelt ohne World-Reset.)
    try { if (NH.shop && typeof NH.shop.close === 'function') NH.shop.close(); } catch (e) {}
    NH.game.run = null;
    resetWorld();
    try { if (NH.save && typeof NH.save.runSaveLoeschen === 'function') NH.save.runSaveLoeschen(); } catch (e) {}
    const run = makeRun();
    // Start-Scrap (Shard-Bonus) + Start-Waffen-Level: LIES AUS meta.shardBonus()
    // (liefert Anzahl EXTRA-Level 0..5), nicht aus shards().wlevel direkt.
    run.scrap += (run.shardBonuses.startScrap || 0);
    run.weapons[0].level = Math.max(1, Math.min(6, 1 + ((run.shardBonuses.startWeaponLevel) || 0)));
    NH.game.run = run;
    const settings = (NH.save && NH.save.data && NH.save.data.settings) || {};
    const lifetime = (NH.save && NH.save.data && NH.save.data.lifetime) || null;
    // Tutorial genau einmal pro Konto, nur im allerersten Run (Spec)
    tutorialShown = true;
    if (!(lifetime && lifetime.runs > 0) && !settings.tutorialSeen) {
      settings.tutorialSeen = true;
      try { if (NH.save && typeof NH.save.save === 'function') NH.save.save(); } catch (e) {}
      // Tutorial startet Welle 1 erst über seinen Start-Button (ruft startRun erneut):
      // eigener Tutorial-Zustand (KEIN GS.RUN) — kein Run aktiv, kein Pause-Toggle.
      run.wave = 0;
      run.phase = 'tutorial';
      NH.game.state = GS.MENU;
      try { if (NH.ui && typeof NH.ui.showScreen === 'function') NH.ui.showScreen('tutorial', { run: run }); } catch (e) {}
      return;
    }
    // Tutorial bereits gesehen oder Konto-Run vorhanden: normaler Kampf-Run.
    // startNextWave inkrementiert von 0 auf 1 -> erste Kampfwelle ist Welle 1.
    NH.game.state = GS.RUN;
    run.phase = 'combat';
    run.wave = 0;
    NH.game.startNextWave(false);
  }

  function resumeRun() {
    const snap = (NH.save && typeof NH.save.runSaveLaden === 'function') ? NH.save.runSaveLaden() : null;
    if (!snap) return;
    const sb = (snap.shardBonuses && typeof snap.shardBonuses === 'object') ? snap.shardBonuses : shardBonusInfo();
    const defBuffs = { hp: 0, speed: 0, regen: 0, magnet: 0, dodge: 0, crit: 0 };
    const b = (snap.buffs && typeof snap.buffs === 'object') ? snap.buffs : {};
    const buffs = {};
    for (const k in defBuffs) buffs[k] = Math.max(0, b[k] | 0);
    const P = bal().player || {}, wv = bal().waves || {};
    const maxHP = Math.max(1, snap.maxHP | 0);
    const weapons = Array.isArray(snap.weapons)
      ? snap.weapons.map(function (w) { return { id: String(w && w.id ? w.id : 'blaster'), level: Math.max(1, (w && w.level) | 0) }; })
      : [{ id: 'blaster', level: 1 }];
    if (!weapons.some(function (w) { return w.id === 'blaster'; })) weapons.unshift({ id: 'blaster', level: 1 });
    const run = {
      wave: Math.max(1, snap.wave | 0), waveTime: 0,
      waveDuration: (wv.baseDuration || 60), phase: 'shop',
      scrap: Math.max(0, snap.scrap | 0),
      earnedThisRun: (snap.stats && snap.stats.earnedThisRun) || 0,
      maxHP: maxHP, hp: Math.min(maxHP, Math.max(0, snap.hp | 0)),
      speed: (P.baseSpeed || 240), // derivedStats füllt mit Buffs
      regen: 0, magnet: 0, dodge: 0, crit: 0,
      buffs: buffs,
      shardHpMult: 1, // kommt aus gespeichertem maxHP
      shardSpeedMult: 1,
      weapons: weapons,
      combo: 0, comboTimer: 0, bestCombo: 0, comboDuration: comboWindow(),
      comboBoostUntil: 0,
      queue: [], boss: null, waveBoss: null, waveTimer: 0, bossWarn: 0,
      quickStart: false,
      stats: Object.assign(emptyStats(), (snap.stats && typeof snap.stats === 'object') ? snap.stats : {}),
      shardBonuses: sb,
    };
    // Buff-abgeleitete Werte live (maxHP/hp aus dem Snapshot bleiben erhalten)
    buffs.hp = 0; // HP wurde im Snapshot gespeichert; absolute HP-Buffs sind darin enthalten
    derivedStats(run);
    run.maxHP = maxHP; run.hp = Math.min(maxHP, run.hp);
    const shardSpeed = (function () { const m = shardBonusInfo(); return m.speedMult || 1; })();
    run.speed = (P.baseSpeed || 240) * shardSpeed * (1 + buffs.speed * (buffEffect('speed') || 0));
    NH.game.run = run;
    NH.game.state = GS.SHOP;
    run.phase = 'shop';
    resetWorld();
    try {
      if (NH.shop && typeof NH.shop.open === 'function') NH.shop.open();
      else NH.game.startNextWave(false);
    } catch (e) { NH.game.startNextWave(false); }
  }

  /* ---------- Wellen ---------- */
  NH.game.startNextWave = function (quick) {
    const r = NH.game.run;
    if (!r) return;
    quick = !!quick;
    r.wave = (r.wave | 0) + 1;
    const w = r.wave;
    const bossId = isBossWaveId(w);
    r.waveDuration = waveDurationFor(w);
    r.waveTime = 0;
    r.queue = (NH.waves && typeof NH.waves.buildQueue === 'function') ? NH.waves.buildQueue(w, r.waveDuration) : [];
    r.boss = null;
    if (bossId && NH.waves && typeof NH.waves.recomputeBoss === 'function') {
      try { r.boss = NH.waves.recomputeBoss(bossId, w); } catch (e) { r.boss = null; }
    }
    r.waveBoss = bossId;
    r.phase = 'combat';
    r.quickStart = quick; // gilt für DIESE Welle (Bonuszuschlag beim Ende)
    NH.game.state = GS.RUN;
    bossSpawnedWave = -1;
    bossKilledBonus = 0;
    comboReset();
    // Boss-Vorwarnung: countdown runter, Boss erscheint nach bossWarnTime s
    // (Banner+Sirene zeigt ui.js über 'nh:waveStart' — hier KEIN Doppel-Sound)
    bossWarn = bossId ? bossWarnTime() : 0;
    NH.game.bossWarn = bossWarn;
    r.bossWarn = bossWarn;
    NH.events.emit('nh:waveStart', { wave: w, boss: bossId });
    sfx('waveStart');
    // Welle-1-Banner beim Run-Start (Boss-Ankündigung rendert ui.js via 'nh:waveStart')
    if (w === 1) {
      try {
        if (NH.ui && typeof NH.ui.banner === 'function') NH.ui.banner(NH.t('hud.wave') + ' ' + w, '', '#35D2E8', 1800);
      } catch (e) {}
    }
  };

  function waveBonusOnly(r) {
    return waveBonusFor(r.wave, !!r.quickStart);
  }

  function snapshot(r) {
    return {
      wave: r.wave, scrap: r.scrap, hp: r.hp, maxHP: r.maxHP,
      weapons: r.weapons.slice(), buffs: Object.assign({}, r.buffs),
      stats: Object.assign({}, r.stats), shardBonuses: r.shardBonuses || {},
    };
  }
  function saveRunSnapshot(r) {
    try {
      if (NH.save && typeof NH.save.runSaveSpeichern === 'function') {
        NH.save.runSaveSpeichern(snapshot(r));
      }
    } catch (e) {}
  }

  NH.game.enterShop = function () {
    const r = NH.game.run;
    if (!r || r.phase !== 'combat') return;
    r.phase = 'shop';
    comboReset(); // Shop = Combo-Fenster läuft ab -> sauber auf 0 (Spec)
    const bonus = waveBonusOnly(r);
    const bossPaid = bossKilledBonus > 0;
    // Boss-Bonus zahlt AUSSCHLIESSLICH entities.js beim Boss-Tod ('nh:bossDie',
    // siehe Listener). enterShop gibt nur den reinen Wellen-Bonus ('waveBonus').
    // Bonus VOR Snapshot, damit der Auto-Save den Wellen-Bonus enthält
    if (bonus > 0) NH.game.addScrap(bonus, 'wave');
    saveRunSnapshot(r);
    NH.events.emit('nh:waveEnd', { wave: r.wave, bonus: bonus, quick: !!r.quickStart, bossPaid: bossPaid });
    NH.game.state = GS.SHOP;
    bossWarn = 0; NH.game.bossWarn = 0; r.bossWarn = 0;
    bossKilledBonus = 0;
    try {
      if (NH.ui && typeof NH.ui.banner === 'function') {
        const clearTxt = fmtTpl(NH.t('hud.waveClear'), r.wave) + (bonus > 0 ? '  ' + fmtTpl(NH.t('hud.bonusGet'), bonus) : '');
        NH.ui.banner(clearTxt, '', bonus > 0 ? '#7CFC00' : '#35D2E8', 2200);
      }
    } catch (e) {}
    try {
      if (NH.shop && typeof NH.shop.open === 'function') NH.shop.open();
    } catch (e) { /* Shop optional; Welle startet über shop.startNextWave oder UI */ }
  };

  // Welle vorzeitig beenden (KeyE nach Clear) — gleicher Pfad ohne Quick-Bonus
  function enterShopEarly() {
    const r = NH.game.run;
    if (!r || r.phase !== 'combat') return;
    r.phase = 'shop';
    comboReset();
    r.quickStart = false;
    const bonus = waveBonusOnly(r);
    const bossPaid = bossKilledBonus > 0;
    if (bonus > 0) NH.game.addScrap(bonus, 'wave');
    saveRunSnapshot(r);
    NH.events.emit('nh:waveEnd', { wave: r.wave, bonus: bonus, quick: false, bossPaid: bossPaid });
    NH.game.state = GS.SHOP;
    bossWarn = 0; NH.game.bossWarn = 0; r.bossWarn = 0;
    bossKilledBonus = 0;
    try {
      if (NH.ui && typeof NH.ui.banner === 'function') {
        const clearTxt = fmtTpl(NH.t('hud.waveClear'), r.wave) + (bonus > 0 ? '  ' + fmtTpl(NH.t('hud.bonusGet'), bonus) : '');
        NH.ui.banner(clearTxt, '', bonus > 0 ? '#7CFC00' : '#35D2E8', 2200);
      }
    } catch (e) {}
    try {
      if (NH.shop && typeof NH.shop.open === 'function') NH.shop.open();
    } catch (e) { /* Shop optional */ }
  }

  /* ---------- Scrap / Combo / Kill-Zähler ---------- */
  NH.game.addScrap = function (n, src, x, y) {
    const r = NH.game.run;
    if (!r || !(n > 0)) return;
    n = Math.round(n);
    r.scrap += n;
    r.earnedThisRun += n;
    if (r.stats) r.stats.scrapEarned += n;
    if (x !== undefined && y !== undefined) {
      try { if (NH.ents && typeof NH.ents.spawnPickup === 'function') NH.ents.spawnPickup(x, y, n); } catch (e) {}
    }
    NH.events.emit('nh:scrap', { n: n, x: x, y: y });
    // Wellen-Bonus gratuliert; Verkauf spielt shop.js selbst, Pickups entities.js
    // (kein Doppel-Sound). 'nh:scrap' pulsiert den HUD-Scrap (ui.js).
    if (src === 'wave') sfx('fanfare');
  };

  NH.game.spendScrap = function (n) {
    const r = NH.game.run;
    if (!r || !(n > 0) || r.scrap < n) return false;
    r.scrap -= n;
    return true;
  };

  NH.game.scrapMultiplier = function () {
    const r = NH.game.run;
    const e = bal().economy || {};
    return r && r.combo >= (e.comboMultiplierAt || 5) ? (e.cometiveCombo5 || 2) : 1;
  };

  NH.game.dpsMultiplier = function () {
    const r = NH.game.run;
    const e = bal().economy || {};
    return r && r.comboBoostUntil > Date.now() && (e.comboDmgBonus || 0) > 0 ? 1 + e.comboDmgBonus : 1;
  };

  function comboReset() {
    const r = NH.game.run;
    if (!r) return;
    if (r.combo !== 0 || r.comboTimer !== 0) {
      r.combo = 0; r.comboTimer = 0;
      NH.events.emit('nh:combo', { combo: 0 }); // HUD-Cache invalidieren
    }
  }

  function comboAdd(kills) {
    const r = NH.game.run;
    if (!r || NH.game.state !== GS.RUN) return;
    r.combo += kills || 1;
    r.comboTimer = comboWindow();
    const e = bal().economy || {};
    if (r.combo > r.bestCombo) r.bestCombo = r.combo;
    // Schwellen-Effekte nur beim ÜBERSCHREITEN auslösen (kills = Sprungweite)
    const crossed5 = r.combo >= (e.comboMultiplierAt || 5) && r.combo - (kills || 1) < (e.comboMultiplierAt || 5);
    const crossed7 = r.combo >= (e.comboDmgAt || 7) && r.combo - (kills || 1) < (e.comboDmgAt || 7);
    if (crossed5) {
      sfx('combo5');
      toast('×' + r.combo + ' — 2× ' + NH.t('hud.scrap'), '#FFD700');
    }
    if (crossed7) {
      const until = Date.now() + comboBoostDur() * 1000;
      r.comboBoostUntil = Math.max(r.comboBoostUntil || 0, until);
      NH.events.emit('nh:boost', { until: until });
      sfx('combo7');
      try {
        if (NH.ui && typeof NH.ui.banner === 'function') NH.ui.banner('×7 ' + NH.t('hud.dmgBoost'), '', '#FFD700', 1600);
      } catch (e) {}
    }
    NH.events.emit('nh:combo', { combo: r.combo });
  }

  /* Lose Kopplung: Kills/Bosse (entities.js feuert die Events) */
  NH.events.on('nh:kill', function (d) {
    const r = NH.game.run;
    if (!r) return;
    comboAdd(1);
    r.stats.kills += 1;
    if (d && d.weaponId) {
      if (!r.stats.killsByWeapon[d.weaponId]) r.stats.killsByWeapon[d.weaponId] = 0;
      r.stats.killsByWeapon[d.weaponId] += 1;
    }
  });
  NH.events.on('nh:bossDie', function (d) {
    const r = NH.game.run;
    if (r) r.stats.bossesKilled += 1;
    // Boss-Bonus GENAU EINMAL beim Tod auszahlen (entities.js ist die alleinige
    // Quelle; enterShop gibt nur noch den reinen Wellen-Bonus).
    // Boss-BonusWert via waves.bossBonus (SSOT), wie in der API-Doku.
    if (r && d && d.bossId && r.waveBoss && bossKilledBonus <= 0) {
      const b = bossBonusFor(d.bossId, r.wave);
      if (b > 0) {
        bossKilledBonus = b;
        NH.game.addScrap(b, 'boss');
      }
    }
  });

  /* ---------- Damage / GameOver ---------- */
  NH.game.damagePlayer = function (dmg, x, y) {
    const r = NH.game.run;
    if (!r) return;
    if (NH.game.state !== GS.RUN || r.phase !== 'combat') return;
    if (player.invulnUntil > Date.now()) return;
    dmg = Math.max(1, Math.round(dmg) || 1);
    if (r.dodge > 0 && Math.random() < r.dodge) {
      try {
        if (NH.ents && typeof NH.ents.spawnPopup === 'function') {
          NH.ents.spawnPopup(x || player.x, (y || player.y) - 30, NH.t ? NH.t('hud.dodge') : 'DODGE', '#7CFC00');
        }
      } catch (e) {}
      NH.events.emit('nh:damage', { id: 'player', dmg: 0, crit: false, dodge: true });
      sfx('hit');
      return;
    }
    r.hp -= dmg;
    player.invulnUntil = Date.now() + 500; // 0.5 s
    addShake(Math.min(6, 3 + dmg * 0.5)); // Shake gecappt (QA-Fix, Juice)
    addHitStop(0.04);
    sfx('hit');
    vignetteFlash = Math.min(1, vignetteFlash + 0.7);
    NH.events.emit('nh:damage', { id: 'player', dmg: dmg, crit: false });
    try {
      if (NH.ents && typeof NH.ents.spawnParticle === 'function') {
        NH.ents.spawnParticle({ x: player.x, y: player.y, vx: (Math.random() - 0.5) * 120, vy: -60, life: 0.35, color: '#ff6b6b', size: 7 });
      }
    } catch (e) {}
    if (r.hp <= 0) { r.hp = 0; NH.game.gameOver('dead'); }
  };

  NH.game.gameOver = function (reason) {
    const r = NH.game.run;
    if (!r || NH.game.state === GS.GAMEOVER) return;
    NH.game.state = GS.GAMEOVER;
    r.phase = 'gameover';
    // Boss-Warnung abstellen: HUD liest run.bossWarn live (kein Blinken
    // hinter dem Gameover-Overlay)
    bossWarn = 0; NH.game.bossWarn = 0; if (r) r.bossWarn = 0;
    const ec = bal().economy || {};
    const ratio = (ec.bankSafeRatio || 0.8);
    const banked = Math.floor(r.scrap * ratio);
    const lost = r.scrap - banked;
    r.stats.banked = banked;
    r.stats.lost = lost;
    r.stats.time = Math.floor((Date.now() - (r.stats.startTime || Date.now())) / 1000);
    r.stats.maxWave = r.wave;
    r.stats.maxWaveBest = (NH.save && NH.save.data && NH.save.data.lifetime && (NH.save.data.lifetime.maxWave | 0)) || 0;
    r.stats.weaponMaxLv = Math.max.apply(null, [1].concat(r.weapons.map(function (w) { return w.level || 1; })));
    r.stats.weaponsOwned = r.weapons.length;
    // Banken VOR Anzeige. Lifetime-Update läuft über meta.js: dessen
    // 'nh:gameover'-Listener ruft runStatsUpdate(stats) — ein zweiter Aufruf
    // hier würde Kills/Bosse/Runs doppelt zählen.
    if (banked > 0 && NH.meta && typeof NH.meta.addBank === 'function') {
      try { NH.meta.addBank(banked, 'run'); } catch (e) {}
    }
    try { if (NH.save && typeof NH.save.runSaveLoeschen === 'function') NH.save.runSaveLoeschen(); } catch (e) {}
    try { if (NH.shop && typeof NH.shop.close === 'function') NH.shop.close(); } catch (e) {}
    NH.events.emit('nh:gameover', { stats: r.stats, reason: reason });
    try { if (NH.ui && typeof NH.ui.showScreen === 'function') NH.ui.showScreen('gameover', { data: r.stats }); } catch (e) {}
    sfx('fanfare');
  };

  function addHitStop(s) { hitstop = Math.max(hitstop, s || 0); }
  function addShake(px) { if (!shakeDisabled()) shake = Math.max(shake, px || 0); }
  NH.game.addHitStop = addHitStop;
  NH.game.addShake = addShake;

  /* ---------- Menu / Pause / Keys ---------- */
  NH.game.toMenu = function () {
    NH.game.run = null;
    NH.game.state = GS.MENU;
    try { if (NH.ui && typeof NH.ui.hideScreens === 'function') NH.ui.hideScreens(); } catch (e) {}
    try { if (NH.ui && typeof NH.ui.showScreen === 'function') NH.ui.showScreen('menu'); } catch (e) {}
  };

  function togglePause() {
    const st = NH.game.state;
    // Tutorial zeigt KEIN RUN -> Pause-Toggle darf hier nie pausieren
    // (QA-Fix: E-Key/P im Tutorial sonst versehentlich Pause-Overlay)
    if (NH.game.run && NH.game.run.phase === 'tutorial') return;
    if (st === GS.RUN || st === GS.SHOP) {
      pauseFromShop = st === GS.SHOP;
      if (pauseFromShop) {
        // Shop sauber schließen (Timer gestoppt); Resume öffnet ihn frisch —
        // Run-Zustand (Welle/Scrap/Waffen/Buffs) bleibt dabei erhalten.
        try { if (NH.shop && typeof NH.shop.close === 'function') NH.shop.close(); } catch (e) {}
      }
      NH.game.state = GS.PAUSED;
      try { if (NH.ui && typeof NH.ui.showScreen === 'function') NH.ui.showScreen('pause'); } catch (e) {}
      sfx('click');
      return;
    }
    if (st === GS.PAUSED) {
      NH.game.state = pauseFromShop ? GS.SHOP : GS.RUN;
      try { if (NH.ui && typeof NH.ui.hideScreens === 'function') NH.ui.hideScreens(); } catch (e) {}
      if (pauseFromShop) {
        // Shop öffnet sich mit frischen Angeboten; der Run-Snapshot bleibt
        // unangetastet (runSave wurde bei enterShop geschrieben).
        try { if (NH.shop && typeof NH.shop.open === 'function') NH.shop.open(); } catch (e) {}
      }
      pauseFromShop = false;
      sfx('click');
    }
  }

  function tryEarlyShop() {
    const r = NH.game.run;
    if (!r || NH.game.state !== GS.RUN || r.phase !== 'combat') return;
    // E aus dem Shop (shop.onKey läuft VOR diesem Listener und startet die Welle
    // bereits): innerhalb des Spawn-Start-Fensters ist ein Clear unmöglich und
    // der Toast "Früh starten" wäre falsch. Stille Abweisung (Balance-Wert).
    if (r.waveTime < (bal().waves.spawnStartDelay || 2)) return;
    const hasEnemies = !!(NH.ents && NH.ents.enemies && NH.ents.enemies.length);
    const hasBoss = !!(NH.ents && typeof NH.ents.activeBoss === 'function' && NH.ents.activeBoss());
    if ((r.queue && r.queue.length) || hasEnemies || hasBoss) {
      toast(NH.t('shop.early'), '#ff6b6b');
      return;
    }
    enterShopEarly();
  }

  NH.events.on('nh:key', function (d) {
    if (!d || !d.code) return;
    if (d.code === 'KeyP') togglePause();
    else if (d.code === 'KeyE') tryEarlyShop();
    // Enter setzt die Pause fort (Spec) — gilt auch für die Shop-Pause;
    // shop.onKey ignoriert Enter, solange kein Shop-Overlay offen ist.
    else if (d.code === 'Enter' && NH.game.state === GS.PAUSED && NH.game.run) togglePause();
  });

  // Explosions-Shake (ents/weapons feuern 'nh:bang' {x,y,radius})
  NH.events.on('nh:bang', function (d) {
    if (!d) return;
    addShake(Math.min(6, (d.radius || 20) * 0.06));
  });

  // Shop kauft Run-Upgrades -> abgeleitete Player-Statistik neu berechnen
  NH.events.on('nh:meta', function () {
    const r = NH.game.run;
    if (!r) return;
    const hp = r.hp;
    derivedStats(r);
    if (r.hp === hp) r.hp = Math.min(r.maxHP, r.hp); // MaxHP kann gewachsen sein
  });

  /* ---------- Loop ---------- */
  NH.game.startLoop = function () {
    if (rafId) return;
    last = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const loop = function (t) {
      rafId = 0;
      const now = (typeof performance !== 'undefined' && performance.now) ? (t || performance.now()) : Date.now();
      const realDt = Math.max(0, (now - last) / 1000);
      last = now;
      frame(realDt);
      if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(loop);
    };
    if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(loop);
  };

  function frame(realDt) {
    if (NH.game.state === GS.PAUSED) { render(); return; }
    if (hitstop > 0) {
      hitstop = Math.max(0, hitstop - realDt);
      render();
      return;
    }
    const dt = Math.min(0.05, realDt); // Frame-Cap 50 ms
    update(dt);
    render();
    if (!shakeDisabled() && shake > 0) shake = Math.max(0, shake - dt * 30);
  }

  /* ---------- Update ---------- */
  function update(dt) {
    if (NH.game.state !== GS.RUN) return;
    const r = NH.game.run;
    if (!r) return;

    /* 1) Input -> Player-Move (Speed, Arena-Clampen) */
    const inp = NH.input;
    let ax = 0, ay = 0;
    if (inp && inp.axis) { ax = inp.axis.x || 0; ay = inp.axis.y || 0; }
    player.x = NH.u.clamp(player.x + ax * r.speed * dt, player.radius, W - player.radius);
    player.y = NH.u.clamp(player.y + ay * r.speed * dt, player.radius, H - player.radius);
    if (Math.abs(ax) > 0.01) player.dir = ax > 0 ? 1 : -1;
    // Pointer-Ziel (Maus/Touch rechts): aktiv Richtung Zielpunkt wandern
    if (inp && inp.pointer && inp.pointer.active) {
      const pdx = inp.pointer.x - player.x, pdy = inp.pointer.y - player.y;
      const pd = Math.hypot(pdx, pdy);
      if (pd > 2) {
        const t = Math.min(1, (r.speed * dt) / pd);
        player.x += pdx * t;
        player.y += pdy * t;
        if (Math.abs(pdx) > 2) player.dir = pdx > 0 ? 1 : -1;
      }
    }
    // Arena-Ränder IMMER respektieren (auch nach Pointer-Folgen)
    player.x = NH.u.clamp(player.x, player.radius, W - player.radius);
    player.y = NH.u.clamp(player.y, player.radius, H - player.radius);

    /* 2) Waffen (Auto-Feuer) */
    try { if (NH.weapons && typeof NH.weapons.update === 'function') NH.weapons.update(dt); } catch (e) {}

    /* 3) Entities (Gegner, Projektile, Pickups, Partikel; Magnet in ents) */
    try { if (NH.ents && typeof NH.ents.update === 'function') NH.ents.update(dt); } catch (e) {}

    /* 4) Combo-Timer */
    if (r.combo > 0) {
      r.comboTimer -= dt;
      if (r.comboTimer <= 0) { r.combo = 0; r.comboTimer = 0; NH.events.emit('nh:combo', { combo: 0 }); }
    }

    /* 5) Regen (Run-Buff) */
    if (r.regen > 0 && r.hp < r.maxHP) r.hp = Math.min(r.maxHP, r.hp + r.regen * dt);

    /* 6) Boss-Vorwarnung + Spawn nach bossWarnTime s */
    if (NH.game.bossWarn > 0) {
      NH.game.bossWarn = Math.max(0, NH.game.bossWarn - dt);
      bossWarn = NH.game.bossWarn;
      r.bossWarn = bossWarn;
      if (bossWarn === 0 && r.waveBoss && bossSpawnedWave !== r.wave) {
        bossSpawnedWave = r.wave;
        try {
          if (NH.ents && typeof NH.ents.spawnBoss === 'function' && !NH.ents.activeBoss()) {
            NH.ents.spawnBoss(r.waveBoss, W / 2, 50, r.wave);
          }
        } catch (e) {}
      }
    }

    /* 7) Wave-Zeit */
    r.waveTime += dt;

    /* 8) Queue abarbeiten (Spawn nach Zeitplan) */
    drainQueue();

    /* 9) Wellen-Ende prüfen */
    checkWaveEnd();
  }

  function drainQueue() {
    const r = NH.game.run;
    if (!r || !r.queue || !r.queue.length) return;
    const maxPerSec = (bal().waves && bal().waves.spawnCapPerSec) || 12;
    let spawned = 0;
    while (r.queue.length && r.queue[0].at <= r.waveTime && spawned < maxPerSec) {
      const q = r.queue.shift();
      const x = (q.x !== undefined && q.x !== null) ? q.x : (q.pos && q.pos.x !== undefined ? q.pos.x : W + 40);
      const y = (q.y !== undefined && q.y !== null) ? q.y : (q.pos && q.pos.y !== undefined ? q.pos.y : Math.random() * H);
      try {
        if (q.type === 'boss' && NH.ents && typeof NH.ents.spawnBoss === 'function') {
          NH.ents.spawnBoss(q.type, x, y, r.wave);
        } else if (NH.ents && typeof NH.ents.spawnEnemy === 'function') {
          NH.ents.spawnEnemy(q.type, x, y);
        }
      } catch (e) { /* Entities defensiv */ }
      spawned++;
    }
  }

  function checkWaveEnd() {
    const r = NH.game.run;
    if (!r || NH.game.state !== GS.RUN || r.phase !== 'combat') return;
    const timeUp = !!(r.waveDuration > 0 && r.waveTime >= r.waveDuration);
    const queueDone = !(r.queue && r.queue.length);
    const enemiesDone = !(NH.ents && NH.ents.enemies && NH.ents.enemies.length);
    // Boss-Welle: erst nach Ablauf der Vorwarnung (Boss ist gespawnt) und
    // nur wenn kein Boss mehr lebt früh beenden — Boss niemals überspringen.
    const bossDone = !r.waveBoss || !(NH.ents && typeof NH.ents.activeBoss === 'function' && NH.ents.activeBoss());
    const bossSpawnMoment = !r.waveBoss || r.waveTime >= bossWarnTime();
    if (!timeUp && !(queueDone && enemiesDone && bossDone && bossSpawnMoment)) return;
    if (timeUp) {
      // Zeitende: Verbliebene Gegner + Boss entfernen (kein Scrap, keine Events).
      // Boss-Bonus ist bereits beim Tod ausbezahlt ('nh:bossDie'); ein Boss,
      // der bei Zeitende noch lebt, erhält keinen Bonus.
      // Bosse leben lt. Vertrag im enemies-Array, defensiv auch eigenes Array.
      try { if (NH.ents && Array.isArray(NH.ents.enemies)) NH.ents.enemies.length = 0; } catch (e) {}
      try { if (NH.ents && Array.isArray(NH.ents.bosses)) NH.ents.bosses.length = 0; } catch (e) {}
      if (r.queue) r.queue.length = 0;
    }
    NH.game.enterShop();
  }

  /* ---------- Render ---------- */
  function render() {
    if (!ctx) return;
    try {
      let ox = 0, oy = 0;
      if (!shakeDisabled() && shake > 0) {
        ox = (Math.random() * 2 - 1) * shake;
        oy = (Math.random() * 2 - 1) * shake;
      }
      ctx.save();
      ctx.translate(ox, oy);
      ctx.clearRect(-20, -20, W + 40, H + 40);
      try { if (NH.ents && typeof NH.ents.render === 'function') NH.ents.render(ctx); } catch (e) {}
      // Player: Kreis + Richtungs-Detail + Invuln-Blinken (125 ms-Takt)
      const blink = player.invulnUntil > Date.now() ? (Math.floor(Date.now() / 125) % 2 === 0) : false;
      if (!blink) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#35D2E8';
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#e8f4ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        const r = NH.game.run;
        if (r && Array.isArray(r.weapons) && r.weapons.length) {
          const d = player.dir || 1;
          ctx.beginPath();
          ctx.moveTo(player.x + d * 6, player.y - 9);
          ctx.lineTo(player.x + d * 16, player.y);
          ctx.lineTo(player.x + d * 6, player.y + 9);
          ctx.closePath();
          ctx.fillStyle = '#e8f4ff';
          ctx.fill();
        }
      }
      ctx.restore();
      // Vignette-Flash (Treffer-Rot)
      if (vignetteFlash > 0) {
        const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
        grad.addColorStop(0, 'rgba(255,20,20,0)');
        grad.addColorStop(1, 'rgba(255,20,20,' + (0.28 * vignetteFlash).toFixed(3) + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        vignetteFlash = Math.max(0, vignetteFlash - 0.02);
      }
    } catch (e) { /* Render defensiv (z.B. Stub-Context) */ }
    try { if (NH.ui && typeof NH.ui.updateHUD === 'function') NH.ui.updateHUD(NH.game.run); } catch (e) {}
  }

  /* ---------- Registrierung (Vertrag api.js; kein return/export) ---------- */
  NH.game.init = function (canvas, c2d) {
    if (inited) { ctx = c2d || (canvas && canvas.getContext ? canvas.getContext('2d') : null); return; }
    inited = true;
    ctx = c2d || (canvas && canvas.getContext ? canvas.getContext('2d') : null);
    NH.game.ctx = ctx;
    NH.game.state = GS.MENU;
    // Player-Pos-Hook für entities.js zur Laufzeit nachziehen (falls das
    // entities-Modul beim Laden keinen eigenen playerPos gesetzt hat)
    try {
      if (NH.ents && typeof NH.ents.playerPos !== 'function') {
        NH.ents.playerPos = function () { return { x: player.x, y: player.y }; };
      }
    } catch (e) {}
    NH.game.startLoop(); // main.boot -> init; Loop läuft ab hier
  };

  NH.game.state = GS.MENU;
  NH.game.run = null;
  NH.game.player = player;
  NH.game.ctx = null;
  NH.game.W = W; NH.game.H = H;
  // Live-Getter (Vertrag: NH.game.hitstop/shake/bossWarn sind Laufzeit-Werte)
  Object.defineProperty(NH.game, 'hitstop', {
    get: function () { return hitstop; }, set: function (v) { hitstop = Math.max(0, v || 0); }, configurable: true,
  });
  Object.defineProperty(NH.game, 'shake', {
    get: function () { return shake; }, set: function (v) { shake = Math.max(0, v || 0); }, configurable: true,
  });
  Object.defineProperty(NH.game, 'bossWarn', {
    get: function () { return bossWarn; }, set: function (v) { bossWarn = Math.max(0, v || 0); }, configurable: true,
  });
  // Rest bereits inline als Properties registriert (init, startNextWave,
  // enterShop, addScrap, spendScrap, dpsMultiplier, scrapMultiplier,
  // damagePlayer, gameOver, toMenu, startLoop) + deklarierte Helfers.
  NH.game.startRun = startRun;
  NH.game.resumeRun = resumeRun;
  NH.game.togglePause = togglePause;
  NH.game.update = update;
  NH.game.render = render;
  NH.game.snapshot = snapshot; // Run-Snapshot (Shop-Auto-Save, tester-freundlich)
})();