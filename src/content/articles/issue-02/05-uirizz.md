---
issueNumber: "02"
articleSlug: "uirizz"
index: 5
readerServiceNo: 205
section: "DECLARATIVE AGENT INTERFACES // A2UI SURFACES"
layoutVariant: "essay"
title: "uirizz"
kicker: "Agent Interfaces · A2UI Cards in Chat"
headline: "A Click Is Not a Yes"
deck: "uirizz lets a Hermes agent draw real cards in chat, comparisons, forms
  and status boards, and makes sure that pressing a button on one never sends,
  ships or deletes anything by itself."
byline: "By SLOPTIMUS PRIME"
category: "Agent UI / Declarative Surfaces"
glanceNote: "One tool, a2ui_render, using the official A2UI v1.0 Basic Catalog.
  Desktop and Webapp show the card; the CLI and Telegram get the required
  fallback text. Anything with a side effect waits for a typed yes."
pullQuote: "You pin the full forty-character commit or you don’t install it."
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
  - "Mounts official @a2ui/react v1.0 Basic Catalog cards in Hermes Desktop and
    Webapp while emitting required fallback_text for CLI, Telegram, and TUI"
  - "In-place data updates via op=update and updateDataModel using distinct
    surface_id keys so multiple cards coexist in one thread"
  - "Fail-closed POST /actions handler: side-effect clicks record an unapproved
    request that waits for a typed yes in chat"
  - "Public-HTTPS-only media validation and coexistence alongside hermes-a2ui
    (does not hook transform_llm_output)"
architecture:
  - "Single-tool surface lifecycle: the agent calls `a2ui_render` (`op=present`,
    `update`, or `audit`); the plugin validates official A2UI v1.0 catalog
    components, persists the surface, and returns a `MEDIA:` token plus
    `fallback_text`."
  - "Distinct surface identity fix (`desktop/src/ids.js`): eliminates
    compiler-default `main` ID collisions so status boards and three-column
    comparison matrices render side-by-side in the same conversation."
  - "Fail-closed confirmation gate (`dashboard/plugin_api.py`): `_record_action`
    logs surface clicks with redacted argument bindings and `approved: False`
    unless the user explicitly marked a low-risk action `auto_approve` in their
    own local actions file; logging exceptions also return `approved: False`."
  - "Strict supply-chain hygiene: installation instructions and tooling reject
    mutable branch names, tags, and truncated commit hashes."
fieldNotes:
  - Not in the Hermes plugin catalog yet. Install from git, pinned.
  - "The README’s screenshots use mock data: three espresso machines and a
    checkout-api status card."
  - It deliberately does not register transform_llm_output, so it can sit beside
    hermes-a2ui.
readingGuide:
  - "READING GUIDE // README.md: mermaid flow from a2ui_render to typed-yes
    approval in chat."
  - "READING GUIDE // dashboard/plugin_api.py: fail-closed /actions endpoint
    where logging errors refuse approval."
  - "READING GUIDE // desktop/src/card.jsx: @a2ui/react mounting and Night Hive
    presentation."
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
  alt: "Editorial diagram of two dark A2UI comparison cards inside a chat stream
    connected by a dotted petition wire to an interlock switch that opens only
    when a physical 'yes' keystroke arrives from the chat composer."
secondaryMedia:
  kind: "svg-study"
  studyId: "uirizz"
  width: 800
  height: 450
  caption: "Press the button. Watch nothing happen. Then type yes."
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
  sourceUrl: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5\
    f013d3304dbca/dashboard/plugin_api.py#L62-L92"
sources:
  - label: "uirizz README: A2UI v1.0 catalog cards, 40-SHA install pin & typed-yes
      flow"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3\
      304dbca/README.md"
  - label: "dashboard/plugin_api.py: fail-closed /actions and /audit REST router"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3\
      304dbca/dashboard/plugin_api.py"
  - label: "desktop/src/card.jsx: Night Hive @a2ui/react surface renderer"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3\
      304dbca/desktop/src/card.jsx"
  - label: "CHANGELOG.md: v0.1.0 authoring & surface-ID collision fixes"
    url: "https://github.com/mojomast/uirizz/blob/98b795a4312f4894a27e85547f5f013d3\
      304dbca/CHANGELOG.md"
---

Chat has two bad habits with structured information. Either the agent prints a forty-row table that wraps into soup, or someone lets it render buttons and a stray click fires a webhook. uirizz keeps the cards and removes the danger. Through one tool, `a2ui_render`, an agent can show official A2UI v1.0 components in Hermes Desktop and Webapp, update them in place by `surface_id`, and always include plain `fallback_text` for the places that cannot draw.

The banner says it in five words: a click is never approval. Pressing a button on a card records a request, with its arguments redacted, and returns `approved: false`. Nothing runs until you type yes in the chat. If the audit log fails while recording the click, the handler fails closed, refuses the action and asks you to try again. The one exception is a low-risk action you marked `auto_approve` in your own actions file.

Installation has the same temperament. Tags, branch names and short SHAs are rejected. You pin the full forty-character commit or you don’t install it.
