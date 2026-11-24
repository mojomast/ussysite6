/**
 * Pure key-sequence detector for Wave 9 delight easter eggs.
 * Detects the Konami code, "rizz", and "proof" without colliding with
 * PressControls shortcuts (j, k, [, ], ?, /, u-s-s-y) and ignores editable targets.
 */

export type DelightAction = 'rizz' | 'proof';

export interface EditableTargetLike {
  tagName?: string;
  isContentEditable?: boolean;
  getAttribute?: (name: string) => string | null;
  closest?: (selector: string) => unknown;
}

export interface KeyEventLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
  target?: EditableTargetLike | null;
}

export const KONAMI_SEQUENCE: readonly string[] = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a'
];

export const RIZZ_SEQUENCE: readonly string[] = ['r', 'i', 'z', 'z'];
export const PROOF_SEQUENCE: readonly string[] = ['p', 'r', 'o', 'o', 'f'];

const IGNORED_MODIFIERS = new Set(['shift', 'control', 'alt', 'meta', 'capslock', 'dead']);
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

export function isEditableTarget(target: EditableTargetLike | null | undefined): boolean {
  if (!target) return false;
  const tag = typeof target.tagName === 'string' ? target.tagName.toUpperCase() : '';
  if (EDITABLE_TAGS.has(tag)) return true;
  if (target.isContentEditable === true) return true;
  if (typeof target.getAttribute === 'function') {
    const ce = target.getAttribute('contenteditable');
    if (ce === '' || ce === 'true' || ce === 'plaintext-only') return true;
  }
  if (typeof target.closest === 'function' && target.closest(EDITABLE_SELECTOR)) return true;
  return false;
}

function endsWithSequence(buffer: readonly string[], seq: readonly string[]): boolean {
  if (buffer.length < seq.length) return false;
  const offset = buffer.length - seq.length;
  for (let i = 0; i < seq.length; i++) {
    if (buffer[offset + i] !== seq[i]) return false;
  }
  return true;
}

export interface SequenceDetectorOptions {
  timeoutMs?: number;
}

export interface SequenceDetector {
  push: (event: KeyEventLike, now?: number) => DelightAction | null;
  reset: () => void;
}

export function createSequenceDetector(options: SequenceDetectorOptions = {}): SequenceDetector {
  const timeoutMs = options.timeoutMs ?? 2500;
  let buffer: string[] = [];
  let lastTimestamp = 0;

  function reset(): void {
    buffer = [];
    lastTimestamp = 0;
  }

  function push(event: KeyEventLike, now = Date.now()): DelightAction | null {
    if (!event || typeof event.key !== 'string') return null;
    if (event.ctrlKey || event.metaKey || event.altKey) return null;
    if (event.repeat) return null;
    if (isEditableTarget(event.target)) return null;

    const normalized = event.key.toLowerCase();
    if (!normalized || IGNORED_MODIFIERS.has(normalized)) return null;

    if (lastTimestamp > 0 && now - lastTimestamp > timeoutMs) {
      buffer = [];
    }
    lastTimestamp = now;

    buffer.push(normalized);
    if (buffer.length > KONAMI_SEQUENCE.length + 2) {
      buffer = buffer.slice(-(KONAMI_SEQUENCE.length + 2));
    }

    if (endsWithSequence(buffer, KONAMI_SEQUENCE) || endsWithSequence(buffer, RIZZ_SEQUENCE)) {
      reset();
      return 'rizz';
    }

    if (endsWithSequence(buffer, PROOF_SEQUENCE)) {
      reset();
      return 'proof';
    }

    return null;
  }

  return { push, reset };
}
