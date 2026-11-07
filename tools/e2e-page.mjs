import { spawn } from 'node:child_process';

// Drives a page through real interactions over CDP.
// usage: node tools/e2e-page.mjs <url> <scenarioFile>
//
// Scenario file exports a list of steps, each an object:
//   { eval: "js" }              evaluate in the page
//   { shot: "/tmp/x.png" }      screenshot
//   { wait: 800 }               wait ms
// The script prints a JSON report with console errors and CSP violations.

const [, , url, scenarioFile] = process.argv;
const CHROME = process.env.HOME + '/.local/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const PORT = 12600 + Math.floor(Math.random() * 200);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const W = 1440, H = 900;

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
    source: `window.__v=[];document.addEventListener('securitypolicyviolation',e=>window.__v.push(e.effectiveDirective+':'+(e.blockedURI||'')));`,
  });
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(1500);

  const steps = (await import(scenarioFile)).default;
  const results = [];
  for (const step of steps) {
    if (step.wait) await sleep(step.wait);
    if (step.eval) {
      const r = await send('Runtime.evaluate', { expression: step.eval, awaitPromise: true, returnByValue: true });
      results.push({ eval: step.eval.slice(0, 60), value: r.result?.value ?? null, error: r.exceptionDetails ? (r.exceptionDetails.exception?.description || r.exceptionDetails.text) : null });
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
