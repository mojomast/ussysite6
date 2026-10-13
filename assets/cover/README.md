# The Machine Beneath the Skin

An original procedural biomechanical sculpture for **SLOP ILLUSTRATED (Si.)**.
This is conceptual editorial artwork, not a photograph of product hardware or
an instrument displaying live data. The eleven SVG buttons surrounding it are
the magazine's article index.

## Assets

- `machine-beneath-the-skin.webp` — baked cover artwork. No runtime 3D engine,
  external image service, stock photograph, or model download is needed.
- `render-machine.py` — deterministic sculpture, studio lighting, camera and
  procedural material source. Rendered with Blender Cycles and AgX.

The composition uses an elongated graphite carapace, a deep annular iris,
overlapping cast ribs, corrugated umbilicals, hydraulic supports, patinated
metal, a foundry monogram and a swept exoskeletal cradle. Branching cranial
veins and thoracic tendons connect to exposed gear trains, finned solenoids,
hydraulic pistons and hard-line manifolds. Small fasteners and surface variation
give the object scale. Lighting and occlusion are ray traced.

## Rebuild

Install Blender's Python module (`bpy`) and Pillow in an isolated environment,
then run from the repository root:

```sh
WIDTH=1760 SAMPLES=64 OUTPUT=/path/to/machine.png python assets/cover/render-machine.py
python -c "from PIL import Image; Image.open('/path/to/machine.png').save('assets/cover/machine-beneath-the-skin.webp', quality=92, method=6)"
```

The website uses only the WebP. `js/cover-plate.js` supplies its descriptive
accessible name and interactive index, and recomposes that index under the
artwork on narrow containers. The artwork is intentionally still: reduced
motion and offscreen pause state are respected without an animation loop.
