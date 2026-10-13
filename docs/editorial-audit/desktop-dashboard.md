# Truthfulness Audit — `orbitdesktop` (#101) & `hermesdashboard` (#110)

- **Publication:** SLOP ILLUSTRATED (Si.) · **Author:** SLOPTIMUS PRIME · **Author GitHub:** <https://github.com/mojomast>
- **Objects owned by this audit:** the `orbitdesktop` entry (`index: 1`, `readerServiceNo: 101`, `pageRange: 'pp. 08–17'`) and the `hermesdashboard` entry (`index: 10`, `readerServiceNo: 110`, `pageRange: 'pp. 90–99'`) in the root catalog.
- **Files this audit patched:** `projects.js` (narrow patch to the two owned objects only) and `js/projects.js` (the same two-object patch, kept byte-identical to root). New file: this report. **No other object, plate, widget, cover, metadata, CSS, HTML or app file was edited.**
- **No `AGENTS.md`/`AGENT.md` exists in the magazine repo** (the two *source* repos have their own `AGENTS.md` / `AGENT.md`; those are upstream and untouched).
- **Audit date (`researchedAt`):** 2026-10-13

## Canonical sources & revisions

Both projects were read from fresh canonical GitHub clones (read-only; the source repos were **not** modified). Default branch is `main` for both.

| Project | Repo | Default branch | Pinned `sourceRevision` | Head commit |
| --- | --- | --- | --- | --- |
| OrbitDesktop | <https://github.com/mojomast/orbitdesktop> | `main` | `9c4069a002c1d9376d9ae06776d4090aad49fc00` | `docs: record deployed agent content verbs and cross-reference the canvas path` (2026-10-07) |
| HermesDashboard | <https://github.com/mojomast/hermesdashboard> | `main` | `74ef867f3d7ad408c6c3c6aca6c91d4532464da9` | `feat: subagent in-flight monitor, brand gallery, bot/terminal backend refactor` (2026-08-20) |

- **Fork/upstream attribution:** neither repo is a GitHub fork (`fork: false`, verified via `gh api repos/…`). OrbitDesktop is a first-party agent-customizable desktop. HermesDashboard is the author’s **standalone packaging of the Hermes dashboard UI**; it *depends on* an existing upstream Hermes install but is not a fork of another public repository. This is stated so the catalog does **not** claim credit for upstream Hermes runtime code, and does **not** frame either project as a derivative or third-party donation.
- **Local checkouts used as evidence:** `/tmp/opencode/orbitdesktop` and `/tmp/opencode/hermesdashboard` (both at the pinned SHAs). No stale local project clones were relied on.
- **Version:** OrbitDesktop `package.json` `version: 0.3.1`.

---

## 1. `orbitdesktop` (#101)

**Repo description (verbatim, GitHub):** *“An agent-shaped desktop powered by Hermes. Describe what you need; build custom apps, reshape your workspace, and evolve your tools around the way you work.”* README title: **“Orbit Desktop.”**

### 1.1 Verified facts (basis for the rewrite)

