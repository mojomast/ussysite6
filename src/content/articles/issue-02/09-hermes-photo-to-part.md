---
issueNumber: "02"
articleSlug: "hermes-photo-to-part"
index: 9
readerServiceNo: 209
section: "COMPUTATIONAL CAD // METRIC PHOTOGRAMMETRY"
layoutVariant: "opener"
title: "photo-to-part"
kicker: "Coin-Calibrated Photos to Watertight STL—With an Involute Bouncer"
headline: "Stop Freehanding Involute Gears for Forty Turns Straight"
deck: "Turn a coin-scaled photo or messy scan into a validated, printable STL—complete with IoU silhouette overlays, ISO fastener warnings, and hooks that stop LLMs from hallucinating gear math."
byline: "By SLOPTIMUS PRIME · Folio 11"
category: "Parametric CAD / 3D Printing"
glanceNote: "5 GitHub stars, v0.1.23. Six local mesh tools (trimesh + manifold3d, zero network calls), a 40-call session budget governor, non-bypassable build approval, and gear_steer.py born from painful r17/r18 agent transcripts."
pullQuote: "Live runs in r17 and r18 never called the tools—they freehanded involute math in terminal scripts until the 40-turn cap—so gear_steer.py now locks the door until spur_gear is tried."
repoUrl: "https://github.com/mojomast/hermes-photo-to-part"
liveUrl: null
sourceRevision: "af108f48c2f1ec0e843ce91b480a6caeafed6361"
researchedAt: "2026-11-23"
spotInkHex: "#f97316"
secondaryInkHex: "#3ddc97"
techStack:
  - "Python (trimesh + manifold3d)"
  - "OpenCV / GrabCut / ArUco"
  - "STL / 3MF Validation"
  - "Hermes Hooks (v0.1.23)"
  - "ISO Fastener Checks"
metrics:
  - label: "Plugin Version"
    value: "0.1.23 (6 tools · zero network calls)"
  - label: "Session Call Budget"
    value: "40 calls (nudges at 60% / 80% / 95%)"
  - label: "Built-In Templates"
    value: "15 watertight primitives incl. spur_gear"
verifiedCapabilities:
  - "Metric photo calibration (photo_part_measure) from coins, rulers, or ArUco/AprilTag markers with four-point perspective rectification and mm uncertainty tags"
  - "Mesh validation (photo_part_validate) checking watertightness, shell count, circular bores, wall thickness (<0.70 mm warning), overhang, and ISO 261/273/4762/608 bearing mismatches"
  - "Multi-angle silhouette IoU overlay search (photo_part_render) scanning 15° then 1° rotations plus mirror, distinguishing trusted vs. guide_only overlays"
  - "Hard behavioral guardrails: gear_steer.py forces spur_gear template first, budget hooks reserve final turns for delivery, and PHOTOPART_BUILD_APPROVAL off-switch was deleted in 0.1.23"
architecture:
  - "Six offline tools (`photo_part_template`, `photo_part_build`, `photo_part_validate`, `photo_part_render`, `photo_part_heal`, `photo_part_measure`) executing inside the plugin's trimesh/manifold3d venv with an explicit minimal child environment (no leaked API keys)."
  - "Empirical agent-steering hooks (`plugin/photopart/gear_steer.py` & `deliver_steer.py`): intercepts `write_file`/`terminal` gear-math tangents before `spur_gear` is tried, and blocks endless post-validation vision/refine loops past 80% of the 40-call cap."
  - "Versioned non-destructive STL history: writes `name_vN.stl`, backs up any replaced mesh into `.p2p_history/`, and preserves face tags (`<stl>.faces.json`) across booleans so periodic screw threads aren't misflagged as thin walls."
  - "Sparse subdirectory packaging (`mojomast/hermes-photo-to-part/plugin`) keeps regression meshes and canary-marked eval files out of end-user installs."
fieldNotes:
  - "Inspired by Michael Lydick's engineering test video; the repo's plate-clip example is an original generic bracket, not a copy."
  - "Single flat photos leave thickness/depth unobserved—the skill requires asking the user or explicitly marking depth as assumed in spec.json."
  - "CadQuery, build123d, and OpenSCAD are intentionally not auto-installed."
