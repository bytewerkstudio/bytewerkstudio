// Local server that behaves like a real host: gzip for text assets, correct
// MIME types, no caching for HTML. GitHub Pages compresses the same way, so
// byte counts measured against this server are comparable to production.
//
//   node tools/serve.mjs [port] [root]
//
// Defaults: port 8080, root = repository root.
import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] || 8080);
const root = resolve(process.argv[3] || join(dirname(fileURLToPath(import.meta.url)), '..'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = /^(text\/|image\/svg|application\/(json|xml|manifest))/;
const CACHE = { '.woff2': 'public, max-age=31536000, immutable', '.webp': 'public, max-age=604800' };

createServer((req, res) => {
  let rel;
  try {
    rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  // never serve outside the root
  let file = normalize(join(root, rel));
  if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) {
    const notFound = join(root, '404.html');
    if (existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      res.end(readFileSync(notFound));
    } else res.writeHead(404).end('not found');
    return;
  }

  const ext = extname(file).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' };
  if (CACHE[ext]) headers['Cache-Control'] = CACHE[ext];
  else headers['Cache-Control'] = 'no-cache';

  const accepts = String(req.headers['accept-encoding'] || '');
  const shouldGzip = COMPRESSIBLE.test(type) && /\bgzip\b/.test(accepts) && statSync(file).size > 1024;

  if (shouldGzip) {
    const body = gzipSync(readFileSync(file), { level: 9 });
    headers['Content-Encoding'] = 'gzip';
    headers['Content-Length'] = body.length;
    headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers).end(req.method === 'HEAD' ? undefined : body);
    return;
  }

  headers['Content-Length'] = statSync(file).size;
  res.writeHead(200, headers);
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`serving ${root} on http://127.0.0.1:${port}/ (gzip on)`);
});
