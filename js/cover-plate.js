/**
 * USSYSITE6 // THE SLOP COMPUTING ANNUAL
 * PLATE I — “THE ELEVEN-BUS ARCHIPELAGO” (front cover lithograph)
 *
 * A Robert-Tinney-style airbrushed isometric scene, rendered as live inline SVG:
 *   striped synth sun + twin mountain ranges + starfield sky, an isometric ground grid,
 *   a four-tier motherboard ziggurat crowned by a gold SLOP processor and a floating
 *   crystal, and eleven project pedestals wired to the core with Manhattan-routed copper
 *   bus traces that carry animated data packets.
 *
 * Interaction: hover / focus / click a pedestal to probe it (readout) and jump to its spread.
 * Gentle pointer parallax shifts the sky layers.
 */
import { USSY_PROJECTS } from './projects.js';
import {
  rng, r2, scope, standardDefs, starfield, linGrad, radGrad, makeIso, isoBox, isoBoxSvg,
  poly, pts, esc, svgRoot, BLEED, bleedRect, tint, shade, rgba
} from './svg-kit.js';
import { watchPlateMotion } from './plates/index.js';

const W = 760;
const H = 540;
const HORIZON = 236;
const ORIGIN = { x: 380, y: 378 };
const NODE_R = 250; // ground units
const PED = 15; // pedestal half-size (ground units)

const shortTitle = (t) => t.split(' // ')[0];

function buildNodes() {
  const n = USSY_PROJECTS.length;
  return USSY_PROJECTS.map((proj, idx) => {
    const a = -Math.PI * 0.75 + (idx / n) * Math.PI * 2;
    const gx = Math.cos(a) * NODE_R;
    const gy = Math.sin(a) * NODE_R;
    return { proj, idx, gx, gy, depth: gx + gy };
  });
}

/** Manhattan-routed trace (ground coords) from the ziggurat base to a pedestal edge. */
function routeTrace(node, half) {
  const { gx, gy } = node;
  const sgn = (v) => (v < 0 ? -1 : 1);
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  if (Math.abs(gx) >= Math.abs(gy)) {
    const ys = clamp(gy * 0.45, half - 18);
    const s = [sgn(gx) * half, ys];
    const m = [gx, ys];
    const e = Math.abs(gy - ys) < 1 ? [gx - sgn(gx) * PED, gy] : [gx, gy - sgn(gy - ys) * PED];
    return Math.abs(gy - ys) < 1 ? [s, e] : [s, m, e];
  }
  const xs = clamp(gx * 0.45, half - 18);
  const s = [xs, sgn(gy) * half];
  const m = [xs, gy];
  const e = Math.abs(gx - xs) < 1 ? [gx, gy - sgn(gy) * PED] : [gx - sgn(gx - xs) * PED, gy];
  return Math.abs(gx - xs) < 1 ? [s, e] : [s, m, e];
}

/** Ridge line for a mountain silhouette across the bleed width. */
function ridge(rand, { y0, amp, step, x0 = BLEED.x, x1 = BLEED.x + BLEED.w }) {
  const out = [];
  let y = y0;
  for (let x = x0; x <= x1; x += step) {
    const peak = rand() < 0.22 ? -amp * (0.6 + rand() * 0.6) : 0;
    y = y0 + (rand() - 0.5) * amp * 0.7 + peak;
    out.push([x, y]);
  }
  return out;
}

