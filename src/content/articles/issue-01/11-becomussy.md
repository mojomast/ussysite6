---
issueNumber: "01"
articleSlug: "becomussy"
index: 11
readerServiceNo: 111
section: "SPECIAL MONOGRAPH // IDENTITY & MEMORY"
layoutVariant: "essay"
title: "Becomussy"
kicker: "Agent Memory · Governed Continuity"
headline: "How to Wake Up as the Same Agent"
deck: "Typed memories, a reflection journal and a versioned self-model, with one
  firm rule: the important changes to who the agent is must go past a human."
byline: "By SLOPTIMUS PRIME"
category: "Agent Identity / Memory Architecture"
glanceNote: "Memory, threads, reflection, a self-model and revision proposals
  are built. Search is keyword-based today. Vector search and drift detection
  are planned, and labelled as planned."
pullQuote: "An agent that starts in a fresh process is a stranger with your agent’s name."
repoUrl: "https://github.com/mojomast/becomussy"
liveUrl: null
sourceRevision: "7ac531e2f48ece3e5f2013eddf6d5fd8cde7af3f"
researchedAt: "2026-10-13"
spotInkHex: "#b45309"
secondaryInkHex: "#0f766e"
techStack:
  [
    "Python 3.12 / FastAPI",
    "PostgreSQL + pgvector",
    "SQLAlchemy + Alembic",
    "Redis",
    "Next.js",
    "Docker Compose"
  ]
metrics:
  [
    { "label": "Memory Kinds", "value": "5, typed + provenanced" },
    { "label": "Self-Model", "value": "Versioned, 4 facets" },
    { "label": "Identity Change", "value": "Risk-gated approval" }
  ]
verifiedCapabilities:
  [
    "Structured multi-layer memory with search, salience reinforcement, and
      contradiction recording",
    "Versioned self-model with section-by-section semantic diffing",
    "Risk-based governance: approve, reject, defer, policy checks, and
      emergency freeze",
    "Active threads, projects, and commitments with a session-start resume
      bundle",
    "Immutable audit events for all durable changes"
  ]
architecture:
  [
    "Modular monolith: one FastAPI application with service boundaries for
      memory, threads/projects, journal, self-model, revisions, governance,
      search, and audit.",
    "Multi-layer memory items (episodic, semantic, autobiographical, working,
      relational) with provenance, salience, reinforce, and contradict
      operations.",
    "Versioned self-model snapshots across four facets, descriptive,
      aspirational, constrained, relational, compared by a section-by-section
      semantic diff engine.",
    "Risk-classified revision proposals: high-risk identity changes require
      approval, low-risk thread/project targets may auto-approve, with policy
      checks and an emergency freeze.",
    "Immutable audit trail for every durable write, plus a context compiler
      that assembles a resume bundle at session start."
  ]
fieldNotes:
  [
    "Five typed memory kinds, each provenanced and searchable.",
    "High-risk identity changes require human approval; low-risk changes may
      auto-approve.",
    "MVP auth is header-based (X-User-Id / X-User-Role) and should be replaced
      with OAuth/JWT.",
    "Drift detection and vector/hybrid search are planned, not shipped; search
      is keyword-based today."
  ]
readingGuide:
  [
    "[reading guide] README, line 15: “Every durable update is auditable.
      High-risk identity changes require human approval.”",
    "[scope] FastAPI + PostgreSQL/pgvector + Next.js continuity MVP with a
      session-start resume bundle.",
    "[auth] Header-based MVP (X-User-Id / X-User-Role); the code says to
      replace it with real OAuth/JWT.",
    "[caveat] Drift detection and vector/hybrid search are planned, not
      implemented; background workers are future."
  ]
