/**
 * Wave 9 · shader track entry.
 *
 * Mounts the full-viewport "Ink in Water" living backdrop and raster plate hover displacement
 * ONLY in the 'full' tier on fine pointers. Lite and off tiers keep the static CSS fallback
 * and film grain with zero canvases and zero Three.js imports.
 */
import { onTier, type FxTier } from './capability';
import { mountInkBackdrop } from './shader/ink-backdrop';
import { mountPlateHover } from './shader/plate-hover';

export function init(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  let teardownBackdrop: (() => void) | null = null;
  let teardownPlates: (() => void) | null = null;

  const stop = () => {
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

    if (!teardownBackdrop) {
      const host = document.querySelector<HTMLElement>('[data-fx-backdrop]');
      if (host) teardownBackdrop = mountInkBackdrop(host);
    }

    if (!teardownPlates) {
      teardownPlates = mountPlateHover();
    }
  };

  const unsubTier = onTier(applyTier);

  return () => {
    unsubTier();
    stop();
  };
}
