/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * meta.js — Meta-Economy: Bank, Shards, Daily, Streak, Offline,
 *           Weekly, Operator-Level, Achievements, Prestige
 * Alle Zahlen kommen aus NH.balance (Single Source of Truth).
 * Lade-Reihenfolge: ... save -> meta -> ... (Laufzeit-Abhängigkeit)
 * ============================================================ */
(function () {
  'use strict';
  var NH = (window.NH = window.NH || {});
  var B = NH.balance;       // Balance-Zahlen
  var ec = B.economy;       // Wirtschaftszahlen
  var AC = B.achievements;  // Ach-Definitionen

  var S = null;             // Alias auf NH.save.data (wird in init() gesetzt)

  /* ---------- Helfers ---------- */
  function dayStr(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); // lokaler Tag
  }

  /* ISO-Kalenderwoche (lokal): Mo=Start, So=7, Donnerstagstrick */
  function weekKey(ts) {
    var d = new Date(ts);
    var day = d.getDay() || 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - day);
    var y = d.getFullYear();
    var jan1 = new Date(y, 0, 1);
    return y * 100 + (Math.floor((d - jan1) / 86400000 / 7) + 1);
  }

  function fmtT(path, val) {
    // NH.t liefert Roh-String mit %s-Platzhalter -> einsetzen
    return String(NH.t(path)).replace('%s', val);
  }

  function saveNow() {
    if (NH.save && NH.save.save) NH.save.save(); // debounced in save.js
  }

  /* ---------- Init: Save-Daten sicherstellen ----------
     Wird über NH.meta.init() (main.boot), 'nh:init'-Event oder lazy
     beim ersten öffentlichen Aufruf ausgeführt. Idempotent: läuft auch
     nach save.reset() erneut (S wird immer auf das aktuelle Objekt
     umgehängt; Defaults werden nur bei fehlenden Feldern gesetzt). */
  function init() {
    var d = NH.save && NH.save.data;
    if (!d) return; // save.js noch nicht geladen
    S = d;

    if (typeof d.bank !== 'number') d.bank = 0;
    if (!d.shards || typeof d.shards !== 'object') d.shards = {};
    for (var i = 0; i < B.shards.length; i++) {
      var k = B.shards[i].id;
      if (typeof d.shards[k] !== 'number') d.shards[k] = 0;
    }
    if (typeof d.prestige !== 'number') d.prestige = 0;
    if (typeof d.lastDaily !== 'number') d.lastDaily = 0;
    if (typeof d.streak !== 'number') d.streak = 0;
    if (typeof d.dayIndex !== 'number') d.dayIndex = 0;
    if (typeof d.claimedToday !== 'boolean') d.claimedToday = false;
    if (typeof d.offlineTs !== 'number') d.offlineTs = Date.now();
    if (!d.weekly || typeof d.weekly !== 'object') d.weekly = {};
    if (typeof d.weekly.key !== 'number') d.weekly.key = 0;
    if (typeof d.weekly.id !== 'string') d.weekly.id = 'piercerKills';
    if (typeof d.weekly.progress !== 'number') d.weekly.progress = 0;
    if (typeof d.weekly.done !== 'boolean') d.weekly.done = false;
    if (!d.lifetime || typeof d.lifetime !== 'object') d.lifetime = {};
    var lt = d.lifetime;
    if (typeof lt.kills !== 'number') lt.kills = 0;
    if (typeof lt.bankTotal !== 'number') lt.bankTotal = 0;
    if (typeof lt.maxWave !== 'number') lt.maxWave = 0;
    if (typeof lt.bestCombo !== 'number') lt.bestCombo = 0;
    if (typeof lt.weaponsMax !== 'number') lt.weaponsMax = 0;
    if (typeof lt.weaponsOwned !== 'number') lt.weaponsOwned = 0;
    if (typeof lt.bossesKilled !== 'number') lt.bossesKilled = 0;
    if (typeof lt.prestiges !== 'number') lt.prestiges = 0;
    if (typeof lt.runs !== 'number') lt.runs = 0;
    if (typeof lt.weekliesDone !== 'number') lt.weekliesDone = 0;
    if (typeof lt.runEarned !== 'number') lt.runEarned = 0;
    if (!d.achievements || typeof d.achievements !== 'object') d.achievements = {};

    // Interne Buchhaltung (bleibt im Save, damit nach Reload kein Doppel-Bonus)
    if (typeof d._opLvTracked !== 'number') d._opLvTracked = operatorLevel();
    if (typeof d._lastDayStr !== 'string') d._lastDayStr = '';

    dailyRefresh();
    weeklyNew();
    saveNow();
  }

  function ensureInit() {
    if ((!S || S !== NH.save.data) && NH.save && NH.save.data) init();
  }

  /* ---------- Wirtschaft: Bank ----------
     Jede Buchung: bank += n; lifetime.bankTotal += n; operatorCheck;
     'nh:meta'; save (debounced). */
  function addBank(n, src) {
    if (!S) return;
    S.bank += n;
    S.lifetime.bankTotal += n;
    operatorCheck(); // Rekursion ok: Level ist danach +1 -> bricht ab
    NH.events.emit('nh:meta', { n: n, src: src || null });
    saveNow();
  }

  function bank() { ensureInit(); return S ? S.bank : 0; }

  function shards() {
    ensureInit();
    var out = { hp: 0, dmg: 0, speed: 0, startscrap: 0, wlevel: 0 };
    if (S) for (var i = 0; i < B.shards.length; i++) out[B.shards[i].id] = S.shards[B.shards[i].id] || 0;
    return out;
  }

  function prestige() { ensureInit(); return S ? S.prestige : 0; }

  /* ---------- Shard-Boni (Werte aus balance.player) ---------- */
  function shardBonus() {
    ensureInit();
    var sh = shards();
    var hpLv = sh.hp, dmgLv = sh.dmg, spdLv = sh.speed;
    var ssc = sh.startscrap, wlv = sh.wlevel;
    return {
      hpMult: 1 + B.player.shardMaxHPPer * hpLv,
      dmgMult: 1 + B.player.shardDmgPer * dmgLv,
      speedMult: 1 + B.player.shardSpeedPer * spdLv,
      startScrap: B.player.shardStartScrap * ssc,
      startWeaponLevel: wlv, // Anzahl EXTRA-Level (0..5); game.js wendet 1 + level (Cap 6) an
    };
  }

  /* ---------- Operator-Level ---------- */
  function operatorLevel() {
    ensureInit();
    return S ? Math.floor(S.lifetime.bankTotal / ec.operatorLevelInterval) : 0;
  }

  /* Level-Cross: Toast + sofort 10 Scrap Bank (je 100 Netto-Bank).
     tracked speichert das zuletzt vergütete Level; die Bonus-Buchung
     selbst erhöht bankTotal und damit ggf. das Level ein weiteres Mal
     -> Rekursion ist genau auf die gekreuzten Level begrenzt. */
  function operatorCheck() {
    ensureInit();
    if (!S) return;
    var lvl = operatorLevel();
    var tracked = S._opLvTracked || 0;
    if (lvl > tracked) {
      S._opLvTracked = lvl;
      NH.events.emit('nh:toast', { text: fmtT('meta.opLv', lvl) + ' — ' + fmtT('meta.opBonus', ec.operatorLevelBonus), color: '#7CFC00' });
      addBank(ec.operatorLevelBonus, 'operator');
    }
  }

  /* ---------- Daily / Streak ----------
     Tagwechsel anhand lokalem Datumstring. Am neuen Tag:
     claimedToday=false, dayIndex (streak>=7 ? +1 mod 7 : +1, cap 6),
     Streak: Claim < 48 h -> +1 (bei Rückkehr zu Tag 0 zurück auf 1), sonst 1. */
  function dailyRefresh() {
    if (!S) return;
    var today = dayStr(Date.now());
    if (S._lastDayStr === today) return;
    var st = computeDailyState(S.lastDaily, S.streak, S.dayIndex, today, S._lastDayStr);
    S._lastDayStr = today;
    S.streak = st.streak;
    S.dayIndex = st.dayIndex;
    S.claimedToday = false;
  }

  /* Reine Berechnung (testbar, ohne Save zu mutieren) */
  function computeDailyState(lastDaily, streak, dayIndex, today, prevDay) {
    if (prevDay === today) return { streak: streak, dayIndex: dayIndex };
    if (!lastDaily) return { streak: 1, dayIndex: 0 }; // erste Session
    var gap = Date.now() - lastDaily;
    if (gap >= 48 * 3600000) return { streak: 1, dayIndex: 0 }; // Streak gerissen
    var cycle = ec.dailyRewards.length; // 7 Tage
    var ns = streak + 1;
    var ndi = streak >= cycle ? (dayIndex + 1) % cycle : Math.min(cycle - 1, dayIndex + 1);
    if (ndi === 0) ns = 1; // Woche komplett -> neue Serie beginnt
    return { streak: ns, dayIndex: ndi };
  }

  function dailyInfo() {
    ensureInit();
    dailyRefresh();
    if (!S) return { dayIndex: 0, reward: ec.dailyRewards[0], claimed: true, streak: 0, double: false };
    var idx = S.dayIndex >= 0 && S.dayIndex < ec.dailyRewards.length ? S.dayIndex : 0;
    var base = ec.dailyRewards[idx];
    var dbl = S.streak >= ec.dailyStreakDouble;
    return { dayIndex: idx, reward: dbl ? base * 2 : base, claimed: !!S.claimedToday, streak: S.streak, double: dbl };
  }

  /* Claim: nur wenn !claimedToday; +Bank (ggf. x2 ab 7-Tage-Serie) */
  function claimDaily() {
    ensureInit();
    dailyRefresh();
    if (!S || S.claimedToday) return false;
    S.claimedToday = true;
    S.lastDaily = Date.now();
    addBank(dailyInfo().reward, 'daily');
    return true;
  }

  /* ---------- Offline-Reward ----------
     Minuten seit offlineTs (Cap 480), Reward aus balance.offline
     (unterste Stufe, unter der Schwelle 0). Nur bei >0: offlineTs=now. */
  function offlineReward() {
    ensureInit();
    if (!S) return null;
    var mins = Math.floor((Date.now() - S.offlineTs) / 60000);
    if (mins <= 0) return null;
    var capped = Math.min(mins, ec.offlineCapHours * 60);
    var reward = 0;
    for (var i = B.offline.minutes.length - 1; i >= 0; i--) {
      if (capped >= B.offline.minutes[i]) { reward = B.offline.rewards[i]; break; }
    }
    if (reward > 0) {
      S.offlineTs = Date.now();
      addBank(reward, 'offline');
      return { minutes: capped, scrap: reward };
    }
    return null;
  }

  /* ---------- Weekly ----------
     Ziel 200 (Design-Spezifikation; balance kann es künftig tragen). */
  function weeklyTarget() {
    return NH.balance.weeklyChallengeTarget || 200;
  }

  function weeklyInfo() {
    ensureInit();
    if (!S) return { id: '', progress: 0, target: weeklyTarget(), done: false, reward: ec.weeklyChallengeReward, desc: '' };
    var w = S.weekly;
    return { id: w.id, progress: w.progress, target: weeklyTarget(), done: !!w.done, reward: ec.weeklyChallengeReward, desc: '' };
  }

  /* weeklyAdd: nur wenn weekly.id == typeId && !done; progress max target;
     bei Erreichen: done + Belohnung + weekliesDone++ */
  function weeklyAdd(n, typeId) {
    ensureInit();
    if (!S || !typeId) return;
    var w = S.weekly;
    if (w.done || w.id !== typeId) return;
    var tgt = weeklyTarget();
    w.progress = Math.min(tgt, w.progress + n);
    NH.events.emit('nh:meta', { type: 'weeklyProgress' });
    if (w.progress >= tgt) {
      w.done = true;
      S.lifetime.weekliesDone += 1;
      addBank(ec.weeklyChallengeReward, 'weekly');
    }
    saveNow();
  }

  /* Neue Woche (Kalenderwoche gewechselt): neues Ziel + progress 0 */
  function weeklyNew() {
    ensureInit();
    if (!S) return;
    var k = weekKey(Date.now());
    if (S.weekly.key !== k) {
      S.weekly.key = k;
      S.weekly.id = ['piercerKills', 'chainboltKills', 'triplaserKills', 'flareKills'][Math.floor(Math.random() * 4)];
      S.weekly.progress = 0;
      S.weekly.done = false;
      NH.events.emit('nh:meta', { type: 'weeklyNew' });
    }
  }

  /* ---------- Achievements ---------- */
  function findAch(id) {
    for (var i = 0; i < AC.length; i++) if (AC[i].id === id) return AC[i];
    return null;
  }

  /* Fortschritt je Ach aus lifetime (per-run: scrap_econ) */
  function achValue(a) {
    if (!S) return 0;
    var lt = S.lifetime;
    switch (a.check) {
      case 'kills': return lt.kills;
      case 'maxWave': return lt.maxWave;
      case 'bestCombo': return lt.bestCombo;
      case 'weaponMax': // 'Erste Waffe auf Lv 10': weaponsMax ist das höchste je erreichte Waffen-Level
        return lt.weaponsMax >= maxWeaponLevel() ? 1 : 0;
      case 'weaponsOwned': return lt.weaponsOwned;
      case 'bossesKilled': return lt.bossesKilled;
      case 'bankTotal': return lt.bankTotal;
      case 'prestiges': return lt.prestiges;
      case 'dailyStreak': return S.streak;
      case 'weekliesDone': return lt.weekliesDone;
      case 'runs': return lt.runs;
      case 'runEarned': return lt.runEarned;
      default: return 0;
    }
  }

  function maxWeaponLevel() {
    var m = 0;
    for (var i = 0; i < B.weapons.length; i++) if (B.weapons[i].maxLevel > m) m = B.weapons[i].maxLevel;
    return m; // 10 (Blaster)
  }

  /* Für jede nicht unlocked/done Ach: Fortschritt prüfen; beim Erreichen
     unlocked=true + 'nh:ach'; KEIN Auto-Claim. perRun-Achs exklusiv in
     runStatsUpdate (Erfolg entsteht im Run, nicht in lifetime). */
  function checkAchievements() {
    ensureInit();
    if (!S) return;
    for (var i = 0; i < AC.length; i++) {
      var a = AC[i];
      if (a.perRun) continue;
      var rec = S.achievements[a.id];
      if (!rec) rec = S.achievements[a.id] = { unlocked: false, claimed: false };
      if (rec.unlocked) continue;
      if (achValue(a) >= a.target) {
        rec.unlocked = true;
        NH.events.emit('nh:ach', { id: a.id });
        NH.events.emit('nh:meta', { type: 'ach' });
      }
    }
    saveNow();
  }

  function claimAchievement(id) {
    ensureInit();
    var a = findAch(id);
    if (!a || !S) return false;
    var rec = S.achievements[id];
    if (!rec || !rec.unlocked || rec.claimed) return false;
    rec.claimed = true;
    addBank(a.reward, 'ach');
    return true;
  }

  function achProgress(id) {
    ensureInit();
    var a = findAch(id);
    if (!a) return { cur: 0, target: 1, unlocked: false, claimed: false };
    var rec = S ? S.achievements[id] : null;
    var cur = rec && rec.unlocked ? a.target : Math.min(a.target, S ? achValue(a) : 0);
    return { cur: cur, target: a.target, unlocked: !!(rec && rec.unlocked), claimed: !!(rec && rec.claimed) };
  }

  /* ---------- Run-Ende: Lifetime + Achs ----------
     runStats: {kills, bestCombo, maxWave, bossesKilled, earnedThisRun,
                weaponMaxLv, weaponsOwned} (Format aus game.js) */
  var prevRunStats = null; // Schutz: gleicher stats-Ref nicht doppelt zählen
  function runStatsUpdate(runStats) {
    ensureInit();
    if (!S || !runStats || runStats === prevRunStats) return;
    prevRunStats = runStats;
    var lt = S.lifetime;
    // earnedThisRun fehlt bei Runs, die vor dem ersten Shop enden
    // (game fuellt stats.scrapEarned) -> Fallback, damit Ach nicht verloren geht
    var earned = runStats.earnedThisRun || runStats.scrapEarned || 0;
    lt.kills += runStats.kills || 0;
    lt.bossesKilled += runStats.bossesKilled || 0;
    lt.runs += 1;
    if ((runStats.maxWave || 0) > lt.maxWave) lt.maxWave = runStats.maxWave;
    if ((runStats.bestCombo || 0) > lt.bestCombo) lt.bestCombo = runStats.bestCombo;
    if ((runStats.weaponMaxLv || 0) > lt.weaponsMax) lt.weaponsMax = runStats.weaponMaxLv;
    if ((runStats.weaponsOwned || 0) > lt.weaponsOwned) lt.weaponsOwned = runStats.weaponsOwned;
    if (earned > lt.runEarned) lt.runEarned = earned;

    // per-run-Ach: Ziel aus balance (scrap_econ: 5000 in einem Run)
    var econAch = findAch('scrap_econ');
    if (econAch && earned >= econAch.target) {
      var rec = S.achievements.scrap_econ;
      if (!rec) rec = S.achievements.scrap_econ = { unlocked: false, claimed: false };
      if (!rec.unlocked) {
        rec.unlocked = true;
        NH.events.emit('nh:ach', { id: 'scrap_econ' });
        NH.events.emit('nh:meta', { type: 'ach' });
      }
    }
    checkAchievements();
    saveNow();
  }

  /* ---------- Prestige ----------
     Kosten je Ziel-Rang: 2000 * 1.9^Rang (Rang 1 = erste Prestige = 2000,
     Rang 2 = 3800). Exponent ist die Zahl der abgeschlossenen Prestiges. */
  function prestigeCost() {
    ensureInit();
    return Math.floor(ec.prestigeBaseCost * Math.pow(ec.prestigeGrow, prestige()));
  }

  function doPrestige() {
    ensureInit();
    if (!S) return false;
    var cost = prestigeCost();
    if (S.bank < cost) return false;
    S.bank -= cost;
    S.prestige += 1;
    S.lifetime.prestiges += 1;
    S.runSave = null; // Run-Fortschritt löschen; Shards bleiben
    NH.events.emit('nh:toast', { text: fmtT('meta.prestigeTitle', S.prestige) + ' — ' + NH.t('meta.prestigeGet'), color: '#FFD700' });
    NH.events.emit('nh:meta', { type: 'prestige' });
    checkAchievements();
    saveNow();
    return true;
  }

  /* ---------- Events (lose Kopplung) ----------
     kill -> weekly (Typ-Präfix) + lifetime.kills
     bossDie / waveEnd -> lifetime-Zähler + Ach-Scan (debounced, max 1×/s)
     gameover -> runStatsUpdate({stats}) */
  /* Waffen-ID -> Weekly-Kill-Typ (nur die 4 Weekly-nehmenden Waffen;
     andere Waffen tragen keine Wochenchallenge). */
  function weaponKillType(wid) {
    switch (wid) {
      case 'piercer': return 'piercerKills';
      case 'chainbolt': return 'chainboltKills';
      case 'triplaser': return 'triplaserKills';
      case 'flamer': return 'flareKills';
      default: return null;
    }
  }

  function onKill(d) {
    ensureInit();
    if (!S || !d) return;
    S.lifetime.kills += 1;
    // Weekly: Add via Waffen-Kill-Typ; weeklyAdd prüft selbst den Match.
    // Zusätzlich als Gegner-Typ, falls eine Woche darauf basiert.
    weeklyAdd(1, weaponKillType(d.weaponId));
    if (d.type) weeklyAdd(1, d.type);
    scheduleAchCheck();
  }

  function onBossDie() {
    ensureInit();
    if (!S) return;
    S.lifetime.bossesKilled += 1;
    scheduleAchCheck();
  }

  function onWaveEnd(d) {
    ensureInit();
    if (!S || !d) return;
    if ((d.wave || 0) > S.lifetime.maxWave) {
      S.lifetime.maxWave = d.wave;
      scheduleAchCheck();
    }
  }

  function onGameover(d) {
    if (d && d.stats) runStatsUpdate(d.stats);
  }

  var achTimer = null;
  function scheduleAchCheck() {
    if (achTimer !== null) return;
    achTimer = setTimeout(function () {
      achTimer = null;
      checkAchievements();
    }, 1000);
  }

  /* ---------- Registration ---------- */
  NH.meta = {
    init: init,
    addBank: addBank,
    bank: bank,
    shards: shards,
    prestige: prestige,
    shardBonus: shardBonus,
    operatorLevel: operatorLevel,
    operatorCheck: operatorCheck,
    dailyInfo: dailyInfo,
    claimDaily: claimDaily,
    offlineReward: offlineReward,
    weeklyInfo: weeklyInfo,
    weeklyAdd: weeklyAdd,
    weeklyNew: weeklyNew,
    checkAchievements: checkAchievements,
    claimAchievement: claimAchievement,
    achProgress: achProgress,
    runStatsUpdate: runStatsUpdate,
    prestigeCost: prestigeCost,
    doPrestige: doPrestige,
    // interne, testbare Helfers (additiv, nicht Teil des Vertrags)
    computeDailyState: computeDailyState,
    weeklyTarget: weeklyTarget,
  };

  /* Listener am internen Event-Bus (kein DOM): Events feuern erst zur
     Laufzeit, daher ist die Registrierung beim Laden unkritisch. */
  NH.events.on('nh:kill', onKill);
  NH.events.on('nh:bossDie', onBossDie);
  NH.events.on('nh:waveEnd', onWaveEnd);
  NH.events.on('nh:gameover', onGameover);
  NH.events.on('nh:init', init);
})();