# Truthfulness audit — `velvetrp` & `becomussy` catalogue objects

**Document owner:** this file only (`docs/editorial-audit/narrative-memory.md`).
**Source objects rewritten:** `USSY_PROJECTS[1]` (`velvetrp`) and `USSY_PROJECTS[10]`
(`becomussy`) in the root `projects.js` and its mirror `js/projects.js`. No other
objects, metadata, CSS, HTML, app, or graphics were edited.
**Researched:** 2026-10-13.
**Method:** canonical GitHub via `gh api` — read each repository's `default_branch`,
pinned the default-branch commit SHA, then read `README` and the actual
implementation/tests at that SHA. Local checkouts were inspected only to confirm
remotes/freshness and were **not** used as the source of truth. No project source
repository was modified. No commit or push was made.

| Repo | Default branch | Pinned revision (`sourceRevision`) | Latest default-branch commit date |
| --- | --- | --- | --- |
| `github.com/mojomast/velvetrp` | `main` | `4447d2cdb0260174bb2c2461f76600d11980c427` | 2026-10-07 |
| `github.com/mojomast/becomussy` | `main` | `7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f` | 2026-06-03 |

Author attribution used throughout: **SLOPTIMUS PRIME** (`github.com/mojomast`).
No fictional institute/lab bylines were retained.

---

## 1. VelvetRP

### 1.1 What the project actually is

VelvetRP is a **local-first AI roleplay and campaign RPG** whose stated contract is
that the model may propose but the server decides what became true. Stack:
TypeScript npm workspace (`client/` React + Vite, `server/` Fastify +
`better-sqlite3`, `packages/contracts/` Zod schemas). Rooms stream over **HTTP
server-sent events**, not WebSockets; the server is explicitly a **trusted-local**
single-`local-owner` application with no remote-auth boundary. It adapts **SRD 5.1
(Wizards of the Coast, CC BY 4.0)** into bounded mechanics and records that
attribution in `NOTICE.md`.

Development status: an **actively developed MVP** (`README.md` §"Current boundaries"),
Node.js 22, TypeScript, no license file, 2 stars at time of survey.

### 1.2 Claim-by-claim verdicts (old copy → new copy)

| Old claim | Verdict | Evidence |
| --- | --- | --- |
| "cryptographically verifiable dice oracle" | **Supported as a frozen protocol checkpoint, overstated as a shipped feature** | `server/src/verifiableDiceProtocol.ts` (SHA-256/HKDF/HMAC commit–reveal, unbiased sampling, `VerifiableDiceProof`); but `docs/ROADMAP.md:59` — "M5.5 checkpoint Complete (no schema) … Persistence and command/client integration remain Planned"; `docs/revision-2-integration-plan.md:242` — "persistence and command/client integration Planned. Schema: none allocated." Non-goal at `:249`: "no … claim that commit-reveal makes every endpoint cryptographically fair." |
| "seeded from a published hex value, letting any reader re-derive each roll" | **Contradicted in mechanism** | The protocol is client-entropy + server-secret commit–reveal with HMAC proof (`verifiableDiceProtocol.ts:675-L698`), not a single published hex seed. |
| "dual-column theatrical script layout / composer" | **Contradicted** | No such UI exists. `README.md` describes the **Adventure Table**: one public story + one `Send action` composer with Story/Map tabs. The string "dual-column" does not occur in the repo. |
| "immutable SQLite event ledger … every beat is 100% auditable and replayable" | **Overstated** | `README.md:235-259` describes atomic commands, revisions, events, and per-action receipts over local SQLite. There is durable state and receipts, but no per-prose-beat immutable ledger and no "100% replayable" guarantee. |
| "WebSocket presence engine" / "multi-author WebSocket presence" | **Contradicted** | No WebSocket code in the repo. Rooms use `text/event-stream` SSE (`server/src/routes/roleplay/interactions.ts:366,476`); `README.md:235` — "HTTP / server-sent events"; `:267` — trusted-local, fixed `local-owner`, no remote-auth boundary. |
| "whispers routed only to their recipient, never persisted" | **Partially supported, "never persisted" unsubstantiated** | `README.md` supports private planning separate from public narration and trust-gated disclosure, but no source states whispers are never persisted. |
| "Blades-style progress clocks", "branching world clocks" | **Contradicted** | No progress-clocks feature. World time is **recorded** and advanced by the Director (`README.md` §"AI Director"); timeline/checkpoints exist, not clock segments. |
| "declarative rulebook schema … custom dice pools" | **Partially supported** | Pluggable rulesets exist (`server/src/rulesets/registry.ts`, an SRD 5.1 adapter), but "custom dice pools + Blades clocks" is not a product feature. |
| "one-click export to typeset HTML & Markdown anthologies" | **Contradicted** | Import/export and campaign exports exist (`README.md`), but "anthology"/"typeset" do not occur in the repo. |
| metrics: "Sync Jitter < 12 ms", "100% Replayable", "Dual-Column Folio" | **Unsubstantiated** | No measurement or such feature is published. Replaced with sourced facts (below). |
| `LISTING 2.1` `resolveRoll(seedHex, …)` code | **Fabricated** | No `sampleDeterministicPool`/`resolveRoll`/`CRITICAL_GRACE` anywhere in the repo. Replaced with a real, pinned excerpt. |
| byline "Narrative Engines Group" | **Fabricated** | Replaced with "By SLOPTIMUS PRIME · Folio II". |
| pull-quote attributed to a speaker | **Invented sourced quotation** | Replaced with an editorial takeaway (no attribution). |

