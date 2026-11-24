#!/usr/bin/env node
/**
 * SLOP ILLUSTRATED (Si.) — AUTOMATED ISSUE GENERATOR (`npm run issue:draft`)
 *
 * Pulls real public GitHub activity from `mojomast` repositories (commits, releases,
 * READMEs, and source files) via GitHub REST API (or `gh api` / offline `--fixture`),
 * optionally polishes headlines/copy with Gemini via `GEMINI_API_KEY`, and degrades
 * gracefully to deterministic source-pinned Markdown frontmatter when no key is set.
 *
 * Usage:
 *   npm run issue:draft
 *   npm run issue:draft -- --issue 03 --limit 4 --since 2026-10-15 --out ./drafts/issue-03
 *   npm run issue:draft -- --fixture ./test/fixtures/github-sample.json --out /tmp/test-draft
 *   npm run issue:draft -- --apply   # writes directly into src/content/ for a new issue PR
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify as stringifyYaml } from 'yaml';
import { loadServerCatalog } from '../src/lib/server-catalog.ts';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));

const PALETTE = [
  ['#ff4422', '#3ddc97'],
  ['#38bdf8', '#f5a623'],
  ['#a855f7', '#3ddc97'],
  ['#f5a623', '#38bdf8'],
  ['#10b981', '#ff4422'],
  ['#ef4444', '#eab308']
];

const CHORDS = [
  [261.63, 329.63, 392.0, 523.25],
  [293.66, 369.99, 440.0, 587.33],
  [246.94, 311.13, 369.99, 493.88],
  [277.18, 349.23, 415.3, 554.37]
];

export function parseArgs(argv = process.argv.slice(2)) {
  const opts = {
    owner: process.env.GITHUB_OWNER || 'mojomast',
    issue: '',
    since: '',
    limit: 5,
    outDir: '',
    apply: false,
    dryRun: false,
    fixture: ''
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--owner' && argv[i + 1]) opts.owner = argv[++i];
    else if (arg === '--issue' && argv[i + 1]) opts.issue = argv[++i];
    else if (arg === '--since' && argv[i + 1]) opts.since = argv[++i];
    else if (arg === '--limit' && argv[i + 1]) opts.limit = Math.max(1, Math.min(12, Number(argv[++i]) || 5));
    else if (arg === '--out' && argv[i + 1]) opts.outDir = argv[++i];
    else if (arg === '--fixture' && argv[i + 1]) opts.fixture = argv[++i];
    else if (arg === '--apply') opts.apply = true;
    else if (arg === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

async function fetchGithubJson(endpointPath) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'slop-illustrated-issue-generator/7.0'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/${endpointPath.replace(/^\//, '')}`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to authenticated `gh api` CLI when available
  }

  const raw = execFileSync('gh', ['api', endpointPath.replace(/^\//, '')], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return JSON.parse(raw);
}

function cleanMarkdownSummary(readmeText) {
  const lines = String(readmeText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('#') &&
        !l.startsWith('![') &&
        !l.startsWith('[!') &&
        !l.startsWith('<') &&
        !l.startsWith('```') &&
        !l.startsWith('|') &&
        !l.startsWith('>') &&
        l.length > 35
    );
  return lines.slice(0, 3).map((l) => l.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'));
}

async function collectLiveGithubCandidates({ owner, since, limit, excludeSlugs }) {
  const repos = await fetchGithubJson(`users/${owner}/repos?per_page=40&sort=pushed&direction=desc`);
  const candidates = repos
    .filter((r) => !r.fork && !r.archived && !r.private)
    .filter((r) => !excludeSlugs.has(String(r.name).toLowerCase()))
    .filter((r) => !String(r.name).toLowerCase().startsWith('ussysite'))
    .filter((r) => (!since ? true : String(r.pushed_at || '') >= since))
    .slice(0, limit);

  const enriched = [];
  for (const repo of candidates) {
    const commits = await fetchGithubJson(`repos/${owner}/${repo.name}/commits?per_page=1`);
    const head = Array.isArray(commits) && commits[0] ? commits[0] : null;
    if (!head?.sha || !/^[0-9a-f]{40}$/.test(head.sha)) continue;

    let readmeRaw = '';
    let readmePath = 'README.md';
    try {
      const rm = await fetchGithubJson(`repos/${owner}/${repo.name}/readme?ref=${head.sha}`);
      if (rm?.content) {
        readmeRaw = Buffer.from(rm.content, 'base64').toString('utf8');
        readmePath = rm.path || 'README.md';
      }
    } catch {
      readmeRaw = repo.description || '';
    }

    let latestRelease = null;
    try {
      const rels = await fetchGithubJson(`repos/${owner}/${repo.name}/releases?per_page=1`);
      if (Array.isArray(rels) && rels[0]?.tag_name) {
        latestRelease = rels[0].tag_name;
      }
    } catch {
      latestRelease = null;
    }

    let treeBlobs = [readmePath];
    let sampleFile = readmePath;
    let sampleLines = (readmeRaw || repo.name).split(/\r?\n/).slice(0, 12);
    try {
      const tree = await fetchGithubJson(`repos/${owner}/${repo.name}/git/trees/${head.sha}?recursive=1`);
      if (Array.isArray(tree?.tree)) {
        treeBlobs = tree.tree.filter((t) => t.type === 'blob').map((t) => t.path);
        const codeFile = treeBlobs.find(
          (p) =>
            /\.(ts|mjs|js|py|rs|go)$/.test(p) &&
            !p.includes('eval') &&
            !p.includes('canary') &&
            !p.includes('node_modules')
        );
        if (codeFile) {
          const blob = await fetchGithubJson(`repos/${owner}/${repo.name}/contents/${codeFile}?ref=${head.sha}`);
          if (blob?.content) {
            const decoded = Buffer.from(blob.content, 'base64').toString('utf8').split(/\r?\n/);
            if (decoded.length >= 3) {
              sampleFile = codeFile;
              sampleLines = decoded.slice(0, Math.min(14, decoded.length));
            }
          }
        }
      }
    } catch {
      // Keep README excerpt fallback
    }

    const sourceFiles = [
      readmePath,
      ...treeBlobs.filter(
        (p) =>
          p !== readmePath &&
          (p === 'CHANGELOG.md' ||
            p === 'SECURITY.md' ||
            p === 'package.json' ||
            p === 'pyproject.toml' ||
            p.startsWith('docs/') ||
            p === sampleFile)
      )
    ];
    const uniqueSources = [...new Set(sourceFiles)].slice(0, 4);
    while (uniqueSources.length < 3) {
      uniqueSources.push(readmePath);
    }

    enriched.push({
      name: repo.name,
      repoUrl: repo.html_url || `https://github.com/${owner}/${repo.name}`,
      description: repo.description || `${repo.name} repository in ${owner}`,
      language: repo.language || 'Polyglot',
      stars: Number(repo.stargazers_count || 0),
      pushedAt: String(repo.pushed_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
      latestRelease,
      headSha: head.sha,
      headMessage: String(head.commit?.message || '').split(/\r?\n/)[0].slice(0, 100),
      readmeParagraphs: cleanMarkdownSummary(readmeRaw),
      sampleFile,
      sampleCode: sampleLines.join('\n'),
      sampleEndLine: Math.max(1, sampleLines.length),
      sourcePaths: uniqueSources
    });
  }

  return enriched;
}

async function maybePolishWithGemini(repoFact) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_DRAFT_MODEL || 'gemini-2.5-flash-lite';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'Return strict JSON {"kicker":string,"headline":string,"pullQuote":string} in funny, self-aware Slop Illustrated style using ONLY the supplied repo facts. Never invent metrics or features.'
              }
            ]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: JSON.stringify(repoFact) }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.45,
            maxOutputTokens: 220
          }
        })
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (parsed?.headline && parsed?.kicker && parsed?.pullQuote) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export async function generateIssueDraft(rawOptions = {}) {
  const opts = { ...parseArgs([]), ...rawOptions };
  const existing = loadServerCatalog(join(ROOT_DIR, 'src/content'));

  const maxIssueNum = existing.issues.reduce((max, i) => Math.max(max, Number(i.issueNumber) || 0), 2);
  const nextIssueNumber = opts.issue || String(maxIssueNum + 1).padStart(2, '0');
  const existingSlugs = new Set(
    existing.articles.flatMap((a) => {
      const repoTail = String(a.repoUrl || '').split('/').filter(Boolean).pop() || '';
      return [a.articleSlug.toLowerCase(), repoTail.toLowerCase()].filter(Boolean);
    })
  );
  const today = new Date().toISOString().slice(0, 10);
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const candidates = opts.fixture
    ? JSON.parse(readFileSync(resolve(opts.fixture), 'utf8'))
    : await collectLiveGithubCandidates({
        owner: opts.owner,
        since: opts.since,
        limit: opts.limit,
        excludeSlugs: existingSlugs
      });

  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('No qualifying repositories found for draft generation.');
  }

  const usedGemini = Boolean(process.env.GEMINI_API_KEY);
  const baseServiceNo = Number(nextIssueNumber) * 100;
  const draftedArticles = [];

  for (let i = 0; i < candidates.length; i++) {
    const repo = candidates[i];
    const slug = String(repo.name)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '');
    const [spotInkHex, secondaryInkHex] = PALETTE[i % PALETTE.length];
    const variant = i === 0 ? 'opener' : i % 2 === 1 ? 'dossier' : 'essay';
    const polished = await maybePolishWithGemini({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      latestRelease: repo.latestRelease,
      headMessage: repo.headMessage,
      readmeParagraphs: repo.readmeParagraphs
    });

    const paragraphs =
      repo.readmeParagraphs?.length >= 2
        ? repo.readmeParagraphs
        : [
            `${repo.name} (${repo.description}) ships in ${repo.language} and was most recently pushed on ${repo.pushedAt} at commit ${repo.headSha.slice(0, 7)}.`,
            `Latest commit message on the default branch: "${repo.headMessage}". All source pointers below are pinned to exact 40-character Git revisions for editorial review before publication.`
          ];

    const frontmatter = {
      issueNumber: nextIssueNumber,
      articleSlug: slug,
      index: i + 1,
      readerServiceNo: baseServiceNo + i + 1,
      section: i === 0 ? 'COVER DISPATCH // WORKBENCH WIRE' : `FIELD DISPATCH // ${String(repo.language).toUpperCase()}`,
      layoutVariant: variant,
      title: repo.name,
      kicker:
        polished?.kicker ||
        `${repo.language} · ${repo.latestRelease ? `Release ${repo.latestRelease}` : `Head @${repo.headSha.slice(0, 7)}`}`,
      headline: polished?.headline || `${repo.name}: ${repo.description}`,
      deck: repo.description,
      byline: `By SLOPTIMUS PRIME · Draft Issue ${nextIssueNumber}`,
      category: `${repo.language} / Open Source`,
      glanceNote: `Drafted from ${repo.repoUrl} at revision ${repo.headSha.slice(0, 7)} (pushed ${repo.pushedAt}).`,
      pullQuote: polished?.pullQuote || `Pinned at ${repo.headSha.slice(0, 7)}: "${repo.headMessage}"`,
      repoUrl: repo.repoUrl,
      liveUrl: null,
      sourceRevision: repo.headSha,
      researchedAt: today,
      spotInkHex,
      secondaryInkHex,
      techStack: [repo.language, repo.latestRelease || 'Git HEAD', 'Public Source'].filter(Boolean),
      metrics: [
        { label: 'Primary Language', value: repo.language },
        { label: 'GitHub Stars', value: String(repo.stars) },
        { label: 'Pinned Commit', value: repo.headSha.slice(0, 10) }
      ],
      verifiedCapabilities: [
        `Repository verified at ${repo.repoUrl}`,
        `Latest commit (${repo.pushedAt}): ${repo.headMessage}`,
        repo.latestRelease ? `Tagged release ${repo.latestRelease} published` : 'Untagged trunk activity verified via GitHub API'
      ],
      architecture: [
        `Primary implementation language reported by GitHub: ${repo.language}.`,
        `Source excerpt inspected from ${repo.sampleFile} at ${repo.headSha.slice(0, 7)}.`
      ],
      fieldNotes: [
        `Auto-drafted by scripts/issue-draft.mjs (${usedGemini ? 'Gemini-assisted copy' : 'deterministic no-key mode'}); human editorial review required before merging PR.`
      ],
      readingGuide: [`READING GUIDE // Inspect ${repo.sampleFile} at ${repo.headSha.slice(0, 7)} before promotion from draft.`],
      flexiFreqs: CHORDS[i % CHORDS.length],
      plate: {
        kind: 'carbon-svg',
        svgId: `plate-${slug}`,
        width: 1600,
        height: 1200,
        title: `${repo.name} Schematic`,
        medium: 'CARBON LITHOGRAPH · AUTO-DRAFT PLATE',
        alt: `Conceptual Carbon schematic placeholder for ${repo.name} at commit ${repo.headSha.slice(0, 7)}.`
      },
      secondaryMedia: null,
      codeExcerpt: {
        title: `LISTING ${i + 1}.1 // PINNED SOURCE (${repo.sampleFile})`,
        lang: repo.sampleFile.endsWith('.py') ? 'python' : 'ts',
        code: repo.sampleCode,
        sourceLabel: `${repo.sampleFile} L1–L${repo.sampleEndLine} · ${repo.name}@${repo.headSha.slice(0, 7)}`,
        sourceUrl: `${repo.repoUrl}/blob/${repo.headSha}/${repo.sampleFile}#L1-L${repo.sampleEndLine}`
      },
      sources: repo.sourcePaths.map((p, idx) => ({
        label: `${repo.name} — ${p}${idx > 0 && p === repo.sourcePaths[0] ? ` (ref ${idx + 1})` : ''}`,
        url: `${repo.repoUrl}/blob/${repo.headSha}/${p}`
      }))
    };

    const md = `---\n${stringifyYaml(frontmatter).trim()}\n---\n\n${paragraphs.join('\n\n')}\n`;
    draftedArticles.push({
      filename: `${String(i + 1).padStart(2, '0')}-${slug}.md`,
      slug,
      frontmatter,
      markdown: md
    });
  }

  const issueFrontmatter = {
    issueNumber: nextIssueNumber,
    title: `Workbench Dispatches · Issue ${nextIssueNumber}`,
    subtitle: `${draftedArticles.length} source-pinned repositories drafted from ${opts.owner}'s recent GitHub commits`,
    coverDate: monthLabel,
    publishedAt: today,
    status: 'draft',
    themeTag: `CARBON LIVING EDITION // ISSUE ${nextIssueNumber} DRAFT`,
    editorInChief: 'SLOPTIMUS PRIME',
    editorLetterHeadline: 'Fresh commits off the public wire, pinned for human review.',
    coverArt: {
      kind: 'carbon-svg',
      svgId: 'cover-carbon-hive',
      title: `Issue ${nextIssueNumber} Carbon Lattice`,
      medium: 'CARBON LITHOGRAPH · DRAFT COVER',
      caption: `${draftedArticles.length} repositories drafted automatically from ${opts.owner}.`,
      alt: `Hexagonal Carbon cover schematic for Draft Issue ${nextIssueNumber}.`
    },
    highlights: [
      { label: 'Drafted Monographs', value: `${draftedArticles.length} Repos` },
      { label: 'Generator Mode', value: usedGemini ? 'Gemini + GitHub API' : 'Deterministic (No Key)' }
    ],
    dispatches: []
  };

  const issueMarkdown = `---\n${stringifyYaml(issueFrontmatter).trim()}\n---\n\nThis draft issue was generated from real public GitHub activity in \`github.com/${opts.owner}\` on ${today}. Review every claim, verify caveats, flip \`status\` from \`"draft"\` to \`"current"\` when ready, and merge the pull request.\n`;

  const targetRoot = opts.apply
    ? join(ROOT_DIR, 'src/content')
    : resolve(opts.outDir || join(ROOT_DIR, 'drafts', `issue-${nextIssueNumber}`));

  if (!opts.dryRun) {
    const issuesOut = join(targetRoot, 'issues');
    const articlesOut = join(targetRoot, 'articles', `issue-${nextIssueNumber}`);
    mkdirSync(issuesOut, { recursive: true });
    mkdirSync(articlesOut, { recursive: true });

    writeFileSync(join(issuesOut, `issue-${nextIssueNumber}.md`), issueMarkdown, 'utf8');
    for (const art of draftedArticles) {
      writeFileSync(join(articlesOut, art.filename), art.markdown, 'utf8');
    }
  }

  return {
    issueNumber: nextIssueNumber,
    mode: usedGemini ? 'gemini-assisted' : 'deterministic-fallback',
    targetRoot,
    dryRun: opts.dryRun,
    articles: draftedArticles.map((a) => ({
      slug: a.slug,
      filename: a.filename,
      sourceRevision: a.frontmatter.sourceRevision
    }))
  };
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isCli) {
  const cliOpts = parseArgs(process.argv.slice(2));
  generateIssueDraft(cliOpts)
    .then((summary) => {
      console.log(JSON.stringify(summary, null, 2));
    })
    .catch((err) => {
      console.error('[issue:draft] failed:', err.message);
      process.exitCode = 1;
    });
}
