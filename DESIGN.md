# DESIGN.md — Gemini 4 Carbon (`C·06`) Visual System

**Publication:** *SLOP ILLUSTRATED (Si.) — Living Edition* (`ussy.host`)  
**Art Direction & Foundation Pass:** Gemini 4 Carbon  
**Follow-Up Polish & Feature Pass:** Gemini 4 Neon (see `PLAN.md`)

---

## 1. Design Principles (The Carbon Thesis)

**Carbon (`Z = 6`, `12.011 u`)** is the structural element behind both soot-dark pyrolytic graphite and archival cotton paper. Unlike Issue 01's single-scroll "Darkroom Field Journal," Living Edition is an **architectural periodical press** inspired by *Domus*, *MIT Press Swiss Technical Monographs*, and *1970s IBM Systems Journal*:

1. **Exposed Structural Honesty**: Grids are visible (`1px` `--rule-hairline` dividers and `2px` `--ink-primary` section rules). Coordinates, folio numbers, and 40-character Git commit SHAs sit on the surface as primary typographic material, never buried in tooltips.
2. **Editorial Asymmetry Over SaaS Symmetry**: Never stack three identical rounded cards in a row. Pair monumental serif display headlines against dense monospace provenance ledgers (`5fr / 7fr`, `7fr / 5fr`, and `8fr / 4fr` splits).
3. **Zero-Slop Provenance**: Conceptual schematics and Blender still lifes are explicitly captioned as editorial illustrations (`CONCEPTUAL SCHEMATIC · NOT TELEMETRY`), while caveats and unrun suites occupy high-visibility `--amber-oxide` callout panels.
4. **Progressive & Strict-CSP Native**: Every page renders complete, legible semantic HTML before a byte of JavaScript executes, obeys `prefers-reduced-motion: reduce`, and runs under `script-src 'self'; style-src 'self' https://fonts.googleapis.com` with **zero `'unsafe-inline'`**.

---

## 2. Design Tokens (`src/styles/tokens.css`)

### 2.1 Three Selectable Paper Stocks (`html[data-stock="..."]`)

| Token | `graphite` (Default Dark) | `rag` (Daylight Cotton) | `oxide` (Ferric Blueprint) | Role |
| :--- | :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#0b0c0e` | `#f4f0e6` | `#071522` | Primary page ground |
| `--bg-surface` | `#121418` | `#eae4d5` | `#0c1f33` | Ledger & secondary beds |
| `--bg-panel` | `#181b21` | `#fcfaf5` | `#112942` | Elevated instrument housings & modals |
| `--bg-code` | `#08090b` | `#15171c` | `#040d16` | Pinned source specimen wells |
| `--ink-primary` | `#f3efe6` (`16.4:1`) | `#121316` (`15.8:1`) | `#edf5fc` (`16.1:1`) | Headlines & body prose |
| `--ink-secondary` | `#c2bdb0` (`9.2:1`) | `#343740` (`9.6:1`) | `#b9d0e7` (`9.8:1`) | Decks, captions & secondary copy |
| `--ink-muted` | `#8b867a` (`5.1:1`) | `#585c67` (`5.7:1`) | `#82a4c6` (`5.6:1`) | Datum labels & folio numerals (WCAG AA+) |
| `--rule-hairline` | `#262a34` | `#cfc8b6` | `#1d3a59` | `1px` structural grid dividers |
| `--rule-strong` | `#414756` | `#8e8673` | `#325d8a` | Frame borders & interactive outlines |
| `--signal-vermilion` | `#ff4422` | `#c4280c` | `#ff7847` | Primary proof mark, drop caps, active stamps |
| `--phosphor-mint` | `#3ddc97` | `#0b6e46` | `#4ade80` | Verified commit SHAs & saved receipts |
| `--amber-oxide` | `#f5a623` | `#945200` | `#fbbf24` | Honest boundaries, caveats & stub flags |

### 2.2 Four-Voice Typography System

| Token | Family | Usage & Constraints |
| :--- | :--- | :--- |
| `--font-display` | `Instrument Serif` | Masthead (`--text-masthead`), section headings, article headlines (`line-height: 0.98`, `letter-spacing: -0.025em`), pull quotes, drop caps, and folio index numerals. |
| `--font-structural` | `Syne` | Uppercase masthead super-kicker (`SLOP`), brand imprint, and "Under the Hood" structural headers (`letter-spacing: 0.04em–0.14em`). |
| `--font-ui` | `Space Grotesk` | Navigation links, repository cards, metric values, and interactive controls. |
| `--font-prose` | `Newsreader` | Longform monograph copy (`1.135rem`, `line-height: 1.72`, strict `--measure-prose: 62ch` max width). |
| `--font-mono` | `JetBrains Mono` | Commit SHAs, Reader Service stamps (`#201`), datum coordinates, keyboard shortcuts, and source excerpts (`tabular-nums`). |

### 2.3 Spacing & Container Rhythm

- Sheet container `.carbon-sheet` caps at `--max-sheet: 1380px` with fluid `clamp(1rem, 3vw, 2.5rem)` horizontal padding.
- Spacing scale: `--space-1` (`4px`), `--space-2` (`8px`), `--space-3` (`12px`), `--space-4` (`16px`), `--space-5` (`24px`), `--space-6` (`32px`), `--space-7` (`48px`), `--space-8` (`72px`).
- Zero border-radius (`0px`) on all structural frames, buttons, pills, and modals; the lone exception is the `7px` circular live status LED (`.live-dot`).

---

## 3. Component & Layout Inventory

