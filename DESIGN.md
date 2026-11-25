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

## 8. Motion Layer (`Mo·42`): Page Turns, Springs & Ink

**Layer author:** Claude Opus 5.5, Phase 4. Carbon set the type, Neon wired the instruments, Opus wrote the words. The motion layer makes the paper behave like paper: pages turn, ink bleeds, stamps land, and the press slams shut. It lives in `src/styles/motion.css` (loaded last) plus four small hooks. No motion library: CSS does almost all of it, and the JavaScript adds 2.9 kB gzipped across the islands.

### 8.1 Principles

1. **Motion explains the press.** Every animation maps to a physical act: turning a page, inking a plate, stamping a proof, pulling a lamp chain. If a motion can't name its verb, it gets cut.
2. **The compositor does the work.** Keyframes animate `transform`, `opacity`, `filter`, `clip-path`, `stroke-dashoffset` and the `wght` axis only. `test/motion.test.mjs` fails the build if a keyframe touches anything that reflows.
3. **Full-viewport layers never get filters.** Blur on a page-sized snapshot cost the page turn 30fps on a throttled mobile profile, so page turns, scrollytelling steps and the dusk vignette use only transform and opacity. Blur is reserved for small, one-shot elements such as letters, the pull quote and the sign-off lines.
4. **Scroll is a timeline, not an event.** Parallax, reveals, the scrollytelling meter and the last-page dusk use `animation-timeline: scroll()` / `view()`, so they run without a scroll handler. The cover's 3D tilt is the one passive scroll listener; it writes a number and the render loop reads it.
5. **Reduced motion is calm and complete.** Under `prefers-reduced-motion: reduce`, nothing starts hidden, nothing moves, and cross-document view transitions are not even opted into (`@view-transition` sits inside a `no-preference` query). Study packets are not rendered at all, the cover is the static SVG lattice, and the cold open shows its finished frame. Every hidden start state lives inside a `no-preference` query, and a test enforces that.
6. **Strict CSP survives.** Per-element view-transition names come from a build-generated stylesheet (`/vt-names.css`), never `style=""`. Staggers are `nth-child` custom properties. Data-driven SVG motion is declarative SMIL (`<animateMotion>`), which needs no script and no inline style.

### 8.2 Tokens (`src/styles/motion.css`)

Springs are CSS `linear()` curves sampled from a damped spring simulation (mass 1):

| Token | Stiffness / damping | Duration | Used for |
| :--- | :--- | :--- | :--- |
| `--spring-snappy` | k520 / c34 | 410ms | Buttons, chips, nav underline, study tabs |
| `--spring-bouncy` | k300 / c14 | 1150ms | `aria-pressed` toggles, the lamp swing, the period drop |
| `--spring-soft` | k120 / c17 | 870ms | Shared-element morphs, masthead letters |
| `--spring-stamp` | k700 / c20 | 760ms | The read stamp, the cold-open seal |

| Curve / duration | Value | Used for |
| :--- | :--- | :--- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Arrivals and reveals |
| `--ease-in-out-quint` | `cubic-bezier(0.83, 0, 0.17, 1)` | The outgoing page, the plates opening |
| `--ease-press` | `cubic-bezier(0.7, 0, 0.84, 0)` | The cold-open plates slamming shut |
| `--ease-ink` | `cubic-bezier(0.45, 0, 0.15, 1)` | Ink: the stock flood and study lines drawing (`pathLength="1"`), a slow start and then it soaks in |
| `--dur-micro` / `-short` / `-medium` / `-long` / `-scene` | 120 / 240 / 420 / 700 / 1100ms | Hover, press, reveal, page turn, cinematic beats |
| `--stagger` | 45ms | Per-word and per-letter cascades |

### 8.3 Signature motions

