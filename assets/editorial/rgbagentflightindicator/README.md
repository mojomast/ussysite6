# Peripheral-Vision Control Tower

An original, procedurally modelled Blender 5.2 Cycles editorial illustration for **RGBAgentFlightIndicator** (`#107`, Folio 09).

- **Image:** `peripheral-vision-control-tower.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of an over-engineered brass and black-enamel cockpit annunciator housing four oversized mechanical keycaps—dark obsidian idle, glowing emerald working, frosted alabaster done, and a ruby-red blocked key crowned with a miniature lighthouse beacon under a poised porcelain hand — an editorial illustration, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and scene

An ironic editorial exaggeration of a local peripheral-vision agent status panel: a heavy cast-brass, matte black crinkle-enamel steel, and oiled walnut aviation/nuclear control-desk annunciator built around four oversized mechanical switches representing the four canonical session states:

1. **Lane 01 (`IDLE`)**: A matte obsidian sculpted keycap sitting dark and quiet beneath a closed sleeping brass shutter.
2. **Lane 02 (`WORKING`)**: A translucent emerald-green keycap glowing warmly from within, topped with a miniature spinning brass fly-ball governor and a circular pressure gauge ticking steadily.
3. **Lane 03 (`DONE`)**: A frosted alabaster-white keycap radiating calm ivory light beside a polished silver service bell resting peacefully on the brass deck.
4. **Lane 04 (`BLOCKED`)**: An urgent ruby-red keycap crowned with a miniature lighthouse Fresnel lens beacon and a raised red-and-white striped semaphore flag, with an articulated ivory-porcelain mannequin hand poised millimeters above the beacon ready to grant permission.

In the foreground, a braided cloth USB HID cable with a gold-plated connector snakes across the oiled walnut surface beside a riveted brass nameplate marking the 12 concurrent agent lanes (`01`–`12`). All geometry and shaders are original procedural work in Blender 5.2 Cycles (AgX color management, two fixed CPU threads, denoising, depth of field).

## Editorial grounding

Grounded in `docs/editorial-audit/routing-rgb.md` (`mojomast/rgbagentflightindicator` @ `fc7378d`):

- Local Python HTTP daemon mapping up to 12 concurrent coding-agent sessions (`--count 12`) onto RGB keyboard zones.
- Four canonical visual states: green (`working`), white (`done`), blinking red (`blocked`), and dark (`idle`).
- Hardware-verified on Sinowealth and EVision USB HID boards. No 60 Hz refresh rate or `< 6 ms` latency claims are made.

## Rebuild

From the repository root using `/tmp/bpy-env/bin/python`:

```sh
WIDTH=800 SAMPLES=16 \
  OUTPUT=/tmp/opencode/rgbagentflightindicator-blender/preview.webp \
  /tmp/bpy-env/bin/python assets/editorial/rgbagentflightindicator/render-scene.py

WIDTH=1600 SAMPLES=64 \
  /tmp/bpy-env/bin/python assets/editorial/rgbagentflightindicator/render-scene.py
```

`WIDTH`, `SAMPLES`, and `OUTPUT` are optional environment overrides. Height is always three quarters of width (`int(round(WIDTH * 0.75))`). Transient PNG renders are written to `/tmp/opencode/rgbagentflightindicator-blender/`.
