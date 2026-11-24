---
issueNumber: "01"
articleSlug: "warpi"
index: 9
readerServiceNo: 109
section: "LOCAL-FIRST WORKSTATIONS // RUST TERMINAL"
layoutVariant: "opener"
title: "Warpi"
kicker: "A Local Pi Agent Backend Behind Warp’s Block UI"
headline: "Warp’s Terminal. Your Model."
deck: "An independent Warp fork with a local Pi-agent bridge and your chosen OpenAI-compatible endpoint. No Warp account in the agent path."
byline: "By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)"
category: "Systems Programming / AI Terminal"
glanceNote: "Warp supplies the terminal and block interface. This fork adds the Pi-agent bridge, configurable provider credentials, and replacement of the Warp account gate in the agent path."
pullQuote: "Keep the terminal. Choose the model. Credit the foundations."
repoUrl: "https://github.com/mojomast/warpi"
liveUrl: null
sourceRevision: "760f4fe04caf335393e6e88f213c84f9c6eb4284"
researchedAt: "2026-10-13"
spotInkHex: "#15803d"
secondaryInkHex: "#1e293b"
techStack: ["Rust (fork adapter: crates/standalone_agent)","Node.js ≥22.19 (private stdio helper)","Pi coding-agent SDK 0.84.2","OpenAI Chat Completions","Upstream Warp terminal & block UI"]
metrics: [{"label":"Warp Account","value":"Not Required"},{"label":"Agent Wire Protocol","value":"OpenAI Chat Completions"},{"label":"Fork Version","value":"0.1.2 (2026-09-24)"}]
verifiedCapabilities: ["Provider configuration replaces the Warp account gate","Local or hosted Chat Completions endpoints; keys in the OS secret store","Inherited Warp approval, diff and tool-card controls","Chat Completions only; no Responses or Anthropic Messages emulation"]
architecture: ["Warp owns the terminal, block UI, approval cards, diffs, history, and every workspace side effect — all inherited from upstream Warp.","New fork code in `crates/standalone_agent` holds provider profiles, resolves credentials, supervises the helper, and translates its events into Warp’s native response events.","New fork code in `standalone/pi-helper` embeds the pinned Pi coding-agent SDK (0.84.2), owns the model loop and transcript, and runs as a supervised stdio child with no listening port.","Agent inference goes only to the user-configured OpenAI-compatible Chat Completions endpoint; Warp sign-in, credits, and cloud agent surfaces are hidden while standalone mode is active."]
fieldNotes: ["Independent fork of Warp; not affiliated with, endorsed by, or sponsored by Warp or Denver Technologies, Inc.","The terminal, block UI, PTY, VT100 emulation, and WGPU rendering are upstream Warp, not additions made by this fork.","Upstream-unverified areas (macOS packaging, hosted providers beyond DeepSeek, provider retry) are not claimed here."]
readingGuide: ["READING GUIDE — the lines below are documentation, not captured program output.","WHERE THE AGENT LIVES: `crates/standalone_agent` (Rust) supervises the private Node helper in `standalone/pi-helper`.","BYOK FLOW: Settings → Agents → Local Pi provider; pick a preset or a custom OpenAI-compatible base URL, then set the model id and limits.","CREDENTIALS: the profile stores only a reference; the API key goes to the OS secret store and is read at session open.","SIDE EFFECTS: the model proposes commands and edits; Warp’s approval cards, diffs, and allowlists decide and execute them.","EGRESS: inference goes to the configured endpoint only; Warp sign-in, credits, and cloud surfaces are hidden in standalone mode."]
flexiFreqs: [293.66,369.99,440,587.33]
plate: {"kind":"blender-webp","src":"/assets/editorial/warpi/the-unlicensed-sidecar.webp","width":1600,"height":1200,"title":"The Unlicensed Sidecar","medium":"BLENDER · EDITORIAL EXAGGERATION","alt":"A photorealistic studio still life of a sleek anodized-aluminum terminal monolith bypassed at its velvet-roped turnstile and plumbed via twin copper stdio pipes to a warm brass sidecar crowned with a sculpted Pi emblem and a miniature steel credential vault — an editorial illustration, not a product screenshot."}
secondaryMedia: {"kind":"svg-study","studyId":"warpi","width":640,"height":360,"caption":"Interactive conceptual study: BYOK provider selection, OS secret store reference, and supervised Pi stdio helper."}
codeExcerpt: {"title":"SOURCE EXCERPT 9.1 // PROVIDER PROFILE HOLDS A CREDENTIAL REFERENCE, NEVER THE SECRET","lang":"rust","code":"/// Where the credential for a profile comes from. The reference is a stable\n/// key into the OS secret store; it is never the secret itself.\n#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]\n#[serde(rename_all = \"snake_case\")]\npub enum CredentialRef {\n    /// No authentication: the wire request must not carry an Authorization header.\n    None,\n    /// Look up by key in the platform secret store.\n    SecretStore { key: String },\n}","sourceLabel":"crates/standalone_agent/src/provider.rs — CredentialRef","sourceUrl":"https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/crates/standalone_agent/src/provider.rs#L89-L98"}
sources: [{"label":"README — independent Warp fork, local Pi backend, no Warp account (v0.1.2)","url":"https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/README.md"},{"label":"standalone/ARCHITECTURE.md — ownership split and exchange/run model","url":"https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/standalone/ARCHITECTURE.md"},{"label":"crates/standalone_agent/src/provider.rs — provider profiles and credential reference","url":"https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/crates/standalone_agent/src/provider.rs"},{"label":"standalone/pi-helper/src/runtime.ts — pinned Pi SDK, offline resource discovery","url":"https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/standalone/pi-helper/src/runtime.ts"},{"label":"standalone/NETWORK_DEPENDENCIES.md — egress inventory (configured endpoint only)","url":"https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/standalone/NETWORK_DEPENDENCIES.md"}]
---

Warp provides the native terminal, blocks, approval cards and diffs. Warpi’s contribution is the backend: a Rust adapter supervises a local Pi coding-agent helper and replaces the Warp account gate. You choose the Chat Completions endpoint and credentials; it can be local or hosted.

Warpi is not a new terminal. The terminal, block UI, approval card, diff review, and persistence are upstream Warp, left intact; the fork adds `crates/standalone_agent` and `standalone/pi-helper` to put a local model loop behind them. The private Node helper owns the conversation transcript and drives the pinned Pi coding-agent SDK, while the Rust bridge validates every frame and renders helper events as the same response events Warp’s servers would send — so Warp’s native approval, allowlist, redirection, and read-only checks still decide every side effect. A provider profile carries a base URL, model id, limits, and a credential reference; the key itself stays in the OS secret store, and inference goes only from your machine to your endpoint.
