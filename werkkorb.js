/* ============================================================
   BYTEWERK STUDIO — werkkorb.js
   ------------------------------------------------------------
   A quiet basket for the five paid Windows apps. It does not
   process payments: it collects a selection and prepares one
   purchase request by e-mail, which is the flow the product
   pages already use.

   - persistent in localStorage
   - quantity, subtotal, remove, clear
   - one mailto with every line item
   - keyboard: ESC closes, Tab stays inside, focus returns
   - works without the product pages changing their markup:
     the add buttons are injected next to the existing ones
   ============================================================ */

(function () {
  'use strict';

  var CATALOG = {
    'lernreich-pro': {
      name: 'Lernreich Pro',
      price: 9.99,
      note: 'Windows · Fokus',
      icon: 'media/lernreich-pro-icon.svg',
      url: 'lernreich-pro.html'
    },
    'keyforge-vault': {
      name: 'KeyForge Vault',
      price: 12.99,
      note: 'Windows · Security',
      icon: 'media/keyforge-vault-icon.svg',
      url: 'keyforge-vault.html'
    },
    updatepilot: {
      name: 'UpdatePilot',
      price: 12.99,
      note: 'Windows · Updates',
      icon: 'media/updatepilot-icon.svg',
      url: 'updatepilot.html'
    },
    'bytewerk-pdf-text-pro': {
      name: 'Bytewerk PDF Text Pro',
      price: 59.00,
      note: 'Windows · PDF/OCR',
      icon: 'media/bytewerk-pdf-text-pro-icon.svg',
      url: 'bytewerk-pdf-text-pro.html'
    },
    'neon-dominion': {
      name: 'Neon Dominion',
      price: 20.00,
      note: 'Windows · Spiel',
      icon: 'media/neon-dominion-icon.svg',
      url: 'neon-dominion.html'
    }
  };

  var STORAGE = 'bw-werkkorb-v1';
  var MAX_QTY = 9;

  var file = (location.pathname.split('/').pop() || 'index.html');
  var productId = file.replace('.html', '');

  if (document.querySelector('.wk-root')) return;

  /* ---------- state ---------- */
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      var next = {};
      Object.keys(raw).forEach(function (id) {
        if (CATALOG[id] && typeof raw[id] === 'number' && raw[id] > 0) {
          next[id] = Math.min(MAX_QTY, Math.round(raw[id]));
        }
      });
      return next;
    } catch (err) {
      return {};
    }
  }

  var items = load();

  function save() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch (err) { /* private mode: the basket lives for this page only */ }
  }

  function count() {
    return Object.keys(items).reduce(function (sum, id) { return sum + items[id]; }, 0);
  }

  function total() {
    return Object.keys(items).reduce(function (sum, id) {
      return sum + CATALOG[id].price * items[id];
    }, 0);
  }

  function money(value) {
    return value.toFixed(2).replace('.', ',') + ' €';
  }

  function lang() {
    return (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  }

  function t(de, en) {
    return lang() === 'en' ? en : de;
  }

  /* ---------- markup ---------- */
  var ICON_BASKET = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.4 9.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 9Z"/><path d="M8.5 9 10 4.5M15.5 9 14 4.5"/><path d="M9.5 13v3M14.5 13v3"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

  function buildDrawer() {
    var wrap = document.createElement('div');
    wrap.className = 'wk-root';
    wrap.innerHTML =
      '<div class="wk-backdrop" data-wk-close hidden></div>' +
      '<aside class="wk-drawer" id="wk-drawer" role="dialog" aria-modal="true" aria-labelledby="wk-title" hidden>' +
        '<header class="wk-head">' +
          '<div>' +
            '<span class="wk-eyebrow">Werkkorb</span>' +
            '<h2 id="wk-title" class="wk-title">Deine Auswahl</h2>' +
          '</div>' +
          '<button class="wk-close" type="button" data-wk-close aria-label="Schließen">' + ICON_CLOSE + '</button>' +
        '</header>' +
        '<div class="wk-body">' +
          '<div class="wk-empty" data-wk-empty>' +
            '<p>Noch nichts ausgewählt. Im Shop liegen elf Produkte — fünf davon lassen sich hier sammeln.</p>' +
            '<a class="btn btn-ghost wk-empty-shop" href="shop.html">Zum Shop</a>' +
          '</div>' +
          '<ul class="wk-list" data-wk-list></ul>' +
        '</div>' +
        '<footer class="wk-foot">' +
          '<div class="wk-sum"><span>Summe</span><b data-wk-total aria-live="polite">0,00 €</b></div>' +
          '<p class="wk-note">Keine Zahlung auf dieser Seite. Du bekommst die PayPal-Daten und die Downloads per E-Mail.</p>' +
          '<a class="btn btn-primary wk-buy" data-wk-mail href="mailto:Haqmalh@icloud.com">Kaufanfrage per E-Mail <span class="arr">→</span></a>' +
          '<div class="wk-foot-row">' +
            '<button class="btn btn-ghost wk-copy" type="button" data-wk-copy>Liste kopieren</button>' +
            '<button class="wk-clear" type="button" data-wk-clear>Korb leeren</button>' +
          '</div>' +
        '</footer>' +
      '</aside>' +
      '<div class="wk-live" aria-live="polite" data-wk-live></div>' +
      '<div class="wk-toast" data-wk-toast hidden></div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  var root = buildDrawer();
  var drawer = root.querySelector('.wk-drawer');
  var backdrop = root.querySelector('.wk-backdrop');
  var listEl = root.querySelector('[data-wk-list]');
  var emptyEl = root.querySelector('[data-wk-empty]');
  var emptyP = emptyEl.querySelector('p');
  var emptyShop = emptyEl.querySelector('.wk-empty-shop');
  var totalEl = root.querySelector('[data-wk-total]');
  var mailEl = root.querySelector('[data-wk-mail]');
  var liveEl = root.querySelector('[data-wk-live]');
  var toastEl = root.querySelector('[data-wk-toast]');
  var lastFocus = null;

  /* ---------- header button ---------- */
  var navBtn = document.createElement('button');
  navBtn.type = 'button';
  navBtn.className = 'wk-nav-btn';
  navBtn.setAttribute('data-wk-open', '');
  navBtn.setAttribute('aria-haspopup', 'dialog');
  navBtn.setAttribute('aria-expanded', 'false');
  navBtn.innerHTML = ICON_BASKET + '<span class="wk-badge" data-wk-count hidden>0</span>';

  var navRight = document.querySelector('.nav-right');
  if (navRight) {
    var anchor = navRight.querySelector('.acct-slot') || navRight.querySelector('.lang-toggle') || navRight.querySelector('.nav-search');
    if (anchor && anchor.nextSibling) navRight.insertBefore(navBtn, anchor.nextSibling);
    else if (anchor) navRight.appendChild(navBtn);
    else navRight.insertBefore(navBtn, navRight.firstChild);
  }

  /* ---------- labels ---------- */
  var staticLabels = [
    [root.querySelector('.wk-title'), 'Deine Auswahl', 'Your selection'],
    [emptyP, 'Noch nichts ausgewählt. Im Shop liegen elf Produkte — fünf davon lassen sich hier sammeln.', 'Nothing selected yet. The shop has eleven products — five of them can be collected here.'],
    [emptyShop, 'Zum Shop', 'To the shop'],
    [root.querySelector('.wk-sum span'), 'Summe', 'Total'],
    [root.querySelector('.wk-note'), 'Keine Zahlung auf dieser Seite. Du bekommst die PayPal-Daten und die Downloads per E-Mail.', 'No payment on this page. You receive the PayPal details and the downloads by e-mail.'],
    [root.querySelector('[data-wk-copy]'), 'Liste kopieren', 'Copy list'],
    [root.querySelector('[data-wk-clear]'), 'Korb leeren', 'Clear basket'],
    [root.querySelector('.wk-close'), null, null]
  ];

  function applyLabels() {
    staticLabels.forEach(function (row) {
      if (!row[0] || row[1] === null) return;
      row[0].textContent = t(row[1], row[2]);
    });
    var mail = root.querySelector('[data-wk-mail]');
    if (mail) {
      mail.innerHTML = t('Kaufanfrage per E-Mail', 'Purchase request by e-mail') + ' <span class="arr">→</span>';
    }
    Array.prototype.forEach.call(document.querySelectorAll('.wk-card-add'), function (btn) {
      btn.setAttribute('aria-label', t('In den Werkkorb', 'Add to basket'));
      btn.setAttribute('title', t('In den Werkkorb', 'Add to basket'));
    });
    var prodBtn = document.querySelector('.wk-product-add');
    if (prodBtn) {
      prodBtn.innerHTML = ICON_BASKET + '<span>' + t('In den Werkkorb', 'Add to basket') + '</span>';
      prodBtn.setAttribute('aria-label', t('In den Werkkorb', 'Add to basket'));
    }
    var emptyLink = root.querySelector('.wk-empty-shop');
    if (emptyLink) emptyLink.setAttribute('href', 'shop.html');
    root.querySelector('.wk-close').setAttribute('aria-label', t('Schließen', 'Close'));
    root.querySelector('[data-wk-clear]').setAttribute('aria-label', t('Korb leeren', 'Clear basket'));
    navBtn.setAttribute('aria-label', t('Werkkorb öffnen', 'Open basket'));
    render();
  }

  /* ---------- rendering ---------- */
  function render() {
    var ids = Object.keys(items);
    listEl.innerHTML = '';

    ids.forEach(function (id) {
      var entry = CATALOG[id];
      var li = document.createElement('li');
      li.className = 'wk-item';
      li.innerHTML =
        '<img class="wk-thumb" src="' + entry.icon + '" alt="" width="56" height="56" loading="lazy">' +
        '<div class="wk-meta">' +
          '<b>' + entry.name + '</b>' +
          '<small>' + entry.note + '</small>' +
          '<div class="wk-qty">' +
            '<button type="button" data-wk-dec="' + id + '" aria-label="' + t('Weniger', 'Less') + '">−</button>' +
            '<span>' + items[id] + '</span>' +
            '<button type="button" data-wk-inc="' + id + '" aria-label="' + t('Mehr', 'More') + '">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="wk-item-price">' + money(entry.price * items[id]) + '</div>' +
        '<button type="button" class="wk-remove" data-wk-remove="' + id + '" aria-label="' + t('Entfernen', 'Remove') + '">' + ICON_CLOSE + '</button>';
      listEl.appendChild(li);
    });

    var empty = ids.length === 0;
    emptyEl.hidden = !empty;
    listEl.hidden = empty;
    drawer.classList.toggle('is-empty', empty);

    totalEl.textContent = money(total());
    mailEl.setAttribute('aria-disabled', empty ? 'true' : 'false');
    mailEl.classList.toggle('is-disabled', empty);
    if (empty) {
      mailEl.setAttribute('href', 'mailto:Haqmalh@icloud.com');
      mailEl.setAttribute('tabindex', '-1');
    } else {
      mailEl.setAttribute('href', mailHref());
      mailEl.removeAttribute('tabindex');
    }

    var n = count();
    var badges = document.querySelectorAll('[data-wk-count]');
    Array.prototype.forEach.call(badges, function (badge) {
      badge.textContent = String(n);
      badge.hidden = n === 0;
    });
    document.documentElement.classList.toggle('wk-has-items', n > 0);
  }

  function mailBody() {
    var lines = Object.keys(items).map(function (id) {
      var entry = CATALOG[id];
      return items[id] + '× ' + entry.name + ' — ' + money(entry.price * items[id]);
    });
    var intro = t(
      'Hallo Bytewerk Studio,\n\nich möchte folgende Apps kaufen:',
      'Hello Bytewerk Studio,\n\nI would like to buy the following apps:'
    );
    var outro = t(
      'Summe: ' + money(total()) + '\n\nBitte sendet mir die PayPal-Zahlungsdaten und die Downloads.\n\nViele Grüße',
      'Total: ' + money(total()) + '\n\nPlease send me the PayPal details and the downloads.\n\nBest regards'
    );
    return intro + '\n\n' + lines.join('\n') + '\n\n' + outro;
  }

  function mailHref() {
    var subject = t('Kaufanfrage Werkkorb', 'Purchase request basket');
    return 'mailto:Haqmalh@icloud.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(mailBody());
  }

  /* ---------- open / close ---------- */
  function focusables() {
    return Array.prototype.slice.call(drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return el.offsetParent !== null && el.getAttribute('aria-disabled') !== 'true'; });
  }

  function open(opener) {
    lastFocus = opener || document.activeElement;
    backdrop.hidden = false;
    drawer.hidden = false;
    document.body.classList.add('wk-locked');
    navBtn.setAttribute('aria-expanded', 'true');
    render();
    requestAnimationFrame(function () {
      backdrop.classList.add('is-open');
      drawer.classList.add('is-open');
      var first = focusables()[0];
      if (first) first.focus({ preventScroll: true });
      else drawer.focus({ preventScroll: true });
    });
  }

  function close() {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('wk-locked');
    navBtn.setAttribute('aria-expanded', 'false');
    window.setTimeout(function () {
      if (!drawer.classList.contains('is-open')) {
        drawer.hidden = true;
        backdrop.hidden = true;
      }
    }, 320);
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }
  }

  /* ---------- actions ---------- */
  var toastTimer = 0;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add('is-on'); });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-on');
      window.setTimeout(function () { toastEl.hidden = true; }, 260);
    }, 2600);
  }

  function add(id, opener) {
    var entry = CATALOG[id];
    if (!entry) return;
    items[id] = Math.min(MAX_QTY, (items[id] || 0) + 1);
    save();
    render();
    liveEl.textContent = entry.name + ' ' + t('im Werkkorb', 'in the basket');
    open(opener);
  }

  function setQty(id, qty) {
    if (!CATALOG[id]) return;
    var entry = CATALOG[id];
    var hadFocus = drawer.contains(document.activeElement);
    if (qty <= 0) delete items[id];
    else items[id] = Math.min(MAX_QTY, qty);
    save();
    render();
    liveEl.textContent = items[id]
      ? entry.name + ', ' + t('Menge', 'Quantity') + ' ' + items[id]
      : entry.name + ' ' + t('entfernt', 'removed');
    if (hadFocus && !drawer.contains(document.activeElement)) {
      var next = focusables()[0];
      if (next) next.focus({ preventScroll: true });
    }
  }

  /* ---------- delegated events ---------- */
  document.addEventListener('click', function (event) {
    var openBtn = event.target.closest('[data-wk-open]');
    if (openBtn) {
      event.preventDefault();
      open(openBtn);
      return;
    }

    var addBtn = event.target.closest('[data-wk-add]');
    if (addBtn) {
      event.preventDefault();
      event.stopPropagation();
      add(addBtn.getAttribute('data-wk-add'), addBtn);
      return;
    }

    if (event.target.closest('[data-wk-close]')) {
      event.preventDefault();
      close();
      return;
    }

    var inc = event.target.closest('[data-wk-inc]');
    if (inc) {
      var idInc = inc.getAttribute('data-wk-inc');
      setQty(idInc, (items[idInc] || 0) + 1);
      return;
    }

    var dec = event.target.closest('[data-wk-dec]');
    if (dec) {
      var idDec = dec.getAttribute('data-wk-dec');
      setQty(idDec, (items[idDec] || 0) - 1);
      return;
    }

    var remove = event.target.closest('[data-wk-remove]');
    if (remove) {
      var idRemove = remove.getAttribute('data-wk-remove');
      delete items[idRemove];
      save();
      render();
      liveEl.textContent = CATALOG[idRemove].name + ' ' + t('entfernt', 'removed');
      var next = focusables()[0];
      if (next) next.focus({ preventScroll: true });
      else close();
      return;
    }

    var clear = event.target.closest('[data-wk-clear]');
    if (clear) {
      items = {};
      save();
      render();
      liveEl.textContent = t('Werkkorb geleert.', 'Basket cleared.');
      toast(t('Werkkorb geleert.', 'Basket cleared.'));
      return;
    }

    var copy = event.target.closest('[data-wk-copy]');
    if (copy) {
      var text = mailBody();
      var done = function () { toast(t('Liste kopiert.', 'List copied.')); };
      var fail = function () {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); done(); }
        catch (err) { toast(t('Kopieren nicht möglich.', 'Copy not possible.')); }
        document.body.removeChild(area);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        fail();
      }
      return;
    }

    var mail = event.target.closest('[data-wk-mail]');
    if (mail && mail.classList.contains('is-disabled')) {
      event.preventDefault();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (drawer.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    var list = focusables();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- inject add buttons ---------- */
  function decorateCards() {
    var cards = document.querySelectorAll('.prod[href]');
    Array.prototype.forEach.call(cards, function (card) {
      var href = (card.getAttribute('href') || '').split('#')[0].split('?')[0];
      var id = href.replace(/^\.\//, '').replace('.html', '');
      if (!CATALOG[id] || card.querySelector('[data-wk-add]')) return;
      var foot = card.querySelector('.foot');
      if (!foot) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wk-card-add';
      btn.setAttribute('data-wk-add', id);
      btn.setAttribute('aria-label', t('In den Werkkorb', 'Add to basket'));
      btn.setAttribute('title', t('In den Werkkorb', 'Add to basket'));
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>';
      var go = foot.querySelector('.go');
      foot.classList.add('has-wk-add');
      if (go) foot.insertBefore(btn, go);
      else foot.appendChild(btn);
    });
  }

  function decorateProduct() {
    if (!CATALOG[productId]) return;
    var buy = document.querySelector('.pd-buy');
    if (!buy || buy.querySelector('[data-wk-add]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost btn-lg wk-product-add';
    btn.setAttribute('data-wk-add', productId);
    btn.innerHTML = ICON_BASKET + '<span>' + t('In den Werkkorb', 'Add to basket') + '</span>';
    buy.appendChild(btn);
  }

  decorateCards();
  decorateProduct();

  if (typeof MutationObserver === 'function') {
    var pending = 0;
    var mo = new MutationObserver(function () {
      window.clearTimeout(pending);
      pending = window.setTimeout(function () {
        decorateCards();
        render();
      }, 120);
    });
    var grids = document.querySelectorAll('.shop-grid');
    Array.prototype.forEach.call(grids, function (grid) {
      mo.observe(grid, { childList: true, subtree: true });
    });
  }

  document.addEventListener('bw:lang', applyLabels);

  applyLabels();
})();
