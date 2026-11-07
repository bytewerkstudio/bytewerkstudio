import { spawn } from 'node:child_process';

// Drives a page through real interactions over CDP.
// usage: node tools/e2e-page.mjs <url> <scenarioFile>
//
// Scenario file exports a list of steps, each an object:
//   { eval: "js" }              evaluate in the page
//   { shot: "/tmp/x.png" }      screenshot
//   { wait: 800 }               wait ms
//   { focus: "#sel" }           focus an element
//   { click: "#sel" }           real mouse click in the element's centre
//   { key: "Enter" }            real key press (down + up)
//   { type: "abc" }             real text input, one key at a time
// The script prints a JSON report with console errors and CSP violations.
//
// E2E_WIDTH / E2E_HEIGHT / E2E_DPR / E2E_MOBILE set the viewport.

const [, , url, scenarioFile] = process.argv;
const CHROME = process.env.HOME + '/.local/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PORT = 12600 + Math.floor(Math.random() * 200);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const W = Number(process.env.E2E_WIDTH || 1440);
const H = Number(process.env.E2E_HEIGHT || 900);
const DPR = Number(process.env.E2E_DPR || 1);
const MOBILE = process.env.E2E_MOBILE === '1';

const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/e2e-' + PORT,
  '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });

try {
  let wsUrl = null;
  for (let i = 0; i < 150; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const t = j.find(x => x.type === 'page');
      if (t) { wsUrl = t.webSocketDebuggerUrl; break; }
    } catch { /* retry */ }
    await sleep(100);
  }
  if (!wsUrl) throw new Error('chrome did not start');

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  const violations = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
      return;
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push((d.exception?.description || d.text || '').slice(0, 200));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      errors.push((m.params.entry.text + ' ' + (m.params.entry.url || '')).slice(0, 200));
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      errors.push((m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    }
  };
  const send = (method, params = {}, ms = 30000) => new Promise((resolve, reject) => {
    const mid = ++id;
    const timer = setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); reject(new Error('timeout ' + method)); } }, ms);
    pending.set(mid, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__v=[];document.addEventListener('securitypolicyviolation',e=>window.__v.push(e.effectiveDirective+':'+(e.blockedURI||'')));
      window.__checks=(function(){try{return JSON.parse(sessionStorage.getItem('bw.e2e.checks')||'[]');}catch(e){return [];}})();
      window.__check=function(name,actual,expected){var ok=JSON.stringify(actual)===JSON.stringify(expected);window.__checks.push({name:name,ok:ok,actual:actual,expected:expected});try{sessionStorage.setItem('bw.e2e.checks',JSON.stringify(window.__checks));}catch(e){}return ok;};`,
  });
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: MOBILE });
  await send('Page.navigate', { url });
  await sleep(1500);

  const steps = (await import(new URL(scenarioFile, 'file://' + process.cwd() + '/').href)).default;
  const results = [];

  async function boxOf(selector) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
      })()`,
      returnByValue: true,
    });
    await sleep(250);
    const r = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height, top: b.top,
                 inView: b.top >= 0 && b.bottom <= innerHeight };
      })()`,
      returnByValue: true,
    });
    return r.result?.value || null;
  }

  const KEYS = {
    Enter: { code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
    ' ': { code: 'Space', windowsVirtualKeyCode: 32, text: ' ' },
    Escape: { code: 'Escape', windowsVirtualKeyCode: 27 },
    Tab: { code: 'Tab', windowsVirtualKeyCode: 9 },
    ArrowUp: { code: 'ArrowUp', windowsVirtualKeyCode: 38 },
    ArrowDown: { code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    ArrowLeft: { code: 'ArrowLeft', windowsVirtualKeyCode: 37 },
    ArrowRight: { code: 'ArrowRight', windowsVirtualKeyCode: 39 },
  };

  for (const step of steps) {
    if (step.wait) await sleep(step.wait);

    if (step.eval) {
      const r = await send('Runtime.evaluate', { expression: step.eval, awaitPromise: true, returnByValue: true });
      results.push({ eval: step.eval.slice(0, 60), value: r.result?.value ?? null, error: r.exceptionDetails ? (r.exceptionDetails.exception?.description || r.exceptionDetails.text) : null });
    }

    if (step.focus) {
      const r = await send('Runtime.evaluate', {
        expression: `(() => { const el = document.querySelector(${JSON.stringify(step.focus)}); if (!el) return 'missing'; el.focus(); return document.activeElement === el; })()`,
        returnByValue: true,
      });
      results.push({ focus: step.focus, value: r.result?.value ?? null });
      await sleep(120);
    }

    if (step.click) {
      const b = await boxOf(step.click);
      if (!b) { results.push({ click: step.click, error: 'not found' }); continue; }
      const x = Math.round(b.x), y = Math.round(b.y);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none', clickCount: 0 });
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
      await sleep(40);
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
      results.push({ click: step.click, at: { x, y } });
      await sleep(160);
    }

    if (step.key) {
      const k = KEYS[step.key] || { code: 'Key' + step.key.toUpperCase(), windowsVirtualKeyCode: step.key.toUpperCase().charCodeAt(0), text: step.key };
      const base = { key: step.key, code: k.code, windowsVirtualKeyCode: k.windowsVirtualKeyCode, nativeVirtualKeyCode: k.windowsVirtualKeyCode };
      await send('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', ...base, ...(k.text ? { text: k.text, unmodifiedText: k.text } : {}) });
      await sleep(30);
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
      results.push({ key: step.key });
      await sleep(140);
    }

    if (step.type) {
      for (const ch of step.type) {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch, text: ch, unmodifiedText: ch });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch });
      }
      results.push({ type: step.type });
      await sleep(120);
    }

    if (step.reload) {
      await send('Page.reload', { ignoreCache: true });
      results.push({ reload: true });
      await sleep(300);
    }

    if (step.shot) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      (await import('node:fs')).writeFileSync(step.shot, Buffer.from(data, 'base64'));
      results.push({ shot: step.shot });
    }
  }

  const v = await send('Runtime.evaluate', { expression: 'window.__v || []', returnByValue: true });
  console.log(JSON.stringify({ url, results, violations: v.result?.value || [], errors }, null, 2));
  ws.close();
} finally {
  chrome.kill('SIGKILL');
}
