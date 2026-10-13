# A Reasonable Amount of Caution

Original Blender editorial sculpture of **Claude — “THE SAFETY OFFICER”**, the COCS agent. An editorial exaggeration, not an actual game capture. The enormous ceramic guardian supports a tiny, fragile teacup on a protective tray and wears a jeweller’s inspection loupe.

- **Image:** `a-reasonable-amount-of-caution.webp`
- **Dimensions:** 1600 × 1200 pixels (4:3 landscape).
- **Alt:** An extravagantly armored peach-and-ivory ceramic Claude robot, wearing an inspection loupe, solemnly cradles a tiny gold-rimmed teacup in its enormous articulated hands.
- **Geometry:** Original procedural meshes, beveled armor panels, layered shoulder shells, swept cheek castings, shield-shaped sternum, segmented fingers, hydraulic pistons, cables, and a revolved open teacup. No downloaded art, stock imagery, or external textures.
- **Materials:** Procedural fine-crazed ivory porcelain and peach enamel; champagne bronze, polished nickel, graphite joints, rubber seals, smoked optical glass, bone china, and amber tea.
- **Lighting:** Warm large silkbox key, cool frontal fill, amber rim, and overhead softbox. Cycles CPU, two fixed threads, denoising, AgX; restrained depth of field keeps the armor and cup legible.
- **Composition:** Three-quarter gallery bust, oversized protective shoulders, narrow horizontal visor, nested shield sternum, and small diegetic `CLAUDE` nameplate. The cup is deliberately very small but isolated against the tray and chest for readability.

## Source-character references (read-only)

From `/home/mojo/projects/tokenarena/game/`:

- `data.mjs:3`: Claude, “THE SAFETY OFFICER”; peach `#f29d71`, ivory accent `#f8e4cf`, alignment-review personality.
- `operator-anatomy.mjs:8,73–75,118,142–149,178`: ceramic warding chassis, shield sternum, broad shoulders, ceramic arm profile.
- `operator-detail.mjs:75–90`: jaw vents, crown service strips, wide chest, collar bolts, perimeter armor, and side cables.
- `models.mjs:480,496,537–561`: “Warden” helmet, narrow bar visor, swept mandibular plates, ear bearings, reinforced lower jaw.

The source establishes the identity and construction vocabulary. Exaggerated proportions, cup, tray, and inspection loupe are original editorial additions.

## Rebuild

Use the existing cached bpy 5.2.2 installation and Pillow:

```bash
mkdir -p /tmp/opencode/cocs-blender
PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=800 SAMPLES=16 \
  OUTPUT=/tmp/opencode/cocs-blender/preview.png \
  python3 assets/editorial/cocs/render-scene.py

PYTHONPATH=/home/mojo/.cache/cover-render WIDTH=1600 SAMPLES=64 \
  OUTPUT=/tmp/opencode/cocs-blender/final.png \
  WEBP=assets/editorial/cocs/a-reasonable-amount-of-caution.webp \
  python3 assets/editorial/cocs/render-scene.py
```

WebP encoding uses quality 92, method 6. Transient PNGs and render logs belong in `/tmp/opencode/cocs-blender/`.

## Render review

The initial 800 × 600 / 16-sample preview was opened and visually inspected. The final scene adds a grounded gallery pedestal and visible mounting spindle beneath the torso, and replaces the initial reflective loupe shader with transmissive optical glass. The delivery render uses 1600 × 1200 / 64 samples.

The finished WebP was decoded with Pillow and opened at its full 1600 × 1200 resolution for visual inspection. Verified RGB WebP, 76,146 bytes; the cup, articulated hands, nameplate, shield, loupe, and grounded bust mount are visible. Finished full-resolution PNG preview: `/tmp/opencode/cocs-blender/final.png`.
