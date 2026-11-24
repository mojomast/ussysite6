---
issueNumber: "02"
articleSlug: "bundlebees"
index: 2
readerServiceNo: 202
section: "SWARM ORCHESTRATION // FILE-LEASED DISPATCH"
layoutVariant: "dossier"
title: "BundleBees"
kicker: "Dispatch · Hermes Plugin"
headline: "Four Tools, 585 Tokens, and Nobody Gets the Car Keys"
deck: "BundleBees lets a Hermes agent send work to disposable coding sandboxes
  and watch it come back, without ever holding a token, writing its own HTTP
  client or applying a patch itself."
byline: "By SLOPTIMUS PRIME"
category: "Hermes Plugin / Worker Orchestration"
glanceNote: "The release is v0.1.1, with verification left to a CLI a human
  runs. The untagged autonomy layer on main, with durable jobs, queues and
  recovery, is covered by deterministic CI that never calls a model."
pullQuote: "A repository that lints itself for slop is a repository after this
  magazine’s heart."
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
  - "Four compact Hermes tools (bundlebees_status, bundlebees_dispatch,
    bundlebees_attempt, bundlebees_host_prompt) under a 585-token budget"
  - "Isolated worktree verification at pinned source_rev: lease enforcement, RED
    before / GREEN after, full suite, gitleaks, and local bb-verify/<attempt>
    commit"
  - "Crash adoption across process kills after dispatch, wave persistence, and
    publication"
  - "Bounded five-class failure recovery with sealed envelopes and automatic
    escalation on exhaustion"
architecture:
  - "Fail-closed contract gate (bundlebees_plugin/contract_gate.py): validates
    briefs against durable Hermes profile configuration before calling the
    launcher; refusals never invoke send()."
  - "Token-free model boundary: bundlebees_host_prompt emits a paste-ready
    operator setup prompt without ever accepting a private URL, host IP, or
    bearer token as a tool argument."
  - "Local-only verification pipeline: checks out an isolated git worktree at
    exact source_rev, verifies leased file boundaries, runs RED/GREEN + full
    suite + gitleaks, and commits locally without pushing."
  - "CI slop-lint ratchet (.github/workflows/slop-lint.yml, merged PR #248 on
    Nov 23, 2026) blocks new hygiene findings on every pull request."
fieldNotes:
  - Tagged and untagged are different things here. v0.1.1 is the release. The
    durable job store, queue, reconciler and RETURN manifests are merged on main
    but not tagged.
  - The supervised Hermes decision adapter made the same recovery decision in
    three recorded runs. Those runs happened outside CI.
  - There is no queue daemon or multi-wave load test yet, and hyvv provisioning
    has not run on the live Windows host.
readingGuide:
  - "READING GUIDE // README.md §What works, what is experimental, what is
    blocked: separates deterministic CI guarantees from unshipped deployment
    pieces."
  - "READING GUIDE // bundlebees_plugin/contract_gate.py: dry-run CLI `python3
    -m bundlebees_plugin.contract_gate check BRIEF.json`."
  - "READING GUIDE // .github/workflows/slop-lint.yml: PR #248 makes slop-lint
    blocking on new findings."
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
  alt: "Technical diagram showing four compact Hermes tool sockets feeding a
    fail-closed contract gate that stamps file leases onto worker briefs before
    routing them into no-network bb-verify worktrees."
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
  sourceUrl: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758e\
    c595e075075c27f12/bundlebees_plugin/contract_gate.py#L68-L93"
sources:
  - label: "bundlebees README: v0.1.1 release vs. untagged main autonomy split"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e0\
      75075c27f12/README.md"
  - label: "bundlebees_plugin/contract_gate.py: fail-closed pre-dispatch gate"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e0\
      75075c27f12/bundlebees_plugin/contract_gate.py"
  - label: "CHANGELOG.md: release history and verification boundaries"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e0\
      75075c27f12/CHANGELOG.md"
  - label: ".github/workflows/ci.yml: 1,284-test deterministic CI pipeline"
    url: "https://github.com/mojomast/bundlebees/blob/cb8946e4aff8c6144e6758ec595e0\
      75075c27f12/.github/workflows/ci.yml"
---

Left alone, an agent asked to manage other agents tends to improvise. It writes a curl script, pastes a bearer token into its shell history, applies a half-finished diff to a dirty tree and pushes to main with total confidence. BundleBees takes those choices off the table. The agent gets four tools, `bundlebees_status`, `bundlebees_dispatch`, `bundlebees_attempt` and `bundlebees_host_prompt`, and their combined schemas fit in 585 o200k tokens, against a self-imposed budget of 900.

The plugin counts progress as an accepted artifact with evidence, not as a worker saying it finished. A brief is strict. A lease is signed. Verification checks out an isolated worktree at the exact source revision, confirms the patch stayed inside its lease, runs RED then GREEN, runs the full suite, scans with gitleaks, and makes a local `bb-verify/<attempt>` commit. It does not push. The model dispatches and watches; you run verify and deploy yourself.

The README sorts its own features into what works, what is experimental and what is blocked, in that order, under headings. Its CI badge reports 1,284 passing tests. On 23 November, PR #248 made the project’s slop-lint blocking on new findings. A repository that lints itself for slop is a repository after this magazine’s heart.
