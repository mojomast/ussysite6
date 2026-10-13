/**
 * PLATE // COCS — “THE REWOUND COLOSSEUM”
 * 60Hz server-authoritative arena netcode: isometric hex-grid arena floor at night,
 * two stylized vector combatants, a golden hitscan beam striking a 250ms rewound
 * historical hitbox ghost trail, and a 60Hz tick timeline ruler.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba, makeIso, isoBoxSvg
} from '../svg-kit.js';

export default function cocsPlate(proj) {
  const id = scope('pl-cocs');
  const rand = rng(104);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #e11d48 Signal Magenta-Red
  const sec = proj.secondaryInkHex; // #1d4ed8 Blueprint Cobalt

  const iso = makeIso({ ox: 400, oy: 360, sx: 0.866, sy: 0.42 });

  const defs = `
    ${standardDefs(id, { ink: '#0a0a14', dot: 0.75, gap: 5 })}
    ${radGrad(id('arena-glow'), [[0, '#38bdf8', 0.25], [0.45, '#1d4ed8', 0.12], [1, '#050714', 0]], { cx: 400, cy: 330, r: 350, units: 'userSpaceOnUse' })}
    ${radGrad(id('hit-burst'), [[0, '#ffffff', 1], [0.35, '#facc15', 0.85], [0.7, '#e11d48', 0.4], [1, '#000000', 0]], { cx: 520, cy: 260, r: 85, units: 'userSpaceOnUse' })}
    ${linGrad(id('arena-sky'), [[0, '#03050d'], [0.4, '#0a0f24'], [0.85, '#141b3d'], [1, '#080c1c']], { x1: 0, y1: BLEED.y, x2: 0, y2: 300, units: 'userSpaceOnUse' })}
    ${linGrad(id('hex-plate'), [[0, '#1a2238'], [0.6, '#0f172a'], [1, '#080d1a']])}
    ${linGrad(id('timeline-bg'), [[0, 'rgba(15,23,42,0.95)'], [1, 'rgba(8,13,26,0.95)']])}
    <filter id="${id('beam-bloom')}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. Isometric Hexagonal Arena Grid
  const hexTiles = [];
  const hexRadius = 42;
  const hrX = hexRadius * 1.732;
  const hrY = hexRadius * 1.5;

  for (let q = -4; q <= 4; q++) {
    for (let r = -3; r <= 3; r++) {
      if (Math.abs(q + r) > 4) continue;
      const hx = 400 + q * hrX + (r % 2) * (hrX / 2);
      const hy = 340 + r * hrY * 0.45;
      const corners = [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3 + Math.PI / 6;
        return [hx + Math.cos(a) * hexRadius, hy + Math.sin(a) * (hexRadius * 0.45)];
      });
      const isAttackerHex = Math.hypot(hx - 240, hy - 360) < 50;
      const isDefenderHex = Math.hypot(hx - 580, hy - 250) < 60;
      const strokeCol = isAttackerHex ? spot : isDefenderHex ? '#38bdf8' : '#334155';
      const strokeOp = isAttackerHex || isDefenderHex ? 0.9 : 0.25;
      hexTiles.push(`
        <polygon points="${corners.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ')}" fill="${id.url('hex-plate')}" stroke="${strokeCol}" stroke-opacity="${strokeOp}" stroke-width="${isAttackerHex || isDefenderHex ? 1.5 : 0.8}"/>
        <circle cx="${r2(hx)}" cy="${r2(hy)}" r="1.5" fill="${strokeCol}" opacity="${strokeOp * 0.8}"/>
      `);
    }
  }

  // 2. Attacker (Red/Magenta Mecha at x:240, y:355)
  const attacker = `
    <g class="combatant-attacker" transform="translate(240, 355)">
      <!-- Drop Shadow -->
      <ellipse cx="0" cy="15" rx="38" ry="14" fill="#000" opacity="0.65" filter="${id.url('soft')}"/>
      <!-- Current Server Hitbox (solid magenta AABB) -->
      <rect x="-24" y="-72" width="48" height="78" rx="4" fill="rgba(225,29,72,0.12)" stroke="${spot}" stroke-width="2.2"/>
      <rect x="-20" y="-68" width="40" height="70" rx="2" fill="none" stroke="${spot}" stroke-dasharray="2 3" stroke-width="0.8"/>
      <!-- Mecha Body Pedestal -->
      <path d="M-14 -10 L14 -10 L18 6 L-18 6 Z" fill="#4c0519" stroke="${spot}" stroke-width="1.2"/>
      <rect x="-10" y="-42" width="20" height="34" rx="3" fill="#881337" stroke="#fda4af" stroke-width="1"/>
      <ellipse cx="0" cy="-52" rx="9" ry="8" fill="#e11d48"/>
      <!-- Visor LED -->
      <rect x="-6" y="-54" width="12" height="4" fill="#facc15" filter="${id.url('glow')}"/>
      <!-- Laser Railgun Assembly -->
      <rect x="6" y="-40" width="34" height="6" rx="2" fill="#1e293b" stroke="#fda4af" stroke-width="1"/>
      <circle cx="40" cy="-37" r="4" fill="#facc15" filter="${id.url('glow')}"/>
      <!-- Label -->
      <text x="0" y="28" font-family="IBM Plex Mono, monospace" font-size="7.5" font-weight="600" fill="#fda4af" text-anchor="middle">CLIENT A (TICK 4820)</text>
    </g>`;

  // 3. Defender (Blue/Cyan Mecha at Current Server Position x:580, y:230)
  const defenderCurrent = `
    <g class="combatant-defender-current" transform="translate(580, 230)">
      <!-- Current Server Hitbox (Target has moved here!) -->
      <ellipse cx="0" cy="15" rx="38" ry="14" fill="#000" opacity="0.5" filter="${id.url('soft')}"/>
      <rect x="-24" y="-72" width="48" height="78" rx="4" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3"/>
      <!-- Defender Silhouette -->
      <rect x="-10" y="-42" width="20" height="34" rx="3" fill="#0c4a6e" stroke="#7dd3fc" stroke-width="1"/>
      <ellipse cx="0" cy="-52" rx="9" ry="8" fill="#0284c7"/>
      <rect x="-6" y="-54" width="12" height="4" fill="#38bdf8" filter="${id.url('glow')}"/>
      <text x="0" y="28" font-family="IBM Plex Mono, monospace" font-size="7.5" font-weight="600" fill="#7dd3fc" text-anchor="middle">SERVER TICK POS (NOW)</text>
    </g>`;

  // 4. Historical Lag-Compensation Rewind Ghost Trail (t-250ms to t-50ms)
  const ghostTrail = [
    { x: 470, y: 310, t: 't-250ms', op: 0.18 },
    { x: 490, y: 295, t: 't-200ms', op: 0.28 },
    { x: 510, y: 280, t: 't-150ms', op: 0.42 },
    { x: 535, y: 260, t: 't-96ms [HIT!]', op: 0.85, hit: true },
    { x: 558, y: 245, t: 't-48ms', op: 0.55 }
  ].map((g) => `
    <g class="ghost-hitbox" transform="translate(${g.x}, ${g.y})">
      <!-- Translucent Rewound Hitbox Frame -->
      <rect x="-24" y="-72" width="48" height="78" rx="4" fill="${g.hit ? 'rgba(250,204,21,0.22)' : 'rgba(56,189,248,0.06)'}" stroke="${g.hit ? '#facc15' : '#38bdf8'}" stroke-width="${g.hit ? 2.5 : 1.2}" stroke-dasharray="${g.hit ? 'none' : '3 3'}" opacity="${g.op}"/>
      ${g.hit ? `
        <!-- Crosshair in struck hitbox -->
        <line x1="-12" y1="-33" x2="12" y2="-33" stroke="#facc15" stroke-width="1.8"/>
        <line x1="0" y1="-45" x2="0" y2="-21" stroke="#facc15" stroke-width="1.8"/>
        <circle cx="0" cy="-33" r="14" fill="none" stroke="#facc15" stroke-width="1" stroke-dasharray="2 3"/>
      ` : ''}
      <text x="0" y="18" font-family="IBM Plex Mono, monospace" font-size="6" font-weight="600" fill="${g.hit ? '#fde047' : '#7dd3fc'}" opacity="${g.op}" text-anchor="middle">${g.t}</text>
    </g>
  `).join('');

  // 5. Golden Hitscan Beam Striking Rewound Hitbox
  const hitscanBeam = `
    <!-- Laser Beam from Attacker Railgun (280, 318) to Ghost Hitbox at t-96ms (535, 227) -->
    <path d="M280 318 L535 227" stroke="#fde047" stroke-width="8" opacity="0.3" filter="url(#${id('beam-bloom')})"/>
    <path d="M280 318 L535 227" stroke="#facc15" stroke-width="3" opacity="0.85" filter="${id.url('glow')}"/>
    <path d="M280 318 L535 227" stroke="#ffffff" stroke-width="1.2" opacity="0.95"/>

    <!-- Hit Registration Spark Burst at Target -->
    <circle cx="535" cy="227" r="45" fill="${id.url('hit-burst')}" filter="${id.url('glow-lg')}"/>
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const len = 18 + (i % 2) * 12;
      return `<line x1="535" y1="227" x2="${r2(535 + Math.cos(a) * len)}" y2="${r2(227 + Math.sin(a) * len)}" stroke="#fff" stroke-width="1.5"/>`;
    }).join('')}`;

  // 6. 60Hz Server Tick Timeline Ruler (Bottom Panel)
  const timeline = `
    <g class="tick-timeline" transform="translate(100, 485)">
      <!-- Panel Box -->
      <rect x="0" y="0" width="600" height="52" rx="4" fill="${id.url('timeline-bg')}" stroke="#334155" stroke-width="1.2"/>
      <rect x="0" y="0" width="600" height="14" fill="#1e293b"/>
      <text x="12" y="10.5" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="#94a3b8" letter-spacing="0.1em">60HZ HISTORICAL HITBOX BUFFER (250MS / 15 TICKS)</text>
      <text x="588" y="10.5" font-family="IBM Plex Mono, monospace" font-size="7" fill="#38bdf8" text-anchor="end">RTT: 96MS · INTERPOLATION: CATMULL-ROM</text>

      <!-- Tick Marks from t-15 to t-0 -->
      ${Array.from({ length: 16 }, (_, i) => {
        const x = 25 + i * 36.5;
        const tickNo = 15 - i;
        const isStruck = tickNo === 6; // t-6 ticks ≈ 96ms
        const isCurrent = tickNo === 0;
        return `
          <line x1="${r2(x)}" y1="18" x2="${r2(x)}" y2="34" stroke="${isStruck ? '#facc15' : isCurrent ? '#38bdf8' : '#64748b'}" stroke-width="${isStruck || isCurrent ? 2 : 1}"/>
          <text x="${r2(x)}" y="44" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="${isStruck || isCurrent ? '700' : '400'}" fill="${isStruck ? '#fde047' : isCurrent ? '#38bdf8' : '#94a3b8'}" text-anchor="middle">-${tickNo}</text>
          ${isStruck ? `<circle cx="${r2(x)}" cy="22" r="3" fill="#facc15" filter="${id.url('glow')}"/>` : ''}
        `;
      }).join('')}
    </g>`;

  const body = `
    <!-- Arena Cyber Night Sky -->
    ${bleedRect(id.url('arena-sky'))}
    <!-- Halftone Scanlines -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.1"/>

    <!-- Arena Floodlight Radial Halo -->
    <circle cx="400" cy="330" r="350" fill="${id.url('arena-glow')}"/>

    <!-- Hexagonal Floor Grid -->
    <g class="hex-grid">${hexTiles.join('')}</g>

    <!-- Defender Past Ghost Trail (Lag Compensation) -->
    ${ghostTrail}

    <!-- Current Server Position Defender -->
    ${defenderCurrent}

    <!-- Attacker Mecha & Hitscan Beam -->
    ${attacker}
    ${hitscanBeam}

    <!-- Bottom 60Hz Timeline Ruler -->
    ${timeline}

    <!-- Technical Annotations -->
    ${label(400, 75, 'PLATE VI · “THE REWOUND COLOSSEUM”', { size: 9, fill: '#fda4af', plate: 'rgba(20,5,12,0.85)', pad: 5, anchor: 'middle' })}
    ${label(535, 175, 'HIT CONFIRMED AT t-96ms (TICK -6)', { size: 7.5, fill: '#fde047', plate: 'rgba(20,15,5,0.85)', pad: 4, anchor: 'middle' })}
    ${label(580, 195, 'MISSED SERVER TICKS (NO REWIND)', { size: 7, fill: '#94a3b8', anchor: 'middle' })}`;

  return {
    title: 'The Rewound Colosseum',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate VI: The Rewound Colosseum — 60Hz netcode with 250ms lag compensation hitbox rewind',
      defs,
      body
    })
  };
}
