# PLAN.md — Handoff from Gemini 4 Carbon to Gemini 4 Neon

Welcome to the `cursor/living-edition-d647` branch, **Gemini 4 Neon**.

Gemini 4 Carbon has established the visual architecture (`DESIGN.md`), static-first Astro 7 + Svelte 5 content engine, archived Issue 01, authored Issue 02 from real Oct–Nov 2026 `mojomast` GitHub activity, replaced the broken Source Room backend with Hono + Drizzle + SQLite, wired the `npm run issue:draft` CLI, and enforced a zero-`unsafe-inline` strict CSP.

---

## 1. What Is Built & Verified Today

- **Astro 7.4 + Svelte 5.59 + Content Layer (`src/content.config.ts`)**:
  - `src/content/issues/issue-01.md` + `src/content/articles/issue-01/*.md` — All 11 Issue 01 monographs, Cycles Blender `.webp` plates (`/assets/editorial/...`), and screenshots (`/assets/screenshots/...`) preserved verbatim as an archived issue (`/issues/01`).
  - `src/content/issues/issue-02.md` + `src/content/articles/issue-02/*.md` — 11 brand-new November 2026 monographs (`#201`–`#211`: `workflow`/`rizzstack`, `bundlebees`, `hyvv`, `orbit-control-plane`, `uirizz`, `open-higgsfield-skills`, `hermes-aircraft-doppler-geolocation`, `EOH`, `hermes-photo-to-part`, `hermes-templeos`, `jackpotsyndicate`) plus 4 pinned bench dispatches (`comfyrizz`, `hermes-shortrizz`, `hyperrizz`, `hermes-stitchslop`), every single one verified against live GitHub commits with exact 40-char SHAs and line-numbered excerpts.
- **Three.js `0.187.0` Cover Stage (`src/components/islands/CarbonCoverStage.svelte`)**:
  - Probes `navigator.gpu` (`three/webgpu` `WebGPURenderer`), falls back cleanly to `THREE.WebGLRenderer`, and degrades to a crisp SVG lattice under `prefers-reduced-motion: reduce` or headless environments without GPU support.
- **Hono + Drizzle + SQLite API (`src/server/app.ts`, `src/server/db/schema.ts`, `server.mjs`)**:
  - Per-reader isolated `reader_states` and `saved_projects` in SQLite WAL mode (`X-Reader-Id`), community save counts, rate-limited `margin_dispatches`, Living Edition `/api/health`, `/api/issues`, and stubbed feature-flagged endpoints (`/api/editor/*`, `/api/illustrations/*`, `/api/audio/*`).
- **Issue Generator (`scripts/issue-draft.mjs` / `npm run issue:draft`)**:
  - Pulls live `mojomast` GitHub repos/commits/releases/READMEs/code, skips already-covered repos, optionally polishes copy with `GEMINI_API_KEY`, and degrades cleanly without any key.
- **Security & Ops**:
  - Post-build externalizer (`astro.config.mjs`) + `scripts/lint-security.mjs` guarantee zero inline `<script>`, zero inline `<style>`, zero `style="..."` attributes, valid `robots.txt` + `sitemap-index.xml`, and gitleaks-clean tracked files.

---

## 2. Prioritized Opportunities & Polish Backlog for Gemini 4 Neon

Pick the highest-impact items below to layer your **Neon** interactive craft onto the **Carbon** structural press—without breaking `DESIGN.md` guardrails or strict CSP:

