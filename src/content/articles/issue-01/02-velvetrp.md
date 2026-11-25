---
issueNumber: "01"
articleSlug: "velvetrp"
index: 2
readerServiceNo: 102
section: "LITERARY MACHINES // COLLABORATIVE FICTION"
layoutVariant: "essay"
title: "VelvetRP"
kicker: "Collaborative Fiction · Local-First"
headline: "The Dragon Is Real When the Server Says So"
deck: "A campaign RPG where the model narrates and a Fastify server keeps the
  books. Up to twelve characters, one shared table, and a receipt for every
  action that actually happened."
byline: "By SLOPTIMUS PRIME"
category: "Narrative Systems / Collaborative Fiction"
glanceNote: "Campaign recall keeps track of who said what, who saw what, and who
  only heard about it at the tavern. The server validates mechanical actions
  before the narration may call them outcomes."
pullQuote: "Language models are wonderful storytellers and terrible accountants."
repoUrl: "https://github.com/mojomast/velvetrp"
liveUrl: null
sourceRevision: "4447d2cdb0260174bb2c2461f76600d11980c427"
researchedAt: "2026-10-13"
spotInkHex: "#9b1b30"
secondaryInkHex: "#b45309"
techStack:
  [
    "TypeScript",
    "React + Vite",
    "Fastify",
    "Zod contracts",
    "SQLite (better-sqlite3, WAL)",
    "SSE streaming",
    "Node.js 22"
  ]
metrics:
  [
    { "label": "Campaign Store", "value": "Local SQLite (WAL)" },
    { "label": "API Surface", "value": "177 trusted-local ops" },
    { "label": "Room Capacity", "value": "Up to 12 characters" },
    { "label": "Dice Protocol", "value": "Commit–reveal checkpoint" }
  ]
verifiedCapabilities:
  [
    "One-prompt staged worldbuilding across all 14 content sections in an
      11-stage builder",
    "Server-resolved checks, powers, rests, commerce, trades, encounters, and
      character progression",
    "Source-attributed campaign recall with location-aware NPC presence and
      trust-gated disclosure",
    "Human-DM, reviewed-AI, or delegated AI Director with per-action receipts
      and manual takeover",
    "Commit–reveal verifiable-dice protocol frozen as a tested checkpoint
      (persistence and UI integration still planned)"
  ]
architecture:
  [
    "Local-first Fastify API over SQLite (better-sqlite3, WAL mode): validated
      commands, revisions, events, and per-action receipts commit atomically.",
    "Shared TypeScript/Zod contracts connect the React client, server, and
      persistence boundaries in one npm workspace (Node.js 22).",
    "Solo and group rooms stream attributed replies over HTTP server-sent
      events; rooms can hold up to twelve characters.",
    "Pluggable rulesets: an SRD 5.1 adapter (dnd-5e@1.0.0) supplies catalog
      material while executable coverage is tracked separately.",
    "Optional, off-by-default integrations: server-mediated scene
      illustrations, OmniVoice narration, and System One/Jev typed-decision
      routing."
  ]
fieldNotes:
  [
    "Model proposes; the server decides what became true.",
    "Automated dice use server rolls with explicit full rerolls.",
    "Campaigns live in local SQLite (WAL); remote providers still receive
      assembled prompts.",
    "A trusted-local app: loopback-bound local-owner with no remote-auth
      boundary."
  ]
readingGuide:
  [
    "[reading guide] README, line 9: “The model can propose what happens next.
      It cannot decide what became true.”",
    "[scope] Local-first campaign RPG; the Fastify server owns validated
      commands and per-action receipts.",
    "[transport] HTTP + server-sent events; trusted-local, loopback-bound
      single local-owner.",
    "[caveat] Verifiable dice is a frozen no-schema protocol checkpoint;
      persistence and command/client integration remain Planned."
  ]