### 1.3 Fields now in the catalogue (verified copy)

- **headline:** "A Local-First Campaign RPG Where the Server Owns What Became True"
- **deck / lead / body:** local-first Fastify + SQLite/WAL, Zod contracts, atomic
  commands and per-action receipts, bounded source-attributed recall, up to twelve
  characters per room, SSE streaming.
- **architecture:** SQLite/`better-sqlite3` WAL; shared Zod contracts; SSE rooms;
  pluggable SRD 5.1 ruleset; off-by-default illustrations / OmniVoice / System One.
- **capabilities:** 14-section staged worldbuilding; server-resolved checks/powers/
  rests/commerce/trades/encounters/progression; source-attributed recall with
  trust-gated disclosure; human/reviewed/delegated Director; commit–reveal dice
  **checkpoint**.
- **techStack:** TypeScript · React + Vite · Fastify · Zod · SQLite (better-sqlite3,
  WAL) · SSE · Node.js 22.
- **metrics (sourced facts, not guarantees):** Local SQLite (WAL) · `177 trusted-local ops`
  (`README.md:259`) · Up to 12 characters (`README.md:27`) · Commit–reveal checkpoint
  (`ROADMAP.md:59`).
- **codeListing:** real excerpt from `server/src/verifiableDiceProtocol.ts`
  (`settleVerifiableRoll`), pinned `#L675-L698`; title `SOURCE EXCERPT // COMMIT–REVEAL DICE SETTLEMENT`.
- **terminalStream:** factual reading-guide notes (main labels), no fake logs.
- **sources (5):** README, `docs/ROADMAP.md#L59`, `docs/revision-2-integration-plan.md#L240-L253`,
  `server/src/verifiableDiceProtocol.ts#L675-L698`, `server/package.json`.

### 1.4 Screenshot caption

The capture `assets/screenshots/velvetrp.png` (2400×1650) is a real Adventure Table
screenshot of the fictional "The Ninth Current · Baie-Comeau" demo campaign and
matches `README.md`. The old caption was accurate but generic; it now reads
*"The Adventure Table: one shared story, Story/Map tabs, and a single 'Send action'
composer."* Dimensions and path are unchanged.

---

## 2. Becomussy

### 2.1 What the project actually is

Becomussy is a **governed continuity MVP for agent self-development**: a FastAPI
"modular monolith" over PostgreSQL (+pgvector) and Redis, with a Next.js frontend.
It offers typed, provenanced memory; journals; threads/projects/commitments; a
**versioned self-model**; and **risk-classified revision proposals** that route
high-risk identity changes through human approval, with an immutable audit trail.

Development status: **MVP**, initial commit 2026-03-06, last default-branch commit
2026-06-03. No license. Auth is explicitly temporary; search is keyword-only; the
drift layer and vector/hybrid search are deferred. `ARCHITECTURE.md` lists delivered
vs deferred tickets and notes `workers/` are "future".

### 2.2 Claim-by-claim verdicts

