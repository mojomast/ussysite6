---
issueNumber: "01"
articleSlug: "orbitdesktop"
index: 1
readerServiceNo: 101
section: "COVER STORY // SPATIAL INTERFACES"
layoutVariant: "opener"
title: "OrbitDesktop"
kicker: "Agent-Customizable Spatial Workspace"
headline: "A Browser Desktop the Agent Can Reshape"
deck: "A local browser workspace for conversations, terminals and apps—with movable windows, optional tiling and a spatial view."
byline: "By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)"
category: "Agent Workspace / Spatial UI"
glanceNote: "A bound Hermes agent can inspect the workspace and, when permitted, rearrange its panes. Layout revisions, checkpoints and command receipts live in a local SQLite store; the controller is read-only by default."
pullQuote: "A workspace should adapt to the work—and to the agent helping you do it."
repoUrl: "https://github.com/mojomast/orbitdesktop"
liveUrl: null
sourceRevision: "9c4069a002c1d9376d9ae06776d4090aad49fc00"
researchedAt: "2026-10-13"
spotInkHex: "#d9381e"
secondaryInkHex: "#0047ab"
techStack: ["TypeScript","Three.js + CSS3D","Vite / Node","Hermes gateway","SQLite","xterm.js + tmux"]
metrics: [{"label":"Package Version","value":"0.3.1"},{"label":"Spatial Renderer","value":"Three.js + CSS3D"},{"label":"Terminal Stack","value":"xterm.js · tmux"}]
verifiedCapabilities: ["Agent-customizable workspace with a scoped workspace controller","Three.js + CSS3D spatial view alongside movable windows and opt-in tiling","Persistent xterm.js terminals backed by node-pty and tmux","Local SQLite persistence with revisions, checkpoints and command receipts"]
architecture: ["Vite-bundled browser front end with pane views keyed by stable pane IDs; native `Element.moveBefore` preserves iframe document state across same-document moves where the browser supports it.","Three.js `PerspectiveCamera` drives WebGL decoration while a `CSS3DRenderer` positions native HTML pane surfaces; embedded controls stay ordinary DOM and iframes, and CSS3D is not a browser engine or WebXR layer.","Default movable-windows desktop; opt-in Dockview tiling with tab groups (`dockview-core@8.3.1`), plus validated grid, row and curve spatial tilings.","Persistent host terminals via xterm.js, node-pty and tmux; a workspace store commits layout, revisions, checkpoints and keyed command receipts atomically to SQLite.","Scoped `orbit_workspace` controller for a bound Hermes agent—read-only by default, with mutations gated behind `allow_mutations`."]
fieldNotes: ["Local-first, single-owner, agent-operated workspace.","Default movable windows; opt-in Docking and Spatial views.","Spatial placement uses a validated grid, row or curve tiling.","Layout and checkpoints commit to a local SQLite workspace store."]
readingGuide: ["READING GUIDE // README.md — a local-first, single-owner, agent-operated browser desktop","READING GUIDE // docs/ARCHITECTURE.md — PerspectiveCamera + CSS3DRenderer over native HTML panes","READING GUIDE // docs/MANAGED_TERMINALS.md — xterm.js, node-pty and tmux persistence limits","READING GUIDE // docs/RUNTIME_CONTINUITY.md — what survives a pane move and what does not"]
flexiFreqs: [261.63,329.63,392,493.88]
plate: {"kind":"blender-webp","src":"/assets/editorial/orbitdesktop/concierge-of-the-curved-arc.webp","width":1600,"height":1200,"title":"The Concierge of the Curved Arc","medium":"BLENDER · CONCEPTUAL STILL LIFE","alt":"A photorealistic studio still life of five miniature glowing glass window panes clamped along a semicircular brushed-brass optical arc by articulated callipers, beside a padlocked glass-covered mutation switch and a tiny amber terminal ticker on a dark mahogany desk — an editorial still life, not a product screenshot."}
secondaryMedia: {"kind":"screenshot","src":"/assets/screenshots/orbitdesktop.png","width":1600,"height":1000,"caption":"Orbit desktop: the application launcher rail beside the display-configuration panel","alt":"Orbit desktop: the application launcher rail beside the display-configuration panel"}
codeExcerpt: {"title":"LISTING 1.1 // SOURCE EXCERPT — SPATIAL WINDOW PLACEMENT","lang":"ts","code":"export function spatialWindow(m:Monitor, monitors:Monitor[], arc:number):SpatialWindow {\n  if(m.spatial) return {...m.spatial};\n  const widths=monitors.map(v=>dimensions({...v,diagonal:32}).w);\n  const total=widths.reduce((a,b)=>a+b,0)+Math.max(0,monitors.length-1)*0.24;\n  const i=monitors.findIndex(v=>v.id===m.id);\n  const cx=-total/2+widths.slice(0,i).reduce((a,b)=>a+b+0.24,0)+widths[i]/2;\n  const {w,h}=dimensions(m);\n  return {x:cx+m.offset,y:0.9+m.height,z:-m.distance-Math.abs(cx)*0.1,width:Math.min(200,w),height:Math.min(200,h),yaw:(i-(monitors.length-1)/2)*-arc+m.yaw,pitch:m.pitch,resolution:1920};\n}","sourceLabel":"src/spatial-layout.ts L5–L13 · orbitdesktop@9c4069a","sourceUrl":"https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/src/spatial-layout.ts#L5-L13"}
sources: [{"label":"orbitdesktop README (v0.3.1)","url":"https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/README.md"},{"label":"docs/ARCHITECTURE.md — renderers, state and control","url":"https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/docs/ARCHITECTURE.md"},{"label":"src/spatial-layout.ts — spatial placement and tiling","url":"https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/src/spatial-layout.ts"},{"label":"docs/MANAGED_TERMINALS.md — persistent terminals","url":"https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/docs/MANAGED_TERMINALS.md"},{"label":"package.json — v0.3.1 dependency manifest","url":"https://github.com/mojomast/orbitdesktop/blob/9c4069a002c1d9376d9ae06776d4090aad49fc00/package.json"}]
---

OrbitDesktop is an agent-customizable browser desktop powered by Hermes. Instead of forcing work into a fixed dashboard, it lets a bound agent build and place small interfaces beside your conversation, terminal and files. The product ships movable windows by default, with an experimental tiled Docking mode and a Three.js + CSS3D spatial view for curved or depth-arranged workspaces. It is explicitly a browser desktop, not an Electron shell or a WebXR layer.

Orbit treats the workspace as a small web application rather than a fixed dashboard. Pane views are keyed by stable pane IDs, so an editor, a terminal and a conversation can move between the default movable-windows desktop, an opt-in tiled Docking layout, or the Three.js + CSS3D spatial view without discarding the embedded document where the browser supports it. A local Node service persists layout, revisions, checkpoints and command receipts to a SQLite workspace store, and a scoped `orbit_workspace` controller lets a bound Hermes agent inspect and rearrange panes—read-only unless mutations are explicitly allowed.
