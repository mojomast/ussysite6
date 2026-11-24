import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const motionCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/motion.css'), 'utf8');
const tokensCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/tokens.css'), 'utf8');

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

test('motion keyframes only animate compositor-friendly properties', () => {
  const allowed = new Set(['transform', 'opacity', 'filter', 'clip-path', 'font-variation-settings', 'stroke-dashoffset', 'offset']);
  const frames = keyframeBlocks(motionCss);
  assert.ok(frames.length >= 20, `expected a full motion vocabulary, found ${frames.length} keyframes`);
  for (const { name, body } of frames) {
    for (const [, prop] of body.matchAll(/([a-z-]+)\s*:/g)) {
      assert.ok(allowed.has(prop), `@keyframes ${name} animates "${prop}", which forces layout or paint`);
    }
  }
});

test('nothing hidden by a base opacity: 0 waits on keyframes that never reveal it', () => {
  const frames = new Map(keyframeBlocks(motionCss).map((k) => [k.name, k.body]));
  const revealsOpacity = (body) => /(?:^|\})\s*(?:to|100%)[^{]*\{[^}]*opacity/.test(body);
  for (const [, selector, body] of motionCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(^|;|\s)opacity:\s*0\s*;/.test(body)) continue;
    const anim = body.match(/animation(?:-name)?:\s*([^;]+);/);
    if (!anim) continue;
    for (const name of anim[1].split(',').map((part) => part.trim().split(/\s+/)[0])) {
      if (!frames.has(name)) continue;
      assert.ok(revealsOpacity(frames.get(name)), `${selector.trim()} starts at opacity 0 but @keyframes ${name} never sets an end opacity`);
    }
  }
});

test('springs are CSS linear() curves and every token is defined', () => {
  for (const token of ['--spring-snappy', '--spring-bouncy', '--spring-soft', '--spring-stamp']) {
    assert.match(motionCss, new RegExp(`${token}:\\s*linear\\(`), `${token} should be a linear() spring`);
  }
  const used = new Set([...motionCss.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const defined = new Set([...(motionCss + tokensCss).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const external = ['--kt-i', '--kt-base', '--gilt', '--proof-ink', '--neon-cyan', '--paper', '--ink', '--accent', '--rule', '--bg', '--fg'];
  for (const name of used) {
    if (external.some((e) => name.startsWith(e))) continue;
    if (/^--(color|font|space|neon|opus|press|surface|text|line|stock)/.test(name)) continue;
    assert.ok(defined.has(name), `motion.css uses ${name} but never defines it`);
  }
});

test('cross-document view transitions and hidden start states only exist when motion is allowed', () => {
  const vt = motionCss.indexOf('@view-transition');
  assert.ok(vt > 0, 'cross-document view transitions should be enabled');
  const before = motionCss.slice(0, vt);
  const lastMedia = before.lastIndexOf('@media');
  assert.match(before.slice(lastMedia), /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*$/, '@view-transition must sit inside a no-preference media query');
  assert.doesNotMatch(motionCss, /prefers-reduced-motion:\s*reduce[^{]*\{[^}]*opacity:\s*0/, 'reduced motion must never start content hidden');
});

test('motion boot script is external, tiny and sets a page-turn direction', () => {
  const boot = fs.readFileSync(path.join(ROOT_DIR, 'public/motion-boot.js'), 'utf8');
  assert.ok(Buffer.byteLength(boot) < 2048, 'motion-boot.js is render-blocking and must stay under 2 KB');
  assert.match(boot, /pagereveal/);
  assert.match(boot, /types\.add/);
  const layout = fs.readFileSync(path.join(ROOT_DIR, 'src/layouts/BaseLayout.astro'), 'utf8');
  assert.match(layout, /src="\/motion-boot\.js"/);
  assert.match(layout, /href="\/vt-names\.css"/);
  assert.match(layout, /rel="expect" href="#page-end" blocking="render"/);
});

const builtNames = path.join(ROOT_DIR, 'dist/vt-names.css');
test('generated shared-element names are unique', { skip: !fs.existsSync(builtNames) && 'run npm run build first' }, () => {
  const css = fs.readFileSync(builtNames, 'utf8');
  const names = [...css.matchAll(/view-transition-name:\s*([\w-]+)/g)].map((m) => m[1]);
  assert.ok(names.length >= 40, `expected headline, plate and issue names, found ${names.length}`);
  assert.equal(new Set(names).size, names.length, 'every view-transition-name must be unique');
});
