/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * weapons.js — Effektive Waffen-Stats, Auto-Aim, Feuermuster
 *
 * Vertrag: api.js (WEAPONS). Zahlen ausschließlich aus
 * NH.balance.weapons (SSOT). Milestone-/Kombinatorik-Regeln
 * laut Vertrag & Task-Spec:
 *   Lv3 +5 % Feuerrate | Max-Lv +15 % Feuerrate (stapelt)
 *   Lv6: 'projectile' & base==1          -> +1 Projektil
 *        'projectile' & base>=2          -> +15 % Schaden
 *        'projectile' & base>=2 & cone   -> +1 Kugel (scattergun)
 *        'dmg'                           -> +15 % Schaden
 *   Krit: Basis 0.05 + run.buffs.crit*0.05 (Task-Spec verbindlich)
 * Globale Multis: Shard-dmgMult * Combo-Boost (1.1) * lokaler 15 %.
 * Laufzeit-Abhängigkeiten (NH.game/NH.ents) — nie zur Ladezeit.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  /* ---------- Vertrags-/Spec-Konstanten (nicht in balance.js) ---------- */
  const CRIT_BASE = (NH.balance && NH.balance.player && typeof NH.balance.player.baseCrit === 'number') ? NH.balance.player.baseCrit : 0.05; // SSOT: balance.player.baseCrit
  const CRIT_PER_BUFF = 0.05;    // je Run-Crit-Upgrade-Level
  const MILESTONE6_DMG = 0.15;   // Lv6-Bonus: +15 % Schaden
  const RATE3 = 0.05;            // Lv3: +5 % Feuerrate
  const RATE_MAX = 0.15;         // Max-Lv: +15 % Feuerrate
  const KILLABLE_FACTOR = 1.2;   // Zielwahl: sicher 1-Schuss-Kill
  const NO_TARGET_CAP = 0.15;    // Cooldown-Cap ohne Ziel (s)
  const SFX_MIN_GAP = 100;       // Rate-Limit SFX: 10/s (ms)
  const FLAMER_PARTICLE = true;  // Flammen-Kegel-Partikel (Deko)

  /* ---------- Laufzeit-Zustand ---------- */
  const cooldowns = {};   // weaponId -> verbleibende s bis zum Schuss
  const sfxLast = {};     // weaponId -> letzter SFX-Zeitstempel (ms)
  const dots = new Map(); // ent -> {dps, remain, maxStacks, stacks, weaponId}
  const statCache = new Map(); // "id:level" -> effektive Stats (pure Funktion, Cache-Key id+level)

  /* ============================================================
   * Stats — effektives Waffen-Stat-Objekt (inkl. Milestones)
   * ============================================================ */
  function def(id) {
    return (NH.balance && NH.balance.weapons.find(function (w) { return w.id === id; })) || null;
  }

  function stats(id, level) {
    const b = def(id);
    if (!b) return null;
    const L = Math.max(1, (level | 0) || 1);
    const max = b.maxLevel || 1;
    const key = id + ':' + L;
    const cached = statCache.get(key);
    if (cached) return cached;
    const s = {
      id: id, level: L,
      dmg: b.dmg + (b.upgradeDmg || 0) * (L - 1),
      fireRate: b.fireRate * (1 + (L >= 3 ? RATE3 : 0) + (L >= max ? RATE_MAX : 0)),
      projectiles: b.projectiles || 0,
      speed: b.speed || 0,
      range: Math.max(0, b.range || 0),   // 0 = unendlich
      spread: 0,
      knockback: b.knockback || 0,
      pattern: b.pattern,
      pierce: b.pierce || 0,
      chainTargets: 0, chainRadius: 0, stun: 0,
      aoeRadius: 0,
      turretDuration: 0, turretCooldown: 0,
      dotDmg: 0, dotDuration: 0, dotMaxStack: 0,
      mineCount: 0, mineAoe: 0, mineRespawn: 0, orbitRadius: 0,
      projectileBonus: 0,   // +Projektil aus Lv6
      milestone6Damage: 0,  // lokaler +15 %-Schaden (Lv6 'dmg' oder Mehrprojektil)
      hitStop: b.hitStop || 0,
    };

    /* Lv6-Milestone (balance.milestone6)
       'projectile': base==1 -> +1 Projektil; cone-multi (scattergun) -> +1 Kugel;
       übrige Mehr-Projektil-Waffen (+ flamer/tesla mit 0 Projektilen) -> +15 % DMG */
    if (L >= 6 && b.milestone6) {
      if (b.milestone6 === 'projectile') {
        if (b.projectiles === 1 || (b.pattern === 'cone' && b.projectiles >= 2)) s.projectileBonus += 1;
        else s.milestone6Damage += MILESTONE6_DMG;
      } else if (b.milestone6 === 'dmg') {
        s.milestone6Damage += MILESTONE6_DMG;
      }
    }
    s.projectiles += s.projectileBonus;

    /* Muster-Spezifika (alle Zahlen aus balance, "+je Level" lt. Vertrag) */
    if (b.pattern === 'cone') {
      s.spread = b.spreadDeg || 0;
    }
    if (b.pattern === 'fan') {
      // Fan-Gesamtwinkel: Strahlen verteilen sich von -spread/2 .. +spread/2
      s.spread = b.spreadDeg || 0;
    }
    if (b.pattern === 'pierce') {
      if (b.id === 'railgun') s.pierce = b.railPierce || 999;
      else s.pierce = (b.pierce || 0) + (L - 1);  // piercer: +1 je Level
    }
    if (b.pattern === 'chain') {
      s.knockback = 0;
      s.chainTargets = (b.chainTargets || 0) + (L - 1); // chainbolt: +1 je Level
      s.chainRadius = b.chainRadius || 0;
      s.stun = b.stun || 0;
    }
    if (b.pattern === 'aoe') {
      s.knockback = 0;
      s.aoeRadius = (b.aoeRadius || 0) + 10 * (L - 1); // nova: +10 je Level
    }
    if (b.pattern === 'turret') {
      s.projectiles = 0; s.knockback = 0;
      s.turretDuration = (b.turretDuration || 0) + (L - 1); // tesla: +1 je Level
      s.turretCooldown = b.turretCooldown || 0;
    }
    if (b.pattern === 'orbit') {
      s.projectiles = 0; s.knockback = 0;
      s.mineCount = (b.projectiles || 0) + (L - 1); // mines: +1 je Level
      s.mineAoe = b.mineAoe || 0;
      s.mineRespawn = b.mineRespawn || 0;
      s.orbitRadius = b.orbitRadius || 0;
    }
    /* flamer hat pattern 'cone', feuert aber direkten Kegel-Schaden + DoT */
    if (b.pattern === 'cone' && b.id === 'flamer') {
      s.spread = b.spreadDeg || 0;
      s.dotDmg = (b.dotDmg || 0) + 4 * (L - 1);  // flamer: +4 je Level
      s.dotDuration = b.dotDuration || 0;
      s.dotMaxStack = b.dotMaxStack || 3;
    }
    statCache.set(key, s);
    return s;
  }

  /* ============================================================
   * Globale Schadens-Multiplikatoren
   * ============================================================ */
  function shardDmgMult() {
    const m = NH.meta && typeof NH.meta.shardBonus === 'function' ? NH.meta.shardBonus() : null;
    return (m && m.dmgMult) || 1;
  }

  // Shard-*Combo (billige Checks; pro Feuervorgang einmal erfragt, damit
  // DoT/Projektil/AoE/Turm-Stat beim Spawn denselben Stand wie der Schuss nutzen)
  function activeMult() { return shardDmgMult() * comboMult(); }

  function comboMult() {
    return (NH.game && typeof NH.game.dpsMultiplier === 'function') ? NH.game.dpsMultiplier() : 1;
  }

  // Effektiver Schuss-Schaden (noch ohne Krit; lokaler Lv6-Bonus inklusive)
  // mult (Shard-*Combo) ist optional — beim Feuern bereits berechnet
  function totalDmg(s, mult) {
    const m = mult || (shardDmgMult() * comboMult());
    return s.dmg * m * (1 + (s.milestone6Damage || 0));
  }

  // Krit-Roll (Task-Spec, verbindlich)
  function rollCrit() {
    const run = NH.game && NH.game.run;
    const lvl = (run && run.buffs && typeof run.buffs.crit === 'number') ? run.buffs.crit : 0;
    const p = Math.min(1, CRIT_BASE + lvl * CRIT_PER_BUFF);
    return Math.random() < p;
  }

  /* ============================================================
   * Zielsuche (Vertrag NH.weapons.target)
   * Reihenfolge: Railgun -> Boss; Prio-Flag (Spiker/Mender);
   * killbar (hp <= 1.2 * Projektil-DMG); sonst nächster.
   * range>0 filtert, 0 = unendlich.
   * ============================================================ */
  function target(wf, s, mult) {
    const w = wf || {};
    const st = s || stats(w.id, w.level);
    if (!st) return null;
    const range = st.range || 0;
    const range2 = range > 0 ? range * range : Infinity;
    const p = playerPos();
    if (!p) return null;

    const list = enemies();
    const killDmg = totalDmg(st, mult) * 1.0;
    let boss = null, prio = null, killable = null, nearest = null;
    let dB = Infinity, dP = Infinity, dK = Infinity, dN = Infinity;

    if (w.id === 'railgun') boss = activeBoss();

    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || !e.hp || e.hp <= 0 || e.dead) continue;
      // NH.ents.enemies enthält laut Vertrag nur Gegner; keine Team-Filterung
      const dx = e.x - p.x, dy = e.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > range2) continue;

      if (boss && e === boss) { if (d2 < dB) { dB = d2; boss = e; } continue; }
      if (e.priority) { if (d2 < dP) { dP = d2; prio = e; } continue; }
      if (e.hp <= killDmg * KILLABLE_FACTOR) { if (d2 < dK) { dK = d2; killable = e; } continue; }
      if (d2 < dN) { dN = d2; nearest = e; }
    }
    if (boss) return boss;
    if (prio) return prio;
    if (killable) return killable;
    return nearest;
  }

  /* ============================================================
   * Feuern (Vertrag NH.weapons.fire) — Muster-Dispatch
   * ============================================================ */
  function fire(wf, st, tgt, mult) {
    const w = wf || {};
    const id = w.id || '';
    const s = st || stats(id, w.level);
    if (!s) return;
    const t = tgt || target(w, s);
    if (!t) return; // update() feuert nur bei Ziel in Reichweite
    const p = playerPos();
    if (!p) return;
    const m = mult || activeMult();   // Shard-*Combo (update cached 1x/Frame)
    const dmg = totalDmg(s, m);
    const crit = rollCrit();
    const opts = { crit: crit };

    playSfx(id);
    muzzleFlash(id);

    switch (s.pattern) {
      case 'single':   shootSingle(id, s, p, t, dmg, opts); break;
      case 'cone':
        if (id === 'flamer') shootFlamer(id, s, p, t, dmg, opts, m);
        else shootCone(id, s, p, t, dmg, opts);
        break;
      case 'fan':      shootFan(id, s, p, t, dmg, opts); break;
      case 'pierce':   shootPierce(id, s, p, t, dmg, opts); break;
      case 'chain':    shootChain(id, s, p, t, dmg, opts); break;
      case 'aoe':      shootAoe(id, s, p, t, dmg, opts); break;
      case 'turret':   shootTurret(id, s, p, t, dmg, opts, m); break;
      case 'orbit':    shootOrbit(id, s, p, t, dmg, opts, m); break;
      default:         shootSingle(id, s, p, t, dmg, opts);
    }
  }

  /* ---------- Schuss-Helfer ---------- */
  function finalDmg(dmg, crit) { return crit ? dmg * 2 : dmg; }

  function angleTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }

  function normAngleRad(deg) { return deg * Math.PI / 180; }

  /* ---------- Muster: single (blaster) ---------- */
  function shootSingle(id, s, p, t, dmg, opts) {
    spawnProjectile({
      x: p.x, y: p.y, angle: angleTo(p, t),
      dmg: finalDmg(dmg, opts.crit), speed: s.speed, range: s.range,
      weaponId: id, pierce: 0, radius: 5, color: colorOf(id),
      crit: opts.crit, knockback: s.knockback, team: 'player',
    });
  }

  /* ---------- Muster: cone (scattergun; flamer separat) ---------- */
  function shootCone(id, s, p, t, dmg, opts) {
    const n = s.projectiles || 1;
    const base = angleTo(p, t);
    for (let i = 0; i < n; i++) {
      const off = n > 1 ? -s.spread / 2 + i * (s.spread / (n - 1)) : 0;
      const jitter = (Math.random() * 2 - 1) * 0.07 * s.spread; // ±7 %
      spawnProjectile({
        x: p.x, y: p.y, angle: base + normAngleRad(off + jitter),
        dmg: finalDmg(dmg, opts.crit), speed: s.speed, range: s.range,
        weaponId: id, pierce: 0, radius: 4, color: colorOf(id),
        crit: opts.crit, knockback: s.knockback, team: 'player',
      });
    }
  }

  /* ---------- Muster: fan (triplaser) — parallele Strahlen, symmetrisch
     über den Fan-Winkel: -spread/2 .. +spread/2 ---------- */
  function shootFan(id, s, p, t, dmg, opts) {
    const n = s.projectiles || 1;
    const base = angleTo(p, t);
    for (let i = 0; i < n; i++) {
      const off = n > 1 ? -s.spread / 2 + i * (s.spread / (n - 1)) : 0;
      spawnProjectile({
        x: p.x, y: p.y, angle: base + normAngleRad(off),
        dmg: finalDmg(dmg, opts.crit), speed: s.speed, range: s.range,
        weaponId: id, pierce: 0, radius: 4, color: colorOf(id),
        crit: opts.crit, knockback: s.knockback, team: 'player',
      });
    }
  }

  /* ---------- Muster: pierce (piercer/railgun) ---------- */
  function shootPierce(id, s, p, t, dmg, opts) {
    const o = {
      x: p.x, y: p.y, angle: angleTo(p, t),
      dmg: finalDmg(dmg, opts.crit), speed: s.speed, range: s.range,
      weaponId: id, pierce: s.pierce, radius: 7, color: colorOf(id),
      crit: opts.crit, knockback: s.knockback, team: 'player',
    };
    if (s.hitStop) { // Railgun: Hit-Stop nach Treffer
      o.onHit = function () {
        try { if (NH.game && typeof NH.game.addHitStop === 'function') NH.game.addHitStop(s.hitStop || 0.03); } catch (e) {}
      };
    }
    spawnProjectile(o);
  }

  /* ---------- Muster: chain (chainbolt) ---------- */
  function shootChain(id, s, p, t, dmg, opts) {
    // Lv6 "+1 Projektil" ist bei Kettenwaffen die nächste Spring-Stufe
    const targets = s.chainTargets + s.projectileBonus;
    if (NH.ents && typeof NH.ents.chainFrom === 'function') {
      try {
        NH.ents.chainFrom({
          x: p.x, y: p.y, dmg: finalDmg(dmg, opts.crit),
          weaponId: id, chainTargets: targets, chainRadius: s.chainRadius,
          stun: s.stun, level: s.level, crit: opts.crit,
        });
        return;
      } catch (e) { /* Fallback unten */ }
    }
    // Ohne entities-Modul: direkter Treffer aufs Ziel
    damageEnemy(t, finalDmg(dmg, opts.crit), { weaponId: id, crit: opts.crit });
  }

  /* ---------- Muster: aoe (nova) — langsames Orb, explodiert am
     Ziel oder wenn es seine Reichweite erschöpft hat ---------- */
  function shootAoe(id, s, p, t, dmg, opts) {
    const n = Math.max(1, s.projectiles || 1);
    const dist = Math.max(60, NH.u.dist(p.x, p.y, t.x, t.y));
    for (let i = 0; i < n; i++) {
      // Zielposition leicht gestreut, damit 2 Orbs nicht exakt deckungsgleich sind
      const tx = t.x + (i === 0 ? 0 : (Math.random() * 2 - 1) * 24);
      const ty = t.y + (i === 0 ? 0 : (Math.random() * 2 - 1) * 24);
      const a = Math.atan2(ty - p.y, tx - p.x);
      spawnProjectile({
        x: p.x, y: p.y, angle: a,
        dmg: 0,                            // kein Direkttreffer — nur Explosion
        aoeDmg: finalDmg(dmg, opts.crit),  // Schaden der Explosion (Krit inklusive)
        speed: s.speed, range: dist + 40,
        weaponId: id, pierce: 0, radius: 9, color: colorOf(id),
        crit: opts.crit, knockback: 0, team: 'player',
        aoeRadius: s.aoeRadius,
        onHit: aoeOnHit,
      });
    }
  }

  // Defensiv: onHit bekommt je nach entities-Implementierung das
  // Projektil oder ein {x,y,dmg,...}-Objekt — beides hat aoeRadius/aoeDmg.
  function aoeOnHit(info) {
    const o = info || {};
    const r = o.aoeRadius || 0;
    const d = (o.aoeDmg !== undefined ? o.aoeDmg : o.dmg) || 0;
    explodeAt(o.x, o.y, d, { weaponId: o.weaponId || null, crit: !!o.crit }, r);
  }

  // Flacher AoE-Schaden: alle Gegner im Radius voll
  function explodeAt(x, y, dmg, o, radius) {
    const r2 = radius * radius;
    const list = enemies();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || !e.hp || e.hp <= 0 || e.dead) continue;
      const dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy > r2) continue;
      damageEnemy(e, dmg, { weaponId: (o && o.weaponId) || null, crit: !!(o && o.crit) });
    }
    // Screen-Shake-Event (ui/game hören zu); defensiv, falls Bus fehlt
    try { NH.events.emit('nh:bang', { x: x, y: y, radius: radius }); }
    catch (e) { /* Deko-Screen-Shake; nie werfen */ }
  }

  /* ---------- Muster: turret (tesla) ---------- */
  function shootTurret(id, s, p, t, dmg, opts, mult) {
    if (!NH.ents || typeof NH.ents.spawnTurret !== 'function') return;
    const turrets = NH.ents.turrets;
    const cap = (def(id) && def(id).turretMax) || 1;
    if (turrets && turrets.length >= cap) return; // voll bestückt
    try {
      // Vertragsfelder; dmg = effektiver Schaden inkl. Shard-/Combo-Multis
      // (Krit rollt der Turm pro Tick selbst — kein Spawn-Krit).
      NH.ents.spawnTurret({
        x: p.x + (p.dir || 0) * 40, y: p.y - 20,
        def: def(id), stats: s, weaponId: id,
        dmg: totalDmg(s, mult),
      });
    } catch (e) { /* Turm ist Deko-Logik; nie werfen */ }
  }

  /* ---------- Muster: orbit (mines) ---------- */
  function shootOrbit(id, s, p, t, dmg, opts, mult) {
    if (!NH.ents || typeof NH.ents.spawnMineRing !== 'function') return;
    const mines = NH.ents.mines;
    if (mines && mines.length >= s.mineCount) return;
    try {
      // dmg = effektiver Schaden inkl. Shard-/Combo-Multis (Vertragsfeld)
      NH.ents.spawnMineRing({
        count: s.mineCount, radius: s.orbitRadius,
        dmg: totalDmg(s, mult), aoe: s.mineAoe, respawn: s.mineRespawn,
        weaponId: id, level: s.level,
      });
    } catch (e) { /* nie werfen */ }
  }

  /* ---------- Muster: flamer (cone-Direktfeuer + DoT) ---------- */
  function shootFlamer(id, s, p, t, dmg, opts, mult) {
    const base = angleTo(p, t);
    const half = normAngleRad(s.spread / 2);
    const list = enemies();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || !e.hp || e.hp <= 0 || e.dead) continue;
      const dx = e.x - p.x, dy = e.y - p.y;
      if (dx * dx + dy * dy > s.range * s.range) continue;
      const a = Math.atan2(dy, dx);
      let diff = Math.abs(a - base);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > half) continue;
      // Harter Treffer + DoT-Stack (DoT läuft in update())
      damageEnemy(e, finalDmg(dmg, opts.crit), { weaponId: id, crit: opts.crit });
      addDot(e, s.dotDmg * mult, s.dotDuration, s.dotMaxStack, id);
    }
    flameParticle(p, base, s.spread, s.range);
  }

  /* ---------- DoT (flamer) ---------- */
  function addDot(ent, dps, duration, maxStacks, weaponId) {
    // dps kommt bereits Shard-*Combo-bereinigt rein (totalDmg-artig, inkl. Refresh bei Stack)
    if (!ent || dps <= 0 || duration <= 0) return;
    const cur = dots.get(ent);
    if (cur) {
      cur.dps = dps; // neue Anwendung nutzt den höchsten dps (Waffen-Level up)
      cur.stacks = Math.min(cur.maxStacks, cur.stacks + 1);
      cur.remain = Math.max(cur.remain, duration);
      cur.weaponId = weaponId;
    } else {
      dots.set(ent, { dps: dps, remain: duration, maxStacks: Math.max(1, maxStacks | 0), stacks: 1, weaponId: weaponId });
    }
  }

  function tickDots(dt) {
    if (!dots.size) return;
    dots.forEach(function (dot, ent) {
      if (!ent || !ent.hp || ent.hp <= 0 || ent.dead) { dots.delete(ent); return; }
      dot.remain -= dt;
      if (dot.remain <= 0) { dots.delete(ent); return; }
      const perSec = dot.dps * dot.stacks; // dps inkl. Shard-*Combo (beim Stack berechnet)
      damageEnemy(ent, perSec * dt, { weaponId: dot.weaponId, crit: false, dot: true });
    });
  }

  /* ============================================================
   * Update (Vertrag NH.weapons.update)
   *   cooldown -= dt; Ziel in Reichweite -> feuern; sonst Cooldown
   *   auf 0.15 s gedeckelt (sofort nachschießen, kein Spam).
   * ============================================================ */
  function update(dt) {
    if (!(dt > 0)) return;
    tickDots(dt);
    const run = NH.game && NH.game.run;
    const list = owned();
    if (!run || !list.length) return;

    const frameMult = activeMult(); // Shard-*Combo 1x/Frame (kein Re-Build pro Waffe)

    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      const id = w.id || '';
      const s = stats(id, w.level);
      if (!s) continue;

      let cd = cooldowns[id] || 0;
      cd -= dt;
      if (cd > 0) { cooldowns[id] = cd; continue; }

      const t = target(w, s, frameMult);
      if (!t) {
        // kein Ziel: Cooldown auf 0 (bzw. 0.15-s-Cap) halten, damit sofort
        // nachgeschossen wird, sobald ein Gegner in Reichweite kommt (kein Spam)
        cooldowns[id] = Math.max(0, Math.min(cd, NO_TARGET_CAP));
        continue;
      }
      fire(w, s, t, frameMult);
      cooldowns[id] = 1 / s.fireRate;
    }
  }

  /* ============================================================
   * Vertrag: owned() -> NH.game.run.weapons (read-only)
   * ============================================================ */
  function owned() {
    const run = NH.game && NH.game.run;
    return (run && Array.isArray(run.weapons)) ? run.weapons : [];
  }

  /* ============================================================
   * Helfers: Positionen, Arrays, Schaden, SFX, Partikel, Farben
   * Alle NH.ents-/NH.game-Zugriffe defensiv (Laufzeitabhängigkeit).
   * ============================================================ */
  function playerPos() {
    if (NH.ents && typeof NH.ents.playerPos === 'function') return NH.ents.playerPos();
    if (NH.game && NH.game.player) { const p = NH.game.player; return { x: p.x, y: p.y }; }
    return null;
  }

  function enemies() {
    return (NH.ents && Array.isArray(NH.ents.enemies)) ? NH.ents.enemies : [];
  }

  function activeBoss() {
    return (NH.ents && typeof NH.ents.activeBoss === 'function') ? NH.ents.activeBoss() : null;
  }

  // Direkter Schaden an einem Gegner (inkl. Kill-Abwicklung via killEnemy)
  function damageEnemy(ent, dmg, o) {
    if (!ent || !ent.hp || ent.hp <= 0 || ent.dead) return null;
    const opts = o || {};
    const res = NH.ents && typeof NH.ents.damageEnemy === 'function'
      ? NH.ents.damageEnemy(ent, dmg, { crit: !!opts.crit, knockback: opts.knockback || 0, weaponId: opts.weaponId || null, pierceId: opts.pierceId, dot: !!opts.dot })
      : { killed: false };
    if (res && res.killed) killEnemy(ent, opts.weaponId || null);
    return res;
  }

  function killEnemy(ent, weaponId) {
    if (!NH.ents || typeof NH.ents.killEnemy !== 'function') return;
    try { NH.ents.killEnemy(ent, weaponId, {}); } catch (e) { /* nie werfen */ }
  }

  // Projektile spawnen; ohne entities-Modul: onHit am nächsten Gegner im
  // Wirkungsbereich auslösen bzw. direkter Treffer (Robustheits-Pfad)
  function spawnProjectile(o) {
    if (NH.ents && typeof NH.ents.spawnProjectile === 'function') {
      try { NH.ents.spawnProjectile(o); return; } catch (e) { /* Fallback */ }
    }
    const t = nearestEnemy(o.x, o.y, o.range || 0);
    if (!t) return;
    if (o.onHit) {
      try {
        o.onHit({ x: t.x, y: t.y, dmg: o.dmg, aoeDmg: o.aoeDmg, aoeRadius: o.aoeRadius, weaponId: o.weaponId, crit: o.crit });
      } catch (e) { /* nie werfen */ }
    } else if (o.dmg > 0) {
      damageEnemy(t, o.dmg, { weaponId: o.weaponId, crit: o.crit, knockback: o.knockback, pierceId: String(o.weaponId) });
    }
  }

  function nearestEnemy(x, y, range) {
    const r2 = range > 0 ? range * range : Infinity;
    let best = null, bd = Infinity;
    const list = enemies();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e || !e.hp || e.hp <= 0 || e.dead) continue;
      const dx = e.x - x, dy = e.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      if (d2 < bd) { bd = d2; best = e; }
    }
    return best;
  }

  /* ---------- Sound (Vertrag: shoot_<id>, max 10/s je Waffe) ---------- */
  function playSfx(id) {
    const now = Date.now();
    if (sfxLast[id] && now - sfxLast[id] < SFX_MIN_GAP) return;
    sfxLast[id] = now;
    if (NH.audio && typeof NH.audio.sfx === 'function') {
      try { NH.audio.sfx('shoot_' + id); } catch (e) { /* Audio optional */ }
    }
  }

  /* ---------- Farben aus balance (SSOT) ---------- */
  const colorCache = {};
  function colorOf(id) {
    if (colorCache[id]) return colorCache[id];
    const b = def(id);
    const c = b ? b.color : '#E8A45C';
    colorCache[id] = c;
    return c;
  }

  /* ---------- Muzzle-Flash + Flammen-Kegel (Deko-Partikel) ---------- */
  function muzzleFlash(id) {
    if (!NH.ents || typeof NH.ents.spawnParticle !== 'function') return;
    const p = playerPos();
    if (!p) return;
    const dirX = (NH.game && NH.game.player && NH.game.player.dir) || 1;
    try {
      NH.ents.spawnParticle({
        x: p.x + dirX * 24, y: p.y,
        vx: dirX * 60, vy: NH.u.rand(-20, 20),
        life: NH.u.rand(0.08, 0.16), color: colorOf(id), size: NH.u.rand(3, 6),
      });
    } catch (e) { /* Partikel sind Deko */ }
  }

  function flameParticle(p, base, spread, range) {
    if (!FLAMER_PARTICLE) return;
    if (!NH.ents || typeof NH.ents.spawnParticle !== 'function') return;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = base + normAngleRad((Math.random() * 2 - 1) * (spread / 2));
      const dist = Math.random() * range * 0.7;
      try {
        NH.ents.spawnParticle({
          x: p.x + Math.cos(a) * dist, y: p.y + Math.sin(a) * dist,
          vx: Math.cos(a) * 40, vy: Math.sin(a) * 40 - 30,
          life: NH.u.rand(0.15, 0.35), color: randomFlame(), size: NH.u.rand(3, 7),
        });
      } catch (e) { return; }
    }
  }

  function randomFlame() {
    const palette = ['#E8A45C', '#FF7847', '#FFD166', '#FF5E3A'];
    return palette[(Math.random() * palette.length) | 0];
  }

  function init() {
    for (const k in cooldowns) delete cooldowns[k];
    for (const k in sfxLast) delete sfxLast[k];
    dots.clear();
    statCache.clear();
  }

  /* ---------- Registrierung (Vertrag; kein return/export) ---------- */
  NH.weapons = {
    stats: stats,
    update: update,
    target: target,
    owned: owned,
    fire: fire,
    init: init,
  };
  // Cooldowns/DoTs bei jedem Run-Start zurücksetzen (Muster meta.js:
  // 'nh:init' wird von game/main beim Spielstart emittiert)
  NH.events.on('nh:init', function () { init(); });
})();