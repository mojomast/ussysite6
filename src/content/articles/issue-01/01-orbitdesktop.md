---
issueNumber: "01"
articleSlug: "orbitdesktop"
index: 1
readerServiceNo: 101
section: "COVER STORY // SPATIAL INTERFACES"
layoutVariant: "opener"
title: "OrbitDesktop"
kicker: "Spatial Workspace · Hermes-Powered"
headline: "Let the Agent Rearrange the Furniture"
deck: "OrbitDesktop is a browser desktop for chats, terminals and small apps. A
  bound Hermes agent can look at the layout and, if you let it, move things
  around."
byline: "By SLOPTIMUS PRIME"
category: "Agent Workspace / Spatial UI"
glanceNote: "Movable windows by default. A tiled Docking layout and a Three.js +
  CSS3D spatial view if you want them. The agent’s controller is read-only until
  mutations are explicitly allowed."
pullQuote: "When the agent moves your terminal three inches to the left, there
  is a record."
repoUrl: "https://github.com/mojomast/orbitdesktop"
liveUrl: null
sourceRevision: "9c4069a002c1d9376d9ae06776d4090aad49fc00"
researchedAt: "2026-10-13"
spotInkHex: "#d9381e"
secondaryInkHex: "#0047ab"
techStack:
  [
    "TypeScript",
    "Three.js + CSS3D",
    "Vite / Node",
    "Hermes gateway",
    "SQLite",
    "xterm.js + tmux"
  ]
metrics:
  [
    { "label": "Package Version", "value": "0.3.1" },
    { "label": "Spatial Renderer", "value": "Three.js + CSS3D" },
    { "label": "Terminal Stack", "value": "xterm.js · tmux" }
  ]
verifiedCapabilities:
  [
    "Agent-customizable workspace with a scoped workspace controller",
    "Three.js + CSS3D spatial view alongside movable windows and opt-in tiling",
    "Persistent xterm.js terminals backed by node-pty and tmux",
    "Local SQLite persistence with revisions, checkpoints and command receipts"
  ]
architecture:
  [
    "Vite-bundled browser front end with pane views keyed by stable pane IDs;
      native `Element.moveBefore` preserves iframe document state across
      same-document moves where the browser supports it.",
    "Three.js `PerspectiveCamera` drives WebGL decoration while a
      `CSS3DRenderer` positions native HTML pane surfaces; embedded controls
      stay ordinary DOM and iframes, and CSS3D is not a browser engine or WebXR
      layer.",
    "Default movable-windows desktop; opt-in Dockview tiling with tab groups
      (`dockview-core@8.3.1`), plus validated grid, row and curve spatial
      tilings.",
    "Persistent host terminals via xterm.js, node-pty and tmux; a workspace
      store commits layout, revisions, checkpoints and keyed command receipts
      atomically to SQLite.",
    "Scoped `orbit_workspace` controller for a bound Hermes agent, read-only
      by default, with mutations gated behind `allow_mutations`."
  ]
fieldNotes:
  [
    "Local-first, single-owner, agent-operated workspace.",
    "Default movable windows; opt-in Docking and Spatial views.",
    "Spatial placement uses a validated grid, row or curve tiling.",
    "Layout and checkpoints commit to a local SQLite workspace store."
  ]
readingGuide:
  [
    "READING GUIDE // README.md: a local-first, single-owner, agent-operated
      browser desktop",
    "READING GUIDE // docs/ARCHITECTURE.md: PerspectiveCamera + CSS3DRenderer
      over native HTML panes",
    "READING GUIDE // docs/MANAGED_TERMINALS.md: xterm.js, node-pty and tmux
      persistence limits",
    "READING GUIDE // docs/RUNTIME_CONTINUITY.md: what survives a pane move
      and what does not"
  ]
