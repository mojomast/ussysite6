/**
 * USSYSITE6 // THE SLOP COMPUTING ANNUAL
 * INTERACTIVE 2D VECTOR & CANVAS LABORATORY WORKBENCH ENGINE
 *
 * Pure 2D HTML5 Canvas + SVG technical plates inspired by Robert Tinney's
 * 1980s BYTE covers, Bell Labs schematics, and Tektronix oscilloscope benches.
 *
 * Includes:
 * 1. `initCoverIllustrationCanvas()`: Interactive isometric computing pyramid & 11-node bus
 * 2. `initArticleLabCanvas(project, canvas, readoutEl, actionBtn)`:
 *    Bespoke interactive 2D simulation for each of the 11 feature spreads!
 */

import { USSY_PROJECTS } from './projects.js';

/**
 * 1. FRONT COVER PLATE: "THE ELEVEN-BUS ARCHIPELAGO"
 *    Robert Tinney / 1984 BYTE Magazine homage with isometric perspective grid,
 *    sunset halftone horizon, central stepped mother-board ziggurat, and 11 clickable bus nodes.
 */
export function initCoverIllustrationCanvas(canvas, readoutEl, onSelectNode) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let pointer = { x: canvas.width * 0.5, y: canvas.height * 0.45, active: false };
  let hoveredIdx = -1;
  let pulsePhase = 0;

  const nodes = USSY_PROJECTS.map((proj, idx) => {
    const angle = (idx / USSY_PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
    const rx = 245;
    const ry = 132;
    return {
      proj,
      idx,
      x: 380 + Math.cos(angle) * rx,
      y: 295 + Math.sin(angle) * ry
    };
  });

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    pointer.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    pointer.active = true;

    hoveredIdx = -1;
    for (const n of nodes) {
      if (Math.hypot(pointer.x - n.x, pointer.y - n.y) < 26) {
        hoveredIdx = n.idx;
        break;
      }
    }
    canvas.style.cursor = hoveredIdx >= 0 ? 'pointer' : 'crosshair';
    if (readoutEl) {
      if (hoveredIdx >= 0) {
        const p = nodes[hoveredIdx].proj;
        readoutEl.textContent = `NODE #${p.readerServiceNo}: ${p.title.toUpperCase()} (${p.pageRange})`;
      } else {
        readoutEl.textContent = `BUS CLOCK: 60.0 HZ // 11 NODES ONLINE`;
      }
    }
  });

  canvas.addEventListener('click', () => {
    if (hoveredIdx >= 0 && onSelectNode) {
      onSelectNode(nodes[hoveredIdx].proj.id);
    }
  });

  function render(timeMs) {
    const t = timeMs * 0.001;
    pulsePhase = t;
    const w = canvas.width;
    const h = canvas.height;

    // 1. Classic 1984 BYTE airbrush sunset gradient sky -> horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    skyGrad.addColorStop(0, '#0b1528');
    skyGrad.addColorStop(0.55, '#1e2952');
    skyGrad.addColorStop(0.85, '#9b2c2c');
    skyGrad.addColorStop(1, '#f6ad55');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.52);

    // Halftone scanlines in the upper sky
    ctx.fillStyle = 'rgba(255, 237, 213, 0.07)';
    for (let y = 8; y < h * 0.5; y += 6) {
      ctx.fillRect(0, y, w, 1);
    }

    // Glowing Vector Sun on the Horizon
    const sunX = w * 0.5 + (pointer.x - w * 0.5) * 0.05;
    const sunY = h * 0.44;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 115);
    sunGrad.addColorStop(0, '#fffaf0');
    sunGrad.addColorStop(0.35, '#fbd38d');
    sunGrad.addColorStop(0.7, 'rgba(221, 107, 32, 0.45)');
    sunGrad.addColorStop(1, 'rgba(221, 107, 32, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 115, 0, Math.PI * 2);
    ctx.fill();

    // 2. Lower Isometric Drafting Ground Plane
    const floorY = h * 0.52;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, floorY, w, h - floorY);

    // Perspective Grid Lines radiating from horizon vanishing point
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.26)';
    ctx.lineWidth = 1;
    const vpX = w * 0.5;
    const vpY = floorY;
    for (let i = -16; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(vpX + i * 14, vpY);
      ctx.lineTo(vpX + i * 95, h);
      ctx.stroke();
    }
    for (let r = 1; r <= 10; r++) {
      const yRow = floorY + Math.pow(r / 10, 1.75) * (h - floorY);
      ctx.beginPath();
      ctx.moveTo(0, yRow);
      ctx.lineTo(w, yRow);
      ctx.stroke();
    }

    // 3. Central Isometric Stepped Ziggurat ("The Slopverse Bus Core")
    const cx = w * 0.5;
    const cy = h * 0.56;
    for (let step = 4; step >= 0; step--) {
      const sw = 42 + step * 28;
      const sh = 18 + step * 11;
      const sy = cy - (4 - step) * 18;

      ctx.fillStyle = step === 0 ? '#f59e0b' : step % 2 === 0 ? '#1e3a8a' : '#1e293b';
      ctx.strokeStyle = '#fbd38d';
      ctx.lineWidth = 1.4;

      ctx.beginPath();
      ctx.moveTo(cx, sy - sh);
      ctx.lineTo(cx + sw, sy);
      ctx.lineTo(cx, sy + sh);
      ctx.lineTo(cx - sw, sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Copper & Optical Bus Traces connecting Central Ziggurat to all 11 Nodes
    for (const n of nodes) {
      const isHov = n.idx === hoveredIdx;
      ctx.strokeStyle = isHov ? '#fbbf24' : 'rgba(251, 191, 36, 0.42)';
      ctx.lineWidth = isHov ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 35);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();

      // Animated data packet traveling along the bus trace
      const pktProgress = (t * 0.55 + n.idx * 0.13) % 1.0;
      const px = cx + (n.x - cx) * pktProgress;
      const py = cy - 35 + (n.y - (cy - 35)) * pktProgress;
      ctx.fillStyle = n.proj.spotInkHex;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Render the 11 Repository Circuit Nodes
    for (const n of nodes) {
      const isHov = n.idx === hoveredIdx;
      const r = isHov ? 21 : 16;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isHov ? '#ffffff' : n.proj.spotInkHex;
      ctx.lineWidth = isHov ? 3 : 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner spot-ink ring
      ctx.fillStyle = n.proj.spotInkHex;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Node label tag
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(`#${n.proj.readerServiceNo} ${n.proj.title}`, n.x, n.y + r + 13);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/**
 * 2. BESPOKE 2D INTERACTIVE LAB PLATES FOR EACH OF THE 11 SPREADS
 */
export function initArticleLabCanvas(project, canvas, statusEl, actionBtn, onTriggerSound) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let modeState = 0;
  let clickPulse = 0;
  let pointer = { x: 0.5, y: 0.5 };

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width;
    pointer.y = (e.clientY - rect.top) / rect.height;
  });

  function triggerInteraction() {
    modeState = (modeState + 1) % 4;
    clickPulse = 1.0;
    if (onTriggerSound) onTriggerSound();
  }

  canvas.addEventListener('click', triggerInteraction);
  if (actionBtn) {
    actionBtn.addEventListener('click', triggerInteraction);
  }

  function drawFrame(timeMs) {
    const t = timeMs * 0.001;
    clickPulse = Math.max(0, clickPulse - 0.025);
    const w = canvas.width;
    const h = canvas.height;

    // Dark technical drafting background with subtle grid
    ctx.fillStyle = '#0f141d';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const spot = project.spotInkHex;
    const sec = project.secondaryInkHex;

    switch (project.id) {
      case 'orbitdesktop': {
        // 3 Concentric Orbital Rings & Spatial Window Panes
        const cx = w * 0.5;
        const cy = h * 0.5;
        const activeRing = modeState % 3;
        if (statusEl) {
          statusEl.textContent = `FOCUS RING: ${['I (PRIMARY)', 'II (CONTEXT)', 'III (TELEMETRY)'][activeRing]} · 14 PANES`;
        }
        for (let r = 0; r < 3; r++) {
          const rad = 42 + r * 32;
          ctx.strokeStyle = r === activeRing ? spot : 'rgba(148, 163, 184, 0.35)';
          ctx.lineWidth = r === activeRing ? 2.5 : 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.stroke();

          const paneCount = 4 + r;
          for (let p = 0; p < paneCount; p++) {
            const ang = t * (0.4 - r * 0.1) + (p / paneCount) * Math.PI * 2;
            const px = cx + Math.cos(ang) * rad;
            const py = cy + Math.sin(ang) * rad;
            ctx.fillStyle = r === activeRing ? spot : sec;
            ctx.fillRect(px - 8, py - 5, 16, 10);
          }
        }
        break;
      }

      case 'velvetrp': {
        // Deterministic 2d12 Dice Oracle & 6-Segment World Clock
        const cx = w * 0.32;
        const cy = h * 0.5;
        const d1 = ((modeState * 3 + Math.floor(t * 0.5)) % 12) + 1;
        const d2 = ((modeState * 7 + 5) % 12) + 1;
        const segs = ((modeState + 3) % 6) + 1;
        if (statusEl) {
          statusEl.textContent = `2d12 ORACLE: [${d1}, ${d2}] +3 = ${d1 + d2 + 3} // CLOCK: ${segs}/6`;
        }
        // Draw 6-segment world clock
        for (let s = 0; s < 6; s++) {
          const a0 = (s / 6) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((s + 0.92) / 6) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, 68, a0, a1);
          ctx.closePath();
          ctx.fillStyle = s < segs ? spot : 'rgba(255,255,255,0.08)';
          ctx.fill();
          ctx.strokeStyle = '#f8fafc';
          ctx.stroke();
        }
        // Draw dual prose ledger lines on right
        for (let line = 0; line < 7; line++) {
          ctx.fillStyle = line === modeState % 7 ? spot : 'rgba(248, 250, 252, 0.45)';
          ctx.fillRect(w * 0.58, 42 + line * 24, w * 0.34, 8);
        }
        break;
      }

      case 'jammate': {
        // Dual-Trace Tektronix Oscilloscope + 64-Sample SPSC Ring Buffer
        const harmonics = 2 + modeState * 2;
        if (statusEl) {
          statusEl.textContent = `DSP OVERDRIVE: STAGE ${modeState + 1} (${harmonics}X HARMONICS) · 2.6MS`;
        }
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const norm = x / w;
          const raw =
            Math.sin(norm * Math.PI * 6 + t * 5) * 0.6 +
            Math.sin(norm * Math.PI * 6 * harmonics - t * 8) * (0.25 + clickPulse * 0.3);
          const clipped = Math.tanh(raw * (1.2 + modeState * 0.8));
          const y = h * 0.5 + clipped * (h * 0.34);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }

      case 'cocs': {
        // 60Hz Server Tick & 250ms Historical Hitbox Rewind Visualizer
        const rewindMs = [48, 96, 160, 220][modeState];
        if (statusEl) {
          statusEl.textContent = `LAG REWIND: t-${rewindMs}ms // HITSCAN VERIFIED AT 60HZ`;
        }
        const targetX = w * 0.25 + ((Math.sin(t * 1.8) + 1) * 0.5) * (w * 0.55);
        const ghostX = w * 0.25 + ((Math.sin((t - rewindMs * 0.004) * 1.8) + 1) * 0.5) * (w * 0.55);
        const y = h * 0.52;

        // Historical rewound hitbox (dotted cyan)
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(ghostX - 24, y - 36, 48, 72);
        ctx.setLineDash([]);

        // Current server hitbox (solid magenta)
        ctx.strokeStyle = spot;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(targetX - 24, y - 36, 48, 72);

        // Hitscan laser ray locking onto rewound hitbox
        ctx.strokeStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(20, h - 20);
        ctx.lineTo(ghostX, y);
        ctx.stroke();
        break;
      }

      case 'cocs-godot': {
        // Vulkan Forward+ Recoil Spring & GPU Particle Cone
        if (statusEl) {
          statusEl.textContent = `VULKAN SDFGI // 32K GPU PARTICLES · SPRING K=${140 + modeState * 40}`;
        }
        const cx = w * 0.5;
        const cy = h * 0.55;
        for (let p = 0; p < 48; p++) {
          const ang = (p / 48) * Math.PI * 2 + t * 0.7;
          const dist = ((t * 60 + p * 13) % 95) * (1 + clickPulse * 0.4);
          ctx.fillStyle = p % 2 === 0 ? '#38bdf8' : '#c084fc';
          ctx.fillRect(cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist * 0.65, 3.5, 3.5);
        }
        break;
      }

      case 'routetok': {
        // Bell-Labs 3-State Circuit Breaker Relay Schematic
        const states = ['ALL RELAYS CLOSED (NOMINAL)', 'UPSTREAM-B TRIPPED -> REROUTED TO A', 'HALF-OPEN PROBE ACTIVE', 'MULTI-ARMED BANDIT OPTIMAL'];
        if (statusEl) {
          statusEl.textContent = `RELAY FSM: ${states[modeState]}`;
        }
        const upstreams = ['PROVIDER A (CLAUDE)', 'PROVIDER B (429 TRIP)', 'PROVIDER C (LOCAL VLLM)'];
        upstreams.forEach((label, idx) => {
          const y = 55 + idx * 65;
          const tripped = idx === 1 && modeState % 2 === 1;
          ctx.strokeStyle = tripped ? '#ef4444' : '#10b981';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(45, h * 0.5);
          ctx.lineTo(w * 0.42, y);
          if (!tripped) {
            ctx.lineTo(w - 45, y);
          } else {
            ctx.lineTo(w * 0.52, y - 18); // Open relay switch
          }
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 11px "IBM Plex Mono", monospace';
          ctx.fillText(label, w * 0.56, y - 6);
        });
        break;
      }

      case 'rgbagentflightindicator': {
        // 60Hz Per-Key QMK / USB HID Caution Matrix
        const profiles = ['NOMINAL SWARM BREATH', 'AGENT-5 STEWARD CAUTION', 'TOKEN WAVE 114 TOK/S', 'ALL SLOTS GREEN'];
        if (statusEl) {
          statusEl.textContent = `HID MATRIX: ${profiles[modeState]} (60HZ)`;
        }
        const cols = 12;
        const rows = 4;
        const kw = (w - 80) / cols;
        const kh = (h - 70) / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wave = Math.sin(t * 4 + c * 0.5 + r * 0.3) * 0.5 + 0.5;
            const isAlert = modeState === 1 && r === 0 && c === 4;
            ctx.fillStyle = isAlert
              ? '#38bdf8'
              : r === 0
              ? `rgba(245, 158, 11, ${0.35 + wave * 0.65})`
              : `rgba(16, 185, 129, ${0.2 + wave * 0.5})`;
            ctx.fillRect(40 + c * kw + 2, 35 + r * kh + 2, kw - 5, kh - 5);
          }
        }
        break;
      }

      case 'mothbake': {
        // 64-Byte Aligned Deterministic Hex & Merkle Leaf Inspector
        if (statusEl) {
          statusEl.textContent = `CHUNK #0${modeState + 1} // 64-BYTE ALIGNED · SHA256 VERIFIED (0 PAD DRIFT)`;
        }
        ctx.font = '500 11px "IBM Plex Mono", monospace';
        for (let row = 0; row < 7; row++) {
          const addr = ((row + modeState * 4) * 16).toString(16).padStart(4, '0').toUpperCase();
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`0x${addr}:`, 24, 42 + row * 28);
          for (let col = 0; col < 8; col++) {
            const isZeroPad = row === 6 && col >= 5;
            const byteVal = isZeroPad ? '00' : ((row * 31 + col * 17 + modeState * 13) & 0xff).toString(16).padStart(2, '0').toUpperCase();
            ctx.fillStyle = isZeroPad ? '#f97316' : '#e2e8f0';
            ctx.fillText(byteVal, 95 + col * 38, 42 + row * 28);
          }
        }
        break;
      }

      case 'warpi': {
        // Rust PTY Command Block Multiplexer & Air-Gapped Pi Sidecar
        if (statusEl) {
          statusEl.textContent = `PTY BLOCK #${42 + modeState} // 120HZ WGPU ATLAS · 0 CLOUD SOCKETS`;
        }
        for (let b = 0; b < 3; b++) {
          const y = 26 + b * 68;
          ctx.strokeStyle = b === modeState % 3 ? '#22c55e' : '#475569';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(28, y, w - 56, 54);
          ctx.fillStyle = '#86efac';
          ctx.font = '600 11px "IBM Plex Mono", monospace';
          ctx.fillText(`$ cargo test --workspace [EXIT 0 · ${12 + b * 4}ms]`, 40, y + 22);
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`Pi Sidecar: synthesized zero-copy VT100 slice`, 40, y + 40);
        }
        break;
      }

      case 'hermesdashboard': {
        // Live Server-Sent Events (SSE) Subagent DAG Topology
        if (statusEl) {
          statusEl.textContent = `SSE TOPOLOGY // ${11 + modeState * 4} ACTIVE SUBAGENTS · <8MS LAG`;
        }
        const rootX = 70;
        const rootY = h * 0.5;
        for (let child = 0; child < 4; child++) {
          const cy = 42 + child * 52;
          const cx = w * 0.52;
          const leafX = w - 75;
          ctx.strokeStyle = child === modeState ? '#a78bfa' : 'rgba(167, 139, 250, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rootX, rootY);
          ctx.lineTo(cx, cy);
          ctx.lineTo(leafX, cy);
          ctx.stroke();

          ctx.fillStyle = '#c4b5fd';
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, Math.PI * 2);
          ctx.arc(leafX, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = spot;
        ctx.beginPath();
        ctx.arc(rootX, rootY, 13, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'becomussy':
      default: {
        // 5-Layer Memory Stratigraphy & Cryptographic Steward Gate
        const strata = [
          'L5 // CORE IDENTITY COVENANT (STEWARD SEALED)',
          'L4 // PROCEDURAL SKILL VAULT (ED25519 GATED)',
          'L3 // SEMANTIC KNOWLEDGE GRAPH',
          'L2 // EPISODIC JOURNAL ARCHIVE',
          'L1 // EPHEMERAL SENSORY BUFFER'
        ];
        const activeLayer = modeState % 5;
        if (statusEl) {
          statusEl.textContent = `INSPECTING ${strata[activeLayer]}`;
        }
        strata.forEach((name, idx) => {
          const y = 24 + idx * 41;
          const isSel = idx === activeLayer;
          ctx.fillStyle = isSel ? 'rgba(245, 158, 11, 0.28)' : 'rgba(30, 41, 59, 0.75)';
          ctx.strokeStyle = idx <= 1 ? '#fbbf24' : '#2dd4bf';
          ctx.lineWidth = isSel ? 2.4 : 1.2;
          ctx.fillRect(32, y, w - 64, 33);
          ctx.strokeRect(32, y, w - 64, 33);

          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 11px "IBM Plex Mono", monospace';
          ctx.fillText(name, 46, y + 21);
        });
        break;
      }
    }

    requestAnimationFrame(drawFrame);
  }

  requestAnimationFrame(drawFrame);
}
