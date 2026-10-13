# SLOP ILLUSTRATED (Si.) — Navigation, Folio & Link Audit

**Auditor:** navigation subagent
**Repository:** `/home/mojo/projects/ussysite6`
**Live render audited:** `http://127.0.0.1:18510/` (served files byte-identical to the working tree)
**Method:** static read of every HTML/CSS/JS/MD file, a headless Playwright pass over the live DOM (all `[id]`, every `<a href>`, headers, TOC, footers, cover lines, SVG plate text), and HTTP status checks on every external URL.
**Owned by this task:** `js/issue-map.js` (new) and this document. Nothing else was modified.

This issue is rebranded **SLOP ILLUSTRATED (Si.)**. The old name `THE SLOP COMPUTING ANNUAL` and the `USSY…`/`ussy…` identifiers still appear in 90+ places; renaming is main's job and is tracked in §7.

---

## TL;DR for main

1. **Use `js/issue-map.js`** as the single source of truth for folio numbers. It derives `cover 01`, `contents 02`, `features 03–13`, `reader-service 14` from the catalog — no hard-coded 112, no hard-coded count.
2. **Delete the fake pagination.** `totalPages: 112`, every `pageRange: 'pp. XX–YY'`, and the `112 PAGES` claims (including the one baked into the TOC SVG plate) are untrue for a responsive website.
3. **Rewire the consumers** (`js/app.js`, `js/cover-plate.js`, `js/magazine-widgets.js`) from `proj.pageRange` to `formatFolio(issueEntry.folio)`. Exact snippets in §7.
4. All **internal anchors currently resolve** (0 broken) and **every fetched external resource returns 200** (the only 404 is the `fonts.gstatic.com` preconnect host, which is never fetched as a document); keep `github.com/mojomast` and `arena.ussyco.de`. No link is broken today — only the *labels* are dishonest.
5. The **ISSN, UPC barcode, business-reply postage permit, cover price, and Vol./No. claim are fabricated** (§5). Recommend dropping or clearly framing them as period styling, not facts.

---

## 1. Canonical logical digital-folio model

The issue is a living, responsive scrolling site. It has **no meaningful physical page count** and **no fixed page ranges**. What it has is a stable, ordered set of **folios** — one navigable spread per folio, in reading order. `js/issue-map.js` is the canonical authority.

### Mapping (current 11 features)

| Folio | Kind | DOM id / anchor | Label | Project id |
|------:|------|-----------------|-------|------------|
| 01 | cover | `#issue-cover` | Front Cover | — |
| 02 | contents | `#toc-spread` | Contents | — |
| 03 | feature | `#spread-orbitdesktop` | OrbitDesktop | `orbitdesktop` |
| 04 | feature | `#spread-velvetrp` | VelvetRP | `velvetrp` |
| 05 | feature | `#spread-jammate` | JamMate | `jammate` |
| 06 | feature | `#spread-cocs` | CoCS // Colosseum of Competitive Slop | `cocs` |
| 07 | feature | `#spread-cocs-godot` | CoCS-Godot | `cocs-godot` |
| 08 | feature | `#spread-routetok` | RouteTok | `routetok` |
| 09 | feature | `#spread-rgbagentflightindicator` | RGBAgentFlightIndicator | `rgbagentflightindicator` |
| 10 | feature | `#spread-mothbake` | MothBake | `mothbake` |
| 11 | feature | `#spread-warpi` | Warpi | `warpi` |
| 12 | feature | `#spread-hermesdashboard` | HermesDashboard | `hermesdashboard` |
| 13 | feature | `#spread-becomussy` | Becomussy | `becomussy` |
| 14 | reader-service | `#reader-service-spread` | Reader Service | — |

Total = `projects.length + 3` = **14 logical folios** for the current eleven. Add or remove a feature and the folios renumber themselves; `reader-service` is always last.

### Module API (`js/issue-map.js`)

```js
import {
  buildIssueMap,   // (projects) -> [{ id, href, folio, label, kind, projectId? }]
  totalFolios,     // (projects) -> number           (14 today)
  formatFolio,     // (folio|entry, pad=2) -> '03'
  getIssueEntry,   // (projects, 'spread-jammate' | 'jammate') -> entry | null
  findDuplicateIssueIds, // (projects) -> ['spread-x', ...]  (empty === healthy)
  featureId,       // (projectId) -> 'spread-<projectId>'
  FOLIO_KIND, COVER_ID, CONTENTS_ID, READER_SERVICE_ID
} from './issue-map.js';
```

