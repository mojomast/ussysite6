/**
 * Wave 9 · Typography track.
 * Orchestrates monospace decode/scramble, h2 split-char reveals, variable-font cursor
 * pressure waves, and sparing RGB-split/slice glitch across capability tiers.
 */
import type { FxTier } from './capability.ts';
import { fxTier, maxRizz, onTier } from './capability.ts';
import { initScramble } from './type/scramble.ts';
import { initCharReveals, restoreAllSplits } from './type/split.ts';
import { initPressure } from './type/pressure.ts';
import { initGlitch } from './type/glitch.ts';

export function init(): void | (() => void) {
  let activeTier: FxTier = 'off';
  let tearDownActive: (() => void) | null = null;

  const stopAll = () => {
    tearDownActive?.();
    tearDownActive = null;
    restoreAllSplits();
  };

  const startForTier = (tier: FxTier) => {
    if (tier === activeTier) return;
    stopAll();
    activeTier = tier;
    if (tier === 'off') return;

    const getTier = () => fxTier();
    const getRizz = () => maxRizz();

    // Scroll-triggered wght ink-press (press-in.ts) was cut in Taste Pass §10 because
    // animating font weight on headings as you scroll caused 1.508 CLS.
    const cleanups: Array<() => void> = [
      initGlitch(getTier, getRizz)
    ];

    // Per-glyph reveals promote dozens of layers per heading; phones composite them in time
    // they don't have, so lite keeps the one-shot press-in instead.
    // Decoding labels rewrite text every frame while they resolve, and on a wide page scrolling
    // keeps one decoding almost all the time; lite devices keep the plain labels.
    if (tier === 'full') {
      cleanups.push(initScramble(getTier, getRizz));
      cleanups.push(initCharReveals());
      cleanups.push(initPressure(getTier, getRizz));
    }

    tearDownActive = () => {
      for (let i = cleanups.length - 1; i >= 0; i--) {
        cleanups[i]();
      }
    };
  };

  const unsubTier = onTier(startForTier);

  return () => {
    unsubTier();
    stopAll();
    activeTier = 'off';
  };
}
