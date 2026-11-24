import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCRAMBLE_GLYPHS, scrambleFrame } from '../src/scripts/fx/type/scramble.ts';
import { computePressureTargets, stepSpring } from '../src/scripts/fx/type/pressure.ts';
import { findSlopMatches } from '../src/scripts/fx/type/glitch.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typeCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/fx/type.css'), 'utf8');
const kineticAstro = fs.readFileSync(path.join(ROOT_DIR, 'src/components/Kinetic.astro'), 'utf8');

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

test('scrambleFrame preserves character count, whitespace, and arrows while decoding into target text', () => {
  const samples = [
    '@b8cd1fe ↗',
    'Folio 03 of 13 · Checked 2026-04-12',
    'Cover story · #201',
    '← Issue 02 contents'
  ];
  const glyphSet = new Set([...SCRAMBLE_GLYPHS]);

  for (const target of samples) {
    const targetChars = [...target];
    const start = [...scrambleFrame(target, 0, 1)];
    const mid = [...scrambleFrame(target, 0.5, 4)];
    const end = scrambleFrame(target, 1, 9);

    assert.equal(start.length, targetChars.length, `start length matches for "${target}"`);
    assert.equal(mid.length, targetChars.length, `mid length matches for "${target}"`);
    assert.equal(end, target, `progress=1 restores exact text for "${target}"`);

    for (let i = 0; i < targetChars.length; i++) {
      if (/[\s↗←→]/.test(targetChars[i])) {
        assert.equal(start[i], targetChars[i], 'whitespace and arrows stay fixed to prevent reflow');
        assert.equal(mid[i], targetChars[i]);
      } else {
        assert.ok(
          glyphSet.has(start[i]) || start[i] === targetChars[i],
          `scrambled char "${start[i]}" comes from press/hex glyph set`
        );
      }
    }
  }
});

test('computePressureTargets swells nearest letters toward 800 with smooth Gaussian falloff and bounded weights', () => {
  const points = [
    { cx: 10, cy: 20 },
    { cx: 40, cy: 20 },
    { cx: 80, cy: 20 },
    { cx: 160, cy: 20 },
    { cx: 340, cy: 20 }
  ];

  const weights = computePressureTargets(points, 40, 20, { rest: 470, peak: 800, radius: 120 });
  assert.equal(weights.length, points.length);
  assert.equal(Math.round(weights[1]), 800, 'letter directly under pointer hits peak weight');
  assert.ok(weights[1] > weights[0] && weights[0] > weights[2], 'closer letters swell more than farther ones');
  for (const w of weights) {
    assert.ok(w >= 400 && w <= 800, `weight ${w} stays within Syne wght bounds [400, 800]`);
  }

  const maxRizzWeights = computePressureTargets(points, 40, 20, { rest: 400, peak: 800, radius: 175 });
  assert.ok(maxRizzWeights[3] > weights[3], 'wider radius under max rizz reaches further letters');
});

test('stepSpring converges smoothly toward target and remains stable with large dt', () => {
  let val = 460;
  let vel = 0;
  for (let i = 0; i < 120; i++) {
    [val, vel] = stepSpring(val, vel, 800, 0.016);
  }
  assert.ok(Math.abs(val - 800) < 1, `spring converged to ${val}`);
  assert.ok(Math.abs(vel) < 1, `spring velocity settled to ${vel}`);

  const [clampedVal] = stepSpring(460, 0, 800, 5.0);
  assert.ok(Number.isFinite(clampedVal) && clampedVal > 460 && clampedVal < 900, 'large dt is safely clamped');
});

test('findSlopMatches matches only standalone "slop" tokens', () => {
  assert.deepEqual(
    findSlopMatches('CoCS // Colosseum of Competitive Slop').map((m) => m.match),
    ['Slop']
  );
  assert.deepEqual(
    findSlopMatches('SLOP · ISSUE 02').map((m) => m.match),
    ['SLOP']
  );
  assert.deepEqual(findSlopMatches('SLOPTIMUS PRIME writes sloppy code'), []);
});

test('Kinetic.astro preserves sr-only text, existing .kt structure, and has no inline styles', () => {
  assert.match(kineticAstro, /<span class="sr-only">\{text\}<\/span>/);
  assert.match(kineticAstro, /aria-hidden="true"/);
  assert.match(kineticAstro, /class="kt-w"/);
  assert.match(kineticAstro, /kt-wi/);
  assert.doesNotMatch(kineticAstro, /\sstyle=/i);
});

test('type.css registers @property tokens, gates background-clip:text and view/scroll timelines, and respects forced-colors', () => {
  assert.match(typeCss, /@property\s+--fx-ink-pos\b/);
  assert.match(typeCss, /@property\s+--fx-ink-angle\b/);
  assert.match(typeCss, /@supports\s*\([^)]*background-clip:\s*text/);
  assert.match(typeCss, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(typeCss, /animation-timeline:\s*view\(\)/);
  assert.match(typeCss, /animation-timeline:\s*scroll\(root block\)/);
  assert.doesNotMatch(typeCss, /prefers-reduced-motion:\s*reduce[^{]*\{[^}]*opacity:\s*0/);

  const allowed = new Set([
    'transform',
    'opacity',
    'filter',
    'clip-path',
    'font-variation-settings',
    'text-shadow',
    '--fx-ink-pos',
    '--fx-ink-angle'
  ]);
  const frames = keyframeBlocks(typeCss);
  assert.ok(frames.length >= 8, `expected typography keyframes, found ${frames.length}`);
  for (const { name, body } of frames) {
    for (const [, prop] of body.matchAll(/(?:^|[\s{;])(--[a-z][a-z0-9-]*|[a-z][a-z0-9-]*)\s*:/g)) {
      assert.ok(allowed.has(prop), `@keyframes ${name} animates disallowed property "${prop}"`);
    }
  }
});

test('typography scripts obey strict CSP (no element.style, setAttribute style, eval, or unsafe timers)', () => {
  const scriptFiles = [
    'src/scripts/fx/type.ts',
    'src/scripts/fx/type/scramble.ts',
    'src/scripts/fx/type/split.ts',
    'src/scripts/fx/type/pressure.ts',
    'src/scripts/fx/type/glitch.ts'
  ];
  for (const rel of scriptFiles) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.doesNotMatch(src, /\.style\b/, `${rel} must not touch element.style`);
    assert.doesNotMatch(src, /setAttribute\(\s*['"]style['"]/, `${rel} must not set style attribute`);
    assert.doesNotMatch(src, /\b(?:eval|new Function)\b/, `${rel} must not use eval or new Function`);
  }
});
