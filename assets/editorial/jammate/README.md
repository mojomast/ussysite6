# Waiting for the Downbeat

An original, procedurally modelled Blender 5.2 Cycles editorial exaggeration for **JamMate** (`#103`, Folio 05 — *Adaptive Drums on a Lock-Free Musical Clock*).

- **Image:** `waiting-for-the-downbeat.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of two articulated brass mechanical arms holding hickory drumsticks politely behind a miniature velvet barrier above a chrome snare drum, wired to a glowing copper ring-buffer torus, a brass musical clock dial, and a tweed guitar cable — an editorial illustration, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and scene

A warm recording-studio tabletop still life capturing the discipline of an over-eager mechanical drummer held back by lock-free clock synchronization until the next bar boundary (`nextDownbeatSample`):

- **The Snare, Hi-Hat & The Polite Mechanical Arms:** Center-left sits a miniature vintage brushed-brass snare drum with ten polished chrome double-ended tube lugs, tension rods, die-cast counterhoops, and a textured coated batter head (`COATED BATTER · 4/4 / JOIN ON NEXT BAR`), flanked by a spun-bronze hi-hat cymbal pair on a chrome stand. Rising behind the snare, two articulated brushed-steel and brass mechanical arms with hydraulic dampers hold a pair of turned hickory drumsticks poised mid-air—physically held back behind a plush crimson velvet theatre rope on turned brass stanchions and a striped crimson-and-cream railway crossing gate arm labeled `BAR-BOUNDARY GATE · HOLD FOR BAR 02 / WAIT: nextDownbeatSample`.
- **The Lock-Free Ring & Musical Clock (`AnalysisAudioRing` & `MusicalClock`):** Center-right rests a machined copper-and-glass toroidal channel (`ANALYSIS AUDIO RING · LOCK-FREE SPSC`) containing fourteen glowing warm-amber audio sample spheres circulating in a single file with no locks. Copper conduits link the torus to a black-bakelite and polished-brass chronometer dial (`MUSICAL CLOCK · 4/4 BAR BOUNDARY · LOCK-FREE`) whose swept brass needle approaches the glowing amber top-dead-center `DOWNBEAT · 1` jewel (`NEXT: BAR 02 JOIN`).
- **The Guitar Input (`Guitar Companion · NAM / IR`):** In the foreground, a heavy knurled chrome `1/4"` TRS guitar plug on a braided vintage tweed cable feeds a walnut-and-brass input stage (`GUITAR COMPANION · NAM / IR · JUCE 8 · 3-RIG INPUT STAGE`) with a glowing amber jewel pilot light.

All geometry, Principled BSDF materials, procedural wood/metal/fabric bump shaders, and internal dial/placard textures are original procedural work. No external 3D models, stock photography, or third-party assets are used.

## Rebuild

From the repository root, using the cached Blender 5.2.2 Python environment (`/tmp/bpy-env/bin/python`):

```bash
mkdir -p /tmp/opencode/jammate-blender

WIDTH=800 SAMPLES=16 \
  OUTPUT=/tmp/opencode/jammate-blender/preview.webp \
  /tmp/bpy-env/bin/python assets/editorial/jammate/render-scene.py

WIDTH=1600 SAMPLES=64 \
  OUTPUT=assets/editorial/jammate/waiting-for-the-downbeat.webp \
  /tmp/bpy-env/bin/python assets/editorial/jammate/render-scene.py
```

`WIDTH`, `SAMPLES`, and `OUTPUT` are optional environment overrides. Height is always `round(WIDTH * 0.75)`. Cycles renders with two fixed CPU threads (`scene.render.threads = 2`), `AgX` view transform, denoising, and `f/8.0` depth of field. Transient render artifacts stay in `/tmp/opencode/jammate-blender/`.

## Editorial grounding

Reviewed against `docs/editorial-audit/audio-assets.md` and `mojomast/jammate@0bb4893`:
- Built on Raphael Fukuda’s Guitar Companion (JUCE `8.0.15` standalone/VST3 guitar rig with Neural Amp Modeler captures and convolution cabinet IRs across up to three parallel rigs) and adds `src/jam/`.
- Foregrounds the shared `MusicalClock` (`MusicalClock.h`), lock-free single-producer/single-consumer `AnalysisAudioRing`, lock-free `RtSignal` snapshot bridge, and experimental Jam Director that joins a prepared 4/4 drum pattern on the next bar boundary (`nextDownbeatSample`).
- Does **not** depict or claim measured 2.6 ms latency, 120 Hz UI polling, or nonlinear tube emulation.
