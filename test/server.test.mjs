import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server.mjs';

async function withServer(envOverrides, fn) {
  if (typeof envOverrides === 'function') {
    fn = envOverrides;
    envOverrides = {};
  }
  const server = createAppServer({
    dbPath: ':memory:',
    env: { ...process.env, FEATURE_ASK_EDITOR: 'false', GEMINI_API_KEY: '', ...envOverrides }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /api/health returns Living Edition metadata, Issue 02 + Issue 01 summary, and SQLite WAL status', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'slop-illustrated-living-edition');
    assert.equal(data.version, '7.0.0');
    assert.equal(data.currentIssue, '02');
    assert.equal(data.digitalFolios, 14);
    assert.equal(data.articles, 11);
    assert.equal(data.totalArticles, 22);
    assert.equal(data.database.engine, 'sqlite-drizzle-wal');
    assert.equal(data.database.connected, true);
    assert.deepEqual(data.readerServiceNos, [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211]);
  });
});

test('SQLite /api/press/state isolates per-reader bookmarks while aggregating community counts', async () => {
  await withServer(async (baseUrl) => {
    const alicePost = await fetch(`${baseUrl}/api/press/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reader-Id': 'rdr_alice_test01'
      },
      body: JSON.stringify({
        state: {
          printMode: 'rag',
          circledServiceNos: [201, 207, 101]
        }
      })
    });
    assert.equal(alicePost.status, 200);

    const bobPost = await fetch(`${baseUrl}/api/press/state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reader-Id': 'rdr_bob_test02'
      },
      body: JSON.stringify({
        state: {
          printMode: 'oxide',
          circledServiceNos: [201, 210]
        }
      })
    });
    assert.equal(bobPost.status, 200);

    // Verify Alice's list was NOT overwritten by Bob
    const aliceGet = await fetch(`${baseUrl}/api/press/state`, {
      headers: { 'X-Reader-Id': 'rdr_alice_test01' }
    });
    const aliceData = await aliceGet.json();
    assert.equal(aliceData.state.printMode, 'rag');
    assert.deepEqual(aliceData.state.circledServiceNos, [101, 201, 207]);
    assert.equal(aliceData.community.totalReaders, 2);
    assert.equal(aliceData.community.saveCountsByServiceNo['201'], 2);
    assert.equal(aliceData.community.saveCountsByServiceNo['207'], 1);
  });
});

test('POST /api/source-room/dispatch sanitizes margin notes, enforces same-origin, and Ask-the-Editor stub cites real repos', async () => {
  await withServer(async (baseUrl) => {
    const crossOrigin = await fetch(`${baseUrl}/api/source-room/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.example'
      },
      body: JSON.stringify({ text: 'spoof' })
    });
    assert.equal(crossOrigin.status, 403);

    const validDispatch = await fetch(`${baseUrl}/api/source-room/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reader-Id': 'rdr_alice_test01'
      },
      body: JSON.stringify({
        issueNumber: '02',
        articleSlug: 'hermes-photo-to-part',
        text: 'gear_steer.py <script>blocking</script> 40 turns of trochoids is hilarious'
      })
    });
    assert.equal(validDispatch.status, 200);
    const dJson = await validDispatch.json();
    assert.equal(dJson.ok, true);
    assert.ok(!dJson.dispatch.text.includes('<'));
    assert.equal(dJson.community.recentDispatches.length, 1);

    const askRes = await fetch(`${baseUrl}/api/editor/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Why did photo-to-part build gear_steer.py?',
        history: [{ role: 'user', text: 'Tell me about Issue 02 CAD tools' }]
      })
    });
    assert.equal(askRes.status, 200);
    const askJson = await askRes.json();
    assert.equal(askJson.ok, true);
    assert.equal(askJson.stub, true);
    assert.equal(askJson.model, 'gemini-3.5-flash-lite');
    assert.ok(askJson.citations.some((c) => c.href.includes('hermes-photo-to-part')));

    const editorStatus = await fetch(`${baseUrl}/api/editor/status`);
    assert.equal(editorStatus.status, 200);
    const editorStatusJson = await editorStatus.json();
    assert.equal(editorStatusJson.model, 'gemini-3.5-flash-lite');
    assert.equal(editorStatusJson.supportsMultiTurn, true);

    const illusStub = await fetch(`${baseUrl}/api/illustrations/status`);
    assert.equal(illusStub.status, 200);
    const audioStub = await fetch(`${baseUrl}/api/audio/status`);
    assert.equal(audioStub.status, 200);
    const audioJson = await audioStub.json();
    assert.equal(audioJson.model, 'gemini-3.8-flash-lite-tts');
    assert.equal(audioJson.cachedTracks, 0);

    const audioPost = await fetch(`${baseUrl}/api/audio/edition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueNumber: '02', articleSlug: 'rizzstack' })
    });
    assert.equal(audioPost.status, 501);
  });
});

test('Static Astro routes enforce strict CSP without unsafe-inline and block server source / dotfiles', async () => {
  await withServer(async (baseUrl) => {
    const homeRes = await fetch(`${baseUrl}/`);
    assert.equal(homeRes.status, 200);
    const csp = homeRes.headers.get('content-security-policy') || '';
    assert.ok(csp.includes("script-src 'self'"), 'Expected strict script-src self');
    assert.ok(!csp.includes('unsafe-inline'), 'CSP must not include unsafe-inline');
    assert.ok(!csp.includes('unsafe-eval'), 'CSP must not include unsafe-eval');

    const homeHtml = await homeRes.text();
    assert.ok(homeHtml.includes('Slop Illustrated'));

    const issue02Res = await fetch(`${baseUrl}/issues/02`);
    assert.equal(issue02Res.status, 200);

    const issue01Res = await fetch(`${baseUrl}/issues/01`);
    assert.equal(issue01Res.status, 200);

    const articleRes = await fetch(`${baseUrl}/issues/02/rizzstack`);
    assert.equal(articleRes.status, 200);

    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    assert.equal(robotsRes.status, 200);

    const sitemapRes = await fetch(`${baseUrl}/sitemap-index.xml`);
    assert.equal(sitemapRes.status, 200);

    const rssRes = await fetch(`${baseUrl}/rss.xml`);
    assert.equal(rssRes.status, 200);
    assert.ok((rssRes.headers.get('content-type') || '').includes('rss+xml'));
    const rssXml = await rssRes.text();
    assert.ok(rssXml.includes('<rss version="2.0"'));
    assert.ok(rssXml.includes('Rizzstack'));
    assert.ok(rssXml.includes('OrbitDesktop'));

    const deniedServer = await fetch(`${baseUrl}/server.mjs`);
    assert.equal(deniedServer.status, 404);

    const deniedEnv = await fetch(`${baseUrl}/.env`);
    assert.equal(deniedEnv.status, 404);
  });
});
