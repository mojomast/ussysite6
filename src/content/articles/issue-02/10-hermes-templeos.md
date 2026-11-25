---
issueNumber: "02"
articleSlug: "hermes-templeos"
index: 10
readerServiceNo: 210
section: "VIRTUAL MACHINES // 640x480 RING-0 CO-PILOT"
layoutVariant: "essay"
title: "TempleOS for Hermes"
kicker: "Virtual Machines · One Shared Screen"
headline: "640 by 480, Sixteen Colours, Two Pilots"
deck: "A Hermes plugin that boots a TempleOS-family guest in QEMU with
  networking off, and lets you and the agent share one live screen. Touch the
  keyboard and the agent waits."
byline: "By SLOPTIMUS PRIME"
category: "QEMU Virtualization / Shared Screen"
glanceNote: "v0.2.3. Defaults to Temple of Hermes 0.1.3, a public-domain
  TinkerOS fork; stock TempleOS 5.03, TinkerOS and ZealOS are optional. QEMU and
  ISOs are not bundled. Made in memory of Terry A. Davis."
pullQuote: "It is a tribute, and it is built like one."
repoUrl: "https://github.com/mojomast/hermes-templeos"
liveUrl: null
sourceRevision: "bd707842d5e62a1e426f58720703f76376012eb2"
researchedAt: "2026-11-23"
spotInkHex: "#eab308"
secondaryInkHex: "#38bdf8"
techStack:
  - "Python 3.10+"
  - "QEMU (x86_64, -nic none)"
  - "HolyC / TinkerOS / TempleOS"
  - "Unix Sockets (QMP · VNC · COM1)"
  - "Hermes Desktop Pane"
metrics:
  - label: "Display Frame"
    value: "640×480 PNG · 16 colors (~414 tokens)"
  - label: "Network Interface"
    value: "Always disabled (-nic none)"
  - label: "Plugin Release"
    value: "v0.2.3 (HRPC-first COM1)"
verifiedCapabilities:
  - "Doctor preflight checking whether /dev/kvm can actually be opened (not
    merely stat'd) and verifying pinned ISO downloads by SHA-256"
  - "Four dedicated tools (templeos_vm, templeos_screen, templeos_input,
    templeos_files) surfaced via system-prompt reminder when Hermes Tool Search
    defers plugins"
  - "Shared live Desktop pane with Take Control / Hand Back pause toggle and
    automatic ~2-second yield whenever human keyboard or mouse activity occurs"
  - "Framed COM1 serial protocol + HolyC helper for host-sandboxed file exchange
    without corrupting live RedSea qcow2 images"
architecture:
  - "Air-gapped QEMU child process (`-nic none`) exposing QMP, VNC, and COM1
    exclusively on local Unix domain sockets inside the plugin data directory,
    backed by a writable qcow2 overlay so `savevm` works even on live CDs."
  - "Dual-path screen reading: `read_text` prefers HRPC/COM1 serial output when
    open (`v0.2.3`) or falls back to 8×8 glyph decoding; `look` emits lossless
    640×480 16-color PNGs (~414 visual tokens) rather than blurry JPEGs."
  - "Zero-import startup (`__init__.py`): lazy-loads QEMU/ISO handlers only
    inside tool invocations and injects a concise
    `TEMPLEOS_SYSTEM_PROMPT_SECTION` telling the model never to roll its own VNC
    client or dial Unix sockets directly."
  - "Respectful tribute framing in memory of Terry A. Davis (1969–2018),
    defaulting to the public-domain Temple of Hermes 0.1.3 (TinkerOS 5.20-rc10
    fork) while supporting stock TempleOS 5.03 and ZealOS."
fieldNotes:
  - Networking is always off, and the plugin never mounts the live qcow2 while
    QEMU has it open.
  - Absolute mouse clicks and serial were proved on TinkerOS during the flavour
    bake-off.
  - The system prompt tells the model never to write its own VNC client or dial
    the sockets directly, and to press Esc if AutoComplete steals focus.
