/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * balance.js — ALLE Balancing-Zahlen (Single Source of Truth)
 * 1:1 aus der finalen Design-Spezifikation (Workflow-Synthese 01.11.2026)
 * Engine-Code darf NIEMALS eigene Balance-Werte hartkodieren.
 * ============================================================ */
(function () {
  'use strict';
  window.NH = window.NH || {};

  NH.balance = {
    version: 1,

    /* ---------- Wellen / Schwierigkeit ---------- */
    waves: {
      baseDuration: 60,        // s pro Kampfwelle
      bossDuration: 90,        // s Boss-Wellen
      shopDuration: 25,        // s Shop-Phase (Pause)
      spawnBudgetMin: 6,       // SSOT-Basis für B(w) = 6 + 3w + 0.55 w^2 (quartalskommentar unten)
      spawnBudgetBonusPerWave: 3,
      spawnBudgetQuadPerWave: 0.55,
      spawnBurstRatio: [0.40, 0.30, 0.20, 0.10],
      spawnBurstCount: 4,
      spawnCapPerSec: 12,
      spawnStartDelay: 2,
      maxConcurrent: 150,      // Gegner-Cap (Overflow -> sofortiger Scrap-Drop)
      hpMultBase: 1.0,         // HPmult = 1 + 0.15w + 0.005 w^2
      hpMultPerWave: 0.15,
      hpMultQuadPerWave: 0.005,
      enemyDmgBase: 1.0,       // Gegnerschaden * (1 + 0.04w), Cap 3.0
      enemyDmgPerWave: 0.04,
      enemyDmgCap: 3.0,
      speedPerWave: 1.02,      // Speed * 1.02^Welle, Cap 2.5
      speedCap: 2.5,
      bossEvery: 5,            // Warden: 5,15,25 ; Cyclops: 10,20,30
      bossMinionBudgetMult: 0.8,
      bossWarnTime: 8,         // s Warnbanner+Sirene vor Boss-Welle
      quickStartBonus: 0.05,   // +5 % Wellen-Bonus bei Start in 5 s nach Clear (Welle 5+)
      quickStartWindow: 5,     // s
      quickStartMinWave: 5,
      expectedWaveDeath: 20,   // Prestige-Freischaltung
    },

    /* ---------- Wirtschaft ---------- */
    economy: {
      bankSafeRatio: 0.80,     // 80 % des Scraps sind bei Tod sicher
      waveBonusBase: 15,       // Wellen-Bonus = 15 + 3*w
      waveBonusPerWave: 3,
      cometiveCombo5: 2,       // Combo x5 = 2x Scrap (nicht Konfig, dokumentiert)
      comboMultiplierAt: 5,
      comboDmgAt: 7,           // Combo x7 = +10 % Schaden 5 s
      comboDmgBonus: 0.10,
      comboDmgDuration: 5,
      comboWindow: 2,          // s
      rerollCost: 25,
      rerollMax: 2,
      sellRefundRatio: 0.50,
      hotDealCount: 2,
      hotDealDiscount: 0.10,
      hotDealDuration: 10,     // s Countdown
      prestigeMinWave: 20,
      prestigeBaseCost: 2000,  // je Rang: 2000 * 1.9^(Rang-1)
      prestigeGrow: 1.9,
      offlineCapHours: 8,
      dailyRewards: [50, 100, 150, 250, 400, 650, 1000],
      dailyStreakDouble: 7,    // ab 7-Tage-Streak x2 auf alle Belohnungen
      weeklyChallengeReward: 500,
      weeklyChallengeTarget: 200, // Wochenziel: 200 Kills mit Ziel-Waffe
      operatorLevelInterval: 100, // je 100 Scrap Netto-Bank -> +1 Operator-Level -> +10 Scrap sofort
      operatorLevelBonus: 10,
    },

    /* ---------- Spieler-Basis ---------- */
    player: {
      baseMaxHP: 60,
      baseSpeed: 240,          // px/s
      baseRegen: 0,
      baseMagnet: 90,          // px
      baseDodge: 0,            // 0..1
      baseCrit: 0.05,          // 0..1 Crit = x2 (SSOT-Basis, api-Vertrag rollCrit = baseCrit + run.crit)
      baseRadius: 14,
      shardMaxHPPer: 0.05,
      shardDmgPer: 0.04,
      shardSpeedPer: 0.03,
      shardStartScrap: 25,
      shardStartWeaponLevel: 6, // erste Waffe startet auf Lv 6 (bei vollem Shard-Track; +1 je Level)
    },

    /* ---------- Waffen (10) — Kauf + Upgrade-Kern ---------- */
    // upgradeBase: Kosten je Level = upgradeBase * Level
    // milestones: Lv3 +5 % Feuerrate, Lv6 +1 Projektil (oder +15 % Schaden), Max = +15 % Feuerrate
    weapons: [
      {
        id: 'blaster', name: 'Blaster', role: 'Starter',
        price: 0, icon: 'B', color: '#E8A45C',
        dmg: 25, fireRate: 4, projectiles: 1, speed: 520, range: 420,
        pierce: 0, spreadDeg: 0, pattern: 'single', knockback: 0.10,
        maxLevel: 10, upgradeBase: 40, upgradeDmg: 5, upgradeRate: 0.05 / 3, // je Level Feuer +5 % aufgeteilt in Milestones
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: 'Zuverlässige Single-Shot-Linie.'
      },
      {
        id: 'scattergun', name: 'Scattergun', role: 'Crowd-Clear',
        price: 80, icon: 'SG', color: '#E8A45C',
        dmg: 12, fireRate: 0.8, projectiles: 5, speed: 460, range: 240,
        pierce: 0, spreadDeg: 60, pattern: 'cone', knockback: 0.15,
        maxLevel: 8, upgradeBase: 40, upgradeDmg: 2, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: '5-Kugel-Kegel für Nahkampf-Horden.'
      },
      {
        id: 'piercer', name: 'Piercer', role: 'Line Pierce',
        price: 120, icon: 'P', color: '#35D2E8',
        dmg: 40, fireRate: 1.6, projectiles: 1, speed: 560, range: 600,
        pierce: 2, spreadDeg: 0, pattern: 'pierce', knockback: 0.10,
        maxLevel: 5, upgradeBase: 40, upgradeDmg: 4, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'dmg', milestoneMax: 'rate',
        desc: 'Durchschlägt Reihen, bricht Mender-Schutz.'
      },
      {
        id: 'chainbolt', name: 'Chainbolt', role: 'Multi-Stun',
        price: 140, icon: 'CB', color: '#35D2E8',
        dmg: 30, fireRate: 1.2, projectiles: 1, speed: 0, range: 0,
        pierce: 0, spreadDeg: 0, pattern: 'chain', knockback: 0, chainTargets: 4, chainRadius: 160, stun: 0.1,
        maxLevel: 6, upgradeBase: 40, upgradeDmg: 4, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: 'Blitz springt zwischen Gegnern, stunnt.'
      },
      {
        id: 'triplaser', name: 'Triplaser', role: 'Fan Suppress',
        price: 160, icon: 'TL', color: '#35D2E8',
        dmg: 22, fireRate: 3, projectiles: 3, speed: 600, range: 480,
        pierce: 0, spreadDeg: 25, pattern: 'fan', knockback: 0.05,
        maxLevel: 5, upgradeBase: 40, upgradeDmg: 2, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: 'Drei parallele Strahlen, breite Flächenwirkung.'
      },
      {
        id: 'nova', name: 'Nova', role: 'AoE Bomb',
        price: 180, icon: 'N', color: '#E8A45C',
        dmg: 65, fireRate: 0.7, projectiles: 1, speed: 300, range: 0,
        pierce: 0, spreadDeg: 0, pattern: 'aoe', knockback: 0, aoeRadius: 130,
        maxLevel: 6, upgradeBase: 40, upgradeDmg: 10, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: 'Orb explodiert am Ziel mit Flächenradius.'
      },
      {
        id: 'tesla', name: 'Tesla Coil', role: 'Deploy Tower',
        price: 200, icon: 'TC', color: '#35D2E8',
        dmg: 40, fireRate: 1, projectiles: 0, speed: 0, range: 150,
        pierce: 0, spreadDeg: 0, pattern: 'turret', knockback: 0, turretDuration: 6, turretMax: 2, turretCooldown: 1,
        maxLevel: 5, upgradeBase: 40, upgradeDmg: 6, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: 'Stationärer Turm, 6 s, chaint zwischen Zielen.'
      },
      {
        id: 'flamer', name: 'Flamer', role: 'DoT Cone',
        price: 220, icon: 'F', color: '#E8A45C',
        dmg: 8, fireRate: 2.5, projectiles: 0, speed: 0, range: 180,
        pierce: 0, spreadDeg: 45, pattern: 'cone', knockback: 0, dotDmg: 8, dotDuration: 3, dotMaxStack: 3,
        maxLevel: 5, upgradeBase: 40, upgradeDmg: 3, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: 'Feuerkegel mit Brennen (8/s, 3 s, 3 Stacks).'
      },
      {
        id: 'mines', name: 'Orbit Mines', role: 'Bodyguard',
        price: 240, icon: 'OM', color: '#E8A45C',
        dmg: 60, fireRate: 0.5, projectiles: 4, speed: 0, range: 70,
        pierce: 0, spreadDeg: 0, pattern: 'orbit', knockback: 0, orbitRadius: 70, mineAoe: 60, mineRespawn: 2,
        maxLevel: 4, upgradeBase: 40, upgradeDmg: 10, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'projectile', milestoneMax: 'rate',
        desc: '4 Minen kreisen um den Spieler, 360°-Schutz.'
      },
      {
        id: 'railgun', name: 'Railgun', role: 'Boss Slayer',
        price: 300, icon: 'R', color: '#E8A45C',
        dmg: 400, fireRate: 0.5, projectiles: 1, speed: 1200, range: 3400,
        pierce: 0, spreadDeg: 0, pattern: 'pierce', knockback: 0.3, hitStop: 0.06, railPierce: 999,
        maxLevel: 4, upgradeBase: 40, upgradeDmg: 150, upgradeRate: 0.05 / 3,
        milestone3: 'rate', milestone6: 'dmg', milestoneMax: 'rate',
        desc: 'Durchschlägt alles. Hit-Stop. Boss-Killer.'
      },
    ],

    /* ---------- Gegner (9 + 2 Bosse) ---------- */
    // HP skaliert mit HPmult; Schaden mit (1+0.04w) Cap 3; Speed 1.02^w Cap 2.5
    enemies: [
      { id: 'scrapper', name: 'Scrapper', role: 'Standard', hp: 60, speed: 110, radius: 16, contact: 10, scrap: 5, minWave: 1, knockRes: 0 },
      { id: 'stinger', name: 'Stinger', role: 'Ranged', hp: 45, speed: 70, radius: 14, contact: 8, scrap: 4, minWave: 2, keepDist: 220, shootEvery: 2.2, shootDmg: 12, shootSpeed: 320 },
      { id: 'rusher', name: 'Rusher', role: 'Glass Cannon', hp: 30, speed: 170, radius: 12, contact: 8, scrap: 3, minWave: 3, zigzag: 1 },
      { id: 'brute', name: 'Brute', role: 'Tank', hp: 260, speed: 55, radius: 26, contact: 38, scrap: 18, minWave: 4, knockRes: 0.8 },
      { id: 'splitter', name: 'Splitter', role: 'Splitter', hp: 90, speed: 90, radius: 18, contact: 10, scrap: 7, minWave: 5, splitsInto: 'mini', splitCount: 3, miniHp: 25, miniSpeed: 140, miniContact: 6, miniScrap: 3 },
      { id: 'spiker', name: 'Spiker', role: 'Suicide', hp: 70, speed: 150, radius: 14, contact: 5, scrap: 5, minWave: 6, explodeDist: 80, explodeAoe: 90, explodeDmg: 45, priority: 1 },
      { id: 'wraith', name: 'Wraith', role: 'Blinker', hp: 100, speed: 130, radius: 15, contact: 10, scrap: 6, minWave: 7, blinkEvery: 3, blinkDuration: 0.35 },
      { id: 'radiator', name: 'Radiator', role: 'Slow Aura', hp: 140, speed: 85, radius: 18, contact: 10, scrap: 7, minWave: 8, auraRadius: 160, slowFactor: 0.2 },
      { id: 'mender', name: 'Mender', role: 'Healer', hp: 120, speed: 60, radius: 16, contact: 8, scrap: 8, minWave: 10, healRadius: 140, healPerSec: 15, priority: 1 },
    ],

    bosses: [
      {
        id: 'warden', name: 'WARDEN', role: 'Boss', waves: 5,
        hp: 4000, speed: 45, radius: 44, contact: 40, scrapBonus: 120, scrapPerWave: 5,
        phase2At: 0.5, growPerReturn: 0.30,
        attack1: { every: 2, count: 3, dmg: 22, speed: 320 },
        attack2: { below: 0.5, stompAoe: 300, stompDmg: 30, stompTelescope: 1, summonEvery: 8, summonCount: 6, summonType: 'rusher' },
        reward: 'weaponCard'
      },
      {
        id: 'cyclops', name: 'CYCLOPS HEX', role: 'Boss', waves: 10,
        hp: 12000, speed: 35, radius: 52, contact: 50, scrapBonus: 300, scrapPerWave: 10,
        phase2At: 0.4, growPerReturn: 0.30,
        attack1: { every: 3, ringCount: 16, dmg: 15, speed: 260 },
        attack2: { below: 0.4, spawnerTowers: 4, spawnerHp: 300, spawnEvery: 4, spawnCount: 2, spawnType: 'stinger' },
        teleportEvery: 15, teleportMin: 80, teleportMax: 160,
        reward: 'crates'
      },
    ],

    /* ---------- Spieler-Run-Upgrades (Shop-Karten) ---------- */
    upgrades: [
      { id: 'hp', name: 'Max HP', baseCost: 60, grow: 1.4, max: 5, effectPerLevel: 25, effectLabel: '+25 Max HP' },
      { id: 'speed', name: 'Movement', baseCost: 50, grow: 1.4, max: 5, effectPerLevel: 0.08, effectLabel: '+8 % Speed' },
      { id: 'regen', name: 'Regeneration', baseCost: 70, grow: 1.4, max: 5, effectPerLevel: 1, effectLabel: '+1 HP/s' },
      { id: 'magnet', name: 'Scrap Magnet', baseCost: 40, grow: 1.4, max: 5, effectPerLevel: 0.40, effectLabel: '+40 % Magnet (90 → 270 px)' },
      { id: 'dodge', name: 'Dodge', baseCost: 90, grow: 1.4, max: 5, effectPerLevel: 0.05, effectLabel: '+5 % Dodge' },
      { id: 'crit', name: 'Crit ×2', baseCost: 80, grow: 1.4, max: 5, effectPerLevel: 0.05, effectLabel: '+5 % Crit' },
    ],

    /* ---------- Meta-Shards (Prestige-Währung) ---------- */
    shards: [
      { id: 'hp', name: 'Max HP +5 %', max: 5, costs: [1, 1, 2, 3, 5] },
      { id: 'dmg', name: 'Damage +4 %', max: 5, costs: [1, 1, 2, 3, 5] },
      { id: 'speed', name: 'Speed +3 %', max: 5, costs: [1, 1, 2, 3, 5] },
      { id: 'startscrap', name: 'Start Scrap +25', max: 5, costs: [1, 1, 2, 3, 5] },
      { id: 'wlevel', name: 'Start Weapon Lv +1', max: 5, costs: [1, 1, 2, 3, 5] },
    ],

    /* ---------- Achievements (24) ---------- */
    achievements: [
      { id: 'kills_100', name: 'First Blood', desc: '100 Kills', reward: 50, check: 'kills', target: 100 },
      { id: 'kills_1000', name: 'Horde Breaker', desc: '1000 Kills', reward: 300, check: 'kills', target: 1000 },
      { id: 'kills_5000', name: 'Scourge', desc: '5000 Kills', reward: 1000, check: 'kills', target: 5000 },
      { id: 'wave_5', name: 'Wave 5', desc: 'Reach Wave 5', reward: 100, check: 'maxWave', target: 5 },
      { id: 'wave_10', name: 'Wave 10', desc: 'Reach Wave 10', reward: 200, check: 'maxWave', target: 10 },
      { id: 'wave_20', name: 'Wave 20', desc: 'Reach Wave 20', reward: 500, check: 'maxWave', target: 20 },
      { id: 'wave_30', name: 'Wave 30', desc: 'Reach Wave 30', reward: 1000, check: 'maxWave', target: 30 },
      { id: 'combo_10', name: 'Combo 10', desc: '10 Kill Combo', reward: 100, check: 'bestCombo', target: 10 },
      { id: 'combo_25', name: 'Combo 25', desc: '25 Kill Combo', reward: 250, check: 'bestCombo', target: 25 },
      { id: 'combo_50', name: 'Combo 50', desc: '50 Kill Combo', reward: 500, check: 'bestCombo', target: 50 },
      { id: 'weapon_lv10', name: 'Max Weapon', desc: 'First Weapon Lv 10', reward: 500, check: 'weaponMax', target: 1, anyWeapon: true },
      { id: 'weapon_3', name: 'Arsenal', desc: 'Own 3 Weapons', reward: 100, check: 'weaponsOwned', target: 3 },
      { id: 'weapon_6', name: 'Full Arsenal', desc: 'Own 6 Weapons', reward: 300, check: 'weaponsOwned', target: 6 },
      { id: 'boss_1', name: 'Boss Slayer', desc: 'Defeat 1 Boss', reward: 150, check: 'bossesKilled', target: 1 },
      { id: 'boss_5', name: 'Boss Hunter', desc: 'Defeat 5 Bosses', reward: 400, check: 'bossesKilled', target: 5 },
      { id: 'boss_10', name: 'Boss Eradicator', desc: 'Defeat 10 Bosses', reward: 1000, check: 'bossesKilled', target: 10 },
      { id: 'scrap_1000', name: 'Rich', desc: 'Bank 1000 Scrap', reward: 100, check: 'bankTotal', target: 1000 },
      { id: 'scrap_10000', name: 'Millionaire', desc: 'Bank 10000 Scrap', reward: 300, check: 'bankTotal', target: 10000 },
      { id: 'prestige_1', name: 'Nexus Initiate', desc: 'Prestige 1×', reward: 500, check: 'prestiges', target: 1 },
      { id: 'prestige_3', name: 'Nexus Adept', desc: 'Prestige 3×', reward: 1000, check: 'prestiges', target: 3 },
      { id: 'daily_7', name: 'Devotion', desc: '7-Day Streak', reward: 300, check: 'dailyStreak', target: 7 },
      { id: 'weekly_1', name: 'Weekly', desc: 'Finish 1 Weekly', reward: 150, check: 'weekliesDone', target: 1 },
      { id: 'run_10', name: 'Veteran', desc: 'Play 10 Runs', reward: 250, check: 'runs', target: 10 },
      { id: 'scrap_econ', name: 'Economist', desc: 'Earn 5000 Scrap in one run', reward: 500, check: 'runEarned', target: 5000, perRun: true },
    ],

    /* ---------- Offline-Reward-Kurve ---------- */
    offline: {
      minutes: [10, 60, 120, 480],
      rewards: [20, 70, 180, 480],
    },
  };
})();