Properties guaranteed by the module (verified by `/tmp/opencode/si-navigation/verify.mjs`):

- Pure ESM, no DOM/network/side effects — safe in browser, `server.mjs`, and tests.
- Folios are contiguous `1..N`, assigned in reading order.
- `id` values are exactly the DOM ids already produced by `index.html` + `js/app.js`, so every `href` resolves.
- Duplicate project ids are handled deterministically (first wins) and reported by `findDuplicateIssueIds`.

Run the syntax + behaviour check:

```bash
node --check js/issue-map.js
node /tmp/opencode/si-navigation/verify.mjs   # prints the 14-folio map + 14 assertions
```

---

## 2. Link inventory

### 2.1 Internal anchors (all resolve — 0 broken)

Generated/static targets confirmed present in the live DOM (257 ids total).

**Header** (`index.html`):

- `#issue-cover` — CMYK registration target mark.
- `#toc-spread` — `TOC` tab.
- `#reader-service-spread` — `CARD` tab.
- 11 × `#spread-<id>` — `folio-page-tabs` (JS-generated, label currently `01..11`).

**Cover** (`index.html`):

- 4 cover-story teasers → `#spread-orbitdesktop`, `#spread-jammate`, `#spread-cocs`, `#spread-becomussy`
  (labelled `p. 08`, `p. 28`, `p. 38`, `p. 100`).
- 7 department links → `#spread-velvetrp`, `#spread-cocs-godot`, `#spread-routetok`, `#spread-rgbagentflightindicator`, `#spread-mothbake`, `#spread-warpi`, `#spread-hermesdashboard`
  (labelled `pp. 18 / 48 / 56 / 66 / 74 / 82 / 90`).
- Cover SVG (`js/cover-plate.js`) renders 11 `role="button"` nodes; each fires `scrollIntoView` (not `<a>`; accessible names embed `pageRange`).

**TOC** (`#toc-article-list`, JS): 11 entries → `#spread-<id>`; footer `BEGIN READING ↗` → `#spread-orbitdesktop`.

**Feature spread chain** (`js/app.js` footers): each `NEXT / <title> ↗` → next `#spread-<id>`; last (Becomussy) → `#reader-service-spread`.

**Reader service** (`index.html`): footer `BACK TO THE COVER ↗` → `#issue-cover`.

**Note:** every `#spread-*` target is created by `js/app.js` at runtime. If JS fails, the header/TOC/cover anchors have no target. Acceptable for this app, but worth knowing.

### 2.2 External links (HTTP-checked)

| URL | Status | Where |
|-----|-------:|-------|
| `https://github.com/mojomast` | 200 | masthead + colophon |
| `https://arena.ussyco.de` | 200 | CoCS spec card (`liveUrl`); **must remain** |
| `https://github.com/mojomast/orbitdesktop` | 200 | spec card + bingo |
| `https://github.com/mojomast/velvetrp` | 200 | spec card + bingo |
| `https://github.com/mojomast/jammate` | 200 | spec card + bingo |
| `https://github.com/mojomast/cocs` | 200 | spec card + bingo |
| `https://github.com/mojomast/cocs-godot` | 200 | spec card + bingo |
| `https://github.com/mojomast/routetok` | 200 | spec card + bingo |
| `https://github.com/mojomast/rgbagentflightindicator` | 200 | spec card + bingo |
| `https://github.com/mojomast/mothbake` | 200 | spec card + bingo |
| `https://github.com/mojomast/warpi` | 200 | spec card + bingo |
| `https://github.com/mojomast/hermesdashboard` | 200 | spec card + bingo |
| `https://github.com/mojomast/becomussy` | 200 | spec card + bingo |
| `https://fonts.googleapis.com` (preconnect + stylesheet) | 200 | `<head>` |
| `https://fonts.gstatic.com` (preconnect only) | 404 bare host* | `<head>` |

\* `fonts.gstatic.com` 404 is expected: it is a `preconnect` hint, never fetched as a document. The actual Google Fonts CSS request returns 200 and is CSP-allowlisted in `server.mjs`.

**Relative links:** `./index.css` and the six `assets/screenshots/*.png` (each referenced twice: image link + “View full size”). All ten screenshot requests returned 200 in the Playwright run; `requestfailed` was empty.

