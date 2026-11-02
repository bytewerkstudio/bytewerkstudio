/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * entities.js — Welt-Modul: Gegner, Bosse, Projektile, Türme,
 *               Minen, Pickups, Partikel, Damage-Numbers
 * Vertrag: api.js (ENTITIES). Zahlen ausschließlich balance.* (SSOT);
 * nur explizite Spec-Konstanten, die balance.js nicht führt, stehen
 * hier (Zigzag-Frequenz/-Amplitude, Turm-Kettenglieder, Pickup-Speed,
 * Partikel-Caps, Ring-Rotation).
 * Laufzeit-Abhängigkeiten (NH.game/NH.weapons/NH.waves) — nie zur
 * Ladezeit. Ladezeit nutzt nur balance + loader (NH.u).
 * Beim Laden: Arrays + Registrierung; nichts Canvas/DOM-bezogen.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});
  const BAL = NH.balance;

  /* ---------- Spec-/Struktur-Konstanten (nicht in balance.js) ---------- */
  const W = 1280, H = 720;            // Logik-Auflösung (Vertrag)
  const PI2 = Math.PI * 2;
  const PARTICLE_CAP = 300;           // Spec: Cap 300, älteste ersetzen
  const PROJECTILE_CAP = 400;         // QA: Projektil-Cap, älteste ersetzen
  const PICKUP_CAP = 180;             // QA: Pickup-Cap, älteste entfernen
  const PICKUP_LIFE = 25;             // QA: Pickup-Lebenszeit (s)
  const PICKUP_BLINK = 2;             // QA: Blink-Ausblendung der letzten s
  const DMG_NUM_CAP = 80;
  const PICKUP_SPEED = 520;           // px/s unter Magnet
  const PICKUP_COLLECT = 10;          // Spieler-Radius + Abstand (Spec r+10)
  const RING_ROTATE = 0.6;            // rad/s der Mine-Ringe (langsam, Spec)
  const MINE_GLOBAL_CAP = 6;          // Spec: max 6 gleichzeitig
  const TURM_CHAIN = 3;               // Spec: Turm chaint 3 Ziele
  const TURRET_LEVEL_RANGE = 0.15;    // Turm-Reichweite +15 % je Level
  const STOMP_TELEGRAPH_T = 1;        // s Telegraphierung des Stampfers
  const ZIGZAG_HZ = 3, ZIGZAG_AMP = 40; // rusher: 3 Hz, 40 px
  // Krit-Chance: SSOT balance.player.baseCrit + balance.upgrades[crit].effectPerLevel
  const CRIT_BASE = (BAL.player && BAL.player.baseCrit) || 0.05;
  const CRIT_UPG = (BAL.upgrades || []).find(function (u) { return u.id === 'crit'; });
  const CRIT_PER_BUFF = (CRIT_UPG && CRIT_UPG.effectPerLevel) || 0.05;
  const HIT_SFX_MS = 90;              // Rate-Limit Hit-Sound

  /* ---------- Laufzeit-Zustand ---------- */
  const enemies = [], projectiles = [], pickups = [], turrets = [];
  const mines = [], particles = [], damageNumbers = [];
  const bosses = [];                  // Spiegelt Boss-Ents (game.listet Array)
  const telegraphs = [];              // Boss-Stampfer-Vorwarnungen
  const shocks = [];                  // Ketten-/Blitz-Segmente (Deko)
  const popups = [];                  // Floating-Texte (DODGE etc.)
  let entId = 1;
  let lastHitSfx = 0;

  /* ---------- Helfers ---------- */
  const U = NH.u;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function nowMs() { try { return performance.now(); } catch (e) { return Date.now(); } }
  function player() { return (NH.game && NH.game.player) || null; }
  function runWave() { const r = NH.game && NH.game.run; return (r && r.wave) || 1; }
  function sfx(name, opts) {
    try {
      if (NH.audio && typeof NH.audio.sfx === 'function') {
        if (opts) NH.audio.sfx(name, opts); else NH.audio.sfx(name);
      }
    } catch (e) {}
  }
  function addHitStopGeneric() {
    // Generischer Hit-Stop 0.03 s; Railgun bringt eigenen 0.06 via onHit.
    if (NH.game && typeof NH.game.addHitStop === 'function') {
      try { NH.game.addHitStop(0.03); } catch (e) {}
    }
  }
  function waveMults(w) {
    const wv = BAL.waves || {};
    if (NH.waves && typeof NH.waves.hpMult === 'function') {
      return { hp: NH.waves.hpMult(w), spd: NH.waves.speedMult(w), dmg: NH.waves.dmgMult(w) };
    }
    // Defensive Fallback exakt aus balance-Formeln (SSOT)
    return {
      hp: (wv.hpMultBase || 1) + (wv.hpMultPerWave || 0.15) * w + (wv.hpMultQuadPerWave || 0.005) * w * w,
      spd: Math.min(wv.speedCap || 2.5, Math.pow(wv.speedPerWave || 1.02, w)),
      dmg: Math.min(wv.enemyDmgCap || 3, (wv.enemyDmgBase || 1) + (wv.enemyDmgPerWave || 0.04) * w),
    };
  }
  function findBoss(bossId) {
    return (BAL.bosses || []).find(function (b) { return b.id === bossId; }) || null;
  }
  // Wiederkehr: 1 + floor((wave - Erstwelle)/10) — Zyklus beider Bosse
  function occFor(def, wave) {
    return 1 + Math.max(0, Math.floor((wave - (def.waves || 5)) / 10));
  }

  /* ---------- Gegner-Farben (Spec) ---------- */
  const ENEMY_COLORS = {
    scrapper: '#ff5252', stinger: '#ff8c42', rusher: '#ffd166',
    brute: '#b3001b', splitter: '#ff5ee8', spiker: '#ffb300',
    wraith: '#b36bff', radiator: '#4dc9ff', mender: '#7CFC00',
    mini: '#ff5ee8', spawner: '#9b59b6',
  };
  const BOSS_COLORS = { warden: '#FFC14D', cyclops: '#35D2E8' };
  const PROJ_PLAYER = '#E8A45C', PROJ_ENEMY = '#35D2E8';

  /* ---------- Mini-Typ (Spec: zur Laufzeit aus Splitter anlegen) ---------- */
  function buildMiniDef() {
    const split = (BAL.enemies || []).find(function (e) { return e.id === 'splitter'; });
    const fallback = { id: 'mini', name: 'Mini-Splitter', hp: 25, speed: 140, radius: 8, contact: 6, scrap: 3, minWave: 5, knockRes: 0 };
    return {
      id: 'mini', name: 'Mini-Splitter',
      hp: split ? split.miniHp : fallback.hp,
      speed: split ? split.miniSpeed : fallback.speed,
      radius: Math.max(7, Math.round((split ? split.radius : 14) * 0.55)),
      contact: split ? split.miniContact : fallback.contact,
      scrap: split ? split.miniScrap : fallback.scrap,
      minWave: 5, knockRes: 0,
    };
  }
  const MINI_DEF = buildMiniDef();

  function findEnemyDef(typeId) {
    if (typeId === 'mini') return MINI_DEF;
    return (BAL.enemies || []).find(function (e) { return e.id === typeId; }) || null;
  }

  /* ---------- Grund-Gegner anlegen (Balance + Wellen-Mults) ---------- */
  function makeEnemy(def, x, y, wave) {
    const w = Math.max(1, wave | 0);
    const m = waveMults(w);
    const e = {
      id: 'e' + (entId++), typeId: def.id,
      x: x, y: y, r: def.radius,
      hp: def.hp * m.hp, maxHp: def.hp * m.hp,
      speed: def.speed * m.spd,
      contact: def.contact * m.dmg,
      scrap: def.scrap || 0,
      knockRes: def.knockRes || 0,
      vx: 0, vy: 0, kbx: 0, kby: 0, at: 0, state: 'idle', stunUntil: 0,
      dotDps: 0, dotT: 0,
      blinkUntil: 0, invulnUntil: 0,
      shootT: (def.shootEvery || 2.2) * (0.6 + Math.random() * 0.8),
      angle: 0, wave: w, dead: false, boss: false,
    };
    // Spec-Felder des Typs (keepDist, shootDmg, explode*, blink*, aura*,
    // heal*, splitCount …) auf die Instanz kopieren — AI liest sie von dort.
    for (const k in def) if (e[k] === undefined) e[k] = def[k];
    if (def.id === 'brute') e.knockRes = def.knockRes || 0.8;
    return e;
  }

  /* ---------- Arrays trimmen ---------- */
  function swapRemove(arr, i) { const last = arr.pop(); if (i < arr.length) arr[i] = last; }

  function removeEnemyAt(i) {
    const e = enemies[i];
    if (e && e.boss) {
      const bi = bosses.indexOf(e);
      if (bi >= 0) swapRemove(bosses, bi);
    }
    swapRemove(enemies, i);
  }

  /* ============================================================
   * Partikel
   * ============================================================ */
  function pushParticle(p) {
    if (particles.length >= PARTICLE_CAP) particles.shift(); // älteste ersetzen
    particles.push(p);
  }

  // Externer API-Aufruf (weapons/game nutzen {x,y,vx,vy,life,color,size})
  function spawnParticle(o) {
    if (!o || !o.color) return;
    pushParticle({
      type: 'spark', x: o.x || 0, y: o.y || 0,
      vx: o.vx || 0, vy: o.vy || 0,
      life: o.life != null ? o.life : 0.3, maxLife: o.life != null ? o.life : 0.3,
      size: o.size || 3, color: o.color,
    });
  }

  function emitBurst(x, y, color, n, spread, speed) {
    const cnt = Math.min(64, Math.max(0, n | 0));
    for (let i = 0; i < cnt; i++) {
      const a = Math.random() * PI2;
      const s = speed * (0.4 + Math.random() * (spread !== undefined ? spread : 1));
      pushParticle({
        type: 'spark', x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.3 + Math.random() * 0.25, maxLife: 0.55,
        size: 2 + Math.random() * 3, color: color,
      });
    }
  }

  function emitRing(x, y, color, size) {
    pushParticle({ type: 'ring', x: x, y: y, vx: 0, vy: 0, life: 0.35, maxLife: 0.35, size: size || 20, color: color });
  }

  function emitShock(x, y, x2, y2, color) {
    if (shocks.length > 40) shocks.shift();
    shocks.push({ x: x, y: y, x2: x2, y2: y2, color: color || '#35D2E8', t: 0.14 });
  }

  /* ============================================================
   * Damage-Numbers + Popups
   * ============================================================ */
  function addDamageNumber(x, y, value, crit) {
    if (damageNumbers.length >= DMG_NUM_CAP) damageNumbers.shift();
    damageNumbers.push({ x: x, y: y, value: Math.round(value), color: crit ? '#ff9d4d' : '#ffd166', life: 0.7, crit: !!crit });
  }

  function spawnPopup(x, y, text, color) {
    if (popups.length >= DMG_NUM_CAP) popups.shift();
    popups.push({ x: x, y: y, text: String(text), color: color || '#7CFC00', life: 0.75 });
  }

  /* ============================================================
   * Pickups
   * ============================================================ */
  function tryCollectPickup(pk) {
    const p = player();
    if (!p || !NH.game || typeof NH.game.addScrap !== 'function') return false;
    const rr = p.radius + PICKUP_COLLECT;
    if (U.dist2(pk.x, pk.y, p.x, p.y) > rr * rr) return false;
    // QA: Pickup traegt den BASIS-Scrap; der Combo-Multiplikator wird beim
    // Einsammeln frisch angewendet (kein Retrospektiv-2x nach Combo-Reset).
    const mult = (NH.game && typeof NH.game.scrapMultiplier === 'function') ? NH.game.scrapMultiplier() : 1;
    const val = Math.round(pk.value * mult);
    if (val > 0) NH.game.addScrap(val, 'kill');
    return true;
  }

  function spawnPickup(x, y, value) {
    if (!(value > 0)) return;
    if (pickups.length >= PICKUP_CAP) pickups.shift(); // QA: aelteste entfernen
    pickups.push({
      x: x, y: y, value: value,
      vx: U.rand(-30, 30), vy: U.rand(-30, 30),
      alive: true,
      life: PICKUP_LIFE, maxLife: PICKUP_LIFE,
    });
  }

  /* ============================================================
   * Gegner-Spawn
   * ============================================================ */
  function spawnEnemy(typeId, x, y) {
    const def = findEnemyDef(typeId);
    if (!def) return null;
    const cap = (BAL.waves && BAL.waves.maxConcurrent) || 150;
    if (enemies.length >= cap) {
      // Cap überschritten: sofortiger Scrap-Drop ohne Gegner (Spec)
      const e = makeEnemy(def, x, y, runWave());
      if (e.scrap > 0) spawnPickup(x, y, e.scrap);
      return null;
    }
    const ent = makeEnemy(def, x, y, runWave());
    enemies.push(ent);
    return ent;
  }

  function spawnBoss(bossId, x, y, wave) {
    const def = findBoss(bossId);
    if (!def) return null; // drainQueue-Fallback 'boss' oder unbekannt
    const w = Math.max(1, wave | 0);
    const m = waveMults(w);
    const occ = occFor(def, w);
    const hp = def.hp * m.hp * Math.pow(1 + (def.growPerReturn || 0.3), occ - 1);
    const ent = {
      id: 'b' + (entId++), typeId: def.id, bossId: def.id,
      x: x, y: y, r: def.radius,
      hp: hp, maxHp: hp,
      speed: def.speed * m.spd,
      contact: def.contact * m.dmg,
      scrap: 0,
      knockRes: 1, vx: 0, vy: 0, kbx: 0, kby: 0, at: 0, state: 'phase1',
      stunUntil: 0, invulnUntil: 0, dead: false, boss: true,
      bossDef: def, wave: w, occ: occ,
      a1t: (def.attack1 && def.attack1.every) || 2,
      a2t: (def.attack2 && def.attack2.summonEvery) || 8,
      teleT: def.teleportEvery || 15,
      spawners: [],
      angle: 0,
    };
    enemies.push(ent);
    bosses.push(ent);
    return ent;
  }

  /* ============================================================
   * Projektile
   * ============================================================ */
  function spawnProjectile(o) {
    if (!o || o.x === undefined || o.y === undefined || o.angle === undefined) return;
    if (projectiles.length >= PROJECTILE_CAP) projectiles.shift(); // QA: aelteste ersetzen
    projectiles.push({
      x: o.x, y: o.y, angle: o.angle,
      speed: o.speed || 300,
      dmg: o.dmg || 0,
      aoeDmg: o.aoeDmg, aoeRadius: o.aoeRadius || 0,
      range: o.range || 0,            // 0 = unendlich (Odometer: Rest-Reichweite)
      weaponId: o.weaponId || null, srcId: o.srcId || null,
      team: o.team === 'enemy' ? 'enemy' : 'player',
      radius: o.radius || 5, color: o.color || (o.team === 'enemy' ? PROJ_ENEMY : PROJ_PLAYER),
      pierce: o.pierce || 0, crit: !!o.crit,
      knockback: o.knockback || 0,
      hitIds: [], onHit: o.onHit || null,
      dead: false,
    });
  }

  /* ============================================================
   * Kettenblitz (chainbolt; Turm nutzt ähnliche Helfer)
   * ============================================================ */
  function chainFrom(o) {
    const targets = Math.max(0, (o.chainTargets || 0) | 0);
    if (!targets || !enemies.length) {
      if (enemies.length && (o.chainTargets || 0) > 0) {
        // Auch ohne Folge-Ziele: Primärschaden aufs nächste Ziel
        const t0 = nearestEnemy(o.x, o.y, o.chainRadius || 0);
        if (t0) hitEnemy(t0, o.dmg, { weaponId: o.weaponId, crit: !!o.crit, stun: o.stun || 0 });
      }
      return;
    }
    const hitSet = new Set();
    let cx = o.x, cy = o.y;
    for (let i = 0; i < targets && hitSet.size < enemies.length; i++) {
      const t = nearestEnemy(cx, cy, o.chainRadius || 160, hitSet);
      if (!t) break;
      hitSet.add(t);
      emitShock(cx, cy, t.x, t.y, '#35D2E8');
      hitEnemy(t, o.dmg, { weaponId: o.weaponId, crit: !!o.crit, stun: o.stun || 0 });
      cx = t.x; cy = t.y;
    }
  }

  function nearestEnemy(x, y, range, excludeSet) {
    const r2 = range > 0 ? range * range : Infinity;
    let best = null, bd = Infinity;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.hp <= 0) continue;
      if (excludeSet && excludeSet.has(e)) continue;
      if (e.invulnUntil > e.at) continue; // Wraith blinkt -> nicht treffen
      const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }

  /* ============================================================
   * Schaden / Tod
   * ============================================================ */
  // Wende Schaden an (nie entfernen); Rückgabe {killed}. Der Aufrufer
  // (weapons/Projektil) ruft killEnemy — exakt wie weapons.damageEnemy.
  function damageEnemy(ent, dmg, o) {
    if (!ent || ent.dead || ent.hp <= 0) return { killed: false };
    if (ent.invulnUntil > ent.at && !(o && o.bypass)) return { killed: false };
    const opts = o || {};
    dmg = Math.max(0, dmg);
    if (!(dmg > 0)) return { killed: ent.hp <= 0 };
    ent.hp -= dmg;
    if (!opts.dot) addHitStopGeneric(); // QA: Hit-Stop nur im Nicht-DoT-Pfad
    const crit = !!(opts.crit && !(opts.dot));
    if (opts.knockback && !opts.dot && ent.knockRes < 1) {
      const kb = opts.knockback * 140 * (1 - ent.knockRes);
      const p = player();
      if (p) {
        const dx = ent.x - p.x, dy = ent.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        ent.kbx += (dx / d) * kb; ent.kby += (dy / d) * kb;
      }
    }
    if (opts.stun && !ent.boss) ent.stunUntil = ent.at + (opts.stun || 0);
    if (!opts.dot && Math.random() < 0.35) addDamageNumber(ent.x, ent.y - ent.r - 4, dmg, crit);
    NH.events.emit('nh:damage', { id: ent.id, dmg: Math.round(dmg), crit: crit });
    const now = nowMs();
    if (now - lastHitSfx > HIT_SFX_MS) { lastHitSfx = now; sfx('hit'); }
    return { killed: ent.hp <= 0 };
  }

  // Bequemer Pfad: Schaden + sofort töten
  function hitEnemy(ent, dmg, o) {
    const res = damageEnemy(ent, dmg, o);
    if (res.killed) killEnemy(ent, (o && o.weaponId) || null, {});
    return res;
  }

  function killEnemy(ent, weaponId, opts) {
    if (!ent || ent.dead) return;
    ent.dead = true;
    // QA: generischer Kill-Hit-Stop (Railgun hat eigenen 0.06 via onHit)
    if (weaponId !== 'railgun') addHitStopGeneric();
    const idx = enemies.indexOf(ent);
    if (idx < 0) return;
    const o = opts || {};

    /* Partikel + Sound */
    const col = ent.boss ? (BOSS_COLORS[ent.bossId] || '#FFC14D') : (ENEMY_COLORS[ent.typeId] || '#ff5252');
    emitBurst(ent.x, ent.y, col, ent.boss ? 46 : (ent.typeId === 'brute' ? 26 : 12), 1, ent.boss ? 220 : 150);
    emitRing(ent.x, ent.y, col, ent.boss ? ent.r * 2.4 : ent.r + 10);
    if (nowMs() - lastHitSfx > HIT_SFX_MS) {
      lastHitSfx = nowMs();
      // QA: Kill-Pitch steigt mit der Combo (audio.js: opts.combo)
      const combo = (NH.game && NH.game.run && NH.game.run.combo) || 0;
      sfx('kill', { combo: combo });
    }

    /* Spawner-Tore (Cyclops): keine Events/kein Scrap, verschwinden still */
    if (ent.typeId === 'spawner') {
      const owner = ent.owner;
      removeEnemyAt(idx);
      if (owner && owner.spawners) {
        const si = owner.spawners.indexOf(ent);
        if (si >= 0) owner.spawners.splice(si, 1);
      }
      return;
    }

    if (ent.boss) {
      const bDef = ent.bossDef;
      // Tore des Cyclops mitverschwinden (Spec)
      for (let i = 0; i < ent.spawners.length; i++) {
        const s = ent.spawners[i];
        if (!s.dead) {
          s.dead = true;
          const si = enemies.indexOf(s);
          if (si >= 0) removeEnemyAt(si);
        }
      }
      ent.spawners.length = 0;
      removeEnemyAt(idx);
      // Boss-Bonus zahlt game.enterShop (waveBonusTotal, 'nh:waveEnd') — hier
      // KEIN addScrap, sonst Doppel-Bonus (einmal Tod, einmal Wellen-Ende).
      // Cyclops: 2 Crate-Pickups à 25 (Spec)
      if (bDef && bDef.id === 'cyclops') {
        spawnPickup(ent.x - 24, ent.y, 25);
        spawnPickup(ent.x + 24, ent.y, 25);
      }
      NH.events.emit('nh:bossDie', { bossId: ent.bossId, x: ent.x, y: ent.y });
      return;
    }

    /* Normaler Gegner */
    removeEnemyAt(idx);
    NH.events.emit('nh:kill', {
      type: ent.typeId, x: ent.x, y: ent.y,
      weaponId: weaponId || null, scrap: ent.scrap, team: 'enemy',
    });
    // Scrap-Pickup: speichert den BASIS-Scrap — der Combo-Multiplikator
    // wird beim Einsammeln frisch angewendet (tryCollectPickup).
    if (ent.scrap > 0) spawnPickup(ent.x, ent.y, ent.scrap);
    // Splitter: Minis
    const split = findEnemyDef('splitter');
    if (ent.typeId === 'splitter' && split && split.splitCount > 0) {
      for (let i = 0; i < split.splitCount; i++) {
        const a = (PI2 * i) / split.splitCount + U.rand(-0.3, 0.3);
        const d = U.rand(10, 28);
        const m = spawnEnemy('mini', ent.x + Math.cos(a) * d, ent.y + Math.sin(a) * d);
        if (m) { m.kbx = Math.cos(a) * 120; m.kby = Math.sin(a) * 120; }
      }
    }
  }

  /* ============================================================
   * Türme (Tesla)
   * ============================================================ */
  function spawnTurret(o) {
    if (!o || !o.def || !o.stats) return;
    const maxTurrets = o.def.turretMax || 2;
    if (turrets.length >= maxTurrets) return;
    turrets.push({
      x: o.x, y: o.y, def: o.def, stats: o.stats,
      weaponId: o.weaponId || null,
      dmg: o.dmg || o.stats.dmg || 0,
      life: o.stats.turretDuration || o.def.turretDuration || 6,
      cooldown: 0, level: o.stats.level || 1,
      color: o.def.color || '#35D2E8', r: 16,
    });
  }

  function turretRange(t) { return (t.stats.range || 150) * (1 + TURRET_LEVEL_RANGE * Math.max(0, (t.level - 1))); }

  function turretTick(t, dt) {
    t.life -= dt;
    if (t.life <= 0) return;
    t.cooldown -= dt;
    if (t.cooldown > 0) return;
    const range = turretRange(t);
    let cx = t.x, cy = t.y;
    const hitSet = new Set();
    let n = 0;
    for (let i = 0; i < TURM_CHAIN && n < enemies.length; i++) {
      const e = nearestEnemy(cx, cy, range, hitSet);
      if (!e) break;
      hitSet.add(e);
      emitShock(cx, cy, e.x, e.y, t.color);
      const run = NH.game && NH.game.run;
      const critP = Math.min(1, CRIT_BASE + ((run && run.buffs && run.buffs.crit) || 0) * CRIT_PER_BUFF);
      const crit = Math.random() < critP;
      hitEnemy(e, t.dmg * (crit ? 2 : 1), { weaponId: t.weaponId, crit: crit });
      cx = e.x; cy = e.y; n++;
    }
    if (n > 0) {
      sfx('turret');
      t.cooldown = 1 / Math.max(0.1, t.stats.fireRate || 1);
    }
  }

  /* ============================================================
   * Minen (Orbit)
   * ============================================================ */
  function spawnMineRing(o) {
    if (!o || !o.count) return;
    const cnt = Math.min(MINE_GLOBAL_CAP - mines.length, Math.min(o.count, MINE_GLOBAL_CAP));
    if (cnt <= 0) return;
    const respawn = Math.max(0.8, (o.respawn || 2) * (1 - 0.1 * Math.max(0, (o.level || 1) - 1)));
    const partial = cnt < Math.min(o.count, MINE_GLOBAL_CAP);
    const phase = partial ? Math.random() * PI2 : 0;
    for (let i = 0; i < cnt; i++) {
      mines.push({
        ang: phase + (PI2 * i) / cnt,
        radius: o.radius || 70, dmg: o.dmg || 10, aoe: o.aoe || 60,
        weaponId: o.weaponId || null, level: o.level || 1,
        respawn: respawn, resT: 0, active: true, x: 0, y: 0,
      });
    }
  }

  function mineExplode(m) {
    m.active = false; m.resT = m.respawn;
    emitBurst(m.x, m.y, '#E8A45C', 14, 1, 160);
    emitRing(m.x, m.y, '#E8A45C', m.aoe);
    try { NH.events.emit('nh:bang', { x: m.x, y: m.y, radius: m.aoe }); } catch (e) {}
    sfx('hit');
    const r2 = m.aoe * m.aoe;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.hp <= 0) continue;
      const dx = e.x - m.x, dy = e.y - m.y;
      if (dx * dx + dy * dy <= r2) hitEnemy(e, m.dmg, { weaponId: m.weaponId, crit: false });
    }
  }

  /* ============================================================
   * Gegner-AI
   * ============================================================ */
  function dirToPlayer(e) {
    const p = player();
    if (!p) return { x: 0, y: 0, d: 1, a: 0 };
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / d, y: dy / d, d: d, a: Math.atan2(dy, dx) };
  }

  function enemyShoot(e, dx, dy, dmg, speed, radius, color, range) {
    if (!player()) return;
    spawnProjectile({
      x: e.x, y: e.y, angle: Math.atan2(dy, dx),
      dmg: dmg, speed: speed, range: range || 800,
      weaponId: null, srcId: e.id, team: 'enemy',
      radius: radius || 6, color: color || PROJ_ENEMY,
      pierce: 0, crit: false, knockback: 0,
    });
    e.shootT = (e.shootEvery || 2.2);
  }

  function updateEnemy(e, dt) {
    e.at += dt;
    // Knockback ausklingen; Bewegung wird unten pro Frame direkt gesetzt
    e.kbx = (e.kbx || 0) * (1 - Math.min(1, dt * 6));
    e.kby = (e.kby || 0) * (1 - Math.min(1, dt * 6));
    if (e.typeId === 'spawner') { e.vx = 0; e.vy = 0; return; } // stationär (Logik in updateBoss)
    if (e.stunUntil > e.at) return;    // Stun: keine Bewegung/Angriffe

    const dr = dirToPlayer(e);
    const spd = e.speed;

    /* Wraith: Blink-Zyklus (unverwundbar + halbtransparent) */
    if (e.typeId === 'wraith') {
      if (e.invulnUntil <= e.at && e.at >= e.blinkUntil) {
        e.invulnUntil = e.at + e.blinkDuration;
        e.blinkUntil = e.at + e.blinkEvery;
      }
      if (e.invulnUntil > e.at) return; // während des Blinks steht er
    }

    switch (e.typeId) {
      case 'rusher': {
        const side = Math.sin(e.at * PI2 * ZIGZAG_HZ) * ZIGZAG_AMP;
        const perpX = -dr.y, perpY = dr.x;
        e.vx = dr.x * spd + perpX * side;
        e.vy = dr.y * spd + perpY * side;
        break;
      }
      case 'stinger': {
        const kd = e.keepDist; // balance.keepDist
        let vx = 0, vy = 0;
        if (dr.d > kd + 20) { vx = dr.x * spd; vy = dr.y * spd; }
        else if (dr.d < kd - 20) { vx = -dr.x * spd; vy = -dr.y * spd; }
        else { vx = -dr.y * spd * 0.6; vy = dr.x * spd * 0.6; } // seitlich
        e.vx = vx; e.vy = vy;
        e.shootT -= dt;
        if (e.shootT <= 0) {
          const m = waveMults(e.wave);
          enemyShoot(e, dr.x, dr.y, (e.shootDmg || 12) * m.dmg, e.shootSpeed || 320, 6, '#35D2E8', 800);
        }
        break;
      }
      case 'spiker': {
        const m = waveMults(e.wave);
        const boost = 1.55;
        e.vx = dr.x * spd * boost; e.vy = dr.y * spd * boost;
        if (dr.d < e.explodeDist) {
          // Spec: AoE 45 (× dmgMult) auf den Spieler, flach in Radius
          const inAoe = dr.d <= (e.explodeAoe || 90);
          const dmg = inAoe ? Math.round((e.explodeDmg || 45) * m.dmg) : 0;
          if (dmg > 0 && NH.game && typeof NH.game.damagePlayer === 'function') NH.game.damagePlayer(dmg, e.x, e.y);
          emitBurst(e.x, e.y, '#ffb300', 20, 1, 200);
          emitRing(e.x, e.y, '#ffb300', e.explodeAoe || 90);
          try { NH.events.emit('nh:bang', { x: e.x, y: e.y, radius: e.explodeAoe || 90 }); } catch (ex) {}
          sfx('kill');
          e.dead = true; // kein Scrap (Spec)
          return;
        }
        break;
      }
      case 'radiator':
      case 'brute':
      case 'scrapper':
      case 'splitter':
      case 'mini':
      case 'mender':
      default:
        e.vx = dr.x * spd; e.vy = dr.y * spd;
        break;
    }
  }

  /* ---------- Boss-AI ---------- */
  function updateBoss(e, dt) {
    e.at += dt;
    e.a1t -= dt;
    e.a2t -= dt;
    if (e.teleT) e.teleT -= dt;
    if (e.stunUntil > e.at) return;
    const dr = dirToPlayer(e);
    e.vx = dr.x * e.speed; e.vy = dr.y * e.speed;
    const def = e.bossDef;
    const m = waveMults(e.wave);
    const phase2 = e.hp / e.maxHp <= (def.phase2At || 0.5);

    if (def.id === 'warden') {
      if (e.a1t <= 0) {
        e.a1t = def.attack1.every;
        const base = dr.a;
        const spreadDeg = 20 * Math.PI / 180;
        for (let i = 0; i < def.attack1.count; i++) {
          const off = def.attack1.count > 1
            ? -spreadDeg / 2 + (i / (def.attack1.count - 1)) * spreadDeg
            : 0;
          spawnProjectile({
            x: e.x, y: e.y, angle: base + off,
            dmg: Math.round(def.attack1.dmg * m.dmg), speed: def.attack1.speed,
            range: 900, team: 'enemy', radius: 10, color: BOSS_COLORS.warden,
            pierce: 0, crit: false, knockback: 0, srcId: e.id,
          });
        }
        sfx('hit');
      }
      if (phase2 && e.a2t <= 0) {
        e.a2t = def.attack2.summonEvery;
        // Telegraphierter Stampfer
        telegraphs.push({ x: e.x, y: e.y, radius: def.attack2.stompAoe, t: STOMP_TELEGRAPH_T, dmg: def.attack2.stompDmg * m.dmg });
        // Rusher-Ring (Spec: 6 ringförmig)
        for (let i = 0; i < def.attack2.summonCount; i++) {
          const a = (PI2 * i) / def.attack2.summonCount;
          const d = 60 + i * 4;
          spawnEnemy(def.attack2.summonType, e.x + Math.cos(a) * d, e.y + Math.sin(a) * d);
        }
        emitRing(e.x, e.y, '#FFC14D', 120);
      }
    } else if (def.id === 'cyclops') {
      if (e.a1t <= 0) {
        e.a1t = def.attack1.every;
        const cnt = def.attack1.ringCount || 16;
        for (let i = 0; i < cnt; i++) {
          const a = (PI2 * i) / cnt + e.at * 0.2;
          spawnProjectile({
            x: e.x, y: e.y, angle: a,
            dmg: Math.round(def.attack1.dmg * m.dmg), speed: def.attack1.speed,
            range: 800, team: 'enemy', radius: 8, color: BOSS_COLORS.cyclops,
            pierce: 0, crit: false, knockback: 0, srcId: e.id,
          });
        }
        sfx('hit');
      }
      if (e.teleT <= 0 && player()) {
        e.teleT = def.teleportEvery;
        const p = player();
        emitBurst(e.x, e.y, '#35D2E8', 14, 1, 140);
        const dist = U.rand(def.teleportMin, def.teleportMax);
        const a = Math.random() * PI2;
        e.x = clamp(p.x + Math.cos(a) * dist, e.r, W - e.r);
        e.y = clamp(p.y + Math.sin(a) * dist, e.r, H - e.r);
        emitBurst(e.x, e.y, '#35D2E8', 14, 1, 140);
        emitRing(e.x, e.y, '#35D2E8', e.r * 2);
      }
      if (phase2 && !e.gatesDone) {
        const gateDef = def.attack2;
        const corners = [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]];
        for (let i = 0; i < corners.length; i++) {
          const g = {
            id: 'sp' + (entId++), typeId: 'spawner',
            x: corners[i][0], y: corners[i][1], r: 24,
            hp: gateDef.spawnerHp, maxHp: gateDef.spawnerHp,
            speed: 0, contact: 0, scrap: 0, knockRes: 1,
            vx: 0, vy: 0, kbx: 0, kby: 0, at: 0, state: 'gate', stunUntil: 0,
            invulnUntil: 0, dead: false, boss: false,
            owner: e, spawnT: gateDef.spawnEvery,
            spawnCount: gateDef.spawnCount, spawnType: gateDef.spawnType,
            wave: e.wave,
          };
          e.spawners.push(g);
          enemies.push(g);
        }
        e.gatesDone = true;
      }
      for (let i = 0; i < e.spawners.length; i++) {
        const g = e.spawners[i];
        if (g.dead) continue;
        g.at += dt;
        g.spawnT -= dt;
        if (g.spawnT <= 0) {
          g.spawnT = gateDefSpawnEvery(e);
          spawnEnemy(g.spawnType, g.x, g.y); // Cap wird respektiert
        }
      }
    }
  }

  function gateDefSpawnEvery(e) { return e.bossDef.attack2.spawnEvery; }

  /* ---------- Kontakt + Mender + Radiator-Slow ---------- */
  function contactDamage() {
    const p = player();
    if (!p || !NH.game || typeof NH.game.damagePlayer !== 'function') return;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.hp <= 0 || e.typeId === 'spawner') continue;
      if (e.invulnUntil > e.at) continue;
      const rr = e.r + p.radius;
      const dx = e.x - p.x, dy = e.y - p.y;
      if (dx * dx + dy * dy <= rr * rr) {
        NH.game.damagePlayer(e.contact, e.x, e.y);
        // kleiner Kontakt-Knockback auf den Gegner
        if (e.knockRes < 1) {
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          e.kbx += (dx / d) * 60; e.kby += (dy / d) * 60;
        }
      }
    }
  }

  // Stärkster Mender pro Ziel heilt (mehrere Mender stapeln NICHT)
  function menderHeal(dt) {
    const healers = [];
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e && !e.dead && e.hp > 0 && e.typeId === 'mender') healers.push(e);
    }
    if (!healers.length) return;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.hp <= 0 || e.hp >= e.maxHp) continue;
      let best = 0;
      for (let j = 0; j < healers.length; j++) {
        const h = healers[j];
        const hd = U.dist2(h.x, h.y, e.x, e.y);
        const hr = h.healRadius || 140;
        if (hd <= hr * hr && h.healPerSec > best) best = h.healPerSec;
      }
      if (best > 0) e.hp = Math.min(e.maxHp, e.hp + best * dt);
    }
  }

  function slowFactorAt(x, y) {
    let slow = 0;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead || e.typeId !== 'radiator') continue;
      if (e.hp <= 0) continue;
      const r = e.auraRadius || 160;
      const dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy <= r * r) slow = e.slowFactor || 0.2;
    }
    return slow;
  }

  /* ============================================================
   * Update
   * ============================================================ */
  function update(dt) {
    if (!(dt > 0)) return;
    const p = player();

    /* Telegraphen (Stampfer) */
    for (let i = telegraphs.length - 1; i >= 0; i--) {
      const tg = telegraphs[i];
      tg.t -= dt;
      if (tg.t <= 0) {
        telegraphs.splice(i, 1);
        const pp = player();
        const dist2 = pp ? U.dist2(pp.x, pp.y, tg.x, tg.y) : Infinity;
        const r = tg.radius || 300;
        if (pp && dist2 <= r * r && NH.game && typeof NH.game.damagePlayer === 'function') {
          NH.game.damagePlayer(tg.dmg || 30, tg.x, tg.y);
        }
        emitBurst(tg.x, tg.y, '#FFC14D', 22, 1, 220);
        emitRing(tg.x, tg.y, '#FFC14D', r);
        try { NH.events.emit('nh:bang', { x: tg.x, y: tg.y, radius: r }); } catch (e) {}
      }
    }

    /* Gegner (inkl. Bosse) */
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead) continue;
      if (e.boss) updateBoss(e, dt);
      else updateEnemy(e, dt);
    }
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead) continue;
      e.x = clamp(e.x + (e.vx + e.kbx) * dt, -60, W + 60);
      e.y = clamp(e.y + (e.vy + e.kby) * dt, -60, H + 60);
    }
    // Tote (Spiker/overflow) entfernen
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].dead) removeEnemyAt(i);
    }
    menderHeal(dt);
    contactDamage();

    /* Projektile */
    for (let i = 0; i < projectiles.length; i++) {
      const pr = projectiles[i];
      if (!pr || pr.dead) continue;
      const dist = pr.speed * dt;
      pr.x += Math.cos(pr.angle) * dist;
      pr.y += Math.sin(pr.angle) * dist;
      if (pr.range > 0) {
        pr.range -= dist;
        if (pr.range <= 0) {
          explodeProjectile(pr);
          continue;
        }
      }
      if (pr.team === 'player') {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (!e || e.dead || e.hp <= 0) continue;
          if (e.invulnUntil > e.at) continue;
          if (pr.hitIds.length > 48) pr.hitIds.shift();
          if (pr.hitIds.indexOf(e.id) >= 0) continue;
          const rr = pr.radius + e.r;
          const dx = pr.x - e.x, dy = pr.y - e.y;
          if (dx * dx + dy * dy > rr * rr) continue;
          if (pr.aoeDmg !== undefined) { pr.dead = true; explodeProjectile(pr); break; }
          hitEnemy(e, pr.dmg, {
            weaponId: pr.weaponId, crit: pr.crit,
            knockback: pr.knockback, pierceId: String(pr.weaponId),
          });
          if (pr.onHit) {
            try { pr.onHit({ x: pr.x, y: pr.y, dmg: pr.dmg, crit: pr.crit, weaponId: pr.weaponId }); } catch (ex) {}
          }
          if (pr.pierce > 0) { pr.pierce--; pr.hitIds.push(e.id); }
          else { pr.dead = true; break; }
        }
      } else if (p && NH.game && typeof NH.game.damagePlayer === 'function') {
        const rr = pr.radius + p.radius;
        const dx = pr.x - p.x, dy = pr.y - p.y;
        if (dx * dx + dy * dy <= rr * rr) {
          NH.game.damagePlayer(pr.dmg, pr.x, pr.y);
          if (pr.aoeDmg !== undefined) { pr.dead = true; explodeProjectile(pr); }
          else pr.dead = true;
        }
      }
    }
    compact(projectiles, 'dead');

    /* Pickups + Magnet (game.addScrap OHNE x/y: mit Koordinaten würde game
       selbst einen neuen Pickup spawnen -> Endlosschleife; 'nh:scrap' emittet
       game.addScrap bereits) */
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pk = pickups[i];
      pk.life -= dt;
      if (pk.life <= 0) { pickups.splice(i, 1); continue; } // QA: Lebenszeit abgelaufen
      pk.x += pk.vx * dt; pk.y += pk.vy * dt;
      pk.vx *= (1 - Math.min(1, dt * 4)); pk.vy *= (1 - Math.min(1, dt * 4));
      if (tryCollectPickup(pk)) { pickups.splice(i, 1); continue; }
      if (!p) continue;
      const magnet = (NH.game && NH.game.run && NH.game.run.magnet) || 90;
      if (U.dist2(pk.x, pk.y, p.x, p.y) < magnet * magnet) {
        const d = U.dist(pk.x, pk.y, p.x, p.y) || 1;
        pk.x += ((p.x - pk.x) / d) * PICKUP_SPEED * dt;
        pk.y += ((p.y - pk.y) / d) * PICKUP_SPEED * dt;
        if (tryCollectPickup(pk)) pickups.splice(i, 1);
      }
    }

    /* Türme */
    for (let i = turrets.length - 1; i >= 0; i--) {
      const t = turrets[i];
      turretTick(t, dt);
      if (t.life <= 0) turrets.splice(i, 1);
    }

    /* Minen */
    const pPos = p || { x: W / 2, y: H / 2 };
    for (let i = 0; i < mines.length; i++) {
      const m = mines[i];
      m.ang += RING_ROTATE * dt;
      m.x = pPos.x + Math.cos(m.ang) * m.radius;
      m.y = pPos.y + Math.sin(m.ang) * m.radius;
      if (!m.active) {
        m.resT -= dt;
        if (m.resT <= 0) m.active = true;
        continue;
      }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (!e || e.dead || e.hp <= 0) continue;
        const rr = 10 + e.r;
        const dx = e.x - m.x, dy = e.y - m.y;
        if (dx * dx + dy * dy <= rr * rr) { mineExplode(m); break; }
      }
    }

    /* Partikel */
    for (let i = particles.length - 1; i >= 0; i--) {
      const pa = particles[i];
      pa.life -= dt;
      if (pa.life <= 0) { particles.splice(i, 1); continue; }
      pa.x += pa.vx * dt; pa.y += pa.vy * dt;
      pa.vx *= (1 - Math.min(1, dt * 2)); pa.vy *= (1 - Math.min(1, dt * 2));
    }
    for (let i = shocks.length - 1; i >= 0; i--) {
      shocks[i].t -= dt;
      if (shocks[i].t <= 0) shocks.splice(i, 1);
    }

    /* Damage-Numbers + Popups */
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const d = damageNumbers[i];
      d.life -= dt; d.y -= 42 * dt;
      if (d.life <= 0) damageNumbers.splice(i, 1);
    }
    for (let i = popups.length - 1; i >= 0; i--) {
      const d = popups[i];
      d.life -= dt; d.y -= 30 * dt;
      if (d.life <= 0) popups.splice(i, 1);
    }

    /* Death-Check: Boss-Events nur einmal; Regulars via hitEnemy */
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e && !e.dead && e.hp <= 0) killEnemy(e, null, {});
    }
  }

  function compact(arr, flag) {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i] && arr[i][flag]) swapRemove(arr, i);
  }

  function explodeProjectile(pr) {
    if (pr.dead) return;
    const r = pr.aoeRadius || 0;
    emitBurst(pr.x, pr.y, pr.color || '#E8A45C', 16, 1, 190);
    emitRing(pr.x, pr.y, pr.color || '#E8A45C', Math.max(20, r));
    try { NH.events.emit('nh:bang', { x: pr.x, y: pr.y, radius: Math.max(30, r) }); } catch (e) {}
    if (pr.onHit) {
      try {
        pr.onHit({ x: pr.x, y: pr.y, dmg: pr.dmg, aoeDmg: pr.aoeDmg, aoeRadius: r, weaponId: pr.weaponId, crit: pr.crit });
      } catch (e) {}
      pr.dead = true;
      return;
    }
    const dmg = pr.aoeDmg !== undefined ? pr.aoeDmg : pr.dmg;
    if (r > 0 && dmg > 0) {
      const r2 = r * r;
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e || e.dead || e.hp <= 0) continue;
        const dx = e.x - pr.x, dy = e.y - pr.y;
        if (dx * dx + dy * dy <= r2) hitEnemy(e, dmg, { weaponId: pr.weaponId, crit: pr.crit });
      }
    }
    pr.dead = true;
  }

  /* ============================================================
   * Render (Welt; KEIN HUD — HUD zeichnet ui.js)
   * ============================================================ */
  function render(ctx) {
    if (!ctx) return;

    /* Telegraphen (roter Kreis, füllt sich) */
    for (let i = 0; i < telegraphs.length; i++) {
      const tg = telegraphs[i];
      const prog = clamp(1 - tg.t / STOMP_TELEGRAPH_T, 0, 1);
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.radius, 0, PI2);
      ctx.strokeStyle = 'rgba(255,80,80,0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.radius, 0, PI2);
      ctx.fillStyle = 'rgba(255,80,80,' + (0.28 * prog).toFixed(3) + ')';
      ctx.fill();
    }

    /* Minen */
    for (let i = 0; i < mines.length; i++) {
      const m = mines[i];
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.active ? 10 : 6, 0, PI2);
      ctx.fillStyle = m.active ? 'rgba(232,164,92,0.95)' : 'rgba(139,160,184,0.5)';
      ctx.fill();
      ctx.strokeStyle = m.active ? '#ffd166' : 'rgba(139,160,184,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* Türme */
    for (let i = 0; i < turrets.length; i++) {
      const t = turrets[i];
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, PI2);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 0.45, 0, PI2);
      ctx.fillStyle = t.color;
      ctx.fill();
    }

    /* Pickups (Diamanten, Wert) */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < pickups.length; i++) {
      const pk = pickups[i];
      // QA: letzte PICKUP_BLINK s blinken + ausblenden
      if (pk.life <= PICKUP_BLINK) {
        ctx.globalAlpha = Math.max(0, pk.life / PICKUP_BLINK) * (Math.sin(nowMs() / 90) > -0.2 ? 1 : 0.2);
      } else {
        ctx.globalAlpha = 1;
      }
      const s = 6 + Math.sin(nowMs() / 180 + i) * 1.5;
      ctx.beginPath();
      ctx.moveTo(pk.x, pk.y - s);
      ctx.lineTo(pk.x + s * 0.7, pk.y);
      ctx.lineTo(pk.x, pk.y + s);
      ctx.lineTo(pk.x - s * 0.7, pk.y);
      ctx.closePath();
      ctx.fillStyle = '#7CFC00';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* Gegner */
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || e.dead) continue;
      const col = e.boss ? (BOSS_COLORS[e.bossId] || '#FFC14D') : (ENEMY_COLORS[e.typeId] || '#ff5252');
      const blink = e.invulnUntil > e.at;
      if (e.typeId === 'radiator') {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.auraRadius || 160, 0, PI2);
        ctx.fillStyle = 'rgba(77,201,255,0.10)';
        ctx.fill();
      }
      ctx.globalAlpha = blink ? 0.4 : 1;
      ctx.fillStyle = col;
      ctx.strokeStyle = 'rgba(232,244,255,0.75)';
      ctx.lineWidth = 2;
      if (e.boss) {
        // Boss: großes Sechseck-„Kristall“
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + (PI2 * k) / 6 + (e.bossId === 'cyclops' ? e.at * 0.4 : 0);
          const px = e.x + Math.cos(a) * e.r, py = e.y + Math.sin(a) * e.r;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, PI2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      /* DoT-Flammen */
      if (e.dotT > 0) {
        ctx.fillStyle = '#ff9d4d';
        ctx.beginPath();
        ctx.arc(e.x + e.r * 0.4, e.y - e.r, 4 + Math.sin(nowMs() / 90) * 2, 0, PI2);
        ctx.fill();
      }

      /* kleiner HP-Balken bei Schaden (Boss-Bar macht ui.js) */
      if (!e.boss && e.hp < e.maxHp) {
        const w = Math.max(20, e.r * 2);
        const frac = clamp(e.hp / e.maxHp, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(e.x - w / 2, e.y - e.r - 8, w, 3);
        ctx.fillStyle = '#ff5252';
        ctx.fillRect(e.x - w / 2, e.y - e.r - 8, w * frac, 3);
      }
    }

    /* Projektile (leuchtende Kapseln + Schweiß) */
    for (let i = 0; i < projectiles.length; i++) {
      const pr = projectiles[i];
      if (!pr || pr.dead) continue;
      ctx.save();
      ctx.translate(pr.x, pr.y);
      ctx.rotate(pr.angle);
      const len = pr.radius * 2.4;
      // QA: Glow als guenstige additive Zeichenoperation statt shadowBlur (Hotloop)
      const gw = pr.radius;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-len / 2 - gw, -pr.radius / 2 - gw, len + gw * 2, pr.radius + gw * 2, pr.radius / 2 + gw) : ctx.rect(-len / 2 - gw, -pr.radius / 2 - gw, len + gw * 2, pr.radius + gw * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-len / 2, -pr.radius / 2, len, pr.radius, pr.radius / 2) : ctx.rect(-len / 2, -pr.radius / 2, len, pr.radius);
      ctx.fill();
      // Schweiß-Trail
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(-len / 2 - pr.radius, 0, pr.radius * 0.45, 0, PI2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /* Ketten/Shocks */
    for (let i = 0; i < shocks.length; i++) {
      const s = shocks[i];
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x2, s.y2);
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = clamp(s.t / 0.14, 0, 1);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* Partikel */
    for (let i = 0; i < particles.length; i++) {
      const pa = particles[i];
      const a = clamp(pa.life / pa.maxLife, 0, 1);
      if (pa.type === 'ring') {
        const grow = pa.size * (1 - a);
        ctx.beginPath();
        ctx.arc(pa.x, pa.y, Math.max(1, grow), 0, PI2);
        ctx.strokeStyle = pa.color;
        ctx.globalAlpha = a;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath();
        ctx.arc(pa.x, pa.y, Math.max(0.5, pa.size * a), 0, PI2);
        ctx.fillStyle = pa.color;
        ctx.globalAlpha = a;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    /* Damage-Numbers + Popups */
    for (let i = 0; i < damageNumbers.length; i++) {
      const d = damageNumbers[i];
      ctx.globalAlpha = clamp(d.life / 0.7, 0, 1);
      ctx.fillStyle = d.color;
      ctx.font = d.crit ? '900 17px monospace' : '700 14px monospace';
      ctx.fillText(d.value, d.x, d.y);
    }
    ctx.font = '700 13px monospace';
    for (let i = 0; i < popups.length; i++) {
      const d = popups[i];
      ctx.globalAlpha = clamp(d.life / 0.75, 0, 1);
      ctx.fillStyle = d.color;
      ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;
  }

  /* ============================================================
   * Reset + activeBoss + playerPos
   * ============================================================ */
  function reset() {
    enemies.length = 0; projectiles.length = 0; pickups.length = 0;
    turrets.length = 0; mines.length = 0; particles.length = 0;
    damageNumbers.length = 0; bosses.length = 0; telegraphs.length = 0;
    shocks.length = 0; popups.length = 0; entId = 1; lastHitSfx = 0;
  }

  function activeBoss() {
    for (let i = 0; i < enemies.length; i++) if (enemies[i] && enemies[i].boss && !enemies[i].dead) return enemies[i];
    return null;
  }

  // Vertrag: playerPos() -> NH.game.player (game.js überschreibt das beim
  // Laden mit seinem eigenen Hook; dieser Fallback dient nur Sicherheit)
  function playerPos() {
    const p = player();
    return p || { x: W / 2, y: H / 2, radius: 14 };
  }

  /* ============================================================
   * Registrierung (Vertrag api.js; kein return/export)
   * ============================================================ */
  NH.ents = {
    enemies: enemies,
    projectiles: projectiles,
    pickups: pickups,
    turrets: turrets,
    mines: mines,
    particles: particles,
    damageNumbers: damageNumbers,
    bosses: bosses,                // Zusatz: game.js räumt dieses Array defensiv
    reset: reset,
    spawnEnemy: spawnEnemy,
    spawnBoss: spawnBoss,
    spawnProjectile: spawnProjectile,
    chainFrom: chainFrom,
    spawnTurret: spawnTurret,
    spawnMineRing: spawnMineRing,
    spawnPickup: spawnPickup,
    spawnParticle: spawnParticle,
    spawnPopup: spawnPopup,
    emitBurst: emitBurst,
    emitRing: emitRing,
    emitShock: emitShock,
    damageEnemy: damageEnemy,
    killEnemy: killEnemy,
    update: update,
    render: render,
    slowFactorAt: slowFactorAt,
    playerPos: playerPos,
    activeBoss: activeBoss,
  };

  // Neuer Run leert die Welt (game ruft zusätzlich resetWorld)
  NH.events.on('nh:init', reset);
})();