flexiFreqs: [ 261.63, 329.63, 392, 523.25 ]
plate:
  {
    "kind": "blender-webp",
    "src": "/assets/editorial/becomussy/bureau-of-becoming.webp",
    "width": 1600,
    "height": 1200,
    "title": "The Bureau of Becoming",
    "medium": "BLENDER · CONCEPTUAL STILL LIFE",
    "alt": "A serene porcelain portrait wears five tiny verdigris-and-bronze archive
      drawers as a crown. Fine bronze roots trace its long neck, while an
      absurdly long paper recollection loops through the air and falls into a
      small gilt-rimmed teacup. A conceptual Blender still life for Becomussy."
  }
secondaryMedia:
  {
    "kind": "svg-study",
    "studyId": "becomussy",
    "width": 640,
    "height": 360,
    "caption": "Five kinds of memory, and which changes need a person’s say-so."
  }
codeExcerpt:
  {
    "title": "SOURCE EXCERPT // RISK-CLASSIFIED REVISION GATE",
    "lang": "python",
    "code": "def _classify_risk(revision_type: str, target_entity_type: str) -> str:

      \    \"\"\"Determine risk class based on revision type and target entity.


      \    Rules from spec:

      \    - self_model + constrained/value keywords -> high

      \    - self_model + descriptive keywords -> medium

      \    - thread or project target -> low

      \    - Default: medium

      \    \"\"\"

      \    revision_lower = revision_type.lower()

      \    target_lower = target_entity_type.lower()


      \    if target_lower in (\"thread\", \"project\"):

      \        return \"low\"


      \    if target_lower == \"self_model\":

      \        # Check for high-risk keywords in the revision type

      \        if any(kw in revision_lower for kw in _HIGH_RISK_KEYWORDS):

      \            return \"high\"

      \        # Check for descriptive keywords

      \        if any(kw in revision_lower for kw in _DESCRIPTIVE_KEYWORDS):

      \            return \"medium\"


      \    # Default

      \    return \"medium\"",
    "sourceLabel": "backend/app/services/revisions/__init__.py L29–L53 · risk classification",
    "sourceUrl": "https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013\
      eddf6d5fd8cde7af3f/backend/app/services/revisions/__init__.py#L29-L53"
  }
sources:
  [
    {
        "label": "becomussy README: governed continuity overview and API",
        "url": "https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d\
          5fd8cde7af3f/README.md"
      },
    {
        "label": "backend/app/core/security.py: MVP header auth, no cryptography",
        "url": "https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d\
          5fd8cde7af3f/backend/app/core/security.py#L1-L46"
      },
    {
        "label": "backend/app/models/memory.py: five typed memory kinds",
        "url": "https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d\
          5fd8cde7af3f/backend/app/models/memory.py#L30-L40"
      },
    {
        "label": "backend/app/services/revisions/__init__.py: risk-based revision gate",
        "url": "https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d\
          5fd8cde7af3f/backend/app/services/revisions/__init__.py#L25-L63"
      },
    {
        "label": "ARCHITECTURE.md: spec-to-code map and deferred scope",
        "url": "https://github.com/mojomast/becomussy/blob/7ac531e2f48ece3e5f2013eddf6d\
          5fd8cde7af3f/ARCHITECTURE.md#L1-L40"
      }
  ]
---

An agent that starts in a fresh process is a stranger with your agent’s name. Becomussy is an attempt to carry something across. It stores durable memories of five kinds, episodic, semantic, autobiographical, working and relational, each with provenance and salience, and each able to be reinforced or contradicted. A context compiler builds a resume bundle at the start of every session, so the agent comes back knowing what it was in the middle of.

The part that matters most is the self-model. It is versioned across four facets, descriptive, aspirational, constrained and relational, and a semantic diff engine compares versions section by section. Proposed revisions are sorted by risk. A low-risk change to a thread or project can approve itself. A change to constraints or values needs a person, and there is an emergency freeze.

In the README’s words: “Every durable update is auditable. High-risk identity changes require human approval.” For an MVP, that is a grown-up idea of what an agent should not be allowed to do to itself. Authentication is header-based for now, and the code says plainly that it should be replaced.
