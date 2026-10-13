/**
 * PLATE // ORBITDESKTOP — “THE OBSERVATORY DESKTOP”
 * A 1984 beige CRT hangs in deep space like a sun; three tilted orbital rings carry
 * live window panes in front of and behind it (true occlusion via split masks).
 */
import { rng, r2, scope, standardDefs, starfield, linGrad, radGrad, label, svgRoot, rgba, tint, shade, BLEED, bleedRect } from '../svg-kit.js';

export default function orbitdesktopPlate(proj) {
  const id = scope('pl-orbit');
  const rand = rng(101);
  const W = 800;
  const H = 600;
  const cx = 400;
  const cy = 304;
  const spot = proj.spotInkHex; // vermilion
  const sec = proj.secondaryInkHex; // cobalt
  const tilt = -11;

  const rings = [
    { rx: 168, ry: 52, color: spot, w: 2.2, panes: 4, dur: 26, name: 'RING I · PRIMARY FOCUS' },
    { rx: 246, ry: 80, color: tint(sec, 0.25), w: 1.6, panes: 5, dur: 40, name: 'RING II · ACTIVE CONTEXT' },
    { rx: 322, ry: 108, color: 'rgba(214, 222, 240, 0.55)', w: 1.1, panes: 6, dur: 58, name: 'RING III · TELEMETRY' }
  ];

  const ellipsePath = (rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}Z`;

  // A tiny window pane (title bar + traffic lights + content lines), centred on 0,0.
  const pane = (ringIdx, k, color) => {
    const s = [1.0, 0.86, 0.74][ringIdx];
    const pw = 46 * s;
    const ph = 32 * s;
    const lines = [0.62, 0.84, 0.48]
      .map((f, i) => `<rect x="${r2(-pw / 2 + 5 * s)}" y="${r2(-ph / 2 + 12 * s + i * 5.5 * s)}" width="${r2((pw - 10 * s) * f)}" height="${r2(2.2 * s)}" fill="${rgba('#0b1020', 0.55)}"/>`)
      .join('');
    return `<g>
      <rect x="${r2(-pw / 2 + 2)}" y="${r2(-ph / 2 + 3)}" width="${r2(pw)}" height="${r2(ph)}" fill="#000" opacity="0.35"/>
      <rect x="${r2(-pw / 2)}" y="${r2(-ph / 2)}" width="${r2(pw)}" height="${r2(ph)}" fill="${tint('#f3ecdc', 0)}" stroke="${color}" stroke-width="1.1"/>
      <rect x="${r2(-pw / 2)}" y="${r2(-ph / 2)}" width="${r2(pw)}" height="${r2(8 * s)}" fill="${color}"/>
      ${[0, 1, 2].map((d) => `<circle cx="${r2(-pw / 2 + 4.5 * s + d * 4.5 * s)}" cy="${r2(-ph / 2 + 4 * s)}" r="${r2(1.4 * s)}" fill="#fff" opacity="0.85"/>`).join('')}
      ${lines}
      ${k % 2 === 0 ? `<rect x="${r2(pw / 2 - 14 * s)}" y="${r2(ph / 2 - 11 * s)}" width="${r2(9 * s)}" height="${r2(7 * s)}" fill="${rgba(color, 0.35)}"/>` : ''}
    </g>`;
  };

  // Panes animated along each ring. Rendered twice (back mask / front mask) for occlusion.
  const paneLayer = () =>
    rings
      .map((ring, ri) =>
        Array.from({ length: ring.panes }, (_, k) => {
          const begin = -(ring.dur * k) / ring.panes;
          const color = ri === 0 ? spot : ri === 1 ? sec : '#55607a';
          return `<g>${pane(ri, k, color)}<animateMotion dur="${ring.dur}s" begin="${r2(begin)}s" repeatCount="indefinite" path="${ellipsePath(ring.rx, ring.ry)}"/></g>`;
        }).join('')
      )
      .join('');

  const ringArc = (ring, front) =>
    front
      ? `M${cx + ring.rx} ${cy}A${ring.rx} ${ring.ry} 0 0 1 ${cx - ring.rx} ${cy}`
      : `M${cx - ring.rx} ${cy}A${ring.rx} ${ring.ry} 0 0 1 ${cx + ring.rx} ${cy}`;

  const ringStrokes = (front) =>
    rings
      .map(
        (ring) => `
        <path d="${ringArc(ring, front)}" fill="none" stroke="${ring.color}" stroke-width="${ring.w + 5}" opacity="${front ? 0.12 : 0.06}"/>
        <path d="${ringArc(ring, front)}" fill="none" stroke="${ring.color}" stroke-width="${ring.w}" opacity="${front ? 1 : 0.5}" ${front ? '' : 'stroke-dasharray="2 5"'}/>`
      )
      .join('');

  // --- The CRT "sun" -------------------------------------------------------------
  const crt = `
    <g class="orbit-crt">
      <ellipse cx="${cx}" cy="${cy + 92}" rx="86" ry="12" fill="#000" opacity="0.45" filter="${id.url('soft')}"/>
      <!-- pedestal -->
      <path d="M${cx - 34} ${cy + 64}L${cx + 34} ${cy + 64}L${cx + 48} ${cy + 88}L${cx - 48} ${cy + 88}Z" fill="${id.url('beige-dark')}"/>
      <rect x="${cx - 52}" y="${cy + 86}" width="104" height="7" rx="2" fill="${id.url('beige')}"/>
      <!-- casing -->
      <rect x="${cx - 92}" y="${cy - 84}" width="184" height="154" rx="16" fill="${id.url('beige')}"/>
      <rect x="${cx - 92}" y="${cy - 84}" width="184" height="154" rx="16" fill="none" stroke="#fff6e3" stroke-opacity="0.7" stroke-width="1.2"/>
      <rect x="${cx - 92}" y="${cy + 46}" width="184" height="24" rx="0" fill="${id.url('beige-dark')}" opacity="0.55"/>
      <!-- bezel + glass -->
      <rect x="${cx - 76}" y="${cy - 70}" width="152" height="112" rx="12" fill="#1b1a17"/>
      <rect x="${cx - 68}" y="${cy - 62}" width="136" height="96" rx="14" fill="${id.url('screen')}"/>
      <g clip-path="url(#${id('glass')})">
        <!-- miniature orbital desktop on the screen -->
        <ellipse cx="${cx}" cy="${cy - 14}" rx="46" ry="15" fill="none" stroke="${tint(spot, 0.3)}" stroke-width="1.2" opacity="0.9"/>
        <ellipse cx="${cx}" cy="${cy - 14}" rx="60" ry="22" fill="none" stroke="#9ec5ff" stroke-width="0.8" opacity="0.6"/>
        <circle cx="${cx}" cy="${cy - 14}" r="9" fill="#ffd9a8" filter="${id.url('glow')}"/>
        <rect x="${cx - 52}" y="${cy - 26}" width="16" height="11" fill="#e8f1ff" opacity="0.9"/>
        <rect x="${cx + 34}" y="${cy - 8}" width="16" height="11" fill="${tint(spot, 0.4)}" opacity="0.95"/>
        <rect x="${cx - 8}" y="${cy + 2}" width="16" height="11" fill="#e8f1ff" opacity="0.8"/>
        <text x="${cx - 60}" y="${cy + 26}" font-family="IBM Plex Mono, monospace" font-size="7" fill="#bfe3ff" opacity="0.85">hermes&gt; ring.focus(1) ▌</text>
        <rect x="${cx - 68}" y="${cy - 62}" width="136" height="96" fill="${id.url('scan')}"/>
        <path d="M${cx - 68} ${cy - 62}h70l-40 96h-30z" fill="#fff" opacity="0.06"/>
      </g>
      <rect x="${cx - 68}" y="${cy - 62}" width="136" height="96" rx="14" fill="none" stroke="#000" stroke-opacity="0.6" stroke-width="2"/>
      <!-- badge + controls -->
      <rect x="${cx - 70}" y="${cy + 52}" width="40" height="8" rx="1" fill="${shade('#d9cfb8', 0.35)}"/>
      <text x="${cx - 50}" y="${cy + 58.5}" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="6" fill="#f3ecdc" letter-spacing="0.12em">ORBIT</text>
      ${[0, 1, 2, 3].map((i) => `<rect x="${cx + 18 + i * 12}" y="${cy + 53}" width="8" height="5" rx="1" fill="${shade('#d9cfb8', 0.3)}"/>`).join('')}
      <circle cx="${cx + 74}" cy="${cy + 56}" r="2.6" fill="${spot}" class="plate-blink" filter="${id.url('glow')}"/>
    </g>`;

  const defs = `
    ${standardDefs(id, { ink: '#000' })}
    ${radGrad(id('space'), [[0, '#1b2754'], [0.45, '#0b1230'], [1, '#03050d']], { cx: 400, cy: 290, r: 620, units: 'userSpaceOnUse' })}
    ${radGrad(id('halo'), [[0, '#ffe2b8', 0.5], [0.4, tint(spot, 0.2), 0.16], [1, spot, 0]], { r: 0.5 })}
    ${linGrad(id('beige'), [[0, '#efe6d0'], [0.55, '#d9cdb1'], [1, '#b5a582']])}
    ${linGrad(id('beige-dark'), [[0, '#c3b391'], [1, '#8e7e5d']])}
    ${radGrad(id('screen'), [[0, '#2a4a7a'], [0.7, '#0e1d3a'], [1, '#060c18']], { cx: 0.45, cy: 0.4, r: 0.8 })}
    <clipPath id="${id('glass')}"><rect x="${cx - 68}" y="${cy - 62}" width="136" height="96" rx="14"/></clipPath>
    <mask id="${id('back')}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="1000">
      <rect x="-200" y="-200" width="1200" height="${cy + 200}" fill="#fff"/>
    </mask>
    <mask id="${id('front')}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="1000">
      <rect x="-200" y="${cy}" width="1200" height="800" fill="#fff"/>
    </mask>`;

  // Nebulae: soft, blurred ink clouds in the two spot inks.
  const nebula = `
    <g filter="${id.url('soft')}" opacity="0.55">
      <ellipse cx="-60" cy="420" rx="220" ry="90" fill="#7c3aed" opacity="0.22"/>
      <ellipse cx="150" cy="150" rx="190" ry="90" fill="${sec}" opacity="0.45" transform="rotate(-18 150 150)"/>
      <ellipse cx="660" cy="470" rx="210" ry="80" fill="${spot}" opacity="0.32" transform="rotate(-12 660 470)"/>
      <ellipse cx="640" cy="130" rx="120" ry="60" fill="#7c3aed" opacity="0.25"/>
    </g>`;

  const body = `
    ${bleedRect(id.url('space'))}
    ${nebula}
    <g>${starfield(rand, { ...BLEED, n: 420, maxR: 1.5, twinkleClass: 'plate-twinkle' })}</g>
    ${bleedRect(id.url('halftone'), 'opacity="0.08"')}
    <circle cx="${cx}" cy="${cy - 6}" r="250" fill="${id.url('halo')}"/>

    <g transform="rotate(${tilt} ${cx} ${cy})">
      ${ringStrokes(false)}
      <g mask="url(#${id('back')})" opacity="0.72">${paneLayer()}</g>
    </g>

    ${crt}

    <g transform="rotate(${tilt} ${cx} ${cy})">
      ${ringStrokes(true)}
      <g mask="url(#${id('front')})">${paneLayer()}</g>
    </g>

    <!-- engineering callouts -->
    <g>
      <path d="M128 448 L168 412" stroke="${spot}" stroke-width="0.8"/>
      ${label(70, 462, rings[0].name, { size: 9.5, fill: tint(spot, 0.35) })}
      <path d="M676 186 L640 214" stroke="#9ec5ff" stroke-width="0.8"/>
      ${label(612, 178, rings[1].name, { size: 9.5, fill: '#bcd6ff' })}
      ${label(400, 112, 'Δt 16.6 ms · SPRING-DAMPED FOCUS CAMERA', { size: 9, fill: 'rgba(240,236,226,0.7)', anchor: 'middle' })}
      <path d="M260 122 H540" stroke="rgba(240,236,226,0.25)" stroke-width="0.6"/>
      ${label(400, 506, rings[2].name + ' · 14 PANES · UNIX-SOCKET IPC', { size: 9, fill: 'rgba(214,222,240,0.7)', anchor: 'middle' })}
    </g>
`;

  return {
    title: 'The Observatory Desktop',
    svg: svgRoot({ w: W, h: H, title: `${proj.title} plate: a CRT sun orbited by three rings of window panes`, defs, body })
  };
}
