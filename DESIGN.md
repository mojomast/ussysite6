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

---

## 6. Neon Layer (`Ne·10`) — Motion, Interaction & Live Instruments

**Layer Author:** Gemini 4 Neon (`Ne·10`, atomic weight `20.180 u`)  
**Relationship to Carbon:** Carbon (`C·06`) owns the structural press, grid geometry, paper stocks, and quiet `Newsreader` prose spine. **Neon (`Ne·10`)** is the **excited gas-discharge signal layer** that illuminates *interactive state*—live step-through diagrams, optical View Transition morphs, keyboard folio detents, WebGPU TSL lattice accents, docked Audio Edition transport, and the multi-turn Ask-the-Editor press wire—without disturbing the editorial calm of static text.

### 6.1 Calibrated Neon Signal Tokens (`src/styles/tokens.css`)

| Token | `graphite` | `rag` (Daylight) | `oxide` (Blueprint) | Role |
| :--- | :--- | :--- | :--- | :--- |
| `--neon-cyan` | `#22f3e6` | `#006b76` | `#5efce8` | Primary excited-state signal: active study step, live audio meter, keyboard HUD, WebGPU TSL rim |
| `--neon-cyan-soft` | `rgba(34,243,230,0.12)` | `rgba(0,107,118,0.10)` | `rgba(94,252,232,0.14)` | Subtle discharge bed for active tabs & editor replies |
| `--neon-lime` | `#b8ff3c` | `#356600` | `#c7ff5e` | Verified PASS rails & green-state instrument indicators |
| `--neon-halo` | `0 0 0 1px cyan/42% + 22px 14%` | `0 0 0 1px cyan/45% + 16px 12%` | `0 0 0 1px cyan/45% + 22px 16%` | Crisp hairline optical glow reserved strictly for mounted live instruments |
| `--ease-neon` | `cubic-bezier(0.12, 0.92, 0.24, 1)` | — | — | Rapid optical-shutter curve for View Transitions and step-through switches |

### 6.2 Neon Interactive Components & Motion Grammar

1. **Interactive Step-Through Monograph Studies (`src/components/islands/InteractiveStudy.svelte`)**:
   - Mounts inside any monograph whose `secondaryMedia.kind === 'svg-study'`, covering **10 bespoke state machines**: 5 Issue 02 systems (`rizzstack`, `uirizz`, `doppler`, `photopart`, `jackpot`) and all 5 archived Issue 01 studies (`cocs`, `rgbagentflightindicator`, `warpi`, `hermesdashboard`, `becomussy`).
   - Supports full keyboard stepping (`ArrowLeft` / `ArrowRight`, `Home` / `End`, step tabs, and `Prev`/`Next` buttons), live ARIA status announcements, and zero inline `style=""` attributes.
2. **Class-Scoped View Transition Morphs & `j`/`k` Folio Shortcuts**:
   - Shared `view-transition-name` classes (`.vt-masthead`, `.vt-issue-title`, `.vt-issue-stage`, `.vt-article-headline`, `.vt-article-plate`) morph smoothly across pages (`380ms var(--ease-neon)`) and collapse cleanly under `prefers-reduced-motion: reduce`.
   - Global keyboard navigation in `PressControls.svelte` binds `j` / `]` (next folio), `k` / `[` (previous folio), `/` (catalog finder), `?` (shortcut reference modal), and `u-s-s-y` (Ussyverse Stratigraphy), displaying a brief Neon HUD pill on navigation.
3. **WebGPU TSL Cover Accent (`src/components/islands/CarbonCoverStage.svelte`)**:
   - On WebGPU-capable browsers, uses `three/tsl` (`MeshStandardNodeMaterial`, Fresnel view-angle rim + travelling time uniform discharge wave) on the Carbon Allotrope core and active cell; degrades gracefully to an enhanced WebGL2 Neon orbital discharge ring and then to a static SVG lattice under reduced motion or no-GPU environments.
4. **Multi-Turn Ask the Editor Press Wire & Docked Audio Edition Transport**:
   - **Ask the Editor** slides in as a right-hand press-wire drawer with starter prompt chips, multi-turn conversation history, BM25-weighted local catalog grounding when `FEATURE_ASK_EDITOR=false`, and live **`gemini-3.5-flash-lite`** (verified current stable Flash-Lite model ID) synthesis when `FEATURE_ASK_EDITOR=true` + `GEMINI_API_KEY` are set.
   - **Audio Edition (`AudioEditionBar.svelte`)** docks a compact flexi-disc / tape transport at the viewport bottom to step through an issue's 11 harmonic WebAudio tracks with a pure-CSS 5-bar phosphor meter and a flagged server narration hook (`FEATURE_AUDIO_EDITION` / `gemini-3.8-flash-lite-tts` + SQLite cache table `audio_editions`).
5. **Syndication (`/rss.xml`)**:
   - Static RSS 2.0 feed generated at build time (`src/pages/rss.xml.ts`) exposing all published issues and commit-pinned monographs.


---

## 7. Opus Layer (`Au·79`, gold leaf): Voice & Signature Moments

