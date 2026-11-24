import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono, type Context } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import { openPressDatabase, type PressDbHandle } from './db/client.ts';
import { readerStates, savedProjects, marginDispatches, editorialEvents, audioEditions } from './db/schema.ts';
import { loadServerCatalog } from '../lib/server-catalog.ts';
import { buildIssueFolios } from '../lib/folio.ts';

const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));

export const STRICT_CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'"
].join('; ');

const COMMON_SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const READER_ID_RE = /^[A-Za-z0-9_-]{4,64}$/;
const ALLOWED_MODES = new Set(['graphite', 'rag', 'oxide', 'darkroom', 'cream-press', 'blueprint']);

function sanitizeReaderId(candidate: unknown): string {
  const s = String(candidate || '').trim();
  return READER_ID_RE.test(s) ? s : 'local_default_reader';
}

function sanitizeText(raw: unknown, maxLen = 180): string {
  return String(raw || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export interface LivingAppOptions {
  dbPath?: string;
  distDir?: string;
  contentDir?: string;
  publicOrigin?: string;
  env?: NodeJS.ProcessEnv;
}

export function createLivingApp(options: LivingAppOptions = {}) {
  const env = options.env || process.env;
  const dbHandle: PressDbHandle = openPressDatabase(options.dbPath || env.DATABASE_PATH || './data/living-edition.sqlite');
  const { db } = dbHandle;
  const distDir = normalize(options.distDir || join(ROOT_DIR, 'dist'));
  const distDirSafe = distDir.endsWith(sep) ? distDir : distDir + sep;
  const publicOrigin = options.publicOrigin ?? env.PUBLIC_ORIGIN ?? '';

  const catalog = loadServerCatalog(options.contentDir || join(ROOT_DIR, 'src/content'));
  const serviceNoToIssue = new Map<number, string>();
  for (const art of catalog.articles) {
    serviceNoToIssue.set(art.readerServiceNo, art.issueNumber);
  }

  const rateBuckets = new Map<string, number[]>();
  function allowRate(ip: string, bucket: string, maxPerMin: number): boolean {
    const now = Date.now();
    const key = `${ip}::${bucket}`;
    const recent = (rateBuckets.get(key) || []).filter((t) => now - t < 60_000);
    if (recent.length >= maxPerMin) return false;
    recent.push(now);
    rateBuckets.set(key, recent);
    return true;
  }

  function isSameOrigin(req: Request): boolean {
    const origin = req.headers.get('origin');
    if (!origin) return true;
    const host = req.headers.get('host');
    try {
      const parsedOrigin = new URL(origin);
      if (host && parsedOrigin.host === host) return true;
      if (publicOrigin) {
        const parsedPub = new URL(publicOrigin);
        if (parsedOrigin.origin === parsedPub.origin) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function getClientIp(req: Request): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('x-real-ip') || '127.0.0.1';
  }

  function getCommunitySnapshot() {
    const totalRow = db
      .select({ count: sql<number>`count(*)` })
      .from(readerStates)
      .get();

    const saveRows = db
      .select({
        serviceNo: savedProjects.readerServiceNo,
        count: sql<number>`count(*)`
      })
      .from(savedProjects)
      .groupBy(savedProjects.readerServiceNo)
      .all();

    const saveCountsByServiceNo: Record<string, number> = {};
    for (const row of saveRows) {
      saveCountsByServiceNo[String(row.serviceNo)] = Number(row.count);
    }

    const recentDispatches = db
      .select()
      .from(marginDispatches)
      .orderBy(desc(marginDispatches.createdAt))
      .limit(12)
      .all()
      .map((row) => ({
        id: row.id,
        text: row.text,
        issueNumber: row.issueNumber,
        articleSlug: row.articleSlug || undefined,
        createdAt: row.createdAt
      }));

    return {
      totalReaders: Number(totalRow?.count || 0),
      saveCountsByServiceNo,
      recentDispatches
    };
  }

  function loadReaderState(readerId: string) {
    const row = db.select().from(readerStates).where(eq(readerStates.readerId, readerId)).get();
    const saved = db
      .select({ no: savedProjects.readerServiceNo })
      .from(savedProjects)
      .where(eq(savedProjects.readerId, readerId))
      .all()
      .map((r) => r.no)
      .sort((a, b) => a - b);

    const notes = db
      .select()
      .from(marginDispatches)
      .where(eq(marginDispatches.readerId, readerId))
      .orderBy(desc(marginDispatches.createdAt))
      .limit(16)
      .all()
      .map((n) => ({
        id: n.id,
        text: n.text,
        issueNumber: n.issueNumber,
        articleSlug: n.articleSlug || undefined,
        createdAt: n.createdAt
      }));

    return {
      v: 2,
      readerId,
      printMode: row?.printMode || 'graphite',
      gridOverlay: Boolean(row?.gridOverlay),
      circledServiceNos: saved,
      readerNotes: notes,
      unlocked: saved.length >= 11 ? ['full-issue-subscriber'] : [],
      counters: {
        articlesRead: row?.articlesRead || 0,
        flexiPlays: row?.flexiPlays || 0,
        bingoSubmissions: row?.bingoSubmissions || notes.length
      },
      updatedAt: row?.updatedAt || Date.now()
    };
  }

  const app = new Hono();

  // Global security headers middleware
  app.use('*', async (c, next) => {
    await next();
    for (const [k, v] of Object.entries(COMMON_SECURITY_HEADERS)) {
      c.header(k, v);
    }
  });

  // 1. Health & Living Edition Catalog Summary (replaces legacy ussysite4 /api/health)
  app.get('/api/health', (c) => {
    const cur = catalog.currentIssue;
    const askEditorEnabled = env.FEATURE_ASK_EDITOR === 'true';
    const aiIllusEnabled = env.FEATURE_AI_ILLUSTRATION === 'true';
    const audioEnabled = env.FEATURE_AUDIO_EDITION === 'true';

    c.header('Cache-Control', 'no-store');
    return c.json({
      status: 'ok',
      service: 'slop-illustrated-living-edition',
      version: '7.0.0',
      publication: 'SLOP ILLUSTRATED',
      editionSkin: 'gemini-4-carbon-x-neon',
      currentIssue: cur?.issueNumber || '02',
      issueNumber: cur?.issueNumber || '02',
      issueDate: cur?.coverDate || 'November 2026',
      digitalFolios: catalog.currentFolios.length,
      articles: catalog.currentArticles.length,
      totalArticles: catalog.articles.length,
      articleIds: catalog.currentArticles.map((a) => a.articleSlug),
      readerServiceNos: catalog.currentArticles.map((a) => a.readerServiceNo),
      issues: catalog.issues.map((iss) => ({
        issueNumber: iss.issueNumber,
        title: iss.title,
        coverDate: iss.coverDate,
        status: iss.status,
        articles: catalog.articles.filter((a) => a.issueNumber === iss.issueNumber).length
      })),
      database: {
        engine: 'sqlite-drizzle-wal',
        connected: dbHandle.sqlite.open
      },
      features: {
        askEditor: askEditorEnabled && Boolean(env.GEMINI_API_KEY),
        aiIllustration: aiIllusEnabled && Boolean(env.GEMINI_API_KEY),
        audioEdition: audioEnabled
      }
    });
  });

  // 2. Issues Catalog API
  app.get('/api/issues', (c) => {
    c.header('Cache-Control', 'public, max-age=60');
    return c.json({
      ok: true,
      currentIssue: catalog.currentIssue?.issueNumber || '02',
      issues: catalog.issues.map((iss) => {
        const arts = catalog.articles.filter((a) => a.issueNumber === iss.issueNumber);
        return {
          issueNumber: iss.issueNumber,
          title: iss.title,
          subtitle: iss.subtitle,
          coverDate: iss.coverDate,
          publishedAt: iss.publishedAt,
          status: iss.status,
          themeTag: iss.themeTag,
          folios: buildIssueFolios(iss.issueNumber, arts).length,
          articles: arts.map((a) => ({
            slug: a.articleSlug,
            readerServiceNo: a.readerServiceNo,
            title: a.title,
            headline: a.headline,
            category: a.category,
            repoUrl: a.repoUrl,
            sourceRevision: a.sourceRevision
          }))
        };
      })
    });
  });

  app.get('/api/issues/:issueNumber', (c) => {
    const num = c.req.param('issueNumber');
    const iss = catalog.issues.find((i) => i.issueNumber === num);
    if (!iss) {
      return c.json({ ok: false, error: `Issue ${num} not found` }, 404);
    }
    const arts = catalog.articles.filter((a) => a.issueNumber === num);
    return c.json({
      ok: true,
      issue: iss,
      folios: buildIssueFolios(num, arts),
      articles: arts
    });
  });

  // 3. Per-Reader Source Room & Press State (replaces broken 404 / global-clobbering /api/press/state)
  const handleGetPressState = (c: Context) => {
    const readerId = sanitizeReaderId(c.req.header('x-reader-id') || c.req.query('readerId'));
    c.header('Cache-Control', 'no-store');
    return c.json({
      ok: true,
      state: loadReaderState(readerId),
      community: getCommunitySnapshot()
    });
  };

  const handlePostPressState = async (c: Context) => {
    if (!isSameOrigin(c.req.raw)) {
      return c.json({ ok: false, error: 'Cross-origin POST forbidden' }, 403);
    }
    const ip = getClientIp(c.req.raw);
    if (!allowRate(ip, 'press', 90)) {
      return c.json({ ok: false, error: 'Rate limit exceeded' }, 429);
    }

    let body: Record<string, unknown>;
    try {
      const contentType = String(c.req.header('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        return c.json({ ok: false, error: 'Content-Type must be application/json' }, 415);
      }
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      return c.json({ ok: false, error: 'Invalid JSON payload' }, 400);
    }

    const incoming = ((body?.state && typeof body.state === 'object' ? body.state : body) || {}) as Record<
      string,
      unknown
    >;
    const readerId = sanitizeReaderId(c.req.header('x-reader-id') || incoming.readerId);
    const now = Date.now();

    const rawMode = String(incoming.printMode || 'graphite').slice(0, 24);
    const printMode = ALLOWED_MODES.has(rawMode) ? rawMode : 'graphite';
    const gridOverlay = Boolean(incoming.gridOverlay);
    const counters = (incoming.counters && typeof incoming.counters === 'object' ? incoming.counters : {}) as Record<
      string,
      unknown
    >;

    const tx = dbHandle.sqlite.transaction(() => {
      db.insert(readerStates)
        .values({
          readerId,
          printMode,
          gridOverlay,
          articlesRead: Math.max(0, Number(counters.articlesRead || 0) | 0),
          flexiPlays: Math.max(0, Number(counters.flexiPlays || 0) | 0),
          bingoSubmissions: Math.max(0, Number(counters.bingoSubmissions || 0) | 0),
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: readerStates.readerId,
          set: {
            printMode,
            gridOverlay,
            articlesRead: Math.max(0, Number(counters.articlesRead || 0) | 0),
            flexiPlays: Math.max(0, Number(counters.flexiPlays || 0) | 0),
            bingoSubmissions: Math.max(0, Number(counters.bingoSubmissions || 0) | 0),
            updatedAt: now
          }
        })
        .run();

      if (Array.isArray(incoming.circledServiceNos)) {
        const cleanNos = [
          ...new Set(
            incoming.circledServiceNos
              .map(Number)
              .filter((n) => Number.isInteger(n) && n >= 100 && n <= 9999)
              .slice(0, 64)
          )
        ];

        db.delete(savedProjects).where(eq(savedProjects.readerId, readerId)).run();
        for (const no of cleanNos) {
          db.insert(savedProjects)
            .values({
              readerId,
              readerServiceNo: no,
              issueNumber: serviceNoToIssue.get(no) || '02',
              createdAt: now
            })
            .run();
        }
      }

      if (Array.isArray(incoming.readerNotes)) {
        for (const rawNote of incoming.readerNotes.slice(0, 8)) {
          if (!rawNote || typeof rawNote !== 'object') continue;
          const n = rawNote as Record<string, unknown>;
          const text = sanitizeText(n.text, 180);
          if (!text) continue;
          const noteId = sanitizeReaderId(n.id || `note_${now}`);
          db.insert(marginDispatches)
            .values({
              id: noteId,
              readerId,
              issueNumber: sanitizeText(n.issueNumber || '02', 6) || '02',
              articleSlug: n.articleSlug ? sanitizeText(n.articleSlug, 64) : null,
              text,
              createdAt: Number(n.createdAt) || now
            })
            .onConflictDoNothing()
            .run();
        }
      }
    });

    tx();

    c.header('Cache-Control', 'no-store');
    return c.json({
      ok: true,
      state: loadReaderState(readerId),
      community: getCommunitySnapshot()
    });
  };

  app.get('/api/press/state', handleGetPressState);
  app.post('/api/press/state', handlePostPressState);
  app.get('/api/anomaly/state', handleGetPressState);
  app.post('/api/anomaly/state', handlePostPressState);

  // 4. Dedicated Source Room Stats & Margin Dispatches
  app.get('/api/source-room/stats', (c) => {
    c.header('Cache-Control', 'no-store');
    return c.json({
      ok: true,
      community: getCommunitySnapshot()
    });
  });

  app.post('/api/source-room/dispatch', async (c) => {
    if (!isSameOrigin(c.req.raw)) {
      return c.json({ ok: false, error: 'Cross-origin POST forbidden' }, 403);
    }
    const ip = getClientIp(c.req.raw);
    if (!allowRate(ip, 'dispatch', 20)) {
      return c.json({ ok: false, error: 'Rate limit exceeded' }, 429);
    }

    let payload: Record<string, unknown>;
    try {
      payload = (await c.req.json()) as Record<string, unknown>;
    } catch {
      return c.json({ ok: false, error: 'Invalid JSON payload' }, 400);
    }

    const text = sanitizeText(payload.text, 180);
    if (!text) {
      return c.json({ ok: false, error: 'Dispatch text is required' }, 400);
    }

    const readerId = sanitizeReaderId(c.req.header('x-reader-id') || payload.readerId);
    const now = Date.now();
    const id = `dsp_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const issueNumber = sanitizeText(payload.issueNumber || '02', 6) || '02';
    const articleSlug = payload.articleSlug ? sanitizeText(payload.articleSlug, 64) : null;

    db.insert(marginDispatches)
      .values({
        id,
        readerId,
        issueNumber,
        articleSlug,
        text,
        createdAt: now
      })
      .run();

    db.insert(editorialEvents)
      .values({
        kind: 'margin_dispatch',
        payloadJson: JSON.stringify({ id, issueNumber, articleSlug }),
        createdAt: now
      })
      .run();

    return c.json({
      ok: true,
      dispatch: { id, text, issueNumber, articleSlug, createdAt: now },
      community: getCommunitySnapshot()
    });
  });

  // 5. Optional Runtime Feature: Ask the Editor (Gemini 3.5 Flash-Lite behind FEATURE_ASK_EDITOR)
  const DEFAULT_EDITOR_MODEL = 'gemini-3.5-flash-lite';
  const DEFAULT_AUDIO_TTS_MODEL = 'gemini-3.8-flash-lite-tts';
  const DEFAULT_ILLUSTRATION_MODEL = 'gemini-nano-banana-2.1';

  app.get('/api/editor/status', (c) => {
    const enabled = env.FEATURE_ASK_EDITOR === 'true';
    const configured = Boolean(env.GEMINI_API_KEY);
    const model = env.GEMINI_EDITOR_MODEL || DEFAULT_EDITOR_MODEL;
    return c.json({
      ok: true,
      feature: 'ask-the-editor',
      enabled,
      configured,
      stub: !(enabled && configured),
      model,
      supportsMultiTurn: true
    });
  });

  app.post('/api/editor/ask', async (c) => {
    if (!isSameOrigin(c.req.raw)) {
      return c.json({ ok: false, error: 'Cross-origin POST forbidden' }, 403);
    }
    const ip = getClientIp(c.req.raw);
    if (!allowRate(ip, 'editor', 15)) {
      return c.json({ ok: false, error: 'Rate limit exceeded' }, 429);
    }

    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      return c.json({ ok: false, error: 'Invalid JSON' }, 400);
    }

    const question = sanitizeText(body.question, 320);
    if (!question) {
      return c.json({ ok: false, error: 'Question is required' }, 400);
    }

    const rawHistory = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const history = rawHistory
      .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === 'object'))
      .map((m) => ({
        role: m.role === 'editor' ? 'model' : 'user',
        text: sanitizeText(m.text, 280)
      }))
      .filter((m) => m.text.length > 0);

    // BM25-style weighted retrieval across title, stack, architecture, fieldNotes, codeExcerpt, and prose
    const STOP_WORDS = new Set([
      'the', 'and', 'for', 'with', 'about', 'what', 'which', 'how', 'why', 'does', 'did', 'are', 'from', 'this', 'that', 'tell', 'have'
    ]);
    const recentUserContext = history
      .filter((h) => h.role === 'user')
      .slice(-1)
      .map((h) => h.text)
      .join(' ');
    const queryTokens = `${question} ${recentUserContext}`
      .toLowerCase()
      .split(/[^a-z0-9_-]+/)
      .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

    const docCorpus = catalog.articles.map((art) => {
      const titleText = `${art.title} ${art.articleSlug} ${art.kicker}`.toLowerCase();
      const specText = `${art.headline} ${art.deck} ${art.category} ${art.techStack.join(' ')} ${art.metrics.map((m) => `${m.label} ${m.value}`).join(' ')}`.toLowerCase();
      const deepText = `${art.glanceNote} ${art.architecture.join(' ')} ${art.fieldNotes.join(' ')} ${art.verifiedCapabilities.join(' ')} ${art.codeExcerpt.title} ${art.codeExcerpt.code} ${art.body}`.toLowerCase();
      return { art, titleText, specText, deepText };
    });

    const N = Math.max(1, docCorpus.length);
    const df = new Map<string, number>();
    for (const tok of new Set(queryTokens)) {
      let count = 0;
      for (const doc of docCorpus) {
        if (doc.titleText.includes(tok) || doc.specText.includes(tok) || doc.deepText.includes(tok)) {
          count++;
        }
      }
      df.set(tok, count);
    }

    const scored = docCorpus
      .map((doc) => {
        let score = 0;
        for (const tok of queryTokens) {
          const docFreq = df.get(tok) || 0;
          if (docFreq === 0) continue;
          const idf = Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1);
          if (doc.titleText.includes(tok)) score += 6.0 * idf;
          if (doc.specText.includes(tok)) score += 3.0 * idf;
          if (doc.deepText.includes(tok)) score += 1.5 * idf;
        }
        if (question.toLowerCase().includes('nov') && doc.art.issueNumber === '02') {
          score += 1.2;
        }
        return { art: doc.art, score };
      })
      .filter((s) => s.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topMatches = scored.length > 0 ? scored.map((s) => s.art) : catalog.currentArticles.slice(0, 2);
    const citations = topMatches.map((m) => ({
      label: `Issue ${m.issueNumber} · #${m.readerServiceNo} ${m.title} (@${m.sourceRevision.slice(0, 7)})`,
      href: `/issues/${m.issueNumber}/${m.articleSlug}`
    }));

    const enabled = env.FEATURE_ASK_EDITOR === 'true';
    const apiKey = env.GEMINI_API_KEY;
    const model = env.GEMINI_EDITOR_MODEL || DEFAULT_EDITOR_MODEL;

    if (enabled && apiKey) {
      try {
        const contextBlock = topMatches
          .map(
            (m) =>
              `[${m.title} | Issue ${m.issueNumber} | ${m.repoUrl}@${m.sourceRevision.slice(0, 7)}]: ${m.headline}. ${m.glanceNote} Architecture: ${m.architecture.slice(0, 2).join(' ')} Caveats: ${m.fieldNotes.join(' ')}`
          )
          .join('\n');

        const apiRes = await fetch(
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
                    text: 'You are SLOPTIMUS PRIME, Editor-in-Chief of Slop Illustrated. Answer concisely, wittily, and strictly from the provided commit-pinned monograph context. Never invent repositories, benchmarks, or commit hashes.'
                  }
                ]
              },
              contents: [
                ...history.map((h) => ({
                  role: h.role,
                  parts: [{ text: h.text }]
                })),
                {
                  role: 'user',
                  parts: [{ text: `Grounded Catalog Context:\n${contextBlock}\n\nReader Question: ${question}` }]
                }
              ],
              generationConfig: {
                maxOutputTokens: 320,
                temperature: 0.4
              }
            })
          }
        );

        if (apiRes.ok) {
          const gemJson = (await apiRes.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const textReply = gemJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (textReply) {
            return c.json({
              ok: true,
              stub: false,
              model,
              reply: textReply,
              citations
            });
          }
        }
      } catch {
        // Fall through cleanly to deterministic grounded press-desk stub
      }
    }

    const summaryLines = topMatches.map(
      (m) => `${m.title} (Iss.${m.issueNumber}, @${m.sourceRevision.slice(0, 7)}): ${m.glanceNote}`
    );
    const stubReply =
      scored.length > 0
        ? `[Press-Desk BM25 Stub · ${model} off] ${summaryLines.join(' — ')}`
        : `[Press-Desk BM25 Stub · ${model} off] Live synthesis is gated behind FEATURE_ASK_EDITOR=true. Start with ${topMatches[0].title} (${topMatches[0].headline}) or press / to search all 22 monographs.`;

    return c.json({
      ok: true,
      stub: true,
      model,
      reply: stubReply,
      citations
    });
  });

  // 6. Optional Runtime Feature Stubs: Per-Issue AI Illustration & Audio Edition
  app.get('/api/illustrations/status', (c) => {
    const enabled = env.FEATURE_AI_ILLUSTRATION === 'true';
    const model = env.GEMINI_ILLUSTRATION_MODEL || DEFAULT_ILLUSTRATION_MODEL;
    return c.json({
      ok: true,
      feature: 'per-issue-ai-illustration',
      enabled,
      configured: Boolean(env.GEMINI_API_KEY),
      stub: !enabled,
      model,
      contract: {
        endpoint: 'POST /api/illustrations/generate',
        body: ['issueNumber', 'articleSlug', 'promptBrief'],
        note: 'Gated behind FEATURE_AI_ILLUSTRATION; offline Carbon SVG lithographs and Issue 01 Blender plates remain default.'
      }
    });
  });

  app.post('/api/illustrations/generate', (c) => {
    return c.json(
      {
        ok: false,
        stub: true,
        code: 'feature_flagged_off',
        model: env.GEMINI_ILLUSTRATION_MODEL || DEFAULT_ILLUSTRATION_MODEL,
        message:
          'Per-issue runtime AI illustration is behind FEATURE_AI_ILLUSTRATION. Issue 01 uses Cycles Blender WebP plates; Issue 02 ships deterministic Carbon × Neon SVG lithographs.'
      },
      501
    );
  });

  app.get('/api/audio/status', (c) => {
    const enabled = env.FEATURE_AUDIO_EDITION === 'true';
    const model = env.GEMINI_AUDIO_TTS_MODEL || DEFAULT_AUDIO_TTS_MODEL;
    const cachedCountRow = db
      .select({ count: sql<number>`count(*)` })
      .from(audioEditions)
      .get();

    return c.json({
      ok: true,
      feature: 'audio-edition',
      enabled,
      configured: Boolean(env.GEMINI_API_KEY),
      stub: !enabled,
      model,
      cachedTracks: Number(cachedCountRow?.count || 0),
      clientSynth: 'WebAudio Carbon × Neon Tonewheel (33.3 RPM + 22 Monograph Chords)',
      contract: {
        endpoint: 'POST /api/audio/edition',
        body: ['issueNumber', 'articleSlug', 'voice']
      }
    });
  });

  app.post('/api/audio/edition', async (c) => {
    const enabled = env.FEATURE_AUDIO_EDITION === 'true';
    const model = env.GEMINI_AUDIO_TTS_MODEL || DEFAULT_AUDIO_TTS_MODEL;
    if (!enabled || !env.GEMINI_API_KEY) {
      return c.json(
        {
          ok: false,
          stub: true,
          code: 'feature_flagged_off',
          model,
          message: `Narrated Audio Edition (${model}) is gated behind FEATURE_AUDIO_EDITION=true. The docked 33⅓ RPM WebAudio Tonewheel transport is active locally.`
        },
        501
      );
    }

    return c.json(
      {
        ok: false,
        stub: true,
        code: 'tts_provider_not_wired',
        model,
        message: `SQLite audio_editions cache ready; wire live ${model} streaming credentials on the host to synthesize narration.`
      },
      501
    );
  });

  app.get('/api/tts/health', (c) => {
    return c.json({
      configured: Boolean(env.OPENROUTER_API_KEY || env.GEMINI_API_KEY),
      audioEditionFlag: env.FEATURE_AUDIO_EDITION === 'true',
      clientSynth: 'carbon-tonewheel-v2'
    });
  });

  // 7. Hardened Static File Serving from Astro `dist/` (for local preview & single-node mode)
  app.all('*', async (c) => {
    const method = c.req.method;
    if (method !== 'GET' && method !== 'HEAD') {
      return c.json({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(c.req.url);
    let decoded: string;
    try {
      decoded = decodeURIComponent(url.pathname);
    } catch {
      return c.text('Bad Request', 400);
    }

    if (decoded.includes('\0')) {
      return c.text('Not Found', 404);
    }

    const segments = decoded.split('/').filter(Boolean);
    if (segments.some((s) => s.startsWith('.') || s === '..')) {
      return c.text('Not Found', 404);
    }

    const candidates: string[] = [];
    if (decoded === '/' || decoded === '') {
      candidates.push(join(distDir, 'index.html'));
    } else {
      const normalizedRel = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
      const direct = join(distDir, '.' + (normalizedRel.startsWith('/') ? normalizedRel : '/' + normalizedRel));
      candidates.push(direct);
      if (!extname(direct)) {
        candidates.push(join(direct, 'index.html'));
        candidates.push(`${direct}.html`);
      }
    }

    for (const candidate of candidates) {
      const resolved = normalize(candidate);
      if (!resolved.startsWith(distDirSafe) || !existsSync(resolved)) continue;
      try {
        const st = await stat(resolved);
        if (!st.isFile()) continue;
        const ext = extname(resolved).toLowerCase();
        const contentType = CONTENT_TYPES[ext];
        if (!contentType) continue;

        const buf = await readFile(resolved);
        const resolvedContentType =
          resolved.endsWith(`${sep}rss.xml`) ? 'application/rss+xml; charset=utf-8' : contentType;
        const headers: Record<string, string> = {
          ...COMMON_SECURITY_HEADERS,
          'Content-Type': resolvedContentType,
          'Content-Length': String(buf.byteLength),
          'Cache-Control':
            resolved.includes(`${sep}_astro${sep}`) || resolved.includes(`${sep}assets${sep}`)
              ? 'public, max-age=31536000, immutable'
              : 'no-cache'
        };

        if (ext === '.html') {
          headers['Content-Security-Policy'] = STRICT_CSP_HEADER;
        }

        return new Response(method === 'HEAD' ? null : buf, {
          status: 200,
          headers
        });
      } catch {
        continue;
      }
    }

    return c.text('Not Found', 404);
  });

  return {
    app,
    dbHandle,
    close: () => dbHandle.close()
  };
}
