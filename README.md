# SLOP ILLUSTRATED (Si.) · Issue 01

**A source-linked field journal of software and the work behind it.** Edited by **SLOPTIMUS PRIME** ([github.com/mojomast](https://github.com/mojomast)). October 2026 digital edition, implemented in `ussysite6`.

## Reading the issue

The magazine keeps a print-inspired spread arrangement: a large SLOP / Illustrated. masthead, interactive biomechanical cover art (*The Machine Beneath the Skin*), contents and editor’s letter, eleven illustrated features, and the Source Room. `js/issue-map.js` derives the canonical digital folios from the catalog. These identify navigable sections; browser printing has variable pagination.

| Folio | Feature | Second figure |
| --- | --- | --- |
| 01 | Cover / illustrated project index | Eleven keyboard-accessible project links |
| 02 | Contents & editor’s desk | Press-room frontispiece |
| 03 | OrbitDesktop · #101 | Desktop launcher screenshot |
| 04 | VelvetRP · #102 | Adventure Table screenshot |
| 05 | JamMate · #103 | Live Jam playing-state **mock test fixture**, captioned as such |
| 06 | Colosseum of Competitive Slop · #104 | Client prediction / authority illustration |
| 07 | CoCS-Godot · #105 | Meridian Exchange / Team Deathmatch screenshot |
| 08 | RouteTok · #106 | Operations dashboard screenshot |
| 09 | RGBAgentFlightIndicator · #107 | Default status-palette study |
| 10 | MothBake · #108 | Baked-texture gallery screenshot |
| 11 | Warpi · #109 | Pi agent / BYOK request-flow illustration |
| 12 | HermesDashboard · #110 | Session / resource-graph study |
| 13 | Becomussy · #111 | Five memory-kind study |
| 14 | The Source Room | Project shelf, saved reading list, Markdown export, and reading notes |

CoCS links to the live arena at **[arena.ussyco.de](https://arena.ussyco.de)**.

## Editorial sources

Every feature includes `sources`, a pinned `sourceRevision`, `researchedAt`, and a `codeSource` link for its repository excerpt. Research reports in `docs/editorial-audit/` record the evidence and corrections. Descriptions distinguish the contribution of each project from upstream work—for example, Warpi adds a Pi-powered agent backend and BYOK configuration to Warp’s existing terminal interface, and JamMate builds on Guitar Companion.

“At a glance” boxes contain source-supported facts or explicitly labelled targets. Takeaways are editorial statements. Reading notes replace synthetic execution logs. Blender still lifes, drawn SVG plates, and the five interactive SVG studies are conceptual illustrations; screenshots and test fixtures have captions identifying their provenance. Artwork and copy were developed with AI assistance.

When updating copy, review implementation as well as documentation, pin the revision used, and update the associated source links. Keep root `projects.js` and runtime `js/projects.js` byte-identical.

## Visual and interaction system

- Cover project links support pointer interaction and arrows, Home/End, Enter/Space.
- Editorial plate modules live in `js/plates/` and return inline SVG artwork or a local image with its title, medium, intrinsic dimensions, and alt text. Blender still lifes retain their original 4:3 framing on desktop and mobile.
- All twelve editorial frames keep their natural 4:3 proportions instead of stretching to fill a taller text column. Source references form a compact full-width band below each feature. Wider “At a glance” cards include short source-supported context notes. Unloaded artwork uses the current paper mode’s neutral background.
- Eight native-SVG still lifes use layered vector materials, reflections, bevels, and contact shadows. `js/svg-kit.js` supplies scoped definitions and illustration helpers. Keep IDs unique across the issue, including interactive study states.
- Six locally hosted screenshots live in `assets/screenshots/`. The catalog records intrinsic dimensions and links each image to its full-resolution version.
- Five responsive native-SVG studies in `js/article-studies.js` have explicit step controls and keyboard interaction. Their readouts describe illustrated states. Each study uses a 640 × 360 viewBox and renders statically between interactions.
- Darkroom is the default paper mode; readers can select Cream or Blueprint, and their saved choice is restored on reload. Optional registration-grid loupe; reduced-motion handling, offscreen animation pausing, responsive and print styles.
- Fraunces display type, Newsreader body type, Space Grotesk labels, and IBM Plex Mono annotations.
- The flexi-disc is a WebAudio sound sketch: synthesized tone sequences, vinyl-like surface noise, and relay clicks made for the magazine.
- `js/source-room.js` renders the closing project shelf. Readers can open repositories, save projects from either the shelf or feature cards, select all, clear their list, and copy repository links as Markdown. A selectable text fallback handles unavailable clipboard access. Keyboard focus is preserved when saving; state is restored on reload.
- `window.PressSDK` persists reader selections and notes in localStorage and posts them to `/api/press/state`. The server state is in-memory and shared by clients. Existing service-number storage keys are retained so earlier saved selections still work.

### Blender artwork

The cover and editorial still lifes are original procedural Blender scenes rendered
with Cycles, denoising, and AgX. The browser loads compressed local WebP images;
each asset directory includes the Python scene and rebuild instructions.

| Location | Artwork | Source and rebuild notes |
| --- | --- | --- |
| Cover | *The Machine Beneath the Skin* | [`assets/cover/`](assets/cover/README.md) |
| Contents | *After Hours at the Proof Desk* — a lamp-lit CRT editorial workspace | [`assets/editorial/contents/`](assets/editorial/contents/README.md) |
| CoCS | *A Reasonable Amount of Caution* — Claude, the Safety Officer, protecting a tiny teacup | [`assets/editorial/cocs/`](assets/editorial/cocs/README.md) |
| VelvetRP | *An Improbable Turn of the Page* — a book theatre, floating die, and crowned snail | [`assets/editorial/velvetrp/`](assets/editorial/velvetrp/README.md) |
| Becomussy | *The Bureau of Becoming* — a porcelain memory archive pouring a paper recollection into a teacup | [`assets/editorial/becomussy/`](assets/editorial/becomussy/README.md) |

## Quickstart

Zero external runtime dependencies—runs out of the box on Node.js 22+:

```bash
# 1. Verify syntax, catalog mirrors, and test suite
npm run check:syntax
npm run check:mirrors
npm test

# 2. Start the server (defaults to http://127.0.0.1:3000)
npm start
```

`PORT` and `HOST` configure the listener. `/api/health` reports the issue identity, derived folio count, and article IDs. Restart the server after changing catalog metadata because its module imports are cached at startup.

## Production: ussy.host

Nginx serves the publication from `/home/mojo/web/out`. Publish `index.html`,
`index.css`, `projects.js`, `js/`, and the rendered assets there. The existing
`archives/`, `ari/`, and `old2/` directories contain earlier work and should be
preserved. Blender Python sources and asset READMEs are rebuild material, not
required web assets.

`deploy/ussysite6.service` runs the Node 22+ backend on `127.0.0.1:3016`.
`deploy/nginx-ussy.host.conf` reuses the existing TLS certificate, proxies the
magazine API to that backend, and retains the webring and flyer routes.
After publishing the static files, activate the service and proxy on the host:

```sh
sudo bash /home/mojo/projects/ussysite6/deploy/activate.sh
```

The script backs up the prior Nginx site configuration, checks backend health,
validates Nginx before reloading, and checks the public health endpoint.
