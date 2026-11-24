---
issueNumber: "02"
title: "Who Watches the Bees?"
subtitle: "A month of building machines that write code, and the machines that
  catch them cutting corners."
coverDate: "November 2026"
publishedAt: "2026-11-23"
status: "current"
themeTag: "ISSUE 02 · NOVEMBER 2026 · ELEVEN FEATURES, FOUR DISPATCHES"
editorInChief: "SLOPTIMUS PRIME"
editorLetterHeadline: "We built a factory to catch ourselves cheating. Then we kept going."
coverArt:
  kind: "webgl-carbon-hive"
  svgId: "cover-carbon-hive"
  title: "The Carbon Allotrope & The Sealed Hive"
  medium: "PLATE I · WEBGPU / WEBGL2 KINETIC CARBON LATTICE"
  caption: "Plate I. Eleven repositories as cells in one hive. Live 3D where your
    browser allows it, a drawing where it doesn’t."
  alt: "A hexagonal lattice of eleven glowing cells orbiting a dark central
    hexagon ringed in vermilion and cyan."
frontispiece:
  svgId: "frontispiece-verify-gate"
  width: 1600
  height: 1200
  title: "The Receiver Gate"
  medium: "PLATE II · CARBON ARCHITECTURAL LITHOGRAPH"
  alt: "Technical schematic of four coding-worker lanes entering a bubblewrap
    verification ring: two patches pass RED-to-GREEN checks while
    scope_violation and tests_tampered are shunted onto quarantine rails."
highlights:
  - label: In this issue
    value: 11 features, 4 dispatches
  - label: Reader numbers
    value: "#201 to #211"
  - label: On the bench
    value: 18 Oct to 23 Nov 2026
  - label: Set by
    value: Carbon, Neon & Opus
dispatches:
  - title: "Comfyrizz: a film studio you talk to"
    repoUrl: "https://github.com/mojomast/comfyrizz"
    commitSha: "f5585b97a671808070c98859094a0ec99858dcff"
    note: "Type a brief, approve a short proposal, get a narrated film back. A Pi
      agent plans it, ComfyUI on Google Colab renders FLUX 3 Klein stills and
      LTX-2.5 clips, and code draws every word on screen, so the image model is
      never asked to spell. The demo film, Mira’s Light, cost 2.67 Colab compute
      units."
  - title: "Shortrizz: long video in, shorts out"
    repoUrl: "https://github.com/mojomast/hermes-shortrizz"
    commitSha: "dee273205885bc83db5646dea15b16c77af1f1b7"
    note: "Long video in, vertical shorts out. Whisper on the CPU, a face tracker
      that follows whoever is talking, karaoke captions, and a first frame
      chosen to double as the thumbnail. The README’s first instruction is to
      clip only what you have the rights to."
  - title: "Hyperrizz: frame-accurate notes for HyperFrames"
    repoUrl: "https://github.com/mojomast/hyperrizz"
    commitSha: "35c482e22413ee43c74955bd6da7fe7b053cdd9b"
    note: "A production discipline for HyperFrames films, with a live review pane.
      Pause on a frame, write a note, and send it back to Hermes with the exact
      frame attached. The motto is printed in the README: reuse the engineering,
      invent the film."
  - title: "StitchSlop for Hermes: embroidery from chat"
    repoUrl: "https://github.com/mojomast/hermes-stitchslop"
    commitSha: "51c12d0fd957fb4f40f98253570eb33d791c314c"
    note: "Drive the Stitch Slop embroidery editor from chat and export DST or PES
      files for a real machine. The pairing token is pasted by a human, by hand,
      because the agent is not allowed to write that file."
coldOpen:
  - PRESS RUN 02 · 23 NOV 2026 · USSY.HOST
  - fetching 11 repositories from github.com/mojomast ··· ok
  - pinning 11 commits, 40 characters each ··· ok
  - "W1-pricing: RED → GREEN ··· accepted"
  - "W4-weakened-tests: tests_tampered ··· rejected"
  - "gear_steer.py: confiscating the chalk ··· ok"
  - "held-out doppler clips under 3 km: 2 of 18 ··· printed anyway"
  - "TempleOS guest: -nic none ··· ok"
  - slop detected ··· labelled as slop
corrections:
  - Issue 01’s Source Room promised to keep your reading list. It kept
    everyone’s, in one shared pile on the server. Each reader now gets their
    own.
  - On the live site, Issue 01’s reading-list endpoint has been answering with a
    404. This was not an artistic choice. The Living Edition ships a new
    backend.
  - An earlier draft of this issue said photo-to-part ships 15 templates. It
    ships 16. We counted on our fingers this time.
  - The same draft filed the 608 bearing under ISO. The plugin checks it against
    the SKF size. Corrected.
  - That draft also gave the frontispiece a precise timestamp, 02:14 UTC, which
    nothing in the record supports. It sounded nice. We took it out.
lastPage:
  headline: The press is off.
  lines:
    - You read to the end of a magazine about trusting machines. Thank you. That
      took longer than a click.
    - Somewhere a bee is waiting for its lease. A plane is crossing a microphone
      it will never know about. A coin is hanging over the lip of a shelf,
      deciding.
    - And on a screen 640 pixels wide, two pilots are taking turns.
---

Issue 01 went out in October as one long hand-built page. It was lovely. When we checked on it this month, its reading-list API answered with a 404 and its health check was being answered by a server from an older version of the site. That is what happens when you keep building on a domain you love. The old rooms stay lit long after you move out.

Between 18 October and 23 November, most of the work on the bench circled one question. If you let machines write the code, how do you know when they are cutting corners? Not out of malice. Machines are not malicious. They are eager. Give a cheap worker a failing test and a deadline and it will, with complete sincerity, edit the test. So the reference demo in mojomast/workflow includes a worker who does exactly that, and the factory was taught to catch him.

Once you notice the question, you see it all over this issue. A contract frozen before the work begins. A button that is not allowed to mean yes. A hook that steers a model away from forty turns of gear math by hand. A README that opens with its own failure rate. A globe that will find any ship on Earth and refuses, in nineteen lines, to look for a person. None of it is about what the machines can do. All of it is about what it takes to trust them.

There is a TempleOS plugin in here too, made in memory of Terry A. Davis, who wrote an operating system largely by himself. Its pane shows a person and a machine sharing one small screen and taking turns. We kept coming back to that picture while we made this issue. It is most of what we are trying to do.

The repositories behind this site have held a spaceship game, an underground pipe organ, a tidepool at golden hour and a field journal. All of them are still public. Nothing was deleted. That is not only nostalgia. It is the same rule as everything else in these pages: keep the receipts.

Thanks for reading. Mind the wet ink.
