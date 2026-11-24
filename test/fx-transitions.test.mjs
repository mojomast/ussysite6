import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bootSrc = fs.readFileSync(path.join(ROOT_DIR, 'public/motion-boot.js'), 'utf8');
const cssSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/fx/transitions.css'), 'utf8');
const tsSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/scripts/fx/transitions.ts'), 'utf8');
const vtNamesTs = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/vt-names.css.ts'), 'utf8');

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

function runBootHarness({
  url = 'https://mojomast.github.io/ussysite6/',
  scriptSrc = 'https://mojomast.github.io/ussysite6/motion-boot.js',
  finePointer = true,
  deviceMemory = 8,
  hardwareConcurrency = 8,
  saveData = false,
  dataset = {},
  activation = null,
  storageInit = {}
} = {}) {
  const storage = new Map(Object.entries(storageInit));
  const classSet = new Set();
  const appended = [];
  const listeners = new Map();
  const addListener = (target) => (type, fn) => {
    const key = `${target}:${type}`;
    const list = listeners.get(key) || [];
    list.push(fn);
    listeners.set(key, list);
  };

  const docEl = {
    dataset: { ...dataset },
    classList: {
      add: (...cs) => cs.forEach((c) => classSet.add(c)),
      remove: (...cs) => cs.forEach((c) => classSet.delete(c)),
      contains: (c) => classSet.has(c)
    }
  };

  const body = {
    appendChild(el) {
      appended.push(el);
      return el;
    }
  };

  const parsed = new URL(url);
  const ctx = {
    URL,
    location: { href: parsed.href, pathname: parsed.pathname },
    navigator: { deviceMemory, hardwareConcurrency, connection: { saveData } },
    matchMedia: (q) => ({ matches: q.includes('pointer:fine') || q.includes('pointer: fine') ? finePointer : false }),
    sessionStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k)
    },
    navigation: activation ? { activation } : undefined,
    document: {
      documentElement: docEl,
      currentScript: { src: scriptSrc },
      body,
      addEventListener: addListener('doc'),
      createElement(tag) {
        const attrs = new Map();
        const node = {
          tag,
          className: '',
          removed: false,
          setAttribute: (k, v) => attrs.set(k, String(v)),
          getAttribute: (k) => attrs.get(k) ?? null,
          remove() {
            this.removed = true;
          }
        };
        return node;
      }
    },
    window: null
  };
  ctx.window = ctx;
  ctx.addEventListener = addListener('win');

  vm.runInNewContext(bootSrc, ctx);

  const emit = (target, type, evt) => {
    for (const fn of listeners.get(`${target}:${type}`) || []) fn(evt);
  };

  return { ctx, docEl, classSet, appended, storage, emit };
}