| Old claim | Verdict | Evidence |
| --- | --- | --- |
| "Five-Layer Memory Stratigraphy: L1 Ephemeral Sensory Buffer … L5 Core Identity Covenant" | **Contradicted (invented mapping)** | Real memory kinds are `episodic | semantic | autobiographical | working | relational` (`backend/app/models/memory.py:33`; `backend/app/schemas/common.py:41`; `spec.md:44,143`). There is no "sensory buffer", "procedural skill vault", or "L5 covenant" memory layer. The self-model is a **separate** versioned registry across four facets. |
| "Steward Gate … Ed25519 … cryptographic sign-off" | **Contradicted** | No `ed25519`, hash-chain, Merkle, or signature primitive appears in the implementation. `backend/app/core/security.py:4-5` — "MVP uses header-based auth (X-User-Id / X-User-Role). Replace with real OAuth/JWT in production."; `:46` — "Read identity from request headers (MVP – no real auth)." Governance is human approval + risk policy (`services/revisions`, `services/governance`). |
| "hash-chained continuity ledger" | **Contradicted** | `ARCHITECTURE.md:16,63,85-94` describes an **immutable audit trail** (`audit_events`, always `immutable: true`), not a hash chain. |
| "automatic episodic-to-semantic consolidation (reflective sleep cycle)" | **Contradicted (deferred)** | `README.md:11` says "journal system and periodic synthesis" as an intent; `ARCHITECTURE.md` defers the weekly synthesis job (E7–E9) and `workers/` are "future". No consolidation pipeline is implemented. |
| "Identity Drift 0.00%" / "drift detection" | **Unsubstantiated; explicitly deferred** | Drift is only a spec (`spec.md:853-867`) and roadmap item; `plan.md:144` excludes "advanced drift detection" from MVP and `plan.md:235` places "basic drift alerts" in a later phase. No drift metric exists. |
| "Portable identity capsule exportable across LLM backbones" | **Unsubstantiated** | The real artifact is a **resume bundle** compiled at session start (`services/search/context_compiler.py`; `README.md:265`), not a cross-model identity capsule. |
| "Immutable hash-chained … provenance across model upgrades" | **Overstated** | Immutable audit events and a versioned self-model exist; cross-model portability is not implemented. |
| metrics: "5 Governed Layers", "0.00% Unsanctioned", "Cryptographic Seal" | **Unsubstantiated** | Replaced with sourced facts. |
| `LISTING 11.1` `propose_stratum_mutation` / `verify_ed25519_steward_seal` | **Fabricated** | No such symbols exist. Replaced with a real, pinned excerpt. |
| byline "Continuity & Stewardship Institute" | **Fabricated** | Replaced with "By SLOPTIMUS PRIME · Monograph XI". |
| pull-quote attributed to a speaker | **Invented sourced quotation** | Replaced with an editorial takeaway. |

### 2.3 Fields now in the catalogue (verified copy)

- **headline:** "A Governed Continuity System for Agent Self-Development"
- **architecture:** modular monolith service boundaries; five typed/provenanced
  memory kinds; versioned four-facet self-model with semantic diffing; risk-classified
  revision proposals with approval/defer/policy/freeze; immutable audit trail + resume
  bundle.
- **capabilities:** memory search/reinforce/contradict; self-model diffing; risk-based
  governance; threads/projects/commitments + resume bundle; immutable audit events.
- **techStack:** Python 3.12 / FastAPI · PostgreSQL + pgvector · SQLAlchemy + Alembic ·
  Redis · Next.js · Docker Compose.
- **metrics (sourced facts):** 5 typed + provenanced memory kinds · Versioned, 4-facet
  self-model · Risk-gated approval.
- **codeListing:** real `_classify_risk`/`_determine_policy` from
  `backend/app/services/revisions/__init__.py`, pinned `#L29-L63`; title
  `SOURCE EXCERPT // RISK-CLASSIFIED REVISION GATE`. This is the genuine governance
  gate and is the honest replacement for the fabricated "Steward Gate" listing.
- **terminalStream:** factual reading-guide notes incl. the header-auth caveat and the
  deferred drift/vector-search caveat.
- **sources (5):** README, `backend/app/core/security.py#L1-L46`,
  `backend/app/models/memory.py#L30-L40`, `backend/app/services/revisions/__init__.py#L25-L63`,
  `ARCHITECTURE.md#L1-L40`.

### 2.4 Upstream attribution

No third-party upstream project is adapted (unlike VelvetRP → SRD 5.1). Becomussy is
original work by the repository owner; the old copy's attribution to a fictional
"Continuity & Stewardship Institute" was removed.

### 2.5 Screenshots

Becomussy has **no** screenshot field (unchanged); its spread uses the drawn plate +
interactive lab canvas. Nothing about its dimensions/paths was altered.

---

## 3. Graphics audit (SVG plates + canvas) — REQUIRED MAIN CORRECTIONS

These files are **not edited here**; the corrections below are required of the MAIN
editor so the artwork stops asserting unverified claims.

### 3.1 `js/plates/becomussy.js` (SVG plate "The Five Geological Strata")

