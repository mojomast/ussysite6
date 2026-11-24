/**
 * Decode / scramble for monospace labels (.datum-tag, .sha-pill, .service-stamp, etc.).
 * Preserves exact character length and whitespace so nothing reflows, keeps the real text
 * in an .sr-only span for screen readers, and shares a single rAF loop across all active items.
 */
import type { FxTier } from '../capability.ts';
import { onVisible, pageVisible } from '../capability.ts';

export const SCRAMBLE_GLYPHS = '0123456789ABCDEF┌┐└┘├┤┬┴┼─│¶§†‡•·';

const PRESERVE_RE = /[\s↗↘↖↙←→↑↓]/;

/**
 * Pure frame generator for fixed-width scramble decode.
 * At progress <= 0 all mutable characters are scrambled; at progress >= 1 the exact target is returned.
 */
export function scrambleFrame(target: string, progress: number, tick: number): string {
  if (progress >= 1) return target;
  const chars = [...target];
  const len = chars.length;
  if (len === 0) return target;

  const p = Math.max(0, progress);
  const glyphCount = SCRAMBLE_GLYPHS.length;
  let out = '';

  for (let i = 0; i < len; i++) {
    const ch = chars[i];
    if (PRESERVE_RE.test(ch)) {
      out += ch;
      continue;
    }
    const lockAt = (i / len) * 0.72 + ((i * 7 + 3) % 11) * 0.025;
    if (p >= lockAt) {
      out += ch;
    } else {
      const idx = Math.abs(i * 31 + tick * 17 + (i ^ tick) * 13) % glyphCount;
      out += SCRAMBLE_GLYPHS[idx];
    }
  }
  return out;
}

interface ScrambleItem {
  el: HTMLElement;
  vis: HTMLSpanElement;
  raw: string;
  decoded: boolean;
  startAt: number;
  duration: number;
  lastTick: number;
  cooldownUntil: number;
  onEnter: () => void;
}

const TARGET_SELECTOR =
  '.datum-tag, .sha-pill, .service-stamp, .opus-strata-era, .opus-strata-still, .code-specimen-header > span';

function isEligible(el: HTMLElement): boolean {
  if (el.dataset.fxScr || el.dataset.fxSkip) return false;
  if (el.children.length > 0) return false;
  if (el.closest('astro-island, [aria-live], [role="status"], .sr-only, .opus-cold-open')) return false;
  const trimmed = (el.textContent || '').trim();
  return trimmed.length >= 2 && trimmed.length <= 110;
}

export function initScramble(getTier: () => FxTier, getRizz: () => boolean): () => void {
  const items: ScrambleItem[] = [];
  const byEl = new Map<Element, ScrambleItem>();
  const active = new Set<ScrambleItem>();
  let rafId = 0;
  let io: IntersectionObserver | null = null;
  let unsubVisible: (() => void) | null = null;
  let destroyed = false;

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const finishItem = (item: ScrambleItem, now: number) => {
    item.vis.textContent = item.raw;
    item.el.classList.remove('is-scrambling');
    item.cooldownUntil = now + 180;
    active.delete(item);
  };

  const step = (now: number) => {
    rafId = 0;
    if (destroyed || !pageVisible() || getTier() === 'off') {
      for (const item of [...active]) finishItem(item, now);
      return;
    }

    const churnMs = getRizz() ? 22 : 36;
    for (const item of [...active]) {
      const elapsed = now - item.startAt;
      if (elapsed < 0) continue;
      const progress = Math.min(1, elapsed / item.duration);
      if (progress >= 1) {
        finishItem(item, now);
        continue;
      }
      const tick = Math.floor(elapsed / churnMs);
      if (tick !== item.lastTick) {
        item.lastTick = tick;
        item.vis.textContent = scrambleFrame(item.raw, progress, tick);
      }
    }

    if (active.size > 0) {
      rafId = requestAnimationFrame(step);
    }
  };

  const startLoop = () => {
    if (!rafId && active.size > 0 && pageVisible() && getTier() !== 'off') {
      rafId = requestAnimationFrame(step);
    }
  };

  const trigger = (item: ScrambleItem, duration: number, delay = 0) => {
    if (destroyed || getTier() === 'off') return;
    const now = performance.now();
    item.startAt = now + delay;
    item.duration = duration;
    item.lastTick = -1;
    item.el.classList.add('is-scrambling');
    if (delay === 0) {
      item.vis.textContent = scrambleFrame(item.raw, 0, 1);
    }
    active.add(item);
    startLoop();
  };

  const candidates = document.querySelectorAll<HTMLElement>(TARGET_SELECTOR);
  for (const el of candidates) {
    if (!isEligible(el)) continue;
    const raw = el.textContent || '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = raw;

    const vis = document.createElement('span');
    vis.className = 'fx-scr-vis';
    vis.setAttribute('aria-hidden', 'true');
    vis.textContent = raw;

    el.textContent = '';
    el.append(sr, vis);
    el.dataset.fxScr = '1';

    const item: ScrambleItem = {
      el,
      vis,
      raw,
      decoded: false,
      startAt: 0,
      duration: 720,
      lastTick: -1,
      cooldownUntil: 0,
      onEnter: () => {
        if (getTier() !== 'full') return;
        const now = performance.now();
        if (active.has(item) || now < item.cooldownUntil) return;
        trigger(item, getRizz() ? 260 : 420, 0);
      }
    };

    el.addEventListener('pointerenter', item.onEnter);
    items.push(item);
    byEl.set(el, item);
  }

  if (items.length > 0 && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(
      (entries) => {
        if (destroyed || getTier() === 'off') return;
        let batch = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const item = byEl.get(entry.target);
          if (!item || item.decoded) continue;
          item.decoded = true;
          io?.unobserve(entry.target);
          const dur = getTier() === 'lite' ? 560 : getRizz() ? 420 : 760;
          trigger(item, dur, Math.min(batch * 45, 320));
          batch++;
        }
      },
      { rootMargin: '40px', threshold: 0.05 }
    );
    for (const item of items) io.observe(item.el);
  } else {
    for (let i = 0; i < items.length; i++) {
      items[i].decoded = true;
      trigger(items[i], getRizz() ? 420 : 760, Math.min(i * 45, 320));
    }
  }

  unsubVisible = onVisible((visible) => {
    if (!visible) {
      stopLoop();
      const now = performance.now();
      for (const item of [...active]) finishItem(item, now);
    }
  });

  return () => {
    destroyed = true;
    stopLoop();
    io?.disconnect();
    unsubVisible?.();
    for (const item of items) {
      item.el.removeEventListener('pointerenter', item.onEnter);
      item.el.classList.remove('is-scrambling');
      delete item.el.dataset.fxScr;
      item.el.textContent = item.raw;
    }
    items.length = 0;
    byEl.clear();
    active.clear();
  };
}
