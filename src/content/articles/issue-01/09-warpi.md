---
issueNumber: "01"
articleSlug: "warpi"
index: 9
readerServiceNo: 109
section: "LOCAL-FIRST WORKSTATIONS // RUST TERMINAL"
layoutVariant: "opener"
title: "Warpi"
kicker: "Terminal · Independent Warp Fork"
headline: "Same Terminal. Your Model. No Sign-In at the Door."
deck: "Warpi keeps Warp’s terminal and block interface and puts a local Pi agent
  behind it, pointed at whichever OpenAI-compatible endpoint you choose."
byline: "By SLOPTIMUS PRIME"
category: "Systems Programming / AI Terminal"
glanceNote: "Warp built the terminal, the blocks, the approval cards and the
  diffs. This fork adds the Pi bridge, provider profiles, and a way past the
  account gate in the agent path. It is not affiliated with Warp."
pullQuote: "The model can propose a command; Warp still asks before running it."
repoUrl: "https://github.com/mojomast/warpi"
liveUrl: null
sourceRevision: "760f4fe04caf335393e6e88f213c84f9c6eb4284"
researchedAt: "2026-10-13"
spotInkHex: "#15803d"
secondaryInkHex: "#1e293b"
techStack:
  [
    "Rust (fork adapter: crates/standalone_agent)",
    "Node.js ≥22.19 (private stdio helper)",
    "Pi coding-agent SDK 0.84.2",
    "OpenAI Chat Completions",
    "Upstream Warp terminal & block UI"
  ]
metrics:
  [
    { "label": "Warp Account", "value": "Not Required" },
    { "label": "Agent Wire Protocol", "value": "OpenAI Chat Completions" },
    { "label": "Fork Version", "value": "0.1.2 (2026-09-24)" }
  ]
verifiedCapabilities:
  [
    "Provider configuration replaces the Warp account gate",
    "Local or hosted Chat Completions endpoints; keys in the OS secret store",
    "Inherited Warp approval, diff and tool-card controls",
    "Chat Completions only; no Responses or Anthropic Messages emulation"
  ]
architecture:
  [
    "Warp owns the terminal, block UI, approval cards, diffs, history, and
      every workspace side effect; all inherited from upstream Warp.",
    "New fork code in `crates/standalone_agent` holds provider profiles,
      resolves credentials, supervises the helper, and translates its events
      into Warp’s native response events.",
    "New fork code in `standalone/pi-helper` embeds the pinned Pi coding-agent
      SDK (0.84.2), owns the model loop and transcript, and runs as a supervised
      stdio child with no listening port.",
    "Agent inference goes only to the user-configured OpenAI-compatible Chat
      Completions endpoint; Warp sign-in, credits, and cloud agent surfaces are
      hidden while standalone mode is active."
  ]
fieldNotes:
  [
    "Independent fork of Warp; not affiliated with, endorsed by, or sponsored
      by Warp or Denver Technologies, Inc.",
    "The terminal, block UI, PTY, VT100 emulation, and WGPU rendering are
      upstream Warp, not additions made by this fork.",
    "Upstream-unverified areas (macOS packaging, hosted providers beyond
      DeepSeek, provider retry) are not claimed here."
  ]
readingGuide:
  [
    "READING GUIDE: the lines below are documentation, not captured program
      output.",
    "WHERE THE AGENT LIVES: `crates/standalone_agent` (Rust) supervises the
      private Node helper in `standalone/pi-helper`.",
    "BYOK FLOW: Settings → Agents → Local Pi provider; pick a preset or a
      custom OpenAI-compatible base URL, then set the model id and limits.",
    "CREDENTIALS: the profile stores only a reference; the API key goes to the
      OS secret store and is read at session open.",
    "SIDE EFFECTS: the model proposes commands and edits; Warp’s approval
      cards, diffs, and allowlists decide and execute them.",
    "EGRESS: inference goes to the configured endpoint only; Warp sign-in,
      credits, and cloud surfaces are hidden in standalone mode."
  ]
flexiFreqs: [ 293.66, 369.99, 440, 587.33 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/warpi/the-unlicensed-sidecar.webp",
    "width": 1600,
    "height": 1200,
    "title": "The Unlicensed Sidecar",
    "medium": "BLENDER · EDITORIAL EXAGGERATION",
    "alt": "A photorealistic studio still life of a sleek anodized-aluminum terminal
      monolith bypassed at its velvet-roped turnstile and plumbed via twin
      copper stdio pipes to a warm brass sidecar crowned with a sculpted Pi
      emblem and a miniature steel credential vault. An editorial illustration,
      not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "svg-study",
    "studyId": "warpi",
    "width": 640,
    "height": 360,
    "caption": "Follow one request from the provider you picked to Warp’s own
      approval card."
  }
codeExcerpt:
  {
    "title": "SOURCE EXCERPT 9.1 // PROVIDER PROFILE HOLDS A CREDENTIAL REFERENCE,
      NEVER THE SECRET",
    "lang": "rust",
    "code": "/// Where the credential for a profile comes from. The reference is a
      stable

      /// key into the OS secret store; it is never the secret itself.

      #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]

      #[serde(rename_all = \"snake_case\")]

      pub enum CredentialRef {

      \    /// No authentication: the wire request must not carry an
      Authorization header.

      \    None,

      \    /// Look up by key in the platform secret store.

      \    SecretStore { key: String },

      }",
    "sourceLabel": "crates/standalone_agent/src/provider.rs: CredentialRef",
    "sourceUrl": "https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f21\
      3c84f9c6eb4284/crates/standalone_agent/src/provider.rs#L89-L98"
  }
sources:
  [
    {
        "label": "README: independent Warp fork, local Pi backend, no Warp account
          (v0.1.2)",
        "url": "https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9\
          c6eb4284/README.md"
      },
    {
        "label": "standalone/ARCHITECTURE.md: ownership split and exchange/run model",
        "url": "https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9\
          c6eb4284/standalone/ARCHITECTURE.md"
      },
    {
        "label": "crates/standalone_agent/src/provider.rs: provider profiles and
          credential reference",
        "url": "https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9\
          c6eb4284/crates/standalone_agent/src/provider.rs"
      },
    {
        "label": "standalone/pi-helper/src/runtime.ts: pinned Pi SDK, offline resource
          discovery",
        "url": "https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9\
          c6eb4284/standalone/pi-helper/src/runtime.ts"
      },
    {
        "label": "standalone/NETWORK_DEPENDENCIES.md: egress inventory (configured
          endpoint only)",
        "url": "https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9\
          c6eb4284/standalone/NETWORK_DEPENDENCIES.md"
      }
  ]
---

Credit first, because the fork insists on it. The terminal, the block interface, the approval cards, diff review and persistence are upstream Warp, left intact. Warpi’s contribution lives in two places: `crates/standalone_agent`, a Rust adapter, and `standalone/pi-helper`, a private Node helper that runs the pinned Pi coding-agent SDK.

The helper owns the conversation. The Rust side checks every frame and translates it into the same response events Warp’s own servers would send. That translation is the whole trick. Because the events look native, Warp’s approval, allowlist and read-only checks still decide every side effect. The model can propose a command; Warp still asks before running it.

A provider profile stores a base URL, a model id, limits and a reference to a credential. The key itself lives in your operating system’s secret store, and inference travels only from your machine to the endpoint you chose.
