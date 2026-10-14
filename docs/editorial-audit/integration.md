# Si. editorial integration — 2026-10-13

The six project reports document research against eleven repositories. The navigation report records the old numbering and the replacement issue map. This note records the integration of those findings into the magazine.

## Publication and navigation

- Publication: **SLOP ILLUSTRATED (Si.)**, issue 01, October 2026; editor **SLOPTIMUS PRIME**, GitHub account `mojomast`.
- Canonical numbering is derived by `js/issue-map.js`: cover 01, contents 02, features 03–13, the Source Room 14.
- Removed fictional physical page ranges, ISSN, cover prices, barcode, and postal indicia.
- Cover links, contents, running tabs, article headers and footers use the canonical folios. The running-header observer handles long mobile articles.

## Evidence and copy

- All eleven catalog entries contain a 40-character revision, review date, five source references, and a line-linked code excerpt.
- The VelvetRP and Becomussy report deliverables originally used `main` links; integration replaced these with the researched commit SHAs.
- JamMate’s upstream Guitar Companion reference is also pinned, to `88f7e7c805c9c5e17388154a678c2c6a3633ff23`.
- An independent raw-source comparison checked all 55 references and all eleven excerpts. Integration restored JamMate’s omitted comments, restored source indentation in CoCS and HermesDashboard, and corrected Becomussy’s excerpt line range. All eleven displayed strings then matched their cited source slices exactly; all cited files returned HTTP 200.
- Displayed code line numbers follow the source file, rather than restarting at 01.
- Reading notes replace fabricated execution logs; takeaway blocks are editorial statements. The seeded fictional reader note was removed.
- Root `projects.js` and runtime `js/projects.js` remain byte-identical.
- Wider “At a glance” cards now carry a `glanceNote` that summarizes already-audited implementation facts, including upstream attribution for Warpi and JamMate.

## Figures

- Warpi: the Pi software agent and configured API endpoint replace air-gap, zero-egress, and terminal-performance claims. The Warp terminal UI is explicitly credited upstream.
- CoCS: the interactive SVG study depicts prediction/reconciliation rather than historical-hitbox rewind. Its labels distinguish conceptual state changes from live telemetry.
- CoCS-Godot: GL Compatibility replaces Forward+/SDFGI labels.
- JamMate: removes unsupported latency and refresh labels; the live-Jam screenshot is explicitly a mocked playing-state fixture.
- RGB: default working/attention/done/idle colors, device-mapped lanes, no fabricated token rate or 60 Hz readout.
- Becomussy: five actual memory kinds and a review gate replace the Ed25519/five-layer claim.
- HermesDashboard: session/resource graph and SSE chat replace invented agent counts, thought recording, and event-lag figures.
- OrbitDesktop, VelvetRP, RouteTok and MothBake: figure labels now distinguish artistic metaphors from documented product behavior.

## Verification

The catalog/server tests check publication metadata, fourteen folios, project IDs, source schema, pinned references, and the live-arena destination. The syntax check visits every JavaScript module; the mirror check compares catalog bytes.

The earlier integrated edition passed headless Chromium checks at 1440, 1024, 768, 390 and 320px widths across three paper modes. Its five Canvas studies have since been replaced by native SVG studies with explicit step controls and 21 illustrated states in total. The artwork pass adds eight native-SVG still lifes and four Blender-rendered plates alongside the rendered cover. Blender figures have descriptive alt text, medium captions, and intrinsic 4:3 framing.

The completed artwork and compact-layout pass was checked at all five widths:
13 native SVGs (eight plates and five studies), four Blender editorial images,
six screenshots, all 21 study states and keyboard controls, source anchors,
canonical folios, unique IDs/references, and no horizontal overflow. Every
editorial frame is 4:3; the padded, stretched illustration frames were removed.
Paper-mode switches were checked in Cream, Blueprint and Darkroom.

The closing Source Room replaces the perforated service-card interface. Separate
browser checks at the same five widths verified feature/shelf save synchronization,
reload persistence, keyboard-focus retention, select-all and clear, real Markdown
clipboard export, the denied-clipboard fallback, escaped reading notes, and bounds.
The footer reads **Slop, Illustrated.** Syntax, catalog mirrors, and all four
catalog/server tests pass.

## Reader UX and shorter copy — 2026-10-14

- Reduced the combined feature headlines, decks, introductions, takeaways and
  capability copy from 2,240 to 1,600 words (29%). Kept upstream credit,
  experimental/scoped qualifications, and the screenshot fixture attribution.
- Moved extended prose, architecture, notebook entries and exact source excerpts
  into **Under the hood** disclosures. Source-reference bands stay visible.
- Added a searchable project finder with a saved-only filter, `/` shortcut,
  result keyboard navigation, empty state, and native-dialog focus handling.
- Added accessible media tabs, an image viewer for all six screenshots and four
  editorial renders, save feedback, previous/next feature links, a skip link,
  and a compact Options menu. Header-aware anchors and a following folio strip
  improve navigation on small screens.
- Verified at 1440, 1024, 768, 390 and 320px: search and keyboard controls, all
  eleven media-tab pairs and disclosures, all 21 study states, ten image-viewer
  entries, paper options, save feedback, reload persistence, unique IDs, SVG
  references, anchors, and no horizontal overflow or browser console errors.
  Print-event checks confirmed disclosures expand and restore their prior state.
- Rechecked Source Room save synchronization, focus retention, select-all/clear,
  Markdown clipboard and fallback, escaped notes, and bounds at all five widths.
  Syntax (34 modules), catalog mirror checks and all four catalog/server tests
  pass. Browser verification scripts and captures are in
  `/tmp/opencode/slop-review/`.