**Layer author:** Claude Opus 5.5. Carbon set the type and Neon wired the instruments. Opus does the finishing: the words, and a few moments people will remember. Gold leaf goes on last and sparingly.

### 7.1 Voice guide

The magazine sounds like a good editor who has read the code: dry on the surface, warm underneath, and never vague.

- **Specific beats general.** Name the file, the number and the commit: `gear_steer.py`, 2 of 18, `@b8cd1fe`. If a sentence would fit any project, cut it.
- **The joke always points at something true.** "A coin-pusher game that miscounts coins is just a sad sculpture" works because the latest commit checks the bankroll against every announced change. A joke that is not anchored to a fact gets cut.
- **Credit before cleverness.** Upstream work is named in the first paragraph: Warp, Guitar Companion, God's Eye View, colsto, Terry A. Davis.
- **Say the limits in plain words.** "It doesn't do X yet" beats "X is on the roadmap." The sidebar is titled *What it doesn't do (yet)*.
- **Short declaratives.** One idea per sentence. Em dashes are rationed; colons and full stops do the work.
- **Pull quotes are pulled.** Every pull quote appears verbatim in its own article, and a test enforces it. Quotes from READMEs are attributed to the README. We never invent people, quotes or numbers.
- **Self-aware about slop, never smug about it.** The tagline admits what most machine writing is; the Corrections column admits what ours got wrong.
- **Banned phrasing** (enforced by `test/copy.test.mjs`): delve, tapestry, testament to, seamless, leverage, unlock, elevate, game-changer, cutting/bleeding-edge, "in today's…", fast-paced, state-of-the-art, world-class, filler "robust", empower, revolutionize. No hollow triads, no "not just X, but Y".
- **Microcopy talks like a person.** "Save for later", "Copy citation", "Hold still", "Leave the light on". Empty states say what to do next.

### 7.2 Tokens (`src/styles/opus.css`)

| Token | `graphite` | `rag` | `oxide` | Role |
| :--- | :--- | :--- | :--- | :--- |
| `--gilt` | `#e8c36a` | `#7a5600` | `#f3d27f` | Gold leaf, reserved for the editor's signature, the cold-open seal, the last page, and "read cover to cover" |
| `--gilt-soft` / `--gilt-glow` | 14% / hairline + 36px | 10% / hairline + 22px | 15% / hairline + 36px | Beds and halos for gilt moments only |
| `--proof-ink` | `#ff5a3c` | `#b3230a` | `#ff7a5c` | Proofreader's red: read ticks, Corrections numbering, the end-of-article mark |

### 7.3 Signature moments

1. **The cold open** (`ColdOpen.svelte`, Issue 02 cover). A 6.6-second press-run log built only from true lines (`W4-weakened-tests: tests_tampered ··· rejected`, `2 of 18 ··· printed anyway`), then the masthead slams in under a gilt `Si.` seal. Once per session; replay via the button or `/issues/02#opening`. It mounts only after hydration, so without JavaScript you go straight to the cover. Skip with a click, Enter, Space, Esc or the focused Skip button, and focus returns to `#main-content`. Under `prefers-reduced-motion` it never autoplays, and a replay shows the finished frame with no timer.
2. **Corrections** (front page). A magazine written with machines publishes what it got wrong, including errors from earlier drafts of this very issue. The list is content (`corrections:` in issue frontmatter), so future issues inherit the habit.
3. **Proofreader's ticks** (`src/scripts/reading-tracker.ts`). Reaching the end mark of a feature stamps "✓ Marked read · n of 11" in red ink, and every contents list on the site strikes it through. Read all eleven and the counter turns gilt and thanks you. It is stored in localStorage only.
4. **The last page** (`/issues/[issue]/last-page`). The final feature's "next" turns to it. It holds a slow, large-type sign-off, the list of everything this domain used to be marked *still public* ("Nothing was deleted. That's the whole policy."), and a reading lamp that dims as you scroll to the end (a scroll-driven `view()` timeline). **Leave the light on** keeps it lit, and remembers.
5. **Sound, opt-in** (`carbon-synth.ts`). A **Sound off** toggle in the masthead is off by default, and the choice persists. With it on you get a pen tick on saves and study steps, a page turn on `j`/`k`, a press thunk under the cold-open seal, and the lamp's click and hum. Play buttons still play chords, because pressing Play is consent. Everything is synthesized, with no audio files.
6. **Small delights.** The `Si.` badge's full stop drips like wet ink on hover; the 404 is a proof note that strikes through the missing page; the `u-s-s-y` basement now reads like a family album; Ask the Editor answers "from the archive" in the magazine's voice when the live model is off.

### 7.4 Guardrails Opus kept

Strict CSP is unchanged: no inline styles or scripts, and timing lives in CSS `nth-child` delays, never `style=""`. The WebGPU > WebGL2 > SVG cover chain is untouched. The Gemini endpoints stay behind `FEATURE_*` flags, off by default, with no keys committed. The new islands are small (`ColdOpen`, `PressLamp`) and the tracker is a few kilobytes; none of them pulls in Three.js.
