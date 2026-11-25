#!/usr/bin/env node
/**
 * Serves dist-pages the way GitHub Pages will: under /ussysite6/, no response headers beyond
 * the content type (the CSP has to come from the meta tag), and 404.html with status 404.
 * Usage: npm run build:pages && node scripts/preview-pages.mjs [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist-pages');
const BASE = '/ussysite6';
const PORT = Number(process.argv[2] || process.env.PORT || 4321);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

async function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(ROOT, safe), join(ROOT, safe, 'index.html'), join(ROOT, `${safe}.html`)];
  for (const c of candidates) {
    try {
      if ((await stat(c)).isFile()) return c;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url || '/', 'http://localhost');
  if (pathname === BASE) {
    res.writeHead(301, { Location: `${BASE}/` });
    return res.end();
  }
  const file = pathname.startsWith(`${BASE}/`) ? await resolveFile(pathname.slice(BASE.length)) : null;
  if (!file) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return res.end(await readFile(join(ROOT, '404.html')));
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(PORT, '127.0.0.1', () => console.log(`Pages preview: http://127.0.0.1:${PORT}${BASE}/`));
