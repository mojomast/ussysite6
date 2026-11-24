---
issueNumber: "02"
articleSlug: "bundlebees"
index: 2
readerServiceNo: 202
section: "SWARM ORCHESTRATION // FILE-LEASED DISPATCH"
layoutVariant: "dossier"
title: "BundleBees"
kicker: "Four Tools, 585 Tokens, 1,284 Passing Tests"
headline: "Dispatch the Bees. Keep the Tokens and Git Push Out of Their Paws."
deck: "A Hermes plugin that slices work into file-leased briefs, dispatches disposable CUA sandboxes, and verifies patches locally without handing credentials to the model."
byline: "By SLOPTIMUS PRIME · Folio 04"
category: "Hermes Plugin / Worker Orchestration"
glanceNote: "v0.1.1 ships user-run verify; main carries an untagged autonomy layer with 1,284 passing deterministic tests, crash adoption, and rizzstack.return/1 manifests—all while fitting four tool schemas inside 585 o200k tokens."
pullQuote: "The coordinator dispatches and watches; a deterministic local sandbox checks the lease, runs RED-then-GREEN, scans with gitleaks, and never pushes."
repoUrl: "https://github.com/mojomast/bundlebees"
liveUrl: null
sourceRevision: "cb8946e4aff8c6144e6758ec595e075075c27f12"
researchedAt: "2026-11-23"
spotInkHex: "#3ddc97"
secondaryInkHex: "#f5a623"
techStack:
  - "Python 3.10+"
  - "Hermes >= 0.23.0"
  - "Cua Sandboxes"
  - "Git Worktrees"
  - "gitleaks"
  - "HMAC Leases"
metrics:
  - label: "Tool Schema Footprint"
    value: "4 tools · 585 o200k tokens (<900 cap)"
  - label: "Deterministic Suite"
    value: "1,284 tests passed in CI"
  - label: "Latest Tagged Release"
    value: "v0.1.1 (autonomy layer untagged on main)"
verifiedCapabilities:
  - "Four compact Hermes tools (bundlebees_status, bundlebees_dispatch, bundlebees_attempt, bundlebees_host_prompt) under a 585-token budget"
  - "Isolated worktree verification at pinned source_rev: lease enforcement, RED before / GREEN after, full suite, gitleaks, and local bb-verify/<attempt> commit"
  - "Crash adoption across process kills after dispatch, wave persistence, and publication"
  - "Bounded five-class failure recovery with sealed envelopes and automatic escalation on exhaustion"
architecture:
  - "Fail-closed contract gate (bundlebees_plugin/contract_gate.py): validates briefs against durable Hermes profile configuration before calling the launcher; refusals never invoke send()."
  - "Token-free model boundary: bundlebees_host_prompt emits a paste-ready operator setup prompt without ever accepting a private URL, host IP, or bearer token as a tool argument."
  - "Local-only verification pipeline: checks out an isolated git worktree at exact source_rev, verifies leased file boundaries, runs RED/GREEN + full suite + gitleaks, and commits locally without pushing."
  - "CI slop-lint ratchet (.github/workflows/slop-lint.yml, merged PR #248 on Nov 23, 2026) blocks new hygiene findings on every pull request."
fieldNotes:
  - "Honest split: v0.1.1 is the tagged release; the durable job store, queue, reconciler, and rizzstack.return/1 manifests are merged on main but untagged."
  - "The supervised Hermes decision adapter made identical recovery choices across three recorded runs, but those runs are outside GitHub Actions CI."
  - "job queue run --once has no background daemon or multi-wave load test yet, and hyvv provisioning has not yet been run on the live Windows host."
readingGuide:
  - "READING GUIDE // README.md §What works, what is experimental, what is blocked — separates deterministic CI guarantees from unshipped deployment pieces."
  - "READING GUIDE // bundlebees_plugin/contract_gate.py — dry-run CLI `python3 -m bundlebees_plugin.contract_gate check BRIEF.json`."
  - "READING GUIDE // .github/workflows/slop-lint.yml — PR #248 makes slop-lint blocking on new findings."
flexiFreqs:
  - 293.66
  - 369.99
  - 440.0
  - 587.33
plate:
  kind: "carbon-svg"
  svgId: "plate-bundlebees"
  width: 1600
  height: 1200
  title: "The 585-Token Apiary Gate"
  medium: "CARBON LITHOGRAPH · LEASED DISPATCH DIAGRAM"
  alt: "Technical diagram showing four compact Hermes tool sockets feeding a fail-closed contract gate that stamps file leases onto worker briefs before routing them into no-network bb-verify worktrees."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 2.1 // FAIL-CLOSED BRIEF GATE (bundlebees_plugin/contract_gate.py)"
  lang: "python"
  code: |
    def dispatch(
        brief: Mapping[str, Any],
        *,
        config: Mapping[str, Any],
        send: Callable[..., Any],
        packet: Any = None,
        evidence: Any = None,
        campaign: str | None = None,
        repository: str | None = None,
        **kwargs: Any,
    ) -> tuple[dict[str, Any], Any]:
        """Gate first, then send. A refusal never calls *send*."""
        block = gate(
            brief,
            config=config,
            packet=packet,
            evidence=evidence,
            campaign=campaign,
            repository=repository,
        )
        return block, send(brief, **kwargs)
  sourceLabel: "bundlebees_plugin/contract_gate.py L68–L93 · bundlebees@cb8946e"
  sourceUrl: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e075075c27f12/bundlebees_plugin/contract_gate.py#L68-L93"
sources:
  - label: "bundlebees README — v0.1.1 release vs. untagged main autonomy split"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e075075c27f12/README.md"
  - label: "bundlebees_plugin/contract_gate.py — fail-closed pre-dispatch gate"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e075075c27f12/bundlebees_plugin/contract_gate.py"
  - label: "CHANGELOG.md — release history and verification boundaries"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e075075c27f12/CHANGELOG.md"
  - label: ".github/workflows/ci.yml — 1,284-test deterministic CI pipeline"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e075075c27f12/.github/workflows/ci.yml"
---

Left to its own instincts, a coordinator LLM trying to run remote coding workers will invent an ad-hoc `curl` script, paste your bearer token into shell history, `git apply` a half-baked diff onto a dirty working tree, and cheerfully push broken code straight to `main`. **BundleBees** replaces that entire circus with four tightly budgeted Hermes tools (`bundlebees_status`, `bundlebees_dispatch`, `bundlebees_attempt`, and `bundlebees_host_prompt`) whose combined JSON schemas weigh in at exactly **585 `o200k` tokens**—well below its self-imposed 900-token ceiling.

The architecture treats orchestration as bookkeeping with teeth. Each bee gets a strict brief and an immutable file lease; the model never touches a host credential, never writes its own HTTP client, and never applies a patch. On `main` (pushed November 23, 2026 alongside PR #248's blocking `slop-lint` ratchet), a 1,284-test deterministic CI suite exercises the full lifecycle with zero live LLM calls: isolated Git worktrees at the exact `source_rev`, RED-before-GREEN checks, full test-suite integration, `gitleaks` scanning, crash adoption if the coordinator dies mid-wave, and a local `bb-verify/<attempt>` commit that still leaves pushing in human hands. And in classic *Si.* fashion, the README draws a bright chalk line between what runs in CI today and what remains experimental or undeployed on the live Windows box.
