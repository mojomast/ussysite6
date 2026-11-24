---
issueNumber: "02"
articleSlug: "eoh"
index: 8
readerServiceNo: 208
section: "SPATIAL INTELLIGENCE // LIVE 3D GLOBE PANE"
layoutVariant: "essay"
title: "Eye Of Hermes (EOH)"
kicker: "Ask Hermes. Fly the Globe. Tune a Berlin Radio Waterfall."
headline: "A 3D Globe Beside Your Chat—With Live SDR Receivers and a Hard No on Stalking"
deck: "Eye Of Hermes embeds a fork of God's Eye View inside Hermes Desktop and Webapp, driving flights, satellites, FLIR shots, and KiwiSDR waterfalls while refusing person-tracking."
byline: "By SLOPTIMUS PRIME · Folio 10"
category: "Geospatial Pane / Public OSINT"
glanceNote: "10 GitHub stars, v0.2.10. Connects Bilawal Sidhu's God's Eye View to Hermes via its existing voice-action runner, injects a zero-RPC cached map status line per turn, and enforces aggregate-only sensor policy in gev/policy.py."
pullQuote: "Public aircraft, vessels, satellites, weather, and Berlin 2-meter repeaters are fair game; searching for a person is refused before the call ever reaches the globe."
repoUrl: "https://github.com/mojomast/EOH"
liveUrl: null
sourceRevision: "9d433e49645df8ee549b58467876eb1e5daa0f34"
researchedAt: "2026-11-23"
spotInkHex: "#10b981"
secondaryInkHex: "#38bdf8"
techStack:
  - "Python 3.10+"
  - "God's Eye View Fork (Cesium/WebGL)"
  - "Hermes Pane SDK (v0.2.10)"
  - "ReceiverBook / KiwiSDR / OpenWebRX"
  - "Relay Snapshot Cache"
metrics:
  - label: "Plugin Release"
    value: "v0.2.10 (plugin id: godseye)"
  - label: "WebGL Recovery Cap"
    value: "Up to 3 context recoveries / 20s"
  - label: "Community Stars"
    value: "10 GitHub stars"
verifiedCapabilities:
  - "Drives camera flights, landmark pins, routes, FLIR/NOIR shader styles, and Director multi-shot scenes through God's Eye View's native voice-action runner"
  - "Public SDR receiver layer (v0.2.8) streaming live audio + floating spectrum waterfalls from KiwiSDR and OpenWebRX nodes directly over the 3D globe"
  - "Cached single-line pre_llm_call turn state (camera center, range, pitch, heading, active layers, pins) without polling or blocking a busy WebGL pane"
  - "Pre-flight policy filter (gev/policy.py) blocking facial recognition and individual person tracking"
architecture:
  - "Single-globe voice-runner reuse: rather than inventing a parallel DOM API, EOH dispatches Hermes tool invocations through God's Eye View's existing voice-action runner."
  - "Token-frugal responses: large geospatial queries return compact IDs and counts by default, expanding full rows, geometry, or snapshots only when `detail=full` is passed."
  - "Actionable error contracts: failed tool calls return `{ code, message, fix }` instructing the agent on the exact recovery step (open pane, retry, or rebuild)."
  - "WebGL lifecycle resilience: preserves the WebGL context across layout resizes, pauses rendering when hidden, and auto-recovers lost contexts up to 3 times in 20 seconds before falling back to a manual reload prompt."
fieldNotes:
  - "Built on a fork of Bilawal Sidhu's God's Eye View (LICENSE.upstream-gods-eye-view preserved alongside tile credits for Cesium ion, Google Maps, and Esri)."
  - "In-pane SDR audio/waterfall playback applies only to http:// KiwiSDR and OpenWebRX streams; HTTPS-only SpyServer/UberSDR pins open externally via OPEN ↗ and are never iframed."
  - "Setting GODSEYE_TURN_STATE=0 disables the per-turn map summary line."
