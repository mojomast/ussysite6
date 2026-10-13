# Editorial audit — JamMate & MothBake (audio-assets)

Audit date: **2026-10-13** · Auditor: subagent (jammate + mothbake scope only)
Publication: **SLOP ILLUSTRATED (Si.)** · Author: **SLOPTIMUS PRIME** · GitHub: **mojomast**

This document records, for the two owned ROOT `projects.js` objects only, what the
previous copy claimed, whether the claim is supported by the canonical repository
source at the pinned revision, the exact source lines inspected, and the correction
applied. It also carries **MAIN correction guidance** for misleading labels in the
owned project SVG plates and `js/magazine-widgets.js`; those graphics were **not**
edited by this audit.

## Scope and method

- **Owned objects only:** `jammate` and `mothbake` in ROOT `projects.js`. No other
  catalog object, metadata, CSS, HTML, app JS, plate SVG or widget JS was edited.
- **Canonical sources verified via `gh` (authenticated as `mojomast`):**

  | Repo | Default branch | Canonical commit SHA | Date |
  |---|---|---|---|
  | `github.com/mojomast/jammate` | `main` | `0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04` | 2026-10-08 |
  | `github.com/mojomast/mothbake` | `main` | `93e182557c7c47b75c556477127fb27686fea20d` | 2026-09-25 |

- **Local checkouts used only as a convenience and verified against the canonical SHA:**
  - `/home/mojo/projects/guitars` — remote `origin=mojomast/jammate`, `upstream=raphaelfukuda/Guitar-Companion`;
    `HEAD=0bb4893…` **matches** canonical `jammate@main`.
  - `/home/mojo/projects/mothbake` — remote `origin=mojomast/mothbake`, but local `HEAD=a35a2e6…`
    (2026-09-20) is **stale**; canonical `main` is `93e1825…` (2026-09-25). All mothbake
    evidence was read from a canonical tarball extracted at `93e1825`, not from the stale
    working tree.
- Evidence was read from **source, tests, CMake and config**, not README alone.
- No project source repo (`guitars`, `mothbake`) was modified. No commits or pushes were made.

## JamMate — claim-by-claim

Repo: `mojomast/jammate` @ `0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04`.