| Fact | Evidence (pinned) |
| --- | --- |
| Local-first, single-owner, agent-operated browser desktop powered by Hermes. | `README.md` L1–L20; `docs/ARCHITECTURE.md` (“Orbit is a single-owner agent-customizable workspace”). |
| Real default layout is **movable windows**; **Docking** (tiled panels/tab groups, `dockview-core@8.3.1`) is **opt-in/experimental**. | `README.md` (“Desktop and experimental Docking”); `docs/ARCHITECTURE.md`; `package.json`. |
| **Spatial view** renders real HTML panes with a Three.js `PerspectiveCamera` + `CSS3DRenderer`; embedded controls stay native DOM/iframes. **CSS3D is explicitly not a browser engine or WebXR layer.** | `docs/ARCHITECTURE.md` §Connected surface rendering / L264; `src/scene.ts` L1–L13, L31. |
| Spatial placement uses **grid, row or curve** tiling with a validated `arc`; there is **no three-ring model**. | `src/spatial-layout.ts` L14–L22 (`tileSpatial(monitors, 'grid'|'row'|'curve', …)`); `docs/AGENT_GUIDE.md` (`set_arc`). |
| Persistent host terminals via **xterm.js + node-pty + tmux**; tmux survives browser reload, **not** host reboot. | `README.md` (“xterm.js + node-pty + tmux”); `docs/MANAGED_TERMINALS.md`. |
| Workspace authority is a local **SQLite** store (`workspace.sqlite`); layout, revisions, checkpoints and keyed command receipts commit atomically; the **serialized layout remains v1**. | `docs/WORKSPACE_STORE.md`; `docs/ARCHITECTURE.md` §State and control. |
| Agent control is the scoped **`orbit_workspace`** controller — **read-only by default**; mutations require `allow_mutations`. | `README.md` (agent technology table); `docs/WORKSPACE_CONTROL.md`. |
| Pane identity is keyed by **stable pane IDs**; native `Element.moveBefore` preserves iframe state where supported. | `docs/ARCHITECTURE.md` §Connected surface rendering. |
| **No Electron dependency**; it is a Vite-bundled browser app served by Node. **No CSS Houdini** (`registerPaint`/`paintWorklet`) anywhere. | `package.json` (deps); no `electron` references in `src/`/`server/`; no Houdini matches. |

### 1.2 Field-by-field audit of the old `orbitdesktop` object

Status legend: **SUPPORTED** · **CONTRADICTED** · **UNSUBSTANTIATED** · **UNMEASURED** (quantitative claim with no measurement).

