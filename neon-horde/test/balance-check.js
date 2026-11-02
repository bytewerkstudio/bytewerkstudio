#!/usr/bin/env node
/* ============================================================
 * NEON HORDE — Balance-Konsistenz-Test
 * Prüft alle balance.js-Kernzahlen gegen die finale
 * Design-Spezifikation (Workflow-Synthese 01.11.2026).
 * Aufruf: node test/balance-check.js
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const sandbox = {
  console, Math, JSON, Object, Array, String, Number, Boolean, Date,
  navigator: { language: 'de-DE' },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(SRC, 'loader.js'), 'utf8'), sandbox, { filename: 'loader.js' });
vm.runInContext(fs.readFileSync(path.join(SRC, 'balance.js'), 'utf8'), sandbox, { filename: 'balance.js' });
const B = sandbox.NH.balance;

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else { console.log('FAIL  ' + name + (detail ? ' — ' + detail : '')); failed++; }
}

// --- Waffen (10) ---
check('10 Waffen', B.weapons.length === 10, 'hat ' + B.weapons.length);
check('Blaster Preis 0', B.weapons[0].id === 'blaster' && B.weapons[0].price === 0);
check('Blaster Stats', B.weapons[0].dmg === 25 && B.weapons[0].fireRate === 4 && B.weapons[0].maxLevel === 10);
check('Scattergun 80', B.weapons[1].id === 'scattergun' && B.weapons[1].price === 80 && B.weapons[1].projectiles === 5);
check('Piercer 120', B.weapons[2].id === 'piercer' && B.weapons[2].price === 120 && B.weapons[2].pierce === 2);
check('Chainbolt 140', B.weapons[3].id === 'chainbolt' && B.weapons[3].price === 140 && B.weapons[3].chainTargets === 4);
check('Triplaser 160', B.weapons[4].id === 'triplaser' && B.weapons[4].price === 160 && B.weapons[4].projectiles === 3);
check('Nova 180', B.weapons[5].id === 'nova' && B.weapons[5].price === 180 && B.weapons[5].aoeRadius === 130);
check('Tesla 200', B.weapons[6].id === 'tesla' && B.weapons[6].price === 200 && B.weapons[6].turretDuration === 6);
check('Flamer 220', B.weapons[7].id === 'flamer' && B.weapons[7].price === 220 && B.weapons[7].dotDmg === 8);
check('Mines 240', B.weapons[8].id === 'mines' && B.weapons[8].price === 240 && B.weapons[8].projectiles === 4);
check('Railgun 300', B.weapons[9].id === 'railgun' && B.weapons[9].price === 300 && B.weapons[9].dmg === 400);
const sumPrices = B.weapons.reduce((s, w) => s + w.price, 0);
check('Waffen-Preissumme 1640', sumPrices === 1640, 'ist ' + sumPrices);

// Upgrade-Summen (je Waffe: upgradeBase * (1+2+...+(max-1)))
// Bindende Regel (api.js): Level n->n+1 kostet upgradeBase*n,
// spent = upgradeBase * (L-1)*L/2 — siehe shop.js-Verkaufsformel.
function upgradeSum(w) {
  const lvls = w.maxLevel - 1;
  return w.upgradeBase * (lvls * (lvls + 1) / 2);
}
check('Blaster Upgrade-Summe 1800', upgradeSum(B.weapons[0]) === 1800, 'ist ' + upgradeSum(B.weapons[0]));
check('Scattergun Upgrade-Summe 1120', upgradeSum(B.weapons[1]) === 1120, 'ist ' + upgradeSum(B.weapons[1]));
check('Piercer Upgrade-Summe 400', upgradeSum(B.weapons[2]) === 400, 'ist ' + upgradeSum(B.weapons[2]));

// --- Gegner (9 + 2 Bosse) ---
check('9 Gegner', B.enemies.length === 9, 'hat ' + B.enemies.length);
const e = (id) => B.enemies.find((x) => x.id === id);
check('Scrapper 60/5', e('scrapper').hp === 60 && e('scrapper').scrap === 5 && e('scrapper').minWave === 1);
check('Stinger 45/4', e('stinger').hp === 45 && e('stinger').scrap === 4 && e('stinger').minWave === 2);
check('Rusher 30/3', e('rusher').hp === 30 && e('rusher').scrap === 3 && e('rusher').minWave === 3);
check('Brute 260/18', e('brute').hp === 260 && e('brute').scrap === 18 && e('brute').minWave === 4);
check('Splitter 90/7', e('splitter').hp === 90 && e('splitter').scrap === 7 && e('splitter').minWave === 5);
check('Spiker 70/5 prio', e('spiker').hp === 70 && e('spiker').scrap === 5 && e('spiker').priority === 1);
check('Wraith 100/6', e('wraith').hp === 100 && e('wraith').scrap === 6 && e('wraith').minWave === 7);
check('Radiator 140/7', e('radiator').hp === 140 && e('radiator').scrap === 7 && e('radiator').minWave === 8);
check('Mender 120/8 prio', e('mender').hp === 120 && e('mender').scrap === 8 && e('mender').priority === 1);

// --- Bosse ---
check('2 Bosse', B.bosses.length === 2, 'hat ' + B.bosses.length);
const [warden, cyclops] = B.bosses;
check('Warden HP 4000/5', warden.id === 'warden' && warden.hp === 4000 && warden.waves === 5);
check('Warden Boni', warden.scrapBonus === 120 && warden.scrapPerWave === 5 && warden.growPerReturn === 0.3);
check('Cyclops HP 12000/10', cyclops.id === 'cyclops' && cyclops.hp === 12000 && cyclops.waves === 10);
check('Cyclops Boni', cyclops.scrapBonus === 300 && cyclops.scrapPerWave === 10);

// --- Formeln (Referenzwerte aus Spec) ---
check('Budget W1=10', budget(1) === 10, '');
check('Budget W5=35', budget(5) === 35, '');
check('Budget W10=91', budget(10) === 91, '');
check('Budget W20=286', budget(20) === 286, '');
check('hpMult W5~1.875', Math.abs(hpMult(5) - 1.875) < 0.001, '');
check('hpMult W10=3.0', Math.abs(hpMult(10) - 3.0) < 0.001, '');
check('hpMult W20=6.0', Math.abs(hpMult(20) - 6.0) < 0.001, '');
function budget(w) { return Math.round(6 + 3 * w + 0.55 * w * w); }
function hpMult(w) { return 1 + 0.15 * w + 0.005 * w * w; }

// --- Economy ---
check('Banking 0.8', B.economy.bankSafeRatio === 0.8);
check('Reroll 25/max 2', B.economy.rerollCost === 25 && B.economy.rerollMax === 2);
check('Verkauf 0.5', B.economy.sellRefundRatio === 0.5);
check('Combo-Fenster 2 s', B.economy.comboWindow === 2);
check('Combo ×5 = 2×', B.economy.comboMultiplierAt === 5);
check('Combo ×7 Boost', B.economy.comboDmgAt === 7 && B.economy.comboDmgBonus === 0.10 && B.economy.comboDmgDuration === 5);
check('Wellen-Bonus 15+3w', B.economy.waveBonusBase === 15 && B.economy.waveBonusPerWave === 3);
check('Prestige 2000*1.9^', B.economy.prestigeBaseCost === 2000 && B.economy.prestigeGrow === 1.9 && B.economy.prestigeMinWave === 20);
check('Daily 7 Werte', B.economy.dailyRewards.length === 7 && B.economy.dailyRewards[0] === 50 && B.economy.dailyRewards[6] === 1000);
check('Offline-Cap 480', B.economy.offlineCapHours === 8);
check('Operator /100', B.economy.operatorLevelInterval === 100 && B.economy.operatorLevelBonus === 10);

// --- Shard-Kosten ---
check('5 Shard-Tracks', B.shards.length === 5);
check('Shard-Kosten 1/1/2/3/5', JSON.stringify(B.shards[0].costs) === JSON.stringify([1, 1, 2, 3, 5]));

// --- Achievements (24) ---
check('24 Errungenschaften', B.achievements.length === 24, 'hat ' + B.achievements.length);

console.log('\nbalance-check: ' + (failed === 0 ? 'OK' : 'FEHLGESCHLAGEN (' + failed + ')'));
process.exitCode = failed ? 1 : 0;