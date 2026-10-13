# Truthfulness Audit — `warpi` (projects.js object `#109`)

- **Publication:** SLOP ILLUSTRATED (Si.)
- **Author:** SLOPTIMUS PRIME
- **Author GitHub:** <https://github.com/mojomast>
- **Object owned by this audit:** the `warpi` entry in `/home/mojo/projects/ussysite6/projects.js` (`index: 9`, `readerServiceNo: 109`, `pageRange: 'pp. 82–89'`).
- **Files this audit touched:** `projects.js` (narrow patch to the `warpi` object only) and this report (`docs/editorial-audit/warpi.md`). No other object, plate, or widget was edited.
- **Audit date (`researchedAt`):** 2026-10-13

## Canonical source & revision

- **Repo:** <https://github.com/mojomast/warpi>
- **Default branch:** `main`
- **Pinned revision (`sourceRevision`):** `760f4fe04caf335393e6e88f213c84f9c6eb4284` — commit message **“Release 0.1.2”**, author date `2026-09-24T22:30:50Z` (from `gh api repos/mojomast/warpi/commits/main`).
- **Repo description (verbatim):** “warpi: Warp with a local Pi-powered agent backend — no Warp account required”.
- Every source URL added to the object is pinned to `760f4fe…` via `github.com/mojomast/warpi/blob/<sha>/…`.

### Local checkouts — verified as *not* authoritative

| Path | Remote | HEAD | Usable as evidence? |
| --- | --- | --- | --- |
| `/home/mojo/projects/warpi-repo` | `github.com/mojomast/warpi.git` | `a062e52` (README says **0.1.0**) | **No for version-sensitive claims** — behind canonical `760f4fe` (README says **0.1.2**). Used only for wide greps. |
| `/home/mojo/projects/warpi-dev` | `github.com/mojomast/warpi-dev.git` (+ `public-mirror` → `warpi-repo`) | `a13b41e` | Dev tree, not the public release surface. |
| `/home/mojo/projects/openwarp` | `github.com/mojomast/openwarp.git` | `c4e95a4` | **Not the cited donor.** `standalone/DONOR-ATTRIBUTION.md` cites `sasuke39/openwarp` @ `5045d30`. |
| `/home/mojo/projects/warp` | `origin` = `warpdotdev/warp` (+ `mojomast` fork remote) | `3fe55e9` | Upstream Warp tree, not warpi. |

**Consequence:** all new copy and the excerpt were taken from the canonical GitHub repo at the pinned SHA, not the stale local clone. GitHub code-search calls hit a rate limit mid-audit (HTTP 403); wide greps were then run against the local clone (read-only, no fetch, no writes) and cross-checked against raw files fetched from the pinned SHA.

## Verified facts (basis for the rewrite)