| Field | Old claim (abridged) | Status | Evidence | Correction landed |
| --- | --- | --- | --- | --- |
| `headline` / `kicker` | “A Three-Ring Orbital Shell…” / “Beyond the Flat Desktop Metaphor” | CONTRADICTED | No rings; the product is a spatial scene with grid/row/curve tiling. | “A Browser Desktop the Agent Can Reshape” / “Agent-Customizable Spatial Workspace”. |
| `deck` | “…concentric depth rings with zero-latency IPC” | CONTRADICTED | No rings, no measured IPC. | Movable windows / opt-in tiling / Three.js + CSS3D. |
| `byline` | “By the Spatial Systems Desk · Fig. 1.1–1.4” | CONTRADICTED | Invented editorial desk. | “By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)”. |
| `pullQuote` | Fabricated curly-quoted line about “an observatory” | CONTRADICTED | Presented as sourced speech; nothing in the repo says this. | Replaced with an **editorial statement** (no quote marks, no attribution). |
| `bodyCopy` | “scene graph… orbital coordinate… IPC binding… Alt+Ring… WebGL2 compositor… JSON restores the exact orbital pose” | CONTRADICTED + UNMEASURED | No scene-graph window model, no `Alt+Ring`, no JSON-pose restore (SQLite + v1 layout), no GPU-timing measurement. | Rewritten around pane IDs, movable/Docking/Spatial renderers, SQLite store, `orbit_workspace`. |
| `fieldNotes` | “Ring I/II/III…” | CONTRADICTED | No such product rings. | Local-first/owner/agent; default vs opt-in layouts; grid/row/curve; SQLite checkpoints. |
| `editorialLead` | “…Electron/WebGL2 spatial compositor with a direct Unix-domain IPC bridge… three concentric orbital rings” | CONTRADICTED | No Electron; browser + Vite/Node; no agent IPC over a socket; no rings. | Browser desktop, movable windows, experimental Docking, Three.js + CSS3D. |
| `architecture[1]` | “Hardware-accelerated orbital compositor… three depth rings with spring-damped focus transitions” | CONTRADICTED | No spring damper; focus mode moves a monitor to a flat layer. | Pane-ID views + `Element.moveBefore` continuity. |
| `architecture[2]` | “Bi-directional Unix socket IPC bridge streaming live Hermes agent tool calls, diffs, subagent state” | CONTRADICTED | Unix sockets exist only for internal resource-delegation / knowledge-embedder paths; the agent integration is the scoped `orbit_workspace` controller, not a socket tool-call stream. | Three.js camera + CSS3DRenderer over native DOM/iframes. |
| `architecture[3]` | “`Alt+Ring`, `Ctrl+Orbit`… zero-latency camera snapping” | CONTRADICTED | No such keybindings (spatial navigation is WASD/QE/arrows inside navigation mode). | Default windows; opt-in Dockview + grid/row/curve tiling. |
| `architecture[4]` | “Declarative JSON workspace snapshots… exact orbital coordinates” | partly SUPPORTED / overstated | Layout persistence + checkpoints are real, but in SQLite (v1 layout); JSON is legacy/read-only. | xterm.js/node-pty/tmux + atomic SQLite commit. |
| `verifiedCapabilities` | 3-ring management, embedded agent runner, spatial minimap radar, shader backdrops | CONTRADICTED / UNSUBSTANTIATED | None exist as described. | Workspace controller; Three.js + CSS3D; persistent terminals; SQLite persistence. |
| `techStack` | `Electron / WebGL2`, `Hermes IPC`, `CSS Houdini` | CONTRADICTED | No Electron, no Houdini; IPC claim wrong. | `TypeScript`, `Three.js + CSS3D`, `Vite / Node`, `Hermes gateway`, `SQLite`, `xterm.js + tmux`. |
| `metrics` | “Frame Budget 16.6 ms (60fps)”, “Orbital Strata 3 Depth Rings”, “IPC Latency < 1.8 ms” | UNMEASURED + CONTRADICTED | No measurements; no rings. The renderer redraws only when dirty and pauses when the document is hidden. | `Package Version 0.3.1`, `Spatial Renderer Three.js + CSS3D`, `Terminal Stack xterm.js · tmux`. |
| `codeListing` / `codeListingTitle` | `computeRingPose(...)` “ORBITAL RING COMPOSITOR SOLVER” | CONTRADICTED | No such function exists. | Exact `spatialWindow(...)` excerpt from `src/spatial-layout.ts` L5–L13, with a pinned `codeSource`. |
| `terminalStream` | Four invented `[orbit:ring0]`/`[hermes:ipc]`/`[compositor]`/`[focus:snap]` lines | CONTRADICTED | Fake captured output, fake socket, fake pane count. | Factual **READING GUIDE** pointers to README/ARCHITECTURE/MANAGED_TERMINALS/RUNTIME_CONTINUITY. |
| `screenshotCaption` | “Desktop launchers and the Hermes agent shell” | partly CONTRADICTED | Image is byte-identical to the repo’s `docs/images/desktop-launchers.png`; it shows the app-launcher rail, the Windows/Spatial/Focus toggles and a display-configuration panel — not a “Hermes agent shell”. | “Orbit desktop: the application launcher rail beside the display-configuration panel”. |

### 1.3 New provenance fields (added)

```js
codeSource: {
  label: 'src/spatial-layout.ts L5–L13 · orbitdesktop@9c4069a',
  url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/src/spatial-layout.ts#L5-L13'
},
sources: [ /* 5 entries, all pinned to the SHA */ ],
sourceRevision: '9c4069a002c1d9376d9ae06776d4090aad49fc00',
researchedAt: '2026-10-13'
```

`sources` (all `github.com/mojomast/orbitdesktop/blob/9c4069a…/…`):
1. `README.md` — local-first/single-owner/agent-operated; v0.3.1
2. `docs/ARCHITECTURE.md` — renderers, state and control
3. `src/spatial-layout.ts` — spatial placement and tiling (excerpt source)
4. `docs/MANAGED_TERMINALS.md` — persistent terminal limits
5. `package.json` — v0.3.1 dependency manifest

---

## 2. `hermesdashboard` (#110)

**Repo description (verbatim, GitHub):** *“Standalone web dashboard for the Hermes AI agent runtime — chat, sessions, memory, skills, secrets, config, and graph visualization.”*

