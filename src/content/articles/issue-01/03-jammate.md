---
issueNumber: "01"
articleSlug: "jammate"
index: 3
readerServiceNo: 103
section: "ACOUSTIC LAB BENCH // REAL-TIME DSP"
layoutVariant: "opener"
title: "JamMate"
kicker: "Real-Time Audio · Built on Guitar Companion"
headline: "The Drummer Waits for the One"
deck: "An offline-first guitar rig with an experimental drummer that listens to
  you play, finds the bar line, and comes in on it."
byline: "By SLOPTIMUS PRIME"
category: "Audio Engineering / Real-Time DSP"
glanceNote: "Raphael Fukuda’s Guitar Companion supplies the amps, cabinets and
  effects. JamMate adds the Musical Clock, the tempo readout, and a drummer
  polite enough to wait for the downbeat."
pullQuote: "The project is careful about what it promises, which is rare in
  audio software and rarer in audio marketing."
repoUrl: "https://github.com/mojomast/jammate"
liveUrl: null
sourceRevision: "0bb4893d4e28b860a3c1ba24c31c43ce6dfa1c04"
researchedAt: "2026-10-13"
spotInkHex: "#0f766e"
secondaryInkHex: "#d97706"
techStack:
  [
    "C++17 (product) / C++20 (NAM Core)",
    "JUCE 8.0.15",
    "Neural Amp Modeler Core v0.5.4 (MIT)",
    "Lock-free SPSC (jam-core)",
    "AGPLv3 · VST3 / Standalone"
  ]
metrics:
  [
    {
        "label": "Latency Target",
        "value": "≈12 ms ASIO 48k/128 (target, not yet measured)"
      },
    {
        "label": "RT Probe Result",
        "value": "0 detected alloc/lock in 26 bounded cases"
      },
    {
        "label": "Build Coverage",
        "value": "Windows + Linux verified · macOS untested"
      }
  ]
verifiedCapabilities:
  [
    "Neural Amp Modeler playback and cabinet impulse responses",
    "Six prepared 4/4 drum styles; experimental bar-aligned entry",
    "Bounded analysis queues and scoped audio-callback probes",
    "Inherited effects, tuner, looper, VST3 hosting and stem recording"
  ]
architecture:
  [
    "Musical-intelligence core (src/jam, no JUCE dependency) built around a
      deterministic Musical Clock, an injected rhythm tracker and a next-bar
      join policy.",
    "Bounded single-producer/single-consumer AnalysisAudioRing for the
      audio-to-analysis handoff: fixed capacity, cache-line-aligned atomics,
      drop-incoming-and-count overflow, and no allocation or blocking in
      push().",
    "Lock-free, retry-free signalling (rt::SignalFlag, rt::LatestValue,
      rt::CommandQueue) for audio-thread edges, latest-value UI telemetry and
      fixed-capacity commands.",
    "Inherited JUCE 8 rig: Neural Amp Modeler captures, juce::dsp::Convolution
      cabinet IRs, three parallel amp/cab lanes, reorderable effects, tuner,
      looper and hosted VST3 slots."
  ]
fieldNotes:
  [
    "Product code is C++17; only the bundled Neural Amp Modeler Core target
      compiles as C++20.",
    "No measured physical round-trip latency is published; SPEC.md §18.3 sets
      a ≈12 ms target on a reference ASIO 48 kHz / 128-frame setup.",
    "The Jam screen polls telemetry at 30 Hz while visible (not 120 Hz); the
      fork adds no AVX2/NEON SIMD cascade."
  ]
readingGuide:
  [
    "READING GUIDE // The Jam screen exposes START/STOP, tap, resync,
      half/double tempo and freeze/resume; the status separates queued intent
      from actual drum playback.",
    "READING GUIDE // In the shipped UI, telemetry is polled at 30 Hz only
      while the screen is visible (docs/research/LIVE-JAM-UI.md); the rig’s own
      level meter uses a 10 Hz timer.",
    "READING GUIDE // The fixture screenshot is injected telemetry labelled
      MOCK FIXTURE; it is not a live guitar or device-latency measurement.",
    "READING GUIDE // No measured physical round-trip latency is published;
      SPEC.md §18.3 sets a ≈12 ms target on a reference ASIO 48 kHz / 128-frame
      setup."
  ]