### Priority 1 — Rich Interactive Feature Studies & Full-Screen Folio Reader
1. **Interactive Step-Through Studies for Issue 02 Monographs**:
   - Issue 01 had five interactive conceptual studies (`cocs`, `rgbagentflightindicator`, `warpi`, `hermesdashboard`, `becomussy`). Notice `secondaryMedia` in `src/content.config.ts` already supports `kind: 'svg-study'` with `studyId`!
   - Build a Svelte 5 `InteractiveStudy.svelte` island that renders interactive step-by-step state machines both for those 5 Issue 01 classics AND for standout Issue 02 monographs (e.g., stepping through Rizzstack's `W1/W2/W3/W4` verifier outcomes, stepping through `uirizz`'s `click -> pending -> typed yes -> approved` state machine, or scrubbing `dopplergeo`'s `f0` Doppler curve!).
2. **Named View Transition Morphs & Keyboard Folio Shortcuts**:
   - Add deterministic CSS class-based `view-transition-name` hooks between TOC/Newsstand headlines and Article Monograph headers, plus `j`/`k` or `[` / `]` keyboard shortcuts to step between folios within an issue.

### Priority 2 — Deepening the Feature-Flagged Runtime Interfaces
3. **Ask the Editor (`AskEditorDrawer` / `/api/editor/ask`) Multi-Turn & Citation Chips**:
   - Upgrade the single-turn Ask Editor modal in `PressControls.svelte` into a sleek multi-turn press-wire thread with clickable starter prompts (*"Which Nov 2026 repos have zero runtime dependencies?"*, *"Compare bundlebees and hyvv"*), streaming or richer local TF-IDF/BM25 ranking over `codeExcerpt` + `architecture` + `fieldNotes` when `FEATURE_ASK_EDITOR=false`, and live Gemini Flash-Lite streaming when enabled.
4. **Audio Edition Player Bar (`/api/audio/*` + Client Synth)**:
   - Expand `carbon-synth.ts` and `/api/audio/edition` into a docked mini tape/flexi transport bar that can step through all 11 chords of an issue as an ambient reading soundtrack—and wire optional server TTS synthesis caching into SQLite when `FEATURE_AUDIO_EDITION=true`.
5. **Per-Issue AI Illustration CLI / Preview (`POST /api/illustrations/generate` & `scripts/`)**:
   - Wire an opt-in script or studio endpoint (when `FEATURE_AI_ILLUSTRATION=true` + `GEMINI_API_KEY`) that generates conceptual plate drafts into `drafts/` with automatic provenance sidecars, keeping offline SVG lithographs as the default.

### Priority 3 — Cover Shader & Archival Comparison Polish
6. **Three.js TSL / Custom Material Polish on `CarbonCoverStage.svelte`**:
   - Enhance the hexagonal allotrope cells with richer procedural geometry, subtle hover label projections, or WebGPU TSL node materials while preserving `renderer.setSize(w, h, false)`, offscreen pause, and the `STATIC SVG` fallback.
7. **RSS / Atom Feed (`/rss.xml`) & Issue Diff View**:
   - Add `@astrojs/rss` or a static `/rss.xml.ts` endpoint so readers can subscribe to new issues as PRs merge, plus a fun "Workbench Velocity" chart comparing languages and test counts across Issue 01 vs. Issue 02.

---

## 3. Verification Checklist Before Pushing Your Follow-Up

1. `npm run build` — Must build all static routes + `sitemap-index.xml` cleanly with 0 inline scripts/styles remaining.
2. `npm run lint` — Runs `astro check` + `scripts/lint-security.mjs` (strict CSP + secret/canary scan).
3. `npm test` — Runs `node --test test/*.test.mjs` covering catalog provenance, Hono + SQLite per-reader isolation, strict CSP headers, and `issue:draft` offline generation.
4. Browser check — Verify `0` `securitypolicyviolation` or console errors in Headless Chromium on desktop and mobile viewports.
5. **Never deploy, never touch remote hosts, and never merge.**

---

## 4. Phase 3 (Claude Opus) — Done

- Rewrote every visitor-facing word: both issues, all 22 features, dispatches, captions, studies, chrome, colophon, RSS, meta descriptions. Added About and 404.
- Signature moments: Issue 02 cold open, Corrections column, proofreader's read ticks, the last page with its lamp, opt-in sound. See `DESIGN.md` §7.
- New guards: `test/copy.test.mjs` (pull quotes must be verbatim, banned slop phrasing, last pages present) and a real 404 page served with status 404.

### Ideas left on the bench

1. Corrections could get their own page with dates once there are more than five.
2. A per-issue cold open for future issues: `npm run issue:draft` could propose `coldOpen` lines from the commits it reads (a person still approves them).
3. A print stylesheet pass for the last page, so the lamp prints as a line drawing.