### 2.1 Verified facts (basis for the rewrite)

| Fact | Evidence (pinned) |
| --- | --- |
| Standalone **Python/Starlette** web dashboard for an **existing** Hermes install; **not** a full standalone runtime. | `requirements.txt` (`starlette`, `uvicorn`, `sse-starlette`); `README.md` “Important”; `IMPLEMENTATION.md` “Required Runtime Surface”. |
| Streaming Hermes chat over **Server-Sent Events**; single-line tool activity rows with drill-down. | `README.md` “What You Get”, “Streaming Reliability”; `app.py` `EventSourceResponse`; `sse_starlette`. |
| **Live subagent drawer**: a `child_session_started` event opens a floating panel that follows the child session’s `/api/sessions/{id}/stream` SSE feed. | `README.md` §Live Subagent Drawer (L429–L452). |
| **Canvas graph** (d3 zoom/quadtree) of sessions, files, tools, models and skills, with persisted display settings. | `templates/dashboard/partials/panels/graph.html` (`<canvas id="graph-canvas">`); `static/js/dashboard.js` L12707+ (`d3.scaleSqrt`, `d3.quadtree`); `README.md` “Sessions UX”. |
| Per-session **token & cost accounting**; sessions browser/detail; Message Board; cron Schedule viewer; Cmd+K palette; emergency-stop, Reattach/Resume for in-flight runs. | `README.md` “What You Get” and “Streaming Reliability”. |
| Optional browser **xterm.js + Unix PTY** terminal, **disabled by default**, **hard-disabled in Docker**; session cap default 4 (bounded 1–32). | `README.md` “Browser Terminal”. |
| **No pause / fork / rollback / steward-override** operator actions exist. | Absent from README/IMPLEMENTATION/source; the demonstrated controls are emergency-stop and reattach/resume. |
| “DAG” in this repo refers to the **Parallel Arena / Mission Control campaign DAG artifacts**, not a subagent topology map. | `app.py` L7591+ (`campaign DAG artifact`); `static/js/dashboard.js` “Mission Control DAG”. |
| **No license file**; repo not archived; not a fork. | repo tree; `gh api repos/mojomast/hermesdashboard`. |

### 2.2 Field-by-field audit of the old `hermesdashboard` object

