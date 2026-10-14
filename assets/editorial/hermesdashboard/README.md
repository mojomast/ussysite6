# The Drawer of Little Assistants

Original procedurally modelled Blender 5.2 / Cycles conceptual still life for **HermesDashboard** (#110, Folio 12).

- **Image:** `drawer-of-little-assistants.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of a walnut observatory cabinet topped with a brass planetarium orrery of linked spheres, with its lower mahogany drawer pulled open and glowing warmly to reveal miniature brass-and-porcelain clerk automatons working inside beside a mechanical token odometer — an editorial still life, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and editorial grounding

Grounded in the audited `hermesdashboard` object (`docs/editorial-audit/desktop-dashboard.md`, pinned to `mojomast/hermesdashboard` @ `74ef867f3d7ad408c6c3c6aca6c91d4532464da9`):

1. **The Session Observatory Cabinet**: A museum-grade mid-century oiled American walnut and slate-blue vitreous enamel cabinet (`HERMES · SESSIONS`) with collapsible tool-call flip-tabs and five jewel indicator lenses.
2. **The Upper Constellation Orrery (The Graph)**: Mounted atop the cabinet over an engraved brass-and-glass azimuth dial is a precision planetarium Orrery where color-coded spheres—warm gold (sessions), sapphire blue (files), emerald green (tools), amethyst violet (models), and warm coral (skills)—are linked by fine tensioned brass rods with clevis joints, corresponding to the dashboard's interactive 2D canvas graph.
3. **The Pulled-Out "Live View" Subagent Drawer (`child_session_started` / `subagent_progress`)**: The lower mahogany drawer (`LIVE VIEW · SUBAGENTS`) is pulled halfway open toward the viewer and lit from within by a warm golden work-lamp. Inside the velvet-lined miniature stage, two porcelain-and-brass clerk automatons busily inspect a miniature cyan blueprint and turn a tiny solid-brass wrench on a clockwork gear manifold—a literal subagent drawer you can peek into while the parent session runs above.
4. **The Cost Counter (`TOKENS · COST`)**: Mounted on the right flank of the cabinet is a mechanical brass Veeder-Root style five-wheel odometer (`04289`) with stacked and scattered gold coins beside it on the plinth, representing per-session token and cost accounting.

## Rebuild

From the repository root, using the cached Blender 5.2.2 Python environment and Pillow:

```bash
mkdir -p /tmp/opencode/hermesdashboard-blender
WIDTH=800 SAMPLES=24 WEBP=/tmp/opencode/hermesdashboard-blender/preview.webp \
  /tmp/bpy-env/bin/python assets/editorial/hermesdashboard/render-scene.py

WIDTH=1600 SAMPLES=64 \
  /tmp/bpy-env/bin/python assets/editorial/hermesdashboard/render-scene.py
```

`WIDTH`, `SAMPLES`, and `WEBP` are optional environment overrides. Height is always `round(WIDTH * 0.75)`. Transient PNG renders are written to `/tmp/opencode/hermesdashboard-blender/`.
