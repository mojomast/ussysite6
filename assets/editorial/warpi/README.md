# The Unlicensed Sidecar

Original procedurally modelled Blender 5.2 / Cycles editorial exaggeration for **Warpi** (#109, Folio 11).

- **Image:** `the-unlicensed-sidecar.webp`
- **Dimensions:** 1600 × 1200 pixels (landscape 4:3)
- **Encoding:** RGB WebP, quality 92, method 6
- **Alt:** A photorealistic studio still life of a sleek anodized-aluminum terminal monolith bypassed at its velvet-roped turnstile and plumbed via twin copper stdio pipes to a warm brass sidecar crowned with a sculpted Pi emblem and a miniature steel credential vault — an editorial illustration, not a product screenshot.
- **Scene source:** `render-scene.py`

## Concept and editorial grounding

Grounded in the audited `warpi` object (`docs/editorial-audit/warpi.md`, pinned to `mojomast/warpi` @ `760f4fe04caf335393e6e88f213c84f9c6eb4284`):

1. **The Sleek Upstream Monolith (`crates/warp_core`, `crates/ai_ui`)**: On the left stands a minimalist, silver anodized-aluminum mid-century terminal chassis with rounded corners and stacked luminous slate/cyan horizontal command-block louvers representing the inherited upstream Warp terminal and block UI. In front of its lower portal sits a miniature velvet-roped brass turnstile (`CLOUD LOGIN`) standing completely empty and bypassed—reflecting that configuring a local provider skips the Warp account gate.
2. **The Local Pi Sidecar & Stdio Pipes (`crates/standalone_agent`, `standalone/pi-helper`)**: Bolted onto the right flank via twin gleaming curved copper pneumatic pipes stamped `STDIN` and `STDOUT` (with a brass pressure gauge) is a warm, hand-machined brass-and-copper engine sidecar crowned with a sculptural three-dimensional solid-brass Greek **π (Pi)** emblem, glowing quartz vacuum-tube cylinder chambers, and a rotary `BYOK ENDPOINT` selector dial.
3. **The OS Keychain Vault (`CredentialRef`)**: Beneath the sidecar rests a miniature heavy dark-steel combination strongbox tethered by a brass chain to a solid-brass key and stamped tag (`CREDENTIAL REF`), representing `provider.rs` storing only a reference to the platform secret store rather than plaintext API keys.

No claims of air-gapped operation or zero network sockets are made; outbound inference traffic goes to the user-configured OpenAI-compatible endpoint.

## Rebuild

From the repository root, using the cached Blender 5.2.2 Python environment and Pillow:

```bash
mkdir -p /tmp/opencode/warpi-blender
WIDTH=800 SAMPLES=24 WEBP=/tmp/opencode/warpi-blender/preview.webp \
  /tmp/bpy-env/bin/python assets/editorial/warpi/render-scene.py

WIDTH=1600 SAMPLES=64 \
  /tmp/bpy-env/bin/python assets/editorial/warpi/render-scene.py
```

`WIDTH`, `SAMPLES`, and `WEBP` are optional environment overrides. Height is always `round(WIDTH * 0.75)`. Transient PNG renders are written to `/tmp/opencode/warpi-blender/`.