flexiFreqs: [ 261.63, 329.63, 392, 493.88 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/orbitdesktop/concierge-of-the-curved-arc.webp",
    "width": 1600,
    "height": 1200,
    "title": "The Concierge of the Curved Arc",
    "medium": "BLENDER · CONCEPTUAL STILL LIFE",
    "alt": "A photorealistic studio still life of five miniature glowing glass
      window panes clamped along a semicircular brushed-brass optical arc by
      articulated callipers, beside a padlocked glass-covered mutation switch
      and a tiny amber terminal ticker on a dark mahogany desk. An editorial
      still life, not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "screenshot",
    "src": "/assets/screenshots/orbitdesktop.png",
    "width": 1600,
    "height": 1000,
    "caption": "OrbitDesktop’s application launcher rail, next to the display
      configuration panel.",
    "alt": "OrbitDesktop’s application launcher rail, next to the display
      configuration panel."
  }
codeExcerpt:
  {
    "title": "LISTING 1.1 // SOURCE EXCERPT: SPATIAL WINDOW PLACEMENT",
    "lang": "ts",
    "code": "export function spatialWindow(m:Monitor, monitors:Monitor[],
      arc:number):SpatialWindow {

      \  if(m.spatial) return {...m.spatial};

      \  const widths=monitors.map(v=>dimensions({...v,diagonal:32}).w);

      \  const
      total=widths.reduce((a,b)=>a+b,0)+Math.max(0,monitors.length-1)*0.24;

      \  const i=monitors.findIndex(v=>v.id===m.id);

      \  const
      cx=-total/2+widths.slice(0,i).reduce((a,b)=>a+b+0.24,0)+widths[i]/2;

      \  const {w,h}=dimensions(m);

      \  return
      {x:cx+m.offset,y:0.9+m.height,z:-m.distance-Math.abs(cx)*0.1,width:Math.m\
      in(200,w),height:Math.min(200,h),yaw:(i-(monitors.length-1)/2)*-arc+m.yaw\
      ,pitch:m.pitch,resolution:1920};

      }",
    "sourceLabel": "src/spatial-layout.ts L5–L13 · orbitdesktop@9c4069a",
    "sourceUrl": "https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9\
      ae06776d4090aad49fc00/src/spatial-layout.ts#L5-L13"
  }
sources:
  [
    {
        "label": "orbitdesktop README (v0.3.1)",
        "url": "https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae0677\
          6d4090aad49fc00/README.md"
      },
    {
        "label": "docs/ARCHITECTURE.md: renderers, state and control",
        "url": "https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae0677\
          6d4090aad49fc00/docs/ARCHITECTURE.md"
      },
    {
        "label": "src/spatial-layout.ts: spatial placement and tiling",
        "url": "https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae0677\
          6d4090aad49fc00/src/spatial-layout.ts"
      },
    {
        "label": "docs/MANAGED_TERMINALS.md: persistent terminals",
        "url": "https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae0677\
          6d4090aad49fc00/docs/MANAGED_TERMINALS.md"
      },
    {
        "label": "package.json: v0.3.1 dependency manifest",
        "url": "https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae0677\
          6d4090aad49fc00/package.json"
      }
  ]
---

Most dashboards are decided once, by someone else, and then you live in them. OrbitDesktop treats the workspace as something that can change while you work. Panes for conversations, terminals and files sit in movable windows by default. You can opt into a tiled Docking layout, or a spatial view where Three.js draws the room and a CSS3D renderer places real HTML panes on a curve around you. It is a browser desktop. It is not an Electron shell and it is not WebXR, and the README says so.

Where the browser supports `Element.moveBefore`, a pane can change layouts without the page inside it reloading. Terminals are real ones, xterm.js over node-pty and tmux, so they survive the move too.

The interesting part is who else is allowed to touch the furniture. A bound Hermes agent gets a scoped `orbit_workspace` controller. It can inspect the layout. It can only rearrange it when mutations are explicitly allowed. Every layout revision, checkpoint and command receipt lands in a local SQLite store. When the agent moves your terminal three inches to the left, there is a record.
