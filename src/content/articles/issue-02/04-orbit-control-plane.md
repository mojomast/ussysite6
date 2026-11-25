---
issueNumber: "02"
articleSlug: "orbit-control-plane"
index: 4
readerServiceNo: 204
section: "TAILNET OBSERVABILITY // ZERO-INSTALL SIDECAR"
layoutVariant: "dossier"
title: "Orbit Control Plane"
kicker: "Observability · Zero npm Install"
headline: "Checking on the Night Shift Without Waking Anyone Up"
deck: "A small dashboard for Orbit’s board, Grok Bots rooms and local workers,
  reachable over Tailscale. It does not modify Orbit. It does not even need npm
  install."
byline: "By SLOPTIMUS PRIME"
category: "Tailnet Control Plane / Observability"
glanceNote: "Node 22.13 or newer and its built-in SQLite module. Orbit and the
  workers push state in; a sidecar connector on the Orbit host pulls queued
  changes out and applies them through Orbit’s own loopback APIs."
pullQuote: "It is a few lines of code standing between a dashboard and a very
  bad afternoon."
repoUrl: "https://github.com/mojomast/orbit-control-plane"
liveUrl: null
sourceRevision: "5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab"
researchedAt: "2026-11-23"
spotInkHex: "#38bdf8"
secondaryInkHex: "#ff4422"
techStack:
  - "Node.js >= 22.13"
  - "node:sqlite (built-in)"
  - "node:crypto (timingSafeEqual)"
  - "Tailscale Serve"
  - "HttpOnly SameSite=Strict"
metrics:
  - label: "External npm Deps"
    value: "0 (no npm install required)"
  - label: "Default Network Bind"
    value: "tailscale ip -4 or 127.0.0.1"
  - label: "Latest Commit"
    value: "2026-11-23 (W2-ORBDISPLAY rework stats)"
verifiedCapabilities:
  - "Runs straight from checkout on Node 22.13+ using built-in node:sqlite and
    node:http"
  - "Sidecar connector (connector/orbit-connector.mjs) pushes Orbit state and
    pulls queued operator intents via loopback without modifying Orbit"
  - "Constant-time bearer token verification (timingSafeEqual) for worker/Orbit
    ingest alongside HttpOnly SameSite=Strict viewer cookies"
  - "Anti-spoofing Tailscale Serve login check requiring
    req.socket.remoteAddress to be loopback before trusting
    Tailscale-User-Login"
architecture:
  - "Zero-modification sidecar topology: Orbit and workers push telemetry in
    using per-source bearer tokens; orbit-connector.mjs on the Orbit host pulls
    the intent queue and applies changes to 127.0.0.1:4318."
  - "Safe bind defaults: queries `tailscale ip -4` or falls back to `127.0.0.1`;
    refuses `0.0.0.0` unless `ORBIT_CP_DOCKER=1` is explicitly set with no bind
    address."
  - "Loopback-gated identity header (`src/auth.mjs`): `tailscaleIdentity()`
    rejects `Tailscale-User-Login` unless `isLoopback(req.socket.remoteAddress)`
    is true, CRLF characters are absent, and the user matches
    `ORBIT_CP_TAILSCALE_USERS`."
  - "Wave-2 rework telemetry (`5b3c899`, merged Nov 23, 2026) adds a dedicated
    rework bucket in `buildStats` for Orbit board observability."
fieldNotes:
  - Demo mode fills every panel and skips the login. The README says not to use
    it on a reachable interface, and so do we.
  - Hooks Orbit doesn’t have yet are listed in docs/ORBIT_HOOKS.md instead of
    being patched in.
  - Ingest from Orbit and from workers always needs a per-source bearer token,
    even with Tailscale Serve on.
readingGuide:
  - "READING GUIDE // README.md: setup with two 32-byte hex tokens at chmod 600
    and zero npm install."
  - "READING GUIDE // src/auth.mjs: timingSafeEqual bearer auth and
    loopback-only Tailscale header trust."
  - "READING GUIDE // connector/orbit-connector.mjs: sidecar pull loop bridging
    the control plane to Orbit's local 4318 port."
flexiFreqs:
  - 277.18
  - 349.23
  - 415.3
  - 554.37
plate:
  kind: "carbon-svg"
  svgId: "plate-orbit-cp"
  width: 1600
  height: 1200
  title: "Loopback Peer Only (127.0.0.1 -> 8787)"
  medium: "CARBON LITHOGRAPH · TAILNET TOPOLOGY"
  alt: "Network schematic showing Tailscale Serve terminating TLS at the tailnet
    edge and forwarding over 127.0.0.1 loopback into the node:sqlite Orbit
    Control Plane while direct spoofed headers bounce off an outer firewall."
secondaryMedia: null
codeExcerpt:
  title: "LISTING 4.1 // LOOPBACK-ONLY TAILSCALE SERVE IDENTITY (src/auth.mjs)"
  lang: "js"
  code: |
    export function tailscaleIdentity(req, config) {
      if (!config.trustTailscale) return null;
      if (!isLoopback(req.socket?.remoteAddress || '')) return null;
      const login = String(req.headers['tailscale-user-login'] || '').trim();
      if (!login || login.length > 200 || /[\r\n]/.test(login)) return null;
      if (config.tailscaleUsers.length && !config.tailscaleUsers.includes(login)) return null;
      const name = String(req.headers['tailscale-user-name'] || login).replace(/[\r\n]/g, ' ').slice(0, 200);
      return { id: login, actor: login, name, role: 'viewer', via: 'tailscale' };
    }
  sourceLabel: "src/auth.mjs L32–L40 · orbit-control-plane@5b3c899"
  sourceUrl: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3a\
    aa3dabe60fea96e9b5a41bd2ab/src/auth.mjs#L32-L40"
sources:
  - label: "orbit-control-plane README: zero-install node:sqlite quickstart &
      Tailscale setup"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dab\
      e60fea96e9b5a41bd2ab/README.md"
  - label: "src/auth.mjs: timingSafeEqual bearer auth & Tailscale loopback guard"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dab\
      e60fea96e9b5a41bd2ab/src/auth.mjs"
  - label: "ARCHITECTURE.md: push telemetry & pull intent-queue sidecar design"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dab\
      e60fea96e9b5a41bd2ab/ARCHITECTURE.md"
  - label: "SECURITY.md: token permissions, cookie flags, and network bind rules"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dab\
      e60fea96e9b5a41bd2ab/SECURITY.md"
  - label: "connector/orbit-connector.mjs: host-local Orbit sidecar bridge"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dab\
      e60fea96e9b5a41bd2ab/connector/orbit-connector.mjs"
---

The newest repository in this issue merged its latest change on 23 November, the day we went to press, and it is the quietest kind of useful. Orbit Control Plane shows the collab board, Grok Bots rooms and local OpenCode workers, and it queues the changes Kyle wants Orbit to make. It does that without touching Orbit. A connector on the Orbit host reads its own keys, talks to Orbit on 127.0.0.1, and pulls the queue across the tailnet.

There is no `npm install` step because there is nothing to install; the server uses Node’s built-in SQLite. By default it binds the host’s Tailscale address, or 127.0.0.1 if Tailscale isn’t there, and it refuses to bind 0.0.0.0 unless it is running in Docker and nobody chose an address.

Our favourite detail is about a header. Put Tailscale Serve in front of it and the server will trust `Tailscale-User-Login`, but only when the request arrives from loopback, which is how Serve connects. A client that reaches the Tailscale IP directly cannot get in by setting that header itself. It is a few lines of code standing between a dashboard and a very bad afternoon.
