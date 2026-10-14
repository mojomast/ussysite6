# SLOP ILLUSTRATED — design research and direction, 2026

**Research date:** 2026-10-14

**Chosen direction:** Darkroom Field Journal

**Purpose:** turn the existing publication into a coherent editorial magazine through composition, typography, imagery, and reading rhythm.

This record documents sources and implementation decisions. It is not a report that the redesign has passed browser, accessibility, or usability testing. Existing audit results remain in [integration.md](integration.md); they describe earlier revisions and must not be treated as verification of later work.

## 1. User brief and implementation direction

The user asked for a more genuine magazine layout, researched best practices, and design skills applied through subagents. The implementation team selected **Darkroom Field Journal**: the **original biomechanical cover** as the dominant visual, reduced boxed UI, and three feature compositions—**opener, report, essay**. This develops the user's established Darkroom/magazine identity. Retain the six existing font roles while keeping each page restrained. Preserve factual copy, assets, and controls, including a prominent, smoothly expanding **Under the hood**.

The inspected publication already provides eleven source-linked project features, canonical digital folios, original illustrations and sound sketches, screenshots with provenance, source excerpts, and a Source Room. `index.html`, `index.css`, `js/issue-map.js`, and the existing [integration](integration.md) and [navigation](navigation.md) audits supply project context. Read older audit findings alongside the integration record: already-corrected fictional metadata must not be reintroduced as period styling.

The reader's job is to understand each project, explore its illustration or screenshot, and reach the supporting engineering evidence. This follows the publication's existing copy; it is a design interpretation, not new audience research.

## 2. Skill selection: adoption evidence rather than ratings

All figures below were observed **2026-10-14**. The installation counts are the rounded numbers displayed by skills.sh; stars are the exact repository API values from that research snapshot.