1. **Page turns** (every route). Cross-document View Transitions: the old page swings away on its spine (`rotateY(-22deg)`) while the new one slides in from the fore-edge. Direction is real, not cosmetic. `public/motion-boot.js` (524 B, render-blocking by design) reads `data-dir="backward"` links, the j/k folio keys and `navigation.activation` (so the browser Back button turns pages backwards), then adds a `forward`/`backward` view-transition type.
2. **Shared-element morphs.** Headlines (`hl-{issue}-{slug}`), feature plates (`plate-…`) and issue covers (`issue-art-n`) carry the same name on every page they appear, so cover → contents → feature → back, and the archive → issue, morph in place on the soft spring. `<link rel="expect" blocking="render">` holds the first frame until all named elements are parsed. Names are unique per page, and both the built stylesheet and a headless sweep of all 30 routes check this.
3. **Ink flood.** Changing paper stock (Graphite, Rag, Oxide) is a same-document view transition of type `ink`: the new stock spreads out from the stock controls as a `clip-path` circle over 1.1s. For its duration `html.is-inking` strips the shared-element names, so the page takes the ink as one sheet instead of crossfading in pieces.
4. **Kinetic type.** `Kinetic.astro` splits headlines into words at build time (the sentence stays whole for screen readers and search). Words rise out of their own baseline in a 45ms cascade, held back on page-turn arrival so they land after the morph. The masthead drops S-L-O-P letter by letter while the Syne `wght` axis presses from 420 to 800; *Illustrated* bleeds in like wet ink and the full stop drops last. On hover the letters breathe on the weight axis.
5. **Scroll-driven reading.** Plates parallax inside their frames, contents rows and side panels rise in, the drop cap settles, and the pull quote slides in, all on `view()` timelines. The hero and issue masthead drift on `scroll(root)`.
6. **Pinned scrollytelling** (Issue 02 front page, "If you let machines write the code…"). A sticky question with a progress meter driven by a named `view-timeline`; five verbatim lines from the editor's letter come into focus one at a time, each linked to its feature, ending on the gilt coda.
7. **Living studies.** Each step remounts its diagram: lines draw themselves (`stroke-dashoffset`), boxes and nodes spring in, labels fade up. Data packets travel the real path: a worker's patch to the bwrap gate and out to *integrated* or *quarantine* (Rizzstack); a click to the approval gate (uirizz); a radar sweep along the Doppler curve; a coin over the pusher's lip (Jackpot). The photo-to-part gear turns once the template exists. Packets pause offscreen (`pauseAnimations()`) and are never rendered under reduced motion.
8. **The swarm** (cover, WebGPU and WebGL2). 1,600 bees (700 on phones) orbit the hive. Positions are computed on the GPU from a per-particle seed: TSL `SpriteNodeMaterial` with instanced attributes on WebGPU, and a GLSL `ShaderMaterial` on WebGL2. The CPU updates five uniforms per frame. The swarm leans toward the pointer, bursts when you pick a cell, and loosens while the hive tilts away and the camera dollies back as you scroll off the cover. A one-shot quality governor halves the swarm and drops to 1x pixels if the median frame exceeds 22ms. "Hold still" stops everything, and the SVG lattice remains the fallback.
9. **Cinematic cold open.** Two dark plates slam shut on a press thunk, with a flash of warm paper light and a 260ms impact shake. The press-run log types out, then S-L-O-P bleeds in letter by letter, *Illustrated.* follows, and the gilt seal stamps down on the stamp spring with an ink splash. On exit the plates part like a press opening onto the cover. Skip, focus return and reduced-motion behaviour are unchanged from §7.3.
10. **The last page at dusk.** A vignette closes in as you scroll to the sign-off (named `view-timeline`, `timeline-scope: --dusk`). The sign-off lines come up out of the dark, *Slop, Illustrated.* gets a hand-drawn gilt underline, and the lamp swings on its chain when pulled. Leave the light on and the vignette lifts while dust drifts in the lamplight.
11. **Springs everywhere you touch.** Buttons lift and press, toggles bounce into their pressed state, nav underlines draw on a spring, the read tick pops and the "Marked read" stamp lands, and the counter pops when the issue is complete.

### 8.4 Measured (headless Chrome 157, 4× CPU throttle, SwiftShader software GPU)

Feature pages, studies and the last page hold 59.5–60fps on both phone and desktop profiles with zero long tasks; the page-turn arrival holds 60fps on the phone profile. The live 3D cover is the expensive part, and only because this machine has no GPU: WebGL2 runs it at 45–60fps, while WebGPU on SwiftShader reaches about 49fps on the phone and 13fps at desktop size (it was 17fps before the swarm, so the existing scene is most of that cost). On real hardware it is GPU-bound and cheap: 0.3–0.6ms of main-thread JavaScript per frame even under 4× throttle.

## 9. Wave 9: Over the Top (`Fx·∞`)

**Layer author:** Claude Opus 5.5 as orchestrator, with six Gemini 4 Neon implementers (one per track, each in its own worktree and branch, merged after review). Everything lives under `src/scripts/fx/`, `src/styles/fx/` and `src/components/fx/`, loaded after idle by `src/scripts/fx/index.ts`.

