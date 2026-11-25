/**
 * Variable-font cursor pressure wave.
 * Letters near the pointer swell along Syne's wght axis (400..800) with a Gaussian field
 * and damped spring falloff. Splits a headline into characters lazily only when the pointer
 * enters it, writes per-letter custom properties via CSP-safe setVars(), and never reads
 * layout inside the per-frame rAF loop. Full tier + fine pointer only.
 */
import type { FxTier } from '../capability.ts';
import { onVisible, pageVisible } from '../capability.ts';
import { clearVars, setVars } from '../vars.ts';
import { splitElementToChars } from './split.ts';

export interface PressurePoint {
  cx: number;
  cy: number;
}

export interface PressureOptions {
  rest: number;
  peak: number;
  radius: number;
  min?: number;
  rimDip?: number;
}

/**
 * Pure Gaussian pressure field with subtle displaced-paper rim dip.
 */
export function computePressureTargets(
  points: readonly PressurePoint[],
  pointerX: number,
  pointerY: number,
  options: PressureOptions
): number[] {
  const { rest, peak, radius, min = 400, rimDip = 26 } = options;
  const invR = 1 / Math.max(1, radius);
  const span = peak - rest;
  const out = new Array<number>(points.length);

  for (let i = 0; i < points.length; i++) {
    const dx = points[i].cx - pointerX;
    const dy = points[i].cy - pointerY;
    const u = Math.hypot(dx, dy) * invR;
    const bell = Math.exp(-0.5 * u * u);
    const rim = rimDip > 0 ? rimDip * Math.min(1, u * u) * Math.exp(-0.5 * (u - 1.75) * (u - 1.75) * 2.2) : 0;
    const raw = rest + span * bell - rim;
    out[i] = Math.max(min, Math.min(peak, raw));
  }
  return out;
}

/**
 * Damped spring integrator (mass = 1), clamped dt for stability.
 */
export function stepSpring(
  current: number,
  velocity: number,
  target: number,
  dt: number,
  stiffness = 280,
  damping = 21
): [number, number] {
  const h = Math.min(0.032, Math.max(0.001, dt));
  const accel = (target - current) * stiffness - velocity * damping;
  const nextVel = velocity + accel * h;
  const nextVal = current + nextVel * h;
  return [nextVal, nextVel];
}

interface CharState {
  id: string;
  selector: string;
  el: HTMLElement;
  cx: number;
  cy: number;
  wght: number;
  vel: number;
  lastWrittenWght: number;
  lastWrittenP: number;
}

interface PressureHeadline {
  el: HTMLElement;
  uid: number;
  chars: CharState[];
  hovered: boolean;
  pointerX: number;
  pointerY: number;
  originLeft: number;
  originTop: number;
  onEnter: (e: PointerEvent) => void;
  onMove: (e: PointerEvent) => void;
  onLeave: () => void;
}

const HEADLINE_SELECTOR =
  '.masthead-monument .word-slop, .section-heading, .article-headline, .hero-issue-headline, .under-hood-section h2';

