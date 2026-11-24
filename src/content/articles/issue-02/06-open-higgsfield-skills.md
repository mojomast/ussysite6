---
issueNumber: "02"
articleSlug: "open-higgsfield-skills"
index: 6
readerServiceNo: 206
section: "OPEN-WEIGHTS CINEMA // 37 AGENT SKILLS"
layoutVariant: "opener"
title: "open-higgsfield-skills"
kicker: "One Prompt In, One Resumable Manifest, Zero Closed APIs"
headline: "Thirty-Seven Film-Crew Skills Running on Open Weights and 8.5 Colab Units"
deck: "An agent-agnostic pack of 37 Agent Skills and 70 ComfyUI routes—from FLUX Klein keyframes and LTX-2.5 video to Wan camera arcs and Chatterbox voiceover."
byline: "By SLOPTIMUS PRIME · Folio 08"
category: "Generative Video / Agent Skills"
glanceNote: "61 GitHub stars. Teaches Claude Code, Cursor, Codex, OpenCode, Hermes, or Pi to direct open-weights ComfyUI workflows. Demo video ran 14 jobs on a Colab RTX PRO 6000 in ~8.5 compute units."
pullQuote: "Stills come first, spend gates wait for a human yes, and when a GPU-minute cap hits, direct.py logs cap_hit and stops—never rendering quietly in the dark."
repoUrl: "https://github.com/mojomast/open-higgsfield-skills"
liveUrl: null
sourceRevision: "5a1a2d492540d349a2d84d413e4b71f88aa94519"
researchedAt: "2026-11-23"
spotInkHex: "#a855f7"
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
  - "Nine-stage resumable JSON manifest pipeline in skills/video-director/scripts/direct.py (intake, tier preflight, bible, shot plan, stills, video, continuity, audio, assembly)"
  - "Three hardware VRAM tiers: draft (16 GB), standard (24 GB), and max (40 GB) with hard retry and render ceilings"
  - "Data-driven 70-route decision table (skills/video-director/references/routing.md) extensible by adding a single Markdown row"
  - "End-to-end 86-second demo cut verified on a Google Colab RTX PRO 6000 (96 GB) across FLUX3 Klein, LTX-2.5 i2v, Qwen-Image-Edit 2511, BiRefNet, Wan Fun Camera, and Chatterbox"
architecture:
  - "Zero-dependency orchestrator (`skills/video-director/scripts/direct.py`): stdlib-only Python CLI supporting `routes`, `validate`, `tier`, `run --dry-run`, `approve`, and `package --target google-colab`."
  - "Stills-before-motion invariant: no video job is ever scheduled for a shot until its keyframe still reaches `approved`, saving expensive I2V GPU minutes on bad compositions."
  - "Web-safe delivery encoding (`5a1a2d4`): `yuv420p`, H.264 High profile, and `+faststart` enforced across assembly and caption burn-in so MP4s play in browsers without transcoding."
  - "Fault-isolated ComfyUI custom node loader (`motionfield_nodes/__init__.py`) skips broken sibling modules rather than crashing the whole pack."
fieldNotes:
  - "Explicitly disclosed: most community #OpenSourceHiggsfield routes were checked statically and via dry runs, NOT run end-to-end on a GPU; only the demo table's routes ran on Colab."
  - "In the 1:26 demo run, final assembly/captions used ffmpeg directly rather than film-assembly, and still-qa, shot-qc, continuity-check, and music were not exercised."
  - "License caveat flagged before spend: Lightricks LTX-2 weights use a non-OSI Community License that matters when commercial_use is true."
readingGuide:
  - "READING GUIDE // README.md — shot-by-shot provenance table for the 86-second Colab demo."
  - "READING GUIDE // skills/video-director/SKILL.md — hard rules on stills-first gating, spend caps, and LTX-2 licensing."
  - "READING GUIDE // skills/video-director/scripts/direct.py — VRAM tier presets (16/24/40 GB) and dry-run planner."
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
  alt: "Isometric film-director switching desk routing a single JSON manifest strip through 16GB/24GB/40GB VRAM gates, a stills-first approval shutter, and six open-weights ComfyUI lenses."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 6.1 // VRAM TIER PRESETS & RETRY CAPS (skills/video-director/scripts/direct.py)"
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
  sourceLabel: "skills/video-director/scripts/direct.py L29–L39 · open-higgsfield-skills@5a1a2d4"
  sourceUrl: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a2d84d413e4b71f88aa94519/skills/video-director/scripts/direct.py#L29-L39"
sources:
  - label: "open-higgsfield-skills README — 86s Colab demo breakdown & limitations"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a2d84d413e4b71f88aa94519/README.md"
  - label: "skills/video-director/SKILL.md — 9-stage pipeline, spend gates & LTX-2 license rule"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a2d84d413e4b71f88aa94519/skills/video-director/SKILL.md"
  - label: "skills/video-director/scripts/direct.py — stdlib manifest driver & VRAM tiers"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a2d84d413e4b71f88aa94519/skills/video-director/scripts/direct.py"
  - label: "skills/video-director/references/routing.md — 70-route ComfyUI decision table"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a2d84d413e4b71f88aa94519/skills/video-director/references/routing.md"
  - label: "THIRD_PARTY_LICENSES.md — upstream #OpenSourceHiggsfield workflow attributions"
    url: "https://github.com/mojomast/open-higgsfield-skills/blob/5a1a2d492540d349a2d84d413e4b71f88aa94519/THIRD_PARTY_LICENSES.md"
---

At **61 stars**, `open-higgsfield-skills` quickly became the breakout crowd favorite of SLOPTIMUS PRIME's autumn sprint, and for good reason: hosted "AI film studios" charge a monthly cover fee to wrap closed APIs behind a shiny prompt box, whereas this pack hands any Agent-Skills-compatible coding assistant **37 plain-folder skills** and **70 data-driven ComfyUI routes** that run exclusively on open weights. Hand `video-director` a one-liner and it compiles a story bible, shot plan, VRAM tier (`16 GB` draft, `24 GB` standard, `40 GB` max), and a single resumable JSON manifest—refusing to roll a single frame of LTX-2.5 video until the FLUX Klein keyframe still passes review, and warning you up front if Lightricks' non-OSI LTX-2 Community License clashes with commercial intent.

True to house style, the repository refuses to pretend every route was battle-tested on an H100 cluster. It spells out that most of the 70 community `#OpenSourceHiggsfield` workflows were audited statically and dry-run, while documenting the exact **14 jobs** that *did* render live on a single Google Colab RTX PRO 6000 (96 GB) in **8.5 compute units** (including the ~99 GB weight pull): an astronaut chained across desert ridges, a raincoat fox matted with BiRefNet and edited via Qwen-Image-Edit 2511, a 45-degree Wan Fun Camera arc, and Chatterbox narration—finished with `yuv420p` `+faststart` H.264 so the MP4 actually plays on the first click.