| Field | Old claim (abridged) | Status | Evidence | Correction landed |
| --- | --- | --- | --- | --- |
| `kicker` / `headline` | “Real-Time Topology for Multi-Agent Swarms” / “Streaming SSE Thought Traces & Subagent DAGs at <8ms Lag” | CONTRADICTED + UNMEASURED | SSE is real; “<8ms” and “Subagent DAGs” are not measured/accurate. | “Operator Console for Hermes Sessions” / “Live Session Views and a Graph of the Agent Fleet”. |
| `deck` | “…shared KV locks, token economics, live steward checkpoints” | CONTRADICTED | No KV locks, no steward checkpoints; token accounting is real. | Streaming chat, sessions browser, live subagent drawer, canvas graph. |
| `byline` | “By the Cybernetics & Control Desk · Foldout Chart X” | CONTRADICTED | Invented desk. | “By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)”. |
| `pullQuote` | Fabricated curly-quoted line about needing “a live schematic of every subagent branch” | CONTRADICTED | Not a real quotation. | Editorial statement, no quote marks/attribution. |
| `bodyCopy` | “…multiplexes SSE from dozens of concurrent sessions into one live DAG… pause, fork, rollback, steward prompt… JSONL transcript” | CONTRADICTED | Graph is a general canvas graph, not a subagent DAG; no pause/fork/rollback/steward; no full JSONL transcript export. | Streaming chat, tool rows, live drawer, canvas graph, token/cost, Hermes dependency. |
| `fieldNotes` | “<8 ms”, “64+ concurrent sessions”, “pause/fork/rollback/steward in one click” | UNMEASURED + CONTRADICTED | Nothing measured; no such controls; terminal cap default 4. | Hermes dependency; SSE + WebSocket; delegate_task drawer; token/cost. |
| `editorialLead` | “…up to 64 concurrent Hermes sessions… one-click pause, fork, rollback, and steward prompt injection” | CONTRADICTED | No multiplexing count; no such controls. | Streaming chat, sessions browser, live drawer, d3/canvas graph, Starlette + Hermes. |
| `architecture[1]` | “SSE ingestion… across 64+ concurrent sessions” | UNSUBSTANTIATED | No concurrency figure in repo. | Starlette/uvicorn + SSE via `sse-starlette`. |
| `architecture[2]` | “Interactive 2D DAG topology canvas… shared KV stores, active file locks” | partly SUPPORTED / overstated | Canvas graph exists, but it is a sessions/files/tools/models/skills graph — not a subagent DAG with KV/file locks. | Live subagent drawer over `child_session_started` SSE. |
| `architecture[3]` | “Operator intervention console… live prompt injection, tool-call approval/veto, session checkpointing” | CONTRADICTED | Not present. | Canvas graph (d3) + persisted display settings. |
| `architecture[4]` | “Time-series telemetry recorder… latency percentiles, context saturation, token efficiency” | UNSUBSTANTIATED | Only read-only per-session token/cost aggregation exists. | Token/cost aggregation + optional Unix-PTY terminal. |
| `verifiedCapabilities` | sub-8ms SSE; subagent **DAG** map; one-click pause/fork/rollback/steward; “full JSONL transcript export” | CONTRADICTED / UNMEASURED | No such features/claims. JSONL ledgers exist for self-improvement, not a chat transcript export. | Real chat/tool rows, live drawer, canvas graph, token/cost, optional terminal. |
| `techStack` | `TypeScript`, `HTML5 Canvas DAG`, `Node.js`, `Reactive State Store` | CONTRADICTED | Repo is Python/Starlette + vanilla JS + d3. | `Python / Starlette`, `Server-Sent Events`, `WebSocket`, `SQLite`, `vanilla JS + d3`, `xterm.js`. |
| `metrics` | “< 8 ms End-to-End”, “64+ Agent Sessions”, “100% Tool Call Trace” | UNMEASURED + CONTRADICTED | No measurement; no 64-session claim; “100%” blanket. | `Starlette / Python`, `Server-Sent Events`, `Existing Hermes install`. |
| `codeListing` / `codeListingTitle` | `applySseEventToDag(...)` “SSE TOPOLOGY GRAPH REDUCER” | CONTRADICTED | No such function/DAG reducer exists. | Exact `_normalize_sse_payload` slice from `app.py` L667–L678, with a pinned `codeSource`. |
| `terminalStream` | Four invented `[control:sse]`/`[dag:topology]`/`[telemetry]`/`[checkpoint]` lines | CONTRADICTED | Fake captured output; fake 38.4% / snapshot #108. | Factual **READING GUIDE** pointers to README / IMPLEMENTATION. |
| `screenshotCaption` | (none — object has no screenshot) | SUPPORTED | `screenshot` is absent; the article would render the Canvas instrument. | Left absent; no fabricated screenshot. |

### 2.3 New provenance fields (added)

```js
codeSource: {
  label: 'app.py L667–L678 · hermesdashboard@74ef867',
  url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/app.py#L667-L678'
},
sources: [ /* 5 entries, all pinned to the SHA */ ],
sourceRevision: '74ef867f3d7ad408c6c3c6aca6c91d4532464da9',
researchedAt: '2026-10-13'
```

`sources` (all `github.com/mojomast/hermesdashboard/blob/74ef867…/…`):
1. `README.md` — standalone dashboard for an existing Hermes install
2. `IMPLEMENTATION.md` — packaging and required runtime surface
3. `app.py` — Starlette routes and SSE normalization (excerpt source)
4. `static/js/dashboard.js` — canvas graph and live drawer
5. `requirements.txt` — Starlette, uvicorn, sse-starlette

