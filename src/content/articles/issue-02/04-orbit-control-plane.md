---
issueNumber: "02"
articleSlug: "orbit-control-plane"
index: 4
readerServiceNo: 204
section: "TAILNET OBSERVABILITY // ZERO-INSTALL SIDECAR"
layoutVariant: "dossier"
title: "Orbit Control Plane"
kicker: "Node 22 Built-In SQLite. Zero npm Install. Loopback-Verified Tailscale."
headline: "Supervise the Night Shift Over Tailscale Without Touching Orbit"
deck: "A zero-dependency control plane for Orbit boards, Grok Bot rooms, and OpenCode workers—using a pull-based sidecar connector and node:sqlite."
byline: "By SLOPTIMUS PRIME · Folio 06"
category: "Tailnet Control Plane / Observability"
glanceNote: "Requires Node.js 22.13+ and literally zero npm packages—no npm install step exists. Binds your Tailscale IPv4 or 127.0.0.1 by default and honors Tailscale-User-Login only from a loopback proxy."
pullQuote: "If a client hits the Tailscale IP directly instead of loopback, Tailscale-User-Login is ignored on sight."
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
  - "Runs straight from checkout on Node 22.13+ using built-in node:sqlite and node:http"
  - "Sidecar connector (connector/orbit-connector.mjs) pushes Orbit state and pulls queued operator intents via loopback without modifying Orbit"
  - "Constant-time bearer token verification (timingSafeEqual) for worker/Orbit ingest alongside HttpOnly SameSite=Strict viewer cookies"
  - "Anti-spoofing Tailscale Serve login check requiring req.socket.remoteAddress to be loopback before trusting Tailscale-User-Login"
architecture:
  - "Zero-modification sidecar topology: Orbit and workers push telemetry in using per-source bearer tokens; orbit-connector.mjs on the Orbit host pulls the intent queue and applies changes to 127.0.0.1:4318."
  - "Safe bind defaults: queries `tailscale ip -4` or falls back to `127.0.0.1`; refuses `0.0.0.0` unless `ORBIT_CP_DOCKER=1` is explicitly set with no bind address."
  - "Loopback-gated identity header (`src/auth.mjs`): `tailscaleIdentity()` rejects `Tailscale-User-Login` unless `isLoopback(req.socket.remoteAddress)` is true, CRLF characters are absent, and the user matches `ORBIT_CP_TAILSCALE_USERS`."
  - "Wave-2 rework telemetry (`5b3c899`, merged Nov 23, 2026) adds a dedicated rework bucket in `buildStats` for Orbit board observability."
fieldNotes:
  - "Demo mode (`npm run demo`) seeds all panels and bypasses authentication—explicitly documented as unsafe on any reachable interface."
  - "Hooks that Orbit itself does not yet expose are cataloged separately in docs/ORBIT_HOOKS.md rather than monkey-patched."
  - "Session cookies (`ocp=...`) default to 12-hour Max-Age with HttpOnly and SameSite=Strict."
readingGuide:
  - "READING GUIDE // README.md — setup with two 32-byte hex tokens at chmod 600 and zero npm install."
  - "READING GUIDE // src/auth.mjs — timingSafeEqual bearer auth and loopback-only Tailscale header trust."
  - "READING GUIDE // connector/orbit-connector.mjs — sidecar pull loop bridging the control plane to Orbit's local 4318 port."
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
  alt: "Network schematic showing Tailscale Serve terminating TLS at the tailnet edge and forwarding over 127.0.0.1 loopback into the node:sqlite Orbit Control Plane while direct spoofed headers bounce off an outer firewall."
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
  sourceUrl: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab/src/auth.mjs#L32-L40"
sources:
  - label: "orbit-control-plane README — zero-install node:sqlite quickstart & Tailscale setup"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab/README.md"
  - label: "src/auth.mjs — timingSafeEqual bearer auth & Tailscale loopback guard"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab/src/auth.mjs"
  - label: "ARCHITECTURE.md — push telemetry & pull intent-queue sidecar design"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab/ARCHITECTURE.md"
  - label: "SECURITY.md — token permissions, cookie flags, and network bind rules"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab/SECURITY.md"
  - label: "connector/orbit-connector.mjs — host-local Orbit sidecar bridge"
    url: "https://github.com/mojomast/orbit-control-plane/blob/5b3c89928b4f3aaa3dabe60fea96e9b5a41bd2ab/connector/orbit-connector.mjs"
---

Fresh off the press on November 23, 2026 (`5b3c899`), **Orbit Control Plane** solves a classic homelab headache: how do you check on your collab board, Grok Bot rooms, and OpenCode worker fleet from across your tailnet—and queue up adjustments—without exposing Orbit's local runtime or bloated `node_modules` trees to the wider world? You lean on Node.js 22.13's built-in `node:sqlite`, delete the `npm install` step from existence, and build a sidecar connector that pulls operator intents over Tailscale and applies them locally against `127.0.0.1:4318`.

The security details read like someone who has actually thought about header spoofing for five minutes instead of copying a reverse-proxy tutorial. By default the server binds your host's `tailscale ip -4` (or `127.0.0.1`), never `0.0.0.0`. And if you turn on `tailscale serve` identity headers (`Tailscale-User-Login`), `tailscaleIdentity()` checks `req.socket.remoteAddress` first: if the TCP peer isn't loopback, the header is thrown in the bin, CRLF-sanitized, and checked against an explicit user allowlist—while automated ingest from Orbit and workers still demands constant-time `timingSafeEqual` bearer tokens.
