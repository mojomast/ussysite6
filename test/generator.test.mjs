import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { generateIssueDraft } from '../scripts/issue-draft.mjs';
import { loadServerCatalog } from '../src/lib/server-catalog.ts';

test('issue:draft generator degrades gracefully without GEMINI_API_KEY and writes valid Content Collection Markdown', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'si-draft-test-'));
  const fixturePath = path.join(tmpDir, 'fixture.json');
  const outDir = path.join(tmpDir, 'out');

  const sampleFixture = [
    {
      name: 'hermagotchi',
      repoUrl: 'https://github.com/mojomast/hermagotchi',
      description: 'Hermagotchi — Hermes multiplayer agent-pet plugin',
      language: 'Python',
      stars: 2,
      pushedAt: '2026-11-10',
      latestRelease: 'v0.1.0',
      headSha: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4',
      headMessage: 'feat: deterministic pet hunger tick',
      readmeParagraphs: [
        'Hermagotchi puts a multiplayer virtual pet inside a Hermes pane so agents and humans can co-parent a pixel creature.',
        'Pairing stays strictly pane-local; model-supplied tokens are rejected at the tool boundary.'
      ],
      sampleFile: 'pet/tick.py',
      sampleCode: 'def step_hunger(level: int) -> int:\n    return max(0, level - 1)',
      sampleEndLine: 2,
      sourcePaths: ['README.md', 'pet/tick.py', 'CHANGELOG.md']
    }
  ];

  fs.writeFileSync(fixturePath, JSON.stringify(sampleFixture), 'utf8');

  const prevKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const result = await generateIssueDraft({
      issue: '03',
      fixture: fixturePath,
      outDir
    });

    assert.equal(result.issueNumber, '03');
    assert.equal(result.mode, 'deterministic-fallback');
    assert.equal(result.articles.length, 1);
    assert.equal(result.articles[0].slug, 'hermagotchi');

    const loaded = loadServerCatalog(outDir);
    assert.equal(loaded.issues.length, 1);
    assert.equal(loaded.issues[0].issueNumber, '03');
    assert.equal(loaded.issues[0].status, 'draft');
    assert.equal(loaded.articles.length, 1);
    assert.equal(loaded.articles[0].readerServiceNo, 301);
    assert.equal(loaded.articles[0].sourceRevision, 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4');
  } finally {
    if (prevKey !== undefined) process.env.GEMINI_API_KEY = prevKey;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
