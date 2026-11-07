/* ============================================================
   BYTEWERK STUDIO — components.js
   Shared header + footer (single source of truth) and the
   DE/EN i18n engine. Loaded BEFORE main.js on every page.
   ============================================================ */

(function () {
  const LOGO = `
    <svg viewBox="0 0 28 28" class="bw-logo" aria-hidden="true">
      <rect x="1.5" y="1.5" width="11.5" height="11.5" rx="3" class="sq"/>
      <rect x="15" y="1.5" width="11.5" height="11.5" rx="3" class="sq"/>
      <rect x="1.5" y="15" width="11.5" height="11.5" rx="3" class="sq"/>
      <circle cx="20.75" cy="20.75" r="5.95" class="dot"/>
    </svg>`;

  const NAV_LINKS = [
    { href: 'index.html#leistungen', de: 'Leistungen', en: 'Services', match: null },
    { href: 'arbeiten.html',           de: 'Arbeiten',   en: 'Work',     match: 'arbeiten' },
    { href: 'bauplan.html',            de: 'Bauplan',    en: 'Blueprint', match: 'bauplan' },
    { href: 'showroom.html',           de: 'Showroom',   en: 'Showroom', match: 'showroom' },
    { href: 'forum.html',              de: 'Forum',      en: 'Forum',    match: 'forum' },
    { href: 'index.html#preise',     de: 'Preise',     en: 'Pricing',  match: null },
    { href: 'shop.html',             de: 'Shop',       en: 'Shop',     match: 'shop' },
    { href: 'studio.html',           de: 'Studio',     en: 'Studio',   match: 'studio' },
    { href: 'kontakt.html',          de: 'Kontakt',    en: 'Contact',  match: 'kontakt' },
  ];

  const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');

  const langToggle = `
    <div class="lang-toggle" role="group" aria-label="Sprache / Language">
      <button data-lang-btn="de" aria-label="Deutsch">DE</button>
      <span class="lang-sep">/</span>
      <button data-lang-btn="en" aria-label="English">EN</button>
    </div>`;

  const linksHTML = (mobile) => NAV_LINKS.map(l => {
    const active = l.match && page === l.match ? ' class="active"' : '';
    return `<a href="${l.href}"${active} data-en="${l.en}">${l.de}</a>`;
  }).join('');

  const HEADER = `
    <header class="nav">
      <div class="wrap nav-inner">
        <a class="brand" href="index.html" aria-label="Bytewerk Studio — Startseite" data-en-aria="Bytewerk Studio — Home">
          ${LOGO}
          <span class="brand-name">Bytewerk<i> Studio</i></span>
        </a>
        <nav class="nav-links" aria-label="Hauptnavigation">
          ${linksHTML(false)}
        </nav>
        <div class="nav-right">
          <button class="nav-search" type="button" data-search-open aria-label="Suche öffnen (Strg+K)" data-en-aria="Open search (Ctrl+K)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
            <kbd>Ctrl K</kbd>
          </button>
          ${langToggle}
          <div class="acct-slot" data-account-slot></div>
          <a class="btn btn-primary" href="kontakt.html" data-en="Start a project <span class=&quot;arr&quot;>→</span>">Projekt starten <span class="arr">→</span></a>
          <button class="nav-toggle" aria-label="Menü öffnen" aria-expanded="false" data-en-aria="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
          </button>
        </div>
      </div>
    </header>
    <div class="mobile-menu">
      ${linksHTML(true)}
      <button class="nav-search" type="button" data-search-open aria-label="Suche öffnen" data-en-aria="Open search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
        <kbd>Ctrl K</kbd>
      </button>
      <div class="acct-slot" data-account-slot></div>
      <a class="btn btn-primary" href="kontakt.html" data-en="Start a project <span class=&quot;arr&quot;>→</span>">Projekt starten →</a>
      ${langToggle}
    </div>`;

  const FOOTER = `
    <footer class="footer">
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-col">
            <a class="brand" href="index.html" aria-label="Bytewerk Studio">
              ${LOGO}
              <span class="brand-name">Bytewerk<i> Studio</i></span>
            </a>
            <p class="footer-blurb" data-en="Software, web and app development, IT services and digital products from Ludwigshafen am Rhein.">Software, Web- &amp; App-Entwicklung, IT-Dienstleistungen und digitale Produkte aus Ludwigshafen am Rhein.</p>
          </div>
          <div class="footer-col">
            <h4 data-en="Services">Leistungen</h4>
            <a href="softwareentwicklung-ludwigshafen.html" data-en="Software development">Softwareentwicklung</a>
            <a href="softwareentwicklung-ludwigshafen.html#webentwicklung" data-en="Web development">Web-Entwicklung</a>
            <a href="softwareentwicklung-ludwigshafen.html#app-entwicklung" data-en="App development">App-Entwicklung</a>
            <a href="softwareentwicklung-ludwigshafen.html" data-en="IT services">IT-Dienstleistungen</a>
          </div>
          <div class="footer-col">
            <h4 data-en="Studio">Studio</h4>
            <a href="studio.html" data-en="About us">Über uns</a>
            <a href="arbeiten.html" data-en="Work">Arbeiten</a>
            <a href="bauplan.html" data-en="Blueprint">Bauplan</a>
            <a href="showroom.html" data-en="3D showroom">3D-Showroom</a>
            <a href="index.html#preise" data-en="Pricing">Preise</a>
            <a href="shop.html" data-en="Shop">Shop</a>
            <a href="vergleich.html" data-en="Product comparison">Produktvergleich</a>
            <a href="marke.html" data-en="The mark">Die Marke</a>
            <a href="konto.html" data-en="My account">Mein Konto</a>
            <a href="login.html" data-en="Sign in">Anmelden</a>
            <a href="kontakt.html" data-en="Contact">Kontakt</a>
          </div>
          <div class="footer-col">
            <h4 data-en="Legal">Rechtliches</h4>
            <a href="impressum.html" data-en="Imprint">Impressum</a>
            <a href="datenschutz.html" data-en="Privacy">Datenschutz</a>
            <a href="agb.html" data-en="Terms">AGB</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="small">© <span data-year>2026</span> Bytewerk Studio · bytewerkstudio.com</span>
          <div class="footer-social">
            <a href="mailto:Haqmalh@icloud.com" aria-label="E-Mail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>`;

  /* ---- Inject ---- */
  const hSlot = document.querySelector('[data-include="header"]');
  if (hSlot) hSlot.outerHTML = HEADER;
  const fSlot = document.querySelector('[data-include="footer"]');
  if (fSlot) fSlot.outerHTML = FOOTER;

  /* ---- i18n ---- */
  const LANG_KEY = 'bw-lang';
  function currentLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored) return stored;
    return (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'de';
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage blocked: keep the choice for this page only */ }

    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.dataset.de === undefined) el.dataset.de = el.innerHTML;
      el.innerHTML = (lang === 'en') ? el.dataset.en : el.dataset.de;
    });
    document.querySelectorAll('[data-en-ph]').forEach(el => {
      if (el.dataset.dePh === undefined) el.dataset.dePh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', (lang === 'en') ? el.dataset.enPh : el.dataset.dePh);
    });
    document.querySelectorAll('[data-en-aria]').forEach(el => {
      if (el.dataset.deAria === undefined) el.dataset.deAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', (lang === 'en') ? el.dataset.enAria : el.dataset.deAria);
    });
    document.querySelectorAll('[data-lang-btn]').forEach(b => {
      b.classList.toggle('active', b.dataset.langBtn === lang);
    });
    document.dispatchEvent(new CustomEvent('bw:lang', { detail: { lang } }));
  }

  document.querySelectorAll('[data-lang-btn]').forEach(b => {
    b.addEventListener('click', () => applyLang(b.dataset.langBtn));
  });

  applyLang(currentLang());

  // expose for other scripts / pages added later
  window.bwApplyLang = applyLang;

  /* ---- Werkkorb: only where something can be bought ---- */
  (function () {
    const BUY_PAGES = [
      'index.html', 'shop.html',
      'lernreich-pro.html', 'keyforge-vault.html', 'updatepilot.html',
      'bytewerk-pdf-text-pro.html', 'neon-dominion.html'
    ];
    const file = (location.pathname.split('/').pop() || 'index.html');
    if (BUY_PAGES.indexOf(file) === -1) return;

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'styles-werkkorb.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'werkkorb.js';
    js.defer = true;
    document.body.appendChild(js);
  })();
})();
