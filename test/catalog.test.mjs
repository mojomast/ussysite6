import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadServerCatalog } from '../src/lib/server-catalog.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ISSUE_01_SLUGS = [
  'orbitdesktop',
  'velvetrp',
  'jammate',
  'cocs',
  'cocs-godot',
  'routetok',
  'rgbagentflightindicator',
  'mothbake',
  'warpi',
  'hermesdashboard',
  'becomussy'
];

const ISSUE_02_SLUGS = [
  'rizzstack',
  'bundlebees',
  'hyvv',
  'orbit-control-plane',
  'uirizz',
  'open-higgsfield-skills',
  'hermes-aircraft-doppler-geolocation',
  'eoh',
  'hermes-photo-to-part',
  'hermes-templeos',
  'jackpotsyndicate'
];

test('Living Edition catalog loads Issue 01 (archived) and Issue 02 (current) with 22 commit-pinned monographs', () => {
  const catalog = loadServerCatalog();
  assert.equal(catalog.issues.length, 2);
  assert.equal(catalog.currentIssue?.issueNumber, '02');
  assert.equal(catalog.currentIssue?.status, 'current');

  const issue01 = catalog.issues.find((i) => i.issueNumber === '01');
  assert.ok(issue01);
  assert.equal(issue01.status, 'archived');

  const arts01 = catalog.articles.filter((a) => a.issueNumber === '01').sort((a, b) => a.index - b.index);
  const arts02 = catalog.articles.filter((a) => a.issueNumber === '02').sort((a, b) => a.index - b.index);

  assert.deepEqual(
    arts01.map((a) => a.articleSlug),
    ISSUE_01_SLUGS
  );
  assert.deepEqual(
    arts02.map((a) => a.articleSlug),
    ISSUE_02_SLUGS
  );
  assert.deepEqual(
    arts01.map((a) => a.readerServiceNo),
    [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111]
  );
  assert.deepEqual(
    arts02.map((a) => a.readerServiceNo),
    [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211]
  );

  for (const art of catalog.articles) {
    assert.ok(art.headline && art.deck, `Missing headline/deck for ${art.articleSlug}`);
    assert.ok(art.body.length > 180, `Short editorial prose for ${art.articleSlug}`);
    assert.ok(art.repoUrl.startsWith('https://github.com/mojomast/'), `Invalid repoUrl for ${art.articleSlug}`);
    assert.match(art.sourceRevision, /^[0-9a-f]{40}$/, `Invalid 40-char SHA for ${art.articleSlug}`);
    assert.match(art.researchedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(art.sources.length >= 3, `Expected >= 3 sources for ${art.articleSlug}`);
    assert.match(art.codeExcerpt.sourceUrl, /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\/.+#L\d+/);

    for (const src of art.sources) {
      assert.ok(src.label.length > 4);
      assert.match(src.url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//);
    }
  }
});

test('Archived Issue 01 preserves all 13 Cycles Blender WebP assets and Python rebuild scripts', () => {
  const coverWebp = path.join(ROOT_DIR, 'public/assets/cover/machine-beneath-the-skin.webp');
  const tocWebp = path.join(ROOT_DIR, 'public/assets/editorial/contents/after-hours-proof-desk.webp');
  assert.ok(fs.existsSync(coverWebp) && fs.statSync(coverWebp).size > 20_000);
  assert.ok(fs.existsSync(tocWebp) && fs.statSync(tocWebp).size > 20_000);

  for (const id of ISSUE_01_SLUGS) {
    const publicDir = path.join(ROOT_DIR, 'public/assets/editorial', id);
    const webps = fs.readdirSync(publicDir).filter((f) => f.endsWith('.webp'));
    assert.equal(webps.length, 1, `Expected 1 WebP plate for ${id}`);
    assert.ok(fs.statSync(path.join(publicDir, webps[0])).size > 20_000);

    const srcDir = path.join(ROOT_DIR, 'assets/editorial', id);
    assert.ok(fs.existsSync(path.join(srcDir, 'render-scene.py')), `Missing render-scene.py for ${id}`);
  }
});

test('Interactive step-through studies are configured for both Issue 01 classics and Issue 02 monographs', () => {
  const catalog = loadServerCatalog();
  const studyArticles = catalog.articles.filter((a) => a.secondaryMedia?.kind === 'svg-study');
  const issue01Studies = studyArticles.filter((a) => a.issueNumber === '01');
  const issue02Studies = studyArticles.filter((a) => a.issueNumber === '02');
  assert.equal(issue01Studies.length, 5);
  assert.equal(issue02Studies.length, 5);
});
