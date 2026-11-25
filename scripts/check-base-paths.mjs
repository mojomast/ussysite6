#!/usr/bin/env node
/**
 * Checks a subpath build (default: dist-pages, base /ussysite6) for URLs that would escape
 * the base on GitHub Pages: root-relative href/src/srcset/data-folio-* attributes, CSS url(/…),
 * and RSS links. Exits 1 and lists every offender.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const dir = process.argv[2] || 'dist-pages';
const base = (process.argv[3] || '/ussysite6').replace(/\/+$/, '');

async function walk(d) {
  const out = [];
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

export async function checkBasePaths(root = dir, prefix = base) {
  await stat(root);
  const escapes = (url) => url.startsWith('/') && !url.startsWith('//') && url !== prefix && !url.startsWith(`${prefix}/`);
  const problems = [];
  const required = [];
  for (const file of await walk(root)) {
    const rel = relative(root, file);
    if (file.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      for (const m of html.matchAll(/\s(href|src|action|poster|data-folio-prev|data-folio-next)="([^"]*)"/g)) {
        if (escapes(m[2])) problems.push(`${rel}: ${m[1]}="${m[2]}"`);
      }
      for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) {
        for (const part of m[1].split(',')) {
          const url = part.trim().split(/\s+/)[0];
          if (escapes(url)) problems.push(`${rel}: srcset ${url}`);
        }
      }
      if (rel === 'index.html') required.push(html.includes('http-equiv="Content-Security-Policy"') ? null : `${rel}: no CSP meta tag`);
    } else if (file.endsWith('.css')) {
      const css = await readFile(file, 'utf8');
      for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)/g)) if (escapes(m[1])) problems.push(`${rel}: url(${m[1]})`);
    } else if (file.endsWith('.xml')) {
      const xml = await readFile(file, 'utf8');
      for (const m of xml.matchAll(/<(?:link|loc)>([^<]+)</g)) {
        if (!new URL(m[1]).pathname.startsWith(prefix)) problems.push(`${rel}: ${m[1]}`);
      }
    }
  }
  return [...problems, ...required.filter(Boolean)];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = await checkBasePaths();
  if (problems.length) {
    console.error(`[check-base-paths] ${problems.length} URL(s) escape ${base}:\n  ${problems.slice(0, 50).join('\n  ')}`);
    process.exit(1);
  }
  console.log(`[check-base-paths] OK: every URL in ${dir} stays under ${base}/`);
}