- `names = ['SENSORY','EPISODIC','SEMANTIC','PROCEDURAL','IDENTITY']` — **wrong labels**.
  Actual memory kinds: `EPISODIC / SEMANTIC / AUTOBIOGRAPHICAL / WORKING / RELATIONAL`
  (`models/memory.py:33`). "IDENTITY" is not a memory kind (the self-model is a
  separate versioned registry).
- `label(... 'Ed25519')` / `'SEALED'` (plate ~L94-95) and the `svgRoot` title
  "…an Ed25519 identity geode" — **contradicted**: no Ed25519 or crypto seal exists;
  `security.py` states auth is header-based and "no real auth".
- `svgRoot` title "…mineral knowledge, basalt skills and an Ed25519 identity geode" —
  rewrite to reflect typed memory + human-approved revision gate.
- Suggested honest replacement concepts: five geological strata labelled with the real
  five memory types; the sealed capsule reframed as a **human-approved revision gate**
  (no cryptographic claim), or explicitly a stylised editorial illustration.

### 3.2 `js/magazine-widgets.js` `drawMemoryArchive` (becomussy canvas, ~L942-949)

- `strata` labels `CORE COVENANT / STEWARD SEALED · PROCEDURAL / SIGNED SKILL VAULT ·
  SEMANTIC / KNOWLEDGE GRAPH · EPISODIC / PERSISTENT JOURNAL · SENSORY / EPHEMERAL
  BUFFER` — **wrong**. Replace with the real five memory kinds; drop "STEWARD SEALED"
  and "SIGNED SKILL VAULT" (no signing), and drop the false L5-covenant ordering.
- `stateCount = 5` is numerically fine for five memory kinds once relabelled.

### 3.3 `js/plates/velvetrp.js` (SVG plate "The Oracle at Dusk")

- `label(... 'CANONICAL EVENT-SOURCED MERKLE LOG')` (plate ~L274) — **fabricated**: no
  Merkle tree or event-sourced Merkle log exists.
- The 6-segment astronomical "world clock" and the `2d12 ORACLE · [11, 9] + 3 = 23`
  callout are illustrative; if kept, they must be captioned as editorial illustrations,
  not product behaviour. The dice are a fine motif (the repo does have a d20/dice
  system and a commit–reveal dice checkpoint), but "Merkle" must go.

### 3.4 `js/magazine-widgets.js` velvetrp canvas branch (~L388-415)

- Status strings `2d12 ORACLE… // CLOCK: n/6` and "Deterministic 2d12 Dice Oracle &
  6-Segment World Clock" — unsupported specifics. This canvas is currently **not
  rendered** for VelvetRP (the project has a screenshot), but the dead branch should be
  relabelled or removed to match the plate rules. "dual prose ledger lines" likewise has
  no product basis.

---

## 4. Local checkout freshness (confirming remotes only)

| Local path | Remote | Local ref / SHA | Note |
| --- | --- | --- | --- |
| `/home/mojo/projects/becomussy` | `github.com/mojomast/becomussy` | `main` @ `7f8b180` "Initial commit: becomussy MVP" (2026-03-06) | **Stale** — behind canonical `main` (`7ac531e`, 2026-06-03). Do **not** cite local. |
| `/home/mojo/projects/velvet-mvp` | `github.com/mojomast/velvetrp` | `feat/foundry-context-diagnostic` @ `644e450` (2026-10-13) | A feature branch ahead of canonical `main` (`4447d2c`). Canonical default branch is `main`, so `main` SHAs were used. |
| `/home/mojo/projects/rpg-dm-bot` | `github.com/mojomast/rpg-dm-bot` | `master` @ `547566b` | Unrelated older project; not the VelvetRP repo. Not used. |

## 5. Mirror status

Both edited objects are byte-identical between root `projects.js` and `js/projects.js`,
and both files pass `node --check`. At the time of writing the two files are **not**
globally identical because other agents had updated their own objects in the root file
(`jammate`, `rgbagentflightindicator`, `mothbake`, `warpi`) without mirroring to
`js/projects.js` yet. That is outside this task's ownership; `npm run check:mirrors`
will pass once those agents mirror their objects.

## 6. Open caveats carried into the copy

- VelvetRP: the verifiable-dice protocol is a **frozen no-schema checkpoint**;
  persistence, command integration and the client verifier are **Planned**. Copy says so.
  Agent-initiated NPC combat and short-rest declarations are observed live-evaluation
  gaps; SRD execution is partial (catalog breadth ≠ full rules support).
- Becomussy: MVP auth is header-based (no real auth); governance freeze state is
  in-memory; drift detection and vector/hybrid search are deferred; background workers
  are future.

No `AGENTS.md` exists in `ussysite6`, so no magazine-specific agent policy applied.
No commit or push was performed.
