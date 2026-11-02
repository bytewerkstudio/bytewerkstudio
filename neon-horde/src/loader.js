/* ============================================================
 * NEON HORDE — Bytewerk Studio
 * loader.js — NH Namespace, Utilities, Event-Bus, i18n, DOM, CSS
 * Lade-Reihenfolge: loader -> balance -> lang -> audio -> input
 *                   -> meta -> save -> entities -> weapons
 *                   -> waves -> shop -> ui -> game -> main
 * ============================================================ */
(function () {
  'use strict';
  const NH = (window.NH = window.NH || {});

  /* ---------- Utilities ---------- */
  NH.u = {
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    rand: (a, b) => a + Math.random() * (b - a),
    randi: (a, b) => Math.floor(NH.u.rand(a, b + 1)),
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
    dist2: (ax, ay, bx, by) => {
      const dx = ax - bx, dy = ay - by;
      return dx * dx + dy * dy;
    },
    dist: (ax, ay, bx, by) => Math.sqrt(NH.u.dist2(ax, ay, bx, by)),
    angleTo: (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax),
    fmt: (n) => {
      n = Math.round(n);
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
      return String(n);
    },
    fmtClock: (s) => {
      s = Math.max(0, Math.ceil(s));
      const m = Math.floor(s / 60), ss = s % 60;
      return m + ':' + (ss < 10 ? '0' : '') + ss;
    },
    keyOf: (o) => Object.keys(o)[0],
  };

  /* ---------- Event Bus ---------- */
  NH.events = {
    _m: Object.create(null),
    on(evt, fn) {
      (this._m[evt] = this._m[evt] || []).push(fn);
      return fn;
    },
    off(evt, fn) {
      const a = this._m[evt];
      if (a) {
        const i = a.indexOf(fn);
        if (i >= 0) a.splice(i, 1);
      }
    },
    emit(evt, data) {
      const a = this._m[evt];
      if (a) for (let i = 0; i < a.length; i++) { try { a[i](data); } catch (e) { console.error('[NH:events:' + evt + ']', e); } }
    },
  };

  /* ---------- i18n ---------- */
  NH.lang = {
    current: (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().indexOf('de') === 0) ? 'de' : 'en',
    de: {},
    en: {},
    set(l) {
      this.current = l === 'de' ? 'de' : 'en';
      NH.events.emit('lang', l);
      NH.events.emit('nh:lang', l); // Vertragskanal; 'lang' bleibt Legacy
    },
    t(path) {
      const parts = path.split('.');
      const ns = parts[0];
      const key = parts.slice(1).join('.');
      const table = (this[this.current] && this[this.current][ns]) || {};
      let v = table[key];
      if (v === undefined) {
        const enTable = (this.en && this.en[ns]) || {};
        v = enTable[key];
        if (v === undefined) return path;
      }
      return v;
    },
  };
  NH.t = (p) => NH.lang.t(p);

  /* ---------- DOM helpers ---------- */
  NH.dom = {
    el(tag, attrs, children) {
      const n = document.createElement(tag);
      if (attrs) {
        for (const k in attrs) {
          const v = attrs[k];
          if (v === undefined || v === null) continue;
          if (k === 'class') n.className = v;
          else if (k === 'text') n.textContent = v;
          else if (k === 'html') n.innerHTML = v;
          else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
          else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
          else if (k === 'dataset') Object.assign(n.dataset, v);
          else n.setAttribute(k, v);
        }
      }
      if (children !== undefined && children !== null) {
        if (typeof children === 'string' || typeof children === 'number') n.textContent = String(children);
        else if (Array.isArray(children)) for (const c of children) if (c) n.appendChild(c);
        else n.appendChild(children);
      }
      return n;
    },
    div(children, cls) {
      return NH.dom.el('div', cls ? { class: cls } : null, children);
    },
    button(label, cls, onClick) {
      const b = NH.dom.el('button', { class: cls || 'nh-btn' }, label);
      if (onClick) b.addEventListener('click', onClick);
      return b;
    },
    clear(node) {
      while (node.firstChild) node.removeChild(node.firstChild);
    },
    show(node) { node.classList.remove('nh-hidden'); },
    hide(node) { node.classList.add('nh-hidden'); },
    $(sel) { return document.querySelector(sel); },
    $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); },
  };

  /* ---------- CSS injection (gathers module styles into one tag) ---------- */
  NH.css = {
    _styles: [],
    add(cssText) {
      this._styles.push(cssText);
      let tag = NH.dom.$('#nh-styles');
      if (tag && typeof tag.appendChild !== 'function') tag = null;
      if (!tag) {
        tag = document.createElement('style');
        tag.id = 'nh-styles';
        (document.head || document.documentElement).appendChild(tag);
      }
      tag.appendChild(document.createTextNode(cssText));
    },
    all() { return this._styles.join('\n'); },
  };

  /* ---------- Log ---------- */
  NH.log = (...a) => console.log('[NH]', ...a);
})();