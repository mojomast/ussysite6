/**
 * USSYSITE6 // SLOP ILLUSTRATED (Si.) — ISSUE 01, OCTOBER 2026
 * EDITORIAL CATALOG & TECHNICAL MONOGRAPH SOURCE OF TRUTH
 *
 * Source-reviewed descriptions of eleven repositories, with implementation links
 * and explicit attribution of project additions and upstream foundations.
 * NOTE: Keep `/projects.js` and `/js/projects.js` byte-identical (`npm run check:mirrors`).
 */

export const MAGAZINE_ISSUE_META = {
  publicationTitle: 'SLOP ILLUSTRATED',
  publicationAcronym: 'Si.',
  publicationExpansion: 'Software, illustrated.',
  subtitle: 'A field journal of software and the work behind it',
  issueNumber: '01',
  coverDate: 'October 2026',
  coverTheme: 'SOFTWARE. SHOWN & EXPLAINED.',
  editorInChief: 'SLOPTIMUS PRIME',
  printModes: [
    {
      id: 'cream-press',
      label: 'Archival Cream Offset',
      description: 'Warm paper-inspired colors with dark type and red accents'
    },
    {
      id: 'blueprint',
      label: 'Cyanotype Blueprint',
      description: 'A Prussian-blue drafting-paper palette with light type'
    },
    {
      id: 'darkroom',
      label: 'Halftone Darkroom',
      description: 'A dark, photostat-inspired palette with warm light type'
    }
  ]
};