export function initPressure(getTier: () => FxTier, getRizz: () => boolean): () => void {
  const finePointer =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: fine)').matches;

  if (!finePointer) return () => {};

  const tracked: PressureHeadline[] = [];
  const active = new Set<PressureHeadline>();
  let rafId = 0;
  let lastTime = 0;
  let destroyed = false;
  let nextUid = 1;

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const releaseHeadline = (entry: PressureHeadline) => {
    for (const ch of entry.chars) {
      clearVars(ch.selector);
      ch.lastWrittenWght = -1;
      ch.lastWrittenP = -1;
      ch.vel = 0;
    }
    entry.el.classList.remove('is-fx-press');
    active.delete(entry);
  };

  const measureGeometry = (entry: PressureHeadline) => {
    const rect = entry.el.getBoundingClientRect();
    entry.originLeft = rect.left;
    entry.originTop = rect.top;
    for (const ch of entry.chars) {
      const cr = ch.el.getBoundingClientRect();
      ch.cx = cr.left - rect.left + cr.width * 0.5;
      ch.cy = cr.top - rect.top + cr.height * 0.5;
    }
  };

  const ensureSplit = (entry: PressureHeadline) => {
    if (entry.chars.length > 0) return;
    const spans = splitElementToChars(entry.el);
    const rest = getRizz() ? 400 : 470;
    entry.chars = spans.map((el, idx) => {
      const id = `p${entry.uid}-${idx}`;
      el.dataset.fxId = id;
      return {
        id,
        selector: `[data-fx-id="${id}"]`,
        el,
        cx: 0,
        cy: 0,
        wght: rest,
        vel: 0,
        lastWrittenWght: -1,
        lastWrittenP: -1
      };
    });
  };

  const onScrollOrResize = () => {
    for (const entry of active) {
      if (entry.hovered) measureGeometry(entry);
    }
  };

  const tick = (now: number) => {
    rafId = 0;
    if (destroyed || !pageVisible() || getTier() !== 'full') {
      for (const entry of [...active]) releaseHeadline(entry);
      return;
    }

    const dt = lastTime ? (now - lastTime) / 1000 : 0.016;
    lastTime = now;

    const rizz = getRizz();
    const rest = rizz ? 400 : 470;
    const peak = 800;
    const radius = rizz ? 175 : 130;
    const rimDip = rizz ? 35 : 28;
    const stiffness = rizz ? 320 : 270;
    const damping = rizz ? 19 : 21;

    for (const entry of [...active]) {
      const targets = entry.hovered
        ? computePressureTargets(entry.chars, entry.pointerX, entry.pointerY, {
            rest,
            peak,
            radius,
            min: 400,
            rimDip
          })
        : null;

      let moving = entry.hovered;

      for (let i = 0; i < entry.chars.length; i++) {
        const ch = entry.chars[i];
        const target = targets ? targets[i] : rest;
        const [nextWght, nextVel] = stepSpring(ch.wght, ch.vel, target, dt, stiffness, damping);
        ch.wght = Math.max(400, Math.min(800, nextWght));
        ch.vel = nextVel;

        if (Math.abs(ch.wght - target) > 0.75 || Math.abs(ch.vel) > 1.2) {
          moving = true;
        }

        const rounded = Math.round(ch.wght);
        const normP = Math.max(0, Math.min(1, (ch.wght - rest) / Math.max(1, peak - rest)));
        const roundedP = Math.round(normP * 100) / 100;

        if (Math.abs(rounded - ch.lastWrittenWght) >= 2 || Math.abs(roundedP - ch.lastWrittenP) >= 0.02) {
          ch.lastWrittenWght = rounded;
          ch.lastWrittenP = roundedP;
          setVars(ch.selector, { '--fx-wght': rounded, '--fx-p': roundedP });
        }
      }

      if (!moving) {
        releaseHeadline(entry);
      }
    }

    if (active.size > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      lastTime = 0;
    }
  };

  const startLoop = () => {
    if (!rafId && active.size > 0 && pageVisible() && getTier() === 'full') {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  };

  const nodes = document.querySelectorAll<HTMLElement>(HEADLINE_SELECTOR);
  for (const el of nodes) {
    if (el.closest('astro-island, .opus-cold-open')) continue;
    const text = (el.textContent || '').trim();
    if (!text || text.length > 120) continue;

    const entry: PressureHeadline = {
      el,
      uid: nextUid++,
      chars: [],
      hovered: false,
      pointerX: 0,
      pointerY: 0,
      originLeft: 0,
      originTop: 0,
      onEnter: (e: PointerEvent) => {
        if (destroyed || getTier() !== 'full' || e.pointerType === 'touch') return;
        ensureSplit(entry);
        if (entry.chars.length === 0) return;
        measureGeometry(entry);
        entry.pointerX = e.clientX - entry.originLeft;
        entry.pointerY = e.clientY - entry.originTop;
        entry.hovered = true;
        entry.el.classList.add('is-fx-press');
        active.add(entry);
        startLoop();
      },
      onMove: (e: PointerEvent) => {
        if (!entry.hovered) return;
        entry.pointerX = e.clientX - entry.originLeft;
        entry.pointerY = e.clientY - entry.originTop;
      },
      onLeave: () => {
        entry.hovered = false;
      }
    };

    el.addEventListener('pointerenter', entry.onEnter);
    el.addEventListener('pointermove', entry.onMove);
    el.addEventListener('pointerleave', entry.onLeave);
    tracked.push(entry);
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  const unsubVisible = onVisible((visible) => {
    if (!visible) {
      stopLoop();
      for (const entry of [...active]) releaseHeadline(entry);
    }
  });

  return () => {
    destroyed = true;
    stopLoop();
    unsubVisible();
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
    for (const entry of tracked) {
      releaseHeadline(entry);
      entry.el.removeEventListener('pointerenter', entry.onEnter);
      entry.el.removeEventListener('pointermove', entry.onMove);
      entry.el.removeEventListener('pointerleave', entry.onLeave);
    }
    tracked.length = 0;
    active.clear();
  };
}
