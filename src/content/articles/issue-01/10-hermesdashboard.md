---
issueNumber: "01"
articleSlug: "hermesdashboard"
index: 10
readerServiceNo: 110
section: "OBSERVABILITY & CONTROL // FLEET TELEMETRY"
layoutVariant: "essay"
title: "HermesDashboard"
kicker: "Operator Console for Hermes Sessions"
headline: "A Clearer View of the Agent Fleet"
deck: "Streaming chat, session history and a live subagent drawer, connected by a resource graph. Requires an existing Hermes installation."
byline: "By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)"
category: "Agent Observability / Operator Console"
glanceNote: "Works alongside an existing Hermes installation. Session browsing, a live child-agent drawer, resource relationships, and per-session token and cost views expose the work already running there."
pullQuote: "Follow the work across sessions, not just the latest log line."
repoUrl: "https://github.com/mojomast/hermesdashboard"
liveUrl: null
sourceRevision: "74ef867f3d7ad408c6c3c6aca6c91d4532464da9"
researchedAt: "2026-10-13"
spotInkHex: "#6d28d9"
secondaryInkHex: "#be185d"
techStack: ["Python / Starlette","Server-Sent Events","WebSocket","SQLite","vanilla JS + d3","xterm.js"]
metrics: [{"label":"Backend","value":"Starlette / Python"},{"label":"Live Stream","value":"Server-Sent Events"},{"label":"Dependency","value":"Existing Hermes install"}]
verifiedCapabilities: ["Streaming Hermes chat with single-line tool activity and drill-down panels","Live subagent drawer for in-flight delegate_task child sessions","Canvas graph across sessions, files, tools, models and skills","Per-session token and cost accounting","Optional local-only xterm.js terminal backed by a Unix PTY"]
architecture: ["Starlette (Python) application served by uvicorn; `app.py` owns the route table and streams upstream Hermes output over Server-Sent Events via `sse-starlette`.","Live subagent drawer: the agent emits a `child_session_started` event when `delegate_task` spawns a child, and the drawer follows that child session’s `/api/sessions/{id}/stream` SSE feed in a fixed floating panel.","HTML5 Canvas graph with d3 zoom and pan across sessions, files, tools, models and skills, plus persisted display settings for labels, spacing, edges and panel sizing.","Read-only token and cost aggregation, and an optional browser xterm.js terminal backed by a real Unix PTY—disabled by default and hard-disabled in Docker."]
fieldNotes: ["Requires an existing Hermes install—not a standalone runtime.","Streaming chat over Server-Sent Events, with WebSocket terminals.","Live subagent drawer streams a delegate_task child session.","Per-session token and cost accounting."]
readingGuide: ["READING GUIDE // README.md — standalone dashboard for an existing Hermes install","READING GUIDE // README.md §Live Subagent Drawer — child_session_started over SSE","READING GUIDE // README.md §Streaming Reliability — long tool-heavy runs, resume and stop","READING GUIDE // IMPLEMENTATION.md — installer flow and required Hermes runtime surface"]
flexiFreqs: [311.13,392,466.16,622.25]
plate: {"kind":"blender-webp","src":"/assets/editorial/hermesdashboard/drawer-of-little-assistants.webp","width":1600,"height":1200,"title":"The Drawer of Little Assistants","medium":"BLENDER · CONCEPTUAL STILL LIFE","alt":"A photorealistic studio still life of a walnut observatory cabinet topped with a brass planetarium orrery of linked spheres, with its lower mahogany drawer pulled open and glowing warmly to reveal miniature brass-and-porcelain clerk automatons working inside beside a mechanical token odometer — an editorial still life, not a product screenshot."}
secondaryMedia: {"kind":"svg-study","studyId":"hermesdashboard","width":640,"height":360,"caption":"Interactive conceptual study: session-to-resource graph across files, tools, and models."}
codeExcerpt: {"title":"LISTING 10.1 // SOURCE EXCERPT — SSE EVENT NORMALIZATION","lang":"python","code":"    hermes = parsed.get(\"hermes\")\n    usage = parsed.get(\"usage\")\n    if isinstance(hermes, dict):\n        payload = dict(hermes)\n        call_id = str(\n            payload.get(\"call_id\") or payload.get(\"tool_call_id\") or \"\"\n        ).strip()\n        if call_id and not payload.get(\"call_id\"):\n            payload[\"call_id\"] = call_id\n        if payload.get(\"type\") == \"meta\" and usage:\n            payload[\"usage\"] = usage\n        payloads.append(payload)","sourceLabel":"app.py L667–L678 · hermesdashboard@74ef867","sourceUrl":"https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/app.py#L667-L678"}
sources: [{"label":"hermesdashboard README","url":"https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/README.md"},{"label":"IMPLEMENTATION.md — packaging and runtime surface","url":"https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/IMPLEMENTATION.md"},{"label":"app.py — Starlette routes and SSE normalization","url":"https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/app.py"},{"label":"static/js/dashboard.js — canvas graph and live drawer","url":"https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/static/js/dashboard.js"},{"label":"requirements.txt — Starlette, uvicorn, sse-starlette","url":"https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/requirements.txt"}]
---

When Hermes spawns specialized subagents to explore repositories and run test suites, flat logs stop being readable. HermesDashboard turns the runtime into an operator console: a streaming chat surface, a scannable sessions browser, a live subagent drawer, and a d3/canvas graph linking sessions to the files, tools, models and skills they used. It runs as a Starlette app against an existing Hermes install, and it is honest about that dependency.

HermesDashboard packages the Hermes dashboard as a standalone Python web app for people who already run Hermes. Chat streams over Server-Sent Events, tool activity collapses into single-line rows that expand on demand, and a floating “Live view” drawer follows a `delegate_task` child session as it works. A canvas graph ties sessions to the files, tools, models and skills they touched, and per-session token and cost badges make the economics visible. It is explicitly not a standalone Hermes runtime: it depends on a working Hermes install, its home directory and `state.db`.