| Fact | Evidence (pinned) |
| --- | --- |
| warpi is an **independent fork of Warp** keeping the native UI and replacing the cloud agent backend with a local one; **no Warp account required**. | `README.md` L5–L14; repo description. |
| Current version **0.1.2** (2026-09-24); changelog 0.1.0–0.1.2. | `README.md` L16; `standalone/VERSION` = `0.1.2`; `CHANGELOG.md`. |
| The **terminal, block UI, PTY, VT100 emulation, approvals, diffs, history, execution** are **upstream Warp**, not warpi additions. | `standalone/ARCHITECTURE.md` “Ownership split”: “Approvals, permissions, workspace execution, diffs, history, persistence — Warp (native controller/action model)”. |
| **New fork code:** `crates/standalone_agent` (Rust adapter) + `standalone/pi-helper` (private Node helper embedding the Pi coding-agent SDK), plus app wiring and packaging. | `standalone/README.md`; `README.md` L540–L541. |
| BYOK: any **OpenAI-compatible Chat Completions** endpoint; presets plus custom URL; optional API key stored in the OS secret store. | `README.md` “Why warpi exists”, “Add a provider and a key”; `standalone/PROVIDER_COMPATIBILITY.md` L6–L40. |
| Profile holds a **credential reference, never the secret**; secret resolved at session open, only in memory as `SecretString`. | `crates/standalone_agent/src/provider.rs` L1–L10, L89–L98, L100–L137. |
| Helper is a **supervised stdio child with no listening port**; **stdin/stdout NDJSON**, not a Unix socket. | `crates/standalone_agent/src/helper.rs` L1; `standalone/pi-helper/src/main.ts` L5, L301. |
| Outbound egress = the **configured provider endpoint only** (`PI_OFFLINE=1`, `modelsPath: null`, `allowModelNetwork: false`, install telemetry & analytics off); Warp telemetry/crash/update disabled for the OSS channel. | `standalone/NETWORK_DEPENDENCIES.md` matrix (#0,#1,#8–#11) and “Standalone helper egress”; `helper.rs` L152–L153; `runtime.ts` L555–L556, L671. |
| Configuring a provider **enables the local backend and skips the account gate**. | commit `32f770a` (“Standalone: configuring a provider enables the local backend; skip the account gate”). |
| v1 accepts **only** OpenAI Chat Completions; Responses / Anthropic Messages are **rejected, not emulated**. | `standalone/PROVIDER_COMPATIBILITY.md` L6–L12. |
| **Not verified upstream:** macOS packaging; hosted providers beyond DeepSeek; provider retry is off (terminal failure); GUI diff-review/restore/send-now unexercised. | `README.md` L457–L490; `PROVIDER_COMPATIBILITY.md` L103–L123. |
| Not affiliated with / endorsed by Warp or Denver Technologies, Inc. | `README.md` L563–L568. |

## Field-by-field audit of the old `warpi` object

Status legend: **SUPPORTED** (evidence found) · **CONTRADICTED** (evidence against) · **UNSUBSTANTIATED** (no evidence either way) · **UNMEASURED** (a performance/quantitative claim with no measurement) · **INHERITED** (true of upstream Warp, but the object implied warpi built it).

| Field | Old claim (abridged) | Status | Evidence | Corrected scope (landed) |
| --- | --- | --- | --- | --- |
| `kicker` | “Modern Block Terminal Without the Cloud Leash” | CONTRADICTED | Agent traffic goes to a cloud endpoint by design (`NETWORK_DEPENDENCIES.md`: provider base URL “Every turn”). | “A Local Pi Agent Backend Behind Warp’s Block UI”. |
| `headline` | “A 14ms Native Rust PTY Multiplexer & Air-Gapped Pi Coding Helper” | CONTRADICTED + UNMEASURED | No “14ms/14 ms” anywhere in the repo; PTY multiplexer is upstream Warp; “air-gapped” is false. | “Bring Your Own Model to Warp’s Terminal — Without a Warp Account”. |
| `deck` | “structured command blocks, 120Hz WGPU glyph rendering, on-demand Pi sidecar… zero outbound telemetry” | INHERITED + UNMEASURED + partly CONTRADICTED | Blocks/WGPU are upstream Warp; no “120Hz” string exists; helper is per-conversation supervised, not “on-demand”; provider egress exists. | Accurate fork + BYOK summary; “no Warp account in the agent path”. |
| `byline` | “By the Local-First Systems Collective · Manual Section 1” | CONTRADICTED | Invented institute; the author is `mojomast`. | “By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)”. |
| `pullQuote` | Fabricated first-person quotation in curly quotes | CONTRADICTED | No such quotation exists; the repo never says this. | Replaced with an **editorial statement** (no quote marks, no attribution). The layout renders it in a `<blockquote>`; it is now clearly editorial, not a real quotation. |
| `bodyCopy` | “Rust POSIX PTY multiplexer… zero-copy VT100 parser… WGPU glyph atlas… Pi helper invoked only on Ctrl+Space and reads only the blocks you select… opens no outbound sockets” | INHERITED + CONTRADICTED | `Ctrl+Space` does not appear in any standalone doc/source; the helper is used for all agent inference, not a block selection; sockets are opened to the provider. | Rewritten to separate upstream Warp from fork code, describe the Pi SDK helper, credential reference, and endpoint-only egress. |
| `fieldNotes` | “14 ms cold start… 120 Hz WGPU… Air-gapped: zero telemetry, zero cloud accounts.” | UNMEASURED + CONTRADICTED | No measurements; “air-gapped” false. | Three factual notes incl. the not-affiliated statement and the upstream/fork boundary. |
| `editorialLead` | “…14ms cold-start Rust binary with an air-gapped Pi coding helper invoked only when you press `Ctrl+Space`.” | CONTRADICTED + UNMEASURED | Same as above. | Rewritten around Warp’s terminal + the local Pi backend + provider configuration. |
| `architecture[1]` | “Native Rust POSIX PTY multiplexer…” | INHERITED | Upstream Warp `app/src/terminal`. | “Warp owns the terminal… inherited from upstream Warp.” |
| `architecture[2]` | “Pi agent sidecar that reads only user-selected terminal blocks…” | CONTRADICTED | Helper receives the conversation/task context (`ARCHITECTURE.md` Exchange vs run), not user-selected blocks. | Fork adapter responsibilities (`crates/standalone_agent`). |
| `architecture[3]` | “WGPU glyph atlas… 120Hz…” | INHERITED + UNMEASURED | `warpui::rendering::wgpu` is upstream; no rate measured. | `standalone/pi-helper` + pinned Pi SDK; stdio, no listening port. |
| `architecture[4]` | “Strictly local credential and history store with zero external telemetry sockets.” | partly SUPPORTED / CONTRADICTED | Telemetry/crash/update disabled; but agent egress to provider exists. | Endpoint-only inference; cloud surfaces hidden. |
| `verifiedCapabilities[1]` | “Block-structured PTY command history…” | INHERITED | Upstream Warp. | “No Warp account required…”. |
| `verifiedCapabilities[2]` | “Context-aware Pi coding agent keybind (`Ctrl+Space`)…” | CONTRADICTED | No such binding in repo. | BYOK: OpenAI-compatible endpoint + optional key in OS secret store. |
| `verifiedCapabilities[3]` | “120Hz WGPU hardware-accelerated text rendering…” | UNMEASURED / INHERITED | — | Native approval/diff/tool-card authority retained. |
| `verifiedCapabilities[4]` | “100% local Rust binary with zero telemetry or cloud lock-in” | CONTRADICTED | Inference leaves the machine to the endpoint; helper is **Node**, not Rust. | OpenAI Chat Completions only; other protocols rejected. |
| `techStack` | `Rust`, `WGPU / OpenGL`, `POSIX PTY`, `Pi Agent Protocol`, `VT100 State Machine` | INHERITED + UNSUBSTANTIATED | “Pi Agent Protocol” is not a thing — it is the Pi SDK over NDJSON. | Names fork components and the pinned SDK/SDK version explicitly. |
| `metrics[0]` | “Cold Startup — 14 ms Native Rust” | UNMEASURED | No measurement in repo. | `Warp Account — Not Required`. |
| `metrics[1]` | “Scroll Refresh — 120 Hz WGPU Lock” | UNMEASURED | No measurement. | `Agent Wire Protocol — OpenAI Chat Completions`. |
| `metrics[2]` | “Cloud Telemetry — 0 Bytes (Air-Gapped)” | CONTRADICTED | Provider egress every turn. | `Fork Version — 0.1.2 (2026-09-24)`. |
| `codeListing` | `pub struct CommandBlock { … stdout_ring: RingSlice … }` | CONTRADICTED | No `CommandBlock` struct and no `RingSlice` type exist. (`CommandBlockInfo` is a real *upstream Warp* struct in `app/src/ai/agent/conversation.rs` L271, but it has none of these fields.) | Replaced with an **exact** excerpt from `provider.rs` L89–L98 (`CredentialRef`) and a pinned `codeSource`. |
| `codeListingTitle` | “LISTING 9.1 // ZERO-COPY VT100 BLOCK DEMULTIPLEXER” | CONTRADICTED | Corresponds to no real code. | “SOURCE EXCERPT 9.1 // PROVIDER PROFILE HOLDS A CREDENTIAL REFERENCE, NEVER THE SECRET”. |
| `terminalStream` | Four invented “[warpi:pty]/[pi:helper]/[wgpu:atlas]/[privacy:seal]” log lines | CONTRADICTED | Presented as captured runtime output that was never run; fake block numbers, timings, and “0 telemetry sockets”. | Replaced with a **factual READING GUIDE**; first line states it is documentation, not captured output. MAIN will label the box. |

