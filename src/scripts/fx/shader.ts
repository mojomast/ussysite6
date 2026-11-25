/**
 * Wave 9 · shader track entry.
 *
 * Lazily imports and mounts the full-viewport "Ink in Water" living backdrop and raster plate
 * hover displacement ONLY in the 'full' tier on fine pointers. Lite and off tiers keep the
 * static CSS fallback and film grain with zero canvases and zero shader module downloads.
 */
import { onTier, type FxTier } from './capability';

export function init(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  let gen = 0;
  let teardownBackdrop: (() => void) | null = null;
  let teardownPlates: (() => void) | null = null;

  const stop = () => {
    gen++;
    teardownBackdrop?.();
    teardownBackdrop = null;
    teardownPlates?.();
    teardownPlates = null;
  };

  const applyTier = (tier: FxTier) => {
    const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
    if (tier !== 'full' || !finePointer) {
      stop();
      return;
    }

    const token = ++gen;
    const host = document.querySelector<HTMLElement>('[data-fx-backdrop]');

    if (host && !teardownBackdrop) {
      void import('./shader/ink-backdrop').then(({ mountInkBackdrop }) => {
        if (token !== gen || teardownBackdrop) return;
        teardownBackdrop = mountInkBackdrop(host);
      });
    }

    if (!teardownPlates) {
      void import('./shader/plate-hover').then(({ mountPlateHover }) => {
        if (token !== gen || teardownPlates) return;
        teardownPlates = mountPlateHover();
      });
    }
  };

  const unsubTier = onTier(applyTier);

  return () => {
    unsubTier();
    stop();
  };
}
