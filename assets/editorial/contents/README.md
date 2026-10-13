# After Hours at the Proof Desk

Original procedural Blender still life for the contents page of **Slop Illustrated**.

- **Image:** `after-hours-proof-desk.webp`
- **Dimensions:** 1600 × 1200 pixels, landscape 4:3
- **Alt text:** An ivory CRT computer displaying Si. and Slop Illustrated on a walnut editorial desk, lit by a green banker’s lamp and cool window light, with a mechanical keyboard, printed proofs, source notebook, coffee and a magnifier; folded tractor-feed paper spills over the desk edge.
- **Renderer:** Blender 5.2.2, Cycles, AgX, 64 samples with denoising, two fixed CPU threads; WebP quality 92.

## Rebuild

From the repository root, with the existing bpy installation and Pillow:

```sh
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=1600 SAMPLES=64 python3 assets/editorial/contents/render-scene.py
```

Preview at 800 × 600 and 16 samples:

```sh
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=800 SAMPLES=16 python3 assets/editorial/contents/render-scene.py
```

All intermediate textures, PNGs and the rebuildable `.blend` are written to `/tmp/opencode/contents-blender/`. The final command also writes the finished WebP beside this README. Screen typography uses the system DejaVu Sans font at `/usr/share/fonts/truetype/dejavu/`.

## Geometry, materials and lighting

Original mesh and curve geometry throughout: a curved CRT face with UV-mapped original editorial screen artwork, softened ABS shell and inset bezel, cooling vents, screws, drive slot, individual rounded PBT keys, turned brass lamp fittings and a curved green opaline shade. Proofs and folded continuous stock, a linen source notebook, fountain pen, porcelain coffee cup and optical-glass magnifier complete the still life.

Procedural walnut grain, fine plastic surface bump and cotton-paper texture; metallic brass, coated reflective screen glass, polished green lamp glass, transmissive magnifying lens and dark glossy coffee. A warm light under the lamp and broad warm bounce meet a cool window softbox, a narrow glass reflection and subtle phosphor spill. Perspective camera with restrained depth of field. Deterministic seed; no stock imagery, downloaded models or image-generation services.
