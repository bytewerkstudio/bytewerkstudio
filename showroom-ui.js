/* ============================================================
   BYTEWERK STUDIO — showroom-ui.js
   ------------------------------------------------------------
   State, list, detail card and keyboard control for the 3D
   showroom. Runs without WebGL: the scene module is optional
   and attaches through the same small API.
   ============================================================ */

(function () {
  'use strict';

  var stage = document.getElementById('sr-stage');
  if (!stage) return;

  var links = Array.prototype.slice.call(document.querySelectorAll('[data-sr-product]'));
  if (!links.length) return;

  function pick(el, base) {
    var lang = document.documentElement.lang === 'en' ? 'en' : 'de';
    if (lang === 'en') {
      var en = el.getAttribute('data-' + base + '-en');
      if (en) return en;
    }
    return el.getAttribute('data-' + base) || '';
  }

  var products = links.map(function (a, i) {
    return {
      index: i,
      id: a.getAttribute('data-id') || ('produkt-' + i),
      href: a.getAttribute('href'),
      icon: a.getAttribute('data-icon'),
      kind: a.getAttribute('data-kind') || 'App',
      family: a.closest('.sr-row').getAttribute('data-family') || 'app',
      tags: (a.closest('.sr-row').getAttribute('data-tags') || '').split(/\s+/),
      name: pick(a, 'name'),
      cat: pick(a, 'cat'),
      desc: pick(a, 'desc'),
      price: pick(a, 'price'),
      platform: pick(a, 'platform'),
      license: pick(a, 'license')
    };
  });

  var state = { index: 0, filter: 'all' };
  var listeners = [];
  var dom = {
    name: document.querySelector('[data-sr-name]'),
    cat: document.querySelector('[data-sr-cat]'),
    desc: document.querySelector('[data-sr-desc]'),
    idx: document.querySelector('[data-sr-idx]'),
    kind: document.querySelector('[data-sr-kind]'),
    icon: document.querySelector('[data-sr-icon]'),
    wm: document.querySelector('[data-sr-wm]'),
    platform: document.querySelector('[data-sr-platform]'),
    price: document.querySelector('[data-sr-price]'),
    license: document.querySelector('[data-sr-license]'),
    open: document.querySelector('[data-sr-open]'),
    count: document.querySelector('[data-sr-count]'),
    total: document.querySelector('[data-sr-total]'),
    badge: document.querySelector('[data-sr-badge]'),
    live: document.querySelector('[data-sr-live]'),
    flatIcon: document.querySelector('[data-sr-flat-icon]'),
    flatName: document.querySelector('[data-sr-flat-name]'),
    flatMeta: document.querySelector('[data-sr-flat-meta]'),
    detail: document.getElementById('sr-detail')
  };
  var rail = document.querySelector('[data-sr-rail]');
  var railButtons = [];

  if (rail) {
    products.forEach(function (p, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', (i + 1) + ' — ' + p.name);
      btn.title = p.name;
      btn.addEventListener('click', function () { focus(i); });
      rail.appendChild(btn);
      railButtons.push(btn);
    });
  }

  function product(i) { return products[Math.max(0, Math.min(products.length - 1, i))]; }

  function matches(p) {
    if (state.filter === 'all') return true;
    if (state.filter === 'free') return p.tags.indexOf('free') > -1;
    return p.tags.indexOf(state.filter) > -1;
  }

  function visible() {
    var out = [];
    for (var i = 0; i < products.length; i++) {
      if (matches(products[i])) out.push(i);
    }
    return out;
  }

  function emit(type) {
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i]({ type: type, product: product(state.index), index: state.index, filter: state.filter });
      } catch (err) { /* a broken subscriber must not stop the page */ }
    }
  }

  var swapTimer = 0;
  var renderTimer = 0;

  function render(animate) {
    var p = product(state.index);
    var vis = visible();
    var pos = vis.indexOf(state.index);
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };

    window.clearTimeout(renderTimer);
    if (animate) {
      dom.detail.classList.add('is-swap');
      swapTimer = window.setTimeout(function () { dom.detail.classList.remove('is-swap'); }, 140);
    }

    dom.name.textContent = p.name;
    dom.cat.textContent = p.cat;
    dom.desc.textContent = p.desc;
    dom.idx.textContent = pad(p.index + 1);
    if (dom.wm) dom.wm.textContent = pad(p.index + 1);
    dom.kind.textContent = (document.documentElement.lang === 'en' && p.kind === 'Spiel') ? 'Game' : p.kind;
    dom.platform.textContent = p.platform;
    dom.price.textContent = p.price;
    dom.license.textContent = p.license;
    dom.open.setAttribute('href', p.href);
    dom.open.setAttribute('data-sr-id', p.id);
    dom.badge.textContent = p.cat;
    dom.count.textContent = pad((pos < 0 ? 0 : pos) + 1);
    dom.total.textContent = pad(vis.length);

    for (var r = 0; r < railButtons.length; r++) {
      railButtons[r].setAttribute('aria-current', String(r === state.index));
      railButtons[r].classList.toggle('is-dim', !matches(products[r]));
      if (r === state.index) railButtons[r].setAttribute('aria-label', (r + 1) + ' — ' + p.name);
      else railButtons[r].setAttribute('aria-label', (r + 1) + ' — ' + products[r].name);
      railButtons[r].title = products[r].name;
    }

    if (p.icon && dom.icon.getAttribute('src') !== p.icon) dom.icon.setAttribute('src', p.icon);
    dom.icon.setAttribute('alt', p.name);
    if (dom.flatIcon.getAttribute('src') !== p.icon) dom.flatIcon.setAttribute('src', p.icon);
    dom.flatName.textContent = p.name;
    dom.flatMeta.textContent = p.cat;

    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(function () {
      dom.live.textContent = p.name + ' — ' + p.cat + ', ' + p.price;
    }, 400);
  }

  function dimRows() {
    var rows = document.querySelectorAll('.sr-row');
    for (var i = 0; i < rows.length; i++) {
      var fam = rows[i].getAttribute('data-family');
      var tags = (rows[i].getAttribute('data-tags') || '').split(/\s+/);
      var ok = state.filter === 'all' ||
        (state.filter === 'free' ? tags.indexOf('free') > -1 : tags.indexOf(state.filter) > -1);
      rows[i].classList.toggle('is-dim', !ok);
    }
  }

  function hashFor(p) {
    return '#' + p.id;
  }

  function syncHash(p) {
    if (!history.replaceState) return;
    try {
      history.replaceState(null, '', location.pathname + location.search + hashFor(p));
    } catch (err) { /* some file:// setups refuse replaceState */ }
  }

  function focus(i, opts) {
    var next = Math.max(0, Math.min(products.length - 1, i));
    var changed = next !== state.index;
    state.index = next;
    if (changed || (opts && opts.force)) {
      render(changed);
      emit('focus');
    }
    if (!opts || opts.hash !== false) syncHash(product(next));
  }

  function step(dir) {
    var vis = visible();
    if (!vis.length) return;
    var pos = vis.indexOf(state.index);
    if (pos < 0) pos = 0;
    var nextPos = (pos + dir + vis.length) % vis.length;
    focus(vis[nextPos]);
  }

  function setFilter(key) {
    state.filter = key;
    var chips = document.querySelectorAll('[data-sr-filter]');
    for (var i = 0; i < chips.length; i++) {
      var on = chips[i].getAttribute('data-sr-filter') === key;
      chips[i].setAttribute('aria-pressed', String(on));
      chips[i].classList.toggle('active', on);
    }
    dimRows();
    if (!matches(product(state.index))) {
      var vis = visible();
      if (vis.length) focus(vis[0]);
    } else {
      render(false);
      emit('filter');
    }
  }

  function open() {
    var href = product(state.index).href;
    if (href) window.location.href = href;
  }

  function ready() {
    stage.classList.remove('is-loading');
    stage.classList.remove('is-flat');
    stage.classList.add('is-ready');
  }

  function fail() {
    stage.classList.remove('is-loading');
    stage.classList.add('is-flat');
  }

  /* ---- events ---- */

  document.querySelectorAll('[data-sr-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      setFilter(chip.getAttribute('data-sr-filter'));
    });
  });

  /* Hovering an index row previews that plate on the stage. */
  var hoverTimer = 0;
  document.querySelectorAll('.sr-row').forEach(function (row, i) {
    var link = row.querySelector('[data-sr-product]');
    if (!link) return;
    row.addEventListener('mouseenter', function () {
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(function () {
        var idx = products.findIndex(function (p) { return p.href === link.getAttribute('href'); });
        if (idx > -1 && idx !== state.index) focus(idx, { hash: false });
      }, 140);
    });
    row.addEventListener('mouseleave', function () { window.clearTimeout(hoverTimer); });
    link.addEventListener('focus', function () {
      var idx = products.findIndex(function (p) { return p.href === link.getAttribute('href'); });
      if (idx > -1 && idx !== state.index) focus(idx, { hash: false });
    });
  });

  var prev = document.querySelector('[data-sr-prev]');
  var next = document.querySelector('[data-sr-next]');
  if (prev) prev.addEventListener('click', function () { step(-1); });
  if (next) next.addEventListener('click', function () { step(1); });

  stage.addEventListener('keydown', function (e) {
    var key = e.key;
    if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'PageDown') {
      e.preventDefault(); step(1);
    } else if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'PageUp') {
      e.preventDefault(); step(-1);
    } else if (key === 'Home') {
      e.preventDefault(); var v1 = visible(); if (v1.length) focus(v1[0]);
    } else if (key === 'End') {
      e.preventDefault(); var v2 = visible(); if (v2.length) focus(v2[v2.length - 1]);
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault(); open();
    }
  });

  document.addEventListener('bw:lang', function () {
    products = links.map(function (a, i) {
      return {
        index: i,
        id: a.getAttribute('data-id') || ('produkt-' + i),
        href: a.getAttribute('href'),
        icon: a.getAttribute('data-icon'),
        kind: a.getAttribute('data-kind') || 'App',
        family: a.closest('.sr-row').getAttribute('data-family') || 'app',
        tags: (a.closest('.sr-row').getAttribute('data-tags') || '').split(/\s+/),
        name: pick(a, 'name'),
        cat: pick(a, 'cat'),
        desc: pick(a, 'desc'),
        price: pick(a, 'price'),
        platform: pick(a, 'platform'),
        license: pick(a, 'license')
      };
    });
    window.bwShowroom.products = products;
    for (var r2 = 0; r2 < railButtons.length; r2++) {
      railButtons[r2].setAttribute('aria-label', (r2 + 1) + ' — ' + products[r2].name);
      railButtons[r2].title = products[r2].name;
    }
    render(false);
    emit('lang');
  });

  window.addEventListener('hashchange', function () {
    var id = location.hash.replace('#', '');
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) { focus(i, { hash: false }); break; }
    }
  });

  /* ---- share ---- */
  var copyBtn = document.querySelector('[data-sr-share]');
  function copyLabel() {
    if (!copyBtn) return '';
    var en = copyBtn.getAttribute('data-en');
    return document.documentElement.lang === 'en' && en ? en : 'Link kopieren';
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = location.origin + location.pathname + hashFor(product(state.index));
      var done = function () {
        copyBtn.textContent = document.documentElement.lang === 'en' ? 'Link copied' : 'Link kopiert';
        copyBtn.classList.add('is-done');
        window.setTimeout(function () {
          copyBtn.textContent = copyLabel();
          copyBtn.classList.remove('is-done');
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt('Link', url); });
      } else {
        window.prompt('Link', url);
      }
    });
  }

  /* ---- boot ---- */
  var fromHash = -1;
  if (location.hash) {
    var id = location.hash.replace('#', '');
    for (var h = 0; h < products.length; h++) {
      if (products[h].id === id) { fromHash = h; break; }
    }
  }
  state.index = fromHash > -1 ? fromHash : 0;
  render(false);
  dimRows();

  /* If the scene never reports back, show the flat plate instead of a
     frozen loading state. */
  window.setTimeout(function () {
    if (!stage.classList.contains('is-ready')) fail();
  }, 4500);

  window.bwShowroom = {
    products: products,
    state: state,
    focus: focus,
    step: step,
    setFilter: setFilter,
    open: open,
    ready: ready,
    fail: fail,
    current: function () { return product(state.index); },
    matches: matches,
    subscribe: function (fn) {
      listeners.push(fn);
      fn({ type: 'init', product: product(state.index), index: state.index, filter: state.filter });
      return function () {
        var at = listeners.indexOf(fn);
        if (at > -1) listeners.splice(at, 1);
      };
    }
  };

  stage.addEventListener('sr:step', function (e) {
    if (e.detail && e.detail.dir) step(e.detail.dir);
  });
})();