export function buildCoverSvg() {
  const id = scope('cv');
  const rand = rng(1984);
  const iso = makeIso({ ox: ORIGIN.x, oy: ORIGIN.y, sx: 0.866, sy: 0.36 });
  const nodes = buildNodes();
  const sunX = 380;
  const sunY = HORIZON - 14;
  const sunR = 104;

  // ---------------------------------------------------------------- defs
  const sunBands = [];
  {
    // Classic striped sun: gaps get thicker toward the horizon.
    let y = sunY + 8;
    let gap = 1.6;
    while (y < sunY + sunR) {
      sunBands.push(`<rect x="${sunX - sunR - 2}" y="${r2(y)}" width="${sunR * 2 + 4}" height="${r2(gap)}" fill="#000"/>`);
      y += gap + 7 - Math.min(5, gap);
      gap += 1.05;
    }
  }

  const defs = `
    ${standardDefs(id, { ink: '#fff2d6', dot: 0.75, gap: 4 })}
    ${linGrad(id('sky'), [[0, '#03040d'], [0.42, '#0b1638'], [0.66, '#2e1a55'], [0.82, '#8e2f5e'], [0.93, '#e46a4a'], [1, '#ffcf86']], { x1: 0, y1: BLEED.y, x2: 0, y2: HORIZON, units: 'userSpaceOnUse' })}
    ${linGrad(id('ground'), [[0, '#2a1446'], [0.08, '#160f33'], [0.4, '#0a0f26'], [1, '#04060f']], { x1: 0, y1: HORIZON, x2: 0, y2: BLEED.y + BLEED.h, units: 'userSpaceOnUse' })}
    ${linGrad(id('sun'), [[0, '#fff7d1'], [0.35, '#ffd36b'], [0.7, '#ff8a3d'], [1, '#e8364f']], { x1: 0, y1: sunY - sunR, x2: 0, y2: sunY + sunR, units: 'userSpaceOnUse' })}
    ${radGrad(id('halo'), [[0, '#ffb35c', 0.55], [0.35, '#ff6a4a', 0.22], [1, '#ff3d6a', 0]], { cx: sunX, cy: sunY, r: 300, units: 'userSpaceOnUse' })}
    ${linGrad(id('mtn-far'), [[0, '#8a4a8c'], [0.35, '#4b2a6e'], [1, '#2a1a4c']], { x1: 0, y1: 150, x2: 0, y2: HORIZON, units: 'userSpaceOnUse' })}
    ${linGrad(id('mtn-near'), [[0, '#53306f'], [0.25, '#2a1847'], [1, '#160d2c']], { x1: 0, y1: 180, x2: 0, y2: HORIZON, units: 'userSpaceOnUse' })}
    ${linGrad(id('beam'), [[0, '#ffe8b0', 0], [0.55, '#ffd27a', 0.35], [1, '#fff3d0', 0.9]], { x1: 0, y1: 0, x2: 0, y2: 1 })}
    ${linGrad(id('reflect'), [[0, '#ffb35c', 0.55], [1, '#ff6a4a', 0]], { x1: 0, y1: HORIZON, x2: 0, y2: HORIZON + 150, units: 'userSpaceOnUse' })}
    ${linGrad(id('gold-top'), [[0, '#fff1b8'], [0.5, '#f6c453'], [1, '#c98a1c']], { x1: 0, y1: 0, x2: 1, y2: 1 })}
    ${linGrad(id('crystal-l'), [[0, '#e9fbff'], [1, '#5cc8ff']], { x1: 0, y1: 0, x2: 1, y2: 1 })}
    ${linGrad(id('crystal-r'), [[0, '#9fdcff'], [1, '#2257c9']], { x1: 0, y1: 0, x2: 1, y2: 1 })}
    ${linGrad(id('grid-fade'), [[0, '#fff', 0], [0.12, '#fff', 0.35], [0.5, '#fff', 1], [1, '#fff', 0.7]], { x1: 0, y1: HORIZON, x2: 0, y2: H + 60, units: 'userSpaceOnUse' })}
    <mask id="${id('sun-cut')}" maskUnits="userSpaceOnUse" x="${sunX - sunR - 10}" y="${sunY - sunR - 10}" width="${sunR * 2 + 20}" height="${sunR * 2 + 20}">
      <rect x="${sunX - sunR - 10}" y="${sunY - sunR - 10}" width="${sunR * 2 + 20}" height="${sunR * 2 + 20}" fill="#fff"/>
      ${sunBands.join('')}
    </mask>
    <mask id="${id('grid-mask')}" maskUnits="userSpaceOnUse" x="${BLEED.x}" y="${HORIZON}" width="${BLEED.w}" height="${BLEED.h}">
      <rect x="${BLEED.x}" y="${HORIZON}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('grid-fade')}"/>
    </mask>
    <clipPath id="${id('below')}"><rect x="${BLEED.x}" y="${HORIZON}" width="${BLEED.w}" height="${BLEED.h}"/></clipPath>
    <filter id="${id('packet')}" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="1.8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // ---------------------------------------------------------------- sky
  const far = ridge(rng(7), { y0: 206, amp: 44, step: 26 });
  const near = ridge(rng(11), { y0: 222, amp: 26, step: 18 });
  const mtnPath = (list) => `M${BLEED.x} ${HORIZON + 1} L${list.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L')} L${BLEED.x + BLEED.w} ${HORIZON + 1} Z`;
  // Snow/rim light on the far range — a thin lighter line along the ridge.
  const rim = `M${far.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L')}`;

  const sky = `
    ${bleedRect(id.url('sky'))}
    <g class="cv-parallax-far">
      <g>${starfield(rand, { x0: BLEED.x, y0: BLEED.y, w: BLEED.w, h: 180 - BLEED.y, n: 380, maxR: 1.5, twinkleClass: 'plate-twinkle' })}</g>
      <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${HORIZON - BLEED.y}" fill="${id.url('scan')}" opacity="0.5"/>
      <!-- airbrushed cloud bands -->
      <g filter="${id.url('soft')}" opacity="0.7">
        <ellipse cx="130" cy="150" rx="220" ry="10" fill="#ff7a8a" opacity="0.35"/>
        <ellipse cx="640" cy="132" rx="260" ry="8" fill="#ff9a6a" opacity="0.3"/>
        <ellipse cx="420" cy="176" rx="320" ry="7" fill="#ffd0a0" opacity="0.28"/>
      </g>
      <circle cx="${sunX}" cy="${sunY}" r="300" fill="${id.url('halo')}"/>
      <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${id.url('sun')}" mask="url(#${id('sun-cut')})"/>
      <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="url(#${id('halftone')})" opacity="0.18" mask="url(#${id('sun-cut')})"/>
    </g>
    <g class="cv-parallax-mid">
      <path d="${mtnPath(far)}" fill="${id.url('mtn-far')}"/>
      <path d="${rim}" fill="none" stroke="#ffb3a0" stroke-opacity="0.45" stroke-width="1"/>
      <path d="${mtnPath(near)}" fill="${id.url('mtn-near')}"/>
    </g>
    <rect x="${BLEED.x}" y="${HORIZON - 2}" width="${BLEED.w}" height="4" fill="#ffd9a0" opacity="0.8" filter="${id.url('glow')}"/>`;

  // ---------------------------------------------------------------- ground + iso grid
  let grid = '';
  const span = 900;
  for (let k = -span; k <= span; k += 40) {
    const a = iso(k, -span);
    const b = iso(k, span);
    const c = iso(-span, k);
    const d = iso(span, k);
    const major = k % 200 === 0;
    const sw = major ? 1 : 0.6;
    const op = major ? 0.55 : 0.3;
    grid += `<path d="M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}M${r2(c[0])} ${r2(c[1])}L${r2(d[0])} ${r2(d[1])}" stroke="#4cc9ff" stroke-width="${sw}" stroke-opacity="${op}"/>`;
  }
  const ground = `
    <rect x="${BLEED.x}" y="${HORIZON}" width="${BLEED.w}" height="${BLEED.y + BLEED.h - HORIZON}" fill="${id.url('ground')}"/>
    <ellipse cx="${sunX}" cy="${HORIZON + 40}" rx="70" ry="80" fill="${id.url('reflect')}" filter="${id.url('soft')}" opacity="0.8"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${sunX - 60 + i * 4}" y="${HORIZON + 6 + i * 11}" width="${120 - i * 8}" height="${1.4}" fill="#ffc07a" opacity="${r2(0.5 - i * 0.07)}"/>`).join('')}
    <g clip-path="url(#${id('below')})" mask="url(#${id('grid-mask')})">${grid}</g>`;

  // ---------------------------------------------------------------- traces
  const half = 84; // ziggurat base half-size
  const traces = nodes
    .map((n) => {
      const route = routeTrace(n, half).map(([x, y]) => iso(x, y, 0));
      const d = 'M' + route.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L');
      const pads = route
        .slice(1, -1)
        .map(([x, y]) => `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="3.4" ry="1.6" fill="#f6c453"/>`)
        .join('');
      const dur = 2.6 + (n.idx % 4) * 0.55;
      return `<g class="bus" data-idx="${n.idx}">
        <path d="${d}" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="4.5" stroke-linejoin="round"/>
        <path class="bus-trace" data-idx="${n.idx}" d="${d}" fill="none" stroke="#f6ad55" stroke-opacity="0.6" stroke-width="1.5" stroke-linejoin="round"/>
        ${pads}
        <circle r="2.6" fill="${tint(n.proj.spotInkHex, 0.35)}" filter="url(#${id('packet')})">
          <animateMotion dur="${dur}s" begin="${r2(-n.idx * 0.37)}s" repeatCount="indefinite" path="${d}"/>
        </circle>
      </g>`;
    })
    .join('');

  // ---------------------------------------------------------------- ziggurat
  const tiers = [
    { s: 168, h: 20, top: '#273a86', left: '#1a2560', right: '#0f1640' },
    { s: 132, h: 20, top: '#2d2f7a', left: '#1d1d58', right: '#11113a' },
    { s: 98, h: 20, top: '#33418e', left: '#20296a', right: '#141947' },
    { s: 64, h: 18, top: '#3a3a8c', left: '#252368', right: '#161444' }
  ];
  let z = 0;
  let zig = `<ellipse cx="${ORIGIN.x}" cy="${ORIGIN.y + 8}" rx="190" ry="62" fill="#000" opacity="0.55" filter="${id.url('soft')}"/>`;
  tiers.forEach((t, i) => {
    const o = -t.s / 2;
    zig += isoBoxSvg(iso, [o, o, z, t.s, t.s, t.h], { top: t.top, left: t.left, right: t.right });
    const f = isoBox(iso, o, o, z, t.s, t.s, t.h);
    // gold bevel along the visible top edges + faint vertical edge highlight
    zig += `<path d="M${pts([f.top[3], f.top[2], f.top[1]]).replace(/ /g, ' L')}" fill="none" stroke="#fbd38d" stroke-width="1.3" stroke-opacity="0.9"/>`;
    zig += `<path d="M${r2(f.left[1][0])} ${r2(f.left[1][1])}L${r2(f.left[2][0])} ${r2(f.left[2][1])}" stroke="#fbd38d" stroke-opacity="0.35" stroke-width="1"/>`;
    // circuit etching on the exposed ledge of this tier
    const next = tiers[i + 1];
    if (next) {
      const ledgeIn = next.s / 2 + 4;
      const ledgeOut = t.s / 2 - 4;
      const zt = z + t.h;
      for (let k = 0; k < 5; k++) {
        const along = -ledgeOut + 10 + k * ((ledgeOut * 2 - 20) / 4);
        const p1 = iso(along, ledgeIn, zt);
        const p2 = iso(along, ledgeOut, zt);
        const q1 = iso(ledgeIn, along, zt);
        const q2 = iso(ledgeOut, along, zt);
        zig += `<path d="M${r2(p1[0])} ${r2(p1[1])}L${r2(p2[0])} ${r2(p2[1])}M${r2(q1[0])} ${r2(q1[1])}L${r2(q2[0])} ${r2(q2[1])}" stroke="#f6c453" stroke-opacity="0.55" stroke-width="0.8"/>`;
        zig += `<circle cx="${r2(p2[0])}" cy="${r2(p2[1])}" r="1.3" fill="#ffe7a8"/><circle cx="${r2(q2[0])}" cy="${r2(q2[1])}" r="1.3" fill="#ffe7a8"/>`;
      }
      // a few status LEDs on the front faces
      for (let k = 0; k < 4; k++) {
        const along = -t.s / 2 + 16 + k * 14;
        const led = iso(along, t.s / 2, z + t.h * 0.5);
        const led2 = iso(t.s / 2, along, z + t.h * 0.5);
        const c = ['#4ade80', '#38bdf8', '#f472b6', '#facc15'][(k + i) % 4];
        zig += `<circle cx="${r2(led[0])}" cy="${r2(led[1])}" r="1.5" fill="${c}" ${k === i % 4 ? 'class="plate-blink"' : ''}/>`;
        zig += `<circle cx="${r2(led2[0])}" cy="${r2(led2[1])}" r="1.5" fill="${c}" opacity="0.8"/>`;
      }
    }
    z += t.h;
  });

  // Gold processor with pins + etched SLOP lettering in the iso top plane.
  const chipS = 40;
  const co = -chipS / 2;
  let chip = '';
  for (let k = 0; k < 6; k++) {
    const along = co + 4 + k * ((chipS - 8) / 5);
    chip += isoBoxSvg(iso, [along - 1.2, chipS / 2, z, 2.4, 5, 2], { top: '#ffe39a', left: '#c58a1f', right: '#9a6a12' });
    chip += isoBoxSvg(iso, [chipS / 2, along - 1.2, z, 5, 2.4, 2], { top: '#ffe39a', left: '#c58a1f', right: '#9a6a12' });
  }
  chip += isoBoxSvg(iso, [co, co, z, chipS, chipS, 7], { top: id.url('gold-top'), left: '#b77a14', right: '#8a5a0c', edge: '#fff2c0', edgeW: 0.6 });
  const zc = z + 7;
  const [tx, ty] = iso(0, 0, zc);
  chip += `<text transform="matrix(0.866 0.36 -0.866 0.36 ${r2(tx)} ${r2(ty)})" text-anchor="middle" dominant-baseline="middle" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="15" fill="#7a4a06" opacity="0.85">SLOP</text>`;
  const inner = isoBox(iso, -12, -12, zc, 24, 24, 0).top;
  chip += poly(inner, 'fill="none" stroke="#7a4a06" stroke-width="0.6" stroke-opacity="0.6"');

  // Light beam + floating crystal (octahedron) above the processor.
  const [bx, by] = iso(0, 0, zc);
  const crystalY = by - 74;
  const beam = `
    <g class="plate-pulse">
      <polygon points="${r2(bx - 16)},${r2(by)} ${r2(bx + 16)},${r2(by)} ${r2(bx + 5)},${r2(BLEED.y)} ${r2(bx - 5)},${r2(BLEED.y)}" fill="${id.url('beam')}" opacity="0.35"/>
      <ellipse cx="${r2(bx)}" cy="${r2(by)}" rx="22" ry="8" fill="#fff1c0" opacity="0.6" filter="${id.url('glow')}"/>
    </g>
    <g class="plate-float">
      <ellipse cx="${r2(bx)}" cy="${r2(crystalY)}" rx="34" ry="34" fill="#9fdcff" opacity="0.18" filter="${id.url('soft')}"/>
      <polygon points="${r2(bx)},${r2(crystalY - 30)} ${r2(bx - 15)},${r2(crystalY)} ${r2(bx)},${r2(crystalY + 6)}" fill="${id.url('crystal-l')}"/>
      <polygon points="${r2(bx)},${r2(crystalY - 30)} ${r2(bx + 15)},${r2(crystalY)} ${r2(bx)},${r2(crystalY + 6)}" fill="${id.url('crystal-r')}"/>
      <polygon points="${r2(bx - 15)},${r2(crystalY)} ${r2(bx)},${r2(crystalY + 6)} ${r2(bx)},${r2(crystalY + 30)}" fill="#3a7bd5"/>
      <polygon points="${r2(bx + 15)},${r2(crystalY)} ${r2(bx)},${r2(crystalY + 6)} ${r2(bx)},${r2(crystalY + 30)}" fill="#1c3f8f"/>
      <path d="M${r2(bx)} ${r2(crystalY - 30)}L${r2(bx - 15)} ${r2(crystalY)}L${r2(bx)} ${r2(crystalY + 30)}L${r2(bx + 15)} ${r2(crystalY)}Z" fill="none" stroke="#e9fbff" stroke-width="0.8" stroke-opacity="0.9"/>
      <circle cx="${r2(bx - 4)}" cy="${r2(crystalY - 14)}" r="2" fill="#fff" filter="${id.url('glow')}"/>
    </g>`;

  // ---------------------------------------------------------------- nodes
  const nodeSvg = (n) => {
    const spot = n.proj.spotInkHex;
    const { gx, gy } = n;
    const [sx, sy] = iso(gx, gy, 0);
    const [lx, ly] = iso(gx, gy, 30);
    const name = `#${n.proj.readerServiceNo} ${shortTitle(n.proj.title)}`;
    const lw = name.length * 5.9 + 12;
    const shadow = poly(isoBox(iso, gx - PED - 3, gy - PED - 3, 0, PED * 2 + 6, PED * 2 + 6, 0).top, 'fill="#000" opacity="0.5"');
    const base = isoBoxSvg(iso, [gx - PED, gy - PED, 0, PED * 2, PED * 2, 10], { top: '#1c2347', left: '#121734', right: '#0a0e22', edge: rgba(spot, 0.9), edgeW: 0.8 });
    const mod = isoBoxSvg(iso, [gx - 9, gy - 9, 10, 18, 18, 9], { top: tint(spot, 0.15), left: spot, right: shade(spot, 0.35), edge: tint(spot, 0.5), edgeW: 0.6 });
    const [dx, dy] = iso(gx, gy, 19);
    return `<g class="cover-node" data-idx="${n.idx}" tabindex="0" role="button" aria-label="${esc(`Reader service #${n.proj.readerServiceNo}: ${n.proj.title}, ${n.proj.pageRange}. Jump to spread.`)}">
      ${shadow}
      <g class="node-lift">
        <polygon class="node-beam" points="${r2(sx - 10)},${r2(sy)} ${r2(sx + 10)},${r2(sy)} ${r2(sx + 3)},${r2(sy - 150)} ${r2(sx - 3)},${r2(sy - 150)}" fill="${tint(spot, 0.4)}" opacity="0" style="mix-blend-mode:screen"/>
        ${base}${mod}
        <ellipse cx="${r2(dx)}" cy="${r2(dy)}" rx="5.5" ry="2.6" fill="#fff" opacity="0.9" filter="${id.url('glow')}"/>
        <ellipse cx="${r2(dx)}" cy="${r2(dy)}" rx="9" ry="4" fill="${tint(spot, 0.4)}" opacity="0.55" class="plate-pulse" style="animation-delay:${r2(n.idx * 0.21)}s"/>
      </g>
      <g transform="translate(${r2(sx)} ${r2(sy + 24)})">
        <rect class="node-label-plate" x="${r2(-lw / 2)}" y="-9" width="${r2(lw)}" height="14" rx="2" fill="rgba(6,9,22,0.82)" stroke="${rgba(spot, 0.9)}" stroke-width="0.8"/>
        <rect x="${r2(-lw / 2)}" y="-9" width="3" height="14" fill="${spot}"/>
        <text class="node-label-text" x="1.5" y="1.5" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" font-weight="600" fill="#f4efe4">${esc(name)}</text>
      </g>
      <circle cx="${r2(lx)}" cy="${r2((ly + sy) / 2)}" r="26" fill="transparent"/>
    </g>`;
  };

  const back = nodes.filter((n) => n.depth < 0).sort((a, b) => a.depth - b.depth);
  const front = nodes.filter((n) => n.depth >= 0).sort((a, b) => a.depth - b.depth);

  // Foreground motes drifting over the scene.
  const motes = Array.from({ length: 26 }, () => {
    const x = 20 + rand() * (W - 40);
    const y = HORIZON + 20 + rand() * (H - HORIZON - 30);
    return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(0.6 + rand() * 1.1)}" fill="#bfe9ff" opacity="${r2(0.25 + rand() * 0.5)}" class="plate-twinkle" style="animation-delay:${r2(rand() * 4)}s"/>`;
  }).join('');

  const body = `
    ${sky}
    ${ground}
    <g class="cv-traces">${traces}</g>
    <g class="cv-nodes-back">${back.map(nodeSvg).join('')}</g>
    <g class="cv-core">${zig}${chip}${beam}</g>
    <g class="cv-nodes-front">${front.map(nodeSvg).join('')}</g>
    <g>${motes}</g>
    <text x="${W - 18}" y="${HORIZON + 22}" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="0.18em" fill="#ffd9a0" opacity="0.7">BUS CLOCK 60.0 HZ · 11 NODES</text>
    <text x="18" y="${HORIZON + 22}" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="0.18em" fill="#ffd9a0" opacity="0.7">PLATE I · AIRBRUSH ON VECTOR</text>`;

  return svgRoot({
    w: W,
    h: H,
    cls: 'cover-svg',
    title: 'The Eleven-Bus Archipelago: an isometric motherboard ziggurat under a striped synth sun, wired to eleven project pedestals',
    defs,
    body
  });
}

