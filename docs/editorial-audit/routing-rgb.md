# Editorial audit — RouteTok (`routetok`) & RGBAgentFlightIndicator (`rgbagentflightindicator`)

**Publication:** SLOP ILLUSTRATED (Si.) — Issue 01, October 2026
**Auditor scope:** `routetok` (catalog index 6, pp. 56–65, service #106) and `rgbagentflightindicator` (catalog index 7, pp. 66–73, service #107), plus their SVG and Canvas graphics labels.
**Researched:** 2026-10-13
**Repos audited (canonical, GitHub):**

| Project | Canonical repo | Default branch | Revision audited (current tip) | Readme/source read |
|---|---|---|---|---|
| RouteTok | https://github.com/mojomast/routetok | `main` | `7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3` (2026-09-16) | README, `src/router.ts`, `src/types.ts`, `docs/api.md`, `docs/providers.md`, `test/integration/committed-stream.test.ts`, `package.json` |
| RGBAgentFlightIndicator | https://github.com/mojomast/rgbagentflightindicator | `main` | `fc7378d037576c090322e623a5a3bbeafb97d619` (2026-10-02, release 0.8.0) | README, `rgi/appearance.py`, `rgi/daemon.py`, `rgi/webconfig.py`, `rgi/webui/lib/color.js`, `rgi/backends/base.py`, `pyproject.toml` |

Both revisions were confirmed with `gh api repos/mojomast/<repo>/commits/main` and a shallow clone; each was cross-checked against `git rev-parse HEAD` in the clone. Per budget, no source repo was modified.

**Method:** read the README + actual source/config/tests at the pinned SHA; classify every catalog copy claim as *verified*, *unsupported*, *fabricated*, or *misattributed*; correct the catalog to only what the repository supports; pin a short real code excerpt with `codeSource`, add 3–5 `sources`, `sourceRevision` and `researchedAt`.

---

## 1. Upstream attribution & provenance

### RouteTok

- **Own work, no external upstream.** `package.json` declares `"author": "mojomast"`, `"repository": github.com/mojomast/routetok`, MIT, `version 0.1.0`, `private: true`. Git history at the pinned SHA is single-author. Nothing is vendored or forked.
- **Provenance note (internal rename, not an upstream fork):** the code still carries legacy `agentrouter` provider IDs (README "Compatibility", `src/router.ts` `providerId == "agentrouter"` fallbacks, `src/metrics.ts` `agentrouter_router_*` families) and `docs/api.md` states *"A future release will drop the `agentrouter_router_` prefix and keep only `routetok_`."* This is an earlier-internal-name trail, authored by the same person.
- **Local related checkout verified:** `/home/mojo/projects/agentrouterrouter-dev` has `origin = https://github.com/mojomast/routetok.git` and `HEAD = 7016c8de…` — identical to the canonical repo. `/home/mojo/projects/agentrouterrouter` is a **non-git production deployment copy** of the same code (`package.json` name `routetok`); it is not a separate project. Neither is an upstream dependency of the catalog entry.
- **Non-affiliation:** the README explicitly states RouteTok *"is independent and is not affiliated with or endorsed by any model or inference provider."* The catalog must not imply endorsement by Anthropic/OpenAI/OpenRouter.

### RGBAgentFlightIndicator

- **Own work, no external upstream.** `pyproject.toml` declares `name = "rgbagentflightindicator"`, `version = "0.8.0"`, `authors = [{ name = "mojomast" }]`, MIT, `Development Status :: 3 - Alpha`.
- It **implements documented third-party protocols** rather than vendoring them: OpenRGB SDK, QMK/VIA, Sinowealth/EVision vendor HID protocols, Windows HID LampArray, SteelSeries GameSense, WLED. Credit for those protocol/spec owners belongs to them; the daemon, backends, API, Web UI and tests are the author's.
- **Local related-repo verification:** `/home/mojo/projects/firmware` has `origin = github.com/mojomast/warpussy.git` (a Rust game/tool, `master`), **unrelated** to this project. `/home/mojo/projects/firebreak-approval-flight` is a single untracked `index.html`, **unrelated**. No local firmware repo corresponds to RGBAgentFlightIndicator; there is no keyboard firmware component in the repository.

---

## 2. RouteTok — old claim audit

| Old catalog claim | Status | Evidence at `7016c8d` | Correction applied |
|---|---|---|---|
| "Zero External Dependencies" / "zero-dependency Node.js core" | **Partially verified → qualified** | `package.json`: no `dependencies`; `devDependencies` = `@types/node`, `tsx`, `typescript`. `AGENTS.md`: "Zero runtime dependencies… only devDependencies are allowed." | "Zero runtime npm dependencies; devDependencies limited to TypeScript, tsx and @types/node." |
| "0.35 ms routing overhead" | **Fabricated / unmeasured** | No benchmark or latency number in README, docs, or `scripts/`. | Removed. Metric replaced with `Runtime Deps = 0 npm Packages`. |
| "Failover under 15 ms / < 15 ms Instant" | **Fabricated / unmeasured** | No latency claim anywhere; no benchmark harness for routing overhead. | Removed. Metric replaced with `Failover = Pre-output Only`. |
| "Mid-stream failover with zero dropped tokens" / "reader never sees the seam" | **False** | README: *"Health-aware **pre-output** fallback **without splicing streams across models**."* `test/integration/committed-stream.test.ts` (lines 232–246, 264–280) asserts a committed stream relays/ends with a truthful `stream_interrupted` frame + `[DONE]`, and never re-channels to another model. | "Fallback is pre-output only; a committed stream ends with `stream_interrupted`, never a splice." |
| "Latency- and cost-weighted multi-armed bandit" / "MULTI-ARMED BANDIT" | **Fabricated** | No occurrence of "bandit" in `src/` or docs. `HealthRouter.score()` (src/router.ts L267–277) ranks by order index, success rate, consecutive failures, in-flight count and latency EWMA — a deterministic health score, **no cost term, no reward/exploration update**. | Rewritten to "ranks candidates by success rate, consecutive failures, in-flight count and latency EWMA." |
| "Three-state finite state machine / Circuit Breaker CLOSED / OPEN / HALF-OPEN" | **Verified** | `src/types.ts` L99 `circuitState: "closed" | "open" | "half-open"`; `src/router.ts` L139–148, L240–245; `docs/api.md` L77. | Kept (corrected to lowercase `closed / open / half-open`). |
| "429 or stall trips the breaker to OPEN" | **Imprecise** | `recordRateLimit()` (L216–221) sets a `rateLimitedUntil` cooldown; it only *reopens* a `half-open` circuit. A plain 429 does not necessarily OPEN a closed circuit. | Body now says a failing route is kept out for a cooldown; the SVG/Canvas 429-vs-OPEN label is flagged below. |
| "SSE token accounting proxy measuring TPS, cache hits, budget burn" | **Verified** | README Highlight; `docs/api.md` `/metrics` families (`tokens_total`, `ttft_seconds_sum`, `generation_seconds_sum`, `estimated_cost_usd_total`, cache read/write). | Kept, tightened. |
| "Model Fieldbook: pricing, context limits, capability matrix" | **Verified** | README "Model Fieldbook"; `docs/fieldbook.md`. | Kept. |
| "Mid-outage failover across OpenRouter, Anthropic, OpenAI & local vLLM" | **Overstated / misnamed** | `docs/providers.md`: providers are `agentrouter`, `openrouter`, `requesty`, `opencode`, `kimi`, `groq`, `deepinfra`, `openai-codex`, `github-copilot`, generic OpenAI-compatible, and local Speaches STT. No vLLM backend is named. | Replaced with generic "OpenAI- and Anthropic-compatible providers". |
| "Bell-Labs-Grade" | **Puffery, no basis** | No reference in repo. | Removed from headline. |
| "Deterministic policy rules for reasoning vs fast-completion tasks" | **Unsupported as stated** | `requirements.tools`/modalities filter candidates (`router.ts` L46–58), but there is no stated "reasoning vs fast-completion policy". | Replaced with verified circuit/failover capability. |
| Byline "Switching & Telemetry Division" | **Fabricated bureau** | No such entity. | Replaced with `By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.) · github.com/mojomast`. |
| Pull quote in quotation marks | **Fabricated quote** | Not a real quotation. | Converted to a declarative editorial takeaway (no quote marks, no attribution). |
| Screenshot caption "Operations dashboard and live model-health table" | **Partly inaccurate** | `assets/screenshots/routetok.png` (1440×1000) shows the operations dashboard with success rate, throughput, TTFT, fallback rate and "Performance Trends"; the separate model-health table is `docs/images/dashboard-models.png`. | Caption changed to "RouteTok operations dashboard: live success rate, throughput, TTFT, fallback rate and retained performance trends". Path/dimensions preserved. |

**Development state:** v0.1.0, MIT, Node.js ≥ 22, strict TypeScript/ESM, Docker + Compose, unit + integration test suites, Prometheus metrics, no runtime dependencies. Pre-1.0 but actively developed; `pushed_at` 2026-10-07 reflects activity on side branches (Dependabot, `fix/jev-live-contract`) beyond the `main` tip audited here.

**Code excerpt pinned (real, replaces the invented `selectHealthyUpstream`):** `src/router.ts` L139–L148, circuit-breaker admission — `codeSource.url` = `.../blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/src/router.ts#L139-L148`.

---

## 3. RGBAgentFlightIndicator — old claim audit

| Old catalog claim | Status | Evidence at `fc7378d` | Correction applied |
|---|---|---|---|
| "60 Hz per-key RGB matrix synthesis" / "60Hz animation compositor" / "60 Hz HID" / "60Hz LED compositor" | **Fabricated** | `rgi/daemon.py` L73 `TICK = 0.12` (≈8.3 Hz render loop), L74 `BLINK_PERIOD = 0.28`. Backend `min_interval` floors: `evision` 0.008 s, `qmk` 0.002 s, `openrgb` 0.02 s. No 60 Hz figure anywhere in the repo. | Removed all 60 Hz claims; replaced with "only changed frames are written". |
| "event-to-LED under 6 ms" / "Signal Latency < 6 ms" | **Fabricated / unmeasured** | No latency measurement in source, docs or tests. | Removed. Metric replaced with `State Palette = Green / White / Blinking Red`. |
| "Up to 24 concurrent agent slots on one keyboard" | **Unsupported** | `rgi/cli.py` L550 `--count` default **12**; README "Configuration" `--count | 12`. No 24 cap. | "Default 12 lanes (`--count`), configurable". |
| "Colourblind-safe Airbus/Boeing caution palette" / "validated for the common colour-vision deficiencies" | **False as a default claim; feature exists but is opt-in** | `rgi/webconfig.py` `default_states()` L78–92: `working` `#00ff00`, `done` `#ffffff`, `blocked`/`error` `#ff0000` — a pure green/red default. `rgi/webui/views/appearance.js` L20/L46–47 offers a "Colour-blind safe" preset; `rgi/webui/lib/color.js` L40–45 simulates protanopia/deuteranopia/tritanopia and exposes `contrast`. No Airbus/Boeing palette derivation. | "The web UI ships a colour-blind-safe preset and protanopia/deuteranopia/tritanopia simulation; the default palette is green/white/red." |
| "Local webhook and Unix-socket daemon" | **Half false** | HTTP daemon on `127.0.0.1:8730`; `POST /hook/<source>` webhook ingest is real (`docs/ingest.md`). **No Unix socket** anywhere in `rgi/`. | "Local HTTP API", plus hook/webhook ingest. |
| "USB hotplug auto-recovery" / "replug" | **Verified** | `rgi/daemon.py` L1034–1043: on write failure the daemon reopens the device and logs "reconnected"; README "Things that bite". | Kept. |
| "Direct USB HID / OpenRGB / QMK raw-HID protocol driver" | **Mostly verified** | `rgi/backends/`: `sinowealth`, `evision`, `openrgb`, `sysfs`, `qmk`, `lamparray` (HID LampArray), `gamesense`, `http_light`, `wled`, `dummy`. | Kept as a backend registry list. |
| "Mapping individual physical keycaps to agent slots" | **Verified (per-key backends only)** | README backend table L93–100: QMK is **per-key on Vial firmware**, one colour on stock QMK+VIA; Sinowealth and EVision are per-key and verified on hardware; OpenRGB/sysfs/QMK not yet run on a board. | Kept, qualified. |
| "Priority-layered 60Hz animation compositor blending breathing states with urgent approval strobes" | **Partly verified / partly fabricated** | Bounded vocabulary `off | steady | blink | breathe` with period/duty/cycles (`rgi/appearance.py` L48–77). "60 Hz" fabricated; "priority-layered" is not stated. | Rewritten to the bounded LED vocabulary. |
| "Zero-CPU-spike daemon footprint" | **Unsupported** | No profiler/benchmark; the daemon intentionally freezes frames while typing (README). | Removed. |
| "F1–F12 fleet status, number-row token throughput waves" | **Unsupported as a mapping** | Default lane keys are backend lamp indices (README example: lanes on `, 1, 2, 3 …`); default `--count 12`. Token-throughput "wave bars" are not a feature; token/cost/context are OTLP metadata (`docs/otlp.md`). | Rewritten to "one lane per session" and 12 configurable lanes. |
| "Instant human-in-the-loop permission request wave alerts" | **Only partly** | `blocked` state blinks red (README legend). "wave alerts" is invented. | "blinking red when a human is needed". |
| "Rust / Python" | **False** | The project is **pure Python** (`rgi/*.py`; `pyproject.toml`); a JS Web UI exists under `rgi/webui/`. No Rust. The old code excerpt was fabricated Rust. | `Python 3.10+` stack; excerpt replaced with real Python. |
| "Unix Sockets" | **False** | No Unix socket; HTTP only. | Removed. |
| Byline "Avionics & Human Factors Lab" | **Fabricated bureau** | No such entity. | Replaced with `By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.) · github.com/mojomast`. |
| Pull quote in quotation marks | **Fabricated quote** | Not a real quotation. | Converted to a declarative editorial takeaway. |

**Honest facts the catalog should keep:** the project itself is candid about hardware verification (README "Status and honesty" L341–349): Sinowealth and EVision verified on real boards; OpenRGB/sysfs/QMK implemented to spec but not yet run on hardware. The README also states a single-colour device shows the *most urgent* lane rather than faking a matrix (L65–69) — a good, true editorial point now used in the pull quote.

**Development state:** v0.8.0, `Development Status :: 3 - Alpha`, Pure Python core with optional extras (`hidapi`, `paho-mqtt`, `mcp`, framework adapters), not yet on PyPI; release notes at `fc7378d` report "720 Python tests, 65 JS tests, four checkers" all green, with no hardware/network required for the test suite.

**Code excerpt pinned (real, replaces the invented Rust `sample_key_color`):** `rgi/appearance.py` L60–L77, `StateSpec.render` — `codeSource.url` = `.../blob/fc7378d037576c090322e623a5a3bbeafb97d619/rgi/appearance.py#L60-L77`.

---

## 4. Graphics label audit (SVG + Canvas) — MAIN correction guidance only

> Per instructions, graphics were **not edited**. The following labels still carry the unverified/fabricated figures and are the remaining place where magazine copy contradicts the source.

### 4a. SVG plate — RouteTok (`js/plates/routetok.js`)

| Line | Label | Verdict | Suggested MAIN correction |
|---|---|---|---|
| 35–36, 45, 96–97 | `ROUTETOK`, `AUTOMATIC PROVIDER EXCHANGE`, `HEALTH`, `VIII / ROUTING AS A PHYSICAL CONTRACT`, `CLOSE THE CIRCUIT. MEASURE THE FAILURE. TRY THE NEXT LINE.` | Fine (metaphor, no false metric) | Keep. |
| 52 | `C / O / PROBE` | Acceptable shorthand for closed/open/half-open | Optional: `C / O / HALF` for precision. |
| 56–58 | relay rows `01 / CLAUDE`, `02 / OPENAI`, `03 / LOCAL` | Provider naming is editorial; acceptable | Keep, or genericise to `PROVIDER A/B/C` to avoid implying endorsement. |
| 57 | state `429 · OPEN` | **Conflates a rate-limit cooldown with a breaker OPEN** | Relabel `429 · RATE-LIMITED` (or split `429` from a separate `OPEN` relay). |

No 15 ms / 60 Hz figures appear in this SVG — good.

### 4b. SVG plate — RGBAgentFlightIndicator (`js/plates/rgbagentflightindicator.js`)

| Line | Label | Verdict | Suggested MAIN correction |
|---|---|---|---|
| 23–25 | annunciator `MASTER / CAUTION`, `AGENT 05 / STEWARD` | Fine | Keep. |
| 25 | `TOKEN FLOW — 114 TOK/S` | **Fabricated number** | Replace with a state word (`WORKING`, `BLOCKED`, `DONE`) or a neutral readout (`LANE 05`). |
| 25 | `HID LINK — 60 HZ` | **Fabricated 60 Hz** | Replace with `HID LINK — OK` / `USB / CONNECTED`. |
| 42 | `QMK · RAW HID` | QMK is one of nine backends; "raw HID" is not its transport (QMK/VIA over hidapi) | Replace with `QMK / VIA · OPENRGB` or a neutral `USB HID BACKENDS`. |
| 50–51 | keycap legends `F1…F12`, `~ 1 2 3 … 0` | Implies an F-key lane map the project does not ship (default lanes are backend lamp indices) | Keep as generic keyboard art, or relabel the lit keys `01…12` to match `--count 12`. |
| 67 | abort key labelled `ESC` tinted red | Fine ("blocked" is blinking red) | Keep. |
| 91 | `55g / TACTILE` | **Fabricated switch spec** | Remove, or use a non-spec caption. |
| 96, 98 | `IX / THE AVIONICS SWITCHBOARD`, `AN AGENT'S STATE, FELT AT YOUR FINGERTIPS.` | Fine (metaphor) | Keep. |
| 99 | `60 HZ TELEMETRY / PER-KEY RGB / USB RAW HID` | **Fabricated 60 Hz; per-key only on some backends** | Replace with `EVENT-DRIVEN TELEMETRY / PER-KEY OR SINGLE-COLOUR / USB HID`. |

### 4c. Canvas lab — RouteTok (`js/magazine-widgets.js` ~L458–485)

| Line | Label | Verdict | Suggested MAIN correction |
|---|---|---|---|
| 460 | status `MULTI-ARMED BANDIT OPTIMAL` | **Fabricated algorithm** | Replace with `HEALTH-RANKED CANDIDATES` / `LATENCY EWMA RANKED`. |
| 460 | `UPSTREAM-B TRIPPED -> REROUTED TO A` | Implies **mid-stream** failover | Clarify `PRE-OUTPUT REROUTE TO A` (post-commit streams end in `stream_interrupted`). |
| 464 | `PROVIDER C (LOCAL VLLM)` | vLLM is not a named provider in `docs/providers.md` | Use `PROVIDER C (LOCAL / GENERIC-OPENAI)` or `LOCAL SPEACHES` (STT only). |
| 59 | cover readout `BUS CLOCK: 60.0 HZ // 11 NODES ONLINE` | Generic cover instrument, not RouteTok-specific | Out of this audit's scope (cover plate); note only. |

### 4d. Canvas lab — RGBAgentFlightIndicator (`js/magazine-widgets.js` ~L704–782)

| Line | Label | Verdict | Suggested MAIN correction |
|---|---|---|---|
| 707 | `QMK / 60 Hz` | **Fabricated 60 Hz** | Replace with `QMK / VIA · EVENT-DRIVEN`. |
| 707 | `07 / RAW HID` | Acceptable generic hardware label | Keep, or `07 / RGB HID`. |
| 768 | `114 TOK/S` | **Fabricated number** | Replace with the lane state (`01 CAUTION`, `12 ONLINE`, `ALL COMPLETE`) or drop the token readout. |
| 769–770, 778 | `05 AGENT SLOT`, `AGENT SLOTS`, `01—12 AGENT SLOTS` | **Matches** default 12 lanes | Keep. |
| 777 | `USB / CONNECTED` | Fine | Keep. |
| 779 | `PER-KEY TELEMETRY` | Only true on per-key backends | Replace with `PER-LANE TELEMETRY` / `PER-KEY OR SINGLE-COLOUR`. |
| 781 | footer `… · 60 Hz` | **Fabricated 60 Hz** | Drop the `· 60 Hz` suffix. |

### 4e. README (MAIN correction, not edited here)

- `README.md` line 23: `pp. 66–73 (#107) — rgbagentflightindicator: 60Hz per-key QMK / USB HID cockpit caution matrix` repeats the **fabricated 60 Hz** and the unshipped per-key-QMK assumption. MAIN should reword to e.g. *"event-driven per-lane RGB annunciator panel (per-key on verified backends)"*.
- `README.md` line 22 (RouteTok "Operations dashboard screenshot") is accurate and can stay.
- `README.md` line 5 / line 46 still describe the whole magazine as zero-dependency Node.js — that is about the magazine harness, not RouteTok; no change required.

---

## 5. Fields changed in `projects.js` (root only)

Both objects were rewritten in place; all structural fields were preserved: `id`, `index`, `issueSection`, `spreadType`, `pageRange`, `readerServiceNo`, `repoUrl`, `screenshot` + `screenshotWidth`/`screenshotHeight` + path, `liveUrl`, `spotInkHex`, `secondaryInkHex`, `flexiFreqs`.

- Revealed copy fields rewritten: `kicker`, `headline`, `deck`, `byline`, `category`, `pullQuote`, `bodyCopy`, `fieldNotes`, `editorialLead`, `architecture`, `verifiedCapabilities`, `techStack`, `metrics`, `codeListingTitle`, `codeListing`, `terminalStream`.
- New fields added (matching the format already used by the OrbitDesktop/HermesDashboard audits): `codeSource: { label, url }`, `sources: [{ label, url }]` (5 each), `sourceRevision`, `researchedAt: '2026-10-13'`.
- `codeListingTitle` now uses the `SOURCE EXCERPT` convention; `terminalStream` now holds `READING GUIDE // …` items (plus one honest `NOTE //`), not pretend log lines.

**Mirror note:** root `projects.js` is the edit target; `js/projects.js` is mirrored at the end by MAIN (the two files were mid-rebrand during this audit — root moved to the SLOP ILLUSTRATED masthead while `js/projects.js` still held the old masthead). `node --check projects.js` passes; `test/catalog.test.mjs` passes.

---

## 6. Residual risks / open items

1. **No latency numbers exist upstream.** Neither repo publishes a routing-overhead, failover, event-to-LED or refresh-rate benchmark. Any future numeric claim needs a measured run committed by the author, not inferred.
2. **QMK, OpenRGB and sysfs remain unverified on hardware** (author's own statement). Catalog copy must not present them as hardware-verified.
3. **The default palette is not colour-blind-safe**; only an opt-in preset is. Do not describe the shipped colours as CVD-validated.
4. **Provider naming** (`CLAUDE`, `OPENAI`, `VLLM`) in SVG/Canvas is editorial and could imply endorsement; RouteTok's README expressly disclaims affiliation.
5. `sources` and `codeSource` URLs are pinned to immutable SHAs; if either default branch advances, the pinned excerpt stays valid but `sourceRevision` should be re-checked before the next print run.
