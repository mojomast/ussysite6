import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseCssColor,
  relativeLuminance,
  contrastRatio,
  lerpRgb,
  FALLBACK_PALETTE
} from '../src/scripts/fx/shader/palette.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SHADER_FILES = [
  'src/components/fx/ShaderBackdrop.astro',
  'src/styles/fx/shader.css',
  'src/scripts/fx/shader.ts',
  'src/scripts/fx/shader/palette.ts',
  'src/scripts/fx/shader/ink-backdrop.ts',
  'src/scripts/fx/shader/plate-hover.ts',
  'src/components/islands/CarbonCoverStage.svelte'
];

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

test('palette parser handles hex, short hex, rgb/rgba, and falls back safely', () => {
  const g = parseCssColor('#0b0c0e');
  assert.ok(Math.abs(g[0] - 11 / 255) < 1e-6);
  assert.ok(Math.abs(g[1] - 12 / 255) < 1e-6);
  assert.ok(Math.abs(g[2] - 14 / 255) < 1e-6);

  const short = parseCssColor('#f80');
  assert.ok(Math.abs(short[0] - 1) < 1e-6);
  assert.ok(Math.abs(short[1] - 0x88 / 255) < 1e-6);
  assert.equal(short[2], 0);

  const rgb = parseCssColor('rgb(34, 243, 230)');
  assert.ok(Math.abs(rgb[0] - 34 / 255) < 1e-6);
  assert.ok(Math.abs(rgb[1] - 243 / 255) < 1e-6);
  assert.ok(Math.abs(rgb[2] - 230 / 255) < 1e-6);

  const rgba = parseCssColor('rgba(232, 195, 106, 0.5)');
  assert.ok(Math.abs(rgba[0] - 232 / 255) < 1e-6);

  assert.deepEqual(parseCssColor('not-a-color', FALLBACK_PALETTE.ink), FALLBACK_PALETTE.ink);
  assert.deepEqual(parseCssColor('', FALLBACK_PALETTE.gilt), FALLBACK_PALETTE.gilt);
});

test('stock palette luminance distinguishes dark stocks from rag and keeps ink bed WCAG AA', () => {
  const graphiteBg = parseCssColor('#0b0c0e');
  const oxideBg = parseCssColor('#071522');
  const ragBg = parseCssColor('#f4f0e6');

  assert.ok(relativeLuminance(graphiteBg) < 0.05);
  assert.ok(relativeLuminance(oxideBg) < 0.05);
  assert.ok(relativeLuminance(ragBg) > 0.8);

  // Even at peak ink blend behind body prose, muted & primary copy must hold WCAG AA (>= 4.5:1)
  const graphiteMuted = parseCssColor('#8b867a');
  const graphiteInk = parseCssColor('#ff5a3c');
  const graphiteTinted = [0, 0, 0];
  lerpRgb(graphiteTinted, graphiteBg, graphiteInk, 0.16);
  assert.ok(
    contrastRatio(graphiteMuted, graphiteTinted) >= 4.5,
    `graphite muted ink contrast ${contrastRatio(graphiteMuted, graphiteTinted).toFixed(2)} dropped below 4.5:1`
  );

  const ragMuted = parseCssColor('#585c67');
  const ragInk = parseCssColor('#b3230a');
  const ragTinted = [0, 0, 0];
  lerpRgb(ragTinted, ragBg, ragInk, 0.1);
  assert.ok(
    contrastRatio(ragMuted, ragTinted) >= 4.5,
    `rag muted ink contrast ${contrastRatio(ragMuted, ragTinted).toFixed(2)} dropped below 4.5:1`
  );
});

test('ShaderBackdrop.astro mounts aria-hidden decorative layers with no static canvas', () => {
  const astro = fs.readFileSync(path.join(ROOT_DIR, 'src/components/fx/ShaderBackdrop.astro'), 'utf8');
  const markup = astro.replace(/^---[\s\S]*?---\s*/, '');
  assert.match(markup, /data-fx-backdrop/);
  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /fx-film-grain/);
  assert.match(markup, /fx-film-vignette/);
  assert.doesNotMatch(markup, /<canvas\b/i, 'lite and off tiers must not receive a <canvas> in static HTML');
});

