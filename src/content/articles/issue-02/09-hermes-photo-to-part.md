---
issueNumber: "02"
articleSlug: "hermes-photo-to-part"
index: 9
readerServiceNo: 209
section: "COMPUTATIONAL CAD // METRIC PHOTOGRAMMETRY"
layoutVariant: "opener"
title: "photo-to-part"
kicker: "CAD · Photos to Printable Parts"
headline: "The Model Spent Forty Turns Doing Gear Math by Hand. Now There’s a Bouncer."
deck: "photo-to-part turns a photo with a coin in it, a few measurements or a
  messy scan into a solid you can print, then checks the mesh and renders it
  beside the original so you can compare."
byline: "By SLOPTIMUS PRIME"
category: "Parametric CAD / 3D Printing"
glanceNote: "Six local tools on trimesh and manifold3d, no network connections,
  a 40-call session budget, and build approval that can no longer be switched
  off with an environment variable."
pullQuote: "The plugin was shaped by watching models misbehave and writing down
  what happened."
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
  - label: Plugin Version
    value: 0.1.23 · six tools · no network
  - label: Session Call Budget
    value: 40 calls, with nudges at 60 / 80 / 95%
  - label: Built-In Templates
    value: 16 watertight shapes, spur gear included
verifiedCapabilities:
  - Metric calibration from a coin, a ruler or an ArUco/AprilTag marker, with
    four-point rectification and per-value uncertainty
  - Mesh validation for watertightness, shells, bores, wall thickness and
    printability, with warnings when a named fastener disagrees with the cited
    ISO tables or a 608 bearing disagrees with the SKF size
  - Silhouette overlay search across poses, at 15° and then 1°, that reports
    when the score should only be trusted as a guide
  - Hooks that steer gear requests onto the spur_gear template, reserve the last
    turns for delivery, and keep build approval with Hermes
architecture:
  - "Six offline tools (`photo_part_template`, `photo_part_build`,
    `photo_part_validate`, `photo_part_render`, `photo_part_heal`,
    `photo_part_measure`) executing inside the plugin's trimesh/manifold3d venv
    with an explicit minimal child environment (no leaked API keys)."
  - "Empirical agent-steering hooks (`plugin/photopart/gear_steer.py` &
    `deliver_steer.py`): intercepts `write_file`/`terminal` gear-math tangents
    before `spur_gear` is tried, and blocks endless post-validation
    vision/refine loops past 80% of the 40-call cap."
  - "Versioned non-destructive STL history: writes `name_vN.stl`, backs up any
    replaced mesh into `.p2p_history/`, and preserves face tags
    (`<stl>.faces.json`) across booleans so periodic screw threads aren't
    misflagged as thin walls."
  - "Sparse subdirectory packaging (`mojomast/hermes-photo-to-part/plugin`)
    keeps regression meshes and canary-marked eval files out of end-user
    installs."
fieldNotes:
  - Inspired by Michael Lydick’s video test. The sample in the repo is a generic
    plate with a hook, not a copy of his object.
  - One flat photo cannot see thickness. The skill has to ask you, or mark the
    depth as assumed.
  - CadQuery, build123d and OpenSCAD are not installed for you.
readingGuide:
  - "READING GUIDE // README.md: candid changelog from 0.1.18 to 0.1.23
    documenting every way coding models tried to misbehave."
  - "READING GUIDE // plugin/photopart/gear_steer.py: the greatest docstring of
    November 2026."
  - "READING GUIDE // SECURITY.md: minimal child env, write-denylist checks, and
    zero-network guarantee."
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
  alt: "Technical drafting plate showing a reference coin beside a rectified
    mechanical spur gear, an IoU silhouette alignment ring, and a pre_tool_call
    gate blocking hand-rolled trochoid math."
secondaryMedia:
  kind: "svg-study"
  studyId: "photopart"
  width: 800
  height: 450
  caption: "Calibrate, get bounced, take the template, deliver the file."
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
  sourceUrl: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1e\
    c0e843ce91b480a6caeafed6361/plugin/photopart/gear_steer.py#L1-L24"
sources:
  - label: "README: 0.1.23 catalog hardening, 6-tool table & metrology rules"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843\
      ce91b480a6caeafed6361/README.md"
  - label: "plugin/photopart/gear_steer.py: pre_tool_call involute template
      enforcement"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843\
      ce91b480a6caeafed6361/plugin/photopart/gear_steer.py"
  - label: "plugin/photopart/__init__.py: offline venv re-exec & zero-network
      boundary"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843\
      ce91b480a6caeafed6361/plugin/photopart/__init__.py"
  - label: "SECURITY.md: minimal build environment & eval canary protections"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843\
      ce91b480a6caeafed6361/SECURITY.md"
  - label: "CHANGELOG.md: 23 iterations of real-world CAD agent Failure-Mode
      Engineering"
    url: "https://github.com/mojomast/hermes-photo-to-part/blob/af108f48c2f1ec0e843\
      ce91b480a6caeafed6361/CHANGELOG.md"
---

The best docstring of November is eight lines at the top of `gear_steer.py`. In evaluation runs r17 and r18, `deepseek-v4.1-flash` was given a photo of a gear and six purpose-built tools. It called none of them. It wrote an involute gear script by hand and ran it from the terminal until it hit the 40-turn cap. So now there is a hook. Write a script about involutes, dedendums or trochoids before you have tried `photo_part_template` with shape `spur_gear`, and the call is blocked with a polite note that the template already exists. Try the template once, even if it fails, and the block lifts.

That is the character of the whole thing. The plugin was shaped by watching models misbehave and writing down what happened. `photo_part_measure` takes pixels per millimetre from a coin, a ruler or an ArUco marker and tags every value with its uncertainty. `photo_part_validate` checks watertightness, bores, wall thickness and printability, and warns when a named fastener disagrees with the ISO tables or a 608 bearing disagrees with the SKF size. `photo_part_render` searches poses to score a silhouette overlay against your photo, and labels the score guide-only when the angle makes it unreliable.

Past 80 percent of the budget, the hooks refuse another vanity render and tell the model, in effect, to deliver the file. In 0.1.23 the environment switch that turned off build approval was removed entirely, and build scripts now run with a minimal environment that holds no provider keys. Sixteen templates ship, from a sample plate to a strap hinge. The spur gear is one of them, which is the joke and also the point.
