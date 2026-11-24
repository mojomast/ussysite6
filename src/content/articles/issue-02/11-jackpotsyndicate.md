---
issueNumber: "02"
articleSlug: "jackpotsyndicate"
index: 11
readerServiceNo: 211
section: "DETERMINISTIC ARCADE // DOGFOODING THE FACTORY"
layoutVariant: "dossier"
title: "Jackpot Syndicate"
kicker: "Slot Reels -> Pachinko Pins -> Coin-Pusher Lip. Built With Rizzstack."
headline: "Cash Only Counts When It Physically Crosses the Pusher Lip"
deck: "A deterministic play-money pachinko and coin-pusher roguelite built with Rizzstack and Hermes—complete with 226 tests, golden Victory replays, and 4 disclosed vector placeholders."
byline: "By SLOPTIMUS PRIME · Folio 13"
category: "Deterministic Game / Factory Dogfood"
glanceNote: "Zero accounts, purchases, ads, or runtime network calls. 226 passing unit tests, 10/10 Playwright E2E passes in Chromium and Firefox, 67/71 locked atlas PNGs, and a 3 MB gzip bundle budget gate."
pullQuote: "This verification table records what actually ran for T-092 on November 15—not what we hope passes next Tuesday."
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
  - "Three-stage deterministic arcade loop: slot reels feed a pachinko pinfield whose orbs spawn tokens onto a moving coin-pusher shelf"
  - "Committed golden Victory replay fixture verified across Chromium (10/10 E2E), Firefox (10/10 E2E), and WebKit (1/1 golden replay)"
  - "Dedicated simulation harnesses for gutter rake (sim:rake), 3×3 hit-rate (sim hitrate), bot synergy balance (sim balance), and worst-case tick timing"
  - "Automated gzip bundle-budget auditor (apps/game/scripts/bundle.ts) enforcing a 3 MiB ceiling and bankroll invariant assertions (b8cd1fe)"
architecture:
  - "Monorepo split between `packages/` (deterministic simulation, physics rake, animation) and `apps/game` (browser presentation, save safety, accessibility audit `a11yAudit.ts`)."
  - "Content-addressed sprite atlas (`apps/game/public/atlas/asset-manifest.json`): hashes every asset (`0bebb5ed6cc8-trinket.gold-peg-alchemist.png`, `1a6ea3b72c3c-trinket.midas-lip-sensor.png`) and resolves 67 locked renders alongside 4 explicit placeholders."
  - "Strict bankroll accounting (`b8cd1fe`): tests verify bankroll state transitions against every announced bankroll change—tokens teetering on the shelf are unbanked until they clear the lip."
  - "Offline-only play-money boundary: zero telemetry, zero remote calls, zero monetization."
fieldNotes:
  - "Built with Rizzstack and Hermes—serving as real-world dogfood for task-sliced delivery (`docs/DELIVERY.md` and `artifacts/acceptance.md`)."
  - "README verification matrix explicitly marks `pnpm sim rake/hitrate/balance` and full WebKit journeys as `NOT RUN` during the T-092 docs pass rather than carrying stale green checkmarks forward."
  - "Vite emits a >500 kB chunk warning during build, disclosed directly in the status table while total gzip stays within the 3 MB budget."
readingGuide:
  - "READING GUIDE // README.md — five-command quickstart and the T-092 conservative verification ledger."
  - "READING GUIDE // apps/game/scripts/bundle.ts — 3 MiB gzip budget measurement across dist/."
  - "READING GUIDE // docs/CONTRACTS.md & docs/ASSET_CREDITS.md — Rizzstack contracts and 67/71 asset provenance."
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
  alt: "Cross-section mechanical schematic of three slot reels dropping pachinko spheres through golden pegs onto a reciprocating hydraulic dozer shelf where coins count only past the front lip sensor."
secondaryMedia: null
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
  sourceUrl: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217/apps/game/scripts/bundle.ts#L5-L55"
sources:
  - label: "jackpotsyndicate README — 5-command build & conservative T-092 status table"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217/README.md"
  - label: "apps/game/scripts/bundle.ts — 3 MiB gzip bundle budget gate"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217/apps/game/scripts/bundle.ts"
  - label: "docs/ARCHITECTURE.md — slot-to-pachinko-to-pusher deterministic simulation"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217/docs/ARCHITECTURE.md"
  - label: "docs/CONTRACTS.md — acceptance criteria (AC-5 rake, AC-6 balance, AC-7 hitrate)"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217/docs/CONTRACTS.md"
  - label: "docs/ASSET_CREDITS.md — 67 locked imagegen derivatives & 4 placeholders"
    url: "https://github.com/mojomast/jackpotsyndicate/blob/b8cd1fe4694b1b3d3e56dabcc6201a935c4c5217/docs/ASSET_CREDITS.md"
---

If you build an autonomous software factory (`rizzstack`), sooner or later someone is going to ask what actually rolled off the assembly line. Enter **Jackpot Syndicate**: a browser-playable, zero-network, play-money arcade roguelite built with Rizzstack and Hermes where spinning slot reels drop orbs into a pachinko pinfield (`peg.golden`, `trinket.quantum-splitter-coil`), spawning coins onto a reciprocating hydraulic dozer shelf where **not a single cent enters your bankroll until a token physically tumbles over the front pusher lip**.

Every square inch of the repository bears the fingerprints of contract-driven factory execution. There are separate CLI harnesses for gutter-rake physics (`AC-5`), 3×3 reel hit rates (`AC-7`), greedy-synergy vs. random-buyer bot balance (`AC-6`), a `3 MiB` gzip bundle ceiling (`bundle.ts`), and a committed golden Victory replay verified across Chromium (`10/10`), Firefox (`10/10`), and WebKit (`1/1`). Best of all is the README's verification ledger for task `T-092`: instead of slapping green badges on everything, it dutifully notes that `COREPACK_HOME` needed a writable path inside the sandbox, Vite grumbled about a `>500 kB` chunk, **67 of 71** sprite keys are locked while **4** remain vector placeholders, and any suite not re-executed during the docs slice is marked **`NOT RUN`** in capital letters. That is what anti-slop receipts look like in the wild.
