/**
 * Pure math and classification helpers for the Wave 9 cursor & micro-interaction layer.
 * Kept DOM-free so they can be unit-tested directly under Node.
 */

export type CursorMode = 'default' | 'link' | 'loupe' | 'caret' | 'input';
export type CursorTone = 'ink' | 'signal' | 'gold';

export interface CursorContextResult {
  mode: CursorMode;
  label: string;
  tone: CursorTone;
}

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface MagnetOptions {
  radius: number;
  maxX: number;
  maxY: number;
  rizz?: boolean;
}

export interface MagnetOffset {
  active: boolean;
  dx: number;
  dy: number;
}

export interface TiltResult {
  rx: number;
  ry: number;
  glareX: number;
  glareY: number;
}

export interface ElementProbe {
  isInput?: boolean;
  isCode?: boolean;
  isPlate?: boolean;
  isLinkOrButton?: boolean;
  explicitLabel?: string | null;
  href?: string | null;
  targetBlank?: boolean;
  text?: string;
  ariaLabel?: string;
  isAccentSignal?: boolean;
  isGilt?: boolean;
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Computes magnetic pull toward the pointer when within `radius` px of the element's box.
 * Under `rizz: true`, both attraction radius and pull magnitude scale up.
 */
export function computeMagnetOffset(
  pointerX: number,
  pointerY: number,
  rect: RectLike,
  opts: MagnetOptions
): MagnetOffset {
  if (rect.width <= 0 || rect.height <= 0) {
    return { active: false, dx: 0, dy: 0 };
  }

  const rizzMul = opts.rizz ? 1.85 : 1;
  const radius = opts.radius * (opts.rizz ? 1.4 : 1);

  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const rx = rect.width * 0.5;
  const ry = rect.height * 0.5;

  // Shortest distance from pointer to the element's outer box
  const outsideX = Math.max(0, Math.abs(pointerX - cx) - rx);
  const outsideY = Math.max(0, Math.abs(pointerY - cy) - ry);
  const edgeDist = Math.hypot(outsideX, outsideY);

  if (edgeDist > radius) {
    return { active: false, dx: 0, dy: 0 };
  }

  // Smooth quadratic falloff outside the element, full strength inside
  const proximity = edgeDist <= 0 ? 1 : 1 - edgeDist / radius;
  const falloff = proximity * (2 - proximity);

  const normX = clamp((pointerX - cx) / Math.max(1, rx + radius * 0.65), -1, 1);
  const normY = clamp((pointerY - cy) / Math.max(1, ry + radius * 0.65), -1, 1);

  return {
    active: true,
    dx: normX * opts.maxX * rizzMul * falloff,
    dy: normY * opts.maxY * rizzMul * falloff
  };
}

/**
 * Computes 3D perspective tilt angles (deg) and glare focal point (%) for a card or plate.
 */
export function computeTilt(
  pointerX: number,
  pointerY: number,
  rect: RectLike,
  maxDeg = 6
): TiltResult {
  if (rect.width <= 0 || rect.height <= 0) {
    return { rx: 0, ry: 0, glareX: 50, glareY: 50 };
  }
  const nx = clamp(((pointerX - rect.left) / rect.width) * 2 - 1, -1, 1);
  const ny = clamp(((pointerY - rect.top) / rect.height) * 2 - 1, -1, 1);
  return {
    rx: ny === 0 ? 0 : -ny * maxDeg,
    ry: nx === 0 ? 0 : nx * maxDeg,
    glareX: (nx + 1) * 50,
    glareY: (ny + 1) * 50
  };
}

const PLAY_RE = /\b(play|watch|opening|chord|flexi-disc|sound|audio|resume|lamp)\b|[▶◎♪]/i;
const OPEN_RE = /\b(open|repo|github|source|find|ask|grid|save|copy|back issues|all keys|close|clear)\b|↗/i;

/**
 * Maps an element's semantic cues to a cursor state (`READ` / `OPEN` / `PLAY`, loupe, caret, input).
 */
export function resolveCursorState(probe: ElementProbe): CursorContextResult {
  if (probe.isInput) {
    return { mode: 'input', label: '', tone: 'ink' };
  }

  if (probe.isLinkOrButton) {
    const explicit = probe.explicitLabel?.trim().toUpperCase();
    const combinedText = `${probe.text || ''} ${probe.ariaLabel || ''}`.trim();
    const href = (probe.href || '').trim();

    let label = explicit || '';
    if (!label) {
      if (PLAY_RE.test(combinedText) || href.includes('#opening')) {
        label = 'PLAY';
      } else if (
        probe.targetBlank ||
        /^https?:\/\//i.test(href) ||
        href.includes('/source-room') ||
        OPEN_RE.test(combinedText)
      ) {
        label = 'OPEN';
      } else {
        label = 'READ';
      }
    }

    const tone: CursorTone =
      probe.isGilt ? 'gold' : label === 'PLAY' || probe.isAccentSignal ? 'signal' : 'ink';

    return { mode: 'link', label, tone };
  }

  if (probe.isCode) {
    return { mode: 'caret', label: 'SRC', tone: 'signal' };
  }

  if (probe.isPlate) {
    return { mode: 'loupe', label: '×4', tone: 'gold' };
  }

  return { mode: 'default', label: '', tone: 'ink' };
}

/**
 * Simple timestamp rate limiter for opt-in sound cues.
 */
export function createRateLimiter(minIntervalMs: number): (now: number) => boolean {
  let last = -Infinity;
  return (now: number) => {
    if (now - last < minIntervalMs) return false;
    last = now;
    return true;
  };
}
