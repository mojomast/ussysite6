# The Bureau of Becoming

An original, procedurally modelled Blender still life for **Becomussy**.

- **Image:** `bureau-of-becoming.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92
- **Alt:** A serene porcelain portrait wears five tiny verdigris-and-bronze archive drawers as a crown. Fine bronze roots trace its long neck, while an absurdly long paper recollection loops through the air and falls into a small gilt-rimmed teacup.
- **Scene source:** `render-scene.py`

## Concept and scene

A quietly absurd museum object: the self as an unfinished archive, with its own
excessive paperwork served in a teacup. Five drawers allude to semantic, episodic,
autobiographical, working, and relational memory; loose folios and the continuous
paper ribbon evoke provenance and revisable recollection. The portrait stands
for a versioned self-model. These are editorial metaphors, not an architecture
diagram or an illustration of cryptographic guarantees.

The sleeping face is a continuous parametric ceramic mesh with sculpted nose,
cheeks, eyelids, and lips. The scene includes hollow lathed porcelain, machined
drawer trays and drop handles, paper sheets, fasteners, tapered bronze roots,
procedural glaze grain, metal patina, and paper-fibre bump. All geometry and
materials are original procedural work. No downloaded models, stock images,
external textures, fonts, or generated image inputs are used. The strokes on
the ribbon are abstract manuscript marks rather than text or product telemetry.

Lighting combines a warm gallery window, cool silk rim, and soft fill on a
limestone stage. Cycles renders with AgX, denoising, controlled depth of field,
64 samples, and **two fixed CPU threads**. Random seed: 111.

## Rebuild

From the repository root, using the existing Blender 5.2.2 Python module and Pillow:

```sh
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=1600 SAMPLES=64 \
  python3 assets/editorial/becomussy/render-scene.py
```

The script writes the completed WebP beside itself. The intermediate lossless
render is `/tmp/opencode/becomussy-blender/final.png`.

Preview:

```sh
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=800 SAMPLES=16 \
  OUTPUT=/tmp/opencode/becomussy-blender/preview.webp \
  python3 assets/editorial/becomussy/render-scene.py
```

`WIDTH`, `SAMPLES`, and `OUTPUT` are optional environment overrides. Height is
always three quarters of width. Transient render files stay under
`/tmp/opencode/becomussy-blender/`.

## Editorial grounding

Reviewed against the audited Becomussy object in `projects.js` and
`docs/editorial-audit/narrative-memory.md`: typed/provenanced memories,
versioned self-model, and reviewed self-revision. No fictional memory-layer
names, signing primitives, drift measurements, or other invented guarantees
are depicted.
