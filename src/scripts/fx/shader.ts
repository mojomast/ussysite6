/** Wave 9 · shader. Owned by the shader track; see DESIGN.md §9. */
import { fxTier } from './capability';

export function init(): void | (() => void) {
  if (fxTier() === 'off') return;
}
