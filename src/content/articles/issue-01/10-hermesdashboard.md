---
issueNumber: "01"
articleSlug: "hermesdashboard"
index: 10
readerServiceNo: 110
section: "OBSERVABILITY & CONTROL // FLEET TELEMETRY"
layoutVariant: "essay"
title: "HermesDashboard"
kicker: "Operator Console · For Existing Hermes Installs"
headline: "A Window Into the Drawer Where the Subagents Work"
deck: "A standalone web dashboard for people who already run Hermes: streaming
  chat, a session browser, a live drawer for child agents, and a graph of
  everything they touched."
byline: "By SLOPTIMUS PRIME"
category: "Agent Observability / Operator Console"
glanceNote: "It needs a working Hermes install, its home directory and its
  state.db. It is a window onto Hermes, not a replacement for it."
pullQuote: "When an agent starts delegating, its log stops being readable."
repoUrl: "https://github.com/mojomast/hermesdashboard"
liveUrl: null
sourceRevision: "74ef867f3d7ad408c6c3c6aca6c91d4532464da9"
researchedAt: "2026-10-13"
spotInkHex: "#6d28d9"
secondaryInkHex: "#be185d"
techStack:
  [
    "Python / Starlette",
    "Server-Sent Events",
    "WebSocket",
    "SQLite",
    "vanilla JS + d3",
    "xterm.js"
  ]
metrics:
  [
    { "label": "Backend", "value": "Starlette / Python" },
    { "label": "Live Stream", "value": "Server-Sent Events" },
    { "label": "Dependency", "value": "Existing Hermes install" }
  ]
verifiedCapabilities:
  [
    "Streaming Hermes chat with single-line tool activity and drill-down
      panels",
    "Live subagent drawer for in-flight delegate_task child sessions",
    "Canvas graph across sessions, files, tools, models and skills",
    "Per-session token and cost accounting",
    "Optional local-only xterm.js terminal backed by a Unix PTY"
  ]
architecture:
  [
    "Starlette (Python) application served by uvicorn; `app.py` owns the route
      table and streams upstream Hermes output over Server-Sent Events via
      `sse-starlette`.",
    "Live subagent drawer: the agent emits a `child_session_started` event
      when `delegate_task` spawns a child, and the drawer follows that child
      session’s `/api/sessions/{id}/stream` SSE feed in a fixed floating panel.",
    "HTML5 Canvas graph with d3 zoom and pan across sessions, files, tools,
      models and skills, plus persisted display settings for labels, spacing,
      edges and panel sizing.",
    "Read-only token and cost aggregation, and an optional browser xterm.js
      terminal backed by a real Unix PTY, disabled by default and hard-disabled
      in Docker."
  ]
fieldNotes:
  [
    "Requires an existing Hermes install, not a standalone runtime.",
    "Streaming chat over Server-Sent Events, with WebSocket terminals.",
    "Live subagent drawer streams a delegate_task child session.",
    "Per-session token and cost accounting."
  ]
readingGuide:
  [
    "READING GUIDE // README.md: standalone dashboard for an existing Hermes
      install",
    "READING GUIDE // README.md §Live Subagent Drawer: child_session_started
      over SSE",
    "READING GUIDE // README.md §Streaming Reliability: long tool-heavy runs,
      resume and stop",
    "READING GUIDE // IMPLEMENTATION.md: installer flow and required Hermes
      runtime surface"
  ]
flexiFreqs: [ 311.13, 392, 466.16, 622.25 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/hermesdashboard/drawer-of-little-assistants.webp",
    "width": 1600,
    "height": 1200,
    "title": "The Drawer of Little Assistants",
    "medium": "BLENDER · CONCEPTUAL STILL LIFE",
    "alt": "A photorealistic studio still life of a walnut observatory cabinet
      topped with a brass planetarium orrery of linked spheres, with its lower
      mahogany drawer pulled open and glowing warmly to reveal miniature
      brass-and-porcelain clerk automatons working inside beside a mechanical
      token odometer. An editorial still life, not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "svg-study",
    "studyId": "hermesdashboard",
    "width": 640,
    "height": 360,
    "caption": "Walk the resource graph from files to tools to models, then open the
      subagent drawer."
  }
codeExcerpt:
  {
    "title": "LISTING 10.1 // SOURCE EXCERPT: SSE EVENT NORMALIZATION",
    "lang": "python",
    "code": "    hermes = parsed.get(\"hermes\")

      \    usage = parsed.get(\"usage\")

      \    if isinstance(hermes, dict):

      \        payload = dict(hermes)

      \        call_id = str(

      \            payload.get(\"call_id\") or payload.get(\"tool_call_id\") or
      \"\"

      \        ).strip()

      \        if call_id and not payload.get(\"call_id\"):

      \            payload[\"call_id\"] = call_id

      \        if payload.get(\"type\") == \"meta\" and usage:

      \            payload[\"usage\"] = usage

      \        payloads.append(payload)",
    "sourceLabel": "app.py L667–L678 · hermesdashboard@74ef867",
    "sourceUrl": "https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408\
      c6c3c6aca6c91d4532464da9/app.py#L667-L678"
  }
sources:
  [
    {
        "label": "hermesdashboard README",
        "url": "https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6\
          aca6c91d4532464da9/README.md"
      },
    {
        "label": "IMPLEMENTATION.md: packaging and runtime surface",
        "url": "https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6\
          aca6c91d4532464da9/IMPLEMENTATION.md"
      },
    {
        "label": "app.py: Starlette routes and SSE normalization",
        "url": "https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6\
          aca6c91d4532464da9/app.py"
      },
    {
        "label": "static/js/dashboard.js: canvas graph and live drawer",
        "url": "https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6\
          aca6c91d4532464da9/static/js/dashboard.js"
      },
    {
        "label": "requirements.txt: Starlette, uvicorn, sse-starlette",
        "url": "https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6\
          aca6c91d4532464da9/requirements.txt"
      }
  ]
---

When an agent starts delegating, its log stops being readable. One session spawns a child to explore a repository, the child runs a test suite, the parent carries on, and all of it arrives interleaved in one scrolling column. HermesDashboard gives that work a shape.

Chat streams over Server-Sent Events. Tool calls fold into single lines you can open when you care. When `delegate_task` spawns a child session, a floating Live view drawer follows the child as it works. A canvas graph, panned and zoomed with d3, ties sessions to the files, tools, models and skills they used, and per-session badges show what the tokens cost.

There is an optional browser terminal backed by a real Unix PTY; it is off by default and hard-disabled in Docker. The README is clear that this is not a standalone runtime. It is the dashboard, packaged so you can run it beside the Hermes you already have.
