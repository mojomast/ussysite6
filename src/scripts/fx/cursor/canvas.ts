/**
 * Single fixed full-viewport 2D canvas renderer for:
 * 1. Calligraphic ink-nib follower + drying ink stroke (full tier, fine pointer)
 * 2. Context states: link ring (READ / OPEN / PLAY), plate loupe, code caret, input hide
 * 3. Click ink splats (radial droplets + press ripple)
 * 4. Maximum-rizz mode: gilt bee & spark swarm chasing the cursor
 *
 * Strict CSP: sizes only via canvas width/height attributes, never inline styles.
 * Performance: zero per-frame allocations; rAF halts after 1.5s idle or when hidden.
 */

import { clamp, lerp } from './math';
import type { CursorContextResult, CursorTone } from './math';

interface Palette {
  ink: string;
  signal: string;
  gold: string;
  primary: string;
  panel: string;
  canvas: string;
}

interface TrailPoint {
  x: number;
  y: number;
  t: number;
  w: number;
  active: boolean;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  tone: CursorTone;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  maxR: number;
  tone: CursorTone;
}

interface Bee {
  x: number;
  y: number;
  vx: number;
  vy: number;
  orbitR: number;
  phase: number;
  wingSpeed: number;
  size: number;
  goldBias: boolean;
}

export interface CursorCanvasController {
  onPointerMove(x: number, y: number, ctx: CursorContextResult, rizz: boolean): void;
  onPointerDown(x: number, y: number, tone: CursorTone, rizz: boolean): void;
  onPointerLeave(): void;
  setSuppressed(suppressed: boolean, reason?: 'kb' | 'input' | 'off'): void;
  setVisible(visible: boolean): void;
  setRizz(rizz: boolean): void;
  refreshPalette(): void;
  isRunning(): boolean;
  destroy(): void;
}

const TRAIL_CAP = 44;
const TRAIL_TTL_MS = 560;
const IDLE_STOP_MS = 1500;
const BEE_COUNT = 30;
const MAX_DROPLETS = 72;
const MAX_RIPPLES = 8;

const DEFAULT_PALETTE: Palette = {
  ink: '#ff5a3c',
  signal: '#22f3e6',
  gold: '#e8c36a',
  primary: '#f3efe6',
  panel: '#181b21',
  canvas: '#0b0c0e'
};

function readPalette(): Palette {
  if (typeof window === 'undefined') return { ...DEFAULT_PALETTE };
  const cs = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    ink: pick('--fx-ink', DEFAULT_PALETTE.ink),
    signal: pick('--fx-signal', DEFAULT_PALETTE.signal),
    gold: pick('--fx-gold', DEFAULT_PALETTE.gold),
    primary: pick('--ink-primary', DEFAULT_PALETTE.primary),
    panel: pick('--bg-panel', DEFAULT_PALETTE.panel),
    canvas: pick('--bg-canvas', DEFAULT_PALETTE.canvas)
  };
}

