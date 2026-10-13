import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = (await readdir(root, { recursive: true }))
  .filter((file) => !file.split('/').some((part) => part.startsWith('.') || part === 'node_modules'))
  .filter((file) => /\.(?:mjs|js)$/.test(file));

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Syntax checked ${files.length} JavaScript modules.`);
