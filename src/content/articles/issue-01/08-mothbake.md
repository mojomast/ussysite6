---
issueNumber: "01"
articleSlug: "mothbake"
index: 8
readerServiceNo: 108
section: "BINARY CODECS // REPRODUCIBLE BUILDS"
layoutVariant: "dossier"
title: "MothBake"
kicker: "Content-Addressed Baking With Zero Runtime Dependencies"
headline: "Every Bake Leaves a Trail"
deck: "An offline-first asset pipeline with content identities, archived inputs and reviewable exports. No runtime npm dependencies."
byline: "By SLOPTIMUS PRIME · SLOP ILLUSTRATED (Si.)"
category: "Build Systems / Binary Serialization"
glanceNote: "Raw results are archived so built-in bakers can be rebuilt offline. Candidates stay reviewable before export, while live, billable calls are disabled by default."
pullQuote: "An asset is more useful when you can trace how it was made."
repoUrl: "https://github.com/mojomast/mothbake"
liveUrl: null
sourceRevision: "93e182557c7c47b75c556477127fb27686fea20d"
researchedAt: "2026-10-13"
spotInkHex: "#ea580c"
secondaryInkHex: "#334155"
techStack: ["Node.js (ESM, zero runtime deps)","Python (optional local backends)","In-repo binary decoders","SHA-256 content identities","MIT"]
metrics: [{"label":"Runtime Dependencies","value":"0 (offline by default)"},{"label":"Determinism Check","value":"Byte-for-byte ESM golden test"},{"label":"CI Matrix","value":"Ubuntu · Node 20 & 22"}]
verifiedCapabilities: ["Offline fixture runs on Node.js 20+, without runtime dependencies","In-repo PNG, GIF, ZIP, HDR, WAV and MIDI decoders","SHA-256 identities, pinned approvals and versioned export packs","Verified rebuilds from raw results; legacy archives marked unverified"]
architecture: ["Manifest-driven recipe → dependency plan → run journal → raw archive → local bake → candidate pipeline, with separate identities at every stage.","In-repo decoders and emitters: PNG (filters 0–4; colour types 0/2/3/4/6), GIF87a/89a, ZIP (stored/deflate read and write), Radiance RGBE, WAV (8/16/24/32-bit PCM and 32-bit float) and Standard MIDI, plus files/atlas/JSON/ESM/Godot emitters.","Layered SHA-256 content identities (recipe, generation instance, raw artifact, local bake, export) so a signed URL is never mistaken for an identity.","Approval-gated live execution: exact spending-plan fingerprints, a durable single-host run journal, and offline repair of built-in bakers from archived raw outputs."]
fieldNotes: ["Zero runtime dependencies: every decoder (PNG, GIF, ZIP, HDR, WAV, MIDI) lives in-repo and installs air-gapped.","Determinism is tested per emitter/decoder (byte-for-byte ESM golden; fixed-epoch ZIP), not asserted as a global bit-exact guarantee.","Offline rebuild: `mothbake repair` rebuilds built-in bakers from archived raw results; billable live calls are approval-gated and off by default."]
readingGuide: ["READING GUIDE // `mothbake plan` shows submissions, archive rebuilds, estimates, unknown costs and local budget violations before any spend.","READING GUIDE // The ESM emitter is compared byte-for-byte against a committed golden file (test/golden.test.mjs).","READING GUIDE // The ZIP writer pins a fixed MS-DOS epoch (1980-01-01) so archives are byte-deterministic (src/decoders/zip.mjs).","READING GUIDE // SHA-256 fingerprints are layered across recipe, instance, raw artifact, local bake and export — there is no single global artifact hash."]
flexiFreqs: [261.63,311.13,392,523.25]
plate: {"kind":"blender-webp","src":"/assets/editorial/mothbake/specimen-under-checksum-glass.webp","width":1600,"height":1200,"title":"Specimen Under Checksum Glass","medium":"BLENDER · CONCEPTUAL STILL LIFE","alt":"A photorealistic studio still life of a sculptural copper-and-porcelain moth with PBR material-swatch wings resting in a velvet mahogany specimen case, pinned with five wax-sealed brass provenance medallions beside a preserved glass cache jar and a padlocked brass coin box — an editorial still life, not a product screenshot."}
secondaryMedia: {"kind":"screenshot","src":"/assets/screenshots/mothbake.png","width":1068,"height":618,"caption":"Eighteen tiling albedo textures from the repository’s recorded-bake gallery (docs/images/gallery-textures.png), baked by MothBake with no network or API key.","alt":"Eighteen tiling albedo textures from the repository’s recorded-bake gallery (docs/images/gallery-textures.png), baked by MothBake with no network or API key."}
codeExcerpt: {"title":"SOURCE EXCERPT // src/identity.mjs — SHA-256 CONTENT IDENTITY","lang":"js","code":"/** SHA-256 hex digest of bytes; path names do not contribute to the hash. */\nexport function hashBytes(bytes) {\n  if (!(bytes instanceof Uint8Array)) throw new TypeError('hashBytes requires bytes');\n  return createHash('sha256').update(bytes).digest('hex');\n}","sourceLabel":"src/identity.mjs L60–L64 · mothbake@93e1825","sourceUrl":"https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/src/identity.mjs#L60-L64"}
sources: [{"label":"mothbake @ 93e1825 — README (capabilities & gallery)","url":"https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/README.md"},{"label":"mothbake @ 93e1825 — docs/ARCHITECTURE.md (pipeline & contracts)","url":"https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/docs/ARCHITECTURE.md"},{"label":"mothbake @ 93e1825 — src/identity.mjs (layered SHA-256 identities)","url":"https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/src/identity.mjs"},{"label":"mothbake @ 93e1825 — test/golden.test.mjs (byte-for-byte ESM golden)","url":"https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/test/golden.test.mjs"},{"label":"mothbake @ 93e1825 — .github/workflows/ci.yml (Ubuntu · Node 20/22)","url":"https://github.com/mojomast/mothbake/blob/93e182557c7c47b75c556477127fb27686fea20d/.github/workflows/ci.yml"}]
---

Baked game and media assets are usually the least auditable files in a repository: a texture or impulse response arrives as an opaque blob, and nobody can say which inputs, options or engine produced it. MothBake treats a bake as data. It plans work over a dependency graph, records layered SHA-256 content identities, archives raw results for verified offline rebuilds, and gates any billable submission behind an exact-fingerprint approval. The whole pipeline is dependency-free Node.js and runs against recorded fixtures with no key and no network.

MothBake is a local-first asset variation workbench with zero runtime dependencies. A recipe names an engine, its inputs and parameters, and the bake that turns the result into a portable record; the tool then decodes the result itself (PNG, GIF, ZIP, Radiance HDR, WAV, Standard MIDI) and runs emitters that write what a project consumes — decoded files, sprite-sheet atlases, a JSON bundle, a generated ES module, a Godot export, or a custom emitter. Content identity is layered rather than overloaded: recipe, generation instance, raw artifact, local bake and export each carry their own SHA-256 fingerprint. Determinism is tested where it matters — the ESM emitter is compared byte-for-byte against a committed golden file, and the ZIP writer pins a fixed 1980 MS-DOS epoch so archives are byte-deterministic.