export function createCursorCanvas(canvas: HTMLCanvasElement): CursorCanvasController {
  const ctx2d = canvas.getContext('2d', { alpha: true });
  let palette = readPalette();
  let width = 0;
  let height = 0;
  let dpr = 1;

  let rafId = 0;
  let visible = true;
  let suppressed = false;
  let pointerPresent = false;
  let rizzMode = false;
  let lastActivityMs = 0;
  let lastFrameMs = 0;

  let px = -200;
  let py = -200;
  let fx = -200;
  let fy = -200;
  let nibAngle = -Math.PI * 0.25;
  let speedSmooth = 0;

  let ringRadius = 9;
  let followerAlpha = 0;
  let context: CursorContextResult = { mode: 'default', label: '', tone: 'ink' };

  // Pre-allocated ring buffer for drying ink stroke
  const trail: TrailPoint[] = Array.from({ length: TRAIL_CAP }, () => ({
    x: 0,
    y: 0,
    t: 0,
    w: 2,
    active: false
  }));
  let trailHead = 0;
  let trailCount = 0;

  // Pre-allocated splat pools
  const droplets: Droplet[] = Array.from({ length: MAX_DROPLETS }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 0,
    life: 0,
    maxLife: 1,
    tone: 'ink'
  }));
  let dropletCursor = 0;

  const ripples: Ripple[] = Array.from({ length: MAX_RIPPLES }, () => ({
    x: 0,
    y: 0,
    age: 1,
    maxAge: 1,
    maxR: 32,
    tone: 'ink'
  }));
  let rippleCursor = 0;

  // Pre-allocated max-rizz bee/spark swarm
  const bees: Bee[] = Array.from({ length: BEE_COUNT }, (_, i) => {
    const phi = (i / BEE_COUNT) * Math.PI * 2;
    return {
      x: -200,
      y: -200,
      vx: 0,
      vy: 0,
      orbitR: 12 + (i % 7) * 5.2,
      phase: phi * 2.3,
      wingSpeed: 0.022 + (i % 5) * 0.005,
      size: 1.8 + (i % 4) * 0.65,
      goldBias: i % 4 !== 0
    };
  });
  let beesSeeded = false;

  const toneColor = (tone: CursorTone): string =>
    tone === 'signal' ? palette.signal : tone === 'gold' ? palette.gold : palette.ink;

  const syncSize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(1, Math.round(width * dpr));
    const targetH = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  };

  syncSize();
  window.addEventListener('resize', syncSize, { passive: true });

  const clearCanvas = () => {
    if (!ctx2d) return;
    ctx2d.setTransform(1, 0, 0, 1, 0, 0);
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  };

  const stopLoop = (state: 'idle' | 'kb-hidden' = 'idle') => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    canvas.dataset.state = state;
  };

  const startLoop = () => {
    if (rafId || !ctx2d || !visible || suppressed) return;
    lastFrameMs = performance.now();
    canvas.dataset.state = 'active';
    rafId = requestAnimationFrame(frame);
  };

  const seedBees = (x: number, y: number) => {
    for (let i = 0; i < BEE_COUNT; i++) {
      const b = bees[i];
      b.x = x + Math.cos(b.phase) * b.orbitR;
      b.y = y + Math.sin(b.phase) * b.orbitR;
      b.vx = 0;
      b.vy = 0;
    }
    beesSeeded = true;
  };

  const pushTrailPoint = (x: number, y: number, now: number, speed: number) => {
    // Calligraphic pressure: slower stroke deposits wider wet ink; fast flick thins cleanly
    const w = clamp(3.6 - speed * 0.045, 1.15, 3.6);
    const slot = trail[trailHead];
    slot.x = x;
    slot.y = y;
    slot.t = now;
    slot.w = w;
    slot.active = true;
    trailHead = (trailHead + 1) % TRAIL_CAP;
    if (trailCount < TRAIL_CAP) trailCount++;
  };

  const drawInkTrail = (c: CanvasRenderingContext2D, now: number, idleFade: number) => {
    if (trailCount < 2) return;
    const startIdx = (trailHead - trailCount + TRAIL_CAP) % TRAIL_CAP;
    const accent = rizzMode ? palette.gold : toneColor(context.tone);

    c.lineCap = 'round';
    c.lineJoin = 'round';

    let prev: TrailPoint | null = null;
    for (let i = 0; i < trailCount; i++) {
      const pt = trail[(startIdx + i) % TRAIL_CAP];
      const age = now - pt.t;
      if (!pt.active || age > TRAIL_TTL_MS) {
        prev = null;
        continue;
      }
      if (prev) {
        const life = 1 - age / TRAIL_TTL_MS;
        // Nonlinear drying curve: stays lush briefly, then absorbs and dries out
        const dry = life * life;
        const alpha = dry * (rizzMode ? 0.34 : 0.72) * idleFade;
        if (alpha > 0.01) {
          c.strokeStyle = accent;
          c.globalAlpha = alpha;
          c.lineWidth = pt.w * (0.35 + life * 0.65);
          c.beginPath();
          c.moveTo(prev.x, prev.y);
          c.lineTo(pt.x, pt.y);
          c.stroke();
        }
      }
      prev = pt;
    }
    c.globalAlpha = 1;
  };

  const updateAndDrawBees = (c: CanvasRenderingContext2D, now: number, dt: number, idleFade: number) => {
    if (!beesSeeded) seedBees(px, py);
    const step = clamp(dt / 16.667, 0.4, 2.2);

    for (let i = 0; i < BEE_COUNT; i++) {
      const b = bees[i];
      const angle = b.phase + now * (0.0024 + (i % 5) * 0.00045);
      const tx = fx + Math.cos(angle) * b.orbitR;
      const ty = fy + Math.sin(angle * 1.15) * (b.orbitR * 0.82);

      // Spring chase with agile buzz damping
      const ax = (tx - b.x) * 0.068;
      const ay = (ty - b.y) * 0.068;
      b.vx = (b.vx + ax * step) * Math.pow(0.84, step);
      b.vy = (b.vy + ay * step) * Math.pow(0.84, step);
      b.x += b.vx * step;
      b.y += b.vy * step;

      const heading = Math.atan2(b.vy, b.vx);
      const wing = Math.sin(now * b.wingSpeed + b.phase) * 0.65;
      const alpha = (0.52 + 0.42 * (i % 3 === 0 ? 1 : 0.75)) * idleFade * followerAlpha;
      if (alpha <= 0.01) continue;

      c.save();
      c.translate(b.x, b.y);
      c.rotate(heading);

      // Translucent fluttering wings
      c.globalAlpha = alpha * 0.55;
      c.fillStyle = palette.primary;
      c.beginPath();
      c.ellipse(-0.4, -b.size * (0.95 + wing * 0.35), b.size * 0.72, b.size * 0.36, -0.45, 0, Math.PI * 2);
      c.ellipse(-0.4, b.size * (0.95 + wing * 0.35), b.size * 0.72, b.size * 0.36, 0.45, 0, Math.PI * 2);
      c.fill();

      // Gilt spark / bee body
      c.globalAlpha = alpha;
      c.fillStyle = b.goldBias ? palette.gold : palette.signal;
      c.beginPath();
      c.ellipse(0, 0, b.size * 1.25, b.size * 0.68, 0, 0, Math.PI * 2);
      c.fill();

      // Tiny graphite band across bee abdomen
      c.fillStyle = palette.canvas;
      c.globalAlpha = alpha * 0.75;
      c.fillRect(-b.size * 0.28, -b.size * 0.6, b.size * 0.45, b.size * 1.2);
      c.restore();
    }
    c.globalAlpha = 1;
  };

  const drawLabelTag = (c: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, alpha: number) => {
    if (!label || alpha <= 0.04) return;
    c.save();
    c.globalAlpha = alpha;
    c.font = '600 9.5px "JetBrains Mono", ui-monospace, monospace';
    const textW = c.measureText(label).width;
    const padX = 5;
    const boxW = Math.ceil(textW + padX * 2);
    const boxH = 16;

    // Flip left/down cleanly near viewport edges so the label never clips off-screen
    let bx = x + 16;
    let by = y - 28;
    if (bx + boxW > width - 8) bx = x - boxW - 16;
    if (by < 8) by = y + 18;

    c.fillStyle = palette.panel;
    c.fillRect(bx, by, boxW, boxH);
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.strokeRect(bx + 0.5, by + 0.5, boxW - 1, boxH - 1);

    c.fillStyle = color;
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    c.fillText(label, bx + padX, by + boxH * 0.5 + 0.5);
    c.restore();
  };

  const drawFollower = (c: CanvasRenderingContext2D, now: number, idleFade: number) => {
    const alpha = followerAlpha * idleFade;
    if (alpha <= 0.015) return;

    const accent = rizzMode && context.mode === 'default' ? palette.gold : toneColor(context.tone);

    c.save();
    c.globalAlpha = alpha;

    if (context.mode === 'caret') {
      // Editorial code-specimen I-beam caret
      const pulse = 0.58 + 0.42 * Math.sin(now * 0.008);
      const h = 11;
      c.strokeStyle = accent;
      c.lineWidth = 1.6;
      c.globalAlpha = alpha * pulse;
      c.beginPath();
      c.moveTo(px, py - h);
      c.lineTo(px, py + h);
      c.moveTo(px - 4.5, py - h);
      c.lineTo(px + 4.5, py - h);
      c.moveTo(px - 4.5, py + h);
      c.lineTo(px + 4.5, py + h);
      c.stroke();
      drawLabelTag(c, px, py, context.label, accent, alpha * 0.92);
      c.restore();
      return;
    }

    if (context.mode === 'loupe') {
      // Printer's optical loupe ring with graduated reticle ticks & glass sheen
      const r = ringRadius;
      c.strokeStyle = accent;
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(fx, fy, r, 0, Math.PI * 2);
      c.stroke();

      // Inner hairline lens bezel
      c.globalAlpha = alpha * 0.45;
      c.lineWidth = 0.9;
      c.beginPath();
      c.arc(fx, fy, r - 4.5, 0, Math.PI * 2);
      c.stroke();

      // Specular glass crescent arc
      c.globalAlpha = alpha * 0.6;
      c.strokeStyle = palette.primary;
      c.lineWidth = 1.25;
      c.beginPath();
      c.arc(fx, fy, r - 7, -Math.PI * 0.78, -Math.PI * 0.34);
      c.stroke();

      // Cardinal + 45-degree reticle ticks
      c.globalAlpha = alpha * 0.85;
      c.strokeStyle = accent;
      c.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const inner = i % 2 === 0 ? r - 6 : r - 3;
        const outer = i % 2 === 0 ? r + 4 : r + 1.5;
        c.beginPath();
        c.moveTo(fx + Math.cos(a) * inner, fy + Math.sin(a) * inner);
        c.lineTo(fx + Math.cos(a) * outer, fy + Math.sin(a) * outer);
        c.stroke();
      }

      // Precision center dot at exact pointer
      c.globalAlpha = alpha;
      c.fillStyle = accent;
      c.beginPath();
      c.arc(px, py, 2, 0, Math.PI * 2);
      c.fill();

      drawLabelTag(c, fx, fy, context.label, accent, alpha);
      c.restore();
      return;
    }

    if (context.mode === 'link') {
      // Proofreader's target ring + Swiss corner registration marks + READ / OPEN / PLAY tag
      const r = ringRadius;

      // Subtle translucent wash inside the ring
      c.globalAlpha = alpha * 0.12;
      c.fillStyle = accent;
      c.beginPath();
      c.arc(fx, fy, r, 0, Math.PI * 2);
      c.fill();

      // Crisp outer ring
      c.globalAlpha = alpha * 0.92;
      c.strokeStyle = accent;
      c.lineWidth = 1.45;
      c.beginPath();
      c.arc(fx, fy, r, 0, Math.PI * 2);
      c.stroke();

      // 4 cardinal registration ticks
      c.lineWidth = 1.1;
      for (let i = 0; i < 4; i++) {
        const a = i * (Math.PI * 0.5);
        c.beginPath();
        c.moveTo(fx + Math.cos(a) * (r - 2.5), fy + Math.sin(a) * (r - 2.5));
        c.lineTo(fx + Math.cos(a) * (r + 3.5), fy + Math.sin(a) * (r + 3.5));
        c.stroke();
      }

      // Exact ink nib point
      c.fillStyle = accent;
      c.beginPath();
      c.arc(px, py, 2.4, 0, Math.PI * 2);
      c.fill();

      drawLabelTag(c, fx, fy, context.label, accent, alpha);
      c.restore();
      return;
    }

    // Default state: delicate trailing proof ring + calligraphic fountain-pen nib tip
    c.strokeStyle = accent;
    c.globalAlpha = alpha * 0.52;
    c.lineWidth = 1.1;
    c.beginPath();
    c.arc(fx, fy, ringRadius + Math.min(4, speedSmooth * 0.08), 0, Math.PI * 2);
    c.stroke();

    // Calligraphic split nib anchored at exact pointer tip (px, py)
    c.save();
    c.translate(px, py);
    c.rotate(nibAngle);
    c.globalAlpha = alpha * 0.95;
    c.fillStyle = accent;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(-5.5, -2.5);
    c.lineTo(-9.5, 0);
    c.lineTo(-5.5, 2.5);
    c.closePath();
    c.fill();

    // Nib ink-channel slit
    c.strokeStyle = palette.canvas;
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(-1.2, 0);
    c.lineTo(-6.2, 0);
    c.stroke();
    c.restore();

    // Wet ink point
    c.fillStyle = palette.primary;
    c.globalAlpha = alpha;
    c.beginPath();
    c.arc(px, py, 1.5, 0, Math.PI * 2);
    c.fill();

    c.restore();
  };

  const updateAndDrawSplats = (c: CanvasRenderingContext2D, dt: number): boolean => {
    let anyActive = false;
    const step = clamp(dt / 16.667, 0.4, 2.2);

    // Expanding ink press ripples
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const rp = ripples[i];
      if (rp.age >= rp.maxAge) continue;
      rp.age += dt;
      if (rp.age >= rp.maxAge) continue;
      anyActive = true;

      const t = rp.age / rp.maxAge;
      const ease = 1 - Math.pow(1 - t, 3);
      const r = 4 + ease * rp.maxR;
      const alpha = (1 - t) * (1 - t) * 0.85;
      const color = toneColor(rp.tone);

      c.save();
      c.strokeStyle = color;
      c.globalAlpha = alpha;
      c.lineWidth = 1.8 * (1 - t * 0.55);
      c.beginPath();
      c.arc(rp.x, rp.y, r, 0, Math.PI * 2);
      c.stroke();

      // Secondary inner registration ripple
      if (t < 0.78) {
        c.globalAlpha = alpha * 0.48;
        c.lineWidth = 0.9;
        c.beginPath();
        c.arc(rp.x, rp.y, r * 0.58, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();
    }

    // Radial ink splash droplets
    for (let i = 0; i < MAX_DROPLETS; i++) {
      const d = droplets[i];
      if (d.life <= 0) continue;
      d.life -= dt;
      if (d.life <= 0) continue;
      anyActive = true;

      d.vx *= Math.pow(0.87, step);
      d.vy *= Math.pow(0.87, step);
      d.x += d.vx * step;
      d.y += d.vy * step;

      const ratio = d.life / d.maxLife;
      const rad = Math.max(0.45, d.r * (0.45 + ratio * 0.55));
      c.globalAlpha = ratio * ratio * 0.9;
      c.fillStyle = toneColor(d.tone);
      c.beginPath();
      c.arc(d.x, d.y, rad, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    return anyActive;
  };

  const hasLiveTrail = (now: number): boolean => {
    if (trailCount === 0) return false;
    const latest = trail[(trailHead - 1 + TRAIL_CAP) % TRAIL_CAP];
    return latest.active && now - latest.t < TRAIL_TTL_MS;
  };

  const frame = (now: number) => {
    if (!ctx2d || !visible || suppressed) {
      stopLoop(suppressed ? 'kb-hidden' : 'idle');
      clearCanvas();
      return;
    }

    const dt = Math.min(48, Math.max(1, now - lastFrameMs));
    lastFrameMs = now;
    const idleMs = now - lastActivityMs;

    // Smoothly fade out across the final 320ms of the 1.5s idle window so rAF stops cleanly
    const idleFade =
      idleMs <= IDLE_STOP_MS - 320
        ? 1
        : clamp(1 - (idleMs - (IDLE_STOP_MS - 320)) / 320, 0, 1);

    const targetAlpha = pointerPresent && context.mode !== 'input' ? 1 : 0;
    followerAlpha = lerp(followerAlpha, targetAlpha, clamp(dt * 0.014, 0.08, 0.38));

    const targetRadius =
      context.mode === 'loupe' ? 29 : context.mode === 'link' ? 22 : context.mode === 'caret' ? 5 : 8.5;
    const followRate = clamp(dt * 0.016, 0.12, 0.42);
    fx = lerp(fx, px, followRate);
    fy = lerp(fy, py, followRate);
    ringRadius = lerp(ringRadius, targetRadius, clamp(dt * 0.015, 0.1, 0.36));
    speedSmooth *= Math.pow(0.86, dt / 16.667);

    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2d.clearRect(0, 0, width, height);

    drawInkTrail(ctx2d, now, idleFade);
    if (rizzMode && pointerPresent && context.mode !== 'input') {
      updateAndDrawBees(ctx2d, now, dt, idleFade);
    }
    const splatsAlive = updateAndDrawSplats(ctx2d, dt);
    drawFollower(ctx2d, now, idleFade);

    const settled =
      idleMs >= IDLE_STOP_MS && !splatsAlive && !hasLiveTrail(now);

    if (settled) {
      clearCanvas();
      stopLoop('idle');
      return;
    }

    rafId = requestAnimationFrame(frame);
  };

  return {
    onPointerMove(x, y, nextCtx, rizz) {
      const now = performance.now();
      rizzMode = rizz;
      suppressed = false;
      context = nextCtx;
      canvas.dataset.context = nextCtx.mode;
      canvas.dataset.label = nextCtx.label;

      if (!pointerPresent) {
        pointerPresent = true;
        px = x;
        py = y;
        fx = x;
        fy = y;
        if (rizz) seedBees(x, y);
      } else {
        const dx = x - px;
        const dy = y - py;
        const dist = Math.hypot(dx, dy);
        speedSmooth = lerp(speedSmooth, dist, 0.35);
        if (dist > 1.5) {
          nibAngle = Math.atan2(dy, dx);
          if (nextCtx.mode !== 'input') {
            pushTrailPoint(x, y, now, dist);
          }
        }
        px = x;
        py = y;
      }

      lastActivityMs = now;
      startLoop();
    },

    onPointerDown(x, y, tone, rizz) {
      if (suppressed || !visible) return;
      const now = performance.now();
      rizzMode = rizz;
      lastActivityMs = now;

      const splatTone: CursorTone = rizz ? 'gold' : tone;
      const rp = ripples[rippleCursor];
      rippleCursor = (rippleCursor + 1) % MAX_RIPPLES;
      rp.x = x;
      rp.y = y;
      rp.age = 0;
      rp.maxAge = rizz ? 580 : 480;
      rp.maxR = rizz ? 46 : 30;
      rp.tone = splatTone;

      const dropCount = rizz ? 14 : 9;
      for (let i = 0; i < dropCount; i++) {
        const d = droplets[dropletCursor];
        dropletCursor = (dropletCursor + 1) % MAX_DROPLETS;
        const angle = (i / dropCount) * Math.PI * 2 + ((now + i * 37) % 100) * 0.0055;
        const speed = (rizz ? 2.8 : 1.9) + ((i * 29) % 10) * 0.28;
        d.x = x + Math.cos(angle) * 3;
        d.y = y + Math.sin(angle) * 3;
        d.vx = Math.cos(angle) * speed;
        d.vy = Math.sin(angle) * speed;
        d.r = 1.4 + (i % 3) * 0.95;
        d.maxLife = 360 + (i % 4) * 55;
        d.life = d.maxLife;
        d.tone = splatTone;
      }

      // Under max rizz, scatter bees outward on click before they swarm back
      if (rizz && beesSeeded) {
        for (let i = 0; i < BEE_COUNT; i++) {
          const b = bees[i];
          const dx = b.x - x;
          const dy = b.y - y;
          const dist = Math.max(8, Math.hypot(dx, dy));
          b.vx += (dx / dist) * 5.2;
          b.vy += (dy / dist) * 5.2;
        }
      }

      startLoop();
    },

    onPointerLeave() {
      pointerPresent = false;
      lastActivityMs = Math.min(lastActivityMs, performance.now() - (IDLE_STOP_MS - 320));
    },

    setSuppressed(next, reason = 'kb') {
      suppressed = next;
      if (next) {
        pointerPresent = false;
        followerAlpha = 0;
        trailCount = 0;
        clearCanvas();
        stopLoop(reason === 'kb' ? 'kb-hidden' : 'idle');
      }
    },

    setVisible(next) {
      visible = next;
      if (!next) {
        stopLoop('idle');
      }
    },

    setRizz(next) {
      rizzMode = next;
      if (next && pointerPresent) {
        seedBees(px, py);
        lastActivityMs = performance.now();
        startLoop();
      }
    },

    refreshPalette() {
      palette = readPalette();
    },

    isRunning() {
      return rafId !== 0;
    },

    destroy() {
      stopLoop('idle');
      clearCanvas();
      window.removeEventListener('resize', syncSize);
    }
  };
}
