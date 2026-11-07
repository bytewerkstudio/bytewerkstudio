// Papierstadt — end-to-end play-through with real input.
//
//   node tools/e2e-page.mjs http://127.0.0.1:8971/stadt.html tools/e2e-stadt.mjs
//
// Everything a player does is done with real clicks and key presses: pick a
// building from the palette, build on the sheet, upgrade, roof it, survive a
// storm, lose an unroofed building to the next one, demolish, open an
// exhibition and reload to prove the save survives.
//
// Fixtures only set resources and force the storm band so the run stays
// deterministic; every state change below comes from the game itself.

export default [
  { wait: 1400 },

  { eval: `(() => {
      try { sessionStorage.removeItem('bw.e2e.checks'); } catch (e) {}
      window.__checks = [];
      return 'ready';
    })()` },

  /* ---------- start ---------- */
  { eval: `(() => {
      const A = window.bwStadt;
      if (!A) return 'no api';
      const s = A.state();
      window.__check('starts empty', s.grid.filter(Boolean).length, 0);
      window.__check('starts with 40 paper', Math.floor(s.res.paper), 40);
      window.__check('only the mill is known', s.known, ['mill']);
      window.__check('seven building cards', document.querySelectorAll('.ps-card').length, 7);
      window.__check('six of them locked', document.querySelectorAll('.ps-card.is-locked').length, 6);
      return window.__checks.length;
    })()` },

  /* ---------- build with the keyboard ---------- */
  { click: '.ps-card[data-type="mill"]' },
  { focus: '#ps-canvas' },
  { key: 'Enter' },
  { eval: `(() => {
      const s = window.bwStadt.state();
      const card = document.querySelector('.ps-card[data-type="mill"]');
      window.__check('Enter builds on the centre plot', s.grid[24] && s.grid[24].t, 'mill');
      window.__check('a mill costs 10 paper', Math.floor(s.res.paper), 30);
      window.__check('the chosen card is pressed', card.getAttribute('aria-pressed'), 'true');
      return window.__checks.length;
    })()` },

  /* ---------- upgrade with U, roof with D ---------- */
  { eval: `(() => { const s = window.bwStadt.state(); s.res = { paper: 600, clay: 200, sage: 120 }; return s.res; })()` },
  { key: 'u' },
  { key: 'u' },
  { eval: `(() => {
      const b = window.bwStadt.state().grid[24];
      window.__check('U upgrades twice', b && b.l, 3);
      return window.__checks.length;
    })()` },
  { key: 'd' },
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('D puts a roof on it', s.grid[24] && s.grid[24].roof, true);
      window.__check('the roof costs 12 sage', Math.floor(s.res.sage), 108);
      return window.__checks.length;
    })()` },

  /* ---------- storm over row 3: the roof holds ---------- */
  { eval: `(() => {
      const s = window.bwStadt.state();
      s.storm.band = { axis: 'row', i: 3 };
      s.storm.t = 0.05;
      return s.storms;
    })()` },
  { wait: 1400 },
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('the storm has passed', s.storms, 1);
      window.__check('a roofed mill survives', !!s.grid[24], true);
      window.__check('the roofless gap stays empty', s.grid[23], null);
      return window.__checks.length;
    })()` },

  /* ---------- a second mill without a roof is destroyed ---------- */
  { key: 'ArrowLeft' },
  { key: 'Enter' },
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('ArrowLeft + Enter builds at cell 23', s.grid[23] && s.grid[23].t, 'mill');
      return window.__checks.length;
    })()` },
  { eval: `(() => { const s = window.bwStadt.state(); s.storm.band = { axis: 'row', i: 3 }; s.storm.t = 0.05; return s.storms; })()` },
  { wait: 1400 },
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('the second storm passes', s.storms, 2);
      window.__check('an unroofed level-1 mill is destroyed', s.grid[23], null);
      window.__check('the roofed mill still stands', !!s.grid[24], true);
      window.__check('the event log has text', document.querySelector('#ps-log').textContent.length > 20, true);
      return window.__checks.length;
    })()` },

  /* ---------- build four mills and reach 13 levels with real keys ---------- */
  { eval: `(() => { const s = window.bwStadt.state(); s.res = { paper: 900, clay: 300, sage: 200 }; return s.res; })()` },
  { key: 'Enter' },
  { key: 'u' }, { key: 'u' },
  { key: 'ArrowRight' },
  { key: 'u' }, { key: 'u' },
  { key: 'ArrowRight' },
  { key: 'Enter' },
  { key: 'u' }, { key: 'u' },
  { key: 'ArrowRight' },
  { key: 'Enter' },
  { key: 'u' },
  { eval: `(() => {
      const s = window.bwStadt.state();
      const levels = s.grid.reduce((n, b) => n + (b ? b.l : 0), 0);
      window.__check('four mills stand', s.grid.filter(Boolean).length, 4);
      window.__check('twelve levels or more', levels >= 12, true);
      return { levels, cells: s.grid.filter(Boolean).length };
    })()` },

  /* ---------- exhibition ---------- */
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('two storms are on record', s.storms >= 2, true);
      return s.ruhm;
    })()` },
  { click: '[data-action="prestige"]' },
  { wait: 700 },
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('the exhibition grants renown', s.ruhm > 0, true);
      window.__check('the city starts over', s.grid.filter(Boolean).length, 0);
      window.__check('paper is back to 40', Math.floor(s.res.paper), 40);
      window.__check('storms are reset', s.storms, 0);
      return { ruhm: s.ruhm };
    })()` },

  /* ---------- the save survives a reload ---------- */
  { eval: `(() => { const raw = localStorage.getItem('bw.papierstadt.v1');
      const d = raw ? JSON.parse(raw) : null;
      window.__check('the save holds the renown', d && d.ruhm > 0, true);
      window.__check('the save is compact', raw ? raw.length < 1200 : false, true);
      return d ? { bytes: raw.length, ruhm: d.ruhm } : null; })()` },
  { reload: true },
  { wait: 1800 },
  { eval: `(() => {
      const s = window.bwStadt.state();
      window.__check('renown survives a reload', s.ruhm > 0, true);
      window.__check('the grid is still empty after reload', s.grid.filter(Boolean).length, 0);
      window.__check('the palette is rebuilt', document.querySelectorAll('.ps-card').length, 7);
      return { ruhm: s.ruhm, lang: document.documentElement.lang };
    })()` },

  /* ---------- language switch keeps the game usable ---------- */
  { eval: `(() => { const b = document.querySelector('[data-lang-btn="en"]'); if (b) b.click(); return document.documentElement.lang; })()` },
  { wait: 500 },
  { eval: `(() => {
      const name = (document.querySelector('.ps-card-name') || {}).textContent;
      const title = (document.querySelector('.ps-game-head .h2') || {}).textContent;
      window.__check('English switches the game copy', name, 'Paper mill');
      window.__check('English switches the heading', title, 'Your sheet.');
      return { name, title };
    })()` },
  { eval: `(() => { const b = document.querySelector('[data-lang-btn="de"]'); if (b) b.click(); return document.documentElement.lang; })()` },
  { wait: 400 },

  /* ---------- summary ---------- */
  { eval: `(() => {
      const c = document.querySelector('#ps-canvas');
      const failed = window.__checks.filter(x => !x.ok);
      return {
        passed: window.__checks.length - failed.length,
        failed: failed.length,
        failures: failed,
        canvas: { w: c.width, h: c.height, cssW: Math.round(c.getBoundingClientRect().width), cssH: Math.round(c.getBoundingClientRect().height) },
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    })()` },
];
