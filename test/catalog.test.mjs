import test from 'node:test';
import assert from 'node:assert/strict';
import { MAGAZINE_ISSUE_META, USSY_PROJECTS, getProjectById } from '../js/projects.js';

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

test('THE SLOP COMPUTING ANNUAL catalog contains all 11 canonical SLOPTIMUS PRIME repositories with editorial metadata & code listings', () => {
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
    assert.equal(getProjectById(proj.id)?.id, proj.id);
  }

  assert.equal(getProjectById('cocs')?.liveUrl, 'https://arena.ussyco.de');
  assert.equal(MAGAZINE_ISSUE_META.printModes.length, 3);
});
