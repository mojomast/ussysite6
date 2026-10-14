import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAGAZINE_ISSUE_META, USSY_PROJECTS, getProjectById } from '../js/projects.js';
import { loadPlate } from '../js/plates/index.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CANONICAL_IDS = [
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

test('SLOP ILLUSTRATED catalog contains all 11 canonical SLOPTIMUS PRIME repositories with editorial metadata & code listings', () => {
  assert.equal(USSY_PROJECTS.length, 11);
  assert.deepEqual(
    USSY_PROJECTS.map((p) => p.id),
    CANONICAL_IDS
  );

  for (const proj of USSY_PROJECTS) {
    assert.ok(proj.headline && proj.deck, `Missing headline/deck for ${proj.id}`);
    assert.ok(proj.editorialLead && proj.editorialLead.length > 60, `Missing editorialLead for ${proj.id}`);
    assert.ok(proj.codeListing && proj.codeListing.length > 30, `Missing codeListing for ${proj.id}`);
    assert.ok(proj.readerServiceNo >= 101 && proj.readerServiceNo <= 111, `Invalid readerServiceNo for ${proj.id}`);
    assert.ok(proj.repoUrl.startsWith('https://github.com/mojomast/'), `Invalid repoUrl for ${proj.id}`);
    assert.match(proj.sourceRevision, /^[0-9a-f]{40}$/, `Missing pinned revision for ${proj.id}`);
    assert.match(proj.researchedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(proj.sources.length >= 3, `Missing supporting references for ${proj.id}`);
    for (const source of [...proj.sources, proj.codeSource]) {
      assert.ok(source.label, `Missing source label for ${proj.id}`);
      assert.match(source.url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//, `Unpinned source for ${proj.id}`);
      if (source.url.startsWith(`${proj.repoUrl}/`)) {
        assert.ok(source.url.includes(`/blob/${proj.sourceRevision}/`), `Mismatched source revision for ${proj.id}`);
      }
    }
    assert.match(proj.codeSource.url, /#L\d+(?:-L\d+)?$/);
    assert.equal(proj.pageRange, undefined, `Physical pagination returned for ${proj.id}`);
    assert.equal(getProjectById(proj.id)?.id, proj.id);
  }

  assert.equal(getProjectById('cocs')?.liveUrl, 'https://arena.ussyco.de');
  assert.equal(MAGAZINE_ISSUE_META.printModes.length, 3);
});

test('All 11 feature spreads and the TOC mount rendered 1600x1200 Blender WebP plates with scene scripts', async () => {
  for (const id of ['toc', ...CANONICAL_IDS]) {
    const proj = getProjectById(id) || { id };
    const plate = await loadPlate(id, proj);
    assert.ok(plate && plate.title, `Missing plate descriptor for ${id}`);
    assert.ok(plate.medium && plate.medium.includes('BLENDER'), `Expected Blender medium for ${id}`);
    assert.ok(plate.image && plate.image.src.endsWith('.webp'), `Expected .webp image for ${id}`);
    assert.equal(plate.image.width, 1600, `Expected width 1600 for ${id}`);
    assert.equal(plate.image.height, 1200, `Expected height 1200 for ${id}`);
    assert.ok(plate.image.alt && plate.image.alt.length > 60, `Expected descriptive alt text for ${id}`);

    const webpPath = path.resolve(ROOT_DIR, plate.image.src);
    assert.ok(fs.existsSync(webpPath), `Missing WebP file on disk for ${id}: ${webpPath}`);
    assert.ok(fs.statSync(webpPath).size > 20_000, `Unexpectedly small WebP file for ${id}`);

    const assetDir = path.dirname(webpPath);
    assert.ok(fs.existsSync(path.join(assetDir, 'render-scene.py')), `Missing render-scene.py in ${assetDir}`);
    assert.ok(fs.existsSync(path.join(assetDir, 'README.md')), `Missing README.md in ${assetDir}`);
  }
});