**Category count of the 29 external anchors in the live DOM:** 11 repo spec-card links, 1 arena link, 12 screenshot links (6 files × 2), 2 × `github.com/mojomast` (masthead + colophon), 3 bingo-summary repo links (default circled `#101, #104, #111`).

**Verdict:** no broken internal or external links, no network failures. `github.com/mojomast` and `arena.ussyco.de` remain.

---

## 3. Fake page-count & pagination claims (must change)

Every item below asserts a physical print pagination that the responsive site does not have. The **rendered** claims are the visible problem; the **data** claims feed them.

### 3.1 Catalog data — `projects.js` **and** `js/projects.js` (byte-identical mirror)

| Location | Current | Problem |
|---|---|---|
| `MAGAZINE_ISSUE_META.totalPages` | `112` | Hard-coded total that no longer means anything; surfaced nowhere honest. |
| `pageRange` ×11 | `pp. 08–17`, `18–27`, `28–37`, `38–47`, `48–55`, `56–65`, `66–73`, `74–81`, `82–89`, `90–99`, `100–111` | Implies fixed print spreads; also non-uniform (10,10,10,10,8,10,8,8,8,10,12) and inconsistent with the TOC/cover labels. |

### 3.2 `index.html` (static text)

| Line (as audited) | Current | Recommended |
|---|---|---|
| 48 | `VOL. 11, NO. 10 · OCT 2026` | see §5/§6 |
| 120/127/134/141 | cover teasers `p. 08 / p. 28 / p. 38 / p. 100` | `FOLIO 03 / 05 / 06 / 13` |
| 171–177 | departments `pp. 18 / 48 / 56 / 66 / 74 / 82 / 90` | `FOLIO 04 / 07 / 08 / 09 / 10 / 11 / 12` |
| 196 | `data-section-label="pp. 04–07 // TABLE OF CONTENTS & EDITORIAL"` | `FOLIO 02 // TABLE OF CONTENTS & EDITORIAL` |
| 200 | `PAGES 04–07` | `FOLIO 02` |
| 230 | `Cards #101–#111 (See Perforated Insert on Page 112)` | `… (See Perforated Insert, FOLIO 14)` |
| 254 | footer `<span class="folio-page">04</span> … 07` | `02` |
| 265 | `data-section-label="p. 112 // READER SERVICE INQUIRY CARD"` | `FOLIO 14 // READER SERVICE INQUIRY CARD` |
| 269 | `PAGE 112` | `FOLIO 14` |
| 324 | footer `<span class="folio-page">112</span>` | `14` |

> **Better:** render the cover teasers, department list, TOC header/footer, and spread headers *from* `js/issue-map.js` in `js/app.js` so the labels can never drift again (snippet in §7.3). The static numbers above are the minimum if main prefers to keep the cover markup hard-coded.

### 3.3 `js/app.js` (dynamic text)

| Line (as audited) | Current | Recommended |
|---|---|---|
| 52 | `tab.title = \`${proj.title} (${proj.pageRange})\`` | `… (FOLIO ${formatFolio(entry.folio)})` |
| 60 | `toc-entry-pages` = first number of `pageRange` (`08`, `18`, …) | `formatFolio(entry.folio)` |
| 83 | `dataset.sectionLabel = \`${proj.pageRange} // …\`` | `FOLIO … // …` |
| 85 | `const pageNumbers = proj.pageRange.match(/\d+/g)` | delete; use `entry.folio` |
| 96–97 | spread header volume + `pp. 08–17 · SERVICE NO. #101` | new identity + `FOLIO 03 · SERVICE NO. #101` |
| 259 / 262 | footer `<span class="folio-page">${pageNumbers[0]}</span>` / `[1]` | `formatFolio(entry.folio)` (same folio both sides) |
| 305 | comment “Bingo Card (Page 112)” | “(FOLIO 14)” |

### 3.4 Rendered SVG artwork (the audit found text baked into plates)