---

## 3. Unmeasured vs disproven (explicit)

**UNMEASURED (no evidence; could be true but unproven):** OrbitDesktop frame budget / “60fps”, “zero-latency IPC”, “< 1.8 ms” IPC, “GPU-timed transitions”; HermesDashboard “< 8 ms” SSE lag, “100%” tool-call trace.

**DISPROVEN / CONTRADICTED:** the 3-ring orbital model, “Electron/WebGL2 compositor”, “CSS Houdini”, “Unix-socket IPC bridge to Hermes agent tool calls”, `Alt+Ring`/`Ctrl+Orbit`, spring-damped focus, `computeRingPose`; HermesDashboard “64+ concurrent sessions”, subagent “DAG topology”, pause/fork/rollback/steward-override, TypeScript/Node stack, `applySseEventToDag`, both invented terminal traces, and both invented desks/byline quotations.

**INHERITED / DEPENDENCY (must not be claimed as this-project work):** HermesDashboard depends on the upstream **Hermes runtime**, its home directory and `state.db`; the catalog now says so explicitly. Neither repo is a GitHub fork.

---

## 4. Label audit — plates, widgets, cover (guidance for MAIN; **not edited here**)

These files were inspected only. Several are already modified by other agents (`git status`) — apply as guidance, do not clobber.

### 4.1 `js/plates/orbitdesktop.js`
| Line | Problem | Factual correction |
| --- | --- | --- |
| L2–L4 header | “window contexts mounted on **three graduated… rings**” | “native HTML panes placed in a Three.js/CSS3D spatial scene.” |
| L19–L21 | ring legends `I · PRIMARY FOCUS`, `II · ACTIVE CONTEXT`, `III · TELEMETRY` | No product rings exist. Use tiling vocabulary, e.g. “GRID / ROW / CURVE PLACEMENT”. |
| L103 | screen text `hermes> ring.focus(1) ▌` | Invented command. Use a real surface, e.g. `orbit_workspace` / “Spatial view”. |
| L183 | callout `III · TELEMETRY · UNIX-SOCKET IPC` | Socket ≠ agent IPC. Drop the socket claim; use “GRID / ROW / CURVE TILING”. |
| L188 canonical `title` | “…brass desktop orrery with engraved context rings… and a CRT sun” | “three graduated rings” wording overstates the product; describe placement instead of rings. |

*(The plate is stylised illustration; only the labels that assert architecture need changing.)*

### 4.2 `js/plates/hermesdashboard.js`
| Line | Problem | Factual correction |
| --- | --- | --- |
| L91 | `SSE / THOUGHT RECORDER` | SSE is real; “THOUGHT” is embellishment → `SSE / EVENT RECORDER`. |
| L97 | strip labels `A1 DISPATCH`, `A3 VERIFIED`, `11 ACTIVE` | Fabricated counts/statuses → label the block illustrative or remove. |
| L104 | `FLEET ORCHESTRATION / SSE` | The dashboard **observes** the fleet; it does not orchestrate it → `FLEET OBSERVABILITY / SSE`. |
| L113 | `XII / THE SUBAGENT CONSTELLATION` | Plate number is fine; “subagent constellation” overstates the product. |
| L114 | `ONE ORCHESTRATOR. ELEVEN AGENTS. EVERY THOUGHT ACCOUNTED FOR.` | Fabricated count and overclaim. Use “CHAT, SESSIONS, GRAPH · LIVE SUBAGENT VIEW”. |
| L75–L81, L116 | animated ROOT/A1…B7 DAG + `title` “fleet DAG” | Illustrative; label as illustrative, or scope to the real graph (sessions/files/tools/models/skills). |

