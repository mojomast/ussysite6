import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withBase, stripBase, API_ENABLED, BASE_PATH } from '../src/lib/paths.ts';
import { STRICT_CSP_HEADER, STRICT_CSP_META } from '../src/lib/csp.ts';
import { checkBasePaths } from '../scripts/check-base-paths.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('withBase is a no-op at the domain root and leaves external, hash and relative URLs alone', () => {
  assert.equal(BASE_PATH, '');
  assert.equal(withBase('/issues/02'), '/issues/02');
  for (const url of ['https://github.com/mojomast', '//cdn.example', '#contents', 'relative/path', '', undefined]) {
    assert.equal(withBase(url), url);
  }
  assert.equal(stripBase('/issues/02'), '/issues/02');
  assert.equal(API_ENABLED, true, 'outside a Pages build the API is on');
});

test('the strict CSP has no unsafe-inline, and the meta version drops only frame-ancestors', () => {
  for (const policy of [STRICT_CSP_HEADER, STRICT_CSP_META]) {
    assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval/);
    assert.match(policy, /script-src 'self'(;|$)/);
  }
  assert.match(STRICT_CSP_HEADER, /frame-ancestors 'none'/);
  assert.doesNotMatch(STRICT_CSP_META, /frame-ancestors/);
  assert.equal(STRICT_CSP_META.split('; ').length, STRICT_CSP_HEADER.split('; ').length - 1);
});

test('islands never call /api without the API_ENABLED gate', () => {
  const files = ['src/lib/press-client.ts', ...fs.readdirSync(path.join(ROOT_DIR, 'src/components/islands')).map((f) => `src/components/islands/${f}`)];
  for (const rel of files) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    if (!src.includes('/api/')) continue;
    assert.doesNotMatch(src, /fetch\(\s*['"`]\/api/, `${rel} fetches /api without withBase()`);
    assert.match(src, /API_ENABLED/, `${rel} calls the API but never checks API_ENABLED`);
  }
});

const pagesDir = path.join(ROOT_DIR, 'dist-pages');
test('the GitHub Pages build keeps every URL under /ussysite6/', { skip: !fs.existsSync(pagesDir) && 'run npm run build:pages first' }, async () => {
  const problems = await checkBasePaths(pagesDir, '/ussysite6');
  assert.deepEqual(problems, []);
  assert.ok(fs.existsSync(path.join(pagesDir, '404.html')), '404.html is required for Pages');
  assert.ok(fs.existsSync(path.join(pagesDir, '.nojekyll')), '.nojekyll keeps Jekyll from dropping _astro/');
  const home = fs.readFileSync(path.join(pagesDir, 'index.html'), 'utf8');
  assert.match(home, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(home, /<style|\sstyle="|<script(?![^>]*\ssrc=)[^>]*>/, 'no inline styles or scripts');
});
