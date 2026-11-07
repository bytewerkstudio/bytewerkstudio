#!/usr/bin/env node
/* ============================================================
 * NEON HORDE — Build: verkettet src/*.js in EINE index.html
 * (Single-File-Verkaufsargument: keine externen Runtime-Assets)
 * Aufruf: node build/build.js
 * ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT = path.join(OUT_DIR, 'index.html');
const ORDER = [
  'loader.js', 'balance.js', 'api.js', 'lang.js',
  'audio.js', 'input.js', 'save.js', 'meta.js',
  'entities.js', 'weapons.js', 'waves.js', 'shop.js',
  'ui.js', 'game.js', 'main.js',
];

const sha = (text) => "'sha256-" + crypto.createHash('sha256').update(text, 'utf8').digest('base64') + "'";

/* The dist file inlines everything into one <script>, so the per-file hashes
   of the source page no longer match. Rebuild the CSP from what is actually
   in the output instead of copying the source tag. */
function cspFor(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => !/\bsrc\s*=/.test(m[1]))
    .map((m) => sha(m[2]));
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => sha(m[1]));
  return [
    "default-src 'self'",
    ['script-src', "'self'", ...scripts].join(' '),
    ['style-src', "'self'", ...styles].join(' '),
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function main() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const missing = [];
  const scripts = ORDER.map((f) => {
    const p = path.join(SRC, f);
    if (!fs.existsSync(p)) { missing.push(f); return ''; }
    const code = fs.readFileSync(p, 'utf8');
    return `/* ==== src/${f} (${(code.length / 1024).toFixed(1)} KB) ==== */\n${code}\n`;
  }).join('\n');

  if (missing.length) {
    console.error('FEHLENDE MODULE (werden noch geschrieben): ' + missing.join(', '));
  }

  // WICHTIG: Die Skripte NICHT via .replace('</body>', ...) einfügen — String.replace
  // interpretiert im Replacement $$, $&, $', $` als Sonderzeichen und verfälscht z.B.
  // NH.dom.$$(sel) zu NH.dom.$(sel) (Root-Cause des schwarzen Screens). Split-basiert:
  let stripped = html.replace(/<script src="src\/[^"]+"><\/script>\s*/g, '');
  const parts = stripped.split('</body>');
  let single = parts[0] + '  <script>\n' + scripts + '\n  </script>\n</body>' + parts.slice(1).join('</body>');

  // Single-file build has no src/*.js to load, so script-src 'self' would only
  // matter for injected markup — keep it, but the hash of the big block is new.
  single = single.replace(
    /(<meta http-equiv="Content-Security-Policy" content=")[^"]*(")/,
    (m, open, close) => open + cspFor(single) + close,
  );

  if (!single.includes('$all(sel)')) {
    throw new Error('BUILD-FEHLER: NH.dom.$all fehlt im Output — moeglicher $$-Transform aktiv');
  }
  if (!/Content-Security-Policy/.test(single)) {
    throw new Error('BUILD-FEHLER: CSP-Meta-Tag fehlt im Output');
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, single);
  const kb = (single.length / 1024).toFixed(1);
  console.log(`OK: dist/index.html (${kb} KB)` + (missing.length ? ` — FEHLEND: ${missing.join(', ')}` : ''));
}

main();