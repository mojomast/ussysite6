/**
 * Wave 9 effects loader. One entry for the whole layer: publish the capability tier, then
 * lazy-load each area once the page is idle, so no effect delays first paint or the
 * page-turn view transition. Each area module exports `init(): void | (() => void)` and owns
 * its own gating via ./capability.
 */
import { startCapability } from './capability';

startCapability();

const areas: Array<[string, () => Promise<{ init: () => void | (() => void) }>]> = [
  ['type', () => import('./type')],
  ['cursor', () => import('./cursor')],
  ['transitions', () => import('./transitions')],
  ['scrolly', () => import('./scrolly')],
  ['delight', () => import('./delight')],
  ['shader', () => import('./shader')]
];

const idle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 1200 });
  else setTimeout(fn, 200);
};

idle(() => {
  for (const [name, load] of areas) {
    load()
      .then((mod) => mod.init())
      .catch((err) => {
        // An effect failing must never take the reading down with it.
        if (import.meta.env.DEV) console.warn(`[fx] ${name} failed to start`, err);
      });
  }
});
