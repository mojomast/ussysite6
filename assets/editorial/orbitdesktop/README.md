# The Concierge of the Curved Arc

An original, procedurally modelled Blender 5.2 Cycles conceptual still life for **OrbitDesktop** (`#101`, Folio 03 — *Agent-Customizable Spatial Workspace*).

- **Image:** `concierge-of-the-curved-arc.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of five miniature glowing glass window panes clamped along a semicircular brushed-brass optical arc by articulated callipers, beside a padlocked glass-covered mutation switch and a tiny amber terminal ticker on a dark mahogany desk — an editorial still life, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and scene

An ironic optical-bench metaphor for a local-first browser desktop that the Hermes agent can inspect by default and reshape only when granted explicit permission:

- **The Curved Arc Rig (`curve` layout):** Five miniature beveled crown-glass window panes with warm amber, cyan, and emerald edge lighting and etched brass title-bar headers (`WORKSPACE.SQLITE`, `MOVABLE DOM`, `SPATIAL : CURVE`, `DOCKVIEW`, `XTERM · TMUX`) are held along a single semicircular brushed-brass optical rail by articulated steel vernier callipers and crimson velvet-padded brass jaws—literalizing Three.js `PerspectiveCamera` + `CSS3DRenderer` `tileSpatial(..., 'curve', arc)` placement over native DOM/iframe panes.
- **The Gated Mutation Switch & Concierge Bell (`orbit_workspace`):** In the foreground right, a cast-iron and baked crimson-enamel control plinth houses a polished brass hotel concierge bell and a guardsman toggle switch beneath a hinged protective glass lockout cover. A miniature brass padlock secures the front hasp beside a stamped cream rag-paper tag reading `MUTATIONS: OPT-IN` (`DEFAULT: READ-ONLY · ALLOW_MUTATIONS=0`).
- **The Persistent Terminal (`xterm.js + node-pty + tmux`):** To the left, a compact vintage amber CRT terminal and brass telegraph ticker spool a continuous perforated paper tape directly into a speckled stoneware mug bearing a riveted brass plaque (`TMUX : PERSISTENT`), evoking terminal sessions that survive browser reloads.
- **The SQLite Authority (`workspace.sqlite`):** At the focus of the arc sits a brass-trimmed slate ledger block (`WORKSPACE.SQLITE · REV 042 · LAYOUT_V1 · ATOMIC`) linked by brass conduits to the semicircular rail.

All geometry, Principled BSDF materials, wood/metal/stoneware bump nodes, and rasterized internal pane/CRT/tag graphics are original procedural work. No external 3D models, stock photography, or third-party textures are used.

## Rebuild

From the repository root, using the cached Blender 5.2.2 Python environment (`/tmp/bpy-env/bin/python`):

```bash
mkdir -p /tmp/opencode/orbitdesktop-blender

WIDTH=800 SAMPLES=16 \
  OUTPUT=/tmp/opencode/orbitdesktop-blender/preview.webp \
  /tmp/bpy-env/bin/python assets/editorial/orbitdesktop/render-scene.py

WIDTH=1600 SAMPLES=64 \
  OUTPUT=assets/editorial/orbitdesktop/concierge-of-the-curved-arc.webp \
  /tmp/bpy-env/bin/python assets/editorial/orbitdesktop/render-scene.py
```

`WIDTH`, `SAMPLES`, and `OUTPUT` are optional environment overrides. Height is always `round(WIDTH * 0.75)`. Cycles renders with two fixed CPU threads (`scene.render.threads = 2`), `AgX` view transform, denoising, and `f/8.0` depth of field. Transient render artifacts stay in `/tmp/opencode/orbitdesktop-blender/`.

## Editorial grounding

Reviewed against `docs/editorial-audit/desktop-dashboard.md` and `mojomast/orbitdesktop@9c4069a`:
- Local-first browser desktop powered by Hermes (`server.py` + `index.html`).
- Movable windows are default; Docking (`dockview-core`) is opt-in; Spatial View uses Three.js + `CSS3DRenderer` with `grid`, `row`, or `curve` placement.
- Persistent `xterm.js` + `node-pty` + `tmux` terminals, local SQLite (`workspace.sqlite`) persistence, and read-only-by-default `orbit_workspace` controller gating mutations behind explicit opt-in.
- Does **not** depict or claim three concentric orbital rings, Electron, CSS Houdini, or WebXR.
