---
issueNumber: "02"
articleSlug: "open-higgsfield-skills"
index: 6
readerServiceNo: 206
section: "OPEN-WEIGHTS CINEMA // 37 AGENT SKILLS"
layoutVariant: "opener"
title: "open-higgsfield-skills"
kicker: "Open-Weights Video · 37 Agent Skills"
headline: "A Film Crew in Thirty-Seven Folders"
deck: "An agent-agnostic pack that teaches a coding agent to plan, shoot and cut
  a short film on your own ComfyUI, using only models whose weights you can
  download."
byline: "By SLOPTIMUS PRIME"
category: "Generative Video / Agent Skills"
glanceNote: "37 Agent Skills and a routing table of 70 routes. The 86-second
  demo ran 14 jobs on one Google Colab RTX PRO 6000 in about 8.5 compute units,
  including the roughly 99 GB model download."
pullQuote: "Hosted AI film studios sell you a prompt box with closed models
  behind it and a meter running."
repoUrl: "https://github.com/mojomast/open-higgsfield-skills"
liveUrl: null
sourceRevision: "5a1a2d492540d349a2d84d413e4b71f88aa94519"
researchedAt: "2026-11-23"
spotInkHex: "#e11d48"
secondaryInkHex: "#f5a623"
techStack:
  - "Python (stdlib driver)"
  - "ComfyUI API Workflows"
  - "FLUX Klein + LTX-2.x"
  - "Qwen-Image-Edit + Wan"
  - "Chatterbox + BiRefNet"
  - "Google Colab / Local GPU"
metrics:
  - label: "Skill Collection"
    value: "37 Agent Skills · 70 routing rows"
  - label: "Demo Colab Run"
    value: "14 jobs · ~8.5 compute units · ~99 GB weights"
  - label: "Community Reception"
    value: "61 GitHub stars (#OpenSourceHiggsfield)"
verifiedCapabilities:
  - "Nine-stage resumable JSON manifest pipeline in
    skills/video-director/scripts/direct.py (intake, tier preflight, bible, shot
    plan, stills, video, continuity, audio, assembly)"
  - "Three hardware VRAM tiers: draft (16 GB), standard (24 GB), and max (40 GB)
    with hard retry and render ceilings"
  - "Data-driven 70-route decision table
    (skills/video-director/references/routing.md) extensible by adding a single
    Markdown row"
  - "End-to-end 86-second demo cut verified on a Google Colab RTX PRO 6000 (96
    GB) across FLUX3 Klein, LTX-2.5 i2v, Qwen-Image-Edit 2511, BiRefNet, Wan Fun
    Camera, and Chatterbox"
architecture:
  - "Zero-dependency orchestrator (`skills/video-director/scripts/direct.py`):
    stdlib-only Python CLI supporting `routes`, `validate`, `tier`, `run
    --dry-run`, `approve`, and `package --target google-colab`."
  - "Stills-before-motion invariant: no video job is ever scheduled for a shot
    until its keyframe still reaches `approved`, saving expensive I2V GPU
    minutes on bad compositions."
  - "Web-safe delivery encoding (`5a1a2d4`): `yuv420p`, H.264 High profile, and
    `+faststart` enforced across assembly and caption burn-in so MP4s play in
    browsers without transcoding."
  - "Fault-isolated ComfyUI custom node loader (`motionfield_nodes/__init__.py`)
    skips broken sibling modules rather than crashing the whole pack."
fieldNotes:
  - The demo’s final cut, captions and title cards were made with ffmpeg, not
    the film-assembly skill. Still QA, shot QC, continuity and music were not
    exercised in that run.
  - No model weights live in the repo. You bring a ComfyUI server and download
    them yourself.
  - "The workflows come from #OpenSourceHiggsfield hackathon projects. Their
    credits and licenses are kept in THIRD_PARTY_LICENSES.md and licenses/."
readingGuide:
  - "READING GUIDE // README.md: shot-by-shot provenance table for the 86-second
    Colab demo."
  - "READING GUIDE // skills/video-director/SKILL.md: hard rules on stills-first
    gating, spend caps, and LTX-2 licensing."
  - "READING GUIDE // skills/video-director/scripts/direct.py: VRAM tier presets
    (16/24/40 GB) and dry-run planner."
flexiFreqs:
  - 220.0
  - 277.18
  - 329.63
  - 440.0
