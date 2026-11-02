/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * waves.js — Wellen-Budget, Spawn-Queue, Skalierung, Bosse, Boni
 * Reine Funktionen + Queue-Build; keine DOM/Canvas/Event-Loadzeit-
 * Abhängigkeit. Zahlen ausschließlich aus balance.* (SSOT); nur
 * Vertrags-/Spec-Konstanten, die balance.js nicht führt, stehen hier.
 * Formeln lt. api.js, verifiziert: budget W1=10/W5=35/W10=91/W20=286,
 * hpMult W1=1.155/W5=1.875/W10=3.0/W20=6.0.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  /* ---------- Vertrags-/Spec-Konstanten (nicht in balance.js) ---------- */
  // Budget-Basis B(0)=6: SSOT balance.waves.spawnBudgetMin (B(w)=6+3w+0.55w²)
  const BUDGET_BASE = NH.balance.waves.spawnBudgetMin;
  // Gewichtete Typ-Auswahl (Spec): [id] = Gewicht
  const PICK_WEIGHTS = {
    scrapper: 20, stinger: 12, rusher: 14, brute: 8,
    splitter: 6, spiker: 5, wraith: 5, radiator: 5, mender: 3,
  };
  // Boss-Wellen: 20 % "Joker" auf vollen Pool statt Easy-Pool (Spec)
  const BOSS_JOKER = 0.20;
  // Burst-Fenster (Spec): Start 0.08+i*0.22, Spanne bis 0.90 der Dauer
  const BURST_START = 0.08, BURST_STEP = 0.22, WINDOW_END = 0.90, SPAWN_JITTER = 0.35;
  const WORLD_W = 1280, WORLD_H = 720; // feste Logik-Auflösung (Vertrag)
  const OFF_EDGE = 40;                 // Spawn außerhalb des Frames

  function findBoss(id) { return NH.balance.bosses.find((x) => x.id === id) || null; }

  /* ---------- Skalierung (balance.waves) ---------- */
  function budget(w) {
    const b = NH.balance.waves;
    return Math.round(BUDGET_BASE + b.spawnBudgetBonusPerWave * w + b.spawnBudgetQuadPerWave * w * w);
  }

  function hpMult(w) {
    const b = NH.balance.waves;
    return b.hpMultBase + b.hpMultPerWave * w + b.hpMultQuadPerWave * w * w;
  }

  function dmgMult(w) {
    const b = NH.balance.waves;
    return Math.min(b.enemyDmgCap, b.enemyDmgBase + b.enemyDmgPerWave * w);
  }

  function speedMult(w) {
    const b = NH.balance.waves;
    return Math.min(b.speedCap, Math.pow(b.speedPerWave, w));
  }

  /* ---------- Boss-Rhythmus (balance.bossEvery) ---------- */
  // w%5==0: ungerader Zyklus -> warden (5,15,25…), gerader -> cyclops (10,20,30…)
  function isBossWave(w) {
    const every = NH.balance.waves.bossEvery;
    if (!(w > 0) || w % every !== 0) return null;
    return (((w / every) | 0) % 2 === 1) ? 'warden' : 'cyclops';
  }

  // Wiederkehr-Zähler: 1 + floor((wave - Erstwelle) / 10)
  function occurrencesFor(boss, wave) {
    const cycle = NH.balance.waves.bossEvery * 2; // 10 = Zyklus beider Bosse
    return 1 + Math.max(0, Math.floor((wave - boss.waves) / cycle));
  }

  /* ---------- Typ-Auswahl (gewichtet, gated minWave) ---------- */
  function pickType(wave) {
    let pool = NH.balance.enemies.filter((e) => e.minWave <= wave && PICK_WEIGHTS[e.id] > 0);
    if (isBossWave(wave)) {
      // Boss-Wellen: wenig Trubel -> nur scrapper/stinger/rusher, außer Joker
      const easy = pool.filter((e) => e.id === 'scrapper' || e.id === 'stinger' || e.id === 'rusher');
      if (easy.length && Math.random() >= BOSS_JOKER) pool = easy;
    }
    if (!pool.length) return 'scrapper'; // Fallback (nur bei wave<1)
    let sum = 0;
    for (const e of pool) sum += PICK_WEIGHTS[e.id];
    let r = Math.random() * sum;
    for (const e of pool) { r -= PICK_WEIGHTS[e.id]; if (r < 0) return e.id; }
    return pool[pool.length - 1].id;
  }

  /* ---------- Spawn-Position pro Kante (0=oben,1=rechts,2=unten,3=links) ---------- */
  function edgePos(side) {
    switch (side) {
      case 0: return { x: NH.u.rand(0, WORLD_W), y: -OFF_EDGE };
      case 1: return { x: WORLD_W + OFF_EDGE, y: NH.u.rand(0, WORLD_H) };
      case 2: return { x: NH.u.rand(0, WORLD_W), y: WORLD_H + OFF_EDGE };
      default: return { x: -OFF_EDGE, y: NH.u.rand(0, WORLD_H) };
    }
  }

  /* ---------- Spawn-Queue ---------- */
  // 4 Bursts 40/30/20/10 % des Budgets; Boss-Wellen 80 % Minion-Budget.
  // Rieselverfahren: größte Reste bekommen übrige Spawns.
  function buildQueue(wave, duration) {
    const b = NH.balance.waves;
    if (!(duration > 0)) duration = isBossWave(wave) ? b.bossDuration : b.baseDuration;
    let total = budget(wave);
    if (isBossWave(wave)) total = Math.round(total * b.bossMinionBudgetMult);

    const counts = [], fracs = [];
    let assigned = 0;
    for (let i = 0; i < b.spawnBurstCount; i++) {
      const exact = total * b.spawnBurstRatio[i];
      counts.push(Math.floor(exact));
      fracs.push(exact - counts[i]);
      assigned += counts[i];
    }
    const byFrac = fracs.map((_, i) => i).sort((i, j) => fracs[j] - fracs[i] || i - j);
    for (let k = 0; k < total - assigned; k++) counts[byFrac[k]]++;

    // Zeiten: Burst i startet bei duration*(0.08+i*0.22), Fenster endet bei 0.90
    const minGap = 1 / b.spawnCapPerSec; // Cap 12/s -> min. 1/12 s Abstand
    const times = [];
    for (let i = 0; i < b.spawnBurstCount; i++) {
      const n = counts[i];
      if (n <= 0) continue;
      let start = duration * (BURST_START + i * BURST_STEP);
      if (i === 0) start = Math.max(start, b.spawnStartDelay); // 2 s Gnadenfrist
      const end = Math.min(start + duration * BURST_STEP, duration * WINDOW_END);
      const span = Math.max(end - start, 0.001);
      const step = span / n;
      const jit = step * SPAWN_JITTER;
      for (let k = 0; k < n; k++) {
        times.push(start + (k + 0.5) * step + (Math.random() * 2 - 1) * jit);
      }
    }
    times.sort((a, c) => a - c);
    let prev = -Infinity;
    for (let i = 0; i < times.length; i++) {
      if (times[i] < prev + minGap) times[i] = prev + minGap; // Überlast -> strecken
      prev = times[i];
    }

    return times.map((at) => {
      const side = NH.u.randi(0, 3);
      const pos = edgePos(side);
      return { type: pickType(wave), at: Math.round(at * 1000) / 1000, side, x: pos.x, y: pos.y };
    });
  }

  /* ---------- Boni ---------- */
  // Wellen-Bonus: (15+3w) * (1.05 bei Schnellstart), ganzzahlig
  function waveBonus(w, quick) {
    const econ = NH.balance.economy, wv = NH.balance.waves;
    const base = econ.waveBonusBase + econ.waveBonusPerWave * w;
    return Math.round(base * (quick ? 1 + wv.quickStartBonus : 1));
  }

  // Boss-Bonus: scrapBonus (+30 % je Wiederkehr) + scrapPerWave*welle
  function bossBonus(bossId, wave) {
    const boss = findBoss(bossId);
    if (!boss) return 0;
    const occ = occurrencesFor(boss, wave);
    const g = 1 + boss.growPerReturn;
    return Math.round(boss.scrapBonus * Math.pow(g, occ - 1)) + boss.scrapPerWave * wave;
  }

  // Boss-Def mit HP/Speed-Mults + Wiederkehr +30 %; beide Signaturen:
  // recomputeBoss(bossId, wave) oder recomputeBoss(def, bossId, wave)
  function recomputeBoss(def, bossId, wave) {
    if (typeof def === 'string') { wave = bossId; bossId = def; def = findBoss(bossId); }
    if (!def) return null;
    const occ = occurrencesFor(def, wave);
    const g = 1 + def.growPerReturn;
    return Object.assign({}, def, {
      hp: def.hp * hpMult(wave) * Math.pow(g, occ - 1),
      speed: def.speed * speedMult(wave),
      scrapBonus: Math.round(def.scrapBonus * Math.pow(g, occ - 1)) + def.scrapPerWave * wave,
      occurrences: occ,
    });
  }

  /* ---------- Registrierung (api.js-Vertrag) ---------- */
  NH.waves = {
    budget, hpMult, dmgMult, speedMult, isBossWave,
    buildQueue, pickType, waveBonus, bossBonus, recomputeBoss,
  };
})();
