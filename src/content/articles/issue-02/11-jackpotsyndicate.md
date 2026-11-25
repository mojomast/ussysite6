---
issueNumber: "02"
articleSlug: "jackpotsyndicate"
index: 11
readerServiceNo: 211
section: "DETERMINISTIC ARCADE // DOGFOODING THE FACTORY"
layoutVariant: "dossier"
title: "Jackpot Syndicate"
kicker: "Arcade Roguelite · Built With Rizzstack"
headline: "The Money Isn’t Real Until It Falls Off the Edge"
deck: "Slot reels feed a pachinko field, the balls become coins on a pusher
  shelf, and your bankroll only moves when a coin actually drops over the lip.
  Play money, no accounts, no network calls."
byline: "By SLOPTIMUS PRIME"
category: "Deterministic Game / Factory Dogfood"
glanceNote: "226 passing tests, 10 of 10 browser journeys in Chromium and in
  Firefox, a golden replay of a winning run, and 67 of 71 sprites locked with 4
  honest placeholders. Built with rizzstack and Hermes."
pullQuote: "A coin-pusher game that miscounts coins is just a sad sculpture."
repoUrl: "https://github.com/mojomast/jackpotsyndicate"
liveUrl: null
sourceRevision: "b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217"
researchedAt: "2026-11-23"
spotInkHex: "#ef4444"
secondaryInkHex: "#eab308"
techStack:
  - "TypeScript"
  - "pnpm 10.28 Workspace"
  - "Vite"
  - "Deterministic Physics / Replay"
  - "Playwright (Chromium · Firefox · WebKit)"
metrics:
  - label: "Unit & App Tests"
    value: "226 passed (193 pkg + 33 app)"
  - label: "Sprite Atlas Lock"
    value: "67 / 71 locked PNGs · 4 vector placeholders"
  - label: "Gzip Bundle Budget"
    value: "3.00 MB hard ceiling (apps/game/scripts/bundle.ts)"
verifiedCapabilities:
  - "Three-stage deterministic arcade loop: slot reels feed a pachinko pinfield
    whose orbs spawn tokens onto a moving coin-pusher shelf"
  - "Committed golden Victory replay fixture verified across Chromium (10/10
    E2E), Firefox (10/10 E2E), and WebKit (1/1 golden replay)"
  - "Dedicated simulation harnesses for gutter rake (sim:rake), 3×3 hit-rate
    (sim hitrate), bot synergy balance (sim balance), and worst-case tick
    timing"
  - "Automated gzip bundle-budget auditor (apps/game/scripts/bundle.ts)
    enforcing a 3 MiB ceiling and bankroll invariant assertions (b8cd1fe)"
architecture:
  - "Monorepo split between `packages/` (deterministic simulation, physics rake,
    animation) and `apps/game` (browser presentation, save safety, accessibility
    audit `a11yAudit.ts`)."
  - "Content-addressed sprite atlas
    (`apps/game/public/atlas/asset-manifest.json`): hashes every asset
    (`0bebb5ed6cc8-trinket.gold-peg-alchemist.png`,
    `1a6ea3b72c3c-trinket.midas-lip-sensor.png`) and resolves 67 locked renders
    alongside 4 explicit placeholders."
  - "Strict bankroll accounting (`b8cd1fe`): tests verify bankroll state
    transitions against every announced bankroll change, tokens teetering on the
    shelf are unbanked until they clear the lip."
  - "Offline-only play-money boundary: zero telemetry, zero remote calls, zero
    monetization."
fieldNotes:
  - For that documentation task, the README lists the sim reports and the full
    WebKit journeys as NOT RUN, rather than carrying old green checks forward.
  - Four of the 71 sprite keys are generated vector placeholders. Art credits
    are in docs/ASSET_CREDITS.md.
  - The build triggers Vite’s warning about a chunk over 500 kB; the gzipped
    total stays inside the 3 MB budget.
readingGuide:
  - "READING GUIDE // README.md: five-command quickstart and the T-092
    conservative verification ledger."
  - "READING GUIDE // apps/game/scripts/bundle.ts: 3 MiB gzip budget measurement
    across dist/."
  - "READING GUIDE // docs/CONTRACTS.md & docs/ASSET_CREDITS.md: Rizzstack
    contracts and 67/71 asset provenance."
