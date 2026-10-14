# Editorial layout redesign — verification

Date: 2026-10-14

## Implemented direction

The Darkroom Field Journal redesign uses the research in [design-research-2026.md](design-research-2026.md), with the finished system recorded in `DESIGN.md` at the repository root.

- Artwork-led cover with four cover stories, eleven accessible numbered project annotations and a compact sound feature.
- Frontispiece/editorial contents spread and open repository directory in the Source Room.
- Explicit opener, report and essay feature compositions, shared live modules and container-responsive grids.
- Open fact ledgers, readable lists, restrained utility controls and differentiated type roles.
- Natural-width phone composition shared by Fit and Fill; preserved whole-sheet fitting, animated turns, smooth zoom and engineering foldouts.

Catalog and asset files were unchanged. The publication retains fourteen folios, eleven projects, fifty-five reference links, eleven repository excerpts, twelve editorial plates, six screenshots and five SVG studies.

## Method

Research, feature implementation and publication-furniture implementation were delegated. A separate read-only reviewer inspected completed captures and returned **SHIP** for the three representative feature compositions, then **SHIP** for the cover, contents, Source Room and supplied page-reader captures. Those verdicts cover visible composition and affordances in those images, not a claim of complete accessibility certification.

Anthropic Frontend Design and Paul Bakaus Impeccable were used as commit-pinned, text-only design references. No Impeccable engine, detector, hooks or formal automated critique command was run. Reference provenance and adaptations are documented beside the local skills.

## Repository checks

- Five Node tests passed: catalog/evidence inventory, rendered plates, API identity, press-state round trip and static-file boundaries.
- Syntax checked for all 36 JavaScript modules.
- Root and runtime catalog mirrors are byte-identical.
- Authored changes pass Git whitespace checks. `.gitattributes` preserves intentional upstream whitespace in the verbatim third-party reference files.

## Browser evidence

Tests used Chromium through Playwright, with the local publication at `http://127.0.0.1:18510/`. Press-state requests were intercepted to keep test saves and notes out of the shared backend.

| Check | Scope | Result |
| --- | --- | --- |
| Integrated responsive composition | 1920, 1440, 1024, 768, 390 and 320px; Darkroom, Cream and Blueprint | All fourteen folios contained; three feature layouts present; original media/reference counts; 4:3 editorial frames; readable narrow Fill |
| Search and feature controls | 1440, 1024, 768, 390 and 320px | Keyboard search, saved filter, eleven media tab sets, twenty-one study states, eighteen image viewers, disclosure controls, themes, save feedback and persistence passed; no page errors, broken local anchors or duplicate IDs |
| Fit/Fill and page turns | 1920×1600, 1440×1000, 1024×900, 390×844 and 320×568 | Intermediate zoom frames, constant composition width, full-area Fill, fourteen centered Fit sheets, position restoration, source navigation, reversal, queued navigation, reduced motion, printing and exit passed |
| Engineering disclosures | 1440, 1024, 390 and 320px | Prominent tinted controls; smooth monotonic open/close in continuous/Fit/Fill; centered intermediate geometry; keyboard, interruption, reversal, print restoration and all eleven reduced-motion disclosures passed |
| Source Room | 1440, 1024, 768, 390 and 320px | Save synchronization, keyboard focus, reload persistence, Markdown clipboard and fallback, select-all/clear, escaped notes and bounds passed |
| Touch input | 390×844, Chromium mobile context with CDP touch events | Fill scrolls vertically without forced desktop-width overflow; Fit swipe turns the page; clean exit |
| Native fullscreen | Chromium fullscreen API | Enter, animated turn, zoom and exit passed |
| Sound and Loupe | Local browser controls | Cover audition, feature sound, stop-state controls and registration-grid toggles passed |
| Sampled text contrast | Computed color samples across features, contents, directory and cover in all three themes | No sampled failures; minima 5.66:1 Darkroom, 5.57:1 Cream and 7.03:1 Blueprint |

The first integration run encountered the publication stylesheet while its separate implementation was still being written; that transient resource failure was absent from the completed five-width suite. An early 320px zoom trace failed before integration finished; the isolated rerun and the final complete five-size zoom suite passed. The initial disclosure prominence check caught a transparent summary; its tinted background and larger heading were restored before the passing four-width disclosure suite.

Touch evidence is synthesized Chromium input, not a physical-device or Safari test. Fit is intentionally a complete-sheet overview: long mobile folios become thumbnails, while Fill restores their natural-width reading composition. Contrast sampling supplements visual review and is not a complete accessibility audit.

## Review artifacts

Local captures and reports are outside the deployed site:

- `/tmp/opencode/slop-review/editorial-2026/before/`
- `/tmp/opencode/slop-review/feature-redesign/`
- `/tmp/opencode/slop-review/editorial-2026/publication/final/`
- `/tmp/opencode/slop-review/editorial-2026/after/`
- `/tmp/opencode/slop-review/editorial-2026/interactions-final/`
- `/tmp/opencode/slop-review/editorial-2026/contrast.json`

The regression scripts are `verify-editorial-layout.cjs`, `verify-editorial-zoom.cjs`, `verify-editorial-touch.cjs`, `verify-reader-ux.cjs`, `verify-disclosures.cjs` and `verify-source-room.cjs` in `/tmp/opencode/slop-review/`. Earlier sheet-fit/reader scripts encode superseded desktop-width assumptions and should not be treated as the acceptance criteria for this revision.
