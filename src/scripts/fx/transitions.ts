/** Wave 9 · transitions. Owned by the transitions track; see DESIGN.md §9. */
import { fxTier } from './capability';

export function init(): void | (() => void) {
  if (fxTier() === 'off') return;
}
