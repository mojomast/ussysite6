import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { buildIssueFolios } from './folio.ts';

const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));

export interface CatalogIssue {
  issueNumber: string;
  title: string;
  subtitle: string;
  coverDate: string;
  publishedAt: string;
  status: 'current' | 'archived' | 'draft';
  themeTag: string;
  editorInChief: string;
  editorLetterHeadline: string;
  highlights: Array<{ label: string; value: string }>;
  dispatches: Array<{ title: string; repoUrl: string; commitSha: string; note: string }>;
  body: string;
}

export interface CatalogArticle {
  issueNumber: string;
  articleSlug: string;
  index: number;
  readerServiceNo: number;
  section: string;
  layoutVariant: 'opener' | 'dossier' | 'essay';
  title: string;
  kicker: string;
  headline: string;
  deck: string;
  byline: string;
  category: string;
  glanceNote: string;
  pullQuote: string;
  repoUrl: string;
  liveUrl: string | null;
  sourceRevision: string;
  researchedAt: string;
  spotInkHex: string;
  secondaryInkHex: string;
  techStack: string[];
  metrics: Array<{ label: string; value: string }>;
  verifiedCapabilities: string[];
  architecture: string[];
  fieldNotes: string[];
  readingGuide: string[];
  flexiFreqs: number[];
  secondaryMedia?: {
    kind: 'screenshot' | 'svg-study';
    src?: string;
    studyId?: string;
    caption: string;
  } | null;
  codeExcerpt: {
    title: string;
    lang: string;
    code: string;
    sourceLabel: string;
    sourceUrl: string;
  };
  sources: Array<{ label: string; url: string }>;
  body: string;
}

function parseMarkdownFile<T>(filePath: string): { data: T; body: string } {
  const raw = readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing YAML frontmatter in ${filePath}`);
  }
  const data = parseYaml(match[1]) as T;
  return { data, body: match[2].trim() };
}

function walkMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdownFiles(full));
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      out.push(full);
    }
  }
  return out.sort();
}

export function loadServerCatalog(contentRoot = join(ROOT_DIR, 'src/content')) {
  const issueFiles = walkMarkdownFiles(join(contentRoot, 'issues'));
  const articleFiles = walkMarkdownFiles(join(contentRoot, 'articles'));

  const issues: CatalogIssue[] = issueFiles
    .map((f) => {
      const { data, body } = parseMarkdownFile<Omit<CatalogIssue, 'body'>>(f);
      return { ...data, body };
    })
    .sort((a, b) => b.issueNumber.localeCompare(a.issueNumber));

  const articles: CatalogArticle[] = articleFiles
    .map((f) => {
      const { data, body } = parseMarkdownFile<Omit<CatalogArticle, 'body'>>(f);
      return { ...data, body };
    })
    .sort((a, b) => b.issueNumber.localeCompare(a.issueNumber) || a.index - b.index);

  const currentIssue = issues.find((i) => i.status === 'current') || issues[0] || null;
  const currentArticles = currentIssue
    ? articles.filter((a) => a.issueNumber === currentIssue.issueNumber).sort((a, b) => a.index - b.index)
    : [];
  const currentFolios = currentIssue ? buildIssueFolios(currentIssue.issueNumber, currentArticles) : [];

  return {
    issues,
    articles,
    currentIssue,
    currentArticles,
    currentFolios
  };
}
