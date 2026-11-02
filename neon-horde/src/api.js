/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * api.js — VERBINDLICHER MODUL-VERTRAG (Single Contract)
 * Jedes Modul implementiert GENAU diese API. Module dürfen
 * KEINE anderen Dateien ändern und KEINE nicht gelisteten
 * Querverbindungen (= andere Module direkt via NH.x aufrufen,
 * die hier nicht stehen) erfinden. Fehlt etwas: NH.events
 * nutzen und im Agent-Report dokumentieren.
 *
 * Laderreihenfolge (index.html):
 * loader -> balance -> lang -> audio -> input -> save -> meta
 * -> entities -> weapons -> waves -> shop -> ui -> game -> main
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  /* ---------- Zustände ---------- */
  NH.gameState = { BOOT: 'boot', MENU: 'menu', RUN: 'run', SHOP: 'shop', PAUSED: 'paused', GAMEOVER: 'gameover' };

  /* ---------- Zentraler Run-Zustand (gehört game.js) ---------- */
  // NH.game.run = {
  //   wave:1, waveTime:0, waveDuration:60, phase:'combat'|'shop'|'gameover',
  //   scrap:0,                    // im Run verdient/ausgebbar
  //   hp, maxHP, speed, regen, magnet, dodge, crit,
  //   weapons:[{id,level}],       // alle feuern automatisch
  //   buffs:{hp,speed,regen,magnet,dodge,crit}, // Run-Upgrade-Level
  //   combo, comboTimer, bestCombo, comboDmgUntil,
  //   queue:[], waveBoss:null,
  //   quickStart:false,           // n. Welle binnen 5 s -> Bonus
  //   stats:{kills, killsByWeapon:{}, scrapEarned, bossesKilled, maxWave, earnedThisRun, startTime}
  // }

  /* ---------- Events (alle Module dürfen senden/empfangen) ---------- */
  // 'nh:init'           -> beim Spielstart
  // 'nh:kill'           {type, x, y, weaponId, scrap, team}
  // 'nh:bossDie'        {bossId, x, y}
  // 'nh:combo'          {combo}
  // 'nh:scrap'          {n, x, y}
  // 'nh:waveStart'      {wave, boss}
  // 'nh:waveEnd'        {wave, bonus, quick}
  // 'nh:gameover'       {stats}
  // 'nh:ach'            {id}
  // 'nh:meta'           (Meta-Daten geändert)
  // 'nh:toast'          {text, color}
  // 'nh:bang'           {x, y, radius}   (Explosion -> Screen-Shake)
  // 'nh:lang'           (Sprache geändert)
  // 'nh:audioUnlock'    (erste User-Geste)
  // 'nh:damage'         {id, dmg, crit}  (Treffer-Feedback)
  // 'nh:boost'          {until}          (Combo-x7-Schadensboost aktualisiert)
  // 'nh:key'            {code}           (E / Space / 1-3 von input -> game)

  /* ---------- Canvas / Auflösung ---------- */
  // NH.game.ctx           2D-Context, logische 1280x720 (100 % fest, kein Kamera-Scroll)
  // NH.game.W=1280, NH.game.H=720

  /* ============================================================
   * AUDIO (audio.js)
   * ============================================================ */
  // NH.audio.unlock()                 beim ersten Klick/Touch (WebAudio-Resume)
  // NH.audio.sfx(name, opts)          synth-SFX; Namen: shoot_blaster, shoot_scattergun,
  //   shoot_piercer, shoot_chainbolt, shoot_triplaser, shoot_nova, shoot_tesla,
  //   shoot_flamer, shoot_mines, shoot_railgun, kill, hit, combo5, combo7, buy,
  //   sell, error, waveStart, bossSiren, fanfare, achievement, prestige, click, heal
  // NH.audio.setVolume(v)             0..1
  // NH.audio.enabled (bool)           aus Settings

  /* ============================================================
   * INPUT (input.js)
   * ============================================================ */
  // NH.input.init(canvas)
  // NH.input.keys         Set gedrückter e.code
  // NH.input.axis         {x,y} normalisiert (-1..1) aus Tastatur + Joystick
  // NH.input.pointer      {x,y} Canvas-Koordinaten, {active}
  // NH.input.any()        true bei jeder Bewegung (für Audio-Unlock)
  // Steuerung: WASD/Pfeile, Touch-Joystick (linke Hälfte), Pause=P, Shop=E,
  // Space=Welle starten, 1/2/3=Shop-Karten kaufen. Tasten emittieren 'nh:key'.

  /* ============================================================
   * SAVE (save.js) — localStorage, Key 'bytewerk_neonhorde_v1'
   * ============================================================ */
  // NH.save.load()        -> data (bei Blockiert: In-Memory-Fallback, warn)
  // NH.save.save()        debounced (500 ms)
  // NH.save.reset()       kompletter Reset (2× Bestätigung via ui)
  // NH.save.data = {
  //   bank, shards:{hp,dmg,speed,startscrap,wlevel}, prestige,
  //   lastDaily, streak, dayIndex, claimedToday:false, offlineTs,
  //   weekly:{key, id, progress, done},
  //   settings:{sound:true, shake:true, lang:'de'|'en'},
  //   lifetime:{kills, bankTotal, maxWave, bestCombo, weaponsMax, bossesKilled,
  //             prestiges, runs, weekliesDone},
  //   achievements:{id: {unlocked, claimed}},
  //   runSave:null|{wave, scrap, hp, maxHP, weapons:[{id,level}], buffs:{}, stats:{},
  //                 shardBonuses:{}}   // Auto-Save bei Shop-Öffnung, 'Weiterspielen'
  // }

  /* ============================================================
   * META (meta.js) — Bank/Shards/Daily/Streak/Offline/Weekly/Operator/Achievements
   * ============================================================ */
  // NH.meta.addBank(n, src)          schreibt nur Bank + lifetime.bankTotal
  // NH.meta.bank(), NH.meta.shards(), NH.meta.prestige()
  // NH.meta.shardBonus() -> {hpMult, dmgMult, speedMult, startScrap, startWeaponLevel}
  // NH.meta.prestigeCost() -> n       (2000 * 1.9^(prestige-1))
  // NH.meta.doPrestige()  -> bool     (prüft Bank, resettet, +1 Shard, Rang-Titel-Toast)
  // NH.meta.dailyInfo() -> {dayIndex, reward, claimed, streak, double}
  // NH.meta.claimDaily() -> bool      + Bank, setzt claimedToday
  // NH.meta.offlineReward() -> {minutes, scrap}|null (einmalig bei Boot anwenden)
  // NH.meta.weeklyInfo() -> {id, progress, target, done, reward, desc}
  // NH.meta.weeklyAdd(n, typeId)      Fortschritt der Wochenchallenge erhöhen
  // NH.meta.operatorLevel() -> n      floor(lifetime.bankTotal/100)
  // NH.meta.operatorCheck()           bei Level-Cross: Toast +10 Bank (je 100)
  // NH.meta.runStatsUpdate(runStats)  am Run-Ende: Kills/Bosse/Wave in lifetime + Ach-Checks
  // NH.meta.checkAchievements()       unlocked prüfen, 'nh:ach' feuern, kein Auto-Claim
  // NH.meta.claimAchievement(id) -> bool
  // NH.meta.achProgress(id) -> {cur, target, unlocked, claimed}

  /* ============================================================
   * ENTITIES (entities.js) — Gegner/Projektile/Pickups/Partikel/Türme/Minen
   * ============================================================ */
  // NH.ents.reset()
  // NH.ents.spawnEnemy(typeId, x, y) -> ent|null   (Cap 150)
  // NH.ents.spawnBoss(bossId, x, y, wave) -> ent|null
  // NH.ents.spawnProjectile(o)  o={x,y,angle,dmg,speed,range,weaponId,team:'player'|'enemy',
  //                                pierce,radius,color,crit,knockback,onHit}
  // NH.ents.chainFrom(o)        o={x,y,dmg,weaponId,chainTargets,chainRadius,stun,level}
  // NH.ents.spawnTurret(o)      o={x,y,def,stats,weaponId}  (tickt selbst, DPS im Radius)
  // NH.ents.spawnMineRing(o)    o={count,radius,dmg,aoe,respawn,weaponId,level}
  // NH.ents.spawnPickup(x,y,value)
  // NH.ents.damageEnemy(ent,dmg,o) -> {killed}  o={crit,knockback,weaponId,pierceId}
  // NH.ents.killEnemy(ent,weaponId,opts)         macht Scrap-Drop, Splits, Events
  // NH.ents.update(dt)          Gegner-AI (inkl. Bosse), Projektile, Pickups,
  //                             Partikel, Türme, Minen, Kollision Projektile<->Gegner
  // NH.ents.render(ctx)         alles Weltliche; Damage-Numbers + Partikel
  // NH.ents.enemies/projectiles/pickups/turrets/mines/particles/damageNumbers Arrays
  // NH.ents.activeBoss() -> ent|null
  // NH.ents.playerPos() -> {x,y} (von game gesetzt)
  // Events: 'nh:kill' {type,x,y,weaponId,scrap}, 'nh:bossDie', 'nh:damage',
  //         'nh:bang' {x,y,radius}, 'nh:scrap' {n,x,y} (bei Pickup-Einsammeln)

  /* ============================================================
   * WEAPONS (weapons.js) — eff. Stats, Auto-Aim, Feuermuster
   * ============================================================ */
  // NH.weapons.stats(id, level) -> effektives Waffen-Stat-Objekt (inkl. Milestones)
  // NH.weapons.update(dt)       Cooldowns, Zielsuche, Feuern -> NH.ents.*
  // NH.weapons.target() -> ent|null    (nächster Gegner; priorisiert killbar <30 %,
  //                                     Spiker/Mender; Reichweite je Muster)
  // NH.weapons.owned() -> [{id,level}] (aus NH.game.run.weapons)
  // NH.weapons.fire(w, stats)   Muster: single/cone/fan/pierce/chain/aoe/turret/flamer/orbit
  // Milestones: Lv3 +5 % Feuerrate, Lv6 +1 Projektil (bei 1-Projektil-Waffen statt
  //             dessen +15 % Schaden), Max-Lv +15 % Feuerrate (stapelt mit Lv3)

  /* ============================================================
   * WAVES (waves.js) — Budget, Spawn-Queue, Skalierung, Bosse
   * ============================================================ */
  // NH.waves.budget(w)      = 6 + 3w + 0.55 w^2
  // NH.waves.hpMult(w)      = 1 + 0.15w + 0.005 w^2
  // NH.waves.dmgMult(w)     = min(3, 1 + 0.04w)
  // NH.waves.speedMult(w)   = min(2.5, 1.02^w)
  // NH.waves.isBossWave(w)  -> 'warden'|'cyclops'|null
  // NH.waves.buildQueue(wave, duration) -> [{type, at, side}]  (4 Bursts 40/30/20/10 %)
  // NH.waves.pickType(wave) -> typeId  (gewichtet, gated minWave, Mender ab 10 selten)
  // NH.waves.waveBonus(w, quick) -> n  (15+3w, *1.05 bei quick)
  // NH.waves.bossBonus(bossId, wave) -> n (Warden 120+5w, Cyclops 300+10w)
  // NH.waves.recomputeBoss(def, bossId, wave) -> Boss-Def mit HP/Speed-Mults + Wiederkehr +30 %

  /* ============================================================
   * SHOP (shop.js) — Draft-Shop nach jeder Welle (Herzstück)
   * ============================================================ */
  // NH.shop.open()          offerten generieren + Overlay zeigen, Spiel pausiert
  // NH.shop.close()
  // NH.shop.offers           {weapon:{id,price,discount}, upgrades:[{id,cost,level}],
  //                           hotDeals:[{id,price}], rerollsLeft, rerollCost}
  // NH.shop.reroll()
  // NH.shop.buyWeapon(id, price) / buyUpgrade(id) / sellWeapon(id)
  // NH.shop.startNextWave()
  // Kauf-Tasten: 1/2/3 (nh:key), Space/Enter -> nächste Welle, E -> früh schließen (nach Clear)
  // HUD/Toasts: eigene CSS über NH.css.add, DOM in #overlays
  // Verkauf: 50 % von (Kaufpreis + ausgegebener Upgrade-Summe)

  /* ============================================================
   * UI (ui.js) — Theme-CSS, HUD, Screens, Overlays, Toasts, Modals
   * ============================================================ */
  // NH.ui.init()             baut #hud, #overlays-Screens, Menü
  // NH.ui.updateHUD(run)     pro Frame (HP, Scrap, Combo, Welle, Boss-Bar, Waffen-Pips)
  // NH.ui.showScreen(name, opts)  'menu'|'gameover'|'achievements'|'metashop'|
  //                               'prestige'|'daily'|'settings'|'tutorial'
  // NH.ui.hideScreens()
  // NH.ui.toast(text, color)
  // NH.ui.banner(title, sub, color, ms)
  // NH.ui.overlayOpen(title) -> Container   (für shop.js und Modal-Screens)
  // NH.ui.overlayClose()
  // NH.ui.confirm(opts) -> Promise<bool>
  // NH.ui.modal(html) -> Container
  // NH.ui.renderAll()        nach Sprachwechsel/Meta-Änderung Screens neu rendern
  // Übersetzungshelfer: NH.disp(ns, id, fallback) -> Anzeigename aus lang.de/en

  /* ============================================================
   * GAME (game.js) — Loop, State-Machine, Player, Combo, Integrator
   * ============================================================ */
  // NH.game.init(canvas)
  // NH.game.state          aus NH.gameState
  // NH.game.run            Run-Zustand (s.o.)
  // NH.game.player         {x,y,radius,invulnUntil,dir}
  // NH.game.startRun(newRun)   aus Menü/GameOver/Resume
  // NH.game.resumeRun()        aus runSave (landet direkt in Shop-Phase)
  // NH.game.enterShop()        Welle endet -> saveRunSnapshot + NH.shop.open()
  // NH.game.startNextWave()
  // NH.game.addScrap(n, src, x, y)      Popup + run.scrap + stats
  // NH.game.spendScrap(n) -> bool
  // NH.game.damagePlayer(dmg, x, y)
  // NH.game.gameOver(reason)            -> Banken (80 %), meta.runStatsUpdate, gameover-Screen
  // NH.game.update(dt) / NH.game.render()
  // NH.game.hitstop (s), NH.game.shake (px), NH.game.bossWarn (s)
  // NH.game.dpsMultiplier() -> 1 oder 1.1 (Combo-x7-Boost aktiv)

  /* ============================================================
   * MAIN (main.js) — Boot-Sequenz
   * ============================================================ */
  // NH.main.boot()
  // Reihenfolge: save.load -> offlineReward prüfen/anwenden -> audio bereit ->
  // ui.init -> game.init -> Boot-Screen (1,5 s, Enter skippt) -> Menü
  // oder 'Weiterspielen', wenn save.data.runSave existiert.
  // Globale Fehler: window.onerror -> Fehlermeldungs-Overlay (statt totem Screen).

  /* ---------- Laufzeitfluss (game.js pro Frame) ---------- */
  // update: input -> player-Move -> weapons.update(dt) -> waves.queue abarbeiten
  //   (spawn nach Zeitplan) -> ents.update(dt) -> Player-Kollision
  //   (Gegner-Kontakt, feindl. Projektile, Pickup-Magnet) -> Combo-Timer ->
  //   Regen -> Wellen-Ende prüfen -> Shake/Hitstop abklingen.
  // render: Welt (ents.render) + Player + HUD (ui.updateHUD) mit Shake-Offset.
})();