### `codeListing` provenance (new field `codeSource`)

Exact excerpt, verbatim from `crates/standalone_agent/src/provider.rs` L89–L98 at the pinned SHA:

```rust
/// Where the credential for a profile comes from. The reference is a stable
/// key into the OS secret store; it is never the secret itself.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CredentialRef {
    /// No authentication: the wire request must not carry an Authorization header.
    None,
    /// Look up by key in the platform secret store.
    SecretStore { key: String },
}
```

- `codeSource.label`: `crates/standalone_agent/src/provider.rs — CredentialRef`
- `codeSource.url`: `https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/crates/standalone_agent/src/provider.rs#L89-L98`

This excerpt directly supports the BYOK/credential-safety theme and is genuinely this repo’s own (fork) code, not inherited Warp.

## New provenance fields added to the object

```js
codeSource: { label: 'crates/standalone_agent/src/provider.rs — CredentialRef', url: '<pinned>' },
sources: [ /* 5 entries, all pinned to the SHA */ ],
sourceRevision: '760f4fe04caf335393e6e88f213c84f9c6eb4284',
researchedAt: '2026-10-13'
```

`sources` entries (all `github.com/mojomast/warpi/blob/760f4fe…/…`):
1. `README.md` — independent Warp fork, local Pi backend, no Warp account (v0.1.2)
2. `standalone/ARCHITECTURE.md` — ownership split, exchange/run model
3. `crates/standalone_agent/src/provider.rs` — provider profiles & credential reference
4. `standalone/pi-helper/src/runtime.ts` — pinned Pi SDK, offline resource discovery
5. `standalone/NETWORK_DEPENDENCIES.md` — egress inventory (configured endpoint only)

