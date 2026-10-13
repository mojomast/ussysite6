/**
 * USSYSITE6 // THE SLOP COMPUTING ANNUAL
 * SVG LITHOGRAPHY KIT
 *
 * Tiny, dependency-free helpers shared by every illustrated plate:
 *  - deterministic PRNG (plates render identically on every load)
 *  - isometric / dimetric projection + box-face builder
 *  - reusable <defs> (glows, halftone screens, gradients) scoped by a unique prefix
 *  - markup helpers that keep plate source code readable
 *
 * Every plate is a pure function returning an SVG string. All ids inside a plate MUST be
 * prefixed (use `scope()`), because many plates live inline in the same document.
 */

export const SVG_NS = 'http://www.w3.org/2000/svg';

/** Mulberry32 — small, fast, deterministic. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Round to 2 decimals so the markup stays compact. */
export const r2 = (n) => Math.round(n * 100) / 100;

/** Join [x,y] pairs into a points / path string. */
export const pts = (list) => list.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
export const poly = (list, attrs = '') => `<polygon points="${pts(list)}" ${attrs}/>`;
export const pathFrom = (list, close = false) =>
  'M' + list.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L') + (close ? ' Z' : '');

/** Escape text for safe inclusion inside SVG <text>. */
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Create an id-scoper: `const id = scope('cover'); id('sky') -> 'cover-sky'; url(id('sky'))`. */
export function scope(prefix) {
  const fn = (name) => `${prefix}-${name}`;
  fn.url = (name) => `url(#${prefix}-${name})`;
  return fn;
}

/** Hex -> rgba() helper. */
export function rgba(hex, a = 1) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Mix two hex colours (t=0 -> a, t=1 -> b). */
export function mix(a, b, t) {
  const pa = parseInt(a.replace('#', ''), 16);
  const pb = parseInt(b.replace('#', ''), 16);
  const ch = (s) => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [ar, ag, ab] = ch(pa);
  const [br, bg, bb] = ch(pb);
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}
export const shade = (hex, t) => mix(hex, '#000000', t);
export const tint = (hex, t) => mix(hex, '#ffffff', t);

/**
 * Isometric projector.
 *   iso = makeIso({ ox, oy, sx: 0.866, sy: 0.5, sz: 1 })
 *   iso(x, y, z) -> [screenX, screenY]
 * x axis runs right-down, y axis runs left-down, z is up.
 */
export function makeIso({ ox = 0, oy = 0, sx = 0.866, sy = 0.5, sz = 1, k = 1 } = {}) {
  return (x, y, z = 0) => [ox + (x - y) * sx * k, oy + (x + y) * sy * k - z * sz * k];
}

/**
 * Isometric box faces (top, left/front, right/front) as polygon point lists.
 * Visible faces for the projection above are: top (z+h), the y+d face and the x+w face.
 */
export function isoBox(iso, x, y, z, w, d, h) {
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const right = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)];
  return { top, left, right };
}

/** Render an iso box with three-tone shading + optional crisp edge highlight. */
export function isoBoxSvg(iso, [x, y, z, w, d, h], { top, left, right, edge = 'none', edgeW = 1, extra = '' } = {}) {
  const f = isoBox(iso, x, y, z, w, d, h);
  const st = edge === 'none' ? '' : `stroke="${edge}" stroke-width="${edgeW}" stroke-linejoin="round"`;
  return (
    poly(f.left, `fill="${left}" ${st} ${extra}`) +
    poly(f.right, `fill="${right}" ${st} ${extra}`) +
    poly(f.top, `fill="${top}" ${st} ${extra}`)
  );
}

/** Deterministic starfield. Pass x0/y0/w/h = BLEED to cover the bleed zone. */
export function starfield(rand, { x0 = 0, y0 = 0, w, h, n = 120, minR = 0.3, maxR = 1.4, color = '#fff8ea', twinkleClass = '' }) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rand() * w;
    const y = y0 + rand() * h;
    const r = minR + Math.pow(rand(), 3) * (maxR - minR);
    const o = 0.35 + rand() * 0.65;
    const tw = twinkleClass && rand() < 0.18 ? ` class="${twinkleClass}" style="animation-delay:${r2(rand() * 4)}s"` : '';
    out += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${color}" opacity="${r2(o)}"${tw}/>`;
    if (r > maxR * 0.78) {
      // diffraction spike on the brightest stars
      out += `<path d="M${r2(x - r * 4)} ${r2(y)}H${r2(x + r * 4)}M${r2(x)} ${r2(y - r * 4)}V${r2(y + r * 4)}" stroke="${color}" stroke-width="0.4" opacity="${r2(o * 0.7)}"/>`;
    }
  }
  return out;
}

/**
 * Standard defs every plate can opt into. Returns markup; reference with id.url('glow') etc.
 *  - glow / glow-lg: additive bloom for emissive parts
 *  - halftone: 45° dot screen in `ink`
 *  - hatch: 45° engraving hatch in `ink`
 *  - scan: CRT scanlines
 *  - vignette: radial darkening for the plate edges
 */
