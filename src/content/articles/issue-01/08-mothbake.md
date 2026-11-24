---
issueNumber: "01"
articleSlug: "mothbake"
index: 8
readerServiceNo: 108
section: "BINARY CODECS // REPRODUCIBLE BUILDS"
layoutVariant: "dossier"
title: "MothBake"
kicker: "Asset Pipeline · Zero Runtime Dependencies"
headline: "Every Texture Gets a Birth Certificate"
deck: "An offline-first asset baker that records what made each texture, sound
  and archive, so you can rebuild it later without the network."
byline: "By SLOPTIMUS PRIME"
category: "Build Systems / Binary Serialization"
glanceNote: "The recipe, the raw result, the local bake and the export each get
  their own SHA-256 identity. Billable live calls are off by default and need an
  approval that matches the exact spending plan."
pullQuote: "Somewhere in every game repository there is a texture nobody can explain."
repoUrl: "https://github.com/mojomast/mothbake"
liveUrl: null
sourceRevision: "93e182557c7c47b75c556477127fb27686fea20d"
researchedAt: "2026-10-13"
spotInkHex: "#ea580c"
secondaryInkHex: "#334155"
techStack:
  [
    "Node.js (ESM, zero runtime deps)",
    "Python (optional local backends)",
    "In-repo binary decoders",
    "SHA-256 content identities",
    "MIT"
  ]
metrics:
  [
    { "label": "Runtime Dependencies", "value": "0 (offline by default)" },
    { "label": "Determinism Check", "value": "Byte-for-byte ESM golden test" },
    { "label": "CI Matrix", "value": "Ubuntu · Node 20 & 22" }
  ]
verifiedCapabilities:
  [
    "Offline fixture runs on Node.js 20+, without runtime dependencies",
    "In-repo PNG, GIF, ZIP, HDR, WAV and MIDI decoders",
    "SHA-256 identities, pinned approvals and versioned export packs",
    "Verified rebuilds from raw results; legacy archives marked unverified"
  ]
architecture:
  [
    "Manifest-driven recipe → dependency plan → run journal → raw archive →
      local bake → candidate pipeline, with separate identities at every stage.",
    "In-repo decoders and emitters: PNG (filters 0–4; colour types 0/2/3/4/6),
      GIF87a/89a, ZIP (stored/deflate read and write), Radiance RGBE, WAV
      (8/16/24/32-bit PCM and 32-bit float) and Standard MIDI, plus
      files/atlas/JSON/ESM/Godot emitters.",
    "Layered SHA-256 content identities (recipe, generation instance, raw
      artifact, local bake, export) so a signed URL is never mistaken for an
      identity.",
    "Approval-gated live execution: exact spending-plan fingerprints, a
      durable single-host run journal, and offline repair of built-in bakers
      from archived raw outputs."
  ]
fieldNotes:
  [
    "Zero runtime dependencies: every decoder (PNG, GIF, ZIP, HDR, WAV, MIDI)
      lives in-repo and installs air-gapped.",
    "Determinism is tested per emitter/decoder (byte-for-byte ESM golden;
      fixed-epoch ZIP), not asserted as a global bit-exact guarantee.",
    "Offline rebuild: `mothbake repair` rebuilds built-in bakers from archived
      raw results; billable live calls are approval-gated and off by default."
  ]
readingGuide:
  [
    "READING GUIDE // `mothbake plan` shows submissions, archive rebuilds,
      estimates, unknown costs and local budget violations before any spend.",
    "READING GUIDE // The ESM emitter is compared byte-for-byte against a
      committed golden file (test/golden.test.mjs).",
    "READING GUIDE // The ZIP writer pins a fixed MS-DOS epoch (1980-01-01) so
      archives are byte-deterministic (src/decoders/zip.mjs).",
    "READING GUIDE // SHA-256 fingerprints are layered across recipe,
      instance, raw artifact, local bake and export: there is no single global
      artifact hash."
  ]
flexiFreqs: [ 261.63, 311.13, 392, 523.25 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/mothbake/specimen-under-checksum-glass.webp",
    "width": 1600,
    "height": 1200,
    "title": "Specimen Under Checksum Glass",
    "medium": "BLENDER · CONCEPTUAL STILL LIFE",
    "alt": "A photorealistic studio still life of a sculptural copper-and-porcelain
      moth with PBR material-swatch wings resting in a velvet mahogany specimen
      case, pinned with five wax-sealed brass provenance medallions beside a
      preserved glass cache jar and a padlocked brass coin box. An editorial
      still life, not a product screenshot."
  }
secondaryMedia:
  {
    "kind": "screenshot",
    "src": "/assets/screenshots/mothbake.png",
    "width": 1068,
    "height": 618,
    "caption": "Eighteen tiling textures from the repository’s recorded-bake
      gallery, baked by MothBake with no network and no API key.",
    "alt": "Eighteen tiling textures from the repository’s recorded-bake gallery,
      baked by MothBake with no network and no API key."
  }
codeExcerpt:
  {
    "title": "SOURCE EXCERPT // src/identity.mjs: SHA-256 CONTENT IDENTITY",
    "lang": "js",
    "code": "/** SHA-256 hex digest of bytes; path names do not contribute to the
      hash. */

      export function hashBytes(bytes) {

      \  if (!(bytes instanceof Uint8Array)) throw new TypeError('hashBytes
      requires bytes');

      \  return createHash('sha256').update(bytes).digest('hex');

      }",
    "sourceLabel": "src/identity.mjs L60–L64 · mothbake@93e1825",
    "sourceUrl": "https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c55647\
      7127fb27686fea20d/src/identity.mjs#L60-L64"
  }
sources:
  [
    {
        "label": "mothbake @ 93e1825: README (capabilities & gallery)",
        "url": "https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb\
          27686fea20d/README.md"
      },
    {
        "label": "mothbake @ 93e1825: docs/ARCHITECTURE.md (pipeline & contracts)",
        "url": "https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb\
          27686fea20d/docs/ARCHITECTURE.md"
      },
    {
        "label": "mothbake @ 93e1825: src/identity.mjs (layered SHA-256 identities)",
        "url": "https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb\
          27686fea20d/src/identity.mjs"
      },
    {
        "label": "mothbake @ 93e1825: test/golden.test.mjs (byte-for-byte ESM golden)",
        "url": "https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb\
          27686fea20d/test/golden.test.mjs"
      },
    {
        "label": "mothbake @ 93e1825: .github/workflows/ci.yml (Ubuntu · Node 20/22)",
        "url": "https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb\
          27686fea20d/.github/workflows/ci.yml"
      }
  ]
---

Somewhere in every game repository there is a texture nobody can explain. It was generated once, by a tool nobody remembers, with settings nobody wrote down. MothBake is built so that file never exists again.

A recipe names the engine, the inputs and the parameters. MothBake archives the raw result, decodes it with its own in-repo decoders for PNG, GIF, ZIP, Radiance HDR, WAV and MIDI, and writes what your project actually consumes: plain files, sprite atlases, a JSON bundle, an ES module or a Godot export.

Identity is layered rather than overloaded. The recipe, the generation instance, the raw artifact, the local bake and the export each carry their own SHA-256, so a signed URL is never mistaken for a fingerprint. Determinism is tested where it can be: the ES module output is compared byte for byte with a golden file, and the ZIP writer pins every timestamp to 1 January 1980 so archives come out identical. Lose the network and `mothbake repair` rebuilds the built-in bakers from what was archived.
