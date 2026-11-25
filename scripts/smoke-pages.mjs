#!/usr/bin/env node
/**
 * Headless Chrome smoke test for a built site. Visits every page in the build at desktop and
 * mobile sizes, with motion allowed and reduced, and fails on console errors, uncaught
 * exceptions, CSP violations, HTTP errors, requests that escape the base path, and duplicate
 * view-transition names.
 *
 *   npm run build:pages && node scripts/preview-pages.mjs 4321 &
 *   node scripts/smoke-pages.mjs http://127.0.0.1:4321/ussysite6 dist-pages
 *
 * Set SMOKE_ROUTES=/,/issues/02/ to limit routes; SMOKE_QUICK=1 for desktop + motion only.
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'http://127.0.0.1:4321/ussysite6').replace(/\/$/, '');
const DIST = process.argv[3] || 'dist-pages';
const PREFIX = new URL(BASE).pathname.replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';
const GPU_ARGS = ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-webgpu-adapter=swiftshader', '--use-angle=swiftshader'];

function routes(dir, prefix = '') {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== '_astro' && name !== 'assets') out.push(...routes(p, `${prefix}/${name}`));
    } else if (name === 'index.html') out.push(`${prefix}/`);
  }
  return out;
}

const list = process.env.SMOKE_ROUTES ? process.env.SMOKE_ROUTES.split(',') : routes(DIST).sort();
const quick = process.env.SMOKE_QUICK === '1';
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', ...GPU_ARGS] });
const problems = [];
const viewports = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
];

for (const vp of quick ? viewports.slice(0, 1) : viewports) {
  for (const reduced of quick ? [false] : [false, true]) {
    const ctx = await browser.newContext({ ...vp, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(() => {
      try { sessionStorage.setItem('si.coldopen.02', 'seen'); } catch {}
      document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP ${e.violatedDirective} ${e.blockedURI}`));
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
    page.on('response', (r) => {
      const u = new URL(r.url());
      if (u.origin !== new URL(BASE).origin) return;
      if (r.status() >= 400) errs.push(`http ${r.status()} ${u.pathname}`);
      else if (PREFIX && !u.pathname.startsWith(PREFIX)) errs.push(`escapes base: ${u.pathname}`);
    });
    for (const r of list) {
      errs.length = 0;
      await page.goto(BASE + r, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const dupes = await page.evaluate(() => {
        const seen = new Map();
        for (const el of document.querySelectorAll('*')) {
          const n = getComputedStyle(el).viewTransitionName;
          if (n && n !== 'none') seen.set(n, (seen.get(n) || 0) + 1);
        }
        return [...seen].filter(([, c]) => c > 1).map(([n]) => n);
      });
      if (dupes.length) errs.push(`duplicate view-transition-name: ${dupes.join(', ')}`);
      const relevant = errs.filter((e) => !/GPU stall|Automatic fallback to software WebGL/i.test(e));
      if (relevant.length) problems.push(`${vp.name}${reduced ? ' (reduced motion)' : ''} ${r}\n    ${relevant.join('\n    ')}`);
    }
    await ctx.close();
  }
}
await browser.close();

const runs = (quick ? 1 : 4) * list.length;
if (problems.length) {
  console.error(`[smoke] ${problems.length} of ${runs} page loads had problems:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`[smoke] OK: ${list.length} routes, ${runs} page loads, no console, CSP, HTTP or base-path errors`);