readingGuide:
  - "READING GUIDE // README.md: architecture, credits to Terry A. Davis &
    TinkerOS/ZealOS communities, and shared-control etiquette."
  - "READING GUIDE // __init__.py: deferred Tool Search prompt injection and
    fast lazy registration."
  - "READING GUIDE // docs/FILES.md: framed COM1 transfer protocol avoiding live
    RedSea corruption."
flexiFreqs:
  - 261.63
  - 329.63
  - 392.0
  - 523.25
plate:
  kind: "carbon-svg"
  svgId: "plate-templeos"
  width: 1600
  height: 1200
  title: "640×480 Shared Shrine (-nic none)"
  medium: "CARBON LITHOGRAPH · QEMU CO-PILOT"
  alt: "Schematic of a 4:3 sixteen-color CRT displaying a T:/Home> HolyC prompt
    linked via Unix sockets QMP, VNC, and COM1 to a dual-operator desk with a
    2-second human-priority relay."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 10.1 // DEFERRED TOOL-SEARCH REMINDER & HOLY-C LOOP (__init__.py)"
  lang: "python"
  code: |
    TEMPLEOS_SYSTEM_PROMPT_SECTION = (
        "TempleOS/TinkerOS is driven ONLY with templeos_vm, templeos_screen, "
        "templeos_input, and templeos_files (toolset templeos). Hermes Tool Search "
        "defers plugin tools — if those four are not in your visible tool list, "
        'call tool_search(["templeos"]) or skill_view("templeos:templeos-operator"), '
        "then use them. Never write a VNC client, dial plugin-data sockets, or run "
        "qemu/screendump yourself.\n\n"
        "HolyC one-liner at the T:/Home> prompt: templeos_vm op=status (start if "
        "needed), templeos_screen op=wait_idle then read_text, Esc if AutoComplete "
        "stole focus, templeos_input op=holyc with the source, then wait_idle and "
        "read_text. Report the printed text and the numeric result."
    )
  sourceLabel: "__init__.py L15–L26 · hermes-templeos@bd70784"
  sourceUrl: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e42\
    6f58720703f76376012eb2/__init__.py#L15-L26"
sources:
  - label: "hermes-templeos README: QEMU -nic none setup, flavors & shared-pane
      controls"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f5872\
      0703f76376012eb2/README.md"
  - label: "__init__.py: lazy registration & Tool Search system-prompt reminder"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f5872\
      0703f76376012eb2/__init__.py"
  - label: "docs/FILES.md: framed COM1 serial file transfer protocol"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f5872\
      0703f76376012eb2/docs/FILES.md"
  - label: "docs/DISK-IMAGE.md: writable qcow2 overlay & savevm snapshot handling"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f5872\
      0703f76376012eb2/docs/DISK-IMAGE.md"
  - label: "CHANGELOG.md: v0.2.3 HRPC-first COM1 & guest token push"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f5872\
      0703f76376012eb2/CHANGELOG.md"
---

Terry A. Davis wrote TempleOS: a 64-bit operating system with its own language, HolyC, its own compiler, a 640 by 480 sixteen-colour display and, by design, no network stack. He made it largely alone. The plugin opens with his name and his years, 1969 to 2018, and asks you to be decent when you demo it. We would like to start there too.

It turns out his constraints make a remarkably good place for an agent to work. A screenshot at 640 by 480 is a crisp PNG of about 414 visual tokens, not a smeared JPEG. QEMU runs with `-nic none`, its control, display and serial ports on Unix sockets in the plugin’s own folder, over a writable qcow2 so snapshots work even from a live CD. Files move over COM1 with a small framed protocol and a HolyC helper, because mounting a live RedSea disk while QEMU has it open is how you lose a disk. The doctor checks whether `/dev/kvm` can actually be opened, not just whether it exists.

What makes it feel human is the shared pane. You and the agent watch the same screen. Take control and the agent pauses. In shared mode, when you type or click, the agent holds off for about two seconds, so nobody fights over the cursor at the `T:/Home>` prompt. There is an optional companion in the pane, HD Terry, with 69 sourced quotes and a button to hide him. It is a tribute, and it is built like one.