| # | Old claim (verbatim / paraphrase) | Support status | Source (exact) | Correction applied |
|---|---|---|---|---|
| J1 | Headline: “**Sub-3ms** C++20 & JUCE Neural Amplifier Workstation” | **Unsupported** — no latency measurement exists; product is not C++20 | `SPEC.md` §18.3: “Target measured end-to-end round-trip monitoring latency of **<= approximately 12 ms** on the reference ASIO setup at 48 kHz / 128 frames”; `CMakeLists.txt:4` `set(CMAKE_CXX_STANDARD 17)`; `docs/research/device-validation/example/synthetic-session/summary.md` → `hardware_matrix: FAIL`, `monitoring_latency: FAIL`, `matrix empty: True` | New headline: “A JUCE Guitar Rig Whose Experimental Drummer Listens for the Bar Line” |
| J2 | “**2.6 ms round-trip** at 48kHz / 64 samples” (field note), “2.6ms round-trip audio buffer processing…” (capability), metric “2.6 ms @ 64f” | **Unsupported / fabricated** | `…/measurements/latency-asio_48k_64.json`: `"physical_roundtrip_latency_ms": null`, `"valid": false`, reasons `["ambiguous-onset","interface-block-mismatch"]`; summary matrix all `missing` | Replaced with the documented **≈12 ms target (not yet measured)**; metric now “≈12 ms ASIO 48k/128 (target, not yet measured)” |
| J3 | Metric “DSP Headroom **88% Free @ 96kHz**” | **Fabricated** — no headroom measurement anywhere in the repo | No occurrence of headroom/96 kHz profiling in `src/`, `docs/`, tests; `docs/research/PROCESSOR-RUNTIME-PROBE.md` measures allocations, not headroom | Removed; replaced with bounded RT probe result |
| J4 | “UI drains … at **120Hz**”; “streams **120Hz FFT** spectrum telemetry” | **False** | `docs/research/LIVE-JAM-UI.md:25` “a **30 Hz** coherent poll only while the screen is visible”; `src/AudioOverlay.h:102` “live telemetry (**10 Hz** timer)”; no 120 Hz telemetry path in `src/` | Body/field note now state the real **30 Hz** visible-screen poll (and 10 Hz meter) |
| J5 | “**Zero locks and zero allocations** on the real-time thread” (universal) | **Overclaimed / partial** | `docs/research/RT-REACHABILITY.md` executive summary: P0 `triggerAsyncUpdate()` reachable from `processBlock`; “These are **bounded repairs, not a declaration that G1 has passed**”; “whole-processor heap/locking instrumentation … still need evidence.” `README.md` verification: “**26** real-processor probe cases show zero detected heap allocation/free or lock/wait … These probes cover a **bounded matrix, not every model, effect, host or device**.” | Scoped to the measured probes; explicit “bounded matrix” caveat added |
| J6 | Project described as “**C++20**” | **False as a project-wide claim** | `CMakeLists.txt:4` `set(CMAKE_CXX_STANDARD 17)`; only the NAM target: `target_compile_features(nam_core PRIVATE cxx_std_20)` | Tech stack now “C++17 (product) / C++20 (NAM Core)” |
| J7 | “**JUCE 8**” | **True** | `third_party/JUCE/CMakeLists.txt`: `project(JUCE VERSION 8.0.15 …)`; gitlink `91ad83ae34a81e0833b1a2b0866f54846370ae53` | Refined to “JUCE 8.0.15” |
| J8 | “**AVX2/NEON SIMD**-accelerated filter cascades” | **Unsupported** | No `AVX`/`NEON`/`SIMD`/`__m256`/`vDSP` in `src/`, `CMakeLists.txt`, `cmake/`, `patches/` | Removed; field note states the fork adds no SIMD cascade |
| J9 | “**6-band** parametric studio EQ” | **False** | `src/PluginEditor.cpp:213` “**3-band pre EQ**”; post-EQ params `eqLow`/`eqMid`/`eqHigh` (`src/PluginProcessor.cpp:723-727`) = 3 bands | Corrected to 3-band pre/post EQ in copy |
| J10 | “nonlinear **tube** overdrive stage” | **Unsupported adjective** | `src/PluginProcessor.h:676` overdrive = HP → clip (per variation) → tone LP → post-filter; no tube modelling cited | “overdrive stage” (tube dropped) |
| J11 | “Multi-track **stem separator**” / “sample-accurate backing **stem** synchronization” | **False / misread** | `SPEC.md` lists “Recording of guitar, drum, and mix **stems**”; `src/PluginEditor.cpp:3348` tooltip “separate guitar and drum **stems**” — i.e. multi-stem recording, not source separation | Rewritten as “guitar/drum/mix stem recording”; sync claim replaced with bar-boundary drum join |
| J12 | “Instant **A/B neural amplifier preset comparison vault**” | **Overstated** | `src/PluginEditor.cpp:3367` “A/B: toggles between two complete rig settings”; `src/StoreOverlay.cpp:97` temporary A/B preview — no “vault” | Dropped; A/B noted only where factual |
| J13 | “**wait-free** real-time DSP pipeline” | **Imprecise** | `src/rt/RtSignal.h` header: bounded, “no allocation, locks, waits, message posting or unbounded retry”, one-attempt reads; that is lock-free/bounded, not a proven wait-free bound | Copy says “bounded, lock-free, retry-free” |
| J14 | “Neural amplifier” (NAM) | **True** | `.gitmodules` `third_party/NeuralAmpModelerCore` → `sdatkinson/NeuralAmpModelerCore`; `CMakeLists.txt` builds `nam_core`; `THIRD_PARTY.md` “Pinned at **v0.5.4**”; gitlink `1f42f88535884450104b8711d7595019afa0495b` | Kept, attributed as bundled upstream (MIT) |
| J15 | “convolution cabinet impulse responses” | **True** | `src/PluginProcessor.h:520` `juce::dsp::Convolution convolutions[maxCabSlots];`; `CMakeLists.txt` links `juce::juce_dsp` | Kept |
| J16 | “up to three parallel amp/cab rigs” | **True** | `src/PluginProcessor.h:84` `static constexpr int maxRigs = 3;`; README “up to three parallel amp/cab rigs” | Kept |
| J17 | Tech stack “VST3 / **CoreAudio** / **ASIO**” | **Partial** | `CMakeLists.txt` `FORMATS Standalone VST3`; ASIO only if `ASIOSDK_DIR` present (`JUCE_ASIO=1`); macOS not verified (README “macOS has not been verified”) | Tech stack “AGPLv3 · VST3 / Standalone”; ASIO noted as optional |
| J18 | “**120Hz**” plate/widget labels, “2.6ms” plate labels | **Misleading** (graphics) | `js/plates/jammate.js:121,291,292`; `js/magazine-widgets.js:423` | **Not edited** — MAIN guidance below |

