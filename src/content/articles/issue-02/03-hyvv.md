---
issueNumber: "02"
articleSlug: "hyvv"
index: 3
readerServiceNo: 203
section: "SANDBOX HOST RUNTIME // VERSIONED /V1 CONTRACT"
layoutVariant: "dossier"
title: "hyvv"
kicker: "A Vocabulary, Not a Dependency on BundleBees"
headline: "One Host, Many Sealed Cells, Zero Leaked Provider Keys"
deck: "The worker-host layer of Rizzstack: loopback- or Tailscale-bound sandboxes speaking a versioned /v1 OpenAPI contract with first-read SHA-256 artifact pinning."
byline: "By SLOPTIMUS PRIME · Folio 05"
category: "Sandbox Host / API Contract"
glanceNote: "Launcher 0.1.15 implements the core attempt routes; main (bumped to 0.1.17) adds the /v1 reference artifact store, owner-only 0600 result files, and 171 unit + 93 contract tests."
pullQuote: "hyvv is a vocabulary, not a dependency: any coordinator that speaks /v1 can drive the hive while provider keys stay locked on the machine."
repoUrl: "https://github.com/mojomast/hyvv"
liveUrl: null
sourceRevision: "9691837b0ef3bd2d5c23f7d5b539c6c22d7c8ebb"
researchedAt: "2026-11-23"
spotInkHex: "#f5a623"
secondaryInkHex: "#3ddc97"
techStack:
  - "Python"
  - "OpenAPI 3 + JSON Schema"
  - "SHA-256 Capability Pins"
  - "POSIX 0600 / Windows ACL"
  - "Tailscale / Loopback HTTP"
metrics:
  - label: "Contract Surface"
    value: "/v1 additive semver · OpenAPI + JSON Schema"
  - label: "Verification Suite"
    value: "171 unit + 93 contract tests"
  - label: "Max Artifact Payload"
    value: "8 MiB · SHA-256 pinned on first read"
verifiedCapabilities:
  - "Generated machine-verified status matrix (python -m contract.v1.status) separating shipped launcher 0.1.15 routes from reference-only and specified endpoints"
  - "Two-part artifact authorization in contract/v1/reference.py: hashed coordinator bearer principal + per-attempt hyvvcap1_ capability compared in constant time"
  - "Project-state dispatch gate in reference store refusing parked/archived repos (409 project_parked) unless an attributed override + reason is supplied"
  - "Merged worker workspace provisioning & landing-event export refusing short SHAs, path traversal, dirty checkouts, and mismatched remotes"
architecture:
  - "Strict four-tier contract accounting (contract/v1/STATUS.json): Implemented in launcher 0.1.15, Implemented in /v1 reference only, Specified not implemented (/v1/leases), and Proposed (HMAC-signed briefs)."
  - "Model routing precedence (owner decision 2026-11-15): an explicitly named brief model always wins over priority:high; priority:high reroutes only unnamed-model briefs."
  - "First-read artifact pinning: ArtifactStore writes patches to owner-only files (POSIX 0600 / Windows owner ACL) and pins result_sha256 + body_sha256 so tampering triggers 409 artifact_changed."
  - "Optional Rails worker recorder and read-only replication API gated behind a separate credential from launcher control, disabled by default."
fieldNotes:
  - "Package version on main is 0.1.17 so deployed builds are distinguishable, while the latest tagged release remains 0.1.15."
  - "GET /v1/attempts/{attempt_id}/artifact and the project-parking gate live in contract/v1/reference.py today, not yet in the live 0.1.15 launcher."
  - "prefer_zoo (zoo:glm-5.3-flash) has been off by default since 2026-11-19 because its free pass refuses programmatic use."
readingGuide:
  - "READING GUIDE // README.md status table — auto-generated from contract/v1/STATUS.json so prose never outpaces code."
  - "READING GUIDE // contract/v1/reference.py — constant-time capability checks and 8 MiB hyvv.worker-artifact/1 store."
  - "READING GUIDE // contract/v1/openapi.yaml — additive-only /v1 contract specification."
flexiFreqs:
  - 246.94
  - 311.13
  - 369.99
  - 493.88
plate:
  kind: "carbon-svg"
  svgId: "plate-hyvv"
  width: 1600
  height: 1200
  title: "Hexagonal Pod /v1 (Mode 0600)"
  medium: "CARBON LITHOGRAPH · HOST ISOLATION CUTAWAY"
  alt: "Cutaway architectural drawing of a dark hexagonal host pod containing sealed worker cells, a vault keeping provider API keys on-host, and a constant-time hyvvcap1 capability lock."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 3.1 // COORDINATOR HASHING & FIRST-READ PINNING (contract/v1/reference.py)"
  lang: "python"
  code: |
    class ArtifactStore:
        """Coordinator-only artifact store with first-read pinning and safe files."""

        def __init__(self, root: Path | None = None, max_bytes: int | None = None, *,
                     principals: dict[str, str] | None = None, capability_ttl_s: float | None = None, clock=time.time,
                     project_roots: dict[str, Path | str] | None = None):
            self.root = Path(root or tempfile.mkdtemp(prefix="hyvv-artifact-"))
            self.results = self.root / "results"
            self.results.mkdir(parents=True, exist_ok=True)
            self.max_bytes = int(max_bytes or os.environ.get("HYVV_ARTIFACT_MAX_BYTES") or DEFAULT_MAX_BYTES)
            # Per-coordinator keys; only their hashes are kept.
            self._principal_hashes: dict[str, str] = {name: _sha256_hex(key) for name, key in (principals or {}).items()}
            self.pins: dict[str, dict[str, str]] = {}
  sourceLabel: "contract/v1/reference.py L96–L116 · hyvv@9691837"
  sourceUrl: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7c8ebb/contract/v1/reference.py#L96-L116"
sources:
  - label: "hyvv README — four-layer status matrix & routing precedence"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7c8ebb/README.md"
  - label: "contract/v1/reference.py — two-part auth & SHA-256 artifact pinning"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7c8ebb/contract/v1/reference.py"
  - label: "contract/v1/STATUS.json — machine-checked implementation ledger"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7c8ebb/contract/v1/STATUS.json"
  - label: "contract/v1/openapi.yaml — versioned /v1 worker-host specification"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7c8ebb/contract/v1/openapi.yaml"
---

Most multi-agent frameworks weld the planner, the prompt templates, and the container runner into one giant monorepo until updating a button breaks SSH on three machines. **hyvv** refuses the coupling on line two of its README: *"hyvv is a vocabulary, not a dependency on bundlebees."* It sits on a workstation or SSH host, owns the local sandboxes, keeps upstream LLM provider keys strictly on disk without ever echoing them back, and exposes a narrow bearer-protected HTTP API bound only to `127.0.0.1` or your Tailscale IPv4 address.

What makes `hyvv` worth studying is its compulsive honesty about contract maturity. An auto-generated status table (`python -m contract.v1.status`) partitions every route into four explicit buckets: what actually runs in `launcher-0.1.15` today, what is proven in the in-memory `/v1` reference (`contract/v1/reference.py`, complete with SHA-256 hashed coordinator keys, `hyvvcap1_` per-attempt capabilities, POSIX `0600` result files, and `409 project_parked` dispatch gates), what is merely specified (`/v1/leases`), and what is still a proposal. Even model routing carries dated owner precedent: if a brief explicitly names a model, that choice beats `priority: high` every time, because nobody wants an "intelligent router" quietly swapping engines mid-experiment.
