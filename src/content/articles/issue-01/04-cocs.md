---
issueNumber: "01"
articleSlug: "cocs"
index: 4
readerServiceNo: 104
section: "NETWORKED SIMULATION // 60HZ NETCODE"
layoutVariant: "dossier"
title: "CoCS // Colosseum of Competitive Slop"
kicker: "Local-First Browser Arena — Live at arena.ussyco.de"
headline: "An Arena Built Around a 60 Hz Heartbeat"
deck: "A browser shooter with server authority, client prediction and delta snapshots. Play online or host it on your LAN."
byline: "By SLOPTIMUS PRIME (github.com/mojomast) · SLOP ILLUSTRATED (Si.)"
category: "Multiplayer Game Server / Netcode"
glanceNote: "Nine parody operators and seven harnesses populate the roster. The pure-JavaScript simulation is shared by the client, server and tests, while Combined Arms can field up to sixteen bots."
pullQuote: "One simulation, a responsive client, and clear authority over the match."
repoUrl: "https://github.com/mojomast/cocs"
liveUrl: "https://arena.ussyco.de"
sourceRevision: "9a89e80012b387af71877b0ed5a0469e39f00a79"
researchedAt: "2026-10-13"
spotInkHex: "#e11d48"
secondaryInkHex: "#1d4ed8"
techStack: ["Three.js","Node.js 22","ws WebSocket (JSON)","Snapshot delta v2","HTML5 Canvas","Deterministic 60 Hz engine"]
metrics: [{"label":"Simulation Step","value":"60 Hz Fixed (16.67 ms)"},{"label":"Snapshot Transport","value":"JSON · delta v2 · 30 Hz"},{"label":"Operator Roster","value":"9 operators · 7 harnesses"}]
verifiedCapabilities: ["Live browser-playable 60 Hz multiplayer at arena.ussyco.de","Client prediction and reconciliation over a JSON WebSocket with entity interpolation","Nine operators, seven harnesses, ten weapons and five vehicle chassis","Self-hosted LAN game server with no accounts, cloud or inference service"]
architecture: ["Fixed-step 60 Hz authoritative simulation (server/game-server.mjs, tickDt = 1/60) with per-peer sequenced inputs and 30 Hz quantized snapshots.","Client prediction: a local shadow Match runs the player’s inputs immediately, then reconciles and replays pending inputs after each authoritative snapshot.","Snapshot-delta codec (protocol v2) over a plain-text JSON WebSocket with a full-snapshot fallback and millimetre quantization.","Remote actors, vehicles and projectiles are interpolated at an adaptive ~100 ms render delay; rooms support reconnect, a 20-second held seat, bot handoff, host migration and spectator seats."]
fieldNotes: ["Fixed 60 Hz authoritative tick (16.67 ms); snapshots broadcast at 30 Hz.","The client shadow predicts and reconciles — it does not rewind historical hitboxes.","Nine operators and seven harnesses; Combined Arms fields up to sixteen bots."]
readingGuide: ["Authoritative loop: server/game-server.mjs defaults tickDt to 1/60 and broadcasts snapshots at 30 Hz.","Wire format: plain JSON text over WebSocket — game/protocol.mjs wireSize measures UTF-8 JSON length.","Hit resolution: hitscan rays test 0.85 m × 0.85 m × 1.8 m axis-aligned actor boxes on the current tick (game/core.mjs actorHit).","No historical rewind buffer exists; the server reconciles predicted inputs to the latest snapshot instead."]
flexiFreqs: [349.23,440,523.25,659.25]
plate: {"kind":"blender-webp","src":"/assets/editorial/cocs/a-reasonable-amount-of-caution.webp","width":1600,"height":1200,"title":"A Reasonable Amount of Caution","medium":"BLENDER · EDITORIAL EXAGGERATION","alt":"An extravagantly armored peach-and-ivory ceramic Claude robot, wearing an inspection loupe, solemnly cradles a tiny gold-rimmed teacup in its enormous articulated hands. An editorial exaggeration of CoCS’s Safety Officer, not a gameplay capture."}
secondaryMedia: {"kind":"svg-study","studyId":"cocs","width":640,"height":360,"caption":"Interactive conceptual study: client prediction, server comparison, and authoritative reconciliation."}
codeExcerpt: {"title":"SOURCE EXCERPT // CLIENT RECONCILIATION REPLAY","lang":"js","code":"     const ack=Number.isInteger(msg.acks?.[this.actorId])?msg.acks[this.actorId]:null;\n     if(ack!==null){this.pendingInputs=this.pendingInputs.filter(item=>item.seq>ack);for(const item of this.pendingInputs)this.shadow.step(RULES.dt,{inputs:{[this.shadow.actors[0].id]:item.input}});}","sourceLabel":"game/net.mjs — client reconciliation replay","sourceUrl":"https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/net.mjs#L556-L557"}
sources: [{"label":"README — authoritative server, prediction, interpolation","url":"https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/README.md#L268-L280"},{"label":"server/game-server.mjs — 60 Hz tick defaults","url":"https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/server/game-server.mjs#L51"},{"label":"game/net.mjs — prediction and reconciliation","url":"https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/net.mjs#L530-L558"},{"label":"game/core.mjs — axis-aligned actor hit test","url":"https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/game/core.mjs#L329-L330"},{"label":"deploy/arena.ussyco.de.nginx — live deployment","url":"https://github.com/mojomast/cocs/blob/9a89e80012b387af71877b0ed5a0469e39f00a79/deploy/arena.ussyco.de.nginx#L1"}]
---

Colosseum of Competitive Slop shares one JavaScript simulation between client, server and tests. The client predicts your movement, then reconciles with the server’s 30 Hz snapshots. Remote actors are interpolated. Procedural assets and a self-hosted LAN mode keep the arena independent of accounts or an inference service.

CoCS manufactures the feel of a fair fight with a fixed 60 Hz authoritative tick. Your client runs a local shadow match so movement, aim and fire respond instantly, then replays every still-unacknowledged input once the next snapshot lands — reconciliation rather than a historical rewind buffer. Snapshots quantize actor transforms to the millimetre at 30 Hz and travel as plain JSON over a WebSocket, with a v2 delta codec and a full-snapshot fallback. Remote actors and projectiles render through interpolation at an adaptive delay of roughly 100 ms. Nine parody operators and seven harnesses populate the roster, and Combined Arms can field up to sixteen bots.
