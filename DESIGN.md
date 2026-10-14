# Darkroom Field Journal

SLOP ILLUSTRATED's visual system is an artwork-led software magazine: expressive openers, calm reading columns, source-supported marginal notes and an accessible repository directory. Its distinctive material is the existing biomechanical cover and slightly absurd Blender still lifes. Product facts and preservation constraints live in `PRODUCT.md`; sources for the design decisions are in `docs/editorial-audit/design-research-2026.md`.

## Color

Use the existing CSS custom properties. Darkroom remains the initial mode; the same compositions work in Cream and Blueprint.

| Role | Darkroom | Cream | Blueprint |
| --- | --- | --- | --- |
| `--paper-bg` | `#111110` | `#f5f0e4` | `#0c2340` |
| `--paper-elevated` | `#1a1917` | `#ece5d5` | `#102e52` |
| `--paper-card` | `#21201d` | `#faf7f0` | `#153863` |
| `--ink-primary` | `#f5efe2` | `#141311` | `#f0f6ff` |
| `--ink-secondary` | `#d4cbb8` | `#38352f` | `#c5dcf7` |
| `--spot-ink` | `#efb780` | `#bd3925` | `#ffbb83` |
| `--secondary-ink` | `#c4d8ec` | `#0047ab` | `#aad4ff` |

Project colors identify features through small accents. On dark themes, `--feature-accent` mixes 36% project color with the primary ink so small labels stay legible. Facts, paragraphs and source links use reading inks, rather than arbitrary project colors. Disclosure summaries mix 10% project color into the card surface.

## Typography

Six existing families have separate jobs. A single feature uses one headline voice, Newsreader reading text and Space Grotesk utilities; specialist voices enter only where useful.

| Role | Family | Feature setting |
| --- | --- | --- |
| Identity and expressive headlines | Fraunces | Opener/essay headlines, balanced lines, deliberate optical size |
| Technical display | Barlow Condensed | Report headlines and Under the hood |
| Editorial takeaway | Cormorant Garamond | Large italic reading accent, explicitly labelled as editorial |
| Body and deck | Newsreader | Lead 18px/1.55, 19px/1.5 in wide compositions; deck 19–20px |
| Controls and facts | Space Grotesk | Mixed-case utility text, definition-list metrics |
| Code and source coordinates | IBM Plex Mono | Repository excerpts, line numbers and revisions |

Lead paragraphs have a 66ch maximum, reduced to 60ch on wide sheets. Display tracking stays at or above −0.035em. Headlines retain the exact catalog wording; routine italic suffixes have been removed. Whitespace, scale and font roles distinguish information without enclosing every group.

## Cover, contents and Source Room

`publication.css` scopes the three non-feature folios to a named `publication` container. Their plain paper backgrounds and quieter running header give the artwork and titles priority. The header uses Space Grotesk with an underlined active folio, rather than individual boxed tabs.

- **Cover:** monumental Fraunces identity above an uninterrupted biomechanical plate. Four cover stories and a compact sound feature form a narrow right rail. Eleven numbered annotations retain accessible project names, focus/hover readouts and keyboard navigation. Below 760px container width, the story rail moves beneath the artwork. Compact SVG annotations move beneath the complete image with at least 44 layout pixels per target. The SVG measures `host.clientWidth` before zoom and ignores hidden sheets.
- **Contents:** an original 4:3 frontispiece and editor's letter beside an aligned eleven-story index. Masthead credits and departments sit below. The title is Barlow Condensed; folio numerals use Cormorant Garamond. At narrow widths the two columns become one reading sequence.
- **Source Room:** an open directory aligns folio, name/category, technical stack, and repository/save actions. A reading-list margin contains export and notes. It moves below the directory when the sheet is narrower than 1050px, while individual entries recompose at 760px and 440px. The closing credit retains “Slop, Illustrated.”

The masthead stacks on the narrowest sheets. Cover art uses `preserveAspectRatio="xMidYMid meet"`; the contents frontispiece explicitly uses `aspect-ratio: 4 / 3` and `object-fit: contain`.

## Feature compositions

`js/app.js` assigns an explicit `data-feature-layout`. `index.css` owns one consolidated **DARKROOM FIELD JOURNAL / FEATURES** section. Each `.feature-composition` has six live modules, in narrow-screen DOM order: header, media, prose/takeaway, facts, capabilities, actions. Media tabs switch the original artwork and screenshot/study inside one module.

The named `feature` container measures the unscaled sheet. Below 760px of content width it has a single column; above that it uses twelve tracks and 32px gaps. The spacing rhythm uses 8, 12, 16, 24, 32 and 48px intervals.

- **Opener — OrbitDesktop, JamMate, Warpi:** five-column title beside a seven-column illustration; prose and facts below; full-width capabilities.
- **Report — CoCS, CoCS-Godot, RouteTok, RGB Flight Indicator, MothBake:** broad condensed headline with adjacent deck; an eight-column illustration beside an evidence rail; prose and takeaway below. Between 760 and 1000px, the image/prose and facts/capabilities use a seven/five split.
- **Essay — VelvetRP, HermesDashboard, Becomussy:** an indented title, a five-column image margin and a six-column reading spine, with facts and capabilities underneath.

Facts use semantic definition lists, capabilities use ordinary lists, and repository/sound/save actions occupy a quieter utility row. Artwork retains its original 4:3 framing. Sources remain directly accessible below every feature.

## Reading modes and motion

`publication.css` and `index.css` compose the issue. `page-reader.css` and `js/page-reader.js` scale, center, scroll and turn the original live sheets.

- Compose at the actual available width, capped at 1400px. Do not restore a desktop minimum width on phones.
- **Fit sheet:** center the complete content-sized sheet with margins.
- **Fill view:** scale the same composition to cover the reading area, at least at natural size. Text and column placement do not change during the 560ms zoom. A phone therefore reads as a natural-width, vertically scrollable page.
- **Under the hood:** an 80px minimum tinted summary, 28px heading and clear Explore/Close state. Keep measured, interruptible unfolding and same-frame Fit geometry synchronization; extended engineering prose, architecture, notes and excerpts remain inside.
- Preserve 3D page turns, per-folio reading position, keyboard navigation, touch scrolling, horizontal Fit swipes and reduced-motion alternatives. Print expands the technical material and both media panels.

Primary feature actions and media tabs have 44px minimum heights. Focus indicators use the theme's secondary ink. Keep labels, captions and provenance attached to the figures or facts they qualify.

## Maintenance

Avoid reintroducing `nth-child` layout alternation or page-reader rules that reconstruct a second version of a feature. All responsive compositions should be selected by the actual unscaled sheet width. Keep source-only design/skill files out of the static deployment. Existing artwork provenance remains in the asset rebuild notes and screenshot captions.
