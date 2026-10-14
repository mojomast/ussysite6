# Specimen Under Checksum Glass

An original, procedurally modelled Blender 5.2 Cycles conceptual still life for **MothBake** (`#108`, Folio 10).

- **Image:** `specimen-under-checksum-glass.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of a sculptural copper-and-porcelain moth with PBR material-swatch wings resting in a velvet mahogany specimen case, pinned with five wax-sealed brass provenance medallions beside a preserved glass cache jar and a padlocked brass coin box — an editorial still life, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and scene

A Victorian natural-history cabinet meets a precision metallurgical assay kiln:

- **The Clockwork Atlas Moth Specimen:** Center stage inside an open emerald-velvet-lined mahogany specimen tray sits a sculptural Atlas moth crafted from hammered copper, glazed ivory porcelain, and four inlaid PBR material-swatch wing panels (brushed assay gold on the upper-left forewing, iridescent blue-violet normal-map ceramic beneath a brass-rimmed inspection lens on the upper-right forewing, fired terracotta and cream UV checkerboard tiles on the lower-left hindwing, and natural woven ecru linen threads on the lower-right hindwing).
- **The Five Provenance Tags:** Five miniature stamped brass assay medallions on fine copper wires (`01 RECIPE`, `02 INSTANCE`, `03 RAW`, `04 BAKE`, `05 EXPORT`) fan out symmetrically around the specimen like entomological collection pins, each sealed with a drop of crimson sealing wax.
- **The Padlocked Spend Gate & Offline Jar:** To the right sits a heavy optical-glass apothecary jar (`RAW CACHE`) holding preserved glowing amber "raw result" crystals, while in the foreground left sits a brass coin-slot strongbox (`SPEND LOCKED`) clamped shut by a copper hasp bar and a heavy forged-iron padlock—dramatizing that live paid provider calls are disabled by default behind an explicit approval gate.

All geometry and shaders are original procedural work in Blender 5.2 Cycles (AgX color management, two fixed CPU threads, denoising, macro depth of field).

## Editorial grounding

Grounded in `docs/editorial-audit/audio-assets.md` (`mojomast/mothbake` @ `93e1825`):

- Offline-first, content-addressed asset baker in Node.js ESM with zero runtime dependencies and in-repo decoders for PNG, GIF, ZIP, Radiance HDR, WAV, and MIDI.
- Five layered SHA-256 content identities (`recipeId`, `instanceId`, `rawResultId`, `bakeId`, `exportArtifactId`) enable offline re-baking from cached provider responses.
- Live paid provider calls are locked behind an explicit approval gate (`approvalGranted`). No Merkle DAG, Rust, or 64-byte alignment claims are made.

## Rebuild

From the repository root using `/tmp/bpy-env/bin/python`:

```sh
WIDTH=800 SAMPLES=16 \
  OUTPUT=/tmp/opencode/mothbake-blender/preview.webp \
  /tmp/bpy-env/bin/python assets/editorial/mothbake/render-scene.py

WIDTH=1600 SAMPLES=64 \
  /tmp/bpy-env/bin/python assets/editorial/mothbake/render-scene.py
```

`WIDTH`, `SAMPLES`, and `OUTPUT` are optional environment overrides. Height is always three quarters of width (`int(round(WIDTH * 0.75))`). Transient PNG renders are written to `/tmp/opencode/mothbake-blender/`.