## MothBake — claim-by-claim

Repo: `mojomast/mothbake` @ `93e182557c7c47b75c556477127fb27686fea20d`.

| # | Old claim (verbatim / paraphrase) | Support status | Source (exact) | Correction applied |
|---|---|---|---|---|
| M1 | Headline: “Hermetic Asset Baking & **64-Byte Aligned** Clean-Room Codecs” | **False** | No `mmap`, `64-byte`, or cache-line alignment in `src/`; the only “aligned” hit is `src/material-family.mjs:73` “aligned RGBA8”. No Rust/FFI codec layer. | New headline: “A Local-First Asset Baker That Keeps Every Bake Reviewable” |
| M2 | “**100% Bit-Exact** Artifacts”; “100% bit-exact … across OS architectures” | **Overclaimed** | Determinism is per emitter/decoder: `test/golden.test.mjs` compares the **ESM emitter** byte-for-byte; `src/decoders/zip.mjs:23-25` fixes the MS-DOS epoch. CI is `ubuntu-latest` only (`.github/workflows/ci.yml`), so no cross-OS attestation exists. | Rewritten as tested determinism (ESM golden + fixed-epoch ZIP), not a global bit-exact guarantee |
| M3 | “**Merkle DAG**” / “Merkle-tree DAG” / “Merkle leaf” | **False** | No `merkle` token in `src/`, `docs/`, `README.md`. Identity is SHA-256 domain-staged fingerprints (`src/identity.mjs:60-76`) plus a reference graph (`src/gc.mjs`). | Corrected to “layered SHA-256 content identities” |
| M4 | Metric “**3.8 ms Merkle Verify**” | **Fabricated** | No verify timing anywhere; nothing to time against | Removed; metric now “Byte-for-byte ESM golden test” |
| M5 | “**Sub-second** incremental asset re-baking via Merkle DAG cache” | **Unsupported** | No timing evidence; incremental work is identity/plan/archive-rebuild based (`src/execution-plan.mjs`, `src/repair.mjs`) | Removed; offline rebuild described factually |
| M6 | “64-byte cache-line aligned binary chunks … zero-copy `mmap` loading” | **Fabricated** | No alignment or mmap code; outputs are PNG/JSON/ESM/etc. | Removed |
| M7 | Tech stack “**Rust / Node.js**” | **False** | `gh api repos/mojomast/mothbake/languages` → `{JavaScript, Python, Shell, HTML}`; no `.rs`/`Cargo.toml` in tree | “Node.js (ESM, zero runtime deps)” + “Python (optional local backends)” |
| M8 | “**Hermetic**” baking / “Hermetic Lepidoptera” | **Overstated** | `README.md` describes it as “**local-first** … with zero runtime dependencies” and “Offline-first”; `docs/SYNC.md` calls it “the portable, de-branded form of an asset-baking pipeline used by a private project” | Copy says “offline-first / local-first” |
| M9 | “Cryptographic manifest attestation verifying identical SHA-256 output digests **across Linux, macOS, and Windows**” | **False** | `.github/workflows/ci.yml`: `runs-on: ubuntu-latest`, `node-version: [20, 22]` — Ubuntu only | Replaced with the real CI matrix and layered identities |
| M10 | “SHA-256” | **True** | `src/identity.mjs:60-64` `hashBytes()`; `src/transactional-pack.mjs:129,160` pack fingerprint; `src/gc.mjs:28` | Kept |
| M11 | “**zero runtime dependencies**” | **True** | `package.json` has no `dependencies`; README “Zero runtime dependencies … every decoder lives in this repository” | Kept |
| M12 | “**Parallel worker-pool** baker” | **False** | `docs/ARCHITECTURE.md` “One client owns a single **concurrency-1 gate**”; no worker pool in `src/` | Removed |
| M13 | “Built-in **hex diff inspector**” | **Unsupported** | No such component in `src/`; `gc --dry-run` is a reference/hash report, not a hex diff | Removed |
| M14 | Screenshot caption “**Eighteen tiling albedo textures** baked by MothBake” | **True** | Canonical `docs/images/gallery-textures.png` is **1068×618** and byte-identical (md5 `a63662143388f2834def9cdc72ba1bb3`) to `assets/screenshots/mothbake.png`; README gallery: “Eighteen tiling albedo textures” | Kept; caption now names the recorded-bake gallery and the no-key/offline provenance |
| M15 | “64-Byte Aligned Deterministic Hex & Merkle Leaf Inspector” (widget), “HERMETIC SPECIMEN”, “64-BYTE ALIGNMENT / ZERO-PADDED”, “Merkle-tree veins” (plate) | **Misleading** (graphics) | `js/magazine-widgets.js:488,490`; `js/plates/mothbake.js:1,29,90,95,96,97` | **Not edited** — MAIN guidance below |

