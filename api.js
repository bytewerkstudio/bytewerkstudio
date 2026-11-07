/* ============================================================
   BYTEWERK STUDIO — api.js
   ------------------------------------------------------------
   Only for api.html. Four small pieces:
   1  Code tabs + copy button
   2  Sandbox console (answers are simulated locally)
   3  Endpoint reference: text search + method filter
   4  Billing switch (monthly / yearly)

   No dependencies, no network access, no storage of keys.
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const lang = () => (document.documentElement.lang || 'de').toLowerCase().startsWith('en') ? 'en' : 'de';
  const T = (de, en) => (lang() === 'en' ? en : de);

  /* ------------------------------------------------------------
     1. Code tabs
     ------------------------------------------------------------ */
  const tabs = $$('.dev-tabs [role="tab"]');

  function selectTab(tab) {
    if (!tab) return;
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const pane = document.getElementById(t.getAttribute('aria-controls'));
      if (pane) {
        pane.classList.toggle('is-active', on);
        pane.hidden = !on;
      }
    });

    const copy = $('.dev-copy[data-copy-target]');
    if (copy && tab.getAttribute('aria-controls')) {
      copy.dataset.copyTarget = tab.getAttribute('aria-controls');
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      const at = tabs.indexOf(tab);
      let next = null;
      if (event.key === 'ArrowRight') next = tabs[(at + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') next = tabs[(at - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') next = tabs[0];
      else if (event.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      selectTab(next);
      next.focus();
    });
  });

  /* ------------------------------------------------------------
     2. Copy buttons
     ------------------------------------------------------------ */
  $$('.dev-copy').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.copyTarget;
      const pane = id ? document.getElementById(id) : null;
      if (!pane) return;
      const text = pane.textContent.replace(/\u00a0/g, ' ').trimEnd();

      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (err) {
        // Clipboard API is unavailable on plain http or without permission:
        // fall back to a hidden textarea, which still works there.
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        ta.remove();
      }

      const label = button.querySelector('span');
      if (!label) return;
      if (!button.dataset.label) button.dataset.label = label.textContent;
      label.textContent = ok ? T('Kopiert', 'Copied') : T('Nicht kopiert', 'Copy failed');
      button.classList.toggle('is-done', ok);
      window.clearTimeout(button._t);
      button._t = window.setTimeout(() => {
        label.textContent = button.dataset.label;
        button.classList.remove('is-done');
      }, 1800);
    });
  });

  /* ------------------------------------------------------------
     3. Sandbox console
     Answers are built from fixed test data in this file. Nothing is
     sent anywhere, and the key field is only checked for its prefix.
     ------------------------------------------------------------ */
  const form = $('[data-sandbox]');
  if (form) {
    const methodEl = $('#sb-method');
    const pathEl = $('#sb-path');
    const keyEl = $('#sb-key');
    const bodyEl = $('#sb-body');
    const bodyField = $('[data-body-field]');
    const statusEl = $('[data-status]');
    const timeEl = $('[data-time]');
    const jsonEl = $('[data-json]');

    const PRODUCTS = [
      { id: 'lernreich', name: 'Lernreich', version: '4.2.1', license: 'per-seat', platforms: ['windows'] },
      { id: 'keyforge-vault', name: 'Keyforge Vault', version: '2.8.0', license: 'per-seat', platforms: ['windows', 'macos', 'linux'] },
      { id: 'bytewerk-pdf-text-pro', name: 'PDF Text Pro', version: '1.9.3', license: 'per-seat', platforms: ['windows', 'macos'] },
      { id: 'lumaweek-planner', name: 'Lumaweek Planner', version: '3.0.4', license: 'per-user', platforms: ['web', 'ios', 'android'] },
      { id: 'updatepilot', name: 'UpdatePilot', version: '1.4.2', license: 'per-device', platforms: ['windows', 'linux'] }
    ];

    const LICENSES = [
      { id: 'lic_9f21c4', product: 'keyforge-vault', email: 'team@nordlicht.de', seats: 5, status: 'active', issued: '2026-09-14', activations: 3 },
      { id: 'lic_2b77aa', product: 'lernreich', email: 'm.becker@example.com', seats: 1, status: 'active', issued: '2026-10-02', activations: 1 },
      { id: 'lic_5d03fe', product: 'bytewerk-pdf-text-pro', email: 'kanzlei@rheinpart.de', seats: 12, status: 'active', issued: '2026-08-21', activations: 11 },
      { id: 'lic_7c41b0', product: 'lumaweek-planner', email: 'a.kaya@example.com', seats: 1, status: 'revoked', issued: '2026-07-08', activations: 1 }
    ];

    function meta(extra) {
      return Object.assign({
        request_id: 'req_' + Math.random().toString(16).slice(2, 10),
        sandbox: true,
        generated_at: new Date().toISOString()
      }, extra || {});
    }

    function ok(status, data, extraMeta) {
      return { status, body: { data, meta: meta(extraMeta) } };
    }

    function fail(status, code, message, hint) {
      return {
        status,
        body: {
          error: { code, message, hint },
          meta: meta()
        }
      };
    }

    function keyProblem() {
      const value = (keyEl.value || '').trim();
      if (!value) return fail(401, 'missing_key', T('Kein Schlüssel übergeben.', 'No key supplied.'),
        T('Setze den Header Authorization: Bearer bwk_test_…', 'Send the header Authorization: Bearer bwk_test_…'));
      if (!/^bwk_(test|live)_/.test(value)) {
        return fail(401, 'invalid_key', T('Die Vorsilbe passt nicht zu einem Bytewerk-Schlüssel.', 'The prefix does not match a Bytewerk key.'),
          T('Schlüssel beginnen mit bwk_test_ oder bwk_live_.', 'Keys start with bwk_test_ or bwk_live_.'));
      }
      if (value.startsWith('bwk_live_') && methodEl.value !== 'GET') {
        return fail(403, 'live_scope_blocked', T('Die Sandbox führt keine schreibenden Aufrufe mit Live-Schlüsseln aus.', 'The sandbox runs no write calls with live keys.'),
          T('Nutze einen bwk_test_-Schlüssel für POST und DELETE.', 'Use a bwk_test_ key for POST and DELETE.'));
      }
      return null;
    }

    function parseBody() {
      if (!bodyEl || bodyField.hidden) return { ok: true, value: null };
      try {
        return { ok: true, value: JSON.parse(bodyEl.value || '{}') };
      } catch (err) {
        return { ok: false, error: fail(400, 'invalid_json', T('Der Anfragekörper ist kein gültiges JSON.', 'The request body is not valid JSON.'),
          T('Prüfe Kommas und Anführungszeichen.', 'Check commas and quotes.')) };
      }
    }

    function respond() {
      const bad = keyProblem();
      if (bad) return bad;

      const path = pathEl.value;
      const method = methodEl.value;
      const parsed = parseBody();
      if (!parsed.ok) return parsed.error;
      const body = parsed.value || {};

      if (method === 'GET' && path === '/products') {
        return ok(200, { products: PRODUCTS }, { total: PRODUCTS.length, next_cursor: null });
      }

      if (method === 'GET' && path === '/licenses') {
        return ok(200, { licenses: LICENSES }, { total: LICENSES.length, next_cursor: null });
      }

      if (method === 'POST' && (path === '/licenses' || path === '/licenses/new')) {
        if (!body.product) {
          return fail(422, 'field_required', T('Feld "product" fehlt.', 'Field "product" is missing.'),
            T('Erlaubt: ' + PRODUCTS.map((p) => p.id).join(', '), 'Allowed: ' + PRODUCTS.map((p) => p.id).join(', ')));
        }
        if (!PRODUCTS.some((p) => p.id === body.product)) {
          return fail(404, 'unknown_product', T('Dieses Produkt gibt es nicht.', 'That product does not exist.'),
            T('Produktliste über GET /v1/products abrufen.', 'Fetch GET /v1/products for the list.'));
        }
        if (!body.email || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(String(body.email))) {
          return fail(422, 'invalid_email', T('Feld "email" fehlt oder ist keine E-Mail-Adresse.', 'Field "email" is missing or not an email address.'),
            T('Beispiel: dev@example.com', 'Example: dev@example.com'));
        }
        const seats = body.seats === undefined ? 1 : Number(body.seats);
        if (!Number.isInteger(seats) || seats < 1 || seats > 500) {
          return fail(422, 'invalid_seats', T('"seats" muss eine ganze Zahl zwischen 1 und 500 sein.', '"seats" must be an integer between 1 and 500.'),
            T('Standard ist 1.', 'The default is 1.'));
        }
        const licence = {
          id: 'lic_' + Math.random().toString(16).slice(2, 8),
          product: body.product,
          email: String(body.email),
          seats,
          status: 'active',
          issued: new Date().toISOString().slice(0, 10),
          activations: 0,
          key: 'BWK-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' +
               Math.random().toString(36).slice(2, 6).toUpperCase() + '-' +
               Math.random().toString(36).slice(2, 6).toUpperCase()
        };
        return ok(201, { license: licence });
      }

      if (method === 'POST' && path === '/licenses/revoke') {
        if (!body.id) {
          return fail(422, 'field_required', T('Feld "id" fehlt.', 'Field "id" is missing.'),
            T('Beispiel: lic_9f21c4', 'Example: lic_9f21c4'));
        }
        const hit = LICENSES.find((l) => l.id === body.id);
        if (!hit) {
          return fail(404, 'unknown_license', T('Keine Lizenz mit dieser ID.', 'No licence with that id.'),
            T('Lizenzen über GET /v1/licenses auflisten.', 'List licences with GET /v1/licenses.'));
        }
        return {
          status: 204,
          body: null,
          note: T('Widerrufen. Ereignis licence.revoked ausgelöst.', 'Revoked. Event licence.revoked emitted.')
        };
      }

      if (method === 'DELETE' && path === '/licenses/revoke') {
        return fail(405, 'method_not_allowed', T('Widerruf läuft über POST.', 'Revocation uses POST.'),
          T('POST /v1/licenses/{id}/revoke', 'POST /v1/licenses/{id}/revoke'));
      }

      if (method === 'GET' && path === '/downloads') {
        return ok(200, {
          product: 'keyforge-vault',
          version: '2.8.0',
          url: 'https://cdn.bytewerkstudio.com/builds/keyforge-vault-2.8.0.exe',
          sha256: '4b1f0c8d2a6e5f7309c1a8be4d27f6c05a9e3b18724cd5e6f0a1b2c3d4e5f607',
          expires_in: 900
        });
      }

      if (method === 'GET' && path === '/usage') {
        return ok(200, {
          plan: 'sandbox',
          period: '2026-11',
          requests: 214,
          quota: 1000,
          remaining: 786,
          reset_at: '2026-12-01T00:00:00Z'
        }, { window: 'month' });
      }

      if (method === 'POST' && path === '/webhooks') {
        if (!body.url || !/^https:\/\//i.test(String(body.url))) {
          return fail(422, 'invalid_url', T('"url" muss mit https:// beginnen.', '"url" must start with https://'),
            T('HTTP wird abgelehnt, damit Signaturen nicht im Klartext laufen.', 'HTTP is rejected so signatures never travel in clear text.'));
        }
        return ok(201, {
          webhook: {
            id: 'wh_' + Math.random().toString(16).slice(2, 8),
            url: String(body.url),
            events: Array.isArray(body.events) && body.events.length ? body.events : ['licence.created'],
            secret: 'whsec_' + Math.random().toString(36).slice(2, 22),
            secret_shown_once: true
          }
        });
      }

      return fail(404, 'unknown_endpoint', T('Diesen Endpunkt gibt es nicht.', 'That endpoint does not exist.'),
        T('Die acht Endpunkte stehen in der Referenz.', 'The eight endpoints are listed in the reference.'));
    }

    function highlight(value) {
      const json = JSON.stringify(value, null, 2);
      return json
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/("(?:\\.|[^"\\])*")(\s*:)?/g, (match, str, colon) => {
          if (colon) return '<span class="k">' + str + '</span>' + colon;
          return '<span class="s">' + str + '</span>';
        })
        .replace(/\b(true|false|null)\b/g, '<span class="b">$1</span>')
        .replace(/(:\s*)(-?\d+(?:\.\d+)?)/g, '$1<span class="n">$2</span>');
    }

    function render(result, ms) {
      statusEl.textContent = result.body === null ? '204 No Content' : result.status + ' ' + statusText(result.status);
      statusEl.className = 'dev-status ' + (result.status < 300 ? 'is-ok' : 'is-warn');
      timeEl.textContent = ms + ' ms · ' + T('simuliert', 'simulated');

      if (result.body === null) {
        jsonEl.innerHTML = '<code>' + (result.note || T('Kein Inhalt.', 'No content.')) + '</code>';
      } else {
        jsonEl.innerHTML = '<code>' + highlight(result.body) + '</code>';
      }
    }

    function statusText(code) {
      return ({
        200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request',
        401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found',
        405: 'Method Not Allowed', 409: 'Conflict', 422: 'Unprocessable Entity',
        429: 'Too Many Requests', 500: 'Internal Server Error'
      })[code] || '';
    }

    function syncMethod() {
      const path = pathEl.value;
      if (path === '/licenses/new') methodEl.value = 'POST';
      else if (path === '/licenses/revoke') methodEl.value = 'POST';
      else if (path === '/products' || path === '/licenses' || path === '/downloads' || path === '/usage') methodEl.value = 'GET';
      else if (path === '/webhooks') methodEl.value = 'POST';

      const needsBody = methodEl.value !== 'GET';
      bodyField.hidden = !needsBody;

      if (needsBody) {
        const samples = {
          '/licenses': '{\n  "product": "keyforge-vault",\n  "email": "dev@example.com",\n  "seats": 1\n}',
          '/licenses/new': '{\n  "product": "keyforge-vault",\n  "email": "dev@example.com",\n  "seats": 1\n}',
          '/licenses/revoke': '{\n  "id": "lic_9f21c4"\n}',
          '/webhooks': '{\n  "url": "https://example.com/hooks/bytewerk",\n  "events": ["licence.created", "licence.revoked"]\n}'
        };
        if (samples[path]) bodyEl.value = samples[path];
      }
    }

    pathEl.addEventListener('change', syncMethod);
    methodEl.addEventListener('change', () => { bodyField.hidden = methodEl.value === 'GET'; });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const started = performance.now();
      const result = respond();
      // A small, fixed delay keeps the answer readable instead of
      // flickering when someone presses Enter twice.
      window.setTimeout(() => {
        render(result, Math.max(12, Math.round(performance.now() - started) + 34));
      }, 140);
    });

    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        statusEl.textContent = '—';
        statusEl.className = 'dev-status';
        timeEl.textContent = '';
        jsonEl.innerHTML = '<code>{\n  "hint": "' + T('Anfrage senden, um die Antwort zu sehen.', 'Send a request to see the answer.') + '"\n}</code>';
        syncMethod();
      }, 0);
    });

    syncMethod();
  }

  /* ------------------------------------------------------------
     4. Reference: search + method filter
     ------------------------------------------------------------ */
  const list = $('[data-ref-list]');
  if (list) {
    const endpoints = $$('.dev-ep', list);
    const empty = $('[data-ref-empty]');
    const search = $('[data-ref-search]');
    const filters = $$('[data-method]', document);
    let method = 'all';

    function apply() {
      const term = (search.value || '').trim().toLowerCase();
      let shown = 0;

      endpoints.forEach((ep) => {
        const text = (ep.dataset.name + ' ' + ep.textContent).toLowerCase();
        const hitText = !term || text.includes(term);
        const hitMethod = method === 'all' || ep.dataset.method === method;
        const show = hitText && hitMethod;
        ep.hidden = !show;
        if (show) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
    }

    filters.forEach((button) => {
      button.addEventListener('click', () => {
        method = button.dataset.method;
        filters.forEach((b) => {
          const on = b === button;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    });

    search.addEventListener('input', apply);
    search.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        search.value = '';
        apply();
      }
    });

    // A filter above the fold should not leave the list empty without
    // a way back: opening one endpoint from a search result is enough.
    endpoints.forEach((ep) => {
      ep.addEventListener('toggle', () => {
        if (!ep.open) return;
        endpoints.forEach((other) => { if (other !== ep) other.open = false; });
      });
    });

    apply();
  }

  /* ------------------------------------------------------------
     5. Billing switch
     ------------------------------------------------------------ */
  const billing = $$('[data-billing]');
  if (billing.length) {
    billing.forEach((button) => {
      button.addEventListener('click', () => {
        const yearly = button.dataset.billing === 'year';
        billing.forEach((b) => {
          const on = b === button;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        $$('[data-monthly]').forEach((el) => {
          el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
        });
      });
    });
  }
})();
