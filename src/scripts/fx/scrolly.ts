/** Wave 9 · scrolly. Owned by the scrolly track; see DESIGN.md §9. */
import { fxTier } from './capability';

export function init(): void | (() => void) {
  if (fxTier() === 'off') return;
}