| File | What | Action |
|---|---|---|
| `js/plates/toc.js` line 97 | `> PRESS RUN: 112 PAGES BOUND ▌` | Replace with an honest line, e.g. `> PRESS RUN: ELEVEN FEATURES LIVE ▌` or `> DIGITAL EDITION: FOURTEEN FOLIOS ▌`. |
| `js/plates/toc.js` lines 91–92 | CRT masthead `SLOP` + `COMPUTING ANNUAL · OCT 2026` | Update identity to `SLOP ILLUSTRATED · OCT 2026`. |
| `js/plates/toc.js` line 162 | periodical prop `THE SLOP ANNUAL 1984` | OK as an in-fiction prop; optionally `SLOP ILLUSTRATED 1984`. |
| `js/plates/toc.js` line 149 | `BYTE · VOL. 9 NO. 10` | A real *BYTE* issue reference used as a prop — keep (it is historically accurate for a 1984 prop), or genericise. |
| `js/plates/rgbagentflightindicator.js` line 91 | `label(0, 112, …)` | **Not a page ref** — a Y coordinate. Ignore. |
| `js/plates/orbitdesktop.js` line 93 | `height="112"` | **Not a page ref** — an SVG attribute. Ignore. |

### 3.5 README.md

- `pp. 04–07`, `pp. 08–111`, `p. 112` and the per-project `pp. NN–NN` list (lines 13–33) → folios per §1.
- Remove any implication of a fixed print run.

### 3.6 `index.css`

- Comment only: `BACK MATTER … (PAGE 112)` (≈ line 1335). Cosmetic; update the comment.
- `width: 112px` (≈ line 1945) is layout, **not** a page claim.

---

## 4. TOC labels & coherence issues

- **Two competing numbering systems today:** the header tabs / TOC service column use `proj.index` (`01..11`), while the TOC page figures and cover lines use `pageRange` starts (`08, 18, 28, …`). They describe the same features with different numbers. `js/issue-map.js` collapses both into one folio (`03..13`).
- **TOC reveal:** the TOC page figure shows only the *start* of `pageRange` (`08`), while the spread header shows the full `pp. 08–17`. Under the folio model both should read `03`.
- **`pp. 04–07`** implies a four-page editorial block; it is one logical folio (`02`).
- **Reader Service** is labelled three different ways: header tab `CARD`, footer `112`, TOC masthead “Page 112”. Canonicalise on `FOLIO 14`.
- **`USSY_PROJECTS[proj.index]`** (`js/app.js` line 86) is used to find the next spread. It happens to work because `index` is 1-based, but it is an off-by-one waiting to bite. Prefer ordering via `buildIssueMap()` / catalog index.

---

## 5. Fabricated publication metadata (honesty review)

These are period-flavour details that read as factual identifiers. None are real.

| Claim | Where | Finding | Recommendation (non-overbearing) |
|---|---|---|---|
| `ISSN 2026-8779` | `projects.js` / `js/projects.js` `MAGAZINE_ISSUE_META.issn`; `index.html` `.cover-issn` | **Invalid ISSN**: check digit for `2026-8779` is `7`, not `9`. | Remove, or relabel in place as a fictional identifier. Lowest-friction: drop `issn` from metadata and the cover chip. |
| UPC/EAN barcode `0 74470 20261 10` | `index.html` `.upc-barcode-box` | The 13 digits form a **structurally valid EAN-13** (check digit `0` verifies), but they are a synthetic, unregistered number, and `upc-bars` is a CSS pattern rather than a true barcode. `aria-label="Issue Barcode"` overstates it. | Keep as decoration; change `aria-label` to “Decorative period barcode” so it is not read as a real scannable product code. |
| “BUSINESS REPLY MAIL / FIRST-CLASS PERMIT NO. 2026 · SLOPVERSE” and “POSTAGE WILL BE PAID …” | `index.html` reader-service spread | Implies a real Business Reply Mail permit. | The bingo card is a real interactive feature; keep the aesthetic but caption it as a fictional indicia (e.g. append “· fictional”) or soften the copy. Avoid a large disclaimer. |
| `$6.50 US · £4.95 UK · ¥1,200 JP` | `projects.js` `priceTag`; `index.html` cover top strip | Implies a priced print product sold in three currencies. | Drop, or label as a fictional newsstand price. |
| `Vol. 11, No. 10` / `Volume 11 / Number 10` | `projects.js` `volume`; `index.html` (running header, TOC, cover, spread headers); `js/app.js` line 96; `/api/health` | Implies 10 prior 2026 issues and 11 volumes. | Either clearly frame as an homage to a periodical, or simplify the identity to `SLOP ILLUSTRATED (Si.) · October 2026`. If kept, do not surface it as bibliographic fact in `/api/health`. |
| “SPECIAL COLLECTOR’S EDITION” / “BOUND-IN SOUND SHEET” | `index.html` cover | Marketing framing. | Optional: fine as clearly stylistic cover copy. |

