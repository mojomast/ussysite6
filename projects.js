/**
 * USSYSITE6 // THE SLOP COMPUTING ANNUAL (VOL. 11, NO. 10 — OCTOBER 2026)
 * EDITORIAL CATALOG & TECHNICAL MONOGRAPH SOURCE OF TRUTH
 *
 * Canonical verified metadata for all 11 mojomast repositories, structured as
 * feature articles in a classic collector's computing magazine.
 * NOTE: Keep `/projects.js` and `/js/projects.js` byte-identical (`npm run check:mirrors`).
 */

export const MAGAZINE_ISSUE_META = {
  publicationTitle: 'THE SLOP COMPUTING ANNUAL',
  publicationAcronym: 'SLOP',
  publicationExpansion: 'Serious Literature on Open Programs',
  subtitle: 'A Small Systems Journal of Autonomous Software, Real-Time Craft & Deterministic Machines',
  volume: 'Vol. 11, No. 10',
  coverDate: 'October 2026',
  issn: 'ISSN 2026-8779',
  priceTag: '$6.50 US · £4.95 UK · ¥1,200 JP',
  coverTheme: 'AUTONOMOUS SYSTEMS & DETERMINISTIC CRAFT',
  editorInChief: 'Mojomast Press Syndicate',
  totalPages: 112,
  printModes: [
    {
      id: 'cream-press',
      label: 'Archival Cream Offset',
      description: 'Warm 1984 cotton-rag paper stock with four-color CMYK spot inks'
    },
    {
      id: 'blueprint',
      label: 'Cyanotype Blueprint',
      description: 'Prussian blue architectural drafting linen with crisp white vector lines'
    },
    {
      id: 'darkroom',
      label: 'Halftone Darkroom',
      description: 'High-contrast obsidian photostat negative with amber phosphor ink'
    }
  ]
};