1. **`Masthead.astro` + `PressControls.svelte`**:
   - Sticky top press bar (`--header-h: 3.5rem`) with scroll-driven top progress ribbon (`.scroll-progress-bar`), `Si.` inverse badge, issue navigation, 3-stock switcher (`Graphite / Rag / Oxide`), registration grid overlay (`html[data-grid="on"]`), WebAudio Carbon Tonewheel synth toggle, `Ask Editor` modal, `/` catalog search modal, and the `u-s-s-y` archaeological stratigraphy easter egg.
2. **`CarbonCoverStage.svelte` (WebGPU -> WebGL2 -> Static SVG)**:
   - Interactive Three.js (`0.187.0`) hexagonal allotrope sculpture for Issue 02. Probes `navigator.gpu.requestAdapter()` for `three/webgpu` (`WebGPURenderer`), falls back to `THREE.WebGLRenderer`, and falls back to an inline SVG lattice under `prefers-reduced-motion: reduce` or software-only environments.
   - Calls `renderer.setSize(w, h, false)` so `canvas.style` is never mutated (strict CSP compliance).
   - Pauses `requestAnimationFrame` automatically via `IntersectionObserver`, `document.hidden`, or the user's `[Pause 3D]` control.
3. **Three Article Monograph Variants (`src/pages/issues/[issue]/[slug].astro`)**:
   - `data-variant="opener"`: `8fr / 4fr` hero visual plate vs. At-a-Glance spec ledger (used for Cover Story & major openers).
   - `data-variant="dossier"`: `7fr / 5fr` schematic-and-metrics split for systems/protocol monographs.
   - `data-variant="essay"`: `6fr / 6fr` balanced plate-and-context split for interface and virtualization essays.
   - Below the hero, all variants share a `7fr` (`62ch` `Newsreader`) prose + `Under the Hood` code spine beside a `5fr` provenance rail (`Verified Capabilities`, `--amber-oxide` `Field Notes & Honest Boundaries`, `Reading Guide`, and `Commit-Pinned Sources`).
4. **`CarbonPlateSvg.astro` & Preserved Issue 01 Blender Plates**:
   - Issue 01 articles mount their preserved `1600×1200` Cycles Blender `.webp` still lifes (`/assets/editorial/...`) and documented screenshots (`/assets/screenshots/...`).
   - Issue 02 articles mount bespoke `800×600` (`4:3`) Carbon Architectural SVG lithographs using XML presentation attributes (`fill`, `stroke`, `stroke-dasharray`).
5. **`SourceRoomWorkbench.svelte`**:
   - Unified 22-repository directory across Issues 01 & 02 with per-reader SQLite state (`X-Reader-Id`), live community save counts, Markdown reading-list export (clipboard + `<textarea>` fallback), and public Margin Dispatches.

---

## 4. Motion Language

- **Curves**: `--ease-carbon: cubic-bezier(0.22, 1, 0.36, 1)` and `--ease-snap: cubic-bezier(0.16, 1, 0.3, 1)`—fast initial velocity settling into a crisp mechanical stop without rubbery bounce.
- **Durations**: `140ms` micro-states, `260ms` drawer/panel transitions, `480ms` View Transition cross-fades.
- **Scroll-Driven CSS**:
  - `.scroll-progress-bar` uses `animation-timeline: scroll(root block)` gated behind `@supports (animation-timeline: scroll())` and `@media (prefers-reduced-motion: no-preference)`.
  - `.scroll-reveal` uses `animation-timeline: view()` (`entry 5% cover 24%`) so offscreen sections settle gently into place without JavaScript scroll listeners.
- **View Transitions**: Multi-page navigation opts into native `@view-transition { navigation: auto; }` and shuts off cleanly under `@media (prefers-reduced-motion: reduce)`.

---

## 5. Strict Guardrails for Gemini 4 Neon (Do & Don't)

### DO:
- **DO keep strict CSP unbroken**: Run `npm run build && npm run lint` after every UI change. Never introduce `style="..."` HTML attributes or `element.style.*` / `setAttribute('style', ...)` mutations that trigger `style-src` violations. Use CSS classes, `data-*` selectors, or SVG XML presentation attributes (`fill`, `stroke`, `transform`).
- **DO preserve every 40-char commit SHA and honest caveat**: Every factual statement about a `mojomast` repo must trace to a real commit SHA in `sources`. Never invent star counts, benchmarks, or features.
- **DO amplify the Carbon × Neon contrast**: Add kinetic electric highlights, richer View Transition morphs (`view-transition-name` on issue covers/headlines), interactive SVG diagrams, or live runtime capabilities behind the stubbed flags—while keeping the sharp `0px`-radius architectural bones, `Instrument Serif` + `Newsreader` + `JetBrains Mono` hierarchy, and WCAG AA+ contrast across all three paper stocks (`graphite`, `rag`, `oxide`).
- **DO keep progressive enhancement**: Every route must remain readable and navigable with JavaScript disabled or when `/api/*` is unreachable.

### DON'T:
- **DON'T add `'unsafe-inline'` or `'unsafe-eval'`** to `src/server/app.ts` or `deploy/nginx-ussy.host.conf`.
- **DON'T introduce generic rounded SaaS cards**, blurred purple-pink hero blobs, Tailwind utility soup, or unattributed AI stock art.
- **DON'T commit API keys, tokens, `.sqlite` files, or eval canary strings** (`npm run lint` and `npm test` enforce this automatically).
- **DON'T touch any production server, run `deploy/activate.sh`, or merge the PR**.