plate:
  kind: "carbon-svg"
  svgId: "plate-higgsfield"
  width: 1600
  height: 1200
  title: "Thirty-Seven Reels on One Manifest"
  medium: "CARBON LITHOGRAPH · FILM ROUTING BENCH"
  alt: "Isometric film-director switching desk routing a single JSON manifest
    strip through 16GB/24GB/40GB VRAM gates, a stills-first approval shutter,
    and six open-weights ComfyUI lenses."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 6.1 // VRAM TIER PRESETS & RETRY CAPS
    (skills/video-director/scripts/direct.py)"
  lang: "python"
  code: |
    TIERS = {
        "draft":    {"min_vram": 16, "still_route": "still.flux2_4b", "still_wh": (1024, 576), "video_wh": (512, 288),
                     "caps": {"still_retries": 1, "still_variants": 1, "video_retries": 0, "continuity_regens": 0, "pass_mean": 3.0, "pass_min": 2},
                     "transition": "transition.cut", "upscale": False, "grade": False},
        "standard": {"min_vram": 24, "still_route": "still.klein", "still_wh": (1280, 704), "video_wh": (640, 352),
                     "caps": {"still_retries": 2, "still_variants": 1, "video_retries": 1, "continuity_regens": 1, "pass_mean": 3.5, "pass_min": 3},
                     "transition": "transition.cut", "upscale": False, "grade": True},
        "max":      {"min_vram": 40, "still_route": "still.klein_base", "still_wh": (1280, 704), "video_wh": (768, 448),
                     "caps": {"still_retries": 3, "still_variants": 2, "video_retries": 2, "continuity_regens": 2, "pass_mean": 4.0, "pass_min": 3},
                     "transition": "transition.flf", "upscale": True, "grade": True},
    }
  sourceLabel: "skills/video-director/scripts/direct.py L29–L39 ·
    open-higgsfield-skills@5a1a2d4"
  sourceUrl: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d49254\
    0d349a2d84d413e4b71f88aa94519/skills/video-director/scripts/direct.py#L29-L\
    39"
sources:
  - label: "open-higgsfield-skills README: 86s Colab demo breakdown & limitations"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a\
      2d84d413e4b71f88aa94519/README.md"
  - label: "skills/video-director/SKILL.md: 9-stage pipeline, spend gates & LTX-2
      license rule"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a\
      2d84d413e4b71f88aa94519/skills/video-director/SKILL.md"
  - label: "skills/video-director/scripts/direct.py: stdlib manifest driver & VRAM
      tiers"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a\
      2d84d413e4b71f88aa94519/skills/video-director/scripts/direct.py"
  - label: "skills/video-director/references/routing.md: 70-route ComfyUI decision
      table"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a\
      2d84d413e4b71f88aa94519/skills/video-director/references/routing.md"
  - label: "THIRD_PARTY_LICENSES.md: upstream #OpenSourceHiggsfield workflow
      attributions"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a\
      2d84d413e4b71f88aa94519/THIRD_PARTY_LICENSES.md"
---

Hosted AI film studios sell you a prompt box with closed models behind it and a meter running. This pack does the same job in the open. Each of its 37 skills is a plain folder with a SKILL.md, stdlib-only Python and ComfyUI workflows, so Claude Code, Codex, Cursor, OpenCode, Hermes or Pi can pick them up. Give `video-director` one line, say a lighthouse keeper finds a message in a bottle, and it writes a story bible and a shot list, picks a tier for your GPU (16, 24 or 40 GB), and keeps every prompt, seed and cost in one resumable manifest.

It has rules, and they are good ones. Stills come first: no video is rendered for a shot until its keyframe is approved. Caps are hard; when the GPU-minute ceiling is reached it logs `cap_hit` and stops, rather than rendering quietly into your bill. On Colab, spending waits for a human yes. And before that spend gate, it tells you that the LTX-2 weights use a community license that is not OSI-approved.

The honesty extends to itself. Most routes were checked statically and with dry runs, not run end to end on a GPU, and the README says so near the top. What did run is listed shot by shot: an astronaut on a red ridge, a fox in a yellow raincoat while the rain turns to snow, a vintage camera on a 45-degree arc, a lighthouse in a storm, a robot painting in a studio. At 61 stars when we checked, it was the most-starred repository on this month’s bench.
