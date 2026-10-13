# Editorial Audit — CoCS & CoCS-Godot

**Publication:** SLOP ILLUSTRATED (Si.)
**Author:** SLOPTIMUS PRIME (github.com/mojomast)
**Researched:** 2026-10-13
**Scope:** the `cocs` and `cocs-godot` catalog objects in root `/projects.js`, plus graphic-label
fact-checking for their SVG and Canvas figures. No source repos were modified.
**Mirror note:** only root `projects.js` was patched; `/js/projects.js` is left for MAIN to mirror.

## Canonical revisions fetched

| Repo | Default branch | Commit SHA | Commit date | Fetched via |
|---|---|---|---|---|
| `github.com/mojomast/cocs` | `main` | `9a89e80012b387af71877b0ed5a0469e39f00a79` | 2026-09-24 | `gh api repos/mojomast/cocs/commits?per_page=1` + shallow clone |
| `github.com/mojomast/cocs-godot` | `main` | `1f1e5f5486904f5d08a9768bc0321fb82b647e76` | 2026-10-07 | `gh api repos/mojomast/cocs-godot/commits?per_page=1` + shallow clone |

`mojomast/tokenarena` resolves to `mojomast/cocs` (repository rename), so the catalog
`repoUrl` of `https://github.com/mojomast/cocs` is correct.

Live endpoint check (2026-10-13): `https://arena.ussyco.de` returns HTTP 200 with
`<title>Colosseum Of Competitive Slop — COCS</title>`, and `/api/version` reports
`{"version":"v8.8.3","codename":"DESTINATIONS","protocol":3}`. This is an unauthenticated
fetch, not a gameplay session.

---

## CoCS — claim-by-claim

| # | Old catalog claim | Verdict | Evidence |
|---|---|---|---|
| 1 | "Deterministic 60Hz Arena Physics" | **Supported** | `server/game-server.mjs:51` (`tickDt = 1/60`), `game/data.mjs:61` (`RULES.dt=1/60`), `README.md:268`. README calls the pure engine "deterministic"; treat as the project's own descriptor. |
| 2 | "250 ms historical AABB rewind buffer" / "server-side lag compensation" / "historical hitbox rewind" | **Contradicted** | No rewind/lag-comp buffer exists. `grep -ri rewind` over non-test source returns only `server/game-server.mjs:300,417-418` `rewindEvents()` (re-send of a dropped *event batch*) and a director replay note in `game/view.mjs:3623`. Latency fairness is client prediction + reconciliation, `game/net.mjs:530-558`, and interpolation, `game/net.mjs:60`. |
| 3 | "compact binary WebSocket protocol" / "binary snapshots" / "192-byte binary state snapshot" | **Contradicted** | `game/protocol.mjs:380-382` measures frames as `TextEncoder().encode(JSON.stringify(value))`; `server/game-server.mjs:105,111` sends `ws.send(text)`; README tech stack (`cocs/README.md:347`) says "Node `http` + `ws`, authoritative rooms and JSON persistence". Measured live snapshots: ~20 KB (8-actor deathmatch), ~26 KB (8-actor COCS mode); keyframes up to 78–100 KB (`game/cocs-net-budget.test.mjs:65-66,76-77`). "192 bytes" is off by two to three orders of magnitude. |
| 4 | "per-client bandwidth under 28 KB/s" | **Contradicted** | Budget tests cap per-client bandwidth at 3.0 Mbps (24 actors) and 3.5 Mbps (32 actors) — about 375–437 KB/s (`game/cocs-net-budget.test.mjs:68,78`; `server/cocs-pvp-net.test.mjs:275`). |
| 5 | "Nine parody operators" | **Supported** | `game/data.mjs:2+` defines 9 `CHARACTERS` (chatgpt, claude, grok, meta, gemini, deepseek, mistral, kimi, qwen); 7 harnesses; `README.md:3`. |
| 6 | "Nine parody operators … backfill any empty slot" | **Partly contradicted** | Bots are configured via `botCount`; LATTICE rungs bot-fill empty seats (`server/rooms.mjs:124`, `server/room.mjs:1019`, `game/config.mjs:97`) and disconnect hands a seat to a bot (`README.md:280`). Nine is the operator count, not a bot count; Combined Arms fields up to 16 bots (`README.md:8,207`). |
| 7 | "utility-scored behaviour trees" | **Unsubstantiated** | Bot AI is role/personality/archetype weighting (`game/bot-personalities.mjs`), not documented as behaviour trees. Qualified in the catalog. |
| 8 | "Live Browser Multiplayer at arena.ussyco.de" / live endpoint | **Supported** | HTTP 200 + correct title + `/api/version` (above); `deploy/arena.ussyco.de.nginx:1`. |
| 9 | "Instant browser-playable … matches" | **Supported** | `README.md:5-9` (browser + LAN), run instructions `README.md:371+`. |

