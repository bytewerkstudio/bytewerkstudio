/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * input.js — Steuerung Desktop (Tastatur/Maus) + Touch (Joystick)
 * Vertrag: api.js. Listen werden bei init() gesetzt (nie beim Laden).
 * WASD/Pfeile -> axis, Touch links -> Joystick, Maus/Touch rechts
 * -> pointer (Canvas-Logik-Koordinaten). Aktionen -> 'nh:key'.
 * Deadzone/Joystick-Radius sind Eingabe-Feeling, keine Balance.
 * coordinates IMMER Logik-Auflösung (1280x720); Skalierung via CSS.
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  /* ---------- Zustand (dt-unabhängig, wird ereignisgetrieben aktualisiert) ---------- */
  const keys = new Set();                  // gedrückte e.code (KeyW, ArrowUp, ...)
  const axis = { x: 0, y: 0 };             // kombiniert Tastatur + Joystick, Komponenten -1..1
  const pointer = { x: 0, y: 0, active: false }; // Logik-Koordinaten; active = Maus gedrückt / Touch rechts
  const ACTION_CODES = new Set(['KeyP', 'KeyE', 'Space', 'Digit1', 'Digit2', 'Digit3', 'Enter']);
  const SCROLL_CODES = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  const JOY_MAX = 60;   // px: Joystick-Vollausschlag
  const JOY_DEAD = 12;  // px: Totzone, verhindert Zittern

  let canvas = null;
  let joyId = null;              // pointerId des Joystick-Fingers
  let joy = null;                // {ox,oy,x,y} in Logik-Koordinaten
  const ptrs = new Map();        // pointerId -> {kind:'joy'|'ptr'} für Multi-Touch
  let unlocked = false;          // Audio-Unlock einmalig

  /* ---------- Helfer ---------- */
  function typingTarget(t) {
    return !!(t && ((t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') || t.isContentEditable));
  }
  function interactiveTarget(t) {
    return !!(t && t.closest && t.closest('input, textarea, select, button, a[href], [tabindex]'));
  }
  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: NH.u.clamp((e.clientX - r.left) * (canvas.width / r.width), 0, canvas.width),
      y: NH.u.clamp((e.clientY - r.top) * (canvas.height / r.height), 0, canvas.height),
    };
  }
  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    if (NH.audio && typeof NH.audio.unlock === 'function') NH.audio.unlock();
    NH.events.emit('nh:audioUnlock');
  }
  function recomputeAxis() {
    let x = 0, y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    if (joy) {
      const dx = joy.x - joy.ox, dy = joy.y - joy.oy;
      const d = Math.hypot(dx, dy);
      if (d > JOY_DEAD) {
        const t = Math.min(1, (d - JOY_DEAD) / (JOY_MAX - JOY_DEAD)); // 0..1, Deadzone-Rampe
        x += (dx / d) * t;
        y += (dy / d) * t;
      }
    }
    axis.x = NH.u.clamp(x, -1, 1);
    axis.y = NH.u.clamp(y, -1, 1);
  }
  function resetAll() {
    // Fokusverlust/Tab-Hidden: nichts hängen lassen
    keys.clear();
    ptrs.clear();
    joyId = null;
    joy = null;
    pointer.active = false;
    recomputeAxis();
  }
  function hasPtr() {
    for (const r of ptrs.values()) if (r.kind === 'ptr') return true;
    return false;
  }

  /* ---------- Tastatur (window: unabhängig vom Fokuselement) ---------- */
  function onKeyDown(e) {
    if (typingTarget(e.target)) return;              // Textfelder frei lassen
    if (e.ctrlKey || e.metaKey || e.altKey) return;  // Browser-Shortcuts nicht blockieren
    const code = e.code;
    // Fokussierter Button behält Space/Enter (Accessibility, kein Doppel-Trigger)
    if (interactiveTarget(e.target) && (code === 'Space' || code === 'Enter')) return;
    keys.add(code);
    if (!e.repeat) {
      unlockAudio();
      if (ACTION_CODES.has(code)) NH.events.emit('nh:key', { code });
    }
    if (SCROLL_CODES.has(code)) e.preventDefault(); // kein Seiten-Scrollen
    recomputeAxis();
  }
  function onKeyUp(e) {
    if (keys.delete(e.code)) recomputeAxis();
  }

  /* ---------- Zeiger: Maus überall -> pointer; Touch links -> Joystick, rechts -> pointer ---------- */
  function onPointerDown(e) {
    e.preventDefault(); // kein Scroll/Double-Tap-Zoom (touch-action: none zusätzlich in index.html)
    unlockAudio();
    const el = document.activeElement;
    if (el && el !== canvas && el.blur) el.blur(); // Space-Falle nach Button-Klick umgehen
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* Pointer evtl. schon weg */ }
    }
    const p = toLogical(e);
    const midX = (NH.game && NH.game.W) ? NH.game.W * 0.5 : canvas.width * 0.5;
    if (joyId === null && (e.pointerType === 'touch' || e.pointerType === 'pen') && p.x < midX) {
      joyId = e.pointerId;
      joy = { ox: p.x, oy: p.y, x: p.x, y: p.y };
      ptrs.set(e.pointerId, { kind: 'joy' });
    } else {
      pointer.x = p.x; pointer.y = p.y; pointer.active = true;
      ptrs.set(e.pointerId, { kind: 'ptr' });
    }
    recomputeAxis();
  }
  function onPointerMove(e) {
    e.preventDefault();
    const p = toLogical(e);
    const rec = ptrs.get(e.pointerId);
    if (rec) {
      if (rec.kind === 'joy') { joy.x = p.x; joy.y = p.y; }
      else { pointer.x = p.x; pointer.y = p.y; }
    } else if (e.pointerType === 'mouse') {
      pointer.x = p.x; pointer.y = p.y; // Hover hält Position frisch, active bleibt false
    }
    recomputeAxis();
  }
  function onPointerEnd(e) {
    const rec = ptrs.get(e.pointerId);
    if (!rec) return;
    ptrs.delete(e.pointerId);
    if (rec.kind === 'joy') { joyId = null; joy = null; }
    else if (!hasPtr()) pointer.active = false;
    recomputeAxis();
  }

  /* ---------- Öffentliche API (Vertrag api.js) ---------- */
  NH.input = {
    init(c) {
      if (canvas) { canvas = c; return; } // idempotent
      canvas = c;
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('blur', resetAll);                     // Fokusverlust
      document.addEventListener('visibilitychange', () => { if (document.hidden) resetAll(); });
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerEnd);            // Loslassen außerhalb Canvas
      window.addEventListener('pointercancel', onPointerEnd);
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    keys,
    axis,
    pointer,
    /* any(): aktuell irgendeine Bewegung (Bewegungstaste, Joystick, Pointer) */
    any() {
      return keys.has('KeyW') || keys.has('KeyA') || keys.has('KeyS') || keys.has('KeyD') ||
        keys.has('ArrowUp') || keys.has('ArrowDown') || keys.has('ArrowLeft') || keys.has('ArrowRight') ||
        !!joy || pointer.active;
    },
  };
})();