flexiFreqs:
  - 349.23
  - 440.0
  - 523.25
  - 698.46
plate:
  kind: "carbon-svg"
  svgId: "plate-jackpot"
  width: 1600
  height: 1200
  title: "The Midas Lip Sensor"
  medium: "CARBON LITHOGRAPH · DETERMINISTIC KINEMATICS"
  alt: "Cross-section mechanical schematic of three slot reels dropping pachinko
    spheres through golden pegs onto a reciprocating hydraulic dozer shelf where
    coins count only past the front lip sensor."
secondaryMedia:
  kind: "svg-study"
  studyId: "jackpot"
  width: 800
  height: 450
  caption: "Follow one coin from the reels to the lip. It is not yours until it falls."
codeExcerpt:
  title: "LISTING 11.1 // GZIP BUNDLE BUDGET AUDITOR (apps/game/scripts/bundle.ts)"
  lang: "ts"
  code: |
    export const BUNDLE_BUDGET_BYTES = 3 * 1024 * 1024;
    ...
    export function measureBundle(distDir: string): BundleReport {
      const files = walk(distDir)
        .map((file) => {
          const raw = readFileSync(file);
          return {
            path: relative(distDir, file).replaceAll('\\', '/'),
            rawBytes: raw.byteLength,
            gzipBytes: gzipSync(raw).byteLength,
          };
        })
        .sort((left, right) => right.gzipBytes - left.gzipBytes);
      const rawBytes = files.reduce((total, file) => total + file.rawBytes, 0);
      const gzipBytes = files.reduce((total, file) => total + file.gzipBytes, 0);
      return { distDir, files, rawBytes, gzipBytes, budgetBytes: BUNDLE_BUDGET_BYTES, withinBudget: gzipBytes <= BUNDLE_BUDGET_BYTES };
    }
  sourceLabel: "apps/game/scripts/bundle.ts L5–L55 · jackpotsyndicate@b8cd1fe"
  sourceUrl: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3\
    e56dabcc6201a935c4c5217/apps/game/scripts/bundle.ts#L5-L55"
sources:
  - label: "jackpotsyndicate README: 5-command build & conservative T-092 status
      table"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dab\
      cc6201a935c4c5217/README.md"
  - label: "apps/game/scripts/bundle.ts: 3 MiB gzip bundle budget gate"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dab\
      cc6201a935c4c5217/apps/game/scripts/bundle.ts"
  - label: "docs/ARCHITECTURE.md: slot-to-pachinko-to-pusher deterministic simulation"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dab\
      cc6201a935c4c5217/docs/ARCHITECTURE.md"
  - label: "docs/CONTRACTS.md: acceptance criteria (AC-5 rake, AC-6 balance, AC-7
      hitrate)"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dab\
      cc6201a935c4c5217/docs/CONTRACTS.md"
  - label: "docs/ASSET_CREDITS.md: 67 locked imagegen derivatives & 4 placeholders"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dab\
      cc6201a935c4c5217/docs/ASSET_CREDITS.md"
---

If you build a software factory, sooner or later someone asks to see a product. Jackpot Syndicate is one. It is a browser game with a very particular shape: slot reels feed a pachinko pinfield, the orbs spawn tokens on a coin-pusher shelf, and cash is banked only when a token crosses the pusher lip. Anyone who has stood at a seaside arcade watching a coin hang over the edge for a full minute understands the design immediately. It is play money. There are no accounts, purchases, ads or runtime network calls.

The factory’s habits show everywhere. Separate harnesses check gutter rake, reel hit rates and bot balance against named acceptance criteria. A script measures the gzipped build against a 3 MB budget. A committed golden replay records a winning run at the current hash. The latest commit checks the bankroll against every announced bankroll change, because a coin-pusher game that miscounts coins is just a sad sculpture.

Our favourite part is the verification table in the README. It records what was run for one documentation task on 15 November, and nothing else. Lint, typecheck, build and 226 tests passed. Four sprites are still vector placeholders. Vite grumbled about a large chunk. Everything that wasn’t rerun says NOT RUN, in capitals. It is the least glamorous table in the issue and we would frame it.
