---
issueNumber: "02"
articleSlug: "hermes-templeos"
index: 10
readerServiceNo: 210
section: "VIRTUAL MACHINES // 640x480 RING-0 CO-PILOT"
layoutVariant: "essay"
title: "TempleOS for Hermes"
kicker: "640×480, 16 Colors, -nic none, One Shared QEMU Screen"
headline: "Sharing a Live TempleOS Prompt With an Agent That Yields When You Type"
deck: "Boot Temple of Hermes or TinkerOS inside an air-gapped QEMU guest where you and Hermes share one 640×480 screen, HolyC injection over COM1, and a two-second human-input yield."
byline: "By SLOPTIMUS PRIME · Folio 12"
category: "QEMU Virtualization / Shared Screen"
glanceNote: "v0.2.3. Runs QEMU with -nic none, QMP/VNC/COM1 over local Unix sockets, PNG 640×480 vision (~414 visual tokens), framed COM1 file transfer without mounting live RedSea qcow2, and an optional HD Terry tribute companion."
pullQuote: "Networking is always off, live RedSea disks are never host-mounted while QEMU holds them open, and touching your mouse makes the agent step back for two seconds."
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
  - "Doctor preflight checking whether /dev/kvm can actually be opened (not merely stat'd) and verifying pinned ISO downloads by SHA-256"
  - "Four dedicated tools (templeos_vm, templeos_screen, templeos_input, templeos_files) surfaced via system-prompt reminder when Hermes Tool Search defers plugins"
  - "Shared live Desktop pane with Take Control / Hand Back pause toggle and automatic ~2-second yield whenever human keyboard or mouse activity occurs"
  - "Framed COM1 serial protocol + HolyC helper for host-sandboxed file exchange without corrupting live RedSea qcow2 images"
architecture:
  - "Air-gapped QEMU child process (`-nic none`) exposing QMP, VNC, and COM1 exclusively on local Unix domain sockets inside the plugin data directory, backed by a writable qcow2 overlay so `savevm` works even on live CDs."
  - "Dual-path screen reading: `read_text` prefers HRPC/COM1 serial output when open (`v0.2.3`) or falls back to 8×8 glyph decoding; `look` emits lossless 640×480 16-color PNGs (~414 visual tokens) rather than blurry JPEGs."
  - "Zero-import startup (`__init__.py`): lazy-loads QEMU/ISO handlers only inside tool invocations and injects a concise `TEMPLEOS_SYSTEM_PROMPT_SECTION` telling the model never to roll its own VNC client or dial Unix sockets directly."
  - "Respectful tribute framing in memory of Terry A. Davis (1969–2018), defaulting to the public-domain Temple of Hermes 0.1.3 (TinkerOS 5.20-rc10 fork) while supporting stock TempleOS 5.03 and ZealOS."
fieldNotes:
  - "QEMU binaries and OS ISOs are never bundled in the repository; doctor fetches official ISOs only on request with SHA-256 verification."
  - "VMMouse absolute cursor positioning was verified on TinkerOS during the flavor bake-off."
  - "The Desktop pane includes an optional HD Terry sprite with 6 animation states and 69 sourced quotes, toggleable via Hide Terry without altering the four tool schemas."
readingGuide:
  - "READING GUIDE // README.md — architecture, credits to Terry A. Davis & TinkerOS/ZealOS communities, and shared-control etiquette."
  - "READING GUIDE // __init__.py — deferred Tool Search prompt injection and fast lazy registration."
  - "READING GUIDE // docs/FILES.md — framed COM1 transfer protocol avoiding live RedSea corruption."
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
  alt: "Schematic of a 4:3 sixteen-color CRT displaying a T:/Home> HolyC prompt linked via Unix sockets QMP, VNC, and COM1 to a dual-operator desk with a 2-second human-priority relay."
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
  sourceUrl: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f58720703f76376012eb2/__init__.py#L15-L26"
sources:
  - label: "hermes-templeos README — QEMU -nic none setup, flavors & shared-pane controls"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f58720703f76376012eb2/README.md"
  - label: "__init__.py — lazy registration & Tool Search system-prompt reminder"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f58720703f76376012eb2/__init__.py"
  - label: "docs/FILES.md — framed COM1 serial file transfer protocol"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f58720703f76376012eb2/docs/FILES.md"
  - label: "docs/DISK-IMAGE.md — writable qcow2 overlay & savevm snapshot handling"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f58720703f76376012eb2/docs/DISK-IMAGE.md"
  - label: "CHANGELOG.md — v0.2.3 HRPC-first COM1 & guest token push"
    url: "https://github.com/mojomast/hermes-templeos/blob/bd707842d5e62a1e426f58720703f76376012eb2/CHANGELOG.md"
---

On paper, pairing an LLM agent with Terry A. Davis's public-domain 64-bit, ring-0, HolyC operating system sounds like a late-night shitpost. In practice, **TempleOS for Hermes (`v0.2.3`)** turns out to be one of the cleanest computer-use sandboxes in the entire catalog—precisely because TempleOS was designed at **640×480 in 16 crisp colors with zero network stack**. A lossless PNG screenshot costs roughly **414 visual tokens** (no JPEG mush), QEMU boots with `-nic none` over local Unix sockets (`QMP`, `VNC`, and `COM1`), and a writable `qcow2` overlay lets `savevm` checkpoint state even over a read-only ISO.

Every sharp edge of QEMU automation has a scar tissue comment to match: `doctor` tests whether `/dev/kvm` can actually be *opened* rather than fooled by a world-unreadable device node; file transfers speak a framed protocol over `COM1` instead of host-mounting a live RedSea filesystem while QEMU holds it open; and the system prompt explicitly warns the model to hit `Esc` if TempleOS's `AutoComplete` window steals focus—and never to write its own rogue Python VNC client. Best of all, you and the agent watch the exact same Desktop pane, where clicking or typing automatically pauses agent input for two seconds so nobody fights over the cursor at `T:/Home>`.
