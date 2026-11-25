import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  computeMagnetOffset,
  computeTilt,
  createRateLimiter,
  resolveCursorState
} from '../src/scripts/fx/cursor/math.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cursorCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/fx/cursor.css'), 'utf8');
const cursorTs = fs.readFileSync(path.join(ROOT_DIR, 'src/scripts/fx/cursor.ts'), 'utf8');
const canvasTs = fs.readFileSync(path.join(ROOT_DIR, 'src/scripts/fx/cursor/canvas.ts'), 'utf8');
const layerAstro = fs.readFileSync(path.join(ROOT_DIR, 'src/components/fx/CursorLayer.astro'), 'utf8');

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

test('computeMagnetOffset pulls toward pointer within radius and amplifies under max rizz', () => {
  const rect = { left: 100, top: 100, width: 120, height: 44 };
  const opts = { radius: 60, maxX: 10, maxY: 7 };

  const far = computeMagnetOffset(400, 400, rect, opts);
  assert.equal(far.active, false);
  assert.equal(far.dx, 0);
  assert.equal(far.dy, 0);

  const nearRight = computeMagnetOffset(250, 122, rect, opts);
  assert.equal(nearRight.active, true);
  assert.ok(nearRight.dx > 0 && nearRight.dx <= opts.maxX, `expected positive dx <= 10, got ${nearRight.dx}`);
  assert.equal(Math.round(nearRight.dy), 0);

  const rizzPull = computeMagnetOffset(250, 122, rect, { ...opts, rizz: true });
  assert.equal(rizzPull.active, true);
  assert.ok(rizzPull.dx > nearRight.dx * 1.4, 'max rizz should pull noticeably stronger');

  // Expanded radius under rizz catches pointer just outside normal radius
  const normalMiss = computeMagnetOffset(290, 122, rect, opts);
  const rizzHit = computeMagnetOffset(290, 122, rect, { ...opts, rizz: true });
  assert.equal(normalMiss.active, false);
  assert.equal(rizzHit.active, true);
});

test('computeTilt stays within +/-maxDeg and tracks glare focal point', () => {
  const rect = { left: 50, top: 100, width: 400, height: 300 };

  const center = computeTilt(250, 250, rect, 6);
  assert.equal(center.rx, 0);
  assert.equal(center.ry, 0);
  assert.equal(center.glareX, 50);
  assert.equal(center.glareY, 50);

  const topLeft = computeTilt(50, 100, rect, 6);
  assert.equal(topLeft.rx, 6);
  assert.equal(topLeft.ry, -6);
  assert.equal(topLeft.glareX, 0);
  assert.equal(topLeft.glareY, 0);

  const bottomRight = computeTilt(450, 400, rect, 6);
  assert.equal(bottomRight.rx, -6);
  assert.equal(bottomRight.ry, 6);
  assert.equal(bottomRight.glareX, 100);
  assert.equal(bottomRight.glareY, 100);

  // Clamped even if pointer overshoots bounds
  const overshot = computeTilt(999, -500, rect, 6);
  assert.ok(Math.abs(overshot.rx) <= 6);
  assert.ok(Math.abs(overshot.ry) <= 6);
});

test('resolveCursorState classifies READ / OPEN / PLAY links, loupe plates, code carets, and inputs', () => {
  assert.deepEqual(
    resolveCursorState({ isLinkOrButton: true, href: '/issues/02/rizzstack', text: 'Read the cover story' }),
    { mode: 'link', label: 'READ', tone: 'ink' }
  );

  assert.deepEqual(
    resolveCursorState({ isLinkOrButton: true, href: 'https://github.com/mojomast/rizzstack', targetBlank: true, text: 'Open the repo ↗' }),
    { mode: 'link', label: 'OPEN', tone: 'ink' }
  );

  assert.deepEqual(
    resolveCursorState({ isLinkOrButton: true, href: '/issues/02#opening', text: '▶ Watch the opening' }),
    { mode: 'link', label: 'PLAY', tone: 'signal' }
  );

  assert.deepEqual(
    resolveCursorState({ isLinkOrButton: true, text: '◎ Play its chord' }),
    { mode: 'link', label: 'PLAY', tone: 'signal' }
  );

  assert.deepEqual(
    resolveCursorState({ isLinkOrButton: true, explicitLabel: 'inspect', text: 'anything' }),
    { mode: 'link', label: 'INSPECT', tone: 'ink' }
  );

  assert.equal(resolveCursorState({ isPlate: true }).mode, 'loupe');
  assert.equal(resolveCursorState({ isCode: true }).mode, 'caret');
  assert.equal(resolveCursorState({ isInput: true, isLinkOrButton: true }).mode, 'input');
  assert.equal(resolveCursorState({}).mode, 'default');
});

test('createRateLimiter enforces minimum interval between sound triggers', () => {
  const allow = createRateLimiter(150);
  assert.equal(allow(1000), true);
  assert.equal(allow(1080), false);
  assert.equal(allow(1149), false);
  assert.equal(allow(1150), true);
});

test('cursor.css uses compositor-only keyframes, proper gating, and preserves .nav-link::after', () => {
  const allowed = new Set(['transform', 'translate', 'opacity']);
  const frames = keyframeBlocks(cursorCss);
  assert.ok(frames.length >= 2, 'expected lite-tier ripple keyframes');
  for (const { name, body } of frames) {
    for (const [, prop] of body.matchAll(/([a-z-]+)\s*:/g)) {
      assert.ok(allowed.has(prop), `@keyframes ${name} animates "${prop}"`);
    }
  }

  const cssNoComments = cursorCss.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(cssNoComments, /@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
  assert.match(cssNoComments, /html\[data-fx='full'\]\[data-pointer='fine'\]/);
  assert.match(cssNoComments, /html\[data-fx='lite'\]/);
  assert.match(cssNoComments, /\[data-rizz='max'\]/);
  assert.doesNotMatch(cssNoComments, /perspective\(/, '3D card tilt was cut in taste pass (§10)');
  assert.doesNotMatch(cssNoComments, /data-magnet-id/, 'magnetic button drift was cut in taste pass (§10)');
  assert.doesNotMatch(cssNoComments, /\.nav-link::after/, 'must not clobber motion.css .nav-link::after underline');
});

test('cursor layer respects strict CSP and opt-in-only sound policy', () => {
  assert.match(layerAstro, /id="fx-cursor-canvas"/);
  assert.match(layerAstro, /aria-hidden="true"/);

  for (const [name, src] of [
    ['CursorLayer.astro', layerAstro],
    ['cursor.ts', cursorTs],
    ['canvas.ts', canvasTs]
  ]) {
    assert.doesNotMatch(src, /\sstyle\s*=\s*["']/, `${name} must not emit inline style=""`);
    assert.doesNotMatch(src, /\.style\b/, `${name} must not touch element.style`);
    assert.doesNotMatch(src, /setAttribute\(\s*['"]style['"]/, `${name} must not call setAttribute('style', ...)`);
    assert.doesNotMatch(src, /\beval\s*\(|\bnew\s+Function\b/, `${name} must not use eval or Function`);
  }

  assert.match(cursorTs, /setVars\(/);
  assert.match(cursorTs, /carbonSynth\.isEnabled\(\)/);
  assert.doesNotMatch(cursorTs, /carbonSynth\.playChord\(/, 'must never trigger explicit chords');
  assert.doesNotMatch(cursorTs, /carbonSynth\.setEnabled\(/, 'must never turn sound on by itself');
});
