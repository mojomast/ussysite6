/**
 * Stock-aware color parsing & WCAG luminance helpers for the shader track.
 * Kept DOM-optional so Node unit tests can import and verify it directly.
 */
export type RGB = [number, number, number];

export interface StockPalette {
  bg: RGB;
  ink: RGB;
  cyan: RGB;
  gilt: RGB;
  isLight: boolean;
  stock: string;
}

export const FALLBACK_PALETTE: StockPalette = {
  bg: [0x0b / 255, 0x0c / 255, 0x0e / 255],
  ink: [0xff / 255, 0x5a / 255, 0x3c / 255],
  cyan: [0x22 / 255, 0xf3 / 255, 0xe6 / 255],
  gilt: [0xe8 / 255, 0xc3 / 255, 0x6a / 255],
  isLight: false,
  stock: 'graphite'
};

/** Parse `#rgb`, `#rrggbb`, `rgb(...)`, or `rgba(...)` into normalized `[0..1]` sRGB. */
export function parseCssColor(raw: string, fallback: RGB = FALLBACK_PALETTE.bg): RGB {
  const s = (raw || '').trim();
  if (!s) return [...fallback] as RGB;

  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return [r / 255, g / 255, b / 255];
      }
    } else if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return [r / 255, g / 255, b / 255];
      }
    }
    return [...fallback] as RGB;
  }

  const m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) {
    const r = Math.min(255, Math.max(0, Number(m[1])));
    const g = Math.min(255, Math.max(0, Number(m[2])));
    const b = Math.min(255, Math.max(0, Number(m[3])));
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return [r / 255, g / 255, b / 255];
    }
  }

  return [...fallback] as RGB;
}

/** WCAG 2.1 relative luminance for normalized sRGB `[0..1]`. */
export function relativeLuminance([r, g, b]: RGB): number {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.1 contrast ratio between two normalized sRGB colors. */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function lerpRgb(out: RGB, a: RGB, b: RGB, t: number): void {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
}

/** Read computed paper-stock colors from `<html>`. */
export function readStockPalette(el: Element | null = typeof document !== 'undefined' ? document.documentElement : null): StockPalette {
  if (!el || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
    return {
      bg: [...FALLBACK_PALETTE.bg],
      ink: [...FALLBACK_PALETTE.ink],
      cyan: [...FALLBACK_PALETTE.cyan],
      gilt: [...FALLBACK_PALETTE.gilt],
      isLight: FALLBACK_PALETTE.isLight,
      stock: FALLBACK_PALETTE.stock
    };
  }
  const cs = window.getComputedStyle(el);
  const bg = parseCssColor(cs.getPropertyValue('--bg-canvas'), FALLBACK_PALETTE.bg);
  const ink = parseCssColor(cs.getPropertyValue('--proof-ink'), FALLBACK_PALETTE.ink);
  const cyan = parseCssColor(cs.getPropertyValue('--neon-cyan'), FALLBACK_PALETTE.cyan);
  const gilt = parseCssColor(cs.getPropertyValue('--gilt'), FALLBACK_PALETTE.gilt);
  const stock = el.getAttribute('data-stock') || 'graphite';
  return {
    bg,
    ink,
    cyan,
    gilt,
    isLight: relativeLuminance(bg) > 0.45,
    stock
  };
}