**Notable discrepancy:** the live deployment reports **v8.8.3 (DESTINATIONS)** while the public
default branch README badge reads **v8.6 PRISM** at HEAD `9a89e80`. The public source lags the
live build; the catalog is pinned to the public SHA and does not assert a version.

### Actual contribution / attribution
- CoCS is an original project by the same author (github.com/mojomast). Three.js + a pure
  60 Hz JS engine + a `ws` authoritative server, all procedural, MIT-licensed.
- No third-party game engine or asset pack is claimed; the "AI operators" are parody
  characters in code, not live model inference (README: "No inference service").

---

## CoCS-Godot — claim-by-claim

| # | Old catalog claim | Verdict | Evidence |
|---|---|---|---|
| 1 | "Translating the Arena into Godot 4 Forward+ & SDFGI" | **Contradicted** | `godot/project.godot:21-22` sets `renderer/rendering_method="gl_compatibility"`; `config/features` includes `"GL Compatibility"`. `grep -ri sdfgi` returns **zero** matches in `godot/`, `port/` or `app/`. |
| 2 | "SDFGI real-time global illumination — no baked probes" | **Contradicted** | Same as above — no SDFGI, no GI settings in `project.godot`. |
| 3 | "32,000 GPU compute particles at zero CPU cost" | **Partly supported / partly unsubstantiated** | The particle lab supports 32,768 as one of five counts (`godot/particle_lab/field.gd:8`) across GPU and analytic backends, and reports measured frame cadence. "Zero CPU cost" is an unmeasured guarantee. |
| 4 | "Wire-compatible with the canonical CoCS multiplayer server" | **Supported** | `README.md:8` (Node simulation authoritative); `godot/net/client.gd:31` `WebSocketPeer.new()`, `:158` `send_text(JSON.stringify(frame))` — the same JSON protocol. The port bundles the original `game/` + `server/` modules. |
| 5 | "offline single-player campaign client" | **Partly supported** | The Quiet Relay campaign runs against a **bundled local Node.js server** (`port/campaign/PLAY.md:1-12`, `node run.mjs --experience=campaign`), so it needs no internet but is not a self-contained in-engine simulation. |
| 6 | "Analytical second-order spring solver driving … recoil and FOV kick" | **Supported (recoil/sway); FOV qualification** | `godot/source_operators/motion_math.gd:3-8` is an exact closed-form critically damped spring ("no Euler integration") used for recoil/sway/landing; a separate spring in `godot/sports/chase.gd:48` drives follow-cam/FOV. |
| 7 | "Custom GDScript + GLSL spatial shaders for holographic shields, muzzle refraction, procedural skyboxes" | **Partly supported** | Many real `.gdshader` labs exist (`godot/combat_shields/interference.gdshader`, `godot/weapon_effects/*.gdshader`, `godot/shader_lab/*`). Godot's shading language is not literally "GLSL"; the specific nouns are editorial. |
| 8 | "Godot 4.x scene tree architecture" | **Supported** | Godot 4.5 project, `godot/main.tscn` + autoloads (`godot/project.godot:2-18`). |
| 9 | "GPU compute particle FX for projectile trails and impacts" | **Partly supported** | Real GPU particle/shader labs exist (`godot/combat_particles/`, `godot/weapon_effects/`); the catalog now scopes this to the lab. |
| 10 | Screenshot caption "Native Forward+ combat on the Verdant Reliquary" | **Contradicted** | The asset `assets/screenshots/cocs-godot.png` (1280×800) reads "Meridian Exchange / Team Deathmatch" in its HUD; renderer is GL Compatibility. Caption corrected to the observed map/mode. |

### Actual contribution / attribution
- CoCS-Godot is a **derivative port**: it explicitly bundles the original CoCS source and its
  history so the simulation lock and verification evidence stay reproducible (`README.md:29-32`).
- The port's own contribution is the native layer: Godot client/controls/HUD/audio, native map
  geometry (`godot/native_arenas/`, `godot/biomes/`), the Quiet Relay campaign, vehicle/sports
  routes, LATTICE command surfaces, and the shader/material/particle labs.
- The simulation, map definitions and protocol remain upstream (`game/`, `server/`).

### Development status / known limitations
- CoCS-Godot: "**actively developed, playable prototype**" (`README.md:12`). Documented limits
  include: ordinary-input VIP extraction "remains unaccepted", full Blackwater ten-wave/champion
  completion "remains unobserved", campaign chapter time is a "5–10 minute … target awaiting human
  timing", and full-round/human-play limitations live in the release notes. Many acceptance gates
  (226/226, 228/228, 359/359 in different batches) have passed, but they are the project's own gates.