| Reference skill | Popularity evidence | Reason for selection |
| --- | --- | --- |
| Anthropic `frontend-design` | [983.8K installs](https://skills.sh/anthropics/skills/frontend-design); [180,968 repository stars](https://api.github.com/repos/anthropics/skills) | Official Anthropic provenance; explicit subject-specific art direction, token planning, typography, and self-critique. |
| Paul Bakaus `impeccable` | [331.0K installs](https://skills.sh/pbakaus/impeccable/impeccable); [80,838 repository stars](https://api.github.com/repos/pbakaus/impeccable) | Detailed Read mode, typesetting, composition, responsive, critique, and audit references. |

These sources do **not** supply verified user-review ratings. Stars apply to whole repositories, including Anthropic's many other skills. [skills.sh's FAQ](https://skills.sh/docs/faq) describes aggregate installation telemetry; it does not establish unique active users, satisfaction, or design effectiveness. Security-audit badges are also not design-quality ratings. The recommendation combines adoption, provenance, and inspection of the actual instructions.

Impeccable's [old `frontend-design` listing](https://skills.sh/pbakaus/impeccable/frontend-design) is deprecated and displays 53.2K historical installs. Those are not added to the current count. The repository credits **Paul**, not Pawel, Bakaus. Its [Neo Mirai demonstration](https://impeccable.style/cases/neo-mirai) is useful author-published process evidence, not an independent review.

### Immutable local resources

| Skill | Repository revision | License and local provenance |
| --- | --- | --- |
| Anthropic | [`dbd4588f9e1033efb41dad4bef2f7947c8993d44`](https://github.com/anthropics/skills/commit/dbd4588f9e1033efb41dad4bef2f7947c8993d44), 2026-10-09 | Apache-2.0, verified from the skill's `LICENSE.txt`; [SOURCES.md](../../.opencode/skills/frontend-design/SOURCES.md). |
| Impeccable | [`2f98774f86bc05563876643db37e6c37c322850f`](https://github.com/pbakaus/impeccable/commit/2f98774f86bc05563876643db37e6c37c322850f), 2026-10-13; skill version 4.5.2 | Apache-2.0, plus preserved third-party notice; [SOURCES.md](../../.opencode/skills/impeccable/SOURCES.md). |

Exact raw definitions:

- https://raw.githubusercontent.com/anthropics/skills/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md
- https://raw.githubusercontent.com/pbakaus/impeccable/2f98774f86bc05563876643db37e6c37c322850f/.opencode/skills/impeccable/SKILL.md

The local copies retain the complete upstream skill definitions, licenses/notices, and all 45 Markdown files in Impeccable's packaged reference subtree so internal reading paths remain available. All 51 downloaded text resources were verified against their pinned Git blob hashes. No engine, script, binary, package, font, or generated asset is part of this reference import. Command examples inside the unchanged Markdown remain reference text.

## 3. Primary editorial references

The following primary pages were read on **2026-10-14**. The application column is our synthesis for SLOP ILLUSTRATED, not a claim that those publishers endorse this design.

### Pentagram — MIT Technology Review

Source: https://www.pentagram.com/work/mit-technology-review

Pentagram describes a **flexible 12-column grid**, distinct headline/body/annotation type roles, cross-platform consistency, and vivid, varied photography, illustration, infographics, and data visualization. Its account connects experimental expression to the publication's established identity and journalistic mission.

**Apply:** use a shared modular grid to support genuinely different story compositions; let the original imagery occupy meaningful space. Give body text, display, and evidence annotations distinct jobs. Preserve the magazine's identity and factual mission while replacing the arrangement. The lesson is a coherent editorial system, not copying MIT's fonts, logo, or 45-degree motif.

### Pentagram — Stern

Source: https://www.pentagram.com/work/stern

Pentagram describes a flexible **10-column grid**, varied image scale, additional white space, multiple reader entry points, section-opening typography, and a different setting for each story. Tightly structured reporting contrasts with open photo-essay layouts; section openers become anchors in the issue's sequence.

**Apply:** maintain three recognizable story treatments—opener, report, essay—with shared folios and navigation. Alternate an image-led opening, denser explanation, and a quieter reading passage. Give each story the space its content needs rather than repeating the same card anatomy eleven times. Existing publication facts and identity remain intact.

### USWDS — Typography

Source: https://designsystem.digital.gov/components/typography/

USWDS recommends an effective **16px minimum for ordinary running text**, flush-left web text, generally **45–90 characters per line**, with **66 characters** a good target for long text. Longer text should generally have **at least 1.5 line height**. Its guidance puts more space above a heading than below and uses whitespace to distinguish paragraphs; it cautions against long uppercase, bold, or italic passages.

**Apply:** set the Newsreader reading column around **65–66ch**, with an ordinary body floor of **1rem** and a starting line height near **1.55–1.65**, tuned in the actual face and theme. Keep paragraphs flush left, generally separated by about **1em** rather than simultaneously using indentation. Keep captions subordinate but legible, and headings visibly attached to their following text. These are starting decisions, not measured claims about the current render.

### Affinity — Grid design for editorial and web layouts

Source: https://www.affinity.studio/blog/grid-design-for-editorial-and-web-layouts

Author: **James Bates**, Affinity designer. Page publication date: **2026-07-20**.

The article treats column count as a content decision, recommends modular and baseline rhythm, and reserves deliberate grid breaks for dominant images or important typographic moments. Its digital guidance favors a fluid outer structure with a maximum width, proportional relationships, and responsive recomposition. It describes 12-column divisibility but also explains that digital editorial work can benefit from simpler six- or eight-column structures.

**Apply:** use a consistent grid and spacing rhythm beneath all three compositions; keep prose measure independent of the outer container width. Let the cover and selected opener image break the regular rhythm once, purposefully. Recompose the column relationships on small screens instead of shrinking the entire desktop spread. A CSS grid track is not a requirement for a separate visible text column, and responsive text must not be forced into fixed-height print frames.

## 4. Concrete design decisions

### A. Cover and identity

**Decision:** the first viewport should be remembered for the original biomechanical cover and SLOP ILLUSTRATED masthead. The illustration is the leading subject; teaser text, issue metadata, and controls support it.

- Increase its compositional dominance without replacing the existing artwork or stripping its eleven project destinations, labels, and keyboard paths.
- Keep the masthead authoritative and the surrounding controls calm. Use image scale and negative space to establish hierarchy.
- Retain the publication's original SVG studies, still lifes, renders, screenshot credits, and sound-sheet affordances. Existing medium/provenance captions remain truthful.
- Darkroom is the chosen starting world; Cream and Blueprint stay available as working reader options.

### B. Palette and framing

Start from the inspected Darkroom tokens in `index.css`, rather than inventing an unrelated palette:

| Role | Existing value | Editorial use |
| --- | --- | --- |
| Ground | `#111110` | Calm dark reading field. |
| Raised surface | `#1a1917` | Reserved for a real layer or interaction state. |
| Primary ink | `#f5efe2` | Main prose and headings. |
| Secondary ink | `#d4cbb8` | Supporting content, subject to rendered contrast checks. |
| Warm accent | `#efb780` | Deliberate navigation or emphasis. |
| Cool accent | `#c4d8ec` | Evidence/link differentiation where useful. |

Reduce boxes by grouping with proximity, alignment, and meaningful rules. A fact group can become a margin annotation or an open band; a source link can remain a clear link. Keep surfaces where they communicate an actual control, selected state, dialog, or disclosure. Verify colors against every background and in all reader modes; this table does not certify contrast.

### C. Three feature compositions

Use one underlying modular system—12 tracks is a practical implementation starting point because it supports halves, thirds, and asymmetric spans—while varying the visible reading composition. Track count is subordinate to the content and can be simplified at intermediate widths.

| Composition | Hierarchy and rhythm | Small-screen translation |
| --- | --- | --- |
| **Opener** | Dominant headline and original artwork; short deck; supporting facts lower in the hierarchy. One large visual moment earns a quieter continuation. | Preserve title/deck/art priority; stack support below it rather than creating tiny parallel columns. |
| **Report** | Structured title and deck, prose beside an evidence/figure zone, concise facts aligned as open annotations. The grid clarifies relationships. | Keep related caption/figure and fact groups together; move support into the linear flow with full-width usable controls. |
| **Essay** | More generous margins, a calm serif reading column, an occasional larger figure or quote, and a softer interval between sections. | Maintain a single comfortable text column, natural artwork proportions, and the same narrative order. |

Choose each treatment from the story's material, not by arbitrary round-robin assignment. Keep the same anchors, folios, source destinations, previous/next path, save behavior, and disclosure conventions across treatments.

### D. Six roles across the issue; restraint on each page

The six established CSS roles are retained:

| Token | Family | Role |
| --- | --- | --- |
| `--font-display` | Fraunces | Masthead and selected expressive display headlines. |
| `--font-condensed` | Barlow Condensed | Compact, technical/report headline voice. |
| `--font-literary` | Cormorant Garamond | Essay/literary display voice. |
| `--font-body` | Newsreader | Sustained reading and explanatory prose. |
| `--font-grotesk` | Space Grotesk | Controls and interface signposting. |
| `--font-mono` | IBM Plex Mono | Code, source coordinates, and genuinely technical annotation. |

For a feature, normally choose **one** display voice plus the reading face; interface and code roles appear only where their content requires them. Do not alternate all three display families inside one feature or use monospace as generic decoration. Preserve exact headline words when changing line breaks. Tune actual rendered sizes, leading, weight, and fallbacks, including on dark backgrounds; a font's name alone does not create hierarchy.

### E. Under the hood is a conspicuous reading invitation

Keep the exact **Under the hood** label prominent, with enough contrast, spacing, and a clear expanded/collapsed indicator to make the engineering material easy to discover. Supporting text can identify the existing architecture, notes, and excerpts without inventing claims.

- Preserve the complete factual content and visible source-reference access; disclosure changes presentation, not availability.
- Preserve the existing roughly **620ms**, user-requested smooth unfolding and its page-geometry synchronization. Impeccable's general **150–300ms** routine-transition guidance is not a reason to replace this established interaction. Use actual measured content height rather than an arbitrary tall `max-height`.
- Retain native disclosure semantics or their fully equivalent keyboard/state behavior. Keep focus stable on repeated open/close; hidden content must not become an invisible tab stop.
- Reduced motion gets an immediate or substantially gentler transition with the same clear state feedback. Failed enhancement should still leave a usable disclosure.
- Preserve print-time expansion/restoration and test opening within both scrolling and full-screen page reading modes.

### F. Responsive composition and preserved controls

Use content-driven breakpoints and maintain the same information order as the DOM/focus order. Start with the narrow reading path, then add columns and margins as room becomes available. A large-screen frame can be fluid up to a maximum width while prose remains around its chosen measure. Retain natural artwork aspect ratios and meaningful image crops.

The preservation baseline includes cover project links; contents and canonical folios; previous/next navigation; page mode; project finder and its keyboard shortcut/filter; paper modes; loupe; sound controls; media tabs; image viewer; all study states; saving and Source Room synchronization; note handling; export/clipboard fallback; source links; and disclosure/print behavior. Reduce visual competition around these affordances without removing or concealing core functionality on mobile.

## 5. Using the two references together

1. Use [Anthropic's definition](../../.opencode/skills/frontend-design/SKILL.md) to review the palette, type roles, alignment, and cover/feature thesis against the approved brief before changing UI.
2. Use Impeccable's [new-work](../../.opencode/skills/impeccable/reference/new-work.md) distinctions for the overall redesign, then [Read mode](../../.opencode/skills/impeccable/reference/mode-read.md) for article interiors. The illustrated cover can emphasize Experience; article bodies must remain documents people can comfortably read.
3. Read [typeset](../../.opencode/skills/impeccable/reference/typeset.md), [layout](../../.opencode/skills/impeccable/reference/layout.md), and [craft-floor](../../.opencode/skills/impeccable/reference/craft-floor.md) for implementation. Use [adapt](../../.opencode/skills/impeccable/reference/adapt.md) for responsive structure and [animate](../../.opencode/skills/impeccable/reference/animate.md) for disclosure continuity.
4. Apply [critique](../../.opencode/skills/impeccable/reference/critique.md) criteria to the rendered hierarchy before mechanical findings anchor that judgment. Use [audit](../../.opencode/skills/impeccable/reference/audit.md) criteria to check measurable behavior, then [polish](../../.opencode/skills/impeccable/reference/polish.md) to finish the agreed identity.

### Instructions that need deliberate adaptation

This is a **text-only reference workflow**. The complete [Impeccable provenance and adaptation note](../../.opencode/skills/impeccable/SOURCES.md) records the upstream launcher fallback, command requirements, and scope differences.

- The upstream launcher, detector, catalog roll, live tools, and image pipelines are absent and are not to be installed or executed for this task. Read project context directly and identify any manual review as manual.
- Full upstream flows normally write `PRODUCT.md`, `DESIGN.md`, `.impeccable/` artifacts, and invoke reviewers/documenters. This research task owns only `.opencode/skills/**` and this file; importing references does not expand that boundary.
- The selected Darkroom Field Journal world and retained font roles are binding. Several of these fonts appear in Impeccable's generic saturated-font warnings; that is not permission to replace them. Its absolute kicker/eyebrow ban also conflicts with retaining useful editorial labels. Preserve meaningful section names/folios and remove redundant decoration instead, recording the project-specific exception.
- Upstream `critique` health scores are a heuristic rubric for a particular assessed page, not user ratings of the skill. No score, detector run, independent assessment, or whole-site accessibility result is claimed by this research.
- `audit` is reporting-only; its findings should not become unrequested edits. Upstream `polish` preserves an identity, so it is a finishing pass after the selected redesign has been implemented.

## 6. Implementation acceptance evidence to collect

The implementing parent should batch visual inspection across desktop, intermediate, and mobile widths (including the existing 1440, 1024, 768, 390, and 320px audit set) and the user's actual viewport, fix material findings together, then confirm. Include all three compositions and reader modes rather than judging only the cover.

Evidence should answer:

- Does the cover read as a dominant illustration with a recognizable masthead at thumbnail size?
- Are opener/report/essay visibly distinct while sharing one publication identity?
- Is there a readable, uncluttered path through actual text, figures, captions, sources, and **Under the hood**?
- Are factual strings, source references, assets, controls, and canonical destinations preserved?
- Do long headlines, zoom/text scaling, font fallback, expanded disclosures, and intermediate widths avoid clipping and horizontal overflow?
- Do keyboard focus, touch targets, motion preferences, contrast, and the complete control paths still work?

Record the browser and input method actually used. A resized screenshot verifies layout, not touch gestures or physical-device performance. Existing repository syntax, catalog-mirror, and functional checks belong to the implementation validation; reference packaging itself is checked through source integrity, local links, file types, and ownership boundaries.
