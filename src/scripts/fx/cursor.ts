/** Wave 9 · cursor. Owned by the cursor track; see DESIGN.md §9. */
import { fxTier } from './capability';

export function init(): void | (() => void) {
  if (fxTier() === 'off') return;
}