readingGuide:
  - "READING GUIDE // README.md — tour of London overlays, Tokyo FLIR Director shots, and Berlin 145.500 MHz OpenWebRX waterfalls."
  - "READING GUIDE // gev/policy.py — 19-line policy gate refusing person/face tracking."
  - "READING GUIDE // docs/KNOWN_ISSUES.md — documented WebGL, SDR mixed-content, and relay edge cases."
flexiFreqs:
  - 261.63
  - 392.0
  - 493.88
  - 587.33
plate:
  kind: "carbon-svg"
  svgId: "plate-eoh"
  width: 1600
  height: 1200
  title: "Orbital Iris & 145.500 MHz Waterfall"
  medium: "CARBON LITHOGRAPH · GEOSPATIAL INSTRUMENT"
  alt: "Wireframe geospatial globe framed inside an optical reticle with camera pitch/heading ticks, an active Thames waypoint vector, and an inset RF waterfall tuned to 145.500 MHz."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 8.1 // AGGREGATE SENSOR POLICY GATE (gev/policy.py)"
  lang: "python"
  code: |
    POLICY = ("God's Eye View tools cover public aircraft, vessel, satellite, hazard, weather and "
              "infrastructure data. Do not use them to search for a named person, recognise faces, "
              "or track or locate an individual.")

    EXCLUDED_TOOLS = {"panel_request"}  # MCP-Apps panel plumbing, not useful as a model tool

    _PERSON = re.compile(
        r"\b(facial|face (recognition|match|search)|recogni[sz]e (a |the )?(face|person)|"
        r"(find|locate|track|follow) (a |the )?(person|individual|someone))\b", re.IGNORECASE)

    def refuse_reason(arguments: dict) -> str | None:
        text = " ".join(str(v) for v in arguments.values() if isinstance(v, (str, int, float)))
        if _PERSON.search(text):
            return "Refused: God's Eye View does not search for people, recognise faces, or track individuals."
        return None
  sourceLabel: "gev/policy.py L4–L19 · EOH@9d433e4"
  sourceUrl: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa0f34/gev/policy.py#L4-L19"
sources:
  - label: "EOH README — pane tour, SDR waterfalls & WebGL context recovery (v0.2.10)"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa0f34/README.md"
  - label: "gev/policy.py — public sensor scope & person-tracking refusal"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa0f34/gev/policy.py"
  - label: "docs/COMPOSABLE-TOOLS.md — detail=full pagination & {code, message, fix} errors"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa0f34/docs/COMPOSABLE-TOOLS.md"
  - label: "docs/KNOWN_ISSUES.md — documented browser & SDR constraints"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa0f34/docs/KNOWN_ISSUES.md"
  - label: "CHANGELOG.md — release trail through v0.2.10"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa0f34/CHANGELOG.md"
---

A chat model reciting latitude and longitude decimals feels like reading sheet music over the telephone. **Eye Of Hermes (`EOH`, v0.2.10)** docks a fork of Bilawal Sidhu's *God's Eye View* right inside a Hermes Desktop or Webapp split pane and wires the agent straight into the app's existing voice-action runner. Ask about maritime traffic, seismic rings, a three-shot FLIR flyover of Tokyo Tower, or public amateur radio across northern Germany, and the same turn that answers your question pitches the 3D camera, drops pins, and pops open a live Berlin OpenWebRX waterfall at `145.500 MHz NBFM`.

Under the hood, the engineering is quietly obsessed with keeping long sessions from melting either your context window or your GPU. Before each LLM turn, Hermes receives a single cached status line from the relay—camera center, altitude, heading, active layers, and pin count—without touching the live pane while it renders. Tool payloads return compact IDs and counts unless you ask for `detail=full`; WebGL contexts survive pane resizes and auto-recover up to three times in twenty seconds before surrendering gracefully; and `gev/policy.py` stands at the door to remind aspiring movie villains that public transponders and weather radars are welcome, while searching for individuals is refused before a packet ever hits the globe.
