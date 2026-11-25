---
issueNumber: "01"
articleSlug: "rgbagentflightindicator"
index: 7
readerServiceNo: 107
section: "HARDWARE ANNUNCIATORS // HID TELEMETRY"
layoutVariant: "dossier"
title: "RGBAgentFlightIndicator"
kicker: "Hardware · One Key Per Agent"
headline: "Your Keyboard Is Now Air Traffic Control"
deck: "A Python daemon that gives every agent session its own lamp. Green means
  working, white means done, blinking red means somebody needs you."
byline: "By SLOPTIMUS PRIME"
category: "Hardware Telemetry / Ambient Interfaces"
glanceNote: "Twelve lanes by default, mapped onto each keyboard’s own lamps. Two
  backends are verified on real hardware. The rest are written to their
  documented protocols and labelled that way."
pullQuote: "If you run more than two agents at once, you eventually become a
  person who alt-tabs for a living."
repoUrl: "https://github.com/mojomast/rgbagentflightindicator"
liveUrl: null
sourceRevision: "fc7378d037576c090322e623a5a3bbeafb97d619"
researchedAt: "2026-10-13"
spotInkHex: "#d97706"
secondaryInkHex: "#0284c7"
techStack:
  [
    "Python 3.10+",
    "HTTP / SSE",
    "USB HID (hidapi)",
    "QMK / VIA",
    "OpenRGB SDK",
    "MQTT / OTLP"
  ]
metrics:
  [
    { "label": "Default Lanes", "value": "12 (configurable)" },
    { "label": "Verified Backends", "value": "Sinowealth · EVision" },
    { "label": "State Palette", "value": "Green / White / Blinking Red" }
  ]
verifiedCapabilities:
  [
    "Per-key lane mapping on Sinowealth and EVision hardware verified by the
      author",
    "Four states (working / done / blocked / error) rendered as green, white
      and blinking red",
    "Local HTTP session API plus MQTT, OTLP and Home Assistant reach",
    "Hotplug recovery: the daemon notices a replug, reopens the device and
      repaints"
  ]
architecture:
  [
    "Python HTTP daemon (default `127.0.0.1:8730`) with one lane per agent
      session; lanes are held until released or evicted least-recently-used.",
    "Backend registry spanning Sinowealth, EVision, OpenRGB, sysfs, QMK/VIA,
      HID LampArray, SteelSeries GameSense, WLED and HTTP single-light devices
      behind one write interface.",
    "Bounded LED vocabulary, off / steady / blink / breathe with period, duty
      and cycle count, rendered identically by the daemon and the browser
      preview, and checked against a shared fixture.",
    "Web configuration UI (lamp map, overrides, lane mapping) plus
      hook/webhook ingest and integrations for Claude Code, Gemini CLI, Pi,
      LangGraph, CrewAI, OpenAI Agents and more.",
    "Reach layered on the panel: ack, an attention notifier, MQTT with Home
      Assistant discovery, an OTLP/HTTP receiver, and a bounded transition
      history with `rgi digest`."
  ]
fieldNotes:
  [
    "Default 12 lanes (`--count`), configurable; each device maps lanes to its
      own lamp indices.",
    "Verified on hardware: Sinowealth 258A:0049 and the EVision/SONiX Magic
      Refiner MK 17.",
    "QMK is per-key on Vial firmware; stock QMK+VIA exposes one colour.",
    "The web UI ships a colour-blind-safe preset and
      protanopia/deuteranopia/tritanopia simulation; the default palette is
      green/white/red."
  ]
readingGuide:
  [
    "READING GUIDE // README.md: one key per session; green / white / blinking
      red",
    "READING GUIDE // README.md backend table: Sinowealth and EVision verified
      on hardware; QMK, OpenRGB and sysfs not yet run on a board",
    "READING GUIDE // rgi/daemon.py: TICK = 0.12 s render interval; only
      changed frames are written",
    "READING GUIDE // rgi/webui/lib/color.js and views/appearance.js:
      colour-blind simulation and preset, not the default palette",
    "NOTE // no 60 Hz refresh, 24-slot limit, 6 ms latency or
      colour-blind-validated default palette is claimed by the project"
  ]