- CoCS web: shipped and deployed; public default branch trails the live build (see discrepancy note).

---

## Graphic-label corrections for MAIN (do not applied here)

These are factual-label fixes required in files this audit does **not** own. The panels stay as
art; only the words change.

### SVG — `js/plates/cocs.js`
- L172 `'60HZ HISTORICAL HITBOX BUFFER (250MS / 15 TICKS)'` → no historical buffer exists. Use e.g.
  `'60HZ AUTHORITATIVE TICK · 30HZ SNAPSHOTS'`.
- L173 `'RTT: 96MS · CATMULL-ROM'` → interpolation is linear (`lerp`) at ~100 ms render delay, not
  Catmull-Rom. Use e.g. `'INTERPOLATION · ~100MS RENDER DELAY'`.
- L129-135 ghost trail `t-250ms … t-48ms` and the `t-96ms [HIT!]` marker depict a rewind that does
  not exist. Retitle as predicted-vs-authoritative deltas or drop the "rewind" framing.
- L150-155 hitscan beam is annotated as striking "the historical torso"; retarget wording to the
  current authoritative AABB hitbox.
- L219 `'REWIND · TICK −6'` → remove "REWIND".
- L4 / L226 doc-comment and SVG `<title>` ("repeated silhouettes show rewind", "past-position
  silhouettes, and a punched 60Hz rewind strip") → the strip is a tick timeline, not a rewind buffer.

### Canvas — `js/magazine-widgets.js` `drawRewindChronograph` (L619-695)
- L621 header `'60 Hz / 250 ms BUFFER'` → `'60 Hz SERVER · 30 Hz SNAPSHOTS'`.
- L683-688 dial `'125' / '250'` + `'HISTORICAL OFFSET'` → relabel as RTT / prediction error; those
  numbers imply a 250 ms buffer that does not exist.
- L693 footer `'HITSCAN / HISTORY VERIFIED'` → `'HITSCAN / PREDICTION RECONCILED'`.
- L694 return string `REWIND t−{delay} ms · 60 Hz server · historical hitbox verified` → e.g.
  `PREDICTION LAG {delay} ms · 60 Hz server · snapshot reconciled`.
- L667-668 `'THEN' / 'NOW'` → `'PREDICTED' / 'AUTHORITATIVE'`.

### SVG — `js/plates/cocs-godot.js`
- L215 `'FORWARD+ / THE OPTICAL FOUNDRY'` → `'GL COMPATIBILITY / THE OPTICAL FOUNDRY'`.
- L216 `'32,000 PARTICLES · ONE LIGHTFIELD'` → `'GPU PARTICLE LAB · 8K–1M SLOTS'` ("one lightfield"
  is not a project term; counts are selectable).
- L217 `'SPRING RECOIL · CLUSTERED LIGHT · SDFGI'` → remove SDFGI/clustered light:
  `'SPRING RECOIL · SHADER & PARTICLE LABS'`.
- L2 / L36 / L96 / L196 / L220 / L224 comments and titles mention "Forward+"/"SDFGI" → update for
  consistency (comments only, but they seed copy elsewhere).
- L20, L74, L192 `sdfgi-bounce` gradient id → rename (cosmetic; ids are scoped).

### Canvas — `js/magazine-widgets.js` case `'cocs-godot'` (L442-456)
- L443 comment `// Vulkan Forward+ Recoil Spring & GPU Particle Cone` → `// GL Compatibility Spring & Particle Lab`.
- L445 status `VULKAN SDFGI // 32K GPU PARTICLES · SPRING K=…` → `GL COMPATIBILITY // PARTICLE LAB · SPRING`.

### README (outside this audit's edit scope)
- `README.md:20-21` still describes the CoCS plate as "60Hz server hitbox vs. 250ms historical
  lag-rewind visualizer". MAIN should align it with the corrected graphic wording.

---

## Sources used (pinned)

**CoCS @ `9a89e80`**
- README — netcode: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/README.md#L268-L280
- 60 Hz tick: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/server/game-server.mjs#L51
- Prediction/reconciliation: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/net.mjs#L530-L558
- JSON wire size: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/protocol.mjs#L380-L382
- Bandwidth/keyframe budget: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/cocs-net-budget.test.mjs#L60-L79
- AABB actor hit: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/core.mjs#L329-L330
- Deploy vhost: https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/deploy/arena.ussyco.de.nginx#L1

**CoCS-Godot @ `1f1e5f5`**
- README status/authority: https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/README.md#L1-L20
- Renderer: https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/project.godot#L20-L22
- Transport: https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/net/client.gd#L31
- Spring math: https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/source_operators/motion_math.gd#L3-L8
- Particle counts: https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/particle_lab/field.gd#L8
- Campaign launch: https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/port/campaign/PLAY.md#L1-L12