test('shader.css uses compositor-only keyframes, gates motion, and only overrides body bg when live', () => {
  const css = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/fx/shader.css'), 'utf8');
  const allowed = new Set(['transform', 'opacity']);
  const frames = keyframeBlocks(css);
  assert.ok(frames.length >= 1, 'expected at least one keyframe for film grain shimmer');
  for (const { name, body } of frames) {
    for (const [, prop] of body.matchAll(/([a-z-]+)\s*:/g)) {
      assert.ok(allowed.has(prop), `@keyframes ${name} animates non-compositor property "${prop}"`);
    }
  }

  assert.match(css, /html\.fx-backdrop-live\s+body\s*\{[^}]*background-color:\s*transparent/);
  assert.match(css, /z-index:\s*var\(--fx-z-backdrop\)/);
  assert.match(css, /z-index:\s*var\(--fx-z-overlay\)/);
  assert.match(css, /opacity:\s*(calc\()?var\(--fx-grain-opacity/);
  // Blend modes on a fixed full-viewport layer re-blend the whole page every frame.
  assert.doesNotMatch(css, /mix-blend-mode:\s*(?!normal)/);
  // The ink wash is sized to the first spread, never the whole body.
  assert.match(css, /background-repeat:\s*repeat,\s*no-repeat,\s*no-repeat,\s*no-repeat/);
  assert.match(css, /data:image\/svg\+xml/);
  assert.match(css, /feTurbulence/);
  assert.match(css, /html\[data-fx='full'\]\s+\.fx-film-grain/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*no-preference\)/);
  assert.match(css, /@media\s+print/);
});

test('shader track obeys strict CSP and imports Three.js lazily only', () => {
  for (const rel of SHADER_FILES) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.doesNotMatch(src, /\sstyle\s*=\s*["']/, `${rel} must not contain inline style="..."`);
    assert.doesNotMatch(src, /\.style\s*[.=]/, `${rel} must not mutate element.style`);
    assert.doesNotMatch(src, /setAttribute\(\s*['"]style['"]/, `${rel} must not call setAttribute('style', ...)`);
    assert.doesNotMatch(src, /\beval\s*\(|new\s+Function\s*\(/, `${rel} must not use eval or new Function`);
  }

  // Three.js must never be statically imported in shader.ts or its submodules
  for (const rel of [
    'src/scripts/fx/shader.ts',
    'src/scripts/fx/shader/palette.ts',
    'src/scripts/fx/shader/ink-backdrop.ts',
    'src/scripts/fx/shader/plate-hover.ts'
  ]) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.doesNotMatch(src, /^\s*import\s+[^;]*from\s+['"]three/m, `${rel} must import three lazily, not statically`);
  }

  const ink = fs.readFileSync(path.join(ROOT_DIR, 'src/scripts/fx/shader/ink-backdrop.ts'), 'utf8');
  assert.match(ink, /import\(\s*['"]three\/webgpu['"]\s*\)/);
  assert.match(ink, /import\(\s*['"]three\/tsl['"]\s*\)/);
  assert.match(ink, /MutationObserver/);
  assert.match(ink, /data-stock/);
  assert.match(ink, /fx-backdrop-live/);
});

test('CarbonCoverStage preserves WebGPU > WebGL2 > SVG chain, swarm, governor, and adds aberration/bloom/shockwave', () => {
  const svelte = fs.readFileSync(path.join(ROOT_DIR, 'src/components/islands/CarbonCoverStage.svelte'), 'utf8');
  assert.match(svelte, /WEBGPU · TSL/);
  assert.match(svelte, /WEBGL2 · NEON/);
  assert.match(svelte, /STATIC SVG/);
  assert.match(svelte, /Hold still/);
  assert.match(svelte, /setSize\(w,\s*h,\s*false\)/);
  assert.match(svelte, /setSwarmCount/);
  assert.match(svelte, /median > 22/);
  assert.match(svelte, /uAberration/);
  assert.match(svelte, /uBloom/);
  assert.match(svelte, /uShockOrigin/);
  assert.match(svelte, /shockMesh/);
  assert.match(svelte, /velocitySpike/);
});
