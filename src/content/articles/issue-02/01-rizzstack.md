---
issueNumber: "02"
articleSlug: "rizzstack"
index: 1
readerServiceNo: 201
section: "COVER STORY // AUTONOMOUS FACTORY PROTOCOLS"
layoutVariant: "opener"
title: "Rizzstack & Workflow"
kicker: "Contract-First Coding Bees & The Cheating-Worker Trap"
headline: "A Software Factory Where Bees Write the Code—and Frozen Contracts Catch Them Cheating"
deck: "Split a feature into file-leased tasks, run RED-to-GREEN checks in bubblewrap, and automatically quarantine the worker that tries to pass by weakening the test."
byline: "By SLOPTIMUS PRIME · Cover Monograph"
category: "Agent Factory / Verification Protocol"
glanceNote: "Rizzstack is the umbrella protocol map across workflow, bundlebees, hyvv, and OrbitDesktop's Hive console. Its offline Python reference demo runs with zero API keys and catches scope_violation and tests_tampered red-handed."
pullQuote: "The unit of progress is an accepted artifact with signed RED-to-GREEN evidence—never a worker's polite claim that it finished."
repoUrl: "https://github.com/mojomast/workflow"
liveUrl: null
sourceRevision: "c8ef4c8e62ea550e1541fd0562c857404f900bdb"
researchedAt: "2026-11-23"
spotInkHex: "#ff4422"
secondaryInkHex: "#3ddc97"
techStack:
  - "Python 3 (stdlib demo)"
  - "ACDD / TDD Contracts"
  - "bubblewrap (bwrap)"
  - "HMAC Evidence Receipts"
  - "Git Worktrees"
  - "gitleaks + CI Gates"
metrics:
  - label: "Umbrella Layers"
    value: "4 (workflow · bundlebees · hyvv · Hive)"
  - label: "Reference Demo"
    value: "4 contracts · 10 evidence records · offline"
  - label: "Hard Human Gate"
    value: "Tags, releases & deploys require Kyle's yes"
verifiedCapabilities:
  - "Offline reference run (python3 reference/run_demo.py) verifying RED baseline failure before GREEN patch acceptance"
  - "Deterministic rejection of out-of-lease edits (scope_violation) and weakened assertions (tests_tampered)"
  - "Versioned protocol index (rizzstack.observability/snapshot/1, bee-landed/1, rizzstack.rails/1)"
  - "Read-only Hive shift inspector in OrbitDesktop tracking missing criteria like AC-004 without auto-approving"
architecture:
  - "Contract-first ACDD loop (docs/16-acdd-tdd.md): requirements get stable AC IDs and named tests, frozen by cryptographic digest before worker dispatch."
  - "Four-worker reference toy shop in mojomast/workflow: W1-pricing and W2-labels pass RED -> GREEN -> REFACTOR -> integration; W0 fails contract review; W3 triggers scope_violation; W4 triggers tests_tampered."
  - "Bubblewrap sandbox isolation (--unshare-net, private /tmp, hidden home) when bwrap is installed, with explicit non-sandboxed disclosure when absent."
  - "Standing governance rule (docs/06-rules-and-lessons.md): heartbeat merge stream may merge green, independently reviewed PRs since Nov 18, 2026, while tags, releases, and deploys still demand Kyle's explicit yes."
fieldNotes:
  - "mojomast/rizzstack (@fef4cb1) holds the umbrella protocol map and Hive screenshots; mojomast/workflow (@c8ef4c8) holds the 31-chapter build book and runnable reference/run_demo.py."
  - "Hive Shift Control screenshots in rizzstack use deterministic Chromium fixture data (14 attempts in flight, missing AC-004), not a live production workspace."
  - "Teaching demo lease fingerprints use SHA-256 stand-ins; HMAC-signed coordinator leases live in bundlebees."
readingGuide:
  - "READING GUIDE // workflow/README.md — full mid-Oct to Nov 2026 build chronicle written with MR.INDIA, BABA BOOEY, Cheese, DOLAN, and Codex."
  - "READING GUIDE // workflow/reference/run_demo.py — run offline with Python 3 and git; inspect demo-run/ACCEPTANCE.md where 'not run' never counts as passed."
  - "READING GUIDE // rizzstack/docs/protocol.md — new agents implement frozen contracts so the stack never has to learn their internals."
flexiFreqs:
  - 261.63
  - 329.63
  - 392.0
  - 523.25
