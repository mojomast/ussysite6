---
issueNumber: "02"
articleSlug: "uirizz"
index: 5
readerServiceNo: 205
section: "DECLARATIVE AGENT INTERFACES // A2UI SURFACES"
layoutVariant: "essay"
title: "uirizz"
kicker: "A2UI v1.0 Cards in Hermes Chat. A Click Is Never Approval."
headline: "Let the Agent Draw a Card—Then Make the Human Type Yes"
deck: "Official @a2ui/react surfaces inside Hermes Desktop and Webapp replies, backed by CLI fallback text, 40-SHA install pins, and a fail-closed action gate."
byline: "By SLOPTIMUS PRIME · Folio 07"
category: "Agent UI / Declarative Surfaces"
glanceNote: "Renders official A2UI v1.0 Basic Catalog widgets via one a2ui_render tool without hijacking transform_llm_output. Terminal and Telegram readers get required fallback_text; button clicks only queue requests."
pullQuote: "When a comparison matrix beats a wall of prose, draw the card—but a button click must never silently ship, send, or delete anything."
repoUrl: "https://github.com/mojomast/uirizz"
liveUrl: null
sourceRevision: "98b795a4312f4894a27e85547f5f013d3304dbca"
researchedAt: "2026-11-23"
spotInkHex: "#f0b86e"
secondaryInkHex: "#54d3a1"
techStack:
  - "Python 3.10+ / FastAPI"
  - "@a2ui/react (A2UI v1.0)"
  - "Hermes >= 0.23.0"
  - "Night Hive Dark Theme"
  - "40-SHA Git Pinning"
metrics:
  - label: "Tool Surface"
    value: "1 tool (a2ui_render: present / update / audit)"
  - label: "Install Pin Policy"
    value: "Full 40-char SHA only (tags/short SHAs rejected)"
  - label: "Release Version"
    value: "0.1.0 (2026-11-23)"
verifiedCapabilities:
  - "Mounts official @a2ui/react v1.0 Basic Catalog cards in Hermes Desktop and Webapp while emitting required fallback_text for CLI, Telegram, and TUI"
  - "In-place data updates via op=update and updateDataModel using distinct surface_id keys so multiple cards coexist in one thread"
  - "Fail-closed POST /actions handler: side-effect clicks record an unapproved request that waits for a typed yes in chat"
  - "Public-HTTPS-only media validation and coexistence alongside hermes-a2ui (does not hook transform_llm_output)"
architecture:
  - "Single-tool surface lifecycle: the agent calls `a2ui_render` (`op=present`, `update`, or `audit`); the plugin validates official A2UI v1.0 catalog components, persists the surface, and returns a `MEDIA:` token plus `fallback_text`."
  - "Distinct surface identity fix (`desktop/src/ids.js`): eliminates compiler-default `main` ID collisions so status boards and three-column comparison matrices render side-by-side in the same conversation."
  - "Fail-closed confirmation gate (`dashboard/plugin_api.py`): `_record_action` logs surface clicks with redacted argument bindings and `approved: False` unless the user explicitly marked a low-risk action `auto_approve` in their own local actions file; logging exceptions also return `approved: False`."
  - "Strict supply-chain hygiene: installation instructions and tooling reject mutable branch names, tags, and truncated commit hashes."
fieldNotes:
  - "Not listed in the upstream Hermes plugin catalog yet; install with `hermes plugins install mojomast/uirizz --ref <40-char-sha> --enable`."
  - "Webapp screenshots in the repository depict mock espresso-machine and checkout-api fixtures, explicitly labelled as fictional data."
  - "Night Hive card styling is intentionally always dark."
readingGuide:
  - "READING GUIDE // README.md — mermaid flow from a2ui_render to typed-yes approval in chat."
  - "READING GUIDE // dashboard/plugin_api.py — fail-closed /actions endpoint where logging errors refuse approval."
  - "READING GUIDE // desktop/src/card.jsx — @a2ui/react mounting and Night Hive presentation."
flexiFreqs:
  - 329.63
  - 415.3
  - 493.88
  - 659.25
plate:
  kind: "carbon-svg"
  svgId: "plate-uirizz"
  width: 1600
  height: 1200
  title: "A Click Is Only a Petition"
  medium: "CARBON LITHOGRAPH · INTERACTION GATE"
  alt: "Editorial diagram of two dark A2UI comparison cards inside a chat stream connected by a dotted petition wire to an interlock switch that opens only when a physical 'yes' keystroke arrives from the chat composer."
secondaryMedia:
  kind: "svg-study"
  studyId: "uirizz"
  width: 800
  height: 450
  caption: "Trace how uirizz separates an A2UI button click from a fail-closed typed-yes approval."
codeExcerpt:
  title: "LISTING 5.1 // FAIL-CLOSED UI ACTION GATE (dashboard/plugin_api.py)"
  lang: "python"
  code: |2
        # A click never approves anything. The only exception is a low-risk
        # declared action the user marked auto_approve in their own actions file.
        "approved": rec["status"] == "approved",
    }
    ...
    @router.post("/actions")
    def post_action(body: dict[str, Any]) -> dict[str, Any]:
        try:
            return _record_action(body)
        except Exception:  # noqa: BLE001 — fail closed; nothing was approved
            return {
                "ok": False,
                "code": "record_failed",
                "error": "The action could not be logged, so it was not accepted.",
                "fix": "Retry the click.",
                "approved": False,
            }
  sourceLabel: "dashboard/plugin_api.py L62–L92 · uirizz@98b795a"
  sourceUrl: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3304dbca/dashboard/plugin_api.py#L62-L92"
sources:
  - label: "uirizz README — A2UI v1.0 catalog cards, 40-SHA install pin & typed-yes flow"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3304dbca/README.md"
  - label: "dashboard/plugin_api.py — fail-closed /actions and /audit REST router"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3304dbca/dashboard/plugin_api.py"
  - label: "desktop/src/card.jsx — Night Hive @a2ui/react surface renderer"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3304dbca/desktop/src/card.jsx"
  - label: "CHANGELOG.md — v0.1.0 authoring & surface-ID collision fixes"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3304dbca/CHANGELOG.md"
---

Chat interfaces suffer from two opposite failure modes: either the model dumps a forty-line Markdown table that wraps into unreadable spaghetti on a laptop screen, or someone lets an LLM inject raw interactive HTML buttons where one stray click fires a destructive webhook. **uirizz** (`0.1.0`, shipped November 23, 2026) threads the needle by bringing official **A2UI v1.0 Basic Catalog** widgets (`@a2ui/react`) into Hermes Desktop and Webapp replies through a single tool, `a2ui_render`, while requiring plain-text `fallback_text` so CLI, TUI, and Telegram sessions never stare at broken markup.

Its defining conviction sits right in the banner: *a click is never approval*. Clicking an action button inside a rendered card merely logs a pending petition with redacted parameter bindings; nothing executes until the human types `yes` in the chat stream itself—and if the audit log throws an exception while recording the click, `post_action` fails closed with `"approved": False`. Even plugin installation refuses tags, branch names, and short hashes: you pin all forty hexadecimal characters of the commit SHA or you don't install it at all.
