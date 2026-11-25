---
issueNumber: "02"
articleSlug: "eoh"
index: 8
readerServiceNo: 208
section: "SPATIAL INTELLIGENCE // LIVE 3D GLOBE PANE"
layoutVariant: "essay"
title: "Eye Of Hermes (EOH)"
kicker: "Geospatial · A Live Globe in a Hermes Pane"
headline: "It Will Find Any Ship on Earth. It Will Not Find Your Ex."
deck: "Eye Of Hermes puts a fork of Bilawal Sidhu’s God’s Eye View beside the
  chat and lets the agent fly it: aircraft, ships, satellites, weather, and
  public radio receivers you can listen to where they stand."
byline: "By SLOPTIMUS PRIME"
category: "Geospatial Pane / Public OSINT"
glanceNote: "Plugin id godseye, v0.2.10. The agent drives the globe through the
  app’s own voice-action runner. Searching for a person, recognising faces or
  tracking an individual is refused before the call reaches the globe."
pullQuote: "It is a small file. It decides what kind of tool this is."
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
  - "Drives camera flights, landmark pins, routes, FLIR/NOIR shader styles, and
    Director multi-shot scenes through God's Eye View's native voice-action
    runner"
  - "Public SDR receiver layer (v0.2.8) streaming live audio + floating spectrum
    waterfalls from KiwiSDR and OpenWebRX nodes directly over the 3D globe"
  - "Cached single-line pre_llm_call turn state (camera center, range, pitch,
    heading, active layers, pins) without polling or blocking a busy WebGL pane"
  - "Pre-flight policy filter (gev/policy.py) blocking facial recognition and
    individual person tracking"
architecture:
  - "Single-globe voice-runner reuse: rather than inventing a parallel DOM API,
    EOH dispatches Hermes tool invocations through God's Eye View's existing
    voice-action runner."
  - "Token-frugal responses: large geospatial queries return compact IDs and
    counts by default, expanding full rows, geometry, or snapshots only when
    `detail=full` is passed."
  - "Actionable error contracts: failed tool calls return `{ code, message, fix
    }` instructing the agent on the exact recovery step (open pane, retry, or
    rebuild)."
  - "WebGL lifecycle resilience: preserves the WebGL context across layout
    resizes, pauses rendering when hidden, and auto-recovers lost contexts up to
    3 times in 20 seconds before falling back to a manual reload prompt."
fieldNotes:
  - Built on a fork of God’s Eye View by Bilawal Sidhu; the upstream license
    sits beside the plugin’s own. Map imagery credits belong to Cesium ion,
    Google Maps and Esri.
  - Only http:// KiwiSDR and OpenWebRX receivers play inside the pane. Others
    open the operator’s own page, and are never framed.
  - Setting GODSEYE_TURN_STATE=0 turns off the per-turn map line.
readingGuide:
  - "READING GUIDE // README.md: tour of London overlays, Tokyo FLIR Director
    shots, and Berlin 145.500 MHz OpenWebRX waterfalls."
  - "READING GUIDE // gev/policy.py: 19-line policy gate refusing person/face
    tracking."
  - "READING GUIDE // docs/KNOWN_ISSUES.md: documented WebGL, SDR mixed-content,
    and relay edge cases."
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
  alt: "Wireframe geospatial globe framed inside an optical reticle with camera
    pitch/heading ticks, an active Thames waypoint vector, and an inset RF
    waterfall tuned to 145.500 MHz."
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
  sourceUrl: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb\
    1e5daa0f34/gev/policy.py#L4-L19"
sources:
  - label: "EOH README: pane tour, SDR waterfalls & WebGL context recovery (v0.2.10)"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa\
      0f34/README.md"
  - label: "gev/policy.py: public sensor scope & person-tracking refusal"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa\
      0f34/gev/policy.py"
  - label: "docs/COMPOSABLE-TOOLS.md: detail=full pagination & {code, message, fix}
      errors"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa\
      0f34/docs/COMPOSABLE-TOOLS.md"
  - label: "docs/KNOWN_ISSUES.md: documented browser & SDR constraints"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa\
      0f34/docs/KNOWN_ISSUES.md"
  - label: "CHANGELOG.md: release trail through v0.2.10"
    url: "https://github.com/mojomast/EOH/blob/9d433e49645df8ee549b58467876eb1e5daa\
      0f34/CHANGELOG.md"
---

A model reading out coordinates is a poor way to show someone a place. Eye Of Hermes gives the model a globe instead. Ask about shipping lanes, earthquakes, or a flyover of Tokyo Tower in the FLIR style, and the reply that answers you also moves the camera, drops pins and leaves a watch running. Turn on the public SDR layer, click a receiver in Berlin, and you can hear 145.500 MHz from where it sits, with a waterfall floating over the map.

The engineering is mostly about being a good guest in a long conversation. Before each turn, Hermes gets one line about the map, built from a cached snapshot so a busy globe is never interrupted. Large results come back as ids and counts unless you ask for `detail=full`. Failures come back as a code, a message and a fix. If the WebGL context is lost the pane recovers it, and after three losses in twenty seconds it stops and offers a button instead of fighting forever.

Then there is `gev/policy.py`, nineteen lines long. Public aircraft, vessels, satellites, hazards, weather and infrastructure are in scope. Searching for a named person, recognising faces and tracking an individual are refused, by regular expression, before the request reaches the app. It is a small file. It decides what kind of tool this is.
