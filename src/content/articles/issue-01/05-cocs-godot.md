---
issueNumber: "01"
articleSlug: "cocs-godot"
index: 5
readerServiceNo: 105
section: "GRAPHICS PIPELINE // NATIVE GODOT PORT"
layoutVariant: "dossier"
title: "CoCS-Godot"
kicker: "Native Client · Godot 4.5"
headline: "Same Fight, New Body"
deck: "A native Godot 4.5 client for CoCS. Godot handles the hands, the eyes and
  the ears. The original Node.js server still decides what happened."
byline: "By SLOPTIMUS PRIME"
category: "Godot Port / Real-Time Rendering"
glanceNote: "A playable prototype with separate labs for particles, shaders and
  materials. It targets Godot’s GL Compatibility renderer, and the four-chapter
  Quiet Relay campaign runs against a bundled local Node server."
pullQuote: "The server cannot tell which front end just connected, which is the point."
repoUrl: "https://github.com/mojomast/cocs-godot"
liveUrl: null
sourceRevision: "1f1e5f5486904f5d08a9768bc0321fb82b647e76"
researchedAt: "2026-10-13"
spotInkHex: "#2563eb"
secondaryInkHex: "#7c3aed"
techStack:
  [
    "Godot 4.5",
    "GDScript",
    "GDShader (.gdshader)",
    "GL Compatibility renderer",
    "Node.js authoritative server"
  ]
metrics:
  [
    { "label": "Renderer", "value": "Godot 4.5 · GL Compatibility" },
    { "label": "Particle Lab", "value": "8K–1M selectable (32K default)" },
    { "label": "Authority", "value": "Bundled Node.js server" }
  ]
verifiedCapabilities:
  [
    "Native Godot 4.5 client wired to the original authoritative simulation",
    "Speaks the same JSON WebSocket protocol as the canonical CoCS server",
    "Exact closed-form spring motion for recoil, sway and landing",
    "Particle, shader and material labs with selectable counts and measured
      cadence"
  ]
architecture:
  [
    "Native Godot 4.5 client connecting over WebSocketPeer to the original
      authoritative Node.js simulation, which retains ownership of movement,
      weapons, damage and objectives.",
    "Presentation-only motion: motion_math.gd solves an exact critically
      damped spring in closed form (no Euler integration) for recoil recovery,
      sway and landing response.",
    "Standalone particle lab with selectable 8K/32K/128K/512K/1M counts across
      GPU and analytic backends, reporting measured frame cadence.",
    "GL Compatibility rendering with custom .gdshader material, shield and
      weapon-effect labs; the Quiet Relay campaign runs against a bundled local
      Node server."
  ]
fieldNotes:
  [
    "Status: actively developed, playable prototype.",
    "No Vulkan Forward+ or SDFGI; the project targets the GL Compatibility
      renderer.",
    "The Node.js simulation stays authoritative; Godot is the client."
  ]
readingGuide:
  [
    "Renderer: godot/project.godot sets rendering_method to gl_compatibility;
      no SDFGI or Forward+ references exist in the tree.",
    "Protocol: godot/net/client.gd uses
      WebSocketPeer.send_text(JSON.stringify(frame)): the same JSON wire as
      CoCS.",
    "Particle lab: godot/particle_lab/field.gd exposes counts [8192, 32768,
      131072, 524288, 1048576] across GPU and analytic backends.",
    "Campaign: port/campaign/PLAY.md launches The Quiet Relay against a
      bundled local Node.js server, not a self-contained offline engine."
  ]
flexiFreqs: [ 392, 493.88, 587.33, 783.99 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/cocs-godot/critically-damped-umbilical.webp",
    "width": 1600,
    "height": 1200,
    "title": "The Critically Damped Umbilical",
    "medium": "BLENDER · EDITORIAL EXAGGERATION",
    "alt": "A photorealistic studio still life of a polished chrome
      critically-damped coil spring rig and a faceted cyan glass shield dome
      filled with suspended glowing particle spheres, tethered by a heavy
      braided cable to a massive cast-iron calibration weight on an optical
      breadboard. An editorial illustration, not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "screenshot",
    "src": "/assets/screenshots/cocs-godot.png",
    "width": 1280,
    "height": 800,
    "caption": "Native Godot combat on Meridian Exchange, Team Deathmatch.",
    "alt": "Native Godot combat on Meridian Exchange, Team Deathmatch."
  }
codeExcerpt:
  {
    "title": "SOURCE EXCERPT // EXACT CRITICAL SPRING",
    "lang": "gdscript",
    "code": "static func spring(value: float, velocity: float, goal: float, rate:
      float, dt: float) -> Vector2:

      \tvar offset := value - goal

      \tvar j := velocity + rate * offset

      \tvar decay := exp(-rate * dt)

      \treturn Vector2(goal + (offset + j * dt) * decay, (velocity - rate * j *
      dt) * decay)",
    "sourceLabel": "godot/source_operators/motion_math.gd: exact critical spring",
    "sourceUrl": "https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a97\
      68bc0321fb82b647e76/godot/source_operators/motion_math.gd#L4-L8"
  }
sources:
  [
    {
        "label": "README: status and authority model",
        "url": "https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc03\
          21fb82b647e76/README.md#L1-L20"
      },
    {
        "label": "godot/project.godot: GL Compatibility renderer",
        "url": "https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc03\
          21fb82b647e76/godot/project.godot#L20-L22"
      },
    {
        "label": "godot/net/client.gd: shared JSON WebSocket transport",
        "url": "https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc03\
          21fb82b647e76/godot/net/client.gd#L31-L158"
      },
    {
        "label": "godot/source_operators/motion_math.gd: exact critical spring",
        "url": "https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc03\
          21fb82b647e76/godot/source_operators/motion_math.gd#L3-L8"
      },
    {
        "label": "godot/particle_lab/field.gd: 8K–1M particle counts",
        "url": "https://github.com/mojomast/cocs-godot/blob/1f1e5f5486904f5d08a9768bc03\
          21fb82b647e76/godot/particle_lab/field.gd#L8"
      }
  ]
---

Porting a game usually means rewriting its rules and hoping they come out the same. CoCS-Godot skips the hoping. The authoritative match stays in the original Node.js simulation, and the Godot client speaks the same JSON WebSocket protocol as the browser build. The server cannot tell which front end just connected, which is the point.

Everything you can feel is new. Recoil and sway come from a critically damped spring solved in closed form in `motion_math.gd`, so the weapon settles without the jitter of step-by-step integration. Custom shaders light the shields and weapon effects. A particle lab lets you choose anywhere from 8K to a million particles across GPU and analytic backends, and reports the frame cadence you actually got.

It does not use Vulkan Forward+ or SDFGI. It uses GL Compatibility, and the repository is happy to tell you so.