readingGuide:
  - "READING GUIDE // README.md — candid changelog from 0.1.18 to 0.1.23 documenting every way coding models tried to misbehave."
  - "READING GUIDE // plugin/photopart/gear_steer.py — the greatest docstring of November 2026."
  - "READING GUIDE // SECURITY.md — minimal child env, write-denylist checks, and zero-network guarantee."
flexiFreqs:
  - 293.66
  - 392.0
  - 440.0
  - 587.33
plate:
  kind: "carbon-svg"
  svgId: "plate-photopart"
  width: 1600
  height: 1200
  title: "Involute Bouncer & Coin Scale"
  medium: "CARBON LITHOGRAPH · METROLOGY BENCH"
  alt: "Technical drafting plate showing a reference coin beside a rectified mechanical spur gear, an IoU silhouette alignment ring, and a pre_tool_call gate blocking hand-rolled trochoid math."
secondaryMedia:
  kind: "svg-study"
  studyId: "photopart"
  width: 800
  height: 450
  caption: "Walk through coin scale calibration, the gear_steer.py involute bouncer, and watertight spur_gear validation."
codeExcerpt:
  title: "LISTING 9.1 // THE INVOLUTE BOUNCER (plugin/photopart/gear_steer.py)"
  lang: "python"
  code: |
    """Hard-steer gear requests onto ``photo_part_template`` shape ``spur_gear``.

    Live deepseek-v4.1-flash runs in r17 and r18 never called ``photo_part_*``.
    They wrote an involute script with ``write_file`` and ran it from the
    terminal until the 40-turn cap. This module is consulted from
    ``pre_tool_call``. It blocks that path until the spur-gear template has
    been tried, including a failed call, then lifts the block.
    """
    BLOCK_MESSAGE = (
        "[photo-to-part] Call photo_part_template with shape spur_gear before "
        "writing or running a gear or involute script. The plugin already ships "
        "an involute spur-gear template."
    )
  sourceLabel: "plugin/photopart/gear_steer.py L1–L24 · hermes-photo-to-part@af108f4"
  sourceUrl: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843ce91b480a6caeafed6361/plugin/photopart/gear_steer.py#L1-L24"
sources:
  - label: "README — 0.1.23 catalog hardening, 6-tool table & metrology rules"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843ce91b480a6caeafed6361/README.md"
  - label: "plugin/photopart/gear_steer.py — pre_tool_call involute template enforcement"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843ce91b480a6caeafed6361/plugin/photopart/gear_steer.py"
  - label: "plugin/photopart/__init__.py — offline venv re-exec & zero-network boundary"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843ce91b480a6caeafed6361/plugin/photopart/__init__.py"
  - label: "SECURITY.md — minimal build environment & eval canary protections"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843ce91b480a6caeafed6361/SECURITY.md"
  - label: "CHANGELOG.md — 23 iterations of real-world CAD agent Failure-Mode Engineering"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843ce91b480a6caeafed6361/CHANGELOG.md"
---

If you want to know the difference between a weekend prompt wrapper and battle-scarred agent engineering, read the first eight lines of `plugin/photopart/gear_steer.py` in **photo-to-part (`0.1.23`)**. Given six specialized 3D-printing tools (`trimesh` + `manifold3d`), `deepseek-v4.1-flash` looked at a photograph of a gear during evaluation runs `r17` and `r18`, ignored every single tool, opened a blank Python file, and spent all forty turns of its session budget trying to derive involute tooth trochoids from memory in bash. So SLOPTIMUS PRIME built a `pre_tool_call` bouncer: mention `involute`, `dedendum`, or `trochoid` in `write_file` before trying `photo_part_template(shape="spur_gear")` and the hook politely confiscates your chalk.

Everything else in the pipeline shows the same bruised empirical wisdom. `photo_part_measure` extracts pixels-per-millimetre from a coin, ruler, or ArUco tag with perspective rectification; `photo_part_validate` checks watertightness, bore counts, 0.70 mm wall limits (cleverly exempting periodic screw-thread crests via `<stl>.faces.json` sidecars), and ISO fastener/608-bearing dimensions; and `photo_part_render` sweeps 15-degree then 1-degree pose rotations to score silhouette IoU against the original photo. By `0.1.23`, even the environment-variable escape hatch for skipping build approval (`PHOTOPART_BUILD_APPROVAL`) was deleted outright, child Python builds receive only a scrubbed minimal env, and past 80% of the 40-call budget the hooks refuse vanity re-renders and tell the model: *deliver the validated STL now*.