## Upstream vs. actual contribution

### JamMate (`mojomast/jammate`)

- GitHub reports `fork: false`, **but** the project is explicitly derived. README:
  “JamMate builds on **Raphael Fukuda’s Guitar Companion**, preserving its amp, effects and
  drum foundation…”. Local `upstream` remote = `https://github.com/raphaelfukuda/Guitar-Companion.git`.
  `CONTRIBUTING.md`: “Application identifiers and UI developer flags currently retain the
  Guitar Companion name.” `CMakeLists.txt` still ships `COMPANY_NAME "Raphael Fukuda"`,
  `BUNDLE_ID "com.raphaelfukuda.GuitarCompanion"`, `PRODUCT_NAME "Guitar Companion"`.
- **Inherited / upstream:** the entire JUCE guitar rig (amp, effects, cabinet IRs, drum
  machine, song/stage UI), JUCE `8.0.15` (submodule), and `NeuralAmpModelerCore` `v0.5.4`
  (MIT, `sdatkinson`) at `1f42f88…`. Licence: AGPLv3.
- **Fork’s own contribution:** the portable musical-intelligence core in `src/jam/`
  (Musical Clock, Jam Director/join policy, `AnalysisAudioRing`, `RtSignal`, BTrack/aubio
  backends), the NAM LSTM/activation real-time allocation repairs
  (`cmake/nam-rt/NamRtPatch.cmake`, `patches/nam/`), the RT/scene signalling repairs, and
  the associated tests and `docs/research/` evidence. These are the parts the article now
  foregrounds.

### MothBake (`mojomast/mothbake`)

- GitHub `fork: false`, `parent: none`; author `mojomast`; MIT. There is **no public
  upstream repository to pin**. `docs/SYNC.md` states it is “the portable, de-branded form
  of an asset-baking pipeline used by a **private** project”; the “upstream” referenced in
  the codebase is that private pipeline, not a GitHub repo.
- Therefore MothBake’s in-repo code is attributed to `mojomast` and the article does not
  claim an upstream codebase. The only external service relationship is the optional,
  approval-gated **Moth API** (`docs/moth-api-contract.md`), which is off by default and
  never exercised in development.

## Status notes (verified vs. open)

- **JamMate status:** source-first development project; **no release binary** published.
  Windows and Linux builds verified; **macOS not verified**. Tracker selection remains
  **open** (no production backend chosen; BTrack is the experimental default, aubio
  optional; BeatNet is research-only). The real-time gate **G1 is not declared passed**;
  evidence is a **bounded** probe matrix. Adaptive-drums acceptance and physical-device
  latency remain unmeasured.
- **MothBake status:** `v0.1.0`, MIT, Node `>=20`, **zero runtime dependencies**. CI is
  Ubuntu with Node 20/22 only. Development and tests use recorded fixtures/fake services;
  “no live Moth job or credit-bearing request was made” (`CHANGELOG.md`). Live execution is
  approval-gated by exact plan fingerprint.

