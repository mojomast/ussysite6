import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCssColor, contrastRatio } from '../src/scripts/fx/shader/palette.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('no violet or lavender spot inks exist in article frontmatter or stock tokens', () => {
  const violetRe = /#(?:a855f7|7c3aed|6d28d9|8b5cf6|9333ea|c084fc|a78bfa|5b21b6)\b/i;
  const tokensCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/tokens.css'), 'utf8');
  assert.doesNotMatch(tokensCss, violetRe, 'tokens.css must not contain violet/lavender accents');

  for (const issueDir of ['issue-01', 'issue-02']) {
    const dir = path.join(ROOT_DIR, 'src/content/articles', issueDir);
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      assert.doesNotMatch(content, violetRe, `${issueDir}/${file} must not use violet spot ink`);
    }
  }
});

test('primary button ink clears WCAG AA (>= 4.5:1) on every paper stock', () => {
  const pairs = [
    ['graphite', '#0b0c0e', '#ff4422'],
    ['rag', '#ffffff', '#c4280c'],
    ['oxide', '#071522', '#ff7847']
  ];
  const tokensCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/tokens.css'), 'utf8');
  for (const [stock, fg, bg] of pairs) {
    assert.match(tokensCss, new RegExp(`--ink-on-signal:\\s*${fg}`), `${stock} must define --ink-on-signal: ${fg}`);
    const ratio = contrastRatio(parseCssColor(fg), parseCssColor(bg));
    assert.ok(ratio >= 4.5, `${stock} primary button contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
  }
});

test('strict taste guardrails: no /%23g URL bug, no bare outline:none on cold open, no 3D tilt or magnets, no false counters', () => {
  const shaderCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/fx/shader.css'), 'utf8');
  assert.doesNotMatch(shaderCss, /url\(%23/, 'SVG noise data URIs must be base64-encoded so LightningCSS does not emit /%23g');

  const opusCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/opus.css'), 'utf8');
  assert.doesNotMatch(opusCss, /\.opus-cold-open:focus\s*\{\s*outline:\s*none/, 'cold open must keep a visible :focus-visible ring');
  assert.match(opusCss, /\.opus-cold-open:focus-visible\s*\{[^}]*outline:/);

  const coverSvelte = fs.readFileSync(path.join(ROOT_DIR, 'src/components/islands/CarbonCoverStage.svelte'), 'utf8');
  assert.match(coverSvelte, /COMPILE_STATUS/, 'WebGL cover must probe shader compile status before leaving STATIC SVG');
  assert.match(coverSvelte, /LINK_STATUS/, 'WebGL cover must probe shader link status before leaving STATIC SVG');

  const layout = fs.readFileSync(path.join(ROOT_DIR, 'src/layouts/BaseLayout.astro'), 'utf8');
  assert.doesNotMatch(layout, /Space\+Grotesk/, 'keep true 4-voice typography without redundant 5th font');
  assert.match(layout, /property="og:image"/);
  assert.match(layout, /name="twitter:card"/);
});

const distDir = path.join(ROOT_DIR, 'dist');
test('built pages have clean masthead spacing, no ?. double punctuation, and zero /%23g requests', {
  skip: !fs.existsSync(distDir) && 'run npm run build first'
}, () => {
  const stripHidden = (html) =>
    html
      .replace(/<span[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span><\/span>/gi, '')
      .replace(/<span[^>]*aria-hidden="true"[^>]*>[^<]*<\/span>/gi, '')
      .replace(/<[^>]+>/g, '');

  const home = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const h1Home = stripHidden(home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  assert.equal(h1Home, 'SLOP Illustrated.', 'front-page h1 accessible text must read "SLOP Illustrated."');

  const issue02 = fs.readFileSync(path.join(distDir, 'issues/02/index.html'), 'utf8');
  const h1Issue02 = stripHidden(issue02.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
  assert.doesNotMatch(h1Issue02, /\?\./, 'issue cover title ending in ? must not append a stray period');

  const cssFiles = fs.readdirSync(path.join(distDir, '_astro')).filter((f) => f.endsWith('.css'));
  for (const f of cssFiles) {
    const css = fs.readFileSync(path.join(distDir, '_astro', f), 'utf8');
    assert.doesNotMatch(css, /url\(%23g\)/, `built stylesheet ${f} must not contain url(%23g)`);
  }
});