export const USSY_PROJECTS = [
  {
    id: 'orbitdesktop',
    index: 1,
    issueSection: 'COVER STORY // SPATIAL INTERFACES',
    spreadType: 'gatefold-blueprint',
    readerServiceNo: 101,
    title: 'OrbitDesktop',
    kicker: 'Agent-Customizable Spatial Workspace',
    headline: 'A Browser Desktop the Agent Can Reshape',
    deck: 'Orbit is a local-first, single-owner workspace where conversations, persistent terminals, browser apps and optional Linux applications share one screen—arranged as movable windows, an opt-in tiled docking layout, or a Three.js + CSS3D spatial scene.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)',
    category: 'Agent Workspace / Spatial UI',
    glanceNote: 'A bound Hermes agent can inspect the workspace and, when permitted, rearrange its panes. Layout revisions, checkpoints and command receipts live in a local SQLite store; the controller is read-only by default.',
    repoUrl: 'https://github.com/mojomast/orbitdesktop',
    screenshot: 'assets/screenshots/orbitdesktop.png',
    screenshotWidth: 1600,
    screenshotHeight: 1000,
    screenshotCaption: 'Orbit desktop: the application launcher rail beside the display-configuration panel',
    liveUrl: null,
    spotInkHex: '#d9381e', // Vermilion Red
    secondaryInkHex: '#0047ab', // Cobalt Blue
    pullQuote: 'Orbit’s real proposition is not a prettier window manager but a desktop the agent can rearrange with you, so the interface keeps changing as the work does.',
    bodyCopy:
      'Orbit treats the workspace as a small web application rather than a fixed dashboard. Pane views are keyed by stable pane IDs, so an editor, a terminal and a conversation can move between the default movable-windows desktop, an opt-in tiled Docking layout, or the Three.js + CSS3D spatial view without discarding the embedded document where the browser supports it. A local Node service persists layout, revisions, checkpoints and command receipts to a SQLite workspace store, and a scoped `orbit_workspace` controller lets a bound Hermes agent inspect and rearrange panes—read-only unless mutations are explicitly allowed.',
    fieldNotes: ['Local-first, single-owner, agent-operated workspace.', 'Default movable windows; opt-in Docking and Spatial views.', 'Spatial placement uses a validated grid, row or curve tiling.', 'Layout and checkpoints commit to a local SQLite workspace store.'],
    editorialLead:
      'OrbitDesktop is an agent-customizable browser desktop powered by Hermes. Instead of forcing work into a fixed dashboard, it lets a bound agent build and place small interfaces beside your conversation, terminal and files. The product ships movable windows by default, with an experimental tiled Docking mode and a Three.js + CSS3D spatial view for curved or depth-arranged workspaces. It is explicitly a browser desktop, not an Electron shell or a WebXR layer.',
    architecture: [
      'Vite-bundled browser front end with pane views keyed by stable pane IDs; native `Element.moveBefore` preserves iframe document state across same-document moves where the browser supports it.',
      'Three.js `PerspectiveCamera` drives WebGL decoration while a `CSS3DRenderer` positions native HTML pane surfaces; embedded controls stay ordinary DOM and iframes, and CSS3D is not a browser engine or WebXR layer.',
      'Default movable-windows desktop; opt-in Dockview tiling with tab groups (`dockview-core@8.3.1`), plus validated grid, row and curve spatial tilings.',
      'Persistent host terminals via xterm.js, node-pty and tmux; a workspace store commits layout, revisions, checkpoints and keyed command receipts atomically to SQLite.',
      'Scoped `orbit_workspace` controller for a bound Hermes agent—read-only by default, with mutations gated behind `allow_mutations`.'
    ],
    verifiedCapabilities: [
      'Agent-customizable workspace with a scoped workspace controller',
      'Three.js + CSS3D spatial view alongside movable windows and opt-in tiling',
      'Persistent xterm.js terminals backed by node-pty and tmux',
      'Local SQLite persistence with revisions, checkpoints and command receipts'
    ],
    techStack: ['TypeScript', 'Three.js + CSS3D', 'Vite / Node', 'Hermes gateway', 'SQLite', 'xterm.js + tmux'],
    metrics: [
      { label: 'Package Version', value: '0.3.1' },
      { label: 'Spatial Renderer', value: 'Three.js + CSS3D' },
      { label: 'Terminal Stack', value: 'xterm.js · tmux' }
    ],
    flexiFreqs: [261.63, 329.63, 392.00, 493.88],
    codeListingTitle: 'LISTING 1.1 // SOURCE EXCERPT — SPATIAL WINDOW PLACEMENT',
    codeListing: `export function spatialWindow(m:Monitor, monitors:Monitor[], arc:number):SpatialWindow {
  if(m.spatial) return {...m.spatial};
  const widths=monitors.map(v=>dimensions({...v,diagonal:32}).w);
  const total=widths.reduce((a,b)=>a+b,0)+Math.max(0,monitors.length-1)*0.24;
  const i=monitors.findIndex(v=>v.id===m.id);
  const cx=-total/2+widths.slice(0,i).reduce((a,b)=>a+b+0.24,0)+widths[i]/2;
  const {w,h}=dimensions(m);
  return {x:cx+m.offset,y:0.9+m.height,z:-m.distance-Math.abs(cx)*0.1,width:Math.min(200,w),height:Math.min(200,h),yaw:(i-(monitors.length-1)/2)*-arc+m.yaw,pitch:m.pitch,resolution:1920};
}`,
    codeSource: {
      label: 'src/spatial-layout.ts L5–L13 · orbitdesktop@9c4069a',
      url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/src/spatial-layout.ts#L5-L13'
    },
    terminalStream: [
      'READING GUIDE // README.md — a local-first, single-owner, agent-operated browser desktop',
      'READING GUIDE // docs/ARCHITECTURE.md — PerspectiveCamera + CSS3DRenderer over native HTML panes',
      'READING GUIDE // docs/MANAGED_TERMINALS.md — xterm.js, node-pty and tmux persistence limits',
      'READING GUIDE // docs/RUNTIME_CONTINUITY.md — what survives a pane move and what does not'
    ],
    sources: [
      { label: 'orbitdesktop README (v0.3.1)', url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/README.md' },
      { label: 'docs/ARCHITECTURE.md — renderers, state and control', url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/docs/ARCHITECTURE.md' },
      { label: 'src/spatial-layout.ts — spatial placement and tiling', url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/src/spatial-layout.ts' },
      { label: 'docs/MANAGED_TERMINALS.md — persistent terminals', url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/docs/MANAGED_TERMINALS.md' },
      { label: 'package.json — v0.3.1 dependency manifest', url: 'https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/package.json' }
    ],
    sourceRevision: '9c4069a002c1d9376d9ae06776d4090aad49fc00',
    researchedAt: '2026-10-13'
  },
  {
    id: 'velvetrp',
    index: 2,
    issueSection: 'LITERARY MACHINES // COLLABORATIVE FICTION',
    spreadType: 'literary-folio',
    readerServiceNo: 102,
    title: 'VelvetRP',
    kicker: 'Model Proposes, the Server Decides',
    headline: 'A Local-First Campaign RPG Where the Server Owns What Became True',
    deck: 'One premise becomes a connected world, up to twelve characters share attributed, streamed rooms, and every committed action leaves a durable receipt in local SQLite—while free-form narration stays free of mechanical side effects.',
    byline: 'By SLOPTIMUS PRIME · Folio II',
    category: 'Narrative Systems / Collaborative Fiction',
    glanceNote: 'Campaign recall keeps recorded events, declarations and prior exchanges attributed to their sources. The server validates mechanical actions before narration can describe them as outcomes.',
    repoUrl: 'https://github.com/mojomast/velvetrp',
    screenshot: 'assets/screenshots/velvetrp.png',
    screenshotWidth: 2400,
    screenshotHeight: 1650,
    screenshotCaption: 'The Adventure Table: one shared story, Story/Map tabs, and a single “Send action” composer',
    liveUrl: null,
    spotInkHex: '#9b1b30', // Crimson Bordeaux
    secondaryInkHex: '#b45309', // Warm Ochre
    pullQuote: 'A trustworthy table needs no referee: let the model propose, let the server decide, and the author is free to spend attention on voice, tension, and consequence.',
    bodyCopy:
      'VelvetRP is a set of strict TypeScript and Zod contracts spanning a React client, a Fastify API, and a SQLite store in WAL mode. The server derives legal actions and exact candidates, validates the provider’s selection, and commits commands, revisions, and events atomically—so narration can describe a mechanical change only when a receipt establishes it, while routine conversation stays receipt-free. Campaign recall is deliberately bounded: it draws on declarations, recorded outcomes, and prior exchanges while preserving their source and authority, and it tracks who witnessed an event versus who merely heard about it. The table can improvise freely without letting prose overwrite state.',
    fieldNotes: ['Model proposes; the server decides what became true.', 'Automated dice use server rolls with explicit full rerolls.', 'Campaigns live in local SQLite (WAL); remote providers still receive assembled prompts.', 'A trusted-local app: loopback-bound local-owner with no remote-auth boundary.'],
    editorialLead:
      'Most virtual tabletops bolt a chat box onto a character sheet. VelvetRP treats the table itself as the product: a local-first campaign RPG in which the model proposes what happens next, but a Fastify service over local SQLite decides what became true. One premise expands through an eleven-stage builder into a connected world of locations, factions, NPCs, and quests; up to twelve characters share attributed, streamed rooms; and every committed action closes with a durable, inspectable receipt.',
    architecture: [
      'Local-first Fastify API over SQLite (better-sqlite3, WAL mode): validated commands, revisions, events, and per-action receipts commit atomically.',
      'Shared TypeScript/Zod contracts connect the React client, server, and persistence boundaries in one npm workspace (Node.js 22).',
      'Solo and group rooms stream attributed replies over HTTP server-sent events; rooms can hold up to twelve characters.',
      'Pluggable rulesets: an SRD 5.1 adapter (dnd-5e@1.0.0) supplies catalog material while executable coverage is tracked separately.',
      'Optional, off-by-default integrations: server-mediated scene illustrations, OmniVoice narration, and System One/Jev typed-decision routing.'
    ],
    verifiedCapabilities: [
      'One-prompt staged worldbuilding across all 14 content sections in an 11-stage builder',
      'Server-resolved checks, powers, rests, commerce, trades, encounters, and character progression',
      'Source-attributed campaign recall with location-aware NPC presence and trust-gated disclosure',
      'Human-DM, reviewed-AI, or delegated AI Director with per-action receipts and manual takeover',
      'Commit–reveal verifiable-dice protocol frozen as a tested checkpoint (persistence and UI integration still planned)'
    ],
    techStack: ['TypeScript', 'React + Vite', 'Fastify', 'Zod contracts', 'SQLite (better-sqlite3, WAL)', 'SSE streaming', 'Node.js 22'],
    metrics: [
      { label: 'Campaign Store', value: 'Local SQLite (WAL)' },
      { label: 'API Surface', value: '177 trusted-local ops' },
      { label: 'Room Capacity', value: 'Up to 12 characters' },
      { label: 'Dice Protocol', value: 'Commit–reveal checkpoint' }
    ],
    flexiFreqs: [293.66, 349.23, 440.00, 523.25],
    codeListingTitle: 'SOURCE EXCERPT // COMMIT–REVEAL DICE SETTLEMENT',
    codeListing: `  const { entropy, nonce } = client;
  const rollKey = deriveRollKey(pending.binding, pending.commitment, pending.serverSecret, entropy, nonce);
  const result = evaluateVerifiableDice(pending.binding, rollKey);
  const transcriptDigest = computeTranscriptDigest(
    pending.binding, pending.commitment, entropy, nonce, pending.serverSecret, result,
  );
  transition(registry, {
    kind: "settle",
    rollId: pending.binding.rollId,
    commitment: pending.commitment,
    contributionDigest: computeClientContributionDigest(pending.binding, pending.commitment, entropy, nonce),
    transcriptDigest,
    expectedCapability: pending.capability,
  });
  return {
    state: "settled",
    binding: pending.binding,
    commitment: copy(pending.commitment),
    clientEntropy: copy(entropy),
    clientNonce: copy(nonce),
    serverReveal: copy(pending.serverSecret),
    result,
    transcriptDigest,
    proofMac: computeProofMac(rollKey, pending.binding, transcriptDigest),`,
    terminalStream: [
      '[reading guide] README, line 9: “The model can propose what happens next. It cannot decide what became true.”',
      '[scope] Local-first campaign RPG; the Fastify server owns validated commands and per-action receipts.',
      '[transport] HTTP + server-sent events; trusted-local, loopback-bound single local-owner.',
      '[caveat] Verifiable dice is a frozen no-schema protocol checkpoint; persistence and command/client integration remain Planned.'
    ],
    codeSource: {
      label: 'mojomast/velvetrp · server/src/verifiableDiceProtocol.ts (settleVerifiableRoll)',
      url: 'https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f76600d11980c427/server/src/verifiableDiceProtocol.ts#L675-L698'
    },
    sources: [
      { label: 'VelvetRP README — product scope and current boundaries', url: 'https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f76600d11980c427/README.md' },
      { label: 'ROADMAP — M5.5 verifiable-dice checkpoint status', url: 'https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f76600d11980c427/docs/ROADMAP.md#L59' },
      { label: 'revision-2 integration plan — commit-reveal dice status', url: 'https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f76600d11980c427/docs/revision-2-integration-plan.md#L240-L253' },
      { label: 'server/src/verifiableDiceProtocol.ts — settleVerifiableRoll', url: 'https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f76600d11980c427/server/src/verifiableDiceProtocol.ts#L675-L698' },
      { label: 'server/package.json — Fastify + better-sqlite3 stack', url: 'https://github.com/mojomast/velvetrp/blob/4447d2cdb0260174bb2c2461f76600d11980c427/server/package.json' }
    ],
    sourceRevision: '4447d2cdb0260174bb2c2461f76600d11980c427',
    researchedAt: '2026-10-13'
  },
  {
    id: 'jammate',
    index: 3,
    issueSection: 'ACOUSTIC LAB BENCH // REAL-TIME DSP',
    spreadType: 'oscilloscope-bench',
    readerServiceNo: 103,
    title: 'JamMate',
    kicker: 'Adaptive Drums on a Lock-Free Musical Clock',
    headline: 'A JUCE Guitar Rig Whose Experimental Drummer Listens for the Bar Line',
    deck: 'Inside an offline-first JUCE 8 practice rig: Neural Amp Modeler captures, convolution cabinet impulse responses, and a bounded lock-free analysis path feeding an experimental Musical Clock that joins prepared 4/4 drums on a bar boundary.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)',
    category: 'Audio Engineering / Real-Time DSP',
    glanceNote: 'Guitar Companion supplies the original amp and cabinet chain. JamMate adds an experimental Musical Clock, tempo and bar telemetry, and prepared drum playback that joins on a bar boundary.',
    repoUrl: 'https://github.com/mojomast/jammate',
    screenshot: 'assets/screenshots/jam-live-playing-testfixture.png',
    screenshotWidth: 1100,
    screenshotHeight: 700,
    screenshotCaption: 'Jam screen fixture at the production 1100×700 size with injected telemetry (labelled MOCK FIXTURE): candidate BPM, clock BPM and confidence are demonstration values, not a live guitar or device-latency measurement.',
    liveUrl: null,
    spotInkHex: '#0f766e', // Oscilloscope Teal
    secondaryInkHex: '#d97706', // Amber Phosphor
    pullQuote: 'Real-time audio is a promise about what never happens inside the callback — no allocation, no lock, no wait — and the honest version of that promise is a bounded, measured claim, not a slogan.',
    bodyCopy:
      'JamMate is an open-source, offline-first guitar practice and jamming app built on Raphael Fukuda’s Guitar Companion. It keeps the inherited rig — Neural Amp Modeler captures, convolution cabinet impulse responses, up to three parallel amp/cab lanes, reorderable effects, a tuner, a looper, hosted VST3 slots, a sampled drum kit and song/scene tools — and adds a separately testable rhythm-analysis layer. Guitar input feeds a bounded single-producer/single-consumer ring buffer; an injected tracker (experimental BTrack by default, aubio optional) publishes observations to a deterministic Musical Clock, and the experimental live Jam joins prepared 4/4 drums on a bar boundary. No release binary ships yet: Windows and Linux builds are verified, macOS is not, and tracker selection remains open.',
    fieldNotes: ['Product code is C++17; only the bundled Neural Amp Modeler Core target compiles as C++20.', 'No measured physical round-trip latency is published — SPEC.md §18.3 sets a ≈12 ms target on a reference ASIO 48 kHz / 128-frame setup.', 'The Jam screen polls telemetry at 30 Hz while visible (not 120 Hz); the fork adds no AVX2/NEON SIMD cascade.'],
    editorialLead:
      'Most practice tools hand you a backing track that ignores what you play. JamMate takes the harder route: it starts from a mature JUCE guitar rig, then adds a portable musical-intelligence core — a deterministic Musical Clock, an injected rhythm tracker and a bounded, lock-free command/telemetry path — that tries to hear a pulse and answer it. The real-time discipline is written down rather than assumed: the project’s own rulebook forbids allocation, blocking, locks, network and file I/O inside processBlock, and the fork has begun measuring how close the real callback comes to that rule.',
    architecture: [
      'Musical-intelligence core (src/jam, no JUCE dependency) built around a deterministic Musical Clock, an injected rhythm tracker and a next-bar join policy.',
      'Bounded single-producer/single-consumer AnalysisAudioRing for the audio-to-analysis handoff: fixed capacity, cache-line-aligned atomics, drop-incoming-and-count overflow, and no allocation or blocking in push().',
      'Lock-free, retry-free signalling (rt::SignalFlag, rt::LatestValue, rt::CommandQueue) for audio-thread edges, latest-value UI telemetry and fixed-capacity commands.',
      'Inherited JUCE 8 rig: Neural Amp Modeler captures, juce::dsp::Convolution cabinet IRs, three parallel amp/cab lanes, reorderable effects, tuner, looper and hosted VST3 slots.'
    ],
    verifiedCapabilities: [
      'Neural Amp Modeler capture playback via the bundled NeuralAmpModelerCore v0.5.4 (MIT), with convolution cabinet impulse responses',
      'Experimental adaptive drums: guitar analysis drives a Musical Clock that joins six prepared 4/4 styles on a bar boundary',
      'Bounded lock-free analysis and telemetry plumbing; 26 real-processor probe cases reported zero detected heap alloc/free or lock/wait operations after the scoped NAM LSTM repair (a bounded matrix, not every model, effect, host or device)',
      'Inherited practice rig: reorderable effects, tuner, looper, hosted VST3 slots, sampled drum kit, song sections and guitar/drum/mix stem recording'
    ],
    techStack: ['C++17 (product) / C++20 (NAM Core)', 'JUCE 8.0.15', 'Neural Amp Modeler Core v0.5.4 (MIT)', 'Lock-free SPSC (jam-core)', 'AGPLv3 · VST3 / Standalone'],
    metrics: [
      { label: 'Latency Target', value: '≈12 ms ASIO 48k/128 (target, not yet measured)' },
      { label: 'RT Probe Result', value: '0 detected alloc/lock in 26 bounded cases' },
      { label: 'Build Coverage', value: 'Windows + Linux verified · macOS untested' }
    ],
    flexiFreqs: [329.63, 392.00, 493.88, 659.25],
    codeListingTitle: 'SOURCE EXCERPT // src/rt/RtSignal.h — BOUNDED AUDIO-THREAD SIGNALLING',
    codeListing: `    /** Audio thread: one store, no post, no retry. Repeated stores coalesce. */
    void signal() noexcept
    {
        // Release publishes preceding state updates to a successful consuming
        // acquire. A relaxed store would suffice for an edge with no associated
        // state, but release also supports the scene-ready handoff. This does
        // not protect subsequent writes to unrelated non-atomic payloads.
        pending_.store (true, std::memory_order_release);
    }

    /** Message thread: atomically take and clear the outstanding edge. */
    bool consume() noexcept
    {
        // The exchange is the clearing linearisation point: a racing signal is
        // either consumed here or remains for the next poll, never erased by a
        // separate load/store pair. Acquire pairs with signal's release; the
        // release half orders this consumer's preceding work before the clear.
        return pending_.exchange (false, std::memory_order_acq_rel);
    }`,
    codeSource: {
      label: 'src/rt/RtSignal.h L36–L54 · jammate@0bb4893',
      url: 'https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04/src/rt/RtSignal.h#L36-L54'
    },
    terminalStream: [
      'READING GUIDE // The Jam screen exposes START/STOP, tap, resync, half/double tempo and freeze/resume; the status separates queued intent from actual drum playback.',
      'READING GUIDE // In the shipped UI, telemetry is polled at 30 Hz only while the screen is visible (docs/research/LIVE-JAM-UI.md); the rig’s own level meter uses a 10 Hz timer.',
      'READING GUIDE // The fixture screenshot is injected telemetry labelled MOCK FIXTURE; it is not a live guitar or device-latency measurement.',
      'READING GUIDE // No measured physical round-trip latency is published; SPEC.md §18.3 sets a ≈12 ms target on a reference ASIO 48 kHz / 128-frame setup.'
    ],
    sources: [
      { label: 'jammate @ 0bb4893 — README (development status & verification)', url: 'https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04/README.md' },
      { label: 'jammate @ 0bb4893 — SPEC.md §7.1/§18 (RT contract & latency target)', url: 'https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04/SPEC.md' },
      { label: 'jammate @ 0bb4893 — src/rt/RtSignal.h (bounded lock-free signalling)', url: 'https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04/src/rt/RtSignal.h' },
      { label: 'jammate @ 0bb4893 — docs/research/RT-REACHABILITY.md (partial RT audit)', url: 'https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04/docs/research/RT-REACHABILITY.md' },
      { label: 'Upstream — Guitar Companion by Raphael Fukuda (AGPLv3)', url: 'https://github.com/raphaelfukuda/Guitar-Companion/blob/88f7e7c805c9c5e17388154a678c2c6a3633ff23/README.md' }
    ],
    sourceRevision: '0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04',
    researchedAt: '2026-10-13'
  },
  {
    id: 'cocs',
    index: 4,
    issueSection: 'NETWORKED SIMULATION // 60HZ NETCODE',
    spreadType: 'arcade-tactical',
    readerServiceNo: 104,
    title: 'CoCS // Colosseum of Competitive Slop',
    kicker: 'Local-First Browser Arena — Live at arena.ussyco.de',
    headline: 'A 60 Hz Authoritative Arena with Client Prediction & Delta Snapshots',
    deck: 'A fixed 60 Hz authoritative simulation, a predicting client that reconciles every snapshot, and a delta-compressed JSON WebSocket wire — the entire arena runs in a browser tab or on your own LAN.',
    byline: 'By SLOPTIMUS PRIME (github.com/mojomast) · SLOP ILLUSTRATED (Si.)',
    category: 'Multiplayer Game Server / Netcode',
    glanceNote: 'Nine parody operators and seven harnesses populate the roster. The pure-JavaScript simulation is shared by the client, server and tests, while Combined Arms can field up to sixteen bots.',
    repoUrl: 'https://github.com/mojomast/cocs',
    liveUrl: 'https://arena.ussyco.de',
    spotInkHex: '#e11d48', // Signal Magenta-Red
    secondaryInkHex: '#1d4ed8', // Blueprint Cobalt
    pullQuote: 'CoCS is an honest arena shooter: a 60 Hz fixed-step simulation, a predicting client and a delta-compressed JSON wire — no rewind buffer required.',
    bodyCopy:
      'CoCS manufactures the feel of a fair fight with a fixed 60 Hz authoritative tick. Your client runs a local shadow match so movement, aim and fire respond instantly, then replays every still-unacknowledged input once the next snapshot lands — reconciliation rather than a historical rewind buffer. Snapshots quantize actor transforms to the millimetre at 30 Hz and travel as plain JSON over a WebSocket, with a v2 delta codec and a full-snapshot fallback. Remote actors and projectiles render through interpolation at an adaptive delay of roughly 100 ms. Nine parody operators and seven harnesses populate the roster, and Combined Arms can field up to sixteen bots.',
    fieldNotes: ['Fixed 60 Hz authoritative tick (16.67 ms); snapshots broadcast at 30 Hz.', 'The client shadow predicts and reconciles — it does not rewind historical hitboxes.', 'Nine operators and seven harnesses; Combined Arms fields up to sixteen bots.'],
    editorialLead:
      'Colosseum of Competitive Slop (CoCS) is a local-first Three.js arena shooter that also runs live at arena.ussyco.de. Its netcode is deliberately conventional: a fixed 60 Hz pure-JavaScript engine shared by the client, the server and the tests; per-peer sequenced inputs; 30 Hz quantized snapshots; a client prediction shadow that reconciles to every authoritative frame; and interpolation for remote actors, vehicles and projectiles. Reconnect keeps a 20-second held seat with bot handoff and host migration. No accounts, no cloud, no inference service — every asset is procedural.',
    architecture: [
      'Fixed-step 60 Hz authoritative simulation (server/game-server.mjs, tickDt = 1/60) with per-peer sequenced inputs and 30 Hz quantized snapshots.',
      'Client prediction: a local shadow Match runs the player’s inputs immediately, then reconciles and replays pending inputs after each authoritative snapshot.',
      'Snapshot-delta codec (protocol v2) over a plain-text JSON WebSocket with a full-snapshot fallback and millimetre quantization.',
      'Remote actors, vehicles and projectiles are interpolated at an adaptive ~100 ms render delay; rooms support reconnect, a 20-second held seat, bot handoff, host migration and spectator seats.'
    ],
    verifiedCapabilities: [
      'Live browser-playable 60 Hz multiplayer at arena.ussyco.de',
      'Client prediction and reconciliation over a JSON WebSocket with entity interpolation',
      'Nine operators, seven harnesses, ten weapons and five vehicle chassis',
      'Self-hosted LAN game server with no accounts, cloud or inference service'
    ],
    techStack: ['Three.js', 'Node.js 22', 'ws WebSocket (JSON)', 'Snapshot delta v2', 'HTML5 Canvas', 'Deterministic 60 Hz engine'],
    metrics: [
      { label: 'Simulation Step', value: '60 Hz Fixed (16.67 ms)' },
      { label: 'Snapshot Transport', value: 'JSON · delta v2 · 30 Hz' },
      { label: 'Operator Roster', value: '9 operators · 7 harnesses' }
    ],
    flexiFreqs: [349.23, 440.00, 523.25, 659.25],
    codeListingTitle: 'SOURCE EXCERPT // CLIENT RECONCILIATION REPLAY',
    codeListing: `     const ack=Number.isInteger(msg.acks?.[this.actorId])?msg.acks[this.actorId]:null;
     if(ack!==null){this.pendingInputs=this.pendingInputs.filter(item=>item.seq>ack);for(const item of this.pendingInputs)this.shadow.step(RULES.dt,{inputs:{[this.shadow.actors[0].id]:item.input}});}`,
    codeSource: {
      label: 'game/net.mjs — client reconciliation replay',
      url: 'https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/net.mjs#L556-L557'
    },
    terminalStream: [
      'Authoritative loop: server/game-server.mjs defaults tickDt to 1/60 and broadcasts snapshots at 30 Hz.',
      'Wire format: plain JSON text over WebSocket — game/protocol.mjs wireSize measures UTF-8 JSON length.',
      'Hit resolution: hitscan rays test 0.85 m × 0.85 m × 1.8 m axis-aligned actor boxes on the current tick (game/core.mjs actorHit).',
      'No historical rewind buffer exists; the server reconciles predicted inputs to the latest snapshot instead.'
    ],
    sources: [
      { label: 'README — authoritative server, prediction, interpolation', url: 'https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/README.md#L268-L280' },
      { label: 'server/game-server.mjs — 60 Hz tick defaults', url: 'https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/server/game-server.mjs#L51' },
      { label: 'game/net.mjs — prediction and reconciliation', url: 'https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/net.mjs#L530-L558' },
      { label: 'game/core.mjs — axis-aligned actor hit test', url: 'https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/core.mjs#L329-L330' },
      { label: 'deploy/arena.ussyco.de.nginx — live deployment', url: 'https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/deploy/arena.ussyco.de.nginx#L1' }
    ],
    sourceRevision: '9a89e80012b387af71877b0ed5a0469e39f00a79',
    researchedAt: '2026-10-13'
  },
  {
    id: 'cocs-godot',
    index: 5,
    issueSection: 'GRAPHICS PIPELINE // NATIVE GODOT PORT',
    spreadType: 'shader-diagram',
    readerServiceNo: 105,
    title: 'CoCS-Godot',
    kicker: 'A Native Godot 4 Client on the Same Authoritative Server',
    headline: 'Porting the Colosseum to Godot 4.5 on the GL Compatibility Renderer',
    deck: 'CoCS-Godot keeps the original Node.js simulation authoritative and rebuilds the arena natively in Godot: exact spring-driven operator motion, shader and material labs, and a particle lab that scales from 8K to one million.',
    byline: 'By SLOPTIMUS PRIME (github.com/mojomast) · SLOP ILLUSTRATED (Si.)',
    category: 'Godot Port / Real-Time Rendering',
    glanceNote: 'A playable native-client prototype with dedicated graphics labs. Godot follows authoritative state from the original Node.js server; the GL Compatibility renderer handles the presentation.',
    repoUrl: 'https://github.com/mojomast/cocs-godot',
    screenshot: 'assets/screenshots/cocs-godot.png',
    screenshotWidth: 1280,
    screenshotHeight: 800,
    screenshotCaption: 'Native Godot combat on Meridian Exchange (Team Deathmatch)',
    liveUrl: null,
    spotInkHex: '#2563eb', // Process Ultramarine
    secondaryInkHex: '#7c3aed', // Violet Halftone
    pullQuote: 'CoCS-Godot keeps the protocol and the math honest: the Node server still owns the match, and the native client is presentation built on exact, closed-form springs.',
    bodyCopy:
      'CoCS-Godot is a native Godot 4.5 port of COCS: DESTINATIONS, and it keeps the original Node.js simulation authoritative over movement, weapons, damage and objectives. The client opens a WebSocketPeer and speaks the same JSON wire protocol as the browser build, so the server does not care which front end connects. Presentation is rebuilt from scratch: an exact critically damped spring drives recoil recovery and sway, custom .gdshader materials light the shields and weapon effects, and a standalone particle lab exposes selectable 8K–1M counts across GPU and analytic backends. The four-chapter Quiet Relay campaign runs against a bundled local Node server. It is a playable prototype, still in active development.',
    fieldNotes: ['Status: actively developed, playable prototype.', 'No Vulkan Forward+ or SDFGI — the project targets the GL Compatibility renderer.', 'The Node.js simulation stays authoritative; Godot is the client.'],
    editorialLead:
      'CoCS-Godot shows clean protocol separation: the authoritative match stays in the original Node.js simulation while Godot owns the native client, controls, world presentation, HUD and audio. The project is honest about its rendering path — project.godot targets the GL Compatibility backend rather than Vulkan Forward+, and there is no SDFGI anywhere in the tree. What it does add is procedural, mathematically exact motion: motion_math.gd solves critically damped springs in closed form instead of Euler integration, and the particle, shader and material labs are separate, measurable workbenches.',
    architecture: [
      'Native Godot 4.5 client connecting over WebSocketPeer to the original authoritative Node.js simulation, which retains ownership of movement, weapons, damage and objectives.',
      'Presentation-only motion: motion_math.gd solves an exact critically damped spring in closed form (no Euler integration) for recoil recovery, sway and landing response.',
      'Standalone particle lab with selectable 8K/32K/128K/512K/1M counts across GPU and analytic backends, reporting measured frame cadence.',
      'GL Compatibility rendering with custom .gdshader material, shield and weapon-effect labs; the Quiet Relay campaign runs against a bundled local Node server.'
    ],
    verifiedCapabilities: [
      'Native Godot 4.5 client wired to the original authoritative simulation',
      'Speaks the same JSON WebSocket protocol as the canonical CoCS server',
      'Exact closed-form spring motion for recoil, sway and landing',
      'Particle, shader and material labs with selectable counts and measured cadence'
    ],
    techStack: ['Godot 4.5', 'GDScript', 'GDShader (.gdshader)', 'GL Compatibility renderer', 'Node.js authoritative server'],
    metrics: [
      { label: 'Renderer', value: 'Godot 4.5 · GL Compatibility' },
      { label: 'Particle Lab', value: '8K–1M selectable (32K default)' },
      { label: 'Authority', value: 'Bundled Node.js server' }
    ],
    flexiFreqs: [392.00, 493.88, 587.33, 783.99],
    codeListingTitle: 'SOURCE EXCERPT // EXACT CRITICAL SPRING',
    codeListing: `static func spring(value: float, velocity: float, goal: float, rate: float, dt: float) -> Vector2:
	var offset := value - goal
	var j := velocity + rate * offset
	var decay := exp(-rate * dt)
	return Vector2(goal + (offset + j * dt) * decay, (velocity - rate * j * dt) * decay)`,
    codeSource: {
      label: 'godot/source_operators/motion_math.gd — exact critical spring',
      url: 'https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/source_operators/motion_math.gd#L4-L8'
    },
    terminalStream: [
      'Renderer: godot/project.godot sets rendering_method to gl_compatibility; no SDFGI or Forward+ references exist in the tree.',
      'Protocol: godot/net/client.gd uses WebSocketPeer.send_text(JSON.stringify(frame)) — the same JSON wire as CoCS.',
      'Particle lab: godot/particle_lab/field.gd exposes counts [8192, 32768, 131072, 524288, 1048576] across GPU and analytic backends.',
      'Campaign: port/campaign/PLAY.md launches The Quiet Relay against a bundled local Node.js server, not a self-contained offline engine.'
    ],
    sources: [
      { label: 'README — status and authority model', url: 'https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/README.md#L1-L20' },
      { label: 'godot/project.godot — GL Compatibility renderer', url: 'https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/project.godot#L20-L22' },
      { label: 'godot/net/client.gd — shared JSON WebSocket transport', url: 'https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/net/client.gd#L31-L158' },
      { label: 'godot/source_operators/motion_math.gd — exact critical spring', url: 'https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/source_operators/motion_math.gd#L3-L8' },
      { label: 'godot/particle_lab/field.gd — 8K–1M particle counts', url: 'https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc0321fb82b647e76/godot/particle_lab/field.gd#L8' }
    ],
    sourceRevision: '1f1e5f5486904f5d08a9768bc0321fb82b647e76',
    researchedAt: '2026-10-13'
  },
  {
    id: 'routetok',
    index: 6,
    issueSection: 'SYSTEMS TELEPHONY // AI ROUTING',
    spreadType: 'switching-schematic',
    readerServiceNo: 106,
    title: 'RouteTok',
    kicker: 'Zero Runtime Dependencies. No Spliced Streams.',
    headline: 'A Local Gateway with a Three-State Circuit Breaker',
    deck: 'When an upstream provider rate-limits or stalls, RouteTok opens a closed / open / half-open circuit on that route and retries another before output commits—it never splices two models into one stream.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.) · github.com/mojomast',
    category: 'Local LLM Routing / Observability',
    glanceNote: 'A local gateway with zero runtime npm dependencies. Configuration, route health and Prometheus metrics make provider selection inspectable; fallback only happens before an answer starts streaming.',
    repoUrl: 'https://github.com/mojomast/routetok',
    screenshot: 'assets/screenshots/routetok.png',
    screenshotWidth: 1440,
    screenshotHeight: 1000,
    screenshotCaption: 'RouteTok operations dashboard: live success rate, throughput, TTFT, fallback rate and retained performance trends',
    liveUrl: null,
    spotInkHex: '#047857', // Emerald Relay Ink
    secondaryInkHex: '#0369a1', // Technical Cyan
    pullQuote: 'RouteTok’s discipline is refusal: it re-routes before output begins, then tells the truth with a stream_interrupted frame rather than splice two models into one voice.',
    bodyCopy:
      'RouteTok is a local-first router that puts OpenAI- and Anthropic-compatible APIs in front of many providers. A `HealthRouter` keeps explicit provider order, virtual routes (`auto`, `best`, `free`) and custom cascades, then ranks candidates by success rate, consecutive failures, in-flight count and latency EWMA. A three-state circuit—closed, open, half-open—keeps a failing route out of the chain for a cooldown and admits a single probe on the way back. Fallback happens only before semantic or tool output commits; once a stream is committed the proxy emits a truthful `stream_interrupted` frame instead of switching models mid-sentence. The runtime core uses only Node built-ins, with TypeScript, tsx and @types/node as the sole devDependencies.',
    fieldNotes: ['Fallback is pre-output only; a committed stream ends with `stream_interrupted`, never a splice.', 'Circuit opens on consecutive failures or a ≥50% failure window; half-open admits one in-flight probe.', 'Zero runtime npm dependencies; devDependencies are TypeScript, tsx and @types/node.', 'Legacy `agentrouter_router_*` Prometheus families are retained alongside planned `routetok_*` names.'],
    editorialLead:
      'RouteTok is a local-first inference router for anyone already juggling several model providers. One Node.js process exposes an OpenAI- and Anthropic-compatible `/v1` surface alongside an operations dashboard and a browser-local Model Fieldbook. It is deliberately conservative about failure: health-aware fallback retries another candidate only before output commits, and a three-state circuit breaker (closed / open / half-open) keeps a sick route out of the chain until a single probe earns its way back. It is independent and not affiliated with any model or inference provider.',
    architecture: [
      'Hand-rolled Node `http` server (no framework) exposing OpenAI Chat Completions/Responses and Anthropic Messages on one `/v1` surface, with per-provider credentials and namespaced model IDs.',
      '`HealthRouter` resolves explicit provider order, virtual routes (`auto`, `best`, `free`), custom cascades and a paid-OpenRouter fallback chain that runs ahead of AgentRouter last-resort routes.',
      'Three-state circuit breaker (closed / open / half-open) opens on a consecutive-failure threshold or a failure-rate window, holds for `circuitOpenMs`, then admits one in-flight half-open probe.',
      'Pre-output retry policy: fallback only before semantic or tool output begins; a committed stream reports `stream_interrupted` rather than splicing models.',
      'Streaming proxy with SSE token/cost telemetry, Prometheus metrics, `x-router-*` attempt summaries and a browser-local Fieldbook (Compare, Room, Iteration Studio).'
    ],
    verifiedCapabilities: [
      'Zero runtime npm dependencies; devDependencies limited to TypeScript, tsx and @types/node',
      'Health-aware pre-output failover across OpenAI- and Anthropic-compatible providers',
      'Three-state circuit breaker with cooldown and a single in-flight half-open probe',
      'Live SSE throughput metering, Prometheus metrics and cost accounting'
    ],
    techStack: ['TypeScript', 'Node.js 22+ (ESM)', 'OpenAI / Anthropic HTTP APIs', 'Circuit-breaker FSM', 'Prometheus metrics'],
    metrics: [
      { label: 'Runtime Deps', value: '0 npm Packages' },
      { label: 'Circuit States', value: 'Closed / Open / Half-open' },
      { label: 'Failover', value: 'Pre-output Only' }
    ],
    flexiFreqs: [220.00, 261.63, 329.63, 440.00],
    codeListingTitle: 'LISTING 6.1 // SOURCE EXCERPT — CIRCUIT-BREAKER ADMISSION (src/router.ts)',
    codeListing: `        const state = this.peek(protocol, model);
        if (state.entitlementBlocked) return false;
        if (state.rateLimitedUntil && state.rateLimitedUntil > now) return false;
        if (state.circuitState === "open") {
          if (!state.circuitOpenUntil || state.circuitOpenUntil > now) return false;
          state.circuitState = "half-open";
        }
        if (state.circuitState === "half-open") return state.inflight === 0;
        return true;
      });`,
    codeSource: {
      label: 'src/router.ts L139–L148 · routetok@7016c8d',
      url: 'https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/src/router.ts#L139-L148'
    },
    terminalStream: [
      'READING GUIDE // README.md — three surfaces (proxy / dashboard / sandbox) and health-aware pre-output fallback',
      'READING GUIDE // src/router.ts — HealthRouter candidate ranking and circuit admission',
      'READING GUIDE // test/integration/committed-stream.test.ts — a committed stream ends with a truthful frame, not a splice',
      'READING GUIDE // docs/api.md — circuit open / half-open semantics and Prometheus families',
      'NOTE // no latency benchmark is published; the repository states no 0.35 ms or 15 ms figure'
    ],
    sources: [
      { label: 'routetok README — surfaces, pre-output fallback, non-affiliation', url: 'https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/README.md' },
      { label: 'src/router.ts — HealthRouter circuits, ranking and attempt admission', url: 'https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/src/router.ts' },
      { label: 'docs/api.md — circuit states and metrics exposition', url: 'https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/docs/api.md' },
      { label: 'test/integration/committed-stream.test.ts — committed-stream honesty tests', url: 'https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/test/integration/committed-stream.test.ts' },
      { label: 'package.json — zero runtime dependencies, three devDependencies', url: 'https://github.com/mojomast/routetok/blob/7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3/package.json' }
    ],
    sourceRevision: '7016c8de0553ddac858d9a2563c2e7eb2bdbbfd3',
    researchedAt: '2026-10-13'
  },
  {
    id: 'rgbagentflightindicator',
    index: 7,
    issueSection: 'HARDWARE ANNUNCIATORS // HID TELEMETRY',
    spreadType: 'cockpit-annunciator',
    readerServiceNo: 107,
    title: 'RGBAgentFlightIndicator',
    kicker: 'One Lamp Per Agent Session. No Alt-Tab.',
    headline: 'Turning an RGB Keyboard into an Agent Annunciator Panel',
    deck: 'A local daemon maps each agent session to one key—green while it works, white when it lands, blinking red when a human is needed—so a dozen sessions are legible from across the room.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.) · github.com/mojomast',
    category: 'Hardware Telemetry / Ambient Interfaces',
    glanceNote: 'The twelve-lane default is configurable, and physical lamp indices depend on the device. The web UI includes a colour-blind-safe preset and colour-vision simulations.',
    repoUrl: 'https://github.com/mojomast/rgbagentflightindicator',
    liveUrl: null,
    spotInkHex: '#d97706', // Caution Amber
    secondaryInkHex: '#0284c7', // Avionics Cyan
    pullQuote: 'The panel refuses to pretend: a device that can show only one colour lights its most urgent lane rather than faking twelve lamps it does not have.',
    bodyCopy:
      'RGBAgentFlightIndicator is a Python daemon that turns an RGB keyboard into an annunciator panel for AI agent sessions. Each session claims one lane, and every connected keyboard maps lanes onto its own lamps; agents report over a local HTTP API, so a plugin, a CI job or a shell script can light a key. Four states carry the meaning—green while working, white when done, blinking red when a human is needed, dark when idle. The project is unusually honest about hardware: the Sinowealth and EVision backends are verified on real boards, while the OpenRGB, sysfs and QMK/VIA backends are implemented to their documented protocols but have not yet been run against a physical board. The render loop repaints only the devices whose frame actually changed.',
    fieldNotes: ['Default 12 lanes (`--count`), configurable; each device maps lanes to its own lamp indices.', 'Verified on hardware: Sinowealth 258A:0049 and the EVision/SONiX Magic Refiner MK 17.', 'QMK is per-key on Vial firmware; stock QMK+VIA exposes one colour.', 'The web UI ships a colour-blind-safe preset and protanopia/deuteranopia/tritanopia simulation; the default palette is green/white/red.'],
    editorialLead:
      'RGBAgentFlightIndicator (0.8.0, alpha) turns a mechanical keyboard into a flight-deck-style annunciator panel for autonomous agent sessions. A small Python daemon speaks to several keyboard protocols behind one interface, offers one lane per session over a local HTTP API, and repaints each device only when its frame changes. Backends that cannot address individual lamps are treated honestly—the whole device shows the most urgent lane instead of pretending to be a matrix.',
    architecture: [
      'Python HTTP daemon (default `127.0.0.1:8730`) with one lane per agent session; lanes are held until released or evicted least-recently-used.',
      'Backend registry spanning Sinowealth, EVision, OpenRGB, sysfs, QMK/VIA, HID LampArray, SteelSeries GameSense, WLED and HTTP single-light devices behind one write interface.',
      'Bounded LED vocabulary—off / steady / blink / breathe with period, duty and cycle count—rendered identically by the daemon and the browser preview, and checked against a shared fixture.',
      'Web configuration UI (lamp map, overrides, lane mapping) plus hook/webhook ingest and integrations for Claude Code, Gemini CLI, Pi, LangGraph, CrewAI, OpenAI Agents and more.',
      'Reach layered on the panel: ack, an attention notifier, MQTT with Home Assistant discovery, an OTLP/HTTP receiver, and a bounded transition history with `rgi digest`.'
    ],
    verifiedCapabilities: [
      'Per-key lane mapping on Sinowealth and EVision hardware verified by the author',
      'Four states (working / done / blocked / error) rendered as green, white and blinking red',
      'Local HTTP session API plus MQTT, OTLP and Home Assistant reach',
      'Hotplug recovery: the daemon notices a replug, reopens the device and repaints'
    ],
    techStack: ['Python 3.10+', 'HTTP / SSE', 'USB HID (hidapi)', 'QMK / VIA', 'OpenRGB SDK', 'MQTT / OTLP'],
    metrics: [
      { label: 'Default Lanes', value: '12 (configurable)' },
      { label: 'Verified Backends', value: 'Sinowealth · EVision' },
      { label: 'State Palette', value: 'Green / White / Blinking Red' }
    ],
    flexiFreqs: [233.08, 293.66, 349.23, 466.16],
    codeListingTitle: 'LISTING 7.1 // SOURCE EXCERPT — BOUNDED LED STATE RENDERER (rgi/appearance.py)',
    codeListing: `    def render(self, elapsed_s: float, quiet: bool = False) -> RGB:
        base = _scale(self.color, self.brightness)
        if self.pattern == "off" or base == OFF:
            return OFF
        if quiet or self.pattern == "steady":
            # While the human types the frame holds a steady colour: no writes,
            # and nothing to gain from computing a phase nobody will see.
            return base
        period = max(0.04, self.period_ms / 1000.0)
        if self.cycles and elapsed_s >= self.cycles * period:
            return base if self.then == "steady" else OFF
        phase = (max(0.0, elapsed_s) % period) / period
        if self.pattern == "blink":
            return base if phase < max(0.0, min(1.0, self.duty)) else OFF
        if self.pattern == "breathe":
            level = 0.5 - 0.5 * cos(2.0 * pi * phase)
            return _scale(base, max(1, int(level * 255 + 0.5)))
        return base`,
    codeSource: {
      label: 'rgi/appearance.py L60–L77 · rgbagentflightindicator@fc7378d',
      url: 'https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c090322e623a5a3bbeafb97d619/rgi/appearance.py#L60-L77'
    },
    terminalStream: [
      'READING GUIDE // README.md — one key per session; green / white / blinking red',
      'READING GUIDE // README.md backend table — Sinowealth and EVision verified on hardware; QMK, OpenRGB and sysfs not yet run on a board',
      'READING GUIDE // rgi/daemon.py — TICK = 0.12 s render interval; only changed frames are written',
      'READING GUIDE // rgi/webui/lib/color.js and views/appearance.js — colour-blind simulation and preset, not the default palette',
      'NOTE // no 60 Hz refresh, 24-slot limit, 6 ms latency or colour-blind-validated default palette is claimed by the project'
    ],
    sources: [
      { label: 'rgbagentflightindicator README — states, backends and verification status', url: 'https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c090322e623a5a3bbeafb97d619/README.md' },
      { label: 'rgi/appearance.py — bounded LED vocabulary and state renderer', url: 'https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c090322e623a5a3bbeafb97d619/rgi/appearance.py' },
      { label: 'rgi/daemon.py — render tick, frame-diff writes and hotplug recovery', url: 'https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c090322e623a5a3bbeafb97d619/rgi/daemon.py' },
      { label: 'rgi/webconfig.py — default green / white / red palette', url: 'https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c090322e623a5a3bbeafb97d619/rgi/webconfig.py' },
      { label: 'rgi/webui/lib/color.js — protanopia / deuteranopia / tritanopia simulation', url: 'https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c090322e623a5a3bbeafb97d619/rgi/webui/lib/color.js' }
    ],
    sourceRevision: 'fc7378d037576c090322e623a5a3bbeafb97d619',
    researchedAt: '2026-10-13'
  },
  {
    id: 'mothbake',
    index: 8,
    issueSection: 'BINARY CODECS // REPRODUCIBLE BUILDS',
    spreadType: 'hex-datasheet',
    readerServiceNo: 108,
    title: 'MothBake',
    kicker: 'Content-Addressed Baking With Zero Runtime Dependencies',
    headline: 'A Local-First Asset Baker That Keeps Every Bake Reviewable',
    deck: 'How an offline-first Node.js pipeline turns a manifest of local or Moth-backed jobs into SHA-256-identified candidates, reviewable bakes and transactional exports — with every decoder written in-repo and no runtime dependencies.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)',
    category: 'Build Systems / Binary Serialization',
    glanceNote: 'Raw results are archived so built-in bakers can be rebuilt offline. Candidates stay reviewable before export, while live, billable calls are disabled by default.',
    repoUrl: 'https://github.com/mojomast/mothbake',
    screenshot: 'assets/screenshots/mothbake.png',
    screenshotWidth: 1068,
    screenshotHeight: 618,
    screenshotCaption: 'Eighteen tiling albedo textures from the repository’s recorded-bake gallery (docs/images/gallery-textures.png), baked by MothBake with no network or API key.',
    liveUrl: null,
    spotInkHex: '#ea580c', // Rust Orange
    secondaryInkHex: '#334155', // Graphite Ink
    pullQuote: 'Determinism is not a vibe; it is a property you can test. MothBake’s bet is that a bake should be a content-addressed record you can diff, approve and rebuild offline — not an opaque blob you hope is reproducible.',
    bodyCopy:
      'MothBake is a local-first asset variation workbench with zero runtime dependencies. A recipe names an engine, its inputs and parameters, and the bake that turns the result into a portable record; the tool then decodes the result itself (PNG, GIF, ZIP, Radiance HDR, WAV, Standard MIDI) and runs emitters that write what a project consumes — decoded files, sprite-sheet atlases, a JSON bundle, a generated ES module, a Godot export, or a custom emitter. Content identity is layered rather than overloaded: recipe, generation instance, raw artifact, local bake and export each carry their own SHA-256 fingerprint. Determinism is tested where it matters — the ESM emitter is compared byte-for-byte against a committed golden file, and the ZIP writer pins a fixed 1980 MS-DOS epoch so archives are byte-deterministic.',
    fieldNotes: ['Zero runtime dependencies: every decoder (PNG, GIF, ZIP, HDR, WAV, MIDI) lives in-repo and installs air-gapped.', 'Determinism is tested per emitter/decoder (byte-for-byte ESM golden; fixed-epoch ZIP), not asserted as a global bit-exact guarantee.', 'Offline rebuild: `mothbake repair` rebuilds built-in bakers from archived raw results; billable live calls are approval-gated and off by default.'],
    editorialLead:
      'Baked game and media assets are usually the least auditable files in a repository: a texture or impulse response arrives as an opaque blob, and nobody can say which inputs, options or engine produced it. MothBake treats a bake as data. It plans work over a dependency graph, records layered SHA-256 content identities, archives raw results for verified offline rebuilds, and gates any billable submission behind an exact-fingerprint approval. The whole pipeline is dependency-free Node.js and runs against recorded fixtures with no key and no network.',
    architecture: [
      'Manifest-driven recipe → dependency plan → run journal → raw archive → local bake → candidate pipeline, with separate identities at every stage.',
      'In-repo decoders and emitters: PNG (filters 0–4; colour types 0/2/3/4/6), GIF87a/89a, ZIP (stored/deflate read and write), Radiance RGBE, WAV (8/16/24/32-bit PCM and 32-bit float) and Standard MIDI, plus files/atlas/JSON/ESM/Godot emitters.',
      'Layered SHA-256 content identities (recipe, generation instance, raw artifact, local bake, export) so a signed URL is never mistaken for an identity.',
      'Approval-gated live execution: exact spending-plan fingerprints, a durable single-host run journal, and offline repair of built-in bakers from archived raw outputs.'
    ],
    verifiedCapabilities: [
      'Zero-runtime-dependency Node.js (>=20) pipeline that runs fully offline against recorded fixtures',
      'In-repo decoders for PNG, GIF, ZIP, Radiance HDR, WAV and Standard MIDI, with a byte-for-byte golden test for the ESM emitter',
      'Layered SHA-256 content identities with content-pinned approvals and transactional, versioned export packs',
      'Verified offline rebuild of every built-in baker from archived raw results (legacy archives are readable but labelled unverified)'
    ],
    techStack: ['Node.js (ESM, zero runtime deps)', 'Python (optional local backends)', 'In-repo binary decoders', 'SHA-256 content identities', 'MIT'],
    metrics: [
      { label: 'Runtime Dependencies', value: '0 (offline by default)' },
      { label: 'Determinism Check', value: 'Byte-for-byte ESM golden test' },
      { label: 'CI Matrix', value: 'Ubuntu · Node 20 & 22' }
    ],
    flexiFreqs: [261.63, 311.13, 392.00, 523.25],
    codeListingTitle: 'SOURCE EXCERPT // src/identity.mjs — SHA-256 CONTENT IDENTITY',
    codeListing: `/** SHA-256 hex digest of bytes; path names do not contribute to the hash. */
export function hashBytes(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('hashBytes requires bytes');
  return createHash('sha256').update(bytes).digest('hex');
}`,
    codeSource: {
      label: 'src/identity.mjs L60–L64 · mothbake@93e1825',
      url: 'https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/src/identity.mjs#L60-L64'
    },
    terminalStream: [
      'READING GUIDE // `mothbake plan` shows submissions, archive rebuilds, estimates, unknown costs and local budget violations before any spend.',
      'READING GUIDE // The ESM emitter is compared byte-for-byte against a committed golden file (test/golden.test.mjs).',
      'READING GUIDE // The ZIP writer pins a fixed MS-DOS epoch (1980-01-01) so archives are byte-deterministic (src/decoders/zip.mjs).',
      'READING GUIDE // SHA-256 fingerprints are layered across recipe, instance, raw artifact, local bake and export — there is no single global artifact hash.'
    ],
    sources: [
      { label: 'mothbake @ 93e1825 — README (capabilities & gallery)', url: 'https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/README.md' },
      { label: 'mothbake @ 93e1825 — docs/ARCHITECTURE.md (pipeline & contracts)', url: 'https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/docs/ARCHITECTURE.md' },
      { label: 'mothbake @ 93e1825 — src/identity.mjs (layered SHA-256 identities)', url: 'https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/src/identity.mjs' },
      { label: 'mothbake @ 93e1825 — test/golden.test.mjs (byte-for-byte ESM golden)', url: 'https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/test/golden.test.mjs' },
      { label: 'mothbake @ 93e1825 — .github/workflows/ci.yml (Ubuntu · Node 20/22)', url: 'https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/.github/workflows/ci.yml' }
    ],
    sourceRevision: '93e182557c7c47b75c556477127fb27686fea20d',
    researchedAt: '2026-10-13'
  },
  {
    id: 'warpi',
    index: 9,
    issueSection: 'LOCAL-FIRST WORKSTATIONS // RUST TERMINAL',
    spreadType: 'unix-manpage',
    readerServiceNo: 109,
    title: 'Warpi',
    kicker: 'A Local Pi Agent Backend Behind Warp’s Block UI',
    headline: 'Bring Your Own Model to Warp’s Terminal — Without a Warp Account',
    deck: 'An independent fork of Warp that keeps the native terminal, block UI, approval cards, and diffs, and replaces the cloud agent with a local Pi coding-agent helper pointed at any OpenAI-compatible endpoint you choose — no Warp account in the agent path.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)',
    category: 'Systems Programming / AI Terminal',
    glanceNote: 'Warp supplies the terminal and block interface. This fork adds the Pi-agent bridge, configurable provider credentials, and replacement of the Warp account gate in the agent path.',
    repoUrl: 'https://github.com/mojomast/warpi',
    liveUrl: null,
    spotInkHex: '#15803d', // Phosphor Green
    secondaryInkHex: '#1e293b', // Terminal Charcoal
    pullQuote: 'Warpi is Warp’s terminal and block UI with the cloud agent swapped for a local Pi backend: you configure the endpoint and the key, and the shell never asks Warp for an account.',
    bodyCopy:
      'Warpi is not a new terminal. The terminal, block UI, approval card, diff review, and persistence are upstream Warp, left intact; the fork adds `crates/standalone_agent` and `standalone/pi-helper` to put a local model loop behind them. The private Node helper owns the conversation transcript and drives the pinned Pi coding-agent SDK, while the Rust bridge validates every frame and renders helper events as the same response events Warp’s servers would send — so Warp’s native approval, allowlist, redirection, and read-only checks still decide every side effect. A provider profile carries a base URL, model id, limits, and a credential reference; the key itself stays in the OS secret store, and inference goes only from your machine to your endpoint.',
    fieldNotes: [
      'Independent fork of Warp; not affiliated with, endorsed by, or sponsored by Warp or Denver Technologies, Inc.',
      'The terminal, block UI, PTY, VT100 emulation, and WGPU rendering are upstream Warp, not additions made by this fork.',
      'Upstream-unverified areas (macOS packaging, hosted providers beyond DeepSeek, provider retry) are not claimed here.'
    ],
    editorialLead:
      'Warp’s block terminal is loved for isolating each command’s stdout, stderr, duration, and exit code into foldable cards — but the agent that lives inside it runs through Warp’s servers behind a Warp account. Warpi is an independent fork that keeps the native Warp UI and replaces that backend with a local one: a Rust adapter supervises a private Node helper built on the Pi coding-agent SDK, and inference runs against any OpenAI-compatible endpoint you configure. No Warp login, no Warp server in the agent path.',
    architecture: [
      'Warp owns the terminal, block UI, approval cards, diffs, history, and every workspace side effect — all inherited from upstream Warp.',
      'New fork code in `crates/standalone_agent` holds provider profiles, resolves credentials, supervises the helper, and translates its events into Warp’s native response events.',
      'New fork code in `standalone/pi-helper` embeds the pinned Pi coding-agent SDK (0.84.2), owns the model loop and transcript, and runs as a supervised stdio child with no listening port.',
      'Agent inference goes only to the user-configured OpenAI-compatible Chat Completions endpoint; Warp sign-in, credits, and cloud agent surfaces are hidden while standalone mode is active.'
    ],
    verifiedCapabilities: [
      'No Warp account required — configuring a provider enables the local backend and skips the account gate',
      'Bring your own model: any OpenAI-compatible Chat Completions endpoint, local or hosted, with an optional API key kept in the OS secret store',
      'Native Warp approval, diff, and tool-card surfaces still decide and execute every workspace side effect the model proposes',
      'OpenAI Chat Completions is the only accepted v1 wire protocol; Responses and Anthropic Messages are rejected, not emulated'
    ],
    techStack: ['Rust (fork adapter: crates/standalone_agent)', 'Node.js ≥22.19 (private stdio helper)', 'Pi coding-agent SDK 0.84.2', 'OpenAI Chat Completions', 'Upstream Warp terminal & block UI'],
    metrics: [
      { label: 'Warp Account', value: 'Not Required' },
      { label: 'Agent Wire Protocol', value: 'OpenAI Chat Completions' },
      { label: 'Fork Version', value: '0.1.2 (2026-09-24)' }
    ],
    flexiFreqs: [293.66, 369.99, 440.00, 587.33],
    codeListingTitle: 'SOURCE EXCERPT 9.1 // PROVIDER PROFILE HOLDS A CREDENTIAL REFERENCE, NEVER THE SECRET',
    codeListing: `/// Where the credential for a profile comes from. The reference is a stable
/// key into the OS secret store; it is never the secret itself.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CredentialRef {
    /// No authentication: the wire request must not carry an Authorization header.
    None,
    /// Look up by key in the platform secret store.
    SecretStore { key: String },
}`,
    codeSource: {
      label: 'crates/standalone_agent/src/provider.rs — CredentialRef',
      url: 'https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/crates/standalone_agent/src/provider.rs#L89-L98'
    },
    terminalStream: [
      'READING GUIDE — the lines below are documentation, not captured program output.',
      'WHERE THE AGENT LIVES: `crates/standalone_agent` (Rust) supervises the private Node helper in `standalone/pi-helper`.',
      'BYOK FLOW: Settings → Agents → Local Pi provider; pick a preset or a custom OpenAI-compatible base URL, then set the model id and limits.',
      'CREDENTIALS: the profile stores only a reference; the API key goes to the OS secret store and is read at session open.',
      'SIDE EFFECTS: the model proposes commands and edits; Warp’s approval cards, diffs, and allowlists decide and execute them.',
      'EGRESS: inference goes to the configured endpoint only; Warp sign-in, credits, and cloud surfaces are hidden in standalone mode.'
    ],
    sources: [
      { label: 'README — independent Warp fork, local Pi backend, no Warp account (v0.1.2)', url: 'https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/README.md' },
      { label: 'standalone/ARCHITECTURE.md — ownership split and exchange/run model', url: 'https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/standalone/ARCHITECTURE.md' },
      { label: 'crates/standalone_agent/src/provider.rs — provider profiles and credential reference', url: 'https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/crates/standalone_agent/src/provider.rs' },
      { label: 'standalone/pi-helper/src/runtime.ts — pinned Pi SDK, offline resource discovery', url: 'https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/standalone/pi-helper/src/runtime.ts' },
      { label: 'standalone/NETWORK_DEPENDENCIES.md — egress inventory (configured endpoint only)', url: 'https://github.com/mojomast/warpi/blob/760f4fe04caf335393e6e88f213c84f9c6eb4284/standalone/NETWORK_DEPENDENCIES.md' }
    ],
    sourceRevision: '760f4fe04caf335393e6e88f213c84f9c6eb4284',
    researchedAt: '2026-10-13'
  },
  {
    id: 'hermesdashboard',
    index: 10,
    issueSection: 'OBSERVABILITY & CONTROL // FLEET TELEMETRY',
    spreadType: 'control-topology',
    readerServiceNo: 110,
    title: 'HermesDashboard',
    kicker: 'Operator Console for Hermes Sessions',
    headline: 'Live Session Views and a Graph of the Agent Fleet',
    deck: 'A standalone dashboard for an existing Hermes install: streaming chat, a scannable sessions browser, a live subagent drawer, and a canvas graph across sessions, files, tools, models and skills.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)',
    category: 'Agent Observability / Operator Console',
    glanceNote: 'Works alongside an existing Hermes installation. Session browsing, a live child-agent drawer, resource relationships, and per-session token and cost views expose the work already running there.',
    repoUrl: 'https://github.com/mojomast/hermesdashboard',
    liveUrl: null,
    spotInkHex: '#6d28d9', // Royal Violet Ink
    secondaryInkHex: '#be185d', // Magenta Trace
    pullQuote: 'An agent fleet is unreadable as a wall of logs; a live, inspectable view of each run is what makes long autonomous work worth trusting.',
    bodyCopy:
      'HermesDashboard packages the Hermes dashboard as a standalone Python web app for people who already run Hermes. Chat streams over Server-Sent Events, tool activity collapses into single-line rows that expand on demand, and a floating “Live view” drawer follows a `delegate_task` child session as it works. A canvas graph ties sessions to the files, tools, models and skills they touched, and per-session token and cost badges make the economics visible. It is explicitly not a standalone Hermes runtime: it depends on a working Hermes install, its home directory and `state.db`.',
    fieldNotes: ['Requires an existing Hermes install—not a standalone runtime.', 'Streaming chat over Server-Sent Events, with WebSocket terminals.', 'Live subagent drawer streams a delegate_task child session.', 'Per-session token and cost accounting.'],
    editorialLead:
      'When Hermes spawns specialized subagents to explore repositories and run test suites, flat logs stop being readable. HermesDashboard turns the runtime into an operator console: a streaming chat surface, a scannable sessions browser, a live subagent drawer, and a d3/canvas graph linking sessions to the files, tools, models and skills they used. It runs as a Starlette app against an existing Hermes install, and it is honest about that dependency.',
    architecture: [
      'Starlette (Python) application served by uvicorn; `app.py` owns the route table and streams upstream Hermes output over Server-Sent Events via `sse-starlette`.',
      'Live subagent drawer: the agent emits a `child_session_started` event when `delegate_task` spawns a child, and the drawer follows that child session’s `/api/sessions/{id}/stream` SSE feed in a fixed floating panel.',
      'HTML5 Canvas graph with d3 zoom and pan across sessions, files, tools, models and skills, plus persisted display settings for labels, spacing, edges and panel sizing.',
      'Read-only token and cost aggregation, and an optional browser xterm.js terminal backed by a real Unix PTY—disabled by default and hard-disabled in Docker.'
    ],
    verifiedCapabilities: [
      'Streaming Hermes chat with single-line tool activity and drill-down panels',
      'Live subagent drawer for in-flight delegate_task child sessions',
      'Canvas graph across sessions, files, tools, models and skills',
      'Per-session token and cost accounting',
      'Optional local-only xterm.js terminal backed by a Unix PTY'
    ],
    techStack: ['Python / Starlette', 'Server-Sent Events', 'WebSocket', 'SQLite', 'vanilla JS + d3', 'xterm.js'],
    metrics: [
      { label: 'Backend', value: 'Starlette / Python' },
      { label: 'Live Stream', value: 'Server-Sent Events' },
      { label: 'Dependency', value: 'Existing Hermes install' }
    ],
    flexiFreqs: [311.13, 392.00, 466.16, 622.25],
    codeListingTitle: 'LISTING 10.1 // SOURCE EXCERPT — SSE EVENT NORMALIZATION',
    codeListing: `    hermes = parsed.get("hermes")
    usage = parsed.get("usage")
    if isinstance(hermes, dict):
        payload = dict(hermes)
        call_id = str(
            payload.get("call_id") or payload.get("tool_call_id") or ""
        ).strip()
        if call_id and not payload.get("call_id"):
            payload["call_id"] = call_id
        if payload.get("type") == "meta" and usage:
            payload["usage"] = usage
        payloads.append(payload)`,
    codeSource: {
      label: 'app.py L667–L678 · hermesdashboard@74ef867',
      url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/app.py#L667-L678'
    },
    terminalStream: [
      'READING GUIDE // README.md — standalone dashboard for an existing Hermes install',
      'READING GUIDE // README.md §Live Subagent Drawer — child_session_started over SSE',
      'READING GUIDE // README.md §Streaming Reliability — long tool-heavy runs, resume and stop',
      'READING GUIDE // IMPLEMENTATION.md — installer flow and required Hermes runtime surface'
    ],
    sources: [
      { label: 'hermesdashboard README', url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/README.md' },
      { label: 'IMPLEMENTATION.md — packaging and runtime surface', url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/IMPLEMENTATION.md' },
      { label: 'app.py — Starlette routes and SSE normalization', url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/app.py' },
      { label: 'static/js/dashboard.js — canvas graph and live drawer', url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/static/js/dashboard.js' },
      { label: 'requirements.txt — Starlette, uvicorn, sse-starlette', url: 'https://github.com/mojomast/hermesdashboard/blob/74ef867f3d7ad408c6c3c6aca6c91d4532464da9/requirements.txt' }
    ],
    sourceRevision: '74ef867f3d7ad408c6c3c6aca6c91d4532464da9',
    researchedAt: '2026-10-13'
  },
  {
    id: 'becomussy',
    index: 11,
    issueSection: 'SPECIAL MONOGRAPH // IDENTITY & MEMORY',
    spreadType: 'monograph-covenant',
    readerServiceNo: 111,
    title: 'Becomussy',
    kicker: 'How an Agent Remembers, Reflects, and Revises Itself',
    headline: 'A Governed Continuity System for Agent Self-Development',
    deck: 'Five kinds of memory, reflection journals, active threads and commitments, a versioned self-model with semantic diffing, and identity revisions that high-risk changes route through human approval.',
    byline: 'By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)',
    category: 'Agent Identity / Memory Architecture',
    glanceNote: 'The repository combines memory, reflection, threads, a self-model and revision proposals. Keyword search is implemented; vector/hybrid retrieval and drift detection remain planned work.',
    repoUrl: 'https://github.com/mojomast/becomussy',
    liveUrl: null,
    spotInkHex: '#b45309', // Archival Gold-Ochre
    secondaryInkHex: '#0f766e', // Deep Verdigris
    pullQuote: 'Continuity is not context-window hoarding; it is memory with provenance, reflection that compounds, and a self-model a human has agreed to.',
    bodyCopy:
      'Becomussy is a governed continuity platform that lets an agent remember across sessions, resume unfinished work, reflect over time, and route meaningful self-revisions through human review. Durable memory items are typed—episodic, semantic, autobiographical, working, and relational—and carry provenance, salience, reinforce, and contradict operations. A versioned self-model stores the agent’s self-understanding across four facets (descriptive, aspirational, constrained, relational) and compares versions with a structured semantic diff engine. Revision proposals are risk-classified: low-risk thread or project changes may auto-approve, while constrained/value identity changes require approval, with policy checks and an emergency freeze. Every durable write records an audit event, and a context compiler assembles a resume bundle at session start.',
    fieldNotes: ['Five typed memory kinds, each provenanced and searchable.', 'High-risk identity changes require human approval; low-risk changes may auto-approve.', 'MVP auth is header-based (X-User-Id / X-User-Role) and should be replaced with OAuth/JWT.', 'Drift detection and vector/hybrid search are planned, not shipped; search is keyword-based today.'],
    editorialLead:
      'An agent that wakes in a fresh process is not the same agent unless something carries across. Becomussy answers that problem as a governance system rather than a bigger context window: a FastAPI modular monolith over PostgreSQL, with typed and provenanced memory, reflection journals, active threads and commitments, a versioned self-model, and revision proposals whose high-risk identity changes a human must approve. Every durable update is auditable, and the whole design is explicit about its MVP boundaries.',
    architecture: [
      'Modular monolith: one FastAPI application with service boundaries for memory, threads/projects, journal, self-model, revisions, governance, search, and audit.',
      'Multi-layer memory items (episodic, semantic, autobiographical, working, relational) with provenance, salience, reinforce, and contradict operations.',
      'Versioned self-model snapshots across four facets—descriptive, aspirational, constrained, relational—compared by a section-by-section semantic diff engine.',
      'Risk-classified revision proposals: high-risk identity changes require approval, low-risk thread/project targets may auto-approve, with policy checks and an emergency freeze.',
      'Immutable audit trail for every durable write, plus a context compiler that assembles a resume bundle at session start.'
    ],
    verifiedCapabilities: [
      'Structured multi-layer memory with search, salience reinforcement, and contradiction recording',
      'Versioned self-model with section-by-section semantic diffing',
      'Risk-based governance: approve, reject, defer, policy checks, and emergency freeze',
      'Active threads, projects, and commitments with a session-start resume bundle',
      'Immutable audit events for all durable changes'
    ],
    techStack: ['Python 3.12 / FastAPI', 'PostgreSQL + pgvector', 'SQLAlchemy + Alembic', 'Redis', 'Next.js', 'Docker Compose'],
    metrics: [
      { label: 'Memory Kinds', value: '5, typed + provenanced' },
      { label: 'Self-Model', value: 'Versioned, 4 facets' },
      { label: 'Identity Change', value: 'Risk-gated approval' }
    ],
    flexiFreqs: [261.63, 329.63, 392.00, 523.25],
    codeListingTitle: 'SOURCE EXCERPT // RISK-CLASSIFIED REVISION GATE',
    codeListing: `def _classify_risk(revision_type: str, target_entity_type: str) -> str:
    """Determine risk class based on revision type and target entity.

    Rules from spec:
    - self_model + constrained/value keywords -> high
    - self_model + descriptive keywords -> medium
    - thread or project target -> low
    - Default: medium
    """
    revision_lower = revision_type.lower()
    target_lower = target_entity_type.lower()

    if target_lower in ("thread", "project"):
        return "low"

    if target_lower == "self_model":
        # Check for high-risk keywords in the revision type
        if any(kw in revision_lower for kw in _HIGH_RISK_KEYWORDS):
            return "high"
        # Check for descriptive keywords
        if any(kw in revision_lower for kw in _DESCRIPTIVE_KEYWORDS):
            return "medium"

    # Default
    return "medium"`,
    terminalStream: [
      '[reading guide] README, line 15: “Every durable update is auditable. High-risk identity changes require human approval.”',
      '[scope] FastAPI + PostgreSQL/pgvector + Next.js continuity MVP with a session-start resume bundle.',
      '[auth] Header-based MVP (X-User-Id / X-User-Role); the code says to replace it with real OAuth/JWT.',
      '[caveat] Drift detection and vector/hybrid search are planned, not implemented; background workers are future.'
    ],
    codeSource: {
      label: 'backend/app/services/revisions/__init__.py L29–L53 · risk classification',
      url: 'https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f/backend/app/services/revisions/__init__.py#L29-L53'
    },
    sources: [
      { label: 'becomussy README — governed continuity overview and API', url: 'https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f/README.md' },
      { label: 'backend/app/core/security.py — MVP header auth, no cryptography', url: 'https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f/backend/app/core/security.py#L1-L46' },
      { label: 'backend/app/models/memory.py — five typed memory kinds', url: 'https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f/backend/app/models/memory.py#L30-L40' },
      { label: 'backend/app/services/revisions/__init__.py — risk-based revision gate', url: 'https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f/backend/app/services/revisions/__init__.py#L25-L63' },
      { label: 'ARCHITECTURE.md — spec-to-code map and deferred scope', url: 'https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f/ARCHITECTURE.md#L1-L40' }
    ],
    sourceRevision: '7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f',
    researchedAt: '2026-10-13'
  }
];

export const PROJECTS_BY_ID = Object.freeze(
  Object.fromEntries(USSY_PROJECTS.map((project) => [project.id, project]))
);

export function getProjectById(id) {
  if (!id) return null;
  return PROJECTS_BY_ID[String(id).toLowerCase()] || null;
}
