/**
 * USSYSITE6 // SLOP ILLUSTRATED (Si.)
 * INTERACTIVE 2D VECTOR & CANVAS LABORATORY WORKBENCH ENGINE
 *
 * Pure 2D HTML5 Canvas + SVG technical plates inspired by Robert Tinney's
 * 1980s BYTE covers, Bell Labs schematics, and Tektronix oscilloscope benches.
 *
 * Includes:
 * 1. `initCoverIllustrationCanvas()`: Interactive isometric computing pyramid & 11-node bus
 * 2. `initArticleLabCanvas(project, canvas, readoutEl, actionBtn)`:
 *    HiDPI interactive instruments for the five illustrated feature spreads.
 */

import { USSY_PROJECTS } from './projects.js';
import { getIssueEntry, formatFolio } from './issue-map.js';

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
        readoutEl.textContent = `${p.title.toUpperCase()} / FOLIO ${formatFolio(getIssueEntry(USSY_PROJECTS, p.id))}`;
      } else {
        readoutEl.textContent = 'ILLUSTRATED INDEX / SELECT A PROJECT';
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

const articleBenchCleanups = new WeakMap();

/**
 * 2. ARTICLE INSTRUMENTS
 * Draw in 540 × 240 plate coordinates; the backing store follows the display.
 * The return value is an optional teardown for clients that unmount a spread.
 */
export function initArticleLabCanvas(project, canvas, statusEl, actionBtn, onTriggerSound) {
  if (!canvas) return;
  articleBenchCleanups.get(canvas)?.();
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const renderer = articleInstruments[project.id];
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const stateCount = project.id === 'becomussy' ? 5 : 4;
  let modeState = 0;
  let clickPulse = 0;
  const pointer = { x: 0.5, y: 0.5, active: false };
  let visible = false;
  let destroyed = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 1.2;
  let lastStatus = '';

  canvas.setAttribute('role', 'button');
  canvas.setAttribute('tabindex', '0');
  if (statusEl) {
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.setAttribute('aria-atomic', 'true');
  }

  function report(message) {
    if (message === lastStatus) return;
    lastStatus = message;
    if (statusEl) statusEl.textContent = message;
    canvas.setAttribute('aria-label', `${project.title}. ${message}. Press Enter or Space to step the instrument.`);
  }

  function paint() {
    if (destroyed || !canvas.width || !canvas.height) return;
    ctx.setTransform(canvas.width / 540, 0, 0, canvas.height / 240, 0, 0);
    ctx.save();
    drawFrame(elapsed * 1000);
    ctx.restore();
  }

  function resize() {
    if (destroyed) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round((canvas.clientWidth || bounds.width) * ratio);
    const height = Math.round((canvas.clientHeight || bounds.height) * ratio);
    if (width !== canvas.width || height !== canvas.height) {
      canvas.width = width;
      canvas.height = height;
    }
    paint();
  }

  function animate(now) {
    frame = 0;
    if (destroyed || !visible || document.hidden || motionQuery.matches) return;
    if (!lastTime) lastTime = now;
    const delta = now - lastTime;
    // Slow instrument movement needs only 30fps; retain the display's full resolution.
    if (delta >= 1000 / 30) {
      elapsed += Math.min(delta, 100) / 1000;
      clickPulse = Math.max(0, clickPulse - delta / 700);
      lastTime = now;
      paint();
    }
    frame = requestAnimationFrame(animate);
  }

  function syncPlayback() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (destroyed || document.hidden || !visible) return;
    paint();
    if (!motionQuery.matches) frame = requestAnimationFrame(animate);
  }

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width;
    pointer.y = (e.clientY - rect.top) / rect.height;
    pointer.active = true;
    if (motionQuery.matches) paint();
  }, { signal: events.signal });
  canvas.addEventListener('pointerleave', () => {
    pointer.active = false;
    if (motionQuery.matches) paint();
  }, { signal: events.signal });

  function triggerInteraction() {
    modeState = (modeState + 1) % stateCount;
    clickPulse = motionQuery.matches ? 0 : 1;
    paint();
    if (onTriggerSound) onTriggerSound();
  }

  canvas.addEventListener('click', triggerInteraction, { signal: events.signal });
  canvas.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!event.repeat) triggerInteraction();
  }, { signal: events.signal });
  actionBtn?.addEventListener('click', triggerInteraction, { signal: events.signal });
  document.addEventListener('visibilitychange', syncPlayback, { signal: events.signal });
  window.addEventListener('resize', resize, { signal: events.signal });
  motionQuery.addEventListener('change', syncPlayback, { signal: events.signal });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0 });
  intersectionObserver.observe(canvas);
  document.fonts?.ready.then(() => { if (!destroyed) paint(); });

  function drawFrame(timeMs) {
    const t = timeMs * 0.001;
    const w = 540;
    const h = 240;

    if (renderer) {
      report(renderer(ctx, { mode: modeState, t, pulse: clickPulse, pointer }));
      return;
    }

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
          statusEl.textContent = `ORRERY STUDY · ${['MOVABLE WINDOWS', 'DOCKVIEW TILING', 'SPATIAL VIEW'][activeRing]}`;
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
        // Literary clock and dice props, not a simulation of product mechanics.
        const cx = w * 0.32;
        const cy = h * 0.5;
        const d1 = ((modeState * 3 + Math.floor(t * 0.5)) % 12) + 1;
        const d2 = ((modeState * 7 + 5) % 12) + 1;
        const segs = ((modeState + 3) % 6) + 1;
        if (statusEl) {
          statusEl.textContent = `LITERARY STUDY · DRAWN DICE ${d1}, ${d2} · CLOCK SEGMENT ${segs}`;
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
        // Illustrative waveform drawn on an oscilloscope-like grid.
        const harmonics = 2 + modeState * 2;
        if (statusEl) {
          statusEl.textContent = `ILLUSTRATIVE WAVEFORM / STATE ${modeState + 1}`;
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

      case 'cocs-godot': {
        // Conceptual recoil spring and particle cone.
        if (statusEl) {
          statusEl.textContent = `ILLUSTRATIVE SPRING / GL COMPATIBILITY CLIENT`;
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
        const states = ['ILLUSTRATIVE RELAYS / CLOSED', 'PRE-OUTPUT FALLBACK', 'HALF-OPEN PROBE', 'HEALTH-WEIGHTED ROUTING'];
        if (statusEl) {
          statusEl.textContent = `RELAY FSM: ${states[modeState]}`;
        }
        const upstreams = ['PROVIDER A', 'PROVIDER B', 'PROVIDER C'];
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

      case 'mothbake': {
        // Illustrative hexadecimal content study.
        if (statusEl) {
          statusEl.textContent = `CONTENT IDENTITY STUDY / STATE ${modeState + 1}`;
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

    }

  }

  resize();
  const cleanup = () => {
    destroyed = true;
    if (frame) cancelAnimationFrame(frame);
    events.abort();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    articleBenchCleanups.delete(canvas);
  };
  articleBenchCleanups.set(canvas, cleanup);
  return cleanup;
}

// A small, shared print vocabulary; each instrument has its own composition.
const ink = {
  paper: '#eee7d4', light: '#fff7e4', edge: '#b7b39f', muted: '#747968',
  dark: '#1e3334', black: '#112627', green: '#426e5c', mint: '#acd2ae',
  rust: '#b34d36', amber: '#c39750', blue: '#436878', purple: '#796782'
};
const TAU = Math.PI * 2;

function label(ctx, text, x, y, size = 9, color = ink.dark, align = 'left', face = 'mono') {
  ctx.font = face === 'serif'
    ? `${size}px Georgia, "Times New Roman", serif`
    : `500 ${size}px "IBM Plex Mono", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function rule(ctx, x1, y1, x2, y2, color = ink.edge, width = 0.7) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function shape(ctx, points, fill, stroke, width = 0.8) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function disc(ctx, x, y, r, fill, stroke, width = 0.8) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function round(ctx, x, y, w, h, radius, fill, stroke, width = 0.8) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function screw(ctx, x, y, dark = false) {
  disc(ctx, x, y, 2.4, dark ? '#4a5a52' : '#cec8b3', dark ? '#132727' : '#a8a591', 0.6);
  rule(ctx, x - 1.2, y + 1.1, x + 1.2, y - 1.1, dark ? '#172c29' : '#787d6a', 0.8);
}

function ticks(ctx, cx, cy, radius, count, color, start = -Math.PI / 2, sweep = TAU) {
  for (let i = 0; i < count; i++) {
    const a = start + i / (sweep === TAU ? count : count - 1) * sweep;
    const major = i % 5 === 0;
    rule(ctx, cx + Math.cos(a) * (radius - (major ? 6 : 3)), cy + Math.sin(a) * (radius - (major ? 6 : 3)),
      cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, color, major ? 1 : 0.5);
  }
}

function instrumentPlate(ctx, serial, title, note) {
  const paper = ctx.createLinearGradient(0, 0, 540, 240);
  paper.addColorStop(0, '#f4eddc');
  paper.addColorStop(0.6, ink.paper);
  paper.addColorStop(1, '#dedbc5');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, 540, 240);
  // Deterministic stipple, without random noise or a texture download.
  ctx.fillStyle = 'rgba(70, 66, 42, .065)';
  for (let i = 0; i < 420; i++) {
    const x = (i * 73.31) % 540;
    const y = (i * 37.73) % 240;
    ctx.fillRect(x, y, 0.65, 0.65);
  }
  round(ctx, 3, 3, 534, 234, 3, null, '#a7aa94', 0.7);
  [[9, 9], [531, 9], [9, 231], [531, 231]].forEach(([x, y]) => screw(ctx, x, y));
  label(ctx, `Si. STUDIES  /  ${serial}`, 20, 18, 7.5, ink.muted);
  label(ctx, title, 19, 39, 19, ink.dark, 'left', 'serif');
  label(ctx, 'ILLUSTRATIVE', 520, 19, 7.5, ink.muted, 'right');
  label(ctx, note, 520, 37, 8, ink.dark, 'right');
  rule(ctx, 19, 47, 521, 47, '#929b88');
  rule(ctx, 19, 215, 521, 215, '#929b88');
}

function instrumentFooter(ctx, left, right, mode, count = 4) {
  label(ctx, left, 21, 230, 8, ink.dark);
  label(ctx, right, 462, 230, 7.5, ink.muted, 'right');
  for (let i = 0; i < count; i++) {
    disc(ctx, 478 + i * 9, 226.5, 2.2, i === mode ? ink.rust : null, i === mode ? ink.rust : '#969c86');
  }
}

function drawRewindChronograph(ctx, { mode, t, pulse }) {
  const delay = [8, 20, 38, 55][mode];
  instrumentPlate(ctx, '04 / COCS', 'The reconciliation study', '60 Hz / 30 Hz SNAPSHOTS');

  // Recessed smoked-glass plotting chamber, with a calibrated range graticule.
  round(ctx, 20, 57, 325, 136, 9, '#758071', '#88927f');
  round(ctx, 23, 60, 319, 130, 7, ink.black, '#c1c7ad');
  const glass = ctx.createRadialGradient(185, 117, 10, 185, 117, 170);
  glass.addColorStop(0, '#244641');
  glass.addColorStop(1, '#12292b');
  round(ctx, 27, 64, 311, 122, 5, glass);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(27, 64, 311, 122, 5);
  ctx.clip();
  for (let x = 43; x < 337; x += 16) rule(ctx, x, 64, x, 186, '#33524a', 0.4);
  for (let y = 76; y < 186; y += 16) rule(ctx, 27, y, 338, y, '#33524a', 0.4);
  [26, 52, 78, 104].forEach((r) => disc(ctx, 95, 148, r, null, '#3d5c51', 0.55));
  for (let y = 65; y < 186; y += 3) rule(ctx, 28, y, 337, y, 'rgba(6, 20, 18, .13)', 0.5);

  const nowX = 252 + Math.sin(t * 0.7) * 22;
  const thenX = nowX - delay * 1.4;
  const y = 121;
  // Drawn poses contrast a predicted position with an authoritative snapshot.
  for (let i = 5; i > 0; i--) {
    ctx.globalAlpha = 0.1 + (5 - i) * 0.035;
    drawTarget(ctx, nowX - i * 19, y, ink.mint, false);
  }
  ctx.globalAlpha = 1;
  rule(ctx, 59, 168, thenX, y, ink.amber, 0.8);
  disc(ctx, 59, 168, 4, ink.amber);
  disc(ctx, 59, 168, 8, null, ink.amber, 0.5);
  drawTarget(ctx, nowX, y, '#b3d2b2', true);
  drawTarget(ctx, thenX, y, '#e4ab69', false);
  ctx.setLineDash([3, 3]);
  round(ctx, thenX - 13, y - 24, 26, 49, 2, null, '#e6b170', 0.8);
  ctx.setLineDash([]);
  // A four-corner reticle makes the predicted pose legible without animation.
  const r = 18 + pulse * 3;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    rule(ctx, thenX + sx * r, y + sy * 29, thenX + sx * (r - 5), y + sy * 29, ink.light, 1);
    rule(ctx, thenX + sx * r, y + sy * 29, thenX + sx * r, y + sy * 23, ink.light, 1);
  });
  rule(ctx, thenX, 84, nowX, 84, '#cad3ae');
  rule(ctx, thenX, 81, thenX, 87, '#cad3ae');
  rule(ctx, nowX, 81, nowX, 87, '#cad3ae');
  label(ctx, 'Δx', (thenX + nowX) / 2, 79, 8, ink.light, 'center');
  label(ctx, 'DRAWN POSES', 37, 78, 7.5, '#acc3a5');
  label(ctx, 'PREDICTED', thenX - 16, 177, 7, '#e4ab69', 'right');
  label(ctx, 'SERVER', nowX + 8, 177, 7, ink.mint, 'left');
  ctx.restore();

  // Brass dial shows an arbitrary drawing offset, not measured game telemetry.
  const cx = 433;
  const cy = 106;
  disc(ctx, cx, cy + 2, 47, '#a8a993');
  disc(ctx, cx, cy, 47, '#c7c8af', '#788471');
  disc(ctx, cx, cy, 43, '#f5eedb', '#fdf7e8');
  ticks(ctx, cx, cy, 38, 51, '#647560', Math.PI * 0.75, Math.PI * 1.5);
  const a = Math.PI * 0.75 + delay / 60 * Math.PI * 1.5;
  shape(ctx, [[cx + Math.cos(a) * 32, cy + Math.sin(a) * 32], [cx + Math.sin(a) * 3, cy - Math.cos(a) * 3],
    [cx - Math.cos(a) * 9, cy - Math.sin(a) * 9], [cx - Math.sin(a) * 3, cy + Math.cos(a) * 3]], ink.rust);
  disc(ctx, cx, cy, 4, ink.dark);
  disc(ctx, cx, cy, 1.3, ink.light);
  label(ctx, '30', cx, 88, 7, ink.muted, 'center');
  label(ctx, '0', cx - 20, 131, 7, ink.muted, 'center');
  label(ctx, '60', cx + 20, 131, 7, ink.muted, 'center');
  label(ctx, `${delay}`, cx - 2, 180, 32, ink.dark, 'center', 'serif');
  label(ctx, 'u', cx + 33, 179, 10, ink.muted);
  label(ctx, 'DRAWING OFFSET', cx, 196, 8, ink.muted, 'center');

  for (let i = 0; i <= 30; i++) rule(ctx, 30 + i * 10, 199, 30 + i * 10, i % 5 === 0 ? 207 : 203, '#7c8875', 0.6);
  const cursorX = 330 - delay / 60 * 300;
  shape(ctx, [[cursorX - 3, 209], [cursorX + 3, 209], [cursorX, 204]], ink.rust);
  instrumentFooter(ctx, 'PREDICT → SNAPSHOT → RECONCILE', 'VARY DRAWN OFFSET', mode);
  return `ILLUSTRATED POSITIONS · offset ${delay} drawing units · client prediction / server authority`;
}

function drawTarget(ctx, x, y, color, solid) {
  disc(ctx, x, y - 15, 4, solid ? color : null, color, 1);
  shape(ctx, [[x - 6, y - 8], [x + 6, y - 8], [x + 9, y + 6], [x + 4, y + 8],
    [x + 5, y + 20], [x + 1, y + 20], [x, y + 8], [x - 2, y + 20],
    [x - 6, y + 20], [x - 4, y + 6], [x - 9, y + 4]], solid ? color : null, color, 0.8);
}

function drawFlightDeck(ctx, { mode, t, pointer }) {
  const profiles = ['WORKING', 'ATTENTION', 'DONE', 'IDLE'];
  const lights = ['#9bbf9b', '#e47e70', '#f3f0df', '#53615a'];
  instrumentPlate(ctx, '07 / RGB', 'A flight deck at your fingertips', 'LOCAL HTTP / LIGHTS');

  // Cast-metal keyboard chassis, rolled front edge, and sculpted individual caps.
  round(ctx, 20, 63, 366, 135, 9, '#888c7c', '#8a9180');
  round(ctx, 20, 58, 366, 135, 9, '#2c3d3b', '#6c7d6c');
  round(ctx, 25, 63, 356, 124, 5, '#1c302e', '#132927');
  rule(ctx, 33, 191, 374, 191, '#bac0a4', 0.65);
  [30, 376].forEach((x) => [68, 182].forEach((y) => screw(ctx, x, y, true)));

  const cap = (x, y, width, legend, color = null, hover = false) => {
    round(ctx, x, y + 2, width, 19, 2.8, '#0c2223', '#132727', 0.7);
    const material = ctx.createLinearGradient(x, y, x, y + 17);
    material.addColorStop(0, color ? '#506053' : '#50605a');
    material.addColorStop(1, color ? '#31453d' : '#354740');
    round(ctx, x, y, width, 18, 2.8, material, hover ? ink.light : '#667469', hover ? 1 : 0.5);
    round(ctx, x + 2, y + 2, width - 4, 12, 2, color ? '#273d36' : '#3e5047', '#687567', 0.35);
    if (color) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      round(ctx, x + 5, y + 15.3, Math.max(4, width - 10), 1.6, 0.8, color);
      ctx.restore();
    }
    label(ctx, legend, x + width / 2, y + 10.7, legend.length > 3 ? 5.5 : 7, color || '#c2c8b0', 'center');
  };

  const px = pointer.x * 540;
  const py = pointer.y * 240;
  for (let i = 0; i < 12; i++) {
    const x = 35 + i * 28;
    const isHold = mode === 1 && i === 4;
    const color = isHold ? (Math.sin(t * 4) > 0 ? lights[1] : '#93695f')
      : mode === 1 ? lights[0] : mode === 3 ? null : lights[mode];
    cap(x, 72, 23, `${String(i + 1).padStart(2, '0')}`, color,
      pointer.active && px >= x && px <= x + 23 && py >= 72 && py <= 93);
    if (isHold) {
      round(ctx, x - 2, 69, 27, 25, 3, null, lights[1], 1.1);
      shape(ctx, [[x + 9, 65], [x + 15, 65], [x + 12, 69]], lights[1]);
    }
  }
  const rows = [
    [['TAB', 31], ...'QWERTYUIOP'.split('').map((k) => [k, 23]), ['↵', 37]],
    [['CTRL', 37], ...'ASDFGHJKL'.split('').map((k) => [k, 23]), [';', 23], ['↵', 31]],
    [['SHIFT', 48], ...'ZXCVBNM'.split('').map((k) => [k, 23]), [',', 23], ['.', 23], ['SHIFT', 46]],
    [['CTL', 31], ['ALT', 31], ['LOCAL / AGENT BUS', 172], ['FN', 31], ['←', 23], ['→', 23]]
  ];
  rows.forEach((row, r) => {
    let x = 35;
    row.forEach(([legend, width], c) => {
      const y = 99 + r * 21;
        cap(x, y, width, legend, null,
        pointer.active && px >= x && px <= x + width && py >= y && py <= y + 18);
      x += width + 3;
    });
  });

  rule(ctx, 400, 58, 400, 205, '#a9ad95');
  label(ctx, 'ANNUNCIATOR', 417, 69, 8, ink.muted);
  disc(ctx, 422, 87, 3.5, lights[mode], '#5e715e');
  label(ctx, ['GREEN', 'BLINK RED', 'WHITE', 'DARK'][mode], 433, 90, 8.2);
  label(ctx, mode === 1 ? '05' : '12', 416, 127, 33, mode === 1 ? ink.rust : ink.dark, 'left', 'serif');
  label(ctx, mode === 1 ? 'AGENT SLOT' : 'AGENT SLOTS', 417, 140, 7.5, ink.muted);
  for (let i = 0; i < 12; i++) {
    const active = mode === 1 ? i === 4 : true;
    round(ctx, 418 + (i % 6) * 15, 153 + Math.floor(i / 6) * 12, 10, 6, 1,
      active ? (mode === 1 ? ink.rust : ink.green) : '#c2c5ae');
  }
  label(ctx, profiles[mode], 417, 189, 8.5, mode === 1 ? ink.rust : ink.dark);
  label(ctx, 'PALETTE STUDY', 417, 202, 7, ink.muted);
  label(ctx, '01—12  AGENT SLOTS', 35, 207, 7.5, ink.muted);
  label(ctx, 'DEVICE-MAPPED LANES', 377, 207, 7.5, ink.muted, 'right');
  instrumentFooter(ctx, 'STATE → LANE → DEVICE LIGHT', 'EXPLORE DEFAULT PALETTE', mode);
  return `PALETTE STUDY · ${profiles[mode]} · ${mode === 1 ? 'example lane 05 needs attention' : '12 example lanes'} · illustrated hardware`;
}

function drawLocalTerminal(ctx, { mode, t }) {
  const commands = ['1. Choose a provider', '2. Resolve credentials', '3. Start the Pi helper', '4. Send a model request'];
  const outputs = [
    ['Configure an API endpoint', 'Select a model', 'Use your provider credentials', 'Warp account not required'],
    ['Settings keep a reference', 'OS store holds the secret', 'Resolve it for the helper', 'Bring your own key'],
    ['Supervised agent process', 'Messages travel over stdio', 'No helper listening port', 'Per-conversation backend'],
    ['OpenAI-compatible API', 'Send to the chosen endpoint', 'Network access is required', 'This drawing is not a run log']
  ];
  instrumentPlate(ctx, '09 / WARPI', 'Your agent. Your provider.', 'PI / BYOK');

  // An ivory CRT case with rounded glass, moulded bezel, and a run-index tape.
  round(ctx, 22, 58, 330, 150, 11, '#b7bca4', '#89977d');
  round(ctx, 23, 55, 328, 149, 10, '#d9d9c0', '#a7ae97');
  round(ctx, 31, 63, 294, 127, 8, '#64745e', '#eeead5', 1);
  const screen = ctx.createRadialGradient(158, 106, 6, 166, 126, 180);
  screen.addColorStop(0, '#254333');
  screen.addColorStop(1, '#10271f');
  round(ctx, 35, 67, 286, 119, 6, screen, '#142c25');
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(35, 67, 286, 119, 6);
  ctx.clip();
  for (let y = 69; y < 186; y += 3) rule(ctx, 35, y, 321, y, 'rgba(159, 194, 142, .045)', 0.5);
  label(ctx, `WARPI / AGENT FLOW               ${mode + 1}/4`, 45, 80, 7.5, '#a0b897');
  rule(ctx, 45, 86, 310, 86, '#476348', 0.5);
  label(ctx, '>', 45, 103, 10, '#d0d9ab');
  label(ctx, commands[mode], 59, 103, 10, '#d0d9ab');
  outputs[mode].forEach((text, i) => label(ctx, text, 47, 121 + i * 14, 8.5, i === 3 ? '#c0d5a3' : '#91b58d'));
  const cursorAlpha = 0.6 + Math.sin(t * 2) * 0.18;
  ctx.fillStyle = `rgba(182, 211, 149, ${cursorAlpha})`;
  ctx.fillRect(46, 173, 6, 7);
  // The glass reflection is faint enough to preserve phosphor contrast.
  const reflection = ctx.createLinearGradient(40, 67, 175, 186);
  reflection.addColorStop(0, 'rgba(244, 242, 213, .07)');
  reflection.addColorStop(1, 'rgba(244, 242, 213, 0)');
  shape(ctx, [[35, 67], [215, 67], [90, 186], [35, 186]], reflection);
  ctx.restore();
  for (let i = 0; i < 13; i++) rule(ctx, 334, 74 + i * 6, 341, 74 + i * 6, '#8b9b7d', 1.1);
  disc(ctx, 338, 171, 4.5, '#6c8a60', '#819675');
  disc(ctx, 338, 171, 1.8, '#c6d7a5');
  label(ctx, 'W A R P I', 40, 199, 7.3, '#5e7458');
  label(ctx, 'WARP UI: UPSTREAM', 315, 199, 7, '#5e7458', 'right');

  // Conceptual circuitry for the Pi software helper, not a Raspberry Pi product.
  label(ctx, 'PI AGENT SOFTWARE', 373, 65, 8, ink.muted);
  ctx.beginPath();
  ctx.moveTo(351, 154);
  ctx.bezierCurveTo(374, 154, 357, 183, 391, 183);
  ctx.bezierCurveTo(412, 183, 413, 165, 413, 155);
  ctx.strokeStyle = '#6b7963'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = '#c2c4a5'; ctx.lineWidth = 1.1; ctx.stroke();
  round(ctx, 378, 78, 127, 90, 6, '#b3b69c', '#839177');
  round(ctx, 378, 74, 127, 90, 6, '#345b49', '#657a59');
  [[385, 81], [498, 81], [385, 157], [498, 157]].forEach(([x, y]) => {
    disc(ctx, x, y, 2.7, '#c9c9a3', '#97a77f');
    disc(ctx, x, y, 1.1, '#314e3c');
  });
  for (let i = 0; i < 6; i++) {
    const y = 94 + i * 8;
    const x = 390 + i * 4;
    ctx.beginPath();
    ctx.moveTo(421, y);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x, 149);
    ctx.strokeStyle = '#9caa72'; ctx.lineWidth = 0.6; ctx.stroke();
    disc(ctx, x, 149, 1.4, '#b8be7f');
    rule(ctx, 452, 96 + i * 7, 486, 96 + i * 7, '#95a06a', 0.65);
  }
  for (let i = 0; i < 8; i++) {
    rule(ctx, 418, 98 + i * 5, 426, 98 + i * 5, '#d2c697', 2);
    rule(ctx, 454, 98 + i * 5, 462, 98 + i * 5, '#d2c697', 2);
  }
  round(ctx, 424, 91, 32, 48, 2, '#20382f', '#758061');
  label(ctx, 'π', 440, 118, 25, '#c6cd9c', 'center', 'serif');
  label(ctx, 'BYOK', 440, 131, 5.5, '#9cab7a', 'center');
  round(ctx, 481, 107, 28, 23, 2, '#bcbda4', '#6f7e67');
  round(ctx, 488, 112, 19, 13, 1, '#354d3c', '#ddd7b3');
  for (let i = 0; i < 8; i++) round(ctx, 413 + i * 7, 151, 3, 6, 0.5, '#c1b36e');
  disc(ctx, 475, 88, 2, mode === 3 ? '#dfc574' : '#73966f');
  label(ctx, mode === 3 ? 'CONFIGURED ENDPOINT' : 'STDIO / PI HELPER', 442, 194, 7.8, ink.green, 'center');
  label(ctx, 'WARP UI → PI → API', 442, 207, 8, ink.muted, 'center');
  instrumentFooter(ctx, 'WARPI: THE AGENT INTEGRATION', 'EXPLORE REQUEST FLOW', mode);
  return `ILLUSTRATED FLOW · ${commands[mode]} · Pi software helper / BYOK`;
}

function drawAgentSwitchboard(ctx, { mode, t }) {
  const phases = ['FILES', 'TOOLS', 'MODELS', 'OVERVIEW'];
  instrumentPlate(ctx, '10 / HERMES', 'A map of the session', 'RESOURCE GRAPH');

  // Numbered ports and curved copper traces borrow from telephone exchange plates.
  const branches = [
    { y: 81, name: 'FILES', ports: [68, 92], color: ink.blue },
    { y: 131, name: 'TOOLS', ports: [118, 142], color: ink.green },
    { y: 181, name: 'MODELS', ports: [168, 192], color: ink.rust }
  ];
  rule(ctx, 390, 59, 390, 207, '#b2b8a0');
  label(ctx, 'SESSION', 65, 69, 7.5, ink.muted, 'center');
  disc(ctx, 65, 132, 38, '#dfdfc5', '#a7af96');
  ticks(ctx, 65, 132, 35, 40, '#87977d');
  disc(ctx, 65, 132, 26, ink.dark, '#e9e6d0', 1.5);
  label(ctx, 'H', 65, 141, 28, ink.light, 'center', 'serif');
  disc(ctx, 65, 159, 3, ink.rust, ink.light);
  label(ctx, 'HERMES', 65, 185, 7.5, ink.dark, 'center');
  label(ctx, 'DRAWN EXAMPLE', 65, 197, 7, ink.muted, 'center');

  branches.forEach(({ y, name, ports, color }, i) => {
    const active = mode === 3 || mode === i;
    const routeColor = active ? color : '#afb9a1';
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(103, 132);
      ctx.bezierCurveTo(140, 132, 134, y, 183, y);
    };
    path(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#d4d8bd'; ctx.stroke();
    path(); ctx.lineWidth = active ? 1.5 : 0.8; ctx.strokeStyle = routeColor; ctx.stroke();
    if (active) {
      // A packet follows exactly the same cubic as the etched signal trace.
      const p = (t * 0.2 + i * 0.23) % 1;
      const u = 1 - p;
      const x = u ** 3 * 103 + 3 * u * u * p * 140 + 3 * u * p * p * 134 + p ** 3 * 183;
      const yy = (u ** 3 + 3 * u * u * p) * 132 + (3 * u * p * p + p ** 3) * y;
      disc(ctx, x, yy, 2.6, color, ink.light, 0.7);
    }
    disc(ctx, 201, y, 19, '#e8e5cd', '#a7b197');
    ticks(ctx, 201, y, 16, 20, active ? color : '#aab299');
    disc(ctx, 201, y, 10, active ? color : '#b2bba3');
    label(ctx, `${i + 1}`, 201, y + 3.7, 10, ink.light, 'center');
    label(ctx, name, 233, y - 17, 7.5, active ? color : ink.muted);
    ports.forEach((portY, j) => {
      ctx.beginPath();
      ctx.moveTo(220, y);
      ctx.bezierCurveTo(262, y, 261, portY, 303, portY);
      ctx.strokeStyle = routeColor; ctx.lineWidth = active ? 1.4 : 0.7; ctx.stroke();
      disc(ctx, 309, portY, 5.5, active ? '#f0e8d1' : '#dedfc5', routeColor);
      disc(ctx, 309, portY, 2, active ? color : '#adb69d');
      rule(ctx, 316, portY, 373, portY, '#bdc3a9', 0.55);
      label(ctx, `${['FILE', 'TOOL', 'MODEL'][i]} ${j + 1}`, 321, portY - 4, 7.1, active ? color : ink.muted);
      for (let k = 0; k < 8; k++) {
        const bar = 1 + Math.abs(Math.sin(k * 2 + i * 3 + j)) * 4;
        rule(ctx, 323 + k * 6, portY + 3, 323 + k * 6, portY + 3 + bar, active ? color : '#bec5ac', 1.5);
      }
    });
  });

  label(ctx, 'EXPLORE LINKS', 408, 69, 8, ink.muted);
  label(ctx, phases[mode], 408, 91, 12, mode === 3 ? ink.green : ink.dark);
  label(ctx, String(mode + 1).padStart(2, '0'), 407, 132, 37, ink.dark, 'left', 'serif');
  label(ctx, 'STUDY / 04 VIEWS', 410, 145, 7.5, ink.muted);
  rule(ctx, 409, 154, 519, 154, '#adb49a');
  label(ctx, 'SSE', 408, 180, 22, ink.green, 'left', 'serif');
  label(ctx, 'CHAT', 465, 177, 7.5, ink.muted);
  disc(ctx, 412, 200, 2.5, mode === 2 ? ink.rust : ink.green);
  label(ctx, 'GRAPH STUDY', 422, 203, 7.5, ink.green);
  instrumentFooter(ctx, 'SESSION → RESOURCE LINKS', 'EXPLORE THE GRAPH', mode);
  return `RESOURCE GRAPH STUDY · ${phases[mode]} · example links, not a live session`;
}

function drawMemoryArchive(ctx, { mode }) {
  const strata = [
    { name: 'AUTOBIOGRAPHICAL', detail: 'PERSONAL HISTORY', color: '#b28a43' },
    { name: 'RELATIONAL', detail: 'RELATIONSHIPS', color: '#53685a' },
    { name: 'SEMANTIC', detail: 'KNOWLEDGE', color: '#497b76' },
    { name: 'EPISODIC', detail: 'EVENTS & EXPERIENCES', color: '#9a654a' },
    { name: 'WORKING', detail: 'ACTIVE CONTEXT', color: '#7b8d82' }
  ];
  instrumentPlate(ctx, '11 / BECOMUSSY', 'An anatomy of remembering', 'FIVE MEMORY KINDS');

  // Exploded, isometric memory leaves. The selected leaf slides out like a folio.
  // Draw back-to-front so the slab edges and their fine hatching stay physically coherent.
  const layerX = (i) => 170 + (i === mode ? -17 : 0);
  const layerY = (i) => 80 + i * 23;
  ctx.save();
  ctx.setLineDash([2, 4]);
  [[71, 77], [269, 77], [170, 106]].forEach(([x, y]) => rule(ctx, x, y, x, y + 112, '#b4b69e', 0.7));
  ctx.restore();
  shape(ctx, [[55, 179], [171, 145], [287, 179], [171, 213]], 'rgba(72, 84, 59, .08)');

  for (let i = 4; i >= 0; i--) {
    const x = layerX(i);
    const y = layerY(i);
    const selected = mode === i;
    const color = strata[i].color;
    shape(ctx, [[x - 103, y], [x, y + 30], [x, y + 37], [x - 103, y + 7]], selected ? color : '#adb59e', '#83947c', 0.6);
    shape(ctx, [[x, y + 30], [x + 103, y], [x + 103, y + 7], [x, y + 37]], selected ? '#667c64' : '#879c87', '#6a826f', 0.6);
    const top = ctx.createLinearGradient(x - 100, y - 25, x + 100, y + 25);
    top.addColorStop(0, selected ? '#faf1d7' : '#d8ddc5');
    top.addColorStop(1, selected ? '#e6d5ad' : '#b9c9b1');
    shape(ctx, [[x, y - 30], [x + 103, y], [x, y + 30], [x - 103, y]], top, selected ? color : '#849b85', selected ? 1.2 : 0.7);
    shape(ctx, [[x, y - 25], [x + 87, y], [x, y + 25], [x - 87, y]], null, selected ? color : '#a4b79d', 0.45);
    for (let k = 1; k < 19; k++) {
      const xx = x - 100 + k * 5;
      const yy = y + (xx - (x - 103)) * 30 / 103;
      rule(ctx, xx, yy + 1, xx, yy + 5, selected ? '#d2bb87' : '#c2cbb0', 0.5);
    }

    // Flatten each engraving into the plane of its leaf.
    ctx.save();
    ctx.translate(x, y);
    ctx.transform(0.9, 0.26, -0.9, 0.26, 0, 0);
    if (i === 0) {
      disc(ctx, 0, 0, 31, '#dbc38a', color, 1.2);
      ticks(ctx, 0, 0, 28, 40, color);
      disc(ctx, 0, 0, 21, null, color, 0.7);
      // A small portrait medallion for autobiographical memory.
      disc(ctx, 0, -5, 6, color);
      shape(ctx, [[-3, -2], [3, -2], [5, 12], [-5, 12]], color);
      [-1, 1].forEach((s) => {
        for (let k = 0; k < 4; k++) rule(ctx, s * 38, -13 + k * 8, s * 56, -13 + k * 8, '#b09a64', 0.8);
      });
    } else if (i === 1) {
      for (let k = 0; k < 5; k++) {
        round(ctx, -45 + k * 19, -16, 13, 32, 1, null, color, 0.8);
        rule(ctx, -41 + k * 19, -8, -36 + k * 19, -8, color, 1.2);
        rule(ctx, -41 + k * 19, -2, -36 + k * 19, -2, color, 0.7);
      }
    } else if (i === 2) {
      const nodes = [[-45, -7], [-23, 17], [-13, -21], [10, 1], [31, -14], [43, 20]];
      [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4], [3, 5], [4, 5]].forEach(([a, b]) =>
        rule(ctx, ...nodes[a], ...nodes[b], color, 0.8));
      nodes.forEach(([nx, ny]) => disc(ctx, nx, ny, 3, color));
    } else if (i === 3) {
      round(ctx, -40, -20, 80, 40, 1, null, color, 0.8);
      rule(ctx, 0, -20, 0, 20, color, 1);
      for (let k = 0; k < 5; k++) {
        rule(ctx, -32, -13 + k * 7, -7, -13 + k * 7, color, 0.7);
        rule(ctx, 8, -13 + k * 7, 32, -13 + k * 7, color, 0.7);
      }
    } else {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 9; col++) disc(ctx, -43 + col * 11, -21 + row * 10, (row + col) % 3 === 0 ? 2 : 0.9, color);
      }
    }
    ctx.restore();
  }

  // Index tabs double as fine leader lines, tying each name to its physical stratum.
  strata.forEach(({ name, detail, color }, i) => {
    const y = 70 + i * 29;
    const x = layerX(i) + 103;
    ctx.beginPath();
    ctx.moveTo(x + 3, layerY(i) + 2);
    ctx.lineTo(297, layerY(i) + 2);
    ctx.lineTo(309, y);
    ctx.lineTo(327, y);
    ctx.strokeStyle = mode === i ? color : '#aab49b';
    ctx.lineWidth = mode === i ? 1 : 0.6;
    ctx.stroke();
    disc(ctx, x + 3, layerY(i) + 2, 1.5, mode === i ? color : '#98a78e');
    round(ctx, 329, y - 9, 20, 19, 2, mode === i ? color : '#d4dac2');
    label(ctx, `L${5 - i}`, 339, y + 3.5, 8.5, mode === i ? ink.light : ink.muted, 'center');
    label(ctx, name, 359, y - 0.5, 9, mode === i ? color : ink.dark);
    label(ctx, detail, 359, y + 11, 6.8, ink.muted);
  });
  instrumentFooter(ctx, `${strata[mode].detail}`, 'EXPLORE MEMORY KIND', mode, 5);
  return `MEMORY-KIND STUDY · ${strata[mode].name} · ${strata[mode].detail}`;
}

const articleInstruments = {
  cocs: drawRewindChronograph,
  rgbagentflightindicator: drawFlightDeck,
  warpi: drawLocalTerminal,
  hermesdashboard: drawAgentSwitchboard,
  becomussy: drawMemoryArchive
};
