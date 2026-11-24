/** Wave 9 · delight. Owned by the delight track; see DESIGN.md §9. */
import { fxTier } from './capability';

export function init(): void | (() => void) {
  if (fxTier() === 'off') return;
}