### 9.1 The gate
`src/scripts/fx/capability.ts` publishes `html[data-fx="off|lite|full"]` and `data-pointer`. **off** = reduced motion: nothing moves. **lite** = coarse pointer, under 4 GB memory, under 4 cores, Save-Data, or a software GPU (SwiftShader/llvmpipe, probed once and cached as `si.gpu` for the boot script): CSS effects only, no per-frame JS, no full-viewport layers. **full** = everything, paused offscreen and in hidden tabs. Per-frame values go through `setVars()` (one adopted constructable stylesheet: CSSOM, which `style-src` doesn't govern; no `style` attributes anywhere).

### 9.2 Effects by track
- **Shader:** ink-in-water backdrop (TSL → WebGL2 → CSS gradient), film grain and vignette, cover chromatic aberration, glow and selection shockwave, plate hover ripple.
- **Typography:** decoding mono labels, Syne `wght` pressure wave under the cursor, per-glyph section reveals, ink-sweep gradient text, rate-limited glitch, outlined marquee band.
- **Cursor:** ink-nib trail with READ/OPEN/PLAY/loupe/caret states, magnetic buttons, 3D tilt with glare, click ink splats, opt-in sound ticks.
- **Transitions:** route-aware page turns (`press` to a feature, `ink-wipe` to a cover, `fold` home, `dusk` to the last page), registration-mark overlay, more shared morphs (brand, chips, folio codes, read stamps), dialog unfold and study slides.
- **Scrollytelling:** the Press Run (pinned horizontal sheet feed on each cover), depth parallax in features, scroll-driven counters, reading-progress ink with chapter ticks, corrections strike-in, archive fan-out, alternating strata.
- **Delight:** MAXIMUM RIZZ (Konami or type `rizz`; Esc or the pill to leave), printer's devils, night lamplight, December type sorts, press-day ribbon, Shift-click ink blot, `proof` overlay, console greeting.
- **Polish (orchestrator):** `scroll-state()` masthead rule, `sibling-index()` nav set-in.

### 9.3 Rules this wave added
1. No `mix-blend-mode`, `backdrop-filter` or animated `filter` on fixed full-viewport layers; no fixed layer that isn't drawing something.
2. Large background gradients cover a bounded area (the ink wash is the first 140vh), never the whole body.
3. Font-weight animations are time-based and one-shot, never scroll-linked.
4. Anything per-glyph or per-label (splits, decodes) is full tier only.
5. The heavy page turns are full tier only; lite gets the §8 page turn.

### 9.4 What measurement found
Merged as built, the wave took a 4×-throttled 390px feature scroll from 60 to ~22fps and a desktop one from 58 to ~8fps. Bisecting by track, then by layer, then by property found: whole-body color-mix gradients re-rasterized on every repaint; blended full-viewport grain; an empty fixed backdrop forcing the body into one giant composited layer; section-tall parallax textures; and scroll-linked weight changes. After the rules above, mobile feature scroll is back to 60fps. The full tier was profiled only on a software GPU here; its main-thread cost (pressure wave ~1.4 ms/frame unthrottled, cursor trail ~1.4 ms/frame) is the number that transfers to real hardware.

### 9.5 Research sources
Three.js WebGPURenderer and RenderPipeline docs; Codrops (2026): dual-scene fluid X-ray, GoodGrowth flow-map smear, shader stamp loupe, GSAP clip-path wipes, EXAT variable-type showcase, mineral-collection halftone; Chrome for Developers: View Transitions in 2025, element-scoped view transitions, `scroll-state()` queries, `shape()`, scrollability affordances; web.dev Baseline 2026 and WebGPU support; MDN `style-src`.

## 10. Taste Pass (`Ta·73`): Restraint, Rhythm & Editorial Discipline

**Layer author:** Claude Opus 5.5, Phase 7, guided by `Leonxlnx/taste-skill` (`design-taste-frontend` v2.5.1, installed with its MIT license in `.cursor/skills/design-taste-frontend/`). After six waves of features and effects, the magazine needed an editor's red pencil: keep the Night Hive DNA, the copy voice (§7), and the memorable moments, while cutting everything generic, broken, or loud.

### 10.1 References & Bar
- **Interface restraint (`figma.com` and `x.ai` via `tasteskill 2.5.1`):** one compact, opaque navigation bar instead of a multi-row control cockpit; 90–95% neutral ground with one disciplined accent; equal content edges; zero layout shift; real contrast on every label and button; quiet hover micro-interactions rather than gimmicks.
- **Editorial print craft (Swiss grid periodicals, `interfaces.dev`):** typography and alignment carry the spread; numbers are always accurate at rest; no captions repeating text already drawn inside a technical plate; no violet/lavender creeping into a Graphite/vermilion/gilt/cyan palette.

### 10.2 What Real-Browser Checking Caught (`consistency.mjs`, `perf.mjs`, `copy-lint.mjs`, visual review)
1. **Five-row mobile header (230px) & two-row desktop cockpit (108px):** 14 controls in the sticky header ate a quarter of the phone viewport and introduced 4 competing button styles on screen 1.
2. **False numbers at rest (`StatNumber`/`StatText`):** Phase 6's scroll-linked `view()` counters sat halfway through their timeline at `scrollY = 0`, telling visitors the issue had *"5 features, 2 dispatches"*, *"#90 to #95"*, and *"1 contracts"* instead of 11, 4, #201–#211, and 4.
3. **`CLS = 1.508` desktop / `1.012` mobile (`perf.mjs` FAIL):** `fx-ink-press` animated Syne's `wght` axis on headings as they scrolled into view, reflowing every block underneath.
4. **Broken WebGL shader fallback (`gl-fallback` FAIL):** when a strict or broken GPU rejected shader compilation, `CarbonCoverStage.svelte` rendered a black empty box instead of dropping to `STATIC SVG`.
5. **Overlapping reading rail:** at `1440×900`, `ReadingInkRail` chapter pills (`UNDER THE HOOD`) collided directly on top of the `OPEN THE REPO ↗` button.
6. **Primary button WCAG AA failure (`3.44:1`):** white text on `#ff4422` vermilion fell below `4.5:1`.
7. **Violet hive cells & `/%23g` 404:** three article spot inks (`#a855f7`, `#6d28d9`, `#7c3aed`) introduced purple cells into the hive, and LightningCSS turned the unencoded SVG noise `url(%23g)` into a broken `/%23g` network request.
8. **Typographic & focus nits:** `Who Watches the Bees?.` double punctuation, `SLOPIllustrated.` missing accessible space, italic `d` right-edge clipping, `.opus-cold-open:focus { outline: none }`, all-caps body prose in the Source Room desk, and a 2px mobile right-edge clip on `.cover-node-btn`.

### 10.3 Decisions: What Changed, What Was Cut, What Stayed
- **Single-row masthead (58px desktop, 56px mobile):** desktop carries `Si. Slop Illustrated`, the 6 borderless nav links (`aria-current="page"` 2px vermilion rule), and 3 uniform ghost controls (`Find /`, `Ask Editor`, `Press ▾`, which opens the flat Press Desk tray for Paper Stock, Grid, Sound, Flexi-disc, and Shortcuts). Mobile shows `Si. Slop Illustrated`, `Find /`, and a 44px `Menu ☰` sheet with 48px Instrument Serif section rows and equal-width Paper Stock controls.
- **Hero restraint & alignment:** front-page hero trimmed to two buttons on one line (`Open Issue 02 ↗` + `Read cover story`) plus a quiet inline link to the cold open; `.hero-highlights-dl` aligned flush to the left margin; redundant caption box removed under the front-page cover-story SVG; Issue 02's `Replay the opening` tucked cleanly into the cover header strip.
- **True Four-Voice Typography & WCAG AA+ contrast:** removed the redundant 5th font (`Space Grotesk`) to match §2.2's four voices (`Instrument Serif`, `Syne`, `Newsreader`, `JetBrains Mono`); added `--ink-on-signal` (`#0b0c0e` on Graphite, `#071522` on Oxide, `#ffffff` on Rag → `5.7–7.6:1` contrast); replaced violet spot inks with crimson/cobalt/cerulean and bounded Max Rizz hue drift away from violet.
- **WebGL fallback probe & base64 grain:** `CarbonCoverStage.svelte` now runs a compile+link shader health probe before leaving `STATIC SVG` and dials back idle chromatic aberration so the hive is razor-sharp at rest; SVG noise tiles are base64-encoded (zero `/%23g` 404s) and the body ink wash is softened ~35%.
- **Cut for taste & stability:** scroll-linked stat counters (false figures on load), `fx-ink-press` scroll weight reflow (`CLS 1.508 → 0.002` desktop, `1.012 → 0.000` mobile), 3D card tilt and magnetic buttons (replaced with flat Swiss 2px card lift and 1.025 plate zoom inside `overflow: hidden` frames), giant outlined `SLOP ILLUSTRATED` background marquee on `.mo-scrolly::before`, and `ReadingInkRail` overlap below `1520px` (chapter labels `>= 1680px`).
- **Preserved:** the Cold Open, WebGPU → WebGL2 → SVG 3D Hive + GPU bee swarm + cell shockwave, all 10 interactive step-through studies, cross-document page turns + shared-element morphs + ink-flood stock switch, pinned scrollytelling + Press Run, ink-nib follower + click splats, decoding mono labels, Last Page at dusk + reading lamp, proofreader ticks + Corrections, and MAXIMUM RIZZ / `proof` / `u-s-s-y` / opt-in sound.