export function initCoverPlate(host, readoutEl, onSelectNode) {
  if (!host) return;
  host.innerHTML = buildCoverSvg();
  const svg = host.querySelector('svg');
  if (!svg) return;
  watchPlateMotion(svg);

  const idle = 'BUS CLOCK: 60.0 HZ // 11 NODES ONLINE';
  const nodeEls = [...svg.querySelectorAll('.cover-node')];
  const traceEls = [...svg.querySelectorAll('.bus-trace')];

  const setHot = (idx) => {
    nodeEls.forEach((el) => el.classList.toggle('is-hot', Number(el.dataset.idx) === idx));
    traceEls.forEach((el) => el.classList.toggle('is-hot', Number(el.dataset.idx) === idx));
    if (!readoutEl) return;
    if (idx >= 0) {
      const p = USSY_PROJECTS[idx];
      readoutEl.textContent = `NODE #${p.readerServiceNo}: ${shortTitle(p.title).toUpperCase()} (${p.pageRange})`;
    } else {
      readoutEl.textContent = idle;
    }
  };

  nodeEls.forEach((el) => {
    const idx = Number(el.dataset.idx);
    el.addEventListener('pointerenter', () => setHot(idx));
    el.addEventListener('pointerleave', () => setHot(-1));
    el.addEventListener('focus', () => setHot(idx));
    el.addEventListener('blur', () => setHot(-1));
    const go = () => onSelectNode && onSelectNode(USSY_PROJECTS[idx].id);
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });

  // Gentle pointer parallax on the sky layers.
  const far = svg.querySelector('.cv-parallax-far');
  const mid = svg.querySelector('.cv-parallax-mid');
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && far && mid) {
    let raf = 0;
    host.addEventListener('pointermove', (e) => {
      const rect = host.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        far.setAttribute('transform', `translate(${r2(nx * -10)} ${r2(ny * -4)})`);
        mid.setAttribute('transform', `translate(${r2(nx * -5)} ${r2(ny * -2)})`);
      });
    });
    host.addEventListener('pointerleave', () => {
      far.removeAttribute('transform');
      mid.removeAttribute('transform');
    });
  }
}