### 4.3 `js/magazine-widgets.js`
| Line | Problem | Factual correction |
| --- | --- | --- |
| L360–L366 (`orbitdesktop`) | `3 Concentric Orbital Rings`, `FOCUS RING: I (PRIMARY)/II (CONTEXT)/III (TELEMETRY) · 14 PANES` | Contradicted. Use spatial tiling / pane placement. *(Note: `orbitdesktop` has a screenshot, so this canvas does not render today, but fix the label.)* |
| L872 (`hermesdashboard`) | `SSE / EVENT FABRIC` | Acceptable, but “Event Fabric” overstates; it is the dashboard’s SSE bridge. |
| L931–L935 | `ACTIVE AGENTS` 11/15/19/23, `<8 ms / SSE LAG` | Fabricated counts and unmeasured lag. Remove or mark illustrative. |
| L937 | `STEWARD CHECK` | No steward feature. Use `STREAM HEALTHY` / `EMERGENCY STOP`. |
| L939 | return string `… \${11 + mode*4} … active subagents · <8 ms event lag` | Fabricated counts + unmeasured lag. |
| L888/L921 | `SESSION / 01`, `A# / OK · RUN · WAIT` | Fabricated IDs/statuses → label illustrative. |

*(`hermesdashboard` has **no screenshot**, so its canvas widget **does** render — higher priority than the `orbitdesktop` one.)*

### 4.4 `index.html` (static cover/TOC copy)
| Line | Problem | Factual correction |
| --- | --- | --- |
| L122 | cover teaser “Breaking the flat Xerox PARC blotter with a **3-ring** Hermes agent shell” | Replace “3-ring” with the real spatial-workspace idea. |
| L177 | TOC row “Hermes **SSE Fleet DAG**” | It is a session/file/tool/model/skill graph plus a live subagent drawer, not a subagent DAG. |

### 4.5 `js/cover-plate.js`
- **No OrbitDesktop- or HermesDashboard-specific factual label.** Node names derive from `proj.title` (`LABELS[n.proj.id] || shortTitle(n.proj.title)`, L29/L268): rendered as “OrbitDesktop” and “Hermes Dashboard”. Case 9 “Three analogue fleet meters” is decorative. **No correction required**; if a sort label is ever added, it must not say “DAG”.

---

## 5. Caveats / residual risk

- **Publication rename:** `MAGAZINE_ISSUE_META` in root `projects.js` now reads **SLOP ILLUSTRATED / `Si.`** (another agent’s change). This audit’s bylines use the same identity. No publication metadata was edited by this audit.
- **`pageRange` intentionally preserved.** The navigation audit recommends deleting fake pagination; these two objects keep `pageRange` per this task’s explicit instruction (“preserve … pageRange”). MAIN should reconcile once the folio model lands.
- **Mirror state:** root `projects.js` and `js/projects.js` currently differ because other in-flight agents edited only root. This audit applied the **same two-object patch** to both, so the two owned objects are byte-identical across the mirror (verified). `npm run check:mirrors` will only pass after MAIN mirrors the remaining root-only edits.
- **Version drift:** all claims are pinned to the SHAs above; re-research if `main` advances. OrbitDesktop’s GitHub `pushed_at` (2026-10-13) is later than the `main` head commit date (2026-10-07), which only indicates activity on another branch — `main` is authoritative here.
- **Scope boundary:** the object credits upstream/Dependency facts explicitly (Hermes runtime for HermesDashboard; no third-party donors for either). No fork attribution is due.

## 6. Verification performed

```bash
node --check projects.js          # OK
node --check js/projects.js       # OK
# both owned objects extracted from root and mirror and compared: identical
node -e "…compare orbitdesktop & hermesdashboard objects…"   # IDENTICAL
```

- `git status`: only the two owned objects in `projects.js`/`js/projects.js` changed by this audit; plus this new report. No graphics, metadata, CSS, HTML or app files touched.
- **Not edited:** `js/plates/orbitdesktop.js`, `js/plates/hermesdashboard.js`, `js/magazine-widgets.js`, `js/cover-plate.js`, `index.html`, and every other catalog object.

*Files created by this task:* `docs/editorial-audit/desktop-dashboard.md` (this report).