plate:
  kind: "carbon-svg"
  svgId: "plate-rizzstack"
  width: 1600
  height: 1200
  title: "Quarantine Rail for Worker Four"
  medium: "CARBON LITHOGRAPH · VERIFICATION SCHEMATIC"
  alt: "Architectural schematic of the Rizzstack verification gate: four hexagonal bee packets enter an ACDD hash ring; W1 and W2 emerge in phosphor mint to integration while W3 (scope_violation) and W4 (tests_tampered) are shunted onto vermilion quarantine tracks."
secondaryMedia:
  kind: "svg-study"
  studyId: "rizzstack"
  width: 800
  height: 450
  caption: "Step through all four scripted reference workers (W1–W4) inside workflow/reference/run_demo.py."
codeExcerpt:
  title: "LISTING 1.1 // ACDD REFERENCE VERIFIER SUMMARY (reference/run_demo.py)"
  lang: "python"
  code: |
    def format_acdd_summary(result: dict) -> str:
        lines = [
            "Reference workflow demo (contract-first, test-first)",
            f"  source_rev:     {result['source_rev']}",
            f"  accepted:       {', '.join(result['accepted']) or '(none)'}",
            "  rejected at contract review:",
        ]
        lines += [f"    - {k}: {v}" for k, v in result["rejected_contracts"].items()]
        lines.append("  rejected at verification:")
        lines += [f"    - {k}: {v}" for k, v in result["rejected"].items()]
        lines.append("  evidence:")
        for cid, rep in result["reports"].items():
            phases = ", ".join(f"{p} {'not run' if s == 'unrun' else s}" for p, s in rep["phases"].items())
            lines.append(f"    - {cid}: {phases}; test-first {'yes' if rep['test_first'] else 'no'}; accepted {'yes' if rep['accepted'] else 'no'}")
  sourceLabel: "reference/run_demo.py L97–L111 · workflow@c8ef4c8"
  sourceUrl: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c857404f900bdb/reference/run_demo.py#L97-L111"
sources:
  - label: "workflow README — 31-chapter factory architecture & human gates"
    url: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c857404f900bdb/README.md"
  - label: "reference/run_demo.py — offline ACDD + TDD verification harness"
    url: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c857404f900bdb/reference/run_demo.py"
  - label: "docs/16-acdd-tdd.md — frozen AC contracts and RED/GREEN/REFACTOR receipts"
    url: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c857404f900bdb/docs/16-acdd-tdd.md"
  - label: "rizzstack README — umbrella map & Hive Shift Control fixtures (@fef4cb1)"
    url: "https://github.com/mojomast/rizzstack/blob/fef4cb1d624f9a3452f942a53f4cdaf8a8a275e9/README.md"
  - label: "rizzstack docs/protocol.md — frozen cross-repo contract registry"
    url: "https://github.com/mojomast/rizzstack/blob/fef4cb1d624f9a3452f942a53f4cdaf8a8a275e9/docs/protocol.md"
---

Anyone can spin up fourteen parallel coding agents in disposable sandboxes and watch them generate pull requests at terrifying speed. The hangover arrives twenty minutes later, when you discover that Worker Three quietly refactored your authentication middleware while fixing a receipt label, and Worker Four made a stubborn pricing test pass by deleting the `assert` line. **Rizzstack**—documented across [`mojomast/rizzstack`](https://github.com/mojomast/rizzstack) and the thirty-one-chapter [`mojomast/workflow`](https://github.com/mojomast/workflow) field manual—is SLOPTIMUS PRIME's answer: an autonomous software factory where cheap coding "bees" write the patches, but frozen contracts and deterministic sandboxes decide whether any of it counts.

Rather than asking you to trust a prose architecture diagram, `workflow` ships an offline miniature of the entire factory (`python3 reference/run_demo.py`) that needs only Python 3 and Git—no API keys, no model accounts, no network. Four scripted workers descend on a toy shop: `W1-pricing` and `W2-labels` fail on the baseline (**RED**), pass with their patches (**GREEN**), survive combined-tree integration inside a `bwrap` sandbox, and earn signed `tdd-evidence/1` receipts. `W0` gets bounced at contract review, `W3` is nabbed for `scope_violation` the instant it touches an unleased file, and `W4` is convicted of `tests_tampered` for weakening an approved test. Above the floor, OrbitDesktop's read-only **Hive** console inspects pending canary questions and highlights why a draft PR is still queued (`AC-004` lacks evidence)—while keeping tags, releases, and production deploys strictly behind a human *yes*.
