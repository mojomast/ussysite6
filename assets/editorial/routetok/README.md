# Never Splice Mid-Sentence

An original, procedurally modelled Blender 5.2 / Cycles conceptual still life for **RouteTok** (#106, Folio 08).

- **Image:** `never-splice-mid-sentence.webp`
- **Dimensions:** 1600 × 1200 pixels (4:3 landscape)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of a three-domed brass relay switchboard—showing a closed copper knife switch, a tripped open breaker, and a half-open balance beam carrying a single golden probe sphere—beside an uncut cream paper ticker tape and a pair of wax-sealed tailor shears on a velvet cushion — an editorial still life, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and audited grounding

Grounded in `docs/editorial-audit/routing-rgb.md` (`mojomast/routetok` @ `7016c8d`):

- **The Three-State Circuit Breaker Turret:** RouteTok's `HealthRouter` (`src/router.ts`, `src/types.ts`) maintains a three-state circuit breaker (`closed | open | half-open`) across candidate routes with zero runtime npm dependencies. On a stepped walnut-and-brass manifold (`HEALTH ROUTER · PRE-OUTPUT FAILOVER`) sit three blown-glass relay bells:
  1. **`CLOSED` (Left):** A closed electrolytic copper knife-switch bridge with a glowing emerald indicator jewel and warm tungsten filament loop.
  2. **`OPEN` (Center):** A tripped crimson-glazed porcelain insulator arm raised high above a dark carbonized contact track with a ruby warning jewel.
  3. **`HALF-OPEN · 1 PROBE` (Right):** A precision brass balance beam poising **one single gleaming gold ball-bearing sphere** (`1 PROBE`, representing `halfOpenMaxProbes = 1`) delicately over a narrow copper admission gate.
- **The Un-Spliced Stream & Untouched Shears:** RouteTok performs **pre-output failover only**—retrying on connection error or timeout before output starts, and refusing to splice a second model's tokens onto a committed stream (`test/integration/committed-stream.test.ts`). Across the dark green baize foreground runs a continuous, uncut cream paper telegraph ticker tape emerging from a spoked brass supply reel under a `NO SPLICE` inspection bridge. Beside it on a tufted crimson velvet cushion rests a pair of ornate brass-and-steel tailor's shears bound shut by a crimson silk ribbon and embossed red wax seal.

All geometry and materials are original procedural Blender nodes (Principled BSDF with procedural Noise bump, beveled edges, weighted normals, transmissive borosilicate glass domes, AgX color management).

## Rebuild

From the repository root using `/tmp/bpy-env/bin/python` (Blender 5.2.2 + Pillow 12.3.0):

```bash
# Fast preview (800x600, 24 samples)
WIDTH=800 SAMPLES=24 /tmp/bpy-env/bin/python assets/editorial/routetok/render-scene.py

# Production plate (1600x1200, 64 samples, 2 fixed CPU threads)
WIDTH=1600 SAMPLES=64 /tmp/bpy-env/bin/python assets/editorial/routetok/render-scene.py
```

Transient PNG renders are written to `/tmp/opencode/routetok-blender/`, and the final encoded plate is written to `assets/editorial/routetok/never-splice-mid-sentence.webp`.
