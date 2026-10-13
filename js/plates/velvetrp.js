/**
 * PLATE // VELVETRP — “THE ORACLE AT DUSK”
 * A literary roleplay sanctum: an open illuminated folio with calligraphic text,
 * a brass 6-segment astronomical world clock, two glossy dodecahedral d12 dice
 * resting on dark bordeaux velvet, an inkwell with goose quill, and warm candlelight.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba
} from '../svg-kit.js';

export default function velvetrpPlate(proj) {
  const id = scope('pl-vrp');
  const rand = rng(102);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #9b1b30 Bordeaux
  const sec = proj.secondaryInkHex; // #b45309 Warm Ochre

  const defs = `
    ${standardDefs(id, { ink: '#3a0812', dot: 0.8, gap: 5 })}
    ${radGrad(id('candle-glow'), [[0, '#fffbe6', 0.95], [0.25, '#ffd270', 0.55], [0.65, '#c95512', 0.18], [1, '#4a0815', 0]], { cx: 660, cy: 190, r: 360, units: 'userSpaceOnUse' })}
    ${linGrad(id('velvet-bg'), [[0, '#1a040a'], [0.4, '#2d0611'], [0.8, '#420a1a'], [1, '#1a0309']], { x1: 0, y1: BLEED.y, x2: 0, y2: BLEED.y + BLEED.h, units: 'userSpaceOnUse' })}
    ${linGrad(id('parchment-l'), [[0, '#e5d9c0'], [0.85, '#f4ece1'], [1, '#ded0b4']])}
    ${linGrad(id('parchment-r'), [[0, '#ded0b4'], [0.15, '#f4ece1'], [1, '#e5d9c0']])}
    ${linGrad(id('brass-gear'), [[0, '#ffe89e'], [0.45, '#d49b28'], [0.85, '#8c5a0d'], [1, '#4a2c04']])}
    ${linGrad(id('d12-ruby'), [[0, '#ff6b82'], [0.35, '#b81432'], [0.75, '#730b1e'], [1, '#3b030c']])}
    ${linGrad(id('d12-amber'), [[0, '#ffea9f'], [0.4, '#d97706'], [0.8, '#92400e'], [1, '#451a03']])}
    ${linGrad(id('quill-feather'), [[0, '#faf6ee'], [0.6, '#ded3be'], [1, '#8c7d67']])}
    <filter id="${id('flame-glow')}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. The Open Folio Tome (Center)
  const book = `
    <!-- Cast shadow beneath open pages -->
    <ellipse cx="380" cy="385" rx="270" ry="85" fill="#000" opacity="0.6" filter="${id.url('soft')}"/>

    <!-- Leather Binding Outer Rim -->
    <path d="M125 365 Q250 380 375 372 Q500 380 625 365 L635 375 Q500 395 375 385 Q250 395 115 375 Z" fill="#381005" stroke="#7a2a12" stroke-width="1.2"/>

    <!-- Left Parchment Leaf -->
    <path d="M130 355 Q250 335 370 360 L370 200 Q250 180 135 190 Z" fill="${id.url('parchment-l')}" stroke="#8c7853" stroke-width="0.8"/>
    <!-- Page edge layers -->
    <path d="M130 355 L126 360 L131 364 Q250 345 370 368 L370 360 Q250 335 130 355 Z" fill="#d2c2a0" stroke="#8c7853" stroke-width="0.5"/>

    <!-- Right Parchment Leaf -->
    <path d="M370 360 Q490 335 610 355 L605 190 Q490 180 370 200 Z" fill="${id.url('parchment-r')}" stroke="#8c7853" stroke-width="0.8"/>
    <!-- Page edge layers -->
    <path d="M610 355 L614 360 L609 364 Q490 345 370 368 L370 360 Q490 335 610 355 Z" fill="#d2c2a0" stroke="#8c7853" stroke-width="0.5"/>

    <!-- Gilded Book Gutter & Ribbon Bookmark -->
    <path d="M370 200 L370 368" stroke="#5a4220" stroke-width="2"/>
    <path d="M370 200 Q365 290 345 390 Q335 440 315 470" fill="none" stroke="${spot}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M370 200 Q365 290 345 390 Q335 440 315 470" fill="none" stroke="#f6c453" stroke-width="1" stroke-linecap="round" opacity="0.65"/>

    <!-- Calligraphic Prose on Left Page -->
    <g class="folio-prose-left" opacity="0.88">
      <!-- Illuminated Drop Cap "V" -->
      <rect x="156" y="210" width="34" height="34" fill="${spot}" stroke="#f6c453" stroke-width="1.2"/>
      <text x="173" y="235" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="26" fill="#fff5df" text-anchor="middle">V</text>
      <!-- Script lines -->
      ${Array.from({ length: 9 }, (_, i) => {
        const y = 216 + i * 14;
        const xStart = i < 3 ? 198 : 156;
        const w = (i < 3 ? 150 : 192) * (i === 8 ? 0.6 : 0.95);
        return `<rect x="${xStart}" y="${y}" width="${w}" height="4.5" rx="1.5" fill="#3b2416"/>`;
      }).join('')}
      <!-- Marginal annotation diagram -->
      <circle cx="250" cy="315" r="16" fill="none" stroke="${spot}" stroke-width="1" stroke-dasharray="3 2"/>
      <path d="M242 315 L258 315 M250 307 L250 323" stroke="${spot}" stroke-width="0.8"/>
    </g>

    <!-- Branching Narrative Tree on Right Page -->
    <g class="folio-tree-right" opacity="0.9">
      <text x="490" y="218" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="700" font-size="10.5" fill="#4a2610" text-anchor="middle">CANONICAL TIMELINE BRANCHES</text>
      <!-- Event Nodes & Links -->
      <path d="M490 230 L440 265 L415 310 M440 265 L465 310 M490 230 L540 270 L520 315 M540 270 L570 315" fill="none" stroke="#6e4526" stroke-width="1.4"/>
      <!-- Nodes -->
      ${[
        [490, 230, spot, 'E0 · ORIGIN'],
        [440, 265, sec, 'E1 · GAMBIT'],
        [540, 270, sec, 'E2 · RETREAT'],
        [415, 310, spot, 'E3a'],
        [465, 310, '#047857', 'E3b'],
        [520, 315, '#1d4ed8', 'E3c'],
        [570, 315, spot, 'E3d']
      ].map(([x, y, col, txt]) => `
        <circle cx="${x}" cy="${y}" r="6.5" fill="${col}" stroke="#ffe8a8" stroke-width="1.2"/>
        <text x="${x}" y="${y + 14}" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="#2a1608" text-anchor="middle">${txt}</text>
      `).join('')}
    </g>`;

  // 2. Brass 6-Segment Astronomical World Clock (Top-Left Desk)
  const clock = `
    <g class="world-clock" transform="translate(180, 110)">
      <!-- Drop Shadow -->
      <circle cx="0" cy="0" r="74" fill="#000" opacity="0.5" filter="${id.url('soft')}"/>
      <!-- Brass Outer Bezel with Roman Numerals -->
      <circle cx="0" cy="0" r="70" fill="${id.url('brass-gear')}" stroke="#fff0b8" stroke-width="1.4"/>
      <circle cx="0" cy="0" r="62" fill="#180b06" stroke="#4a2508" stroke-width="1.5"/>

      <!-- 6 Segments -->
      ${Array.from({ length: 6 }, (_, i) => {
        const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 0.94) / 6) * Math.PI * 2 - Math.PI / 2;
        const rIn = 16;
        const rOut = 58;
        const x0 = Math.cos(a0) * rOut;
        const y0 = Math.sin(a0) * rOut;
        const x1 = Math.cos(a1) * rOut;
        const y1 = Math.sin(a1) * rOut;
        const xi0 = Math.cos(a0) * rIn;
        const yi0 = Math.sin(a0) * rIn;
        const xi1 = Math.cos(a1) * rIn;
        const yi1 = Math.sin(a1) * rIn;
        const active = i < 4;
        const fill = active ? (i === 3 ? spot : sec) : '#221109';
        return `
          <path d="M${r2(xi0)} ${r2(yi0)} L${r2(x0)} ${r2(y0)} A${rOut} ${rOut} 0 0 1 ${r2(x1)} ${r2(y1)} L${r2(xi1)} ${r2(yi1)} A${rIn} ${rIn} 0 0 0 ${r2(xi0)} ${r2(yi0)} Z" fill="${fill}" stroke="#ffe494" stroke-width="0.8"/>
          <text x="${r2(Math.cos((a0 + a1) / 2) * 38)}" y="${r2(Math.sin((a0 + a1) / 2) * 38 + 3)}" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="8" fill="#ffeec2" text-anchor="middle">${i + 1}</text>
        `;
      }).join('')}

      <!-- Center Brass Boss & Clock Hands -->
      <circle cx="0" cy="0" r="14" fill="${id.url('brass-gear')}" stroke="#ffe89e" stroke-width="1"/>
      <circle cx="0" cy="0" r="5" fill="#fff" opacity="0.9"/>
      <!-- Sun & Moon hands -->
      <path d="M0 0 L18 -32" stroke="#ffe89e" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="18" cy="-32" r="4.5" fill="#ffd54f" filter="${id.url('glow')}"/>
    </g>`;

  // 3. Pair of Glossy D12 Dice (Foreground Right)
  // Modeled as dodecahedra with shaded pentagonal faces
  const dice = `
    <!-- Cast Shadows -->
    <ellipse cx="610" cy="460" rx="42" ry="16" fill="#000" opacity="0.55" filter="${id.url('soft')}"/>
    <ellipse cx="690" cy="485" rx="38" ry="14" fill="#000" opacity="0.55" filter="${id.url('soft')}"/>

    <!-- Die 1: Ruby Dodecahedron (showing 11) -->
    <g class="die-ruby" transform="translate(610, 435)">
      <!-- Pentagonal faces -->
      <!-- Center Face: 11 -->
      <polygon points="0,-24 23,-7 14,21 -14,21 -23,-7" fill="${id.url('d12-ruby')}" stroke="#ffb8c4" stroke-width="1.2"/>
      <!-- Top Face -->
      <polygon points="0,-24 23,-7 18,-38 -18,-38 -23,-7" fill="#8f0f27" stroke="#ff8093" stroke-width="0.8"/>
      <!-- Bottom-Left Face -->
      <polygon points="-14,21 -23,-7 -44,-4 -38,24 -18,34" fill="#5c0617" stroke="#9e1830" stroke-width="0.8"/>
      <!-- Bottom-Right Face -->
      <polygon points="14,21 23,-7 44,-4 38,24 18,34" fill="#6e0a1c" stroke="#b01d37" stroke-width="0.8"/>
      <!-- Bottom Face -->
      <polygon points="-14,21 14,21 18,34 0,42 -18,34" fill="#42040f" stroke="#7a0f21" stroke-width="0.8"/>

      <!-- Gold Engraved Numeral "11" -->
      <text x="0" y="8" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="18" fill="#ffe299" text-anchor="middle" filter="${id.url('glow')}">11</text>
      <circle cx="-14" cy="-14" r="2" fill="#fff" opacity="0.6"/>
    </g>

    <!-- Die 2: Amber Dodecahedron (showing 9) -->
    <g class="die-amber" transform="translate(690, 460) rotate(-18)">
      <!-- Center Face: 9 -->
      <polygon points="0,-22 21,-7 13,19 -13,19 -21,-7" fill="${id.url('d12-amber')}" stroke="#ffe49e" stroke-width="1.2"/>
      <polygon points="0,-22 21,-7 16,-34 -16,-34 -21,-7" fill="#c26300" stroke="#f6ad55" stroke-width="0.8"/>
      <polygon points="-13,19 -21,-7 -38,-4 -32,22 -16,30" fill="#78350f" stroke="#b45309" stroke-width="0.8"/>
      <polygon points="13,19 21,-7 38,-4 32,22 16,30" fill="#8d3f0a" stroke="#d97706" stroke-width="0.8"/>
      <polygon points="-13,19 13,19 16,30 0,36 -16,30" fill="#451a03" stroke="#78350f" stroke-width="0.8"/>

      <!-- Numeral "9." with dot to distinguish from 6 -->
      <text x="0" y="7" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="17" fill="#fff7db" text-anchor="middle" filter="${id.url('glow')}">9.</text>
      <circle cx="-12" cy="-12" r="2" fill="#fff" opacity="0.7"/>
    </g>`;

  // 4. Brass Candlestick & Flickering Flame (Upper Right)
  const candle = `
    <g class="candlestick" transform="translate(680, 240)">
      <!-- Brass Candlestick -->
      <ellipse cx="0" cy="50" rx="32" ry="10" fill="${id.url('brass-gear')}"/>
      <path d="M-6 50 L-4 10 L4 10 L6 50 Z" fill="${id.url('brass-gear')}"/>
      <ellipse cx="0" cy="10" rx="14" ry="4" fill="${id.url('brass-gear')}"/>

      <!-- Wax Candle Column -->
      <rect x="-8" y="-70" width="16" height="80" rx="2" fill="#fdfcf0" stroke="#d6cfbe" stroke-width="0.8"/>
      <!-- Melted wax drips -->
      <path d="M-8 -50 Q-11 -40 -8 -30" stroke="#fff" stroke-width="2.5" fill="none"/>
      <path d="M6 -60 Q9 -48 6 -35" stroke="#fff" stroke-width="2" fill="none"/>

      <!-- Wick & Glowing Flame -->
      <line x1="0" y1="-70" x2="0" y2="-78" stroke="#333" stroke-width="1.8"/>
      <!-- Soft aura -->
      <ellipse cx="0" cy="-90" rx="28" ry="38" fill="#f97316" opacity="0.35" filter="url(#${id('flame-glow')})"/>
      <!-- Outer Flame -->
      <path d="M0 -110 Q-12 -90 0 -76 Q12 -90 0 -110 Z" fill="#f59e0b" filter="${id.url('glow')}">
        <animate attributeName="d" dur="0.8s" repeatCount="indefinite" values="
          M0 -110 Q-12 -90 0 -76 Q12 -90 0 -110 Z;
          M1 -113 Q-10 -88 0 -76 Q14 -92 1 -113 Z;
          M-1 -108 Q-14 -92 0 -76 Q10 -89 -1 -108 Z;
          M0 -110 Q-12 -90 0 -76 Q12 -90 0 -110 Z
        "/>
      </path>
      <!-- Inner Core Flame -->
      <path d="M0 -98 Q-6 -86 0 -78 Q6 -86 0 -98 Z" fill="#fff" opacity="0.95"/>
    </g>`;

  // 5. Inkwell & Goose Quill
  const inkwell = `
    <!-- Heavy Cut-Glass Inkwell -->
    <g class="inkwell" transform="translate(100, 480)">
      <ellipse cx="0" cy="20" rx="26" ry="10" fill="#000" opacity="0.5" filter="${id.url('soft')}"/>
      <path d="M-18 20 L-22 -8 L22 -8 L18 20 Z" fill="#14080c" stroke="#ffe299" stroke-width="1.2"/>
      <!-- Ink level -->
      <ellipse cx="0" cy="-4" rx="16" ry="6" fill="#000" stroke="#ff385c" stroke-width="0.5"/>
      <ellipse cx="0" cy="-8" rx="12" ry="4" fill="${id.url('brass-gear')}"/>

      <!-- Goose Feather Quill -->
      <path d="M-6 -6 Q-20 -90 40 -180 Q25 -140 -2 -6" fill="${id.url('quill-feather')}" stroke="#786a55" stroke-width="0.8"/>
      <path d="M-6 -6 Q-20 -90 40 -180" stroke="#f6c453" stroke-width="1.2" fill="none"/>
      <!-- Vanes slits -->
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="${10 + i * 6}" y1="${-110 - i * 14}" x2="${-2 + i * 4}" y2="${-98 - i * 14}" stroke="#a89a82" stroke-width="0.7"/>`).join('')}
    </g>`;

  const body = `
    <!-- Deep Bordeaux Velvet Table Surface -->
    ${bleedRect(id.url('velvet-bg'))}
    <!-- Halftone fabric nap texture -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.16"/>

    <!-- Candle Glow Overlay -->
    <circle cx="680" cy="150" r="380" fill="${id.url('candle-glow')}" style="mix-blend-mode:screen;" opacity="0.85"/>

    <!-- Open Folio Tome -->
    ${book}

    <!-- Astronomical World Clock Dial -->
    ${clock}

    <!-- Candlestick -->
    ${candle}

    <!-- Pair of D12 Dice -->
    ${dice}

    <!-- Inkwell & Quill -->
    ${inkwell}

    <!-- Engineering & Lore Callouts -->
    ${label(180, 44, 'PLATE IV · “THE ORACLE AT DUSK”', { size: 9, fill: '#ffd285', plate: 'rgba(30,5,12,0.85)', pad: 5 })}
    ${label(650, 525, 'DETERMINISTIC 2d12 ORACLE: [11, 9] + 3 = 23', { size: 8, fill: '#ffd285', anchor: 'middle', plate: 'rgba(30,5,12,0.85)', pad: 4 })}
    ${label(490, 175, 'CANONICAL EVENT-SOURCED MERKLE LOG', { size: 7.5, fill: '#f6ad55', anchor: 'middle' })}`;

  return {
    title: 'The Oracle at Dusk',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate IV: The Oracle at Dusk — illuminated literary folio, 6-segment world clock, and glowing d12 dice on velvet',
      defs,
      body
    })
  };
}
