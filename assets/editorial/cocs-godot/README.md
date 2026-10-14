# The Critically Damped Umbilical

An original, procedurally modelled Blender 5.2 / Cycles editorial still life for **CoCS-Godot** (#105, Folio 07).

- **Image:** `critically-damped-umbilical.webp`
- **Dimensions:** 1600 × 1200 pixels (4:3 landscape)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of a polished chrome critically-damped coil spring rig and a faceted cyan glass shield dome filled with suspended glowing particle spheres, tethered by a heavy braided cable to a massive cast-iron calibration weight on an optical breadboard — an editorial illustration, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and audited grounding

Grounded in `docs/editorial-audit/arena.md` (`mojomast/cocs-godot` @ `1f1e5f5`):

- **Native Presentation Apparatus (Left & Center):** CoCS-Godot is a native Godot 4.5 desktop client (`gl_compatibility` renderer) that contributes an exact closed-form critically damped spring solver (`godot/source_operators/motion_math.gd`, $\zeta = 1.0$, zero overshoot, no Euler integration) for weapon recoil/sway, plus standalone particle labs (`godot/particle_lab/field.gd`, 8K–1M particles) and custom `.gdshader` material/interference-shield labs (`godot/combat_shields/interference.gdshader`, `godot/shader_lab/*`). In the scene, a heavy-gauge polished chrome coil spring sits inside a brass vernier test frame with a ruby-tipped dial indicator pointing to zero overshoot (`ZETA = 1.00`), alongside a crystalline geodesic cyan glass bell jar suspending a frozen swirl of glowing gold, cyan, and ember particle spheres.
- **The Authoritative Anchor (Right):** No matter how flashy the client-side spring and shader labs look, the Godot client connects over JSON WebSocket (`godot/net/client.gd`) to the exact same authoritative 60 Hz Node.js server as the browser game. A thick braided brass-and-copper umbilical cable runs from the base of the presentation rig into a massive, unyielding cast-iron metrological calibration weight (`AUTHORITATIVE / 60 HZ NODE · WS JSON`, `SERVER TRUTH`).
- **No false renderer claims:** Neither Forward+ nor SDFGI is claimed or depicted; the optical breadboard datum rail explicitly reads `GL_COMPAT · SPRING / PARTICLE / SHADER LAB`.

All geometry and shaders are original procedural Blender nodes (Principled BSDF with procedural Noise/Voronoi bump, beveled edges, weighted normals, transmissive glass, AgX color management). No external meshes, stock assets, or textures are used.

## Rebuild

From the repository root using `/tmp/bpy-env/bin/python` (Blender 5.2.2 + Pillow 12.3.0):

```bash
# Fast preview (800x600, 24 samples)
WIDTH=800 SAMPLES=24 /tmp/bpy-env/bin/python assets/editorial/cocs-godot/render-scene.py

# Production plate (1600x1200, 64 samples, 2 fixed CPU threads)
WIDTH=1600 SAMPLES=64 /tmp/bpy-env/bin/python assets/editorial/cocs-godot/render-scene.py
```

Transient PNG renders are written to `/tmp/opencode/cocs-godot-blender/`, and the final encoded plate is written to `assets/editorial/cocs-godot/critically-damped-umbilical.webp`.
