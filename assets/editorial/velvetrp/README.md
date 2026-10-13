# An Improbable Turn of the Page

Original procedural Blender editorial artwork for VelvetRP.

- **Asset:** `an-improbable-turn-of-the-page.webp`
- **Dimensions:** 1600 × 1200 pixels (4:3)
- **Alt:** An open leatherbound book on wine-red velvet unfolds into a miniature stone theatre, beneath a floating ivory die; a brass ladder reaches into empty air while a tiny crowned snail presides over the page.
- **Concept:** A shared story becoming a tangible world. Curving parchment grows into theatrical architecture; the oversized suspended die, useless ladder and royal snail introduce a little literary absurdity. This is conceptual editorial art informed by the audited VelvetRP narrative/table/world-building context in `projects.js`, not a product screenshot or a claim about specific gameplay or interface features.
- **Materials:** Procedural velvet nap and folds, pebbled leather with double brass tooling, individual parchment leaves, individually modeled stone courses, patinated copper roofs, walnut stage floorboards, satin ivory, and brass detailing.
- **Production:** Deterministic seed 102; original procedural geometry and materials; no downloaded stock. Cycles, fixed two CPU threads, 64 samples with denoising, AgX, slight optical depth of field. WebP quality 92.

## Reproduce

From the repository root, with the existing bpy 5.2.2 / Pillow environment:

```sh
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=1600 SAMPLES=64 python3 assets/editorial/velvetrp/render-scene.py
```

Preview:

```sh
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=800 SAMPLES=16 python3 assets/editorial/velvetrp/render-scene.py
```

Transient PNG proofs and the reproducible generated Blender scene are written to `/tmp/opencode/velvetrp-blender/`. The full-size run writes the finished WebP beside the script.