## Unmeasured vs disproven (explicit)

- **UNMEASURED (no evidence, could be true but unproven):** cold-start time, glyph-render rate (“120 Hz”), frame-drop guarantee, scroll throughput, “zero-copy” parser.
- **DISPROVEN / CONTRADICTED:** “air-gapped”; “zero outbound sockets/sockets: 0”; “Pi helper invoked only on Ctrl+Space”; “reads only the blocks you select”; `CommandBlock`/`RingSlice` listing; invented log lines; the invented byline.
- **INHERITED (true, but upstream Warp, not warpi’s contribution):** block-structured command history, PTY, VT100 emulation, WGPU rendering, approvals/diffs/tool cards, persistence.

## Label audit — plates & widgets (guidance for MAIN; these files were **not** edited here)

### `js/plates/warpi.js`

| Line | Problem | Exact factual correction |
| --- | --- | --- |
| L1 comment | “a local Rust terminal and its **air-gapped**, exposed Pi sidecar” | “WARPI — Warp’s terminal with a local Pi agent backend and no Warp account.” |
| L31 | caption “WARPI / LOCAL PTY” | acceptable, but prefix as inherited: “WARPI / WARP PTY (UPSTREAM)” if space allows. |
| L33 | fake test output `pty::demux_vt100_stream …. ok`, `pi_sidecar::zero_cloud …. ok`, “14 tests” | Invented. Either label the block “ILLUSTRATIVE” or use real module names: `standalone_agent::provider`, `bridge::plan_resume`, `helper::apply_sandbox_env`. There is no `pi_sidecar::zero_cloud` test. |
| L36 | “WGPU / GLYPH CACHE” | Upstream Warp renderer. Read “WARP RENDERER / GLYPH CACHE (UPSTREAM)”. |
| L38 | “120 HZ   1.8 MB   ZERO RE-RASTER” | Unmeasured. Remove, or “LOCAL SCROLL (RATE UNMEASURED)”. |
| L64 | “WARPI / AIR-GAPPED SIDECAR” | “WARPI / LOCAL PI AGENT BACKEND” or “SUPERVISED STDIO HELPER”. |
| L94 | “XI / THE AIR-GAPPED MONOLITH” | “XI / THE LOCAL-AGENT MONOLITH” (or “XI / NO WARP ACCOUNT”). |
| L95 | “A LOCAL MACHINE. A COMPLETE WORKSPACE. NO CLOUD SOCKETS.” | False. “WARP’S TERMINAL. YOUR MODEL. NO WARP ACCOUNT.” |
| L96 | SVG `title`/aria: “air-gapped… sealed network port” | Replace “air-gapped” and “sealed network” wording with “local Pi agent backend”; egress goes to the configured endpoint. |