export function standardDefs(id, { ink = '#000000', dot = 0.9, gap = 5 } = {}) {
  return `
    <filter id="${id('glow')}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${id('glow-lg')}" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${id('soft')}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <pattern id="${id('halftone')}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <circle cx="${gap / 2}" cy="${gap / 2}" r="${dot}" fill="${ink}"/>
    </pattern>
    <pattern id="${id('hatch')}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="${ink}" stroke-width="0.7"/>
    </pattern>
    <pattern id="${id('scan')}" width="4" height="3" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#000" opacity="0.28"/>
    </pattern>
    <radialGradient id="${id('vignette')}" cx="50%" cy="50%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>`;
}

/** Linear gradient builder: grad(id, 'sky', [[0,'#000'],[1,'#fff']], {x1,y1,x2,y2}) */
export function linGrad(idName, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = '' } = {}) {
  const u = units ? ` gradientUnits="${units}"` : '';
  return `<linearGradient id="${idName}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${u}>${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</linearGradient>`;
}

export function radGrad(idName, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy, units = '' } = {}) {
  const u = units ? ` gradientUnits="${units}"` : '';
  const f = fx !== undefined ? ` fx="${fx}" fy="${fy}"` : '';
  return `<radialGradient id="${idName}" cx="${cx}" cy="${cy}" r="${r}"${f}${u}>${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</radialGradient>`;
}

/** Mono label with an optional dark plate behind it (technical-annotation style). */
export function label(x, y, text, { size = 10, fill = '#f8fafc', anchor = 'start', weight = 600, plate = '', pad = 4, ls = 0.06, family = 'IBM Plex Mono, monospace', extra = '' } = {}) {
  const t = esc(text);
  let bg = '';
  if (plate) {
    const wEst = t.length * size * 0.62 + pad * 2;
    const x0 = anchor === 'middle' ? x - wEst / 2 : anchor === 'end' ? x - wEst + pad : x - pad;
    bg = `<rect x="${r2(x0)}" y="${r2(y - size - pad / 2 + 1)}" width="${r2(wEst)}" height="${r2(size + pad + 1)}" rx="1.5" fill="${plate}"/>`;
  }
  return `${bg}<text x="${r2(x)}" y="${r2(y)}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}em" fill="${fill}" text-anchor="${anchor}" ${extra}>${t}</text>`;
}

/** A technical leader line with an elbow and a label — the "callout" of engineering drawings. */
export function callout(x1, y1, x2, y2, text, { color = '#f8fafc', size = 9, dir = 1, len = 40 } = {}) {
  const x3 = x2 + dir * len;
  return `<g class="plate-callout">
    <circle cx="${r2(x1)}" cy="${r2(y1)}" r="2.2" fill="none" stroke="${color}" stroke-width="1"/>
    <path d="M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}H${r2(x3)}" fill="none" stroke="${color}" stroke-width="0.8"/>
    ${label(dir > 0 ? x2 + 2 : x2 - 2, y2 - 4, text, { size, fill: color, anchor: dir > 0 ? 'start' : 'end' })}
  </g>`;
}

/**
 * Bleed zone. Plates use a 800×600 viewBox fitted with `meet`, so the full composition is
 * ALWAYS visible whatever the container's aspect (they range ~0.9:1 up to ~2:1). Anything
 * that should read as "background" (sky, paper, starfields, grids, ground) must extend over
 * this bleed rectangle so the extra room around the viewBox is filled instead of letterboxed.
 */
export const BLEED = { x: -400, y: -320, w: 1600, h: 1240 };
export const bleedRect = (fill, extra = '') =>
  `<rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${fill}" ${extra}/>`;

/** Wrap plate content into an SVG root (meet-fitted; see BLEED). */
export function svgRoot({ w = 800, h = 600, cls = 'plate-svg', title = '', desc = '', fit = 'xMidYMid meet', body, defs = '' }) {
  return `<svg xmlns="${SVG_NS}" class="${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${fit}" overflow="visible" role="img" aria-label="${esc(title)}">
    ${title ? `<title>${esc(title)}</title>` : ''}${desc ? `<desc>${esc(desc)}</desc>` : ''}
    <defs>${defs}</defs>
    ${body}
  </svg>`;
}

/** Corner registration marks + a tiny colour bar, drawn inside a plate for the print feel. */
export function printersMarks(w, h, { color = 'rgba(255,255,255,0.55)', inset = 14 } = {}) {
  const m = (x, y) =>
    `<g stroke="${color}" stroke-width="0.8" fill="none"><circle cx="${x}" cy="${y}" r="5"/><path d="M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}"/></g>`;
  const bars = ['#009fe3', '#e6007e', '#ffed00', '#141311']
    .map((c, i) => `<rect x="${w - inset - 52 + i * 13}" y="${h - inset - 6}" width="11" height="6" fill="${c}" opacity="0.85"/>`)
    .join('');
  return `<g class="plate-marks" aria-hidden="true">${m(inset + 6, inset + 6)}${m(w - inset - 6, inset + 6)}${m(inset + 6, h - inset - 6)}${bars}</g>`;
}