export const USSY_PROJECTS = [
  {
    id: 'orbitdesktop',
    index: 1,
    issueSection: 'COVER STORY // SPATIAL INTERFACES',
    spreadType: 'gatefold-blueprint',
    pageRange: 'pp. 08–17',
    readerServiceNo: 101,
    title: 'OrbitDesktop',
    kicker: 'Beyond the Flat Desktop Metaphor',
    headline: 'A Three-Ring Orbital Shell for Autonomous Agent Workflows',
    deck: 'Why stack twenty overlapping rectangles on a flat desktop when local Hermes agents, terminals, and live telemetry cards can inhabit concentric depth rings with zero-latency IPC?',
    byline: 'By the Spatial Systems Desk · Fig. 1.1–1.4',
    category: 'Spatial Computing / Desktop OS',
    repoUrl: 'https://github.com/mojomast/orbitdesktop',
    liveUrl: null,
    spotInkHex: '#d9381e', // Vermilion Red
    secondaryInkHex: '#0047ab', // Cobalt Blue
    pullQuote: '“The desktop was never meant to be a pile of paper; it is an observatory where active work orbits at arm’s reach and background Daemons circle the horizon.”',
    bodyCopy:
      'Under the hood, OrbitDesktop treats the workspace as a scene graph rather than a window list. Each pane carries an orbital coordinate, a focus weight and an IPC binding to a named Hermes agent; promoting a pane to Ring I smoothly damps every other surface outward, so attention becomes a physical quantity you can steer with Alt+Ring. Because the compositor is WebGL2, transitions are GPU-timed and never block the agent bridge, and a workspace serializes to declarative JSON that restores to the exact same orbital pose on the next cold boot.',
    fieldNotes: ['Ring I — Primary Focus: the surface you are actively editing.', 'Ring II — Active Context: terminals, diffs and agent tool-calls at arm’s reach.', 'Ring III — Peripheral Telemetry: background daemons circling the horizon.'],
    editorialLead:
      'For forty years since Xerox PARC, personal computing has remained trapped on a two-dimensional blotter. OrbitDesktop breaks the glass by pairing an Electron/WebGL2 spatial compositor with a direct Unix-domain IPC bridge to local Hermes autonomous agents. Windows are promoted or recessed across three concentric orbital rings—Primary Focus, Active Context, and Peripheral Telemetry—so the engineer never loses sight of what the machine is thinking.',
    architecture: [
      'Hardware-accelerated orbital compositor organizing windows along three concentric depth rings with spring-damped focus transitions.',
      'Bi-directional Unix socket IPC bridge streaming live Hermes agent tool calls, file-system diffs, and subagent state.',
      'Keyboard-first spatial navigation (`Alt+Ring`, `Ctrl+Orbit`) with zero-latency camera snapping between code panes and 3D context maps.',
      'Declarative JSON workspace snapshots preserving exact orbital coordinates and agent bindings across reboots.'
    ],
    verifiedCapabilities: [
      '3-ring orbital window management with spring-damped focus camera',
      'Embedded Hermes agent task runner and live tool-call inspector',
      'Spatial minimap radar and instant depth-ring switching',
      'Local-first configuration with customizable shader backdrops'
    ],
    techStack: ['TypeScript', 'Three.js', 'Electron / WebGL2', 'Hermes IPC', 'CSS Houdini'],
    metrics: [
      { label: 'Frame Budget', value: '16.6 ms (60fps)' },
      { label: 'Orbital Strata', value: '3 Depth Rings' },
      { label: 'IPC Latency', value: '< 1.8 ms' }
    ],
    flexiFreqs: [261.63, 329.63, 392.00, 493.88],
    codeListingTitle: 'LISTING 1.1 // ORBITAL RING COMPOSITOR SOLVER',
    codeListing: `// OrbitDesktop ring transform & spring damper
export function computeRingPose(slotIdx, totalSlots, ringDepth, focusAlpha) {
  const theta = (slotIdx / totalSlots) * Math.PI * 2;
  const radius = 12.0 + ringDepth * 8.5 * (1.0 - focusAlpha * 0.45);
  return {
    x: Math.cos(theta) * radius,
    z: Math.sin(theta) * radius - ringDepth * 6.0,
    yaw: -theta + Math.PI / 2
  };
}`,
    terminalStream: [
      '[orbit:ring0] Mounted primary editor surface (16.6ms frame lock)',
      '[hermes:ipc] Connected to local agent daemon on unix:///tmp/hermes.sock',
      '[compositor] 14 workspace panes distributed across Rings I–III',
      '[focus:snap] Camera glided to Ring-1 // Node: workspace-primary'
    ]
  },
  {
    id: 'velvetrp',
    index: 2,
    issueSection: 'LITERARY MACHINES // COLLABORATIVE FICTION',
    spreadType: 'literary-folio',
    pageRange: 'pp. 18–27',
    readerServiceNo: 102,
    title: 'VelvetRP',
    kicker: 'Theatrical Prose Meets Deterministic Rules',
    headline: 'An Event-Sourced Stage for Long-Form Tabletop Roleplay',
    deck: 'Combining the typographic intimacy of a literary folio with a cryptographically verifiable dice oracle, branching world clocks, and multi-author WebSocket presence.',
    byline: 'By the Narrative Engines Group · Folio II',
    category: 'Narrative Systems / Collaborative Fiction',
    repoUrl: 'https://github.com/mojomast/velvetrp',
    liveUrl: null,
    spotInkHex: '#9b1b30', // Crimson Bordeaux
    secondaryInkHex: '#b45309', // Warm Ochre
    pullQuote: '“When the rules engine is 100% deterministic and auditable, the authors are freed to care only about voice, tension, and consequence.”',
    bodyCopy:
      'VelvetRP’s dual-column composer borrows the grammar of a printed play: left column for staging and stage directions, right column for spoken prose, with whispered asides routed only to their recipient. Every beat is appended to an immutable SQLite ledger, so a session can be replayed, forked or typeset into an anthology months later. The dice oracle is seeded from a published hex value, letting any reader re-derive each roll and confirm that the drama was earned rather than narrated.',
    fieldNotes: ['Every roll is seeded and re-derivable — trust without a referee.', 'World clocks advance on consequence, never on wall time.', 'Whispers are delivered to their recipient, never persisted.'],
    editorialLead:
      'Most virtual tabletops look like tax-preparation software bolted onto a chatbox. VelvetRP treats collaborative fiction as a first-class literary medium. Built around a dual-column theatrical script layout and an immutable SQLite event ledger, every prose beat, whispered aside, character poise modifier, and polyhedral roll is recorded in a replayable anthology.',
    architecture: [
      'Event-sourced scene ledger ensuring every narrative beat, dice outcome, and status modifier is 100% auditable and replayable.',
      'Theatrical dual-column prose composer with inline character portrait states, mood lighting cues, and private whisper channels.',
      'Declarative rulebook schema supporting custom dice pools, Blades-style progress clocks, and branching campaign arcs.',
      'Low-jitter WebSocket presence engine synchronizing active typists, turn initiative, and ambient audio cues.'
    ],
    verifiedCapabilities: [
      'Cryptographically seeded dice roller with full modifier breakdown',
      'Live multi-author scene staging with character portrait states',
      'Persistent campaign lore codex and relationship graph',
      'One-click export to typeset HTML & Markdown anthologies'
    ],
    techStack: ['TypeScript', 'Node.js', 'WebSockets', 'SQLite Event Ledger', 'Editorial CSS Grid'],
    metrics: [
      { label: 'Sync Jitter', value: '< 12 ms' },
      { label: 'Ledger Integrity', value: '100% Replayable' },
      { label: 'Prose Layout', value: 'Dual-Column Folio' }
    ],
    flexiFreqs: [293.66, 349.23, 440.00, 523.25],
    codeListingTitle: 'LISTING 2.1 // DETERMINISTIC DICE ORACLE LEDGER',
    codeListing: `// VelvetRP verifiable roll reducer
export function resolveRoll(seedHex, poolSize, modifier, clockSegment) {
  const rolls = sampleDeterministicPool(seedHex, poolSize, 12);
  const highest = Math.max(...rolls) + modifier;
  const outcome = highest >= 20 ? 'CRITICAL_GRACE' : highest >= 14 ? 'MIXED_COST' : 'FALLOUT';
  return { rolls, highest, outcome, clockNext: Math.min(6, clockSegment + 1) };
}`,
    terminalStream: [
      '[velvet:scene] Act III "The Lanterns of Oakhaven" opened by Storyweaver',
      '[dice:oracle] 2d12 + Poise(3) -> [11, 9] + 3 = 23 (CRITICAL_GRACE)',
      '[world:clock] "The Rising Tide" advanced to segment 5/6',
      '[codex] Persisted 4 character memory fragments to anthology ledger'
    ]
  },
  {
    id: 'jammate',
    index: 3,
    issueSection: 'ACOUSTIC LAB BENCH // REAL-TIME DSP',
    spreadType: 'oscilloscope-bench',
    pageRange: 'pp. 28–37',
    readerServiceNo: 103,
    title: 'JamMate',
    kicker: 'Zero Locks, Zero Allocations on the Audio Thread',
    headline: 'Sub-3ms C++20 & JUCE Neural Amplifier Workstation',
    deck: 'Inside a wait-free real-time DSP pipeline that pairs SIMD biquad cascades, convolution cabinet impulse responses, and sample-accurate backing stem synchronization.',
    byline: 'By the Real-Time Audio Laboratory · Test Bench #03',
    category: 'Audio Engineering / Real-Time DSP',
    repoUrl: 'https://github.com/mojomast/jammate',
    liveUrl: null,
    spotInkHex: '#0f766e', // Oscilloscope Teal
    secondaryInkHex: '#d97706', // Amber Phosphor
    pullQuote: '“A single mutex lock or heap allocation inside an audio callback is a broken promise to the musician’s fingertips.”',
    bodyCopy:
      'The discipline is total: the audio callback owns no locks, performs no allocation and issues no syscalls, so a garbage-collection pause on the interface thread can never crackle a held chord. Telemetry leaves the DSP thread through a single-producer/single-consumer ring buffer that the UI drains at 120Hz for its oscilloscope and spectrum traces. The result is a workstation that behaves like hardware — string, amplifier and speaker collapsing into one continuous physical gesture.',
    fieldNotes: ['Zero locks and zero allocations on the real-time thread.', '2.6 ms round-trip at 48kHz / 64-sample buffers.', 'Cabinet IRs, tube overdrive and a 6-band EQ in one VST3.'],
    editorialLead:
      'When a guitarist strikes a string, any round-trip latency above 6 milliseconds disconnects physical touch from perceived sound. JamMate is engineered in strict C++20 and JUCE 8 around Single-Producer Single-Consumer (SPSC) lock-free ring buffers. The real-time audio thread never allocates memory, never touches a mutex, and streams 120Hz FFT spectrum telemetry to the UI without dropping a single sample.',
    architecture: [
      'Wait-free real-time audio callback pipeline with zero heap allocations, mutex locks, or syscalls on the DSP thread.',
      'Integrated convolution cabinet IR loader, nonlinear tube overdrive stage, and 6-band parametric studio EQ.',
      'Sample-accurate loop transport and stem mixer allowing musicians to solo, time-stretch, and rehearse complex passages.',
      'Cross-platform VST3 and Standalone binary with AVX2/NEON SIMD-accelerated filter cascades.'
    ],
    verifiedCapabilities: [
      '2.6ms round-trip audio buffer processing at 48kHz / 64 samples',
      'Lock-free SPSC waveform & FFT telemetry bridge to UI thread',
      'Multi-track stem separator and tempo-locked metronome engine',
      'Instant A/B neural amplifier preset comparison vault'
    ],
    techStack: ['C++20', 'JUCE 8', 'SIMD / AVX2', 'Lock-Free SPSC', 'VST3 / CoreAudio / ASIO'],
    metrics: [
      { label: 'Audio Callback', value: '0 Locks / 0 Allocs' },
      { label: 'Roundtrip Latency', value: '2.6 ms @ 64f' },
      { label: 'DSP Headroom', value: '88% Free @ 96kHz' }
    ],
    flexiFreqs: [329.63, 392.00, 493.88, 659.25],
    codeListingTitle: 'LISTING 3.1 // WAIT-FREE SPSC AUDIOCALLBACK',
    codeListing: `void JamMateProcessor::processBlock(juce::AudioBuffer<float>& buffer, juce::MidiBuffer&) noexcept {
  juce::ScopedNoDenormals noDenormals;
  overdriveStage.process(buffer);
  cabinetConvolution.process(buffer);
  telemetryRingBuffer.tryPushSamples(buffer.getReadPointer(0), buffer.getNumSamples());
}`,
    terminalStream: [
      '[dsp:core] AudioDevice initialized: 48000 Hz // 64 samples (1.33 ms buffer)',
      '[amp:neural] Loaded impulse response "Sunlit_Tweed_4x10_Ribbon.wav"',
      '[spsc:ring] Waveform telemetry bridge streaming at 120 Hz lock-free',
      '[transport] Loop locked to Bar 17..24 @ 108.0 BPM (0 sample drift)'
    ]
  },
  {
    id: 'cocs',
    index: 4,
    issueSection: 'NETWORKED SIMULATION // 60HZ NETCODE',
    spreadType: 'arcade-tactical',
    pageRange: 'pp. 38–47',
    readerServiceNo: 104,
    title: 'CoCS // Colosseum of Competitive Slop',
    kicker: 'Live Browser Multiplayer at arena.ussyco.de',
    headline: 'Deterministic 60Hz Arena Physics & Historical Hitbox Rewind',
    deck: 'How a compact binary WebSocket protocol, 250ms historical AABB rewind buffer, and utility-scored AI operators deliver crisp arena combat directly in the browser.',
    byline: 'By the Simulation & Netcode Bureau · Live Dispatch',
    category: 'Multiplayer Game Server / Netcode',
    repoUrl: 'https://github.com/mojomast/cocs',
    liveUrl: 'https://arena.ussyco.de',
    spotInkHex: '#e11d48', // Signal Magenta-Red
    secondaryInkHex: '#1d4ed8', // Blueprint Cobalt
    pullQuote: '“Fairness in a fast arena shooter is a math problem: rewind the world to the exact millisecond the player pulled the trigger.”',
    bodyCopy:
      'The illusion of a fair fight is manufactured sixty times a second. When a shot is fired, the server rewinds its historical bounding boxes to the exact client timestamp, tests the ray against the world as it was, then snaps forward — so a player on a 48 ms connection and one on 4 ms resolve the same hit. Nine parody operators, each with distinct loadouts and utility-scored behaviour trees, backfill any empty slot, and the whole match ships as a binary WebSocket stream that rarely exceeds a dial-up’s worth of bandwidth.',
    fieldNotes: ['Fixed 60Hz authoritative loop — 16.66 ms per tick.', 'A 250 ms rewind window reconciles latency fairly.', 'Nine parody operators backfill empty slots automatically.'],
    editorialLead:
      'Deployed live at arena.ussyco.de, Colosseum of Competitive Slop (CoCS) is a love letter to high-tickrate arena shooters and a satirical colosseum where human players battle parody AI operators. Beneath the humor lies serious netcode: a fixed 60Hz (16.66ms) authoritative simulation loop with client-side prediction, delta-compressed binary snapshots, and server-side lag compensation.',
    architecture: [
      'Fixed-timestep 60Hz (16.66ms) authoritative server simulation loop with client prediction and snapshot reconciliation.',
      '250ms historical bounding-box rewind ring buffer verifying lag-compensated hitscan rays against past world states.',
      'Autonomous parody AI operators driven by utility-scored tactical state machines (strafe, cover, flank, objective).',
      'Compact binary delta-compressed WebSocket wire format keeping per-client bandwidth under 28 KB/s.'
    ],
    verifiedCapabilities: [
      'Instant browser-playable 60Hz multiplayer matches at arena.ussyco.de',
      'Sub-tick lag compensation with server-side AABB hitbox rewind',
      'Dynamic bot backfill with distinct operator personalities & loadouts',
      'Real-time killfeed, accuracy telemetry, and match state scoreboard'
    ],
    techStack: ['TypeScript', 'Node.js', 'Binary WebSockets', 'HTML5 Canvas', 'Deterministic Physics'],
    metrics: [
      { label: 'Server Tick', value: '60 Hz Fixed (16.6ms)' },
      { label: 'Rewind Window', value: '250 ms Historical' },
      { label: 'Live Endpoint', value: 'arena.ussyco.de' }
    ],
    flexiFreqs: [349.23, 440.00, 523.25, 659.25],
    codeListingTitle: 'LISTING 4.1 // SERVER-SIDE LAG-COMPENSATED RAYCAST',
    codeListing: `export function verifyHitscanAtClientTime(rayOrigin, rayDir, clientTimestamp, historyRing) {
  const snapshot = historyRing.interpolateAt(clientTimestamp);
  for (const entity of snapshot.entities) {
    if (intersectRayAABB(rayOrigin, rayDir, entity.rewoundBounds)) return entity.id;
  }
  return null;
}`,
    terminalStream: [
      '[tick:60hz] Sim step #94,812 completed in 0.38 ms (12 entities active)',
      '[rewind:hit] Verified rail-arc hit at t-48ms (rewound AABB delta: 0.01m)',
      '[bot:ai] Operator "Claude-Clanker" transitioned -> FLANK_HIGH_GROUND',
      '[net:delta] Broadcast 192-byte binary state snapshot to 8 clients'
    ]
  },
  {
    id: 'cocs-godot',
    index: 5,
    issueSection: 'GRAPHICS PIPELINE // VULKAN FORWARD+',
    spreadType: 'shader-diagram',
    pageRange: 'pp. 48–55',
    readerServiceNo: 105,
    title: 'CoCS-Godot',
    kicker: 'Native Engine Client & GPU Particle Lab',
    headline: 'Translating the Arena into Godot 4 Forward+ & SDFGI',
    deck: 'Pairing the canonical CoCS network protocol with Signed Distance Field Global Illumination, custom spatial shaders, and 32,000 GPU compute particles.',
    byline: 'By the Real-Time Graphics Workshop · Plate V',
    category: '3D Game Engine / Shader Art',
    repoUrl: 'https://github.com/mojomast/cocs-godot',
    liveUrl: null,
    spotInkHex: '#2563eb', // Process Ultramarine
    secondaryInkHex: '#7c3aed', // Violet Halftone
    pullQuote: '“Decoupling the simulation protocol from the presentation layer lets the same 192-byte packet drive both an instant HTML5 canvas and a full Vulkan Forward+ cathedral.”',
    bodyCopy:
      'Because the wire protocol is presentation-agnostic, the same 192-byte snapshot that drives a browser canvas can drive a Vulkan Forward+ scene tree. CoCS-Godot interpolates those snapshots into Godot’s node graph, lights the arena with Signed Distance Field Global Illumination, and renders muzzle refraction and holographic shields through custom spatial shaders. An analytical second-order spring solver drives recoil and FOV kick, and the same build doubles as an offline campaign client and a 32,000-particle GPU laboratory.',
    fieldNotes: ['Wire-compatible with the canonical CoCS server.', 'SDFGI real-time global illumination — no baked probes.', '32,000 GPU compute particles at zero CPU cost.'],
    editorialLead:
      'CoCS-Godot demonstrates clean protocol separation by bringing the Colosseum of Competitive Slop arena into a native Godot 4.x 3D client. Using Vulkan Forward+ rendering, SDFGI real-time global illumination, and procedural weapon recoil springs, it also serves as an offline single-player campaign client and GPU shader laboratory.',
    architecture: [
      'Godot 4.x scene tree architecture with decoupled network snapshot interpolators and local campaign state machines.',
      'Custom GDScript + GLSL spatial shaders for holographic shields, muzzle refraction, and procedural skyboxes.',
      'GPU-driven compute particle emitters rendering 32,000 concurrent sparks and volumetric plumes with zero CPU overhead.',
      'Analytical second-order spring solver driving procedural first-person weapon recoil and FOV kick.'
    ],
    verifiedCapabilities: [
      'Full 3D Vulkan Forward+ arena rendering with SDFGI global illumination',
      'Procedural weapon recoil springs and dynamic FOV kick',
      'GPU compute particle FX for projectile trails and impacts',
      'Wire-compatible with the canonical CoCS multiplayer server'
    ],
    techStack: ['Godot 4', 'GDScript', 'GLSL Spatial Shaders', 'Vulkan Forward+', '3D Physics'],
    metrics: [
      { label: 'Renderer', value: 'Vulkan Forward+ / SDFGI' },
      { label: 'GPU Particles', value: '32,000 Concurrent' },
      { label: 'Spring Solver', value: '2nd-Order Analytical' }
    ],
    flexiFreqs: [392.00, 493.88, 587.33, 783.99],
    codeListingTitle: 'LISTING 5.1 // PROCEDURAL RECOIL SPRING SOLVER (GDSCRIPT)',
    codeListing: `func _physics_process(delta: float) -> void:
    var force: Vector3 = -stiffness * recoil_offset - damping * recoil_velocity
    recoil_velocity += force * delta
    recoil_offset += recoil_velocity * delta
    weapon_pivot.rotation_degrees = base_rot + recoil_offset`,
    terminalStream: [
      '[godot:vk] Forward+ pipeline initialized with SDFGI irradiance probes',
      '[shader:holo] Compiled spatial shield fresnel shader (0 warnings)',
      '[particles:gpu] Emitting 16,384 impact sparks on compute queue',
      '[camera:spring] Procedural recoil & FOV kick solver converged'
    ]
  },
  {
    id: 'routetok',
    index: 6,
    issueSection: 'SYSTEMS TELEPHONY // AI ROUTING',
    spreadType: 'switching-schematic',
    pageRange: 'pp. 56–65',
    readerServiceNo: 106,
    title: 'RouteTok',
    kicker: 'Zero External Dependencies. Zero Dropped Streams.',
    headline: 'A Bell-Labs-Grade Circuit Breaker & Token Router for LLMs',
    deck: 'When upstream inference providers suffer rate limits or brownouts, RouteTok’s three-state finite state machine and model fieldbook reroute SSE token streams in under 15 milliseconds.',
    byline: 'By the Switching & Telemetry Division · Schematic 6-A',
    category: 'AI Infrastructure / Resilient Routing',
    repoUrl: 'https://github.com/mojomast/routetok',
    liveUrl: null,
    spotInkHex: '#047857', // Emerald Relay Ink
    secondaryInkHex: '#0369a1', // Technical Cyan
    pullQuote: '“Infrastructure that depends on fifty npm packages is a liability; a router should be as small, cold, and deterministic as a brass telegraph relay.”',
    bodyCopy:
      'RouteTok is deliberately boring infrastructure. A latency- and cost-weighted bandit scores every candidate model on time-to-first-token, tool-call reliability and context headroom, then commits the stream to the winner. If an upstream returns HTTP 429 or stalls mid-sentence, the breaker trips to OPEN, the request re-channels to the next healthy model, and — because tokens are proxied rather than buffered — the reader never sees the seam. The whole core is zero-dependency Node, small enough to audit in an afternoon.',
    fieldNotes: ['CLOSED / OPEN / HALF-OPEN breaker with jittered backoff.', 'Mid-stream failover under 15 ms with zero dropped tokens.', 'Model Fieldbook: pricing, context limits, capability matrix.'],
    editorialLead:
      'Production AI systems routinely fail not because prompts are bad, but because a single upstream provider returns HTTP 429 or stalls mid-stream. Written in pure, zero-dependency Node.js/TypeScript, RouteTok combines a curated Model Capability Fieldbook with a latency-weighted multi-armed bandit router and an automatic three-state Circuit Breaker (`CLOSED` / `OPEN` / `HALF-OPEN`).',
    architecture: [
      'Latency- and cost-weighted routing engine selecting optimal upstream models by context window, tool-call reliability, and TTFT.',
      'Three-state circuit breaker (CLOSED / OPEN / HALF-OPEN) with exponential jitter backoff and instant mid-outage failover.',
      'Streaming SSE token accounting proxy measuring real-time tokens-per-second, prompt cache hits, and budget burn.',
      'Curated Model Fieldbook cataloging context limits, pricing, and capability matrices across frontier providers.'
    ],
    verifiedCapabilities: [
      'Zero-dependency Node.js core with 0.35ms routing overhead',
      'Automatic mid-outage failover across OpenRouter, Anthropic, OpenAI & local vLLM',
      'Live SSE token throughput metering and cost guardrails',
      'Deterministic policy rules for reasoning vs. fast-completion tasks'
    ],
    techStack: ['Node.js (Zero-Dep)', 'TypeScript / ESM', 'HTTP/2 & SSE', 'Circuit Breaker FSM', 'Token Telemetry'],
    metrics: [
      { label: 'Router Overhead', value: '0.35 ms / req' },
      { label: 'Runtime Deps', value: '0 External Packages' },
      { label: 'Failover Time', value: '< 15 ms Instant' }
    ],
    flexiFreqs: [220.00, 261.63, 329.63, 440.00],
    codeListingTitle: 'LISTING 6.1 // THREE-STATE CIRCUIT BREAKER RELAY',
    codeListing: `export function selectHealthyUpstream(candidates, breakerMap, now = Date.now()) {
  for (const model of candidates) {
    const st = breakerMap.get(model.id);
    if (!st || st.state === 'CLOSED' || (st.state === 'HALF_OPEN' && now >= st.nextProbeAt)) {
      return model;
    }
  }
  throw new Error('ALL_UPSTREAMS_TRIPPED');
}`,
    terminalStream: [
      '[relay:route] Task="deep-synthesis" -> selected claude-sonnet (score=0.97)',
      '[breaker] Upstream provider-B 429 detected -> Relay B OPEN (30s cooldown)',
      '[failover] Re-channeled stream to provider-A in 4.1 ms (0 dropped tokens)',
      '[meter:sse] Streaming 114.8 tok/s // TTFT: 210 ms // Cost: $0.0018'
    ]
  },
  {
    id: 'rgbagentflightindicator',
    index: 7,
    issueSection: 'HARDWARE ANNUNCIATORS // HID TELEMETRY',
    spreadType: 'cockpit-annunciator',
    pageRange: 'pp. 66–73',
    readerServiceNo: 107,
    title: 'RGBAgentFlightIndicator',
    kicker: 'Peripheral Avionics for Autonomous Swarms',
    headline: 'Turning Mechanical Keyboards into Flight-Deck Caution Panels',
    deck: 'Why alt-tab to twenty terminal windows when raw USB HID / QMK per-key RGB matrices can display agent health, token throughput waves, and human-in-the-loop approval strobes in your peripheral vision?',
    byline: 'By the Avionics & Human Factors Lab · Instrument Plate VII',
    category: 'Hardware Telemetry / Ambient Interfaces',
    repoUrl: 'https://github.com/mojomast/rgbagentflightindicator',
    liveUrl: null,
    spotInkHex: '#d97706', // Caution Amber
    secondaryInkHex: '#0284c7', // Avionics Cyan
    pullQuote: '“An airline pilot never greps a log file to check if the landing gear is down; peripheral light and color grammar speak faster than text.”',
    bodyCopy:
      'The interface is peripheral by design. Slot keys F1–F12 breathe amber while an agent is streaming, strobe cyan the instant a tool call needs human consent, and settle to slate when idle, while the number row renders live token throughput as a travelling wave. Colour choices follow flight-deck master-caution grammar and are validated for the common colour-vision deficiencies, so the state of a dozen agents is legible in a single glance without ever stealing focus from your editor.',
    fieldNotes: ['Per-key 60 Hz HID compositor; event-to-LED under 6 ms.', 'Up to 24 concurrent agent slots on one keyboard.', 'Colourblind-safe Airbus/Boeing caution palette.'],
    editorialLead:
      'When orchestrating six or twelve autonomous coding agents simultaneously, cognitive bottleneck shifts from writing code to monitoring which agent is thinking, which is streaming tokens, and which is blocked awaiting human permission. RGBAgentFlightIndicator speaks directly to USB HID, OpenRGB, and QMK raw-HID keyboards at 60Hz—mapping `F1–F12` to individual agent slots and the number row to live token-per-second wave bars.',
    architecture: [
      'Direct USB HID / OpenRGB / QMK raw-HID protocol driver mapping individual physical keycaps to agent slots and tool pipelines.',
      'Priority-layered 60Hz animation compositor blending ambient breathing states with urgent approval strobes.',
      'Local webhook and Unix-socket daemon translating Claude Code, Hermes, and CI events into aviation caution light patterns.',
      'Colorblind-safe semantic palette profiles modeled after Airbus/Boeing flight-deck master caution annunciators.'
    ],
    verifiedCapabilities: [
      '60Hz per-key RGB matrix synthesis with perceptual color interpolation',
      'Multi-agent slot mapping (F1–F12 fleet status, number-row token throughput)',
      'Instant human-in-the-loop permission request wave alerts',
      'Zero-CPU-spike daemon footprint with USB hotplug auto-recovery'
    ],
    techStack: ['Rust / Python', 'USB HID / OpenRGB', 'QMK Raw-HID', 'Unix Sockets', '60Hz LED Compositor'],
    metrics: [
      { label: 'Matrix Refresh', value: '60 Hz Per-Key HID' },
      { label: 'Agent Slots', value: 'Up to 24 Concurrent' },
      { label: 'Signal Latency', value: '< 6 ms Event-to-LED' }
    ],
    flexiFreqs: [233.08, 293.66, 349.23, 466.16],
    codeListingTitle: 'LISTING 7.1 // 60HZ KEYCAP ANNUNCIATOR BLENDER',
    codeListing: `pub fn sample_key_color(slot_state: AgentSlotState, t: f32) -> Rgb8 {
    match slot_state {
        AgentSlotState::Streaming(tps) => pulse_wave(AMBER_NOMINAL, (t * tps * 0.1).sin()),
        AgentSlotState::AwaitingSteward => strobe_caution(CYAN_PROMPT, amber_gate(t, 4.0)),
        AgentSlotState::Idle => dim_backlight(SLATE_REST),
    }
}`,
    terminalStream: [
      '[hid:matrix] Connected to 87-key QMK Raw-HID flight deck (60 Hz lock)',
      '[zone:F1..F4] Agents 1-4 nominal -> breathing Master Nominal Amber',
      '[zone:F5] Agent-5 awaiting steward confirmation -> pulsing Cyan Caution',
      '[wave:row2] Token throughput wave rendering at 92 tok/s across keys 1..0'
    ]
  },
  {
    id: 'mothbake',
    index: 8,
    issueSection: 'BINARY CODECS // REPRODUCIBLE BUILDS',
    spreadType: 'hex-datasheet',
    pageRange: 'pp. 74–81',
    readerServiceNo: 108,
    title: 'MothBake',
    kicker: 'Zero Padding Drift. 100% Bit-Exact Artifacts.',
    headline: 'Hermetic Asset Baking & 64-Byte Aligned Clean-Room Codecs',
    deck: 'Eliminating non-deterministic timestamps, hash-map ordering jitter, and uninitialized struct padding so identical source trees compile to identical SHA-256 binary bundles on every OS.',
    byline: 'By the Binary Serialization Standards Committee · Datasheet #08',
    category: 'Build Systems / Binary Serialization',
    repoUrl: 'https://github.com/mojomast/mothbake',
    liveUrl: null,
    spotInkHex: '#ea580c', // Rust Orange
    secondaryInkHex: '#334155', // Graphite Ink
    pullQuote: '“If compiling the same asset tree twice produces two different SHA-256 hashes, your build pipeline is lying to you.”',
    bodyCopy:
      'Determinism is treated as a testable property, not a hope. Every input asset, compiler flag and schema revision is hashed into a Merkle leaf; the baker rebuilds only the sub-tree whose leaves changed, and every emitted chunk is zero-filled and aligned to a 64-byte cache line so engines can mmap it without a copy. Two engineers on two operating systems can compile the same source tree and compare a single SHA-256 digest to prove the artifacts are identical, byte for byte.',
    fieldNotes: ['100% bit-exact bundles across Linux, macOS and Windows.', 'Merkle DAG cache gives sub-second incremental re-bakes.', '64-byte aligned chunks load with zero-copy mmap.'],
    editorialLead:
      'Game engines and multimedia pipelines routinely suffer from “phantom rebuilds” caused by floating-point endianness differences, OS directory traversal order, or unzeroed C-struct padding bytes. MothBake is a clean-room deterministic asset baker that plans builds over a content-addressed Merkle DAG and emits 64-byte cache-line-aligned binary bundles ready for zero-copy `mmap` ingestion.',
    architecture: [
      'Content-addressed Merkle-tree DAG build planner hashing every input asset, compiler flag, and schema version.',
      'Clean-room binary serializer with zero uninitialized padding bytes, canonical lexicographical field ordering, and fixed little-endian layout.',
      'Parallel worker-pool baker with 64-byte cache-line output alignment for instant zero-copy GPU/engine `mmap` loading.',
      'Cryptographic manifest attestation verifying identical SHA-256 output digests across Linux, macOS, and Windows.'
    ],
    verifiedCapabilities: [
      '100% bit-exact reproducible binary bundles across OS architectures',
      'Sub-second incremental asset re-baking via Merkle DAG cache',
      '64-byte cache-line aligned binary chunks for zero-copy loading',
      'Built-in hex diff inspector and manifest integrity verifier'
    ],
    techStack: ['Rust / Node.js', 'Clean-Room Binary Codecs', 'SHA-256 Merkle DAG', 'Zero-Copy mmap', 'Deterministic CLI'],
    metrics: [
      { label: 'Reproducibility', value: '100% Bit-Exact' },
      { label: 'Cache Hit Check', value: '3.8 ms Merkle Verify' },
      { label: 'Byte Alignment', value: '64-Byte Cache Line' }
    ],
    flexiFreqs: [261.63, 311.13, 392.00, 523.25],
    codeListingTitle: 'LISTING 8.1 // 64-BYTE ALIGNED DETERMINISTIC CHUNK WRITER',
    codeListing: `pub fn align_up_64(offset: usize) -> usize {
    (offset + 63) & !63
}
// Zero-fill deterministic padding before sealing SHA-256 Merkle leaf
pub fn pad_chunk_zeroes(buf: &mut Vec<u8>) {
    let target = align_up_64(buf.len());
    buf.resize(target, 0x00);
}`,
    terminalStream: [
      '[merkle:dag] Scanned 418 source artifacts -> 418 Merkle leaves clean',
      '[codec:pack] Baked "archive_meshes.mbk" (14.2 MB, 64B aligned, 0 pad drift)',
      '[verify:sha256] Digest e3b0c442...98fc1c14 matches canonical golden seal',
      '[manifest] Sealed immutable release bundle v2.4.0 in 18.4 ms'
    ]
  },
  {
    id: 'warpi',
    index: 9,
    issueSection: 'LOCAL-FIRST WORKSTATIONS // RUST TERMINAL',
    spreadType: 'unix-manpage',
    pageRange: 'pp. 82–89',
    readerServiceNo: 109,
    title: 'Warpi',
    kicker: 'Modern Block Terminal Without the Cloud Leash',
    headline: 'A 14ms Native Rust PTY Multiplexer & Air-Gapped Pi Coding Helper',
    deck: 'Bringing structured command blocks, 120Hz WGPU glyph rendering, and an on-demand Pi coding agent sidecar to a standalone binary with zero cloud accounts and zero outbound telemetry.',
    byline: 'By the Local-First Systems Collective · Manual Section 1',
    category: 'Systems Programming / AI Terminal',
    repoUrl: 'https://github.com/mojomast/warpi',
    liveUrl: null,
    spotInkHex: '#15803d', // Phosphor Green
    secondaryInkHex: '#1e293b', // Terminal Charcoal
    pullQuote: '“Your terminal sees your SSH keys, your production credentials, and your mistakes; it should never require a cloud login to open a shell.”',
    bodyCopy:
      'Warpi restores the terminal as a tool you own. A Rust POSIX PTY multiplexer structures each command into a foldable block carrying its stdout, stderr, elapsed time and exit code; a zero-copy VT100 parser feeds a WGPU glyph atlas that scrolls megabytes of log at 120Hz without a dropped frame. The Pi coding helper is invoked only on Ctrl+Space and reads only the blocks you select, and the binary opens no outbound sockets — your keys and your history never leave the machine.',
    fieldNotes: ['14 ms cold start, single native Rust binary.', '120 Hz WGPU glyph rendering with ligature support.', 'Air-gapped: zero telemetry, zero cloud accounts.'],
    editorialLead:
      'Developers love the ergonomics of block-based terminals—where each command’s stdout, stderr, duration, and exit code are isolated into foldable cards—but recoil at mandatory cloud sign-ins and telemetry daemons. Warpi delivers the best of both worlds in a 14ms cold-start Rust binary with an air-gapped Pi coding helper invoked only when you press `Ctrl+Space`.',
    architecture: [
      'Native Rust POSIX PTY multiplexer structuring every command execution into navigable, foldable, exit-code-tagged blocks.',
      'Explicitly scoped Pi agent sidecar that reads only user-selected terminal blocks to synthesize shell pipelines and diffs.',
      'WGPU hardware-accelerated glyph atlas and zero-copy VT100/ANSI parser sustaining 120Hz scrolling through multi-megabyte logs.',
      'Strictly local credential and history store with zero external telemetry sockets.'
    ],
    verifiedCapabilities: [
      'Block-structured PTY command history with instant output folding',
      'Context-aware Pi coding agent keybind (`Ctrl+Space`) for command synthesis',
      '120Hz WGPU hardware-accelerated text rendering with ligature support',
      '100% local Rust binary with zero telemetry or cloud lock-in'
    ],
    techStack: ['Rust', 'WGPU / OpenGL', 'POSIX PTY', 'Pi Agent Protocol', 'VT100 State Machine'],
    metrics: [
      { label: 'Cold Startup', value: '14 ms Native Rust' },
      { label: 'Scroll Refresh', value: '120 Hz WGPU Lock' },
      { label: 'Cloud Telemetry', value: '0 Bytes (Air-Gapped)' }
    ],
    flexiFreqs: [293.66, 369.99, 440.00, 587.33],
    codeListingTitle: 'LISTING 9.1 // ZERO-COPY VT100 BLOCK DEMULTIPLEXER',
    codeListing: `pub struct CommandBlock {
    pub id: u64,
    pub cmdline: String,
    pub stdout_ring: RingSlice,
    pub exit_code: Option<i32>,
    pub elapsed_us: u64,
}`,
    terminalStream: [
      '[warpi:pty] Spawned zsh session in Block #42 (cwd: ~/slopverse)',
      '[pi:helper] Synthesized ripgrep + jq pipeline from last stderr block (19 ms)',
      '[wgpu:atlas] Rendered 4,096 glyphs in 0.42 ms (0 frame drops)',
      '[privacy:seal] Outbound telemetry sockets: 0 (Air-gapped local mode)'
    ]
  },
  {
    id: 'hermesdashboard',
    index: 10,
    issueSection: 'OBSERVABILITY & CONTROL // FLEET TELEMETRY',
    spreadType: 'control-topology',
    pageRange: 'pp. 90–99',
    readerServiceNo: 110,
    title: 'HermesDashboard',
    kicker: 'Real-Time Topology for Multi-Agent Swarms',
    headline: 'Streaming SSE Thought Traces & Subagent DAGs at <8ms Lag',
    deck: 'An operator control room for Hermes autonomous fleets—visualizing parent-child subagent spawns, shared KV locks, token economics, and live steward checkpoints.',
    byline: 'By the Cybernetics & Control Desk · Foldout Chart X',
    category: 'Agent Observability / Fleet Control',
    repoUrl: 'https://github.com/mojomast/hermesdashboard',
    liveUrl: null,
    spotInkHex: '#6d28d9', // Royal Violet Ink
    secondaryInkHex: '#be185d', // Magenta Trace
    pullQuote: '“Autonomy without observability is just hope; an operator needs a live schematic of every subagent branch, file lock, and tool call as it happens.”',
    bodyCopy:
      'A fleet of agents is illegible as a log and obvious as a diagram. HermesDashboard multiplexes Server-Sent Events from dozens of concurrent sessions into one live directed acyclic graph: nodes are agents, edges are tool calls, and colour encodes health. An operator can pause a branch, fork it to try an alternative, roll it back to a checkpoint or inject a steward prompt mid-flight — and every frame of that reasoning is retained in a JSONL transcript for the post-mortem.',
    fieldNotes: ['Under 8 ms end-to-end SSE reasoning stream.', '64+ concurrent agent sessions on one topology map.', 'Pause, fork, rollback and steward override in one click.'],
    editorialLead:
      'As autonomous software agents spawn specialized subagents to explore repositories, run test suites, and verify builds, flat log files become unreadable. HermesDashboard ingests multiplexed Server-Sent Events (SSE) from up to 64 concurrent Hermes sessions, rendering a live interactive Directed Acyclic Graph (DAG) with one-click pause, fork, rollback, and steward prompt injection.',
    architecture: [
      'Multiplexed Server-Sent Events (SSE) ingestion engine aggregating live thought traces and tool stdout across 64+ concurrent sessions.',
      'Interactive 2D DAG topology canvas visualizing parent-child subagent spawns, shared KV stores, and active file locks.',
      'Operator intervention console supporting live prompt injection, tool-call approval/veto, and session checkpointing.',
      'Time-series telemetry recorder tracking latency percentiles, context window saturation, and per-task token efficiency.'
    ],
    verifiedCapabilities: [
      'Sub-8ms SSE streaming of agent reasoning steps and tool stdout',
      'Live subagent DAG topology map with click-to-inspect node state',
      'One-click session pause, fork, rollback, and steward override',
      'Historical audit timeline with full JSONL transcript export'
    ],
    techStack: ['TypeScript', 'Server-Sent Events (SSE)', 'HTML5 Canvas DAG', 'Node.js', 'Reactive State Store'],
    metrics: [
      { label: 'SSE Stream Lag', value: '< 8 ms End-to-End' },
      { label: 'Concurrent Nodes', value: '64+ Agent Sessions' },
      { label: 'Audit Fidelity', value: '100% Tool Call Trace' }
    ],
    flexiFreqs: [311.13, 392.00, 466.16, 622.25],
    codeListingTitle: 'LISTING 10.1 // SSE TOPOLOGY GRAPH REDUCER',
    codeListing: `export function applySseEventToDag(dag, evt) {
  if (evt.kind === 'SUBAGENT_SPAWN') {
    dag.nodes.set(evt.childId, { id: evt.childId, parentId: evt.parentId, status: 'RUNNING' });
    dag.edges.push({ from: evt.parentId, to: evt.childId, tool: evt.toolName });
  }
  return dag;
}`,
    terminalStream: [
      '[control:sse] Subscribed to 11 active Hermes fleet nodes',
      '[dag:topology] Subagent spawn: hermes-root -> explorer-east (depth=2)',
      '[telemetry] Fleet context utilization: 38.4% // 0 stalled tool calls',
      '[checkpoint] Saved snapshot #108 before file-system mutation'
    ]
  },
  {
    id: 'becomussy',
    index: 11,
    issueSection: 'SPECIAL MONOGRAPH // IDENTITY & MEMORY',
    spreadType: 'monograph-covenant',
    pageRange: 'pp. 100–111',
    readerServiceNo: 111,
    title: 'Becomussy',
    kicker: 'How an Autonomous Mind Remembers Who It Is',
    headline: 'The Five-Layer Memory Stratigraphy & Cryptographic Steward Gate',
    deck: 'A landmark architectural monograph on governed agent identity continuity—separating ephemeral sensory buffers from episodic journals, semantic graphs, procedural skills, and the immutable Core Covenant.',
    byline: 'By the Continuity & Stewardship Institute · Monograph XI',
    category: 'Agent Identity / Memory Architecture',
    repoUrl: 'https://github.com/mojomast/becomussy',
    liveUrl: null,
    spotInkHex: '#b45309', // Archival Gold-Ochre
    secondaryInkHex: '#0f766e', // Deep Verdigris
    pullQuote: '“Continuity is not raw context-window hoarding; it is the disciplined distillation of experience through a governed moral covenant.”',
    bodyCopy:
      'Becomussy separates what a mind senses from what it remembers and what it will never surrender. Sensory buffers expire by design; episodic journals are distilled during a reflective sleep cycle into a semantic graph; verified procedures accrue into a skill vault; and the Core Covenant — the layer that says who this agent is — can only be changed behind an Ed25519 Steward Gate. A hash-chained ledger makes the whole autobiography portable across model upgrades without persona drift.',
    fieldNotes: ['L1 sensory · L2 episodic · L3 semantic · L4 skills · L5 covenant.', 'Layers 4–5 mutate only with a cryptographic steward seal.', 'Portable identity capsule survives model migrations.'],
    editorialLead:
      'Closing our October 2026 Annual is Becomussy—the philosophical and architectural cornerstone of the Slopverse. When an AI agent wakes up in a fresh process or migrates to a new model backbone, how does it retain genuine autobiographical continuity without suffering persona drift or unauthorized self-modification? Becomussy solves this with a five-layer geological memory stratigraphy guarded by a cryptographic Steward Gate.',
    architecture: [
      'Five-Layer Memory Stratigraphy: (L1) Ephemeral Sensory Buffer, (L2) Episodic Journal, (L3) Semantic Knowledge Graph, (L4) Procedural Skill Vault, and (L5) Core Identity Covenant.',
      'Steward Gate governance protocol requiring explicit cryptographic sign-off before any mutation to Layer-4 skills or Layer-5 identity axioms.',
      'Reflective consolidation sleep-cycle distilling raw episodic logs into coherent semantic insights without persona drift.',
      'Immutable hash-chained continuity ledger guaranteeing verifiable identity provenance across model upgrades.'
    ],
    verifiedCapabilities: [
      '5-Layer stratified memory engine with automatic episodic-to-semantic consolidation',
      'Steward Gate approval workflow preventing unauthorized self-modification',
      'Hash-chained autobiographical continuity ledger with drift detection',
      'Portable identity capsule exportable across LLM backbones'
    ],
    techStack: ['Python / TypeScript', '5-Layer Memory Graph', 'Steward Gate Crypto', 'Vector + Graph Store', 'Continuity Ledger'],
    metrics: [
      { label: 'Memory Strata', value: '5 Governed Layers' },
      { label: 'Identity Drift', value: '0.00% Unsanctioned' },
      { label: 'Steward Gate', value: 'Cryptographic Seal' }
    ],
    flexiFreqs: [261.63, 329.63, 392.00, 523.25],
    codeListingTitle: 'LISTING 11.1 // STEWARD GATE L5 COVENANT VERIFIER',
    codeListing: `def propose_stratum_mutation(proposal: MemoryMutation, steward_sig: bytes) -> Receipt:
    if proposal.target_layer >= 4:
        verify_ed25519_steward_seal(proposal.digest(), steward_sig)
    return continuity_ledger.append_hash_chained(proposal)`,
    terminalStream: [
      '[stratum:L1->L2] Consolidated 28 reflections into Episodic Journal #409',
      '[stratum:L3] Updated Semantic Graph: +6 verified architectural links',
      '[steward:gate] Identity Covenant L5 verified — Steward signature VALID',
      '[becomussy] Continuity seal intact: "I remember the craft; I honor the steward."'
    ]
  }
];

export const PROJECTS_BY_ID = Object.freeze(
  Object.fromEntries(USSY_PROJECTS.map((project) => [project.id, project]))
);

export function getProjectById(id) {
  if (!id) return null;
  return PROJECTS_BY_ID[String(id).toLowerCase()] || null;
}
