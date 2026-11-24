/**
 * The effects gate. Every wave-9 effect asks this module before doing anything.
 *
 *   off  — prefers-reduced-motion: reduce. Nothing moves; effects render their calm, static form.
 *   lite — touch-first, low memory, few cores or Save-Data. CSS effects only, no per-frame JS,
 *          no full-screen shaders.
 *   full — everything, still paused offscreen and in hidden tabs.
 *
 * The tier is published on <html data-fx="…">, with <html data-pointer="fine|coarse">, so CSS can
 * gate on it without JavaScript.
 */
export type FxTier = 'off' | 'lite' | 'full';

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

const listeners = new Set<(tier: FxTier) => void>();
let current: FxTier = 'off';

function compute(): FxTier {
  if (typeof window === 'undefined') return 'off';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off';
  const nav = navigator as NavigatorHints;
  const coarse = !window.matchMedia('(pointer: fine)').matches;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;
  const fewCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4;
  const saveData = Boolean(nav.connection?.saveData);
  return coarse || lowMemory || fewCores || saveData ? 'lite' : 'full';
}

function publish() {
  const root = document.documentElement;
  current = compute();
  root.dataset.fx = current;
  root.dataset.pointer = window.matchMedia('(pointer: fine)').matches ? 'fine' : 'coarse';
  for (const fn of listeners) fn(current);
}

let started = false;
export function startCapability(): FxTier {
  if (!started && typeof window !== 'undefined') {
    started = true;
    publish();
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', publish);
    window.matchMedia('(pointer: fine)').addEventListener('change', publish);
  }
  return current;
}

export function fxTier(): FxTier {
  return current;
}

/** Called now and on every tier change (the reader can toggle reduced motion mid-visit). Returns an unsubscribe. */
export function onTier(fn: (tier: FxTier) => void): () => void {
  listeners.add(fn);
  fn(current);
  return () => listeners.delete(fn);
}

/** True while the tab is visible. Per-frame loops must check this (or use `onVisible`). */
export function pageVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}

/** Runs `fn(visible)` on every visibility change. Returns an unsubscribe. */
export function onVisible(fn: (visible: boolean) => void): () => void {
  const handler = () => fn(pageVisible());
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

/** Calls `fn(inView)` whenever `el` enters or leaves the viewport. Returns a disconnect. */
export function onInView(el: Element, fn: (inView: boolean) => void, rootMargin = '120px'): () => void {
  if (typeof IntersectionObserver !== 'function') {
    fn(true);
    return () => {};
  }
  const io = new IntersectionObserver(([entry]) => fn(Boolean(entry?.isIntersecting)), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

/** The secret maximum-rizz mode (wave 9 delight). Effects may turn themselves up when it's on. */
export function maxRizz(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.rizz === 'max';
}