`MAGAZINE_ISSUE_META.totalPages: 112` is the clearest false bibliographic number and should simply go.

---

## 6. Recommended terminology (honest, not preachy)

Use **folio** for the navigable unit and **digital edition / living edition** for the artifact. Avoid “page”, “pages”, “pp.”, and “print run” except in explicit period-styling props.

- `FOLIO 03` / `FOLIO 14` — nav tabs, TOC figures, spread headers, footers.
- `FOURTEEN FOLIOS · ELEVEN FEATURES` — the honest replacement for “112 pages”.
- `READING ORDER` instead of page ranges.
- `DIGITAL EDITION` / `LIVING EDITION` where the old copy said “issue” or implied a print run.
- Keep the print-homage *illustrations* (press room, ink, plates); they are style, not claims.

No banner or modal disclaimers needed — just accurate labels and removal of the fake identifiers.

---

## 7. Exact integration guidance for main

> All shared files are owned by main. This section is copy-paste guidance only. Line numbers are as audited and may shift as the six catalog agents finish.

### 7.1 Catalog — `projects.js` **and** `js/projects.js`

1. Remove `MAGAZINE_ISSUE_META.totalPages` (and `issn`/`priceTag` per §5, at main's discretion).
2. Remove the `pageRange` field from all 11 projects. Folios now come from the module.
3. Keep the two files **byte-identical** — `npm run check:mirrors` enforces this. The six agents edit only the **root** `projects.js`; after they finish, mirror it to `js/projects.js` (e.g. `cp projects.js js/projects.js`) before running checks.
4. Update `id`-adjacent identity strings (`publicationTitle`, `publicationAcronym`, `subtitle`, `volume`) to the new `SLOP ILLUSTRATED` / `Si.` naming.

### 7.2 Add the module to the syntax gate (optional but recommended)

In `package.json` `check:syntax`, add `node --check js/issue-map.js` alongside the other `js/*.js` checks.

### 7.3 `js/app.js`

```js
// import
import { buildIssueMap, formatFolio, getIssueEntry, totalFolios } from './issue-map.js';

// inside DOMContentLoaded, once
const issueMap = buildIssueMap(USSY_PROJECTS);
const issueEntry = (project) => getIssueEntry(USSY_PROJECTS, project.id);

// renderNavigationAndToc()
const entry = issueEntry(proj);
tab.textContent = formatFolio(entry.folio);
tab.title = `${proj.title} (FOLIO ${formatFolio(entry.folio)})`;
// TOC figure
`<span class="toc-entry-pages" aria-label="Folio ${formatFolio(entry.folio)}">${formatFolio(entry.folio)}</span>`

// renderAllArticleSpreads()
const entry = issueEntry(proj);
section.dataset.sectionLabel = `FOLIO ${formatFolio(entry.folio)} // ${proj.issueSection}`;
// header
`<span>SLOP ILLUSTRATED · ${MAGAZINE_ISSUE_META.volume}</span>`
`<span>FOLIO ${formatFolio(entry.folio)} · SERVICE NO. #${proj.readerServiceNo}</span>`
// footer (both sides = the same logical folio)
`<span class="folio-page">${formatFolio(entry.folio)}</span>`
```

For the “next spread”, prefer the map over `USSY_PROJECTS[proj.index]`:

```js
const idx = issueMap.findIndex((e) => e.projectId === proj.id);
const next = issueMap.slice(idx + 1).find((e) => e.kind === 'feature');
const nextHref = next ? next.href : '#reader-service-spread';
```

The `<span class="folio-page">112</span>`-style guesswork is replaced by `formatFolio(entry.folio)` everywhere.

### 7.4 `index.html`

Apply the §3.2 table. If main chooses to generate cover/TOC labels from the module, expose containers and let `app.js` fill them; otherwise the static `FOLIO NN` strings must be kept in sync manually. The `data-section-label`s on `#toc-spread` and `#reader-service-spread` should become `FOLIO 02 …` / `FOLIO 14 …`.

### 7.5 `js/cover-plate.js`

Replace the three `proj.pageRange` uses (accessible name ~line 273, `<title>` ~line 274, readout ~line 340) with the folio:

```js
import { getIssueEntry, formatFolio } from './issue-map.js';
const entry = getIssueEntry(USSY_PROJECTS, n.proj.id);
const folio = formatFolio(entry.folio);
// aria-label: `Reader service #${readerServiceNo}: ${title}, FOLIO ${folio}. Jump to spread.`
// title:       `${title} · FOLIO ${folio}`
// readout:     `NODE #${readerServiceNo}: ${shortTitle(title)} (FOLIO ${folio})`
```

Low-touch alternative: in `app.js`, before `initCoverPlate`, annotate each project once (`project.__issueEntry = issueEntry(project)`) and read `formatFolio(proj.__issueEntry.folio)` in consumers. Do not hard-code `03..13`.

### 7.6 `js/magazine-widgets.js`

Line ~57 uses `proj.pageRange` in the node readout. Same treatment: import `formatFolio` + `getIssueEntry`, render `FOLIO ${formatFolio(entry.folio)}`.

### 7.7 `js/plates/toc.js`

Change line 97’s rendered string `PRESS RUN: 112 PAGES BOUND` → e.g. `PRESS RUN: ELEVEN FEATURES LIVE`, and update the CRT masthead identity on lines 91–92 to `SLOP ILLUSTRATED`. This is the only *rendered SVG* page-count claim in the issue.

### 7.8 `README.md`

Replace the page-range list and `p. 112` with the §1 folio table; describe the artifact as a living digital edition with fourteen logical folios.

### 7.9 `server.mjs` (+ `/api/health`)

Optional truthfulness win: import `totalFolios` from `./js/issue-map.js`, drop `volume` if the Vol./No. claim is retired, and add:

```js
totalFolios: totalFolios(USSY_PROJECTS),
folioModel: 'logical-digital-folio',
```

Note: `server.mjs` imports the catalog **once at boot**, so `/api/health` can report stale metadata until the server restarts (observed during this audit — it still returned `THE USSY COMPUTING ANNUAL` after the source was renamed). Restart after catalog edits.

### 7.10 Comments/headers referencing the old name

`server.mjs`, `projects.js`, `js/projects.js`, `js/app.js`, `js/svg-kit.js`, `js/magazine-widgets.js`, `js/plates/index.js`, `js/press-sdk.js`, `index.css` all carry `USSYSITE6 // THE SLOP COMPUTING ANNUAL` header comments. Update to `SLOP ILLUSTRATED (Si.)` for coherence. The `USSY_PROJECTS` **export name** is used widely; if it must change, do it in one sweep and update every importer (13 files). The `arena.ussyco.de` domain and `github.com/mojomast` must **not** change.

---

## 8. Verification commands

```bash
# module syntax
node --check js/issue-map.js

# behaviour + cross-check against the real DOM ids / catalog (standalone, /tmp only)
node /tmp/opencode/si-navigation/verify.mjs

# project gates (after main's edits)
npm run check:syntax
npm run check:mirrors
npm test
```

Expected: `verify.mjs` prints the 14-folio map and `ALL CHECKS PASSED`. `check:mirrors` requires root `projects.js` and `js/projects.js` to be byte-identical.

Live-DOM re-audit (optional; playwright is at `/tmp/opencode/slop-review/node_modules`):

```bash
NODE_PATH=/tmp/opencode/slop-review/node_modules node /tmp/opencode/si-navigation/audit.cjs
```

---

## 9. Residual risks & open questions

- **JS-dependent anchors.** Feature sections exist only after `app.js` runs. A no-JS visitor sees cover/TOC/header anchors pointing at ids that do not exist. Pre-existing; not introduced here.
- **Stale server metadata.** `/api/health` caches the catalog at boot. Restart the server after `projects.js` changes.
- **Six catalog agents in flight.** Edits to root `projects.js` must be mirrored to `js/projects.js` before `check:mirrors`/`test`. The page-range removals should happen after they land, to avoid merge churn.
- **`BYTE · VOL. 9 NO. 10` prop** in `toc.js` is a real historical *BYTE* reference used decoratively — keep or genericise, but it is not a false claim about *this* publication.
- **Decision needed from user/main:** whether to keep the Vol./No. and collector-edition framing as explicit period homage, or retire it entirely. This audit recommends retiring the fake identifiers (ISSN, barcode check digits, permit, price, totalPages) while keeping the print *aesthetic*.

---

*Files created by this task:* `js/issue-map.js`, `docs/editorial-audit/navigation.md`.
*Standalone helpers (not shipped):* `/tmp/opencode/si-navigation/{verify.mjs,audit.cjs,audit.json}`.
