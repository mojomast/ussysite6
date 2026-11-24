# SLOP ILLUSTRATED (Si.) · Living Edition

**A source-linked software magazine that keeps publishing.** Edited by **SLOPTIMUS PRIME** ([github.com/mojomast](https://github.com/mojomast)). Art-directed in three passes, **Gemini 4 Carbon (`C·06`)**, **Gemini 4 Neon (`Ne·10`)** and **Claude Opus (`Au·79`)**, on Astro 7, Svelte 5 islands, Three.js (`WebGPU` TSL node shader with `WebGL2` & SVG fallbacks), and a Hono + Drizzle + SQLite Source Room API.

---

## Published Issues

| Issue | Date | Status | Theme | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **[Issue 02](/src/content/issues/issue-02.md)** | November 2026 | `current` | *Who Watches the Bees?* | 11 new monographs (`#201`–`#211`: `workflow`/`rizzstack`, `bundlebees`, `hyvv`, `orbit-control-plane`, `uirizz`, `open-higgsfield-skills`, `hermes-aircraft-doppler-geolocation`, `EOH`, `hermes-photo-to-part`, `hermes-templeos`, `jackpotsyndicate`) + 4 bench dispatches |
| **[Issue 01](/src/content/issues/issue-01.md)** | October 2026 | `archived` | *Show Your Work* | All 11 inaugural monographs (`#101`–`#111`) preserved verbatim with their 13 original 1600×1200 Cycles Blender WebP still lifes and screenshots |

Every monograph pins an exact 40-character Git commit SHA (`sourceRevision`), links every architectural claim and line-numbered source excerpt to that revision, and explicitly separates verified behavior from planned or experimental work.

---

## Quickstart

Requires **Node.js `>= 22.23.4`**.

```bash
# 1. Install dependencies
npm install

# 2. Build the static Astro publication (outputs to dist/ with strict-CSP externalization)
npm run build

# 3. Run typecheck, strict-CSP HTML audit, and gitleaks secret-hygiene lint
npm run lint

# 4. Run catalog, Hono + SQLite API, and issue-generator test suites
npm test

# 5. Start the local Hono + SQLite server serving dist/ + /api/* (default http://127.0.0.1:3016)
npm start
```

For Astro hot-reload frontend development:
```bash
npm run dev
```

---

## Drafting the Next Issue (`npm run issue:draft`)

New issues are generated from real public GitHub activity in `github.com/mojomast` and reviewed as pull requests:

```bash
# Draft the next issue into ./drafts/issue-03/ (works without any API keys)
npm run issue:draft -- --limit 5

# Optional: set GEMINI_API_KEY in .env to enable Gemini-assisted headline/copy polishing
# Pass --apply to write directly into src/content/issues/ and src/content/articles/
npm run issue:draft -- --issue 03 --limit 6 --apply
```

---

## Architecture & Key Documents

- [`DESIGN.md`](DESIGN.md) — **Gemini 4 Carbon (`C·06`)** base press system + **Gemini 4 Neon (`Ne·10`)** interactive/motion layer, paper stock tokens (`graphite`, `rag`, `oxide`), 4-voice typography, and strict CSP guardrails.
- [`PLAN.md`](PLAN.md) — Phase 1 to Phase 3 roadmap & verification checklist.
- [`DESIGN.md` §7](DESIGN.md) — the Opus voice guide (house style, banned phrasing, pulled pull quotes) and the signature moments: cold open, Corrections, proofreader's ticks, the last page and its lamp, opt-in sound.
- [`src/components/islands/InteractiveStudy.svelte`](src/components/islands/InteractiveStudy.svelte) — 10 keyboard-accessible interactive step-through monograph studies across Issues 01 & 02.
- [`src/pages/rss.xml.ts`](src/pages/rss.xml.ts) — Static RSS 2.0 syndication feed (`/rss.xml`) listing all commit-pinned monographs.
- [`src/server/app.ts`](src/server/app.ts) — Hono + Drizzle + SQLite WAL API (`/api/health`, `/api/issues`, per-reader `/api/press/state`, `/api/source-room/*`, multi-turn Ask the Editor defaulting to `gemini-3.5-flash-lite` behind `FEATURE_ASK_EDITOR`, and flagged Audio Edition / AI Illustration stubs).
- [`deploy/`](deploy/README.md) — Example `nginx-ussy.host.conf` (strict CSP without `'unsafe-inline'`), `ussysite6.service`, and manual operator runbook.
