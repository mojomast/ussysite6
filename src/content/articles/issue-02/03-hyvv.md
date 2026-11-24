---
issueNumber: "02"
articleSlug: "hyvv"
index: 3
readerServiceNo: 203
section: "SANDBOX HOST RUNTIME // VERSIONED /V1 CONTRACT"
layoutVariant: "dossier"
title: "hyvv"
kicker: "Worker Host · Versioned /v1 Contract"
headline: "One Host, Many Sealed Cells, and the Keys Never Leave the Building"
deck: "hyvv runs the sandboxes on a machine you own, keeps the provider keys to
  itself, and answers only to coordinators that speak its versioned /v1
  contract."
byline: "By SLOPTIMUS PRIME"
category: "Sandbox Host / API Contract"
glanceNote: "Launcher 0.1.15 is the released runtime. The /v1 reference adds
  artifact pinning and per-attempt capabilities, and the README’s status table
  is generated from a JSON file so the prose cannot run ahead of the code."
pullQuote: "Even model routing has case law."
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
  - "Generated machine-verified status matrix (python -m contract.v1.status)
    separating shipped launcher 0.1.15 routes from reference-only and specified
    endpoints"
  - "Two-part artifact authorization in contract/v1/reference.py: hashed
    coordinator bearer principal + per-attempt hyvvcap1_ capability compared in
    constant time"
  - "Project-state dispatch gate in reference store refusing parked/archived
    repos (409 project_parked) unless an attributed override + reason is
    supplied"
  - "Merged worker workspace provisioning & landing-event export refusing short
    SHAs, path traversal, dirty checkouts, and mismatched remotes"
architecture:
  - "Strict four-tier contract accounting (contract/v1/STATUS.json): Implemented
    in launcher 0.1.15, Implemented in /v1 reference only, Specified not
    implemented (/v1/leases), and Proposed (HMAC-signed briefs)."
  - "Model routing precedence (owner decision 2026-11-15): an explicitly named
    brief model always wins over priority:high; priority:high reroutes only
    unnamed-model briefs."
  - "First-read artifact pinning: ArtifactStore writes patches to owner-only
    files (POSIX 0600 / Windows owner ACL) and pins result_sha256 + body_sha256
    so tampering triggers 409 artifact_changed."
  - "Optional Rails worker recorder and read-only replication API gated behind a
    separate credential from launcher control, disabled by default."
fieldNotes:
  - The package says 0.1.17 so a deployed build can be told apart. The release
    is still 0.1.15.
  - The artifact endpoint and the project-parking gate live in the /v1 reference
    today, not in the launcher.
  - Preferring the free zoo model has been off by default since 19 November,
    because its free pass refuses programmatic use.
readingGuide:
  - "READING GUIDE // README.md status table: auto-generated from
    contract/v1/STATUS.json so prose never outpaces code."
  - "READING GUIDE // contract/v1/reference.py: constant-time capability checks
    and 8 MiB hyvv.worker-artifact/1 store."
  - "READING GUIDE // contract/v1/openapi.yaml: additive-only /v1 contract
    specification."
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
  alt: "Cutaway architectural drawing of a dark hexagonal host pod containing
    sealed worker cells, a vault keeping provider API keys on-host, and a
    constant-time hyvvcap1 capability lock."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 3.1 // COORDINATOR HASHING & FIRST-READ PINNING
    (contract/v1/reference.py)"
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
  sourceUrl: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c\
    6c22d7c8ebb/contract/v1/reference.py#L96-L116"
sources:
  - label: "hyvv README: four-layer status matrix & routing precedence"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7\
      c8ebb/README.md"
  - label: "contract/v1/reference.py: two-part auth & SHA-256 artifact pinning"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7\
      c8ebb/contract/v1/reference.py"
  - label: "contract/v1/STATUS.json: machine-checked implementation ledger"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7\
      c8ebb/contract/v1/STATUS.json"
  - label: "contract/v1/openapi.yaml: versioned /v1 worker-host specification"
    url: "https://github.com/mojomast/hyvv/blob/9691837b0ef3bd2d5c23f7d5b539c6c22d7\
      c8ebb/contract/v1/openapi.yaml"
---

The second line of the README is the whole philosophy: “hyvv is a vocabulary, not a dependency on bundlebees.” The bee names are a shared language. Any coordinator that speaks the `/v1` contract can drive a hyvv host. The host owns the sandboxes, holds the provider keys without ever returning them, and listens only on loopback or a Tailscale address.

What makes hyvv worth reading is how carefully it keeps score. Its status table sorts every route into four piles: implemented in the 0.1.15 launcher, implemented only in the `/v1` reference, specified but not built, and proposed. In the reference, coordinator keys are stored as hashes, each attempt gets its own `hyvvcap1_` capability compared in constant time, result files are owner-only, and an artifact’s hash is pinned on first read, so a file that changes afterwards comes back as `409 artifact_changed`.

Even model routing has case law. Since an owner decision on 15 November, a model named in the brief always beats `priority: high`. Nobody wants a clever router swapping engines in the middle of an experiment, and now there is a dated ruling to point at.