flexiFreqs: [ 293.66, 349.23, 440, 523.25 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/velvetrp/an-improbable-turn-of-the-page.webp",
    "width": 1600,
    "height": 1200,
    "title": "An Improbable Turn of the Page",
    "medium": "BLENDER · CONCEPTUAL STILL LIFE",
    "alt": "An open leatherbound book on wine-red velvet unfolds into a miniature
      stone theatre, beneath a floating ivory die; a brass ladder reaches into
      empty air while a tiny crowned snail presides over the page. A conceptual
      Blender still life for VelvetRP."
  }
secondaryMedia:
  {
    "kind": "screenshot",
    "src": "/assets/screenshots/velvetrp.png",
    "width": 2400,
    "height": 1650,
    "caption": "The Adventure Table: one shared story, Story and Map tabs, and a
      single “Send action” box.",
    "alt": "The Adventure Table: one shared story, Story and Map tabs, and a single
      “Send action” box."
  }
codeExcerpt:
  {
    "title": "SOURCE EXCERPT // COMMIT–REVEAL DICE SETTLEMENT",
    "lang": "ts",
    "code": "  const { entropy, nonce } = client;

      \  const rollKey = deriveRollKey(pending.binding, pending.commitment,
      pending.serverSecret, entropy, nonce);

      \  const result = evaluateVerifiableDice(pending.binding, rollKey);

      \  const transcriptDigest = computeTranscriptDigest(

      \    pending.binding, pending.commitment, entropy, nonce,
      pending.serverSecret, result,

      \  );

      \  transition(registry, {

      \    kind: \"settle\",

      \    rollId: pending.binding.rollId,

      \    commitment: pending.commitment,

      \    contributionDigest: computeClientContributionDigest(pending.binding,
      pending.commitment, entropy, nonce),

      \    transcriptDigest,

      \    expectedCapability: pending.capability,

      \  });

      \  return {

      \    state: \"settled\",

      \    binding: pending.binding,

      \    commitment: copy(pending.commitment),

      \    clientEntropy: copy(entropy),

      \    clientNonce: copy(nonce),

      \    serverReveal: copy(pending.serverSecret),

      \    result,

      \    transcriptDigest,

      \    proofMac: computeProofMac(rollKey, pending.binding,
      transcriptDigest),",
    "sourceLabel": "mojomast/velvetrp · server/src/verifiableDiceProtocol.ts
      (settleVerifiableRoll)",
    "sourceUrl": "https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c246\
      1f76600d11980c427/server/src/verifiableDiceProtocol.ts#L675-L698"
  }
sources:
  [
    {
        "label": "VelvetRP README: product scope and current boundaries",
        "url": "https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f7660\
          0d11980c427/README.md"
      },
    {
        "label": "ROADMAP: M5.5 verifiable-dice checkpoint status",
        "url": "https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f7660\
          0d11980c427/docs/ROADMAP.md#L59"
      },
    {
        "label": "revision-2 integration plan: commit-reveal dice status",
        "url": "https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f7660\
          0d11980c427/docs/revision-2-integration-plan.md#L240-L253"
      },
    {
        "label": "server/src/verifiableDiceProtocol.ts: settleVerifiableRoll",
        "url": "https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f7660\
          0d11980c427/server/src/verifiableDiceProtocol.ts#L675-L698"
      },
    {
        "label": "server/package.json: Fastify + better-sqlite3 stack",
        "url": "https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f7660\
          0d11980c427/server/package.json"
      }
  ]
---

Language models are wonderful storytellers and terrible accountants. Ask one to run a campaign and by the third session your rogue has a purse of gold nobody remembers earning. VelvetRP splits the job. The model proposes. A Fastify server over local SQLite decides. The README puts it in one line: “The model can propose what happens next. It cannot decide what became true.”

The server works out the legal actions, validates the model’s choice, and commits commands, revisions and events together, closing each real action with a durable receipt. Ordinary conversation stays receipt-free, so the table can still improvise. Recall is bounded and attributed: it knows whether an NPC witnessed the crime or heard about it secondhand.

One premise grows through an eleven-stage builder into locations, factions, NPCs and quests. When dice are automated, the server rolls them. A commit-reveal protocol for verifiable dice exists as a tested checkpoint; wiring it into persistence and the interface is still on the roadmap, and the roadmap says so.
