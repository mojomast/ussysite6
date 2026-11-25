import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadServerCatalog } from '../src/lib/server-catalog.ts';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BANNED = [
  /\bdelve/i,
  /\btapestry\b/i,
  /\btestament to\b/i,
  /\bseamless/i,
  /\bleverag(e|ing)\b/i,
  /\bunlock(s|ed|ing)?\b/i,
  /\belevate/i,
  /game[- ]chang/i,
  /cutting[- ]edge/i,
  /bleeding[- ]edge/i,
  /in today[’']s/i,
  /fast[- ]paced/i,
  /state[- ]of[- ]the[- ]art/i,
  /world[- ]class/i,
  /\brobust\b(?! (mad|z))/i,
  /\bempower/i,
  /\brevolutioni[sz]e/i
];

function visibleCopyFiles() {
  const roots = ['src/content', 'src/pages', 'src/components', 'src/lib/folio.ts'];
  const out = [];
  const walk = (p) => {
    const abs = path.join(ROOT_DIR, p);
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      for (const child of fs.readdirSync(abs)) walk(path.join(p, child));
    } else if (/\.(md|mdx|astro|svelte|ts)$/.test(p)) {
      out.push(p);
    }
  };
  roots.forEach(walk);
  return out;
}

test('Every pull quote is pulled: it appears verbatim in its own article', () => {
  const { articles } = loadServerCatalog();
  for (const art of articles) {
    const body = art.body.replace(/\s+/g, ' ').toLowerCase();
    const quote = art.pullQuote.replace(/\s+/g, ' ').toLowerCase();
    assert.ok(body.includes(quote), `Pull quote for ${art.issueNumber}/${art.articleSlug} is not in its body`);
  }
});

test('Visitor-facing copy avoids the house list of slop phrases', () => {
  for (const rel of visibleCopyFiles()) {
    const text = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    for (const re of BANNED) {
      assert.ok(!re.test(text), `${rel} uses banned phrasing ${re}`);
    }
  }
});

test('Both issues carry a last page, and Issue 02 carries its cold open and corrections', () => {
  const { issues } = loadServerCatalog();
  for (const iss of issues) {
    assert.ok(iss.lastPage?.headline, `Issue ${iss.issueNumber} has no last page`);
  }
  const two = issues.find((i) => i.issueNumber === '02');
  assert.ok(two.coldOpen.length >= 6);
  assert.ok(two.corrections.length >= 3);
});
