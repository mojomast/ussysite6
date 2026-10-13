import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server.mjs';

async function withServer(fn) {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /api/health returns THE USSY COMPUTING ANNUAL metadata and all 11 article IDs & Reader Service numbers', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.version, '6.0.0');
    assert.equal(data.publication, 'THE USSY COMPUTING ANNUAL');
    assert.equal(data.articles, 11);
    assert.equal(data.articleIds.length, 11);
    assert.deepEqual(data.readerServiceNos, [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111]);
  });
});

test('GET and POST /api/press/state persist Reader Service Bingo Card numbers and print mode', async () => {
  await withServer(async (baseUrl) => {
    const postRes = await fetch(`${baseUrl}/api/press/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: {
          printMode: 'blueprint',
          circledServiceNos: [101, 103, 106, 111],
          readerNotes: [{ id: 'n1', text: 'Love the RouteTok relay schematic' }]
        }
      })
    });
    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.ok, true);
    assert.equal(postData.state.printMode, 'blueprint');
    assert.deepEqual(postData.state.circledServiceNos, [101, 103, 106, 111]);
    assert.equal(postData.state.readerNotes.length, 1);
  });
});

test('Static file allowlist serves index.html and denies server.mjs and dotfiles', async () => {
  await withServer(async (baseUrl) => {
    const indexRes = await fetch(`${baseUrl}/`);
    assert.equal(indexRes.status, 200);
    const html = await indexRes.text();
    assert.ok(html.includes('THE USSY COMPUTING ANNUAL'));

    const deniedServer = await fetch(`${baseUrl}/server.mjs`);
    assert.equal(deniedServer.status, 404);

    const deniedEnv = await fetch(`${baseUrl}/.env`);
    assert.equal(deniedEnv.status, 404);
  });
});