### `js/cover-plate.js`

- **No Warpi-specific factual label exists.** The node label is derived: `LABELS[n.proj.id] || shortTitle(n.proj.title)` (L29, L268), and aria/title use `proj.title` + `readerServiceNo` + `pageRange` (L273–L274). For `warpi` the rendered name is just **“Warpi”** and the reader-service link is **#109 / pp. 82–89**.
- **Guidance for MAIN:** no correction is required unless an override is added; if so, use `warpi: 'Warpi'` in `LABELS`. ⚠️ `js/cover-plate.js` shows as modified in `git status` (another agent’s work) — avoid clobbering.

### `js/magazine-widgets.js` — `drawLocalTerminal` (L784–L868)

| Line | Problem | Exact factual correction |
| --- | --- | --- |
| L785 | command `pi explain ./src/pty.rs` | No such CLI in the repo. Use a real flow, e.g. an agent prompt, or mark illustrative. |
| L787 | fake output `test pty::block_boundary … ok`, `atlas::glyph_cache … ok`, “42 passed; 0 failed” | Invented tests. Use real suites (`provider`, `bridge`, `helper`) or label illustrative. |
| L788 | `Checking warpi v0.8.0`, `Checking pty-core v0.8.0` | Wrong version and a nonexistent crate. warpi is **0.1.2**; there is no `pty-core`. |
| L792 | `'PTY / 120 Hz WGPU'` | Inherited + unmeasured. “AGENT BACKEND / OPENAI COMPAT”. |
| L807 | `WARPI / LOCAL PTY   #${42 + mode}` | Fabricated block id. Use a neutral header, e.g. `WARPI / LOCAL PI PROVIDER`. |
| L825 | `'ZERO CLOUD SOCKETS'` | False. “NO WARP ACCOUNT” (agent egress goes to the configured endpoint). |
| L828 | `'ON-DEMAND SIDECAR'` | Helper is per-conversation supervised, not on-demand. “LOCAL PI HELPER (STDIO)”. |
| L858 | `π` / `LOCAL` | Acceptable (Pi). Keep. |
| L864 | `'UNIX SOCKET / IDLE'` | Wrong transport. Helper is a stdio child, no socket/port. “STDIO / IDLE”. |
| L865 | `'127.0.0.1  →  π'` | False; the endpoint is user-configured and may be remote. “CONFIGURED ENDPOINT → π”. |
| L867 | return string “…· 0 cloud sockets” | False. “· no Warp account · endpoint egress”. |
| L1045 | `warpi: drawLocalTerminal` | Correct mapping; keep. |

⚠️ `js/magazine-widgets.js` shows as modified in `git status` (another agent’s work) — apply the above as guidance, do not overwrite unrelated changes.

## Caveats / residual risk

- **Version drift:** the local `warpi-repo` README (0.1.0) differs from the canonical remote (0.1.2). All claims here are pinned to `760f4fe…`; if the upstream default branch advances, re-research `Fork Version` and the `sources`.
- **Scope boundary:** the object now credits the **whole project** to “warpi” while explicitly marking terminal/rendering/approvals as upstream Warp. This is the required framing (agent backend we built; no credit for Warp-built terminal/rendering).
- **Provider support:** DeepSeek is the only adapter-level provider verified end to end; presets for others are UI conveniences, not compatibility claims (`PROVIDER_COMPATIBILITY.md`).
- **Publisher/author:** the byline now reads SLOPTIMUS PRIME / SLOP ILLUSTRATED (Si.), matching the sibling objects (e.g. `hermesdashboard`) and the working-tree masthead, which other agents have already renamed to `publicationTitle: 'SLOP ILLUSTRATED'`, `publicationAcronym: 'Si.'`. Those global edits are outside this audit’s remit (this audit changed only the `warpi` object).
- **Not edited:** `js/plates/warpi.js`, `js/cover-plate.js`, `js/magazine-widgets.js`, and every other object in `projects.js`. This audit changed only the `warpi` object plus this report.
- **Verification performed:** `node --check projects.js` → OK after the narrow patch.
