---
issueNumber: "01"
articleSlug: "routetok"
index: 6
readerServiceNo: 106
section: "SYSTEMS TELEPHONY // AI ROUTING"
layoutVariant: "dossier"
title: "RouteTok"
kicker: "Model Routing · Zero Runtime Dependencies"
headline: "It Will Not Swap Models Mid-Sentence"
deck: "A local gateway in front of many model providers. It retries a failing
  provider before the answer starts. If a stream breaks after that, it tells
  you, instead of quietly changing brains."
byline: "By SLOPTIMUS PRIME"
category: "Local LLM Routing / Observability"
glanceNote: "One Node process with no runtime npm dependencies, OpenAI- and
  Anthropic-compatible endpoints, an operations dashboard and Prometheus
  metrics. Fallback only happens before the first token commits."
pullQuote: "Switching brains mid-sentence is easy, and RouteTok won’t do it."
repoUrl: "https://github.com/mojomast/routetok"
liveUrl: null
sourceRevision: "7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3"
researchedAt: "2026-10-13"
spotInkHex: "#047857"
secondaryInkHex: "#0369a1"
techStack:
  [
    "TypeScript",
    "Node.js 22+ (ESM)",
    "OpenAI / Anthropic HTTP APIs",
    "Circuit-breaker FSM",
    "Prometheus metrics"
  ]
metrics:
  [
    { "label": "Runtime Deps", "value": "0 npm Packages" },
    { "label": "Circuit States", "value": "Closed / Open / Half-open" },
    { "label": "Failover", "value": "Pre-output Only" }
  ]
verifiedCapabilities:
  [
    "Zero runtime npm dependencies; devDependencies limited to TypeScript, tsx
      and @types/node",
    "Health-aware pre-output failover across OpenAI- and Anthropic-compatible
      providers",
    "Three-state circuit breaker with cooldown and a single in-flight
      half-open probe",
    "Live SSE throughput metering, Prometheus metrics and cost accounting"
  ]
architecture:
  [
    "Hand-rolled Node `http` server (no framework) exposing OpenAI Chat
      Completions/Responses and Anthropic Messages on one `/v1` surface, with
      per-provider credentials and namespaced model IDs.",
    "`HealthRouter` resolves explicit provider order, virtual routes (`auto`,
      `best`, `free`), custom cascades and a paid-OpenRouter fallback chain that
      runs ahead of AgentRouter last-resort routes.",
    "Three-state circuit breaker (closed / open / half-open) opens on a
      consecutive-failure threshold or a failure-rate window, holds for
      `circuitOpenMs`, then admits one in-flight half-open probe.",
    "Pre-output retry policy: fallback only before semantic or tool output
      begins; a committed stream reports `stream_interrupted` rather than
      splicing models.",
    "Streaming proxy with SSE token/cost telemetry, Prometheus metrics,
      `x-router-*` attempt summaries and a browser-local Fieldbook (Compare,
      Room, Iteration Studio)."
  ]
fieldNotes:
  [
    "Fallback is pre-output only; a committed stream ends with
      `stream_interrupted`, never a splice.",
    "Circuit opens on consecutive failures or a ≥50% failure window; half-open
      admits one in-flight probe.",
    "Zero runtime npm dependencies; devDependencies are TypeScript, tsx and
      @types/node.",
    "Legacy `agentrouter_router_*` Prometheus families are retained alongside
      planned `routetok_*` names."
  ]
readingGuide:
  [
    "READING GUIDE // README.md: three surfaces (proxy / dashboard / sandbox)
      and health-aware pre-output fallback",
    "READING GUIDE // src/router.ts: HealthRouter candidate ranking and
      circuit admission",
    "READING GUIDE // test/integration/committed-stream.test.ts: a committed
      stream ends with a truthful frame, not a splice",
    "READING GUIDE // docs/api.md: circuit open / half-open semantics and
      Prometheus families",
    "NOTE // no latency benchmark is published; the repository states no 0.35
      ms or 15 ms figure"
  ]
flexiFreqs: [ 220, 261.63, 329.63, 440 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/routetok/never-splice-mid-sentence.webp",
    "width": 1600,
    "height": 1200,
    "title": "Never Splice Mid-Sentence",
    "medium": "BLENDER · CONCEPTUAL STILL LIFE",
    "alt": "A photorealistic studio still life of a three-domed brass relay
      switchboard, showing a closed copper knife switch, a tripped open breaker,
      and a half-open balance beam carrying a single golden probe sphere, beside
      an uncut cream paper ticker tape and a pair of wax-sealed tailor shears on
      a velvet cushion. An editorial still life, not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "screenshot",
    "src": "/assets/screenshots/routetok.png",
    "width": 1440,
    "height": 1000,
    "caption": "The operations dashboard: success rate, throughput, time to first
      token, fallback rate and the trends it keeps.",
    "alt": "The operations dashboard: success rate, throughput, time to first token,
      fallback rate and the trends it keeps."
  }
codeExcerpt:
  {
    "title": "LISTING 6.1 // SOURCE EXCERPT: CIRCUIT-BREAKER ADMISSION (src/router.ts)",
    "lang": "ts",
    "code": "        const state = this.peek(protocol, model);

      \        if (state.entitlementBlocked) return false;

      \        if (state.rateLimitedUntil && state.rateLimitedUntil > now)
      return false;

      \        if (state.circuitState === \"open\") {

      \          if (!state.circuitOpenUntil || state.circuitOpenUntil > now)
      return false;

      \          state.circuitState = \"half-open\";

      \        }

      \        if (state.circuitState === \"half-open\") return state.inflight
      === 0;

      \        return true;

      \      });",
    "sourceLabel": "src/router.ts L139–L148 · routetok@7016c8d",
    "sourceUrl": "https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2\
      563c2e7eb2bdbbfd3/src/router.ts#L139-L148"
  }
sources:
  [
    {
        "label": "routetok README: surfaces, pre-output fallback, non-affiliation",
        "url": "https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e\
          7eb2bdbbfd3/README.md"
      },
    {
        "label": "src/router.ts: HealthRouter circuits, ranking and attempt admission",
        "url": "https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e\
          7eb2bdbbfd3/src/router.ts"
      },
    {
        "label": "docs/api.md: circuit states and metrics exposition",
        "url": "https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e\
          7eb2bdbbfd3/docs/api.md"
      },
    {
        "label": "test/integration/committed-stream.test.ts: committed-stream honesty
          tests",
        "url": "https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e\
          7eb2bdbbfd3/test/integration/committed-stream.test.ts"
      },
    {
        "label": "package.json: zero runtime dependencies, three devDependencies",
        "url": "https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e\
          7eb2bdbbfd3/package.json"
      }
  ]
---

There is a tempting trick in model routing. A provider dies halfway through a reply, so you hand the rest of the sentence to a different model and hope nobody notices the change in voice. Switching brains mid-sentence is easy, and RouteTok won’t do it. It will try another candidate before any text or tool output has committed. Once a stream has committed and then breaks, the proxy sends a truthful `stream_interrupted` frame and lets you decide what to do.

Behind that rule is a `HealthRouter` that ranks providers by success rate, consecutive failures, requests in flight and a running latency average, and a circuit breaker with three states. A failing route opens, sits out a cooldown, then lets exactly one probe through in the half-open state before it is trusted again.

All of it runs on Node’s built-ins. The only devDependencies are TypeScript, tsx and @types/node. The project publishes no latency benchmark, and the reading notes point out that it doesn’t, rather than letting a number appear from nowhere.
