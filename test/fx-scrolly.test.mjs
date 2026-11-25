import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseStatTokens } from '../src/scripts/fx/scrolly/stat-tokens.ts';
import { loadServerCatalog } from '../src/lib/server-catalog.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scrollyCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/fx/scrolly.css'), 'utf8');
const scrollyTs = fs.readFileSync(path.join(ROOT_DIR, 'src/scripts/fx/scrolly.ts'), 'utf8');

function keyframeBlocks(css) {
  const out = [];
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (depth && i < css.length) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    out.push({ name: m[1], body: css.slice(re.lastIndex, i - 1) });
  }
  return out;
}

test('parseStatTokens preserves every highlight and metric string verbatim while selecting only clean integers', () => {
  const { issues, articles } = loadServerCatalog();
  let intHits = 0;

  for (const iss of issues) {
    for (const h of iss.highlights) {
      const tokens = parseStatTokens(h.value);
      assert.equal(tokens.map((t) => t.text).join(''), h.value, `round-trip mismatch for "${h.value}"`);
      intHits += tokens.filter((t) => t.kind === 'int').length;
    }
  }

  for (const art of articles) {
    for (const m of art.metrics) {
      const tokens = parseStatTokens(m.value);
      assert.equal(tokens.map((t) => t.text).join(''), m.value, `round-trip mismatch for "${m.value}"`);
      intHits += tokens.filter((t) => t.kind === 'int').length;
    }
  }

  assert.ok(intHits >= 40, `expected at least 40 clean integer stats across catalog, got ${intHits}`);

  // Specific spot checks for edge cases
  const pairs = [
    ['11 features, 4 dispatches', [11, 4]],
    ['#201 to #211', [201, 211]],
    ['18 Oct to 23 Nov 2026', []],
    ['0.3.1', []],
    ['1,284 tests passed in CI', []],
    ['8 MiB · SHA-256 pinned on first read', [8]],
    ['14 jobs · ~8.5 compute units · ~99 GB weights', [14, 99]],
    ['640×480 PNG · 16 colors (~414 tokens)', [16, 414]],
    ['40 calls, with nudges at 60 / 80 / 95%', [40, 60, 80, 95]],
    ['0 (no npm install required)', []]
  ];

  for (const [input, expected] of pairs) {
    const ints = parseStatTokens(input)
      .filter((t) => t.kind === 'int')
      .map((t) => t.value);
    assert.deepEqual(ints, expected, `unexpected ints for "${input}"`);
  }
});

test('scrolly.css only animates compositor-friendly properties and @property integer counters', () => {
  const allowed = new Set([
    'transform',
    'opacity',
    'clip-path',
    'stroke-dashoffset',
    '--fx-count',
    '--fx-sheet-num'
  ]);
  const frames = keyframeBlocks(scrollyCss);
  assert.ok(frames.length >= 11, `expected comprehensive scrolly keyframes, found ${frames.length}`);
  for (const { name, body } of frames) {
    for (const [, prop] of body.matchAll(/(--[a-z0-9-]+|[a-z-]+)\s*:/g)) {
      assert.ok(allowed.has(prop), `@keyframes ${name} animates disallowed property "${prop}"`);
    }
  }
});

test('scrolly.css registers sheet counter, keeps true stat numbers visible, and gates scroll-timelines + max-rizz + lite tier', () => {
  assert.match(scrollyCss, /@property\s+--fx-sheet-num\s*\{[^}]*syntax:\s*'<integer>'/);
  assert.doesNotMatch(scrollyCss, /\.fx-counter-real\s*\{[^}]*color:\s*transparent/, 'true stat figures must never be hidden behind halfway-scrolled counters');
  assert.match(scrollyCss, /@supports\s*\(animation-timeline:\s*view\(\)\)/);
  assert.match(scrollyCss, /prefers-reduced-motion:\s*no-preference/);
  assert.match(scrollyCss, /html\[data-rizz='max'\][^}]*--fx-parallax-mult:\s*2/);
  assert.match(scrollyCss, /fx-sheet-pass-max/);
  assert.match(scrollyCss, /html\[data-fx='lite'\]/);
  assert.doesNotMatch(scrollyCss, /prefers-reduced-motion:\s*reduce[^{]*\{[^}]*opacity:\s*0/);
});

test('scrolly.ts respects strict CSP and never scroll-jacks or attaches scroll listeners', () => {
  assert.doesNotMatch(scrollyTs, /\.style\b|setAttribute\(\s*['"]style['"]/);
  assert.doesNotMatch(scrollyTs, /addEventListener\(\s*['"](?:scroll|wheel|touchmove)['"]/);
  assert.match(scrollyTs, /IntersectionObserver/);
  assert.match(scrollyTs, /setVars/);

  const compDir = path.join(ROOT_DIR, 'src/components/fx/scrolly');
  for (const name of fs.readdirSync(compDir)) {
    const src = fs.readFileSync(path.join(compDir, name), 'utf8');
    assert.doesNotMatch(src, /\sstyle\s*=/i, `${name} must not contain inline style= attributes`);
    assert.doesNotMatch(src, /<style\b/i, `${name} must not contain inline <style> blocks`);
  }
});

const distDir = path.join(ROOT_DIR, 'dist');
test('built HTML includes press run, 4 depth layers, reading ink, counters, and reveal choreography', {
  skip: !fs.existsSync(distDir) && 'run npm run build first'
}, () => {
  const issue02 = fs.readFileSync(path.join(distDir, 'issues/02/index.html'), 'utf8');
  assert.match(issue02, /class="fx-press-run"/);
  const sheetMatches = issue02.match(/class="fx-press-sheet"/g) || [];
  assert.equal(sheetMatches.length, 11, 'Issue 02 press run should render all 11 feature sheets');
  assert.match(issue02, /class="article-ledger"/, 'existing contents ledger must stay');

  const feature = fs.readFileSync(path.join(distDir, 'issues/02/rizzstack/index.html'), 'utf8');
  assert.match(feature, /data-fx-ink-rail/);
  assert.match(feature, /fx-depth-layers--plate/);
  assert.match(feature, /fx-depth-layers--hood/);
  assert.match(feature, /fx-depth-layers--rail/);
  assert.equal((feature.match(/\bfx-dl-grid\b/g) || []).length, 3);
  assert.equal((feature.match(/\bfx-dl-folio\b/g) || []).length, 3);
  assert.equal((feature.match(/\bfx-dl-crosshairs\b/g) || []).length, 3);
  assert.equal((feature.match(/\bfx-dl-rule\b/g) || []).length, 3);
  assert.match(feature, /<span class="fx-counter" data-fx-count="201">\s*<span class="fx-counter-real">201<\/span>\s*<span class="fx-counter-anim" aria-hidden="true"><\/span>/);

  const home = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  assert.match(home, /fx-corr-strike/);
  assert.match(home, /fx-corr-caret/);

  const archive = fs.readFileSync(path.join(distDir, 'issues/index.html'), 'utf8');
  assert.match(archive, /fx-archive-rack/);
  assert.match(archive, /fx-archive-card/);

  const lastPage = fs.readFileSync(path.join(distDir, 'issues/02/last-page/index.html'), 'utf8');
  assert.match(lastPage, /fx-strata-list/);
  assert.match(lastPage, /fx-strata-row/);
});