## MAIN correction guidance — misleading graphic labels (not edited here)

These files are owned by other agents and were **not** modified by this audit. Suggested
factual replacements; re-grep before applying since the files are changing concurrently.

**`js/plates/jammate.js`**
- `:121` `Δt: 2.6ms` → e.g. `Δt: NOT MEASURED` (2.6 ms is not a measured latency).
- `:291` `12AX7 · 2.6MS SPSC BUFFER` → `12AX7 · SPSC ANALYSIS BUFFER` (drop `2.6MS`).
- `:292` `DUAL-TRACE BENCH / 60Hz REFRESH` → `DUAL-TRACE BENCH / 30Hz UI POLL` (UI polls 30 Hz; 60 Hz is wrong).
- `:122` `64 SPLS` is a configuration reference (64-sample buffer), not a measurement — acceptable, but avoid pairing it with a latency figure.

**`js/plates/mothbake.js`**
- `:1` / `:29` / `:96` / `:97` `hermetic` / `HERMETIC SPECIMEN` / `THE HERMETIC LEPIDOPTERA` → `offline-first` / `CONTENT-ADDRESSED SPECIMEN` / `THE CONTENT-ADDRESSED LEPIDOPTERA`.
- `:97` `Merkle-tree veins` → `content-hash veins` (no Merkle structure exists).
- `:90` `64-BYTE ALIGNMENT / ZERO-PADDED` → `SHA-256 CONTENT IDENTITY`.
- `:95` `0x00 — 0x40` → drop or relabel; it implies a 64-byte chunk range that does not exist.

**`js/magazine-widgets.js`**
- `:423` jammate status `… (nX HARMONICS) · 2.6MS` → remove `· 2.6MS` (or `· NO MEASURED LATENCY`).
- `:488` comment `64-Byte Aligned Deterministic Hex & Merkle Leaf Inspector` → `SHA-256 content-identity inspector`.
- `:490` `CHUNK #0n // 64-BYTE ALIGNED · SHA256 VERIFIED (0 PAD DRIFT)` → `CONTENT IDENTITY #0n // SHA-256 FINGERPRINT (LAYERED)`.

**`index.html` TOC (HTML — guidance only, do not edit from this audit)**
- The TOC previously read `MothBake 64B Binary Codec` → suggest `MothBake Content-Addressed Asset Baker`.
- Any JamMate TOC line mentioning “Sub-3ms” / “2.6ms” / “88%” should be replaced with a factual title.

## Asset note

- `assets/screenshots/jam-live-playing-testfixture.png` was added as a **byte-identical**
  copy of the existing `assets/screenshots/jammate.png` (md5 `d907824288986781af196e54cff9a6d1`,
  1100×700), which is itself byte-identical to the canonical
  `jammate@0bb4893 docs/screenshots/jam-live-playing-testfixture.png`. It is the live Jam
  screen already carrying the in-product label **“MOCK FIXTURE / injected telemetry, no real
  audio input”** (`src/ui/JamOverlay.cpp:281`). The old `jammate.png` was left in place.
- `projects.js` `jammate.screenshot` now points at the fixture filename; dimensions
  (`1100×700`) and all other layout identity fields (index, pages, inks, `flexiFreqs`)
  are unchanged. `mothbake.screenshot` and its `1068×618` dimensions are unchanged.

## Fields changed / added (owned objects only)

- **Rewritten:** `kicker`, `headline`, `deck`, `byline`, `pullQuote`, `bodyCopy`,
  `fieldNotes`, `editorialLead`, `architecture`, `verifiedCapabilities`, `techStack`,
  `metrics`, `screenshot` (jammate path), `screenshotCaption`, `codeListingTitle`,
  `codeListing`, `terminalStream`.
- **Added:** `codeSource` `{label,url}` (pinned GitHub lines), `sources` (5 pinned links),
  `sourceRevision`, `researchedAt: '2026-10-13'`.
- **Unchanged (layout identity):** `id`, `index`, `issueSection`, `spreadType`, `pageRange`,
  `readerServiceNo`, `title`, `category`, `repoUrl`, `liveUrl`, `spotInkHex`,
  `secondaryInkHex`, `flexiFreqs`, screenshot dimensions.
