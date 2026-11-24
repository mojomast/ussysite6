#!/usr/bin/env node
/**
 * Strict CSP, Sitemap/Robots, and Secret-Hygiene Auditor (`npm run lint`)
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));
const DIST_DIR = join(ROOT_DIR, 'dist');

const SECRET_PATTERNS = [
  { name: 'Google / Gemini API Key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'GitHub Classic Token', re: /\bghp_[0-9A-Za-z]{36}\b/ },
  { name: 'GitHub Fine-Grained PAT', re: /\bgithub_pat_[0-9A-Za-z_]{40,}\b/ },
  { name: 'OpenRouter API Key', re: /\bsk-or-v1-[0-9a-f]{48,}\b/ },
  { name: 'OpenAI / Generic sk- Key', re: /\bsk-(?:proj-)?[0-9A-Za-z]{32,}\b/ },
  { name: 'AWS Access Key ID', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'PEM Private Key', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Photo-to-Part Eval Canary', re: /p2p-canary-[0-9a-f-]+/i }
];

function collectFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full, ext));
    else if (entry.isFile() && full.endsWith(ext)) out.push(full);
  }
  return out;
}

let failures = 0;
function fail(msg) {
  console.error(`[lint-security] FAIL: ${msg}`);
  failures++;
}

// 1. Secret & Canary Hygiene across all Git-tracked files
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT_DIR, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean);

for (const rel of tracked) {
  if (rel === 'scripts/lint-security.mjs') continue;
  if (rel.endsWith('.png') || rel.endsWith('.webp') || rel.endsWith('.woff2')) continue;
  const abs = join(ROOT_DIR, rel);
  if (!existsSync(abs)) continue;
  const content = readFileSync(abs, 'utf8');
  for (const pat of SECRET_PATTERNS) {
    if (pat.re.test(content)) {
      fail(`${pat.name} pattern detected in tracked file: ${rel}`);
    }
  }
}

// 2. Strict CSP & SEO Audit on built `dist/` when present
if (existsSync(DIST_DIR)) {
  const htmlFiles = collectFiles(DIST_DIR, '.html');
  if (htmlFiles.length === 0) {
    fail('dist/ exists but contains zero HTML files');
  }

  for (const htmlFile of htmlFiles) {
    const html = readFileSync(htmlFile, 'utf8');
    const rel = htmlFile.slice(ROOT_DIR.length + 1);

    // Check for inline <style>
    if (/<style\b[^>]*>[\s\S]*?<\/style>/i.test(html)) {
      fail(`Inline <style> block found in ${rel} (violates strict style-src CSP)`);
    }

    // Check for inline style="..." attributes
    if (/\sstyle\s*=\s*["']/i.test(html)) {
      fail(`Inline style="..." attribute found in ${rel} (violates strict style-src CSP)`);
    }

    // Check for inline executable <script>
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = scriptRegex.exec(html)) !== null) {
      const attrs = m[1] || '';
      const body = (m[2] || '').trim();
      if (!/\bsrc\s*=/i.test(attrs) && body.length > 0) {
        const typeMatch = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i);
        const type = typeMatch ? typeMatch[1].toLowerCase() : '';
        if (type !== 'application/ld+json') {
          fail(`Inline executable <script> found in ${rel} (violates strict script-src CSP)`);
        }
      }
    }
  }

  if (!existsSync(join(DIST_DIR, 'robots.txt'))) {
    fail('Missing dist/robots.txt');
  }
  if (!existsSync(join(DIST_DIR, 'sitemap-index.xml'))) {
    fail('Missing dist/sitemap-index.xml');
  }
  if (!existsSync(join(DIST_DIR, 'rss.xml'))) {
    fail('Missing dist/rss.xml');
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`[lint-security] OK — ${tracked.length} tracked files gitleaks-clean, strict CSP & SEO artifacts verified.`);