test('motion-boot.js stays strictly under 2 KB and classifies all route types with or without /ussysite6 base', async () => {
  assert.ok(Buffer.byteLength(bootSrc) < 2048, `motion-boot.js is ${Buffer.byteLength(bootSrc)} B, must be < 2048 B`);

  const cases = [
    ['https://ussy.host/', 'https://ussy.host/motion-boot.js', 'fold'],
    ['https://mojomast.github.io/ussysite6/', 'https://mojomast.github.io/ussysite6/motion-boot.js', 'fold'],
    ['https://mojomast.github.io/ussysite6', 'https://mojomast.github.io/ussysite6/motion-boot.js', 'fold'],
    ['https://mojomast.github.io/ussysite6/issues/02/', 'https://mojomast.github.io/ussysite6/motion-boot.js', 'ink-wipe'],
    ['https://ussy.host/issues/01', 'https://ussy.host/motion-boot.js', 'ink-wipe'],
    ['https://mojomast.github.io/ussysite6/issues/02/rizzstack/', 'https://mojomast.github.io/ussysite6/motion-boot.js', 'press'],
    ['https://ussy.host/issues/01/cocs', 'https://ussy.host/motion-boot.js', 'press'],
    ['https://mojomast.github.io/ussysite6/issues/02/last-page/', 'https://mojomast.github.io/ussysite6/motion-boot.js', 'dusk'],
    ['https://ussy.host/issues/01/last-page', 'https://ussy.host/motion-boot.js', 'dusk'],
    ['https://mojomast.github.io/ussysite6/issues/', 'https://mojomast.github.io/ussysite6/motion-boot.js', ''],
    ['https://mojomast.github.io/ussysite6/about/', 'https://mojomast.github.io/ussysite6/motion-boot.js', ''],
    ['https://mojomast.github.io/ussysite6/source-room/', 'https://mojomast.github.io/ussysite6/motion-boot.js', '']
  ];

  for (const [destUrl, scriptSrc, expectedRoute] of cases) {
    let resolveFinished;
    const finished = new Promise((r) => (resolveFinished = r));
    const types = new Set();
    const h = runBootHarness({
      url: destUrl,
      scriptSrc,
      activation: { from: { index: 1 }, entry: { index: 2, url: destUrl } }
    });
    h.emit('win', 'pagereveal', { viewTransition: { types, finished } });
    const expected = expectedRoute ? ['forward', expectedRoute] : ['forward'];
    assert.deepEqual([...types], expected, `route ${destUrl} should set ${expected.join(', ')}`);
    assert.ok(h.classSet.has('is-vt-arrival'), 'is-vt-arrival must be preserved');
    assert.ok(h.classSet.has('is-vt-active'), 'is-vt-active must be active during transition');
    assert.ok(
      h.appended.some((el) => el.className === 'fx-vt-reg' && el.getAttribute('aria-hidden') === 'true'),
      'full tier must mount aria-hidden registration overlay'
    );
    resolveFinished();
    await finished;
    await Promise.resolve();
    assert.equal(h.classSet.has('is-vt-active'), false, 'is-vt-active must clear after finished');
    assert.ok(h.appended.every((el) => el.removed), 'all decorative props must be removed after finished');
  }
});

test('motion-boot.js handles backward navigation, lite tier overlay removal, max-rizz persistence, and null viewTransition', async () => {
  // Backward via navigation.activation index
  const backTypes = new Set();
  const hBack = runBootHarness({
    url: 'https://mojomast.github.io/ussysite6/issues/02/',
    activation: { from: { index: 4 }, entry: { index: 3, url: 'https://mojomast.github.io/ussysite6/issues/02/' } }
  });
  hBack.emit('win', 'pagereveal', { viewTransition: { types: backTypes, finished: Promise.resolve() } });
  assert.deepEqual([...backTypes], ['backward', 'ink-wipe']);

  // Lite tier (touch / coarse pointer): keeps route type, drops registration overlay & scanline
  const liteTypes = new Set();
  const hLite = runBootHarness({
    url: 'https://mojomast.github.io/ussysite6/issues/02/rizzstack/',
    finePointer: false,
    dataset: { rizz: 'max' },
    activation: { from: { index: 0 }, entry: { index: 1, url: 'https://mojomast.github.io/ussysite6/issues/02/rizzstack/' } }
  });
  hLite.emit('win', 'pagereveal', { viewTransition: { types: liteTypes, finished: Promise.resolve() } });
  assert.deepEqual([...liteTypes], ['forward', 'press']);
  assert.equal(hLite.appended.some((el) => el.className === 'fx-vt-reg'), false, 'lite tier drops reg overlay');
  assert.equal(hLite.appended.some((el) => el.className === 'fx-vt-sc'), false, 'lite tier drops scanline');
  assert.ok(hLite.appended.some((el) => el.className === 'fx-vt-pt'), 'lite tier keeps press platen');

  // Max rizz bridges across pageswap -> pagereveal and mounts neon scanline on full tier
  const hMaxOut = runBootHarness({ dataset: { rizz: 'max' } });
  hMaxOut.emit('win', 'pageswap', {});
  assert.equal(hMaxOut.storage.get('si.vt.r'), 'max');
  const maxTypes = new Set();
  const hMaxIn = runBootHarness({
    url: 'https://mojomast.github.io/ussysite6/issues/02/uirizz/',
    storageInit: { 'si.vt.r': 'max' }
  });
  hMaxIn.emit('win', 'pagereveal', { viewTransition: { types: maxTypes, finished: Promise.resolve() } });
  assert.equal(hMaxIn.docEl.dataset.rizz, 'max');
  assert.ok(hMaxIn.appended.some((el) => el.className === 'fx-vt-sc' && el.getAttribute('aria-hidden') === 'true'));

  // Reduced motion (e.viewTransition === null): complete no-op
  const hOff = runBootHarness();
  hOff.emit('win', 'pagereveal', { viewTransition: null });
  assert.equal(hOff.appended.length, 0);
  assert.equal(hOff.classSet.size, 0);
});