flexiFreqs: [ 233.08, 293.66, 349.23, 466.16 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/rgbagentflightindicator/peripheral-vision-control-tow\
      er.webp",
    "width": 1600,
    "height": 1200,
    "title": "Peripheral-Vision Control Tower",
    "medium": "BLENDER · EDITORIAL EXAGGERATION",
    "alt": "A photorealistic studio still life of an over-engineered brass and
      black-enamel cockpit annunciator housing four oversized mechanical
      keycaps, dark obsidian idle, glowing emerald working, frosted alabaster
      done, and a ruby-red blocked key crowned with a miniature lighthouse
      beacon under a poised porcelain hand. An editorial illustration, not a
      product screenshot."
  }
secondaryMedia:
  {
    "kind": "svg-study",
    "studyId": "rgbagentflightindicator",
    "width": 640,
    "height": 360,
    "caption": "The four lamp states in the default palette. Your keyboard may vary,
      and the README tells you how."
  }
codeExcerpt:
  {
    "title": "LISTING 7.1 // SOURCE EXCERPT: BOUNDED LED STATE RENDERER
      (rgi/appearance.py)",
    "lang": "python",
    "code": "    def render(self, elapsed_s: float, quiet: bool = False) -> RGB:

      \        base = _scale(self.color, self.brightness)

      \        if self.pattern == \"off\" or base == OFF:

      \            return OFF

      \        if quiet or self.pattern == \"steady\":

      \            # While the human types the frame holds a steady colour: no
      writes,

      \            # and nothing to gain from computing a phase nobody will see.

      \            return base

      \        period = max(0.04, self.period_ms / 1000.0)

      \        if self.cycles and elapsed_s >= self.cycles * period:

      \            return base if self.then == \"steady\" else OFF

      \        phase = (max(0.0, elapsed_s) % period) / period

      \        if self.pattern == \"blink\":

      \            return base if phase < max(0.0, min(1.0, self.duty)) else OFF

      \        if self.pattern == \"breathe\":

      \            level = 0.5 - 0.5 * cos(2.0 * pi * phase)

      \            return _scale(base, max(1, int(level * 255 + 0.5)))

      \        return base",
    "sourceLabel": "rgi/appearance.py L60–L77 · rgbagentflightindicator@fc7378d",
    "sourceUrl": "https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d0\
      37576c090322e623a5a3bbeafb97d619/rgi/appearance.py#L60-L77"
  }
sources:
  [
    {
        "label": "rgbagentflightindicator README: states, backends and verification
          status",
        "url": "https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c\
          090322e623a5a3bbeafb97d619/README.md"
      },
    {
        "label": "rgi/appearance.py: bounded LED vocabulary and state renderer",
        "url": "https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c\
          090322e623a5a3bbeafb97d619/rgi/appearance.py"
      },
    {
        "label": "rgi/daemon.py: render tick, frame-diff writes and hotplug recovery",
        "url": "https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c\
          090322e623a5a3bbeafb97d619/rgi/daemon.py"
      },
    {
        "label": "rgi/webconfig.py: default green / white / red palette",
        "url": "https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c\
          090322e623a5a3bbeafb97d619/rgi/webconfig.py"
      },
    {
        "label": "rgi/webui/lib/color.js: protanopia / deuteranopia / tritanopia
          simulation",
        "url": "https://github.com/mojomast/rgbagentflightindicator/blob/fc7378d037576c\
          090322e623a5a3bbeafb97d619/rgi/webui/lib/color.js"
      }
  ]
---

If you run more than two agents at once, you eventually become a person who alt-tabs for a living. RGBAgentFlightIndicator moves the status board to the one surface you are already staring at. Each agent session claims a lane, each lane gets a key, and the colours carry the news: green while it works, white when it is done, blinking red when it needs a human, dark when idle.

Agents report over a local HTTP API, so a plugin, a CI job or a shell script can light a key. There are integrations for Claude Code, Gemini CLI, Pi, LangGraph, CrewAI and others, plus MQTT with Home Assistant discovery for people whose houses are also agents now.

What makes it trustworthy is the hardware table. The Sinowealth and EVision backends were verified on real boards by the author. OpenRGB, sysfs and QMK/VIA follow their documented protocols but have not yet run against a physical board, and the README says exactly that. Boards that can’t light individual keys show the most urgent lane across the whole device instead of pretending. The daemon only writes when a frame changes, which your USB bus will appreciate.
