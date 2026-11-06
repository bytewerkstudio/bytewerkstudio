/* ============================================================
   BYTEWERK STUDIO — nf-find.js
   ------------------------------------------------------------
   Inline finder for 404.html. No dependency, no network.
   Typing filters the site index below; Enter opens the first
   hit, ArrowUp/ArrowDown move, Escape closes.

   Paths are root-absolute on purpose: GitHub Pages serves this
   document under the URL that was requested, so relative paths
   would resolve against a path that does not exist.
   ============================================================ */

(function () {
  'use strict';

  var INDEX = [
    { u: '/', k: 'page', de: 'Startseite', en: 'Home', s: { de: 'Leistungen, Arbeiten, Preise', en: 'Services, work, pricing' } },
    { u: '/#leistungen', k: 'page', de: 'Leistungen', en: 'Services', s: { de: 'Software, Web, Apps, IT', en: 'Software, web, apps, IT' } },
    { u: '/#arbeiten', k: 'page', de: 'Arbeiten', en: 'Work', s: { de: 'Ausgewaehlte Projekte', en: 'Selected projects' } },
    { u: '/#konfigurator', k: 'page', de: 'Projekt-Konfigurator', en: 'Project configurator', s: { de: 'Umfang in drei Schritten', en: 'Scope in three steps' } },
    { u: '/#preise', k: 'page', de: 'Preise & Pakete', en: 'Pricing & packages', s: { de: 'Starter, Studio, Betreuung', en: 'Starter, studio, care' } },
    { u: '/#faq', k: 'page', de: 'Haeufige Fragen', en: 'FAQ', s: { de: 'Antworten zum Ablauf', en: 'Answers about the process' } },
    { u: '/arbeiten.html', k: 'page', de: 'Arbeiten', en: 'Work', s: { de: 'Werkverzeichnis mit Filter', en: 'Portfolio with filter' } },
    { u: '/shop.html', k: 'page', de: 'Shop', en: 'Shop', s: { de: 'Alle Apps und Spiele', en: 'All apps and games' } },
    { u: '/vergleich.html', k: 'page', de: 'Produktvergleich', en: 'Product comparison', s: { de: 'Welche App passt zu dir?', en: 'Which app fits you?' } },
    { u: '/studio.html', k: 'page', de: 'Studio', en: 'Studio', s: { de: 'Ueber Bytewerk Studio', en: 'About Bytewerk Studio' } },
    { u: '/kontakt.html', k: 'page', de: 'Kontakt', en: 'Contact', s: { de: 'Projektanfrage senden', en: 'Send a project request' } },
    { u: '/softwareentwicklung-ludwigshafen.html', k: 'page', de: 'Softwareentwicklung Ludwigshafen', en: 'Software development Ludwigshafen', s: { de: 'Lokale Leistungsseite', en: 'Local services page' } },
    { u: '/konto.html', k: 'page', de: 'Mein Konto', en: 'My account', s: { de: 'Bibliothek, Bestellungen, Profil', en: 'Library, orders, profile' } },
    { u: '/login.html', k: 'page', de: 'Anmelden', en: 'Sign in', s: { de: 'Zum Konto', en: 'To your account' } },
    { u: '/register.html', k: 'page', de: 'Registrieren', en: 'Create account', s: { de: 'Konto anlegen', en: 'New account' } },
    { u: '/impressum.html', k: 'page', de: 'Impressum', en: 'Imprint', s: { de: 'Anbieterkennzeichnung', en: 'Legal notice' } },
    { u: '/datenschutz.html', k: 'page', de: 'Datenschutz', en: 'Privacy', s: { de: 'Daten und Rechte', en: 'Data and rights' } },
    { u: '/agb.html', k: 'page', de: 'AGB', en: 'Terms', s: { de: 'Bedingungen', en: 'Terms of service' } },

    { u: '/produkt.html', k: 'product', de: 'Lernreich', en: 'Lernreich', s: { de: 'Kostenlos - Windows - Lernen', en: 'Free - Windows - Learning' }, p: '0' },
    { u: '/pruefungs-countdown.html', k: 'product', de: 'Pruefungs-Countdown', en: 'Exam Countdown', s: { de: 'Kostenlos - Windows - Pruefung', en: 'Free - Windows - Exams' }, p: '0' },
    { u: '/lernreich-pro.html', k: 'product', de: 'Lernreich Pro', en: 'Lernreich Pro', s: { de: 'Windows - Fokus - Pro', en: 'Windows - Focus - Pro' }, p: '9,99' },
    { u: '/keyforge-vault.html', k: 'product', de: 'KeyForge Vault', en: 'KeyForge Vault', s: { de: 'Windows - Sicherheit - Passwoerter', en: 'Windows - Security - Passwords' }, p: '12,99' },
    { u: '/lumaweek-planner.html', k: 'product', de: 'LumaWeek Planner', en: 'LumaWeek Planner', s: { de: 'Windows - Planung - Kalender', en: 'Windows - Planning - Calendar' }, p: '5,99' },
    { u: '/updatepilot.html', k: 'product', de: 'UpdatePilot', en: 'UpdatePilot', s: { de: 'Windows - Updates - winget', en: 'Windows - Updates - winget' }, p: '12,99' },
    { u: '/bytewerk-pdf-text-pro.html', k: 'product', de: 'Bytewerk PDF Text Pro', en: 'Bytewerk PDF Text Pro', s: { de: 'Windows - PDF - OCR', en: 'Windows - PDF - OCR' }, p: '59,00' },
    { u: '/mastil.html', k: 'product', de: 'MASTIL', en: 'MASTIL', s: { de: 'Strategie - Tower Defense', en: 'Strategy - Tower defense' }, p: 'Demo' },
    { u: '/neon-dominion.html', k: 'product', de: 'Neon Dominion', en: 'Neon Dominion', s: { de: 'Windows - Strategie - Neon', en: 'Windows - Strategy - Neon' }, p: '20,00' },
    { u: '/burgenwerk.html', k: 'product', de: 'BURGENWERK', en: 'BURGENWERK', s: { de: 'Browser - Strategie - kostenlos', en: 'Browser - Strategy - free' }, p: '0' },
    { u: '/neon-horde/', k: 'product', de: 'NEON HORDE', en: 'NEON HORDE', s: { de: 'Browser - Shooter - kostenlos', en: 'Browser - Shooter - free' }, p: '0' }
  ];

  var form = document.querySelector('[data-nf-search]');
  var input = document.getElementById('nf-q');
  var list = document.getElementById('nf-results');
  if (!form || !input || !list) return;

  var hits = [];
  var active = -1;

  function lang() {
    return (document.documentElement.lang || 'de').slice(0, 2) === 'en' ? 'en' : 'de';
  }

  function norm(v) {
    return (v || '')
      .toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function price(item) {
    if (item.k !== 'product') return '';
    if (item.p === '0') return lang() === 'en' ? 'free' : 'frei';
    if (item.p === 'Demo') return lang() === 'en' ? 'demo' : 'Demo';
    return item.p + ' \u20ac';
  }

  function search(q) {
    var n = norm(q);
    if (n.length < 2) return [];
    var out = [];
    for (var i = 0; i < INDEX.length; i++) {
      var it = INDEX[i];
      var title = lang() === 'en' ? it.en : it.de;
      var sub = (lang() === 'en' ? it.s.en : it.s.de) || '';
      var hay = norm(title + ' ' + it.de + ' ' + it.en + ' ' + sub);
      var t = norm(title);
      var score = 0;
      if (t === n) score = 100;
      else if (t.indexOf(n) === 0) score = 80;
      else if (t.indexOf(n) > -1) score = 60;
      else if (norm(sub).indexOf(n) > -1) score = 40;
      else if (hay.indexOf(n) > -1) score = 25;
      if (score) out.push({ item: it, title: title, sub: sub, score: score });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 6);
  }

  function close() {
    list.hidden = true;
    list.innerHTML = '';
    active = -1;
    hits = [];
    input.setAttribute('aria-expanded', 'false');
  }

  function paint() {
    list.innerHTML = '';
    hits.forEach(function (h, i) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'nf-hit';
      a.href = h.item.u;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', 'false');
      a.dataset.kind = h.item.k;
      a.dataset.i = String(i);

      var k = document.createElement('span');
      k.className = 'k';
      k.textContent = h.item.k === 'product' ? (lang() === 'en' ? 'app' : 'app') : (lang() === 'en' ? 'page' : 'seite');

      var t = document.createElement('span');
      t.className = 't';
      var b = document.createElement('b');
      b.textContent = h.title;
      var sp = document.createElement('span');
      sp.textContent = h.sub;
      t.appendChild(b);
      t.appendChild(sp);

      var p = document.createElement('span');
      p.className = 'p';
      p.textContent = price(h.item);

      a.appendChild(k);
      a.appendChild(t);
      a.appendChild(p);
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = hits.length === 0;
    input.setAttribute('aria-expanded', hits.length ? 'true' : 'false');
    active = -1;
  }

  function highlight(i) {
    var nodes = list.querySelectorAll('.nf-hit');
    for (var n = 0; n < nodes.length; n++) nodes[n].setAttribute('aria-selected', n === i ? 'true' : 'false');
    if (i > -1 && nodes[i]) {
      active = i;
      nodes[i].scrollIntoView({ block: 'nearest' });
    } else {
      active = -1;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) { input.focus(); return; }
    if (!hits.length) hits = search(q);
    if (active > -1 && hits[active]) { window.location.href = hits[active].item.u; return; }
    if (hits[0]) { window.location.href = hits[0].item.u; return; }
    window.location.href = '/kontakt.html?q=' + encodeURIComponent(q);
  });

  input.addEventListener('input', function () {
    hits = search(input.value);
    if (!input.value.trim()) { close(); return; }
    if (!hits.length) {
      list.innerHTML = '<li class="nf-empty">' +
        (lang() === 'en' ? 'Nothing found. ' : 'Nichts gefunden. ') +
        '<a href="/kontakt.html">' + (lang() === 'en' ? 'Ask directly' : 'Direkt fragen') + '</a></li>';
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    paint();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); input.blur(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!hits.length) return;
      highlight((active + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!hits.length) return;
      highlight(active <= 0 ? hits.length - 1 : active - 1);
    }
  });

  list.addEventListener('click', function () { close(); });

  document.addEventListener('click', function (e) {
    if (!list.hidden && !form.contains(e.target)) close();
  });

  document.addEventListener('bw:lang', function () {
    if (input.value.trim()) { hits = search(input.value); if (hits.length) paint(); }
  });

  // Slash and Ctrl/Cmd+K stay with the global palette in ui-v4.js.
  // This field is the visible path; the palette is the overlay one.
})();
