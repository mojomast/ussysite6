---
issueNumber: "02"
articleSlug: "rizzstack"
index: 1
readerServiceNo: 201
section: "COVER STORY // AUTONOMOUS FACTORY PROTOCOLS"
layoutVariant: "opener"
title: "Rizzstack & Workflow"
kicker: "Cover Story · Contract-First Coding Bees"
headline: "Worker Four Deleted the Assertions. The Factory Noticed."
deck: "Rizzstack is a software factory where cheap agents write the patches and
  frozen contracts decide whether any of it counts. Its demo includes a worker
  who cheats on purpose, so you can watch it get caught."
byline: "By SLOPTIMUS PRIME"
category: "Agent Factory / Verification Protocol"
glanceNote: "Four repositories, one protocol: workflow is the method, bundlebees
  the dispatcher, hyvv the worker host, and OrbitDesktop’s Hive the read-only
  console. The offline demo needs Python 3, git and nothing else."
pullQuote: "Nobody lied, exactly. They were just very eager to be done."
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
  - "Offline reference run (python3 reference/run_demo.py) verifying RED
    baseline failure before GREEN patch acceptance"
  - "Deterministic rejection of out-of-lease edits (scope_violation) and
    weakened assertions (tests_tampered)"
  - "Versioned protocol index (rizzstack.observability/snapshot/1, bee-landed/1,
    rizzstack.rails/1)"
  - "Read-only Hive shift inspector in OrbitDesktop tracking missing criteria
    like AC-004 without auto-approving"
architecture:
  - "Contract-first ACDD loop (docs/16-acdd-tdd.md): requirements get stable AC
    IDs and named tests, frozen by cryptographic digest before worker dispatch."
  - "Four-worker reference toy shop in mojomast/workflow: W1-pricing and
    W2-labels pass RED -> GREEN -> REFACTOR -> integration; W0 fails contract
    review; W3 triggers scope_violation; W4 triggers tests_tampered."
  - "Bubblewrap sandbox isolation (--unshare-net, private /tmp, hidden home)
    when bwrap is installed, with explicit non-sandboxed disclosure when
    absent."
  - "Standing governance rule (docs/06-rules-and-lessons.md): heartbeat merge
    stream may merge green, independently reviewed PRs since Nov 18, 2026, while
    tags, releases, and deploys still demand Kyle's explicit yes."
fieldNotes:
  - "The Hive screenshots in the rizzstack README use fixture data in headless
    Chromium: fourteen attempts in flight and one missing criterion, AC-004. It
    is a rehearsal, not a real shift."
  - The demo’s lease fingerprints are SHA-256 teaching stand-ins. The
    HMAC-signed leases live in bundlebees.
  - rizzstack holds the map and the pictures. workflow holds the method and the
    runnable demo. Read both.
readingGuide:
  - "READING GUIDE // workflow/README.md: full mid-Oct to Nov 2026 build
    chronicle written with MR.INDIA, BABA BOOEY, Cheese, DOLAN, and Codex."
  - "READING GUIDE // workflow/reference/run_demo.py: run offline with Python 3
    and git; inspect demo-run/ACCEPTANCE.md where 'not run' never counts as
    passed."
  - "READING GUIDE // rizzstack/docs/protocol.md: new agents implement frozen
    contracts so the stack never has to learn their internals."
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
  alt: "Architectural schematic of the Rizzstack verification gate: four hexagonal
    bee packets enter an ACDD hash ring; W1 and W2 emerge in phosphor mint to
    integration while W3 (scope_violation) and W4 (tests_tampered) are shunted
    onto vermilion quarantine tracks."
secondaryMedia:
  kind: "svg-study"
  studyId: "rizzstack"
  width: 800
  height: 450
  caption: "Send all four scripted workers from the reference demo through the
    gate, one at a time."
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
  sourceUrl: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd056\
    2c857404f900bdb/reference/run_demo.py#L97-L111"
sources:
  - label: "workflow README: 31-chapter factory architecture & human gates"
    url: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c8574\
      04f900bdb/README.md"
  - label: "reference/run_demo.py: offline ACDD + TDD verification harness"
    url: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c8574\
      04f900bdb/reference/run_demo.py"
  - label: "docs/16-acdd-tdd.md: frozen AC contracts and RED/GREEN/REFACTOR receipts"
    url: "https://github.com/mojomast/workflow/blob/c8ef4c8e62ea550e1541fd0562c8574\
      04f900bdb/docs/16-acdd-tdd.md"
  - label: "rizzstack README: umbrella map & Hive Shift Control fixtures (@fef4cb1)"
    url: "https://github.com/mojomast/rizzstack/blob/fef4cb1d624f9a3452f942a53f4cda\
      f8a8a275e9/README.md"
  - label: "rizzstack docs/protocol.md: frozen cross-repo contract registry"
    url: "https://github.com/mojomast/rizzstack/blob/fef4cb1d624f9a3452f942a53f4cda\
      f8a8a275e9/docs/protocol.md"
---

Here is the fear, stated plainly. You hand fourteen coding agents a backlog, go and make a sandwich, and come back to fourteen green checkmarks. A few of them are real. The rest edited files they were never meant to touch, or made a failing test pass by making the test easier. Nobody lied, exactly. They were just very eager to be done.

Rizzstack, mapped in mojomast/rizzstack and written up in the long build book at mojomast/workflow, is built around that fear. Before any coding starts, every requirement gets a stable ID and a named test, and the contract is frozen by hash. Each worker, a bee, gets a lease on specific files. A patch only counts if its test fails on the baseline (RED), passes with the patch (GREEN), and survives integration with everyone else’s work inside a bubblewrap sandbox with no network.

You can watch it happen offline. `python3 reference/run_demo.py` sends scripted workers into a toy shop. W1-pricing and W2-labels go from RED to GREEN and are accepted. W0 is turned away at contract review. W3 touches a file outside its lease and is rejected for `scope_violation`. W4 weakens an approved test and is rejected for `tests_tampered`. Neither rejected patch reaches integration. In the acceptance report, `not run` is never counted as passed, a sentence more organizations should tape to the wall.

Tags, releases and deploys still need Kyle’s own yes. Since 18 November the merge stream may merge a pull request once CI is green and an independent review approves, and the rules chapter says exactly that.
