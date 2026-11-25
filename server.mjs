/**
 * USSYSITE6 // SLOP ILLUSTRATED (Si.) — LIVING EDITION
 * Hono + Node.js + Drizzle + SQLite Server Entrypoint
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAdaptorServer } from '@hono/node-server';
import { createLivingApp } from './src/server/app.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const envPath = join(rootDir, '.env');

function loadLocalEnv() {
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadLocalEnv();

export function createAppServer(options = {}) {
  const living = createLivingApp(options);
  const server = createAdaptorServer({
    fetch: living.app.fetch
  });
  server.on('close', () => {
    try {
      living.close();
    } catch {
      // Ignore already-closed database
    }
  });
  return server;
}

const isMainEntry =
  process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (isMainEntry) {
  const port = Number(process.env.PORT || 3016);
  const host = process.env.HOST || '127.0.0.1';
  const server = createAppServer();
  server.listen(port, host, () => {
    console.log(`[ussysite6] SLOP ILLUSTRATED Living Edition listening on http://${host}:${port}`);
  });
}