test('transitions.css keyframes only animate compositor-friendly properties and never filter full-viewport layers', () => {
  const allowed = new Set([
    'transform',
    'opacity',
    'clip-path',
    'mask-position',
    '-webkit-mask-position',
    'filter',
    'animation-timing-function'
  ]);
  const frames = keyframeBlocks(cssSrc);
  assert.ok(frames.length >= 20, `expected rich transition keyframes, found ${frames.length}`);

  const fullViewportPrefix = /^fx-(press|platen|ink|fold|dusk|reg|scanline)-/;
  for (const { name, body } of frames) {
    for (const [, prop] of body.matchAll(/([a-z-]+)\s*:/g)) {
      assert.ok(allowed.has(prop), `@keyframes ${name} animates disallowed property "${prop}"`);
      if (fullViewportPrefix.test(name)) {
        assert.notEqual(prop, 'filter', `full-viewport @keyframes ${name} must never use filter`);
      }
    }
  }
});

test('transitions.css gates view transitions on prefers-reduced-motion: no-preference and keeps durations <= 900ms', () => {
  const firstVT = cssSrc.indexOf('::view-transition');
  const gateIdx = cssSrc.indexOf('@media (prefers-reduced-motion: no-preference)');
  assert.ok(gateIdx >= 0 && gateIdx < firstVT, 'all ::view-transition rules must sit inside prefers-reduced-motion: no-preference');

  for (const token of [
    ':active-view-transition-type(press)',
    ':active-view-transition-type(ink-wipe)',
    ':active-view-transition-type(fold)',
    ':active-view-transition-type(dusk)',
    ':active-view-transition-type(backward)',
    ':active-view-transition-type(dialog-unfold)',
    ':active-view-transition-type(study-slide)',
    "html[data-rizz='max']",
    "html[data-fx='lite']",
    '*.mo-brand',
    '*.mo-chip',
    '*.mo-stamp'
  ]) {
    assert.ok(cssSrc.includes(token), `transitions.css should include rule for ${token}`);
  }

  for (const m of cssSrc.matchAll(/(\d+)ms/g)) {
    const ms = Number(m[1]);
    assert.ok(ms <= 900, `transition duration ${ms}ms exceeds 900ms budget`);
  }
});

test('vt-names.css.ts includes masthead, folio/issue chips, and read stamps with unique names', () => {
  for (const expected of ['si-badge', 'si-brand-title', 'si-issue-chip', 'si-read-stamp', 'mo-brand', 'mo-chip', 'mo-stamp']) {
    assert.ok(vtNamesTs.includes(expected), `vt-names.css.ts should generate ${expected}`);
  }
  const built = path.join(ROOT_DIR, 'dist/vt-names.css');
  if (fs.existsSync(built)) {
    const css = fs.readFileSync(built, 'utf8');
    const names = [...css.matchAll(/view-transition-name:\s*([\w-]+)/g)].map((m) => m[1]);
    assert.ok(names.length >= 100, `expected expanded shared-element names, found ${names.length}`);
    assert.equal(new Set(names).size, names.length, 'every generated view-transition-name must be unique');
  }
});

test('transitions.ts obeys strict CSP and gates same-document transitions on fxTier', () => {
  assert.doesNotMatch(tsSrc, /\.style\b|setAttribute\(\s*['"]style['"]/, 'transitions.ts must never touch inline styles');
  assert.match(tsSrc, /fxTier|onTier/);
  assert.match(tsSrc, /dialog-unfold/);
  assert.match(tsSrc, /study-slide/);
});