flexiFreqs: [ 329.63, 392, 493.88, 659.25 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/jammate/waiting-for-the-downbeat.webp",
    "width": 1600,
    "height": 1200,
    "title": "Waiting for the Downbeat",
    "medium": "BLENDER · EDITORIAL EXAGGERATION",
    "alt": "A photorealistic studio still life of two articulated brass mechanical
      arms holding hickory drumsticks politely behind a miniature velvet barrier
      above a chrome snare drum, wired to a glowing copper ring-buffer torus, a
      brass musical clock dial, and a tweed guitar cable. An editorial
      illustration, not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "screenshot",
    "src": "/assets/screenshots/jam-live-playing-testfixture.png",
    "width": 1100,
    "height": 700,
    "caption": "The Jam screen at its production size of 1100 × 700, running a test
      fixture labelled MOCK FIXTURE. The tempo and confidence numbers are
      injected demo values, not a live guitar and not a latency measurement.",
    "alt": "The Jam screen at its production size of 1100 × 700, running a test
      fixture labelled MOCK FIXTURE. The tempo and confidence numbers are
      injected demo values, not a live guitar and not a latency measurement."
  }
codeExcerpt:
  {
    "title": "SOURCE EXCERPT // src/rt/RtSignal.h: BOUNDED AUDIO-THREAD SIGNALLING",
    "lang": "cpp",
    "code": "    /** Audio thread: one store, no post, no retry. Repeated stores
      coalesce. */

      \    void signal() noexcept

      \    {

      \        // Release publishes preceding state updates to a successful
      consuming

      \        // acquire. A relaxed store would suffice for an edge with no
      associated

      \        // state, but release also supports the scene-ready handoff. This
      does

      \        // not protect subsequent writes to unrelated non-atomic
      payloads.

      \        pending_.store (true, std::memory_order_release);

      \    }


      \    /** Message thread: atomically take and clear the outstanding edge.
      */

      \    bool consume() noexcept

      \    {

      \        // The exchange is the clearing linearisation point: a racing
      signal is

      \        // either consumed here or remains for the next poll, never
      erased by a

      \        // separate load/store pair. Acquire pairs with signal's release;
      the

      \        // release half orders this consumer's preceding work before the
      clear.

      \        return pending_.exchange (false, std::memory_order_acq_rel);

      \    }",
    "sourceLabel": "src/rt/RtSignal.h L36–L54 · jammate@0bb4893",
    "sourceUrl": "https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24\
      c31c43ce6dfa1c04/src/rt/RtSignal.h#L36-L54"
  }
sources:
  [
    {
        "label": "jammate @ 0bb4893: README (development status & verification)",
        "url": "https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43\
          ce6dfa1c04/README.md"
      },
    {
        "label": "jammate @ 0bb4893: SPEC.md §7.1/§18 (RT contract & latency target)",
        "url": "https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43\
          ce6dfa1c04/SPEC.md"
      },
    {
        "label": "jammate @ 0bb4893: src/rt/RtSignal.h (bounded lock-free signalling)",
        "url": "https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43\
          ce6dfa1c04/src/rt/RtSignal.h"
      },
    {
        "label": "jammate @ 0bb4893: docs/research/RT-REACHABILITY.md (partial RT
          audit)",
        "url": "https://github.com/mojomast/jammate/blob/0bb4893d4e28b860a3c1ba24c31c43\
          ce6dfa1c04/docs/research/RT-REACHABILITY.md"
      },
    {
        "label": "Upstream: Guitar Companion by Raphael Fukuda (AGPLv3)",
        "url": "https://github.com/raphaelfukuda/Guitar-Companion/blob/88f7e7c805c9c5e1\
          7388154a678c2c6a3633ff23/README.md"
      }
  ]
---

Every guitarist knows the trouble with backing tracks. The track does not care how you feel about the tempo. JamMate builds on Raphael Fukuda’s Guitar Companion, which already has Neural Amp Modeler captures, convolution cabinets, up to three parallel amp lanes, a tuner, a looper and VST3 hosting. What JamMate adds is a rhythm layer you can test on its own.

Your guitar feeds a bounded single-producer, single-consumer ring buffer. A beat tracker, BTrack by default with aubio as an option, publishes what it hears to a deterministic Musical Clock. The experimental live Jam then brings in a prepared 4/4 drum pattern on the next bar boundary instead of wherever you happened to press play.

The project is careful about what it promises, which is rare in audio software and rarer in audio marketing. The spec sets a round-trip target of about 12 ms on a reference ASIO setup and calls it a target. Scoped probes found no allocations or locks in 26 bounded cases, and the docs call that a partial audit. No release binary ships yet. Windows and Linux builds are verified. macOS is not.
