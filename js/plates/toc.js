/**
 * PLATE // TABLE OF CONTENTS FRONTISPIECE — “THE PRESS ROOM”
 * A warm, lamp-lit 1984 editorial press room desk: a classic beige PC with CRT
 * displaying the glowing SLOP masthead, a mechanical keyboard, 5.25" floppy disk,
 * brass banker's lamp casting an amber pool of light, coffee mug, and bound periodicals.
 */
import {
  rng, r2, scope, standardDefs, starfield, linGrad, radGrad, label, svgRoot,
  rgba, tint, shade, BLEED, bleedRect
} from '../svg-kit.js';

export default function tocPlate(meta) {
  const id = scope('pl-toc');
  const rand = rng(2026);
  const W = 800;
  const H = 600;

  const defs = `
    ${standardDefs(id, { ink: '#2a1a08', dot: 0.8, gap: 5 })}
    ${radGrad(id('lamp-glow'), [[0, '#fff4cc', 0.85], [0.35, '#ffcf70', 0.45], [0.75, '#e08020', 0.15], [1, '#4a2000', 0]], { cx: 220, cy: 190, r: 380, units: 'userSpaceOnUse' })}
    ${linGrad(id('desk-wood'), [[0, '#422817'], [0.4, '#2e1b0f'], [1, '#1a0e08']], { x1: 0, y1: 260, x2: 0, y2: 600, units: 'userSpaceOnUse' })}
    ${linGrad(id('wall'), [[0, '#12151e'], [0.6, '#1e2433'], [1, '#2c3547']], { x1: 0, y1: BLEED.y, x2: 0, y2: 280, units: 'userSpaceOnUse' })}
    ${linGrad(id('lamp-shade'), [[0, '#10522c'], [0.45, '#1b7a43'], [1, '#0b381e']])}
    ${linGrad(id('brass'), [[0, '#ffe89e'], [0.4, '#d4a23b'], [0.8, '#8c6016'], [1, '#54380a']])}
    ${linGrad(id('crt-bezel'), [[0, '#e5dcc7'], [0.5, '#cebe9f'], [1, '#9b8a6a']])}
    ${radGrad(id('crt-glass'), [[0, '#1f385c'], [0.65, '#0d1c33'], [1, '#050a14']], { cx: 0.48, cy: 0.45, r: 0.75 })}
    ${linGrad(id('floppy'), [[0, '#222326'], [0.7, '#141416'], [1, '#0a0a0c']])}
    ${linGrad(id('floppy-label'), [[0, '#fffdf5'], [1, '#eeddbb']])}
    ${linGrad(id('mug'), [[0, '#e2583e'], [0.55, '#ba3720'], [1, '#7a1f0e']])}
    <clipPath id="${id('screen-clip')}">
      <rect x="428" y="152" width="224" height="156" rx="14"/>
    </clipPath>`;

  // Banker's lamp assembly (left)
  const lamp = `
    <!-- Cast light beam -->
    <polygon points="220,195 40,580 580,580" fill="${id.url('lamp-glow')}" style="mix-blend-mode:screen;" opacity="0.75"/>
    <ellipse cx="280" cy="460" rx="230" ry="85" fill="${id.url('lamp-glow')}" style="mix-blend-mode:screen;" opacity="0.6"/>

    <!-- Brass Base & Arm -->
    <ellipse cx="140" cy="385" rx="42" ry="14" fill="${id.url('brass')}"/>
    <ellipse cx="140" cy="382" rx="36" ry="11" fill="#ffeaa3" opacity="0.6"/>
    <path d="M138 382 Q135 270 180 210 Q205 175 220 180" fill="none" stroke="${id.url('brass')}" stroke-width="11" stroke-linecap="round"/>
    <path d="M138 382 Q135 270 180 210 Q205 175 220 180" fill="none" stroke="#fff3be" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
    <circle cx="218" cy="182" r="7" fill="${id.url('brass')}"/>

    <!-- Green Glass Shade -->
    <ellipse cx="220" cy="192" rx="58" ry="16" fill="#092917"/>
    <path d="M164 190 Q220 152 276 190 L270 206 Q220 178 170 206 Z" fill="${id.url('lamp-shade')}"/>
    <ellipse cx="220" cy="204" rx="52" ry="10" fill="#fff7d6" filter="${id.url('glow')}" opacity="0.95"/>
    <!-- Pull chain with brass bead -->
    <path d="M250 202 Q252 245 253 268" fill="none" stroke="${id.url('brass')}" stroke-width="1.6" stroke-dasharray="2 3"/>
    <circle cx="253" cy="272" r="3.5" fill="${id.url('brass')}"/>`;

  // 1984 Computer & CRT Monitor (center-right)
  const computer = `
    <!-- Monitor Base & Housing -->
    <ellipse cx="540" cy="365" rx="140" ry="24" fill="#000" opacity="0.4" filter="${id.url('soft')}"/>
    <path d="M495 340 L585 340 L605 362 L475 362 Z" fill="${id.url('crt-bezel')}"/>
    <rect x="400" y="118" width="280" height="226" rx="20" fill="${id.url('crt-bezel')}" stroke="#fff5df" stroke-width="1.5" stroke-opacity="0.6"/>
    <rect x="400" y="322" width="280" height="22" fill="#9b8a6a" opacity="0.45"/>
    <rect x="420" y="328" width="56" height="10" rx="1" fill="#75674c"/>
    <text x="448" y="335.5" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="#fff5df" text-anchor="middle" letter-spacing="0.1em">MOJOMAST</text>
    <circle cx="654" cy="333" r="3.5" fill="#22c55e" filter="${id.url('glow')}"/>
    <circle cx="636" cy="333" r="3" fill="#ea580c"/>

    <!-- CRT Bezel & Screen -->
    <rect x="420" y="142" width="240" height="176" rx="16" fill="#15171c"/>
    <rect x="428" y="152" width="224" height="156" rx="14" fill="${id.url('crt-glass')}"/>

    <!-- Screen Content: Glowing Masthead + Editorial Draft -->
    <g clip-path="url(#${id('screen-clip')})">
      <rect x="428" y="152" width="224" height="156" fill="${id.url('scan')}"/>
      <ellipse cx="540" cy="225" rx="90" ry="55" fill="#38bdf8" opacity="0.18" filter="${id.url('glow-lg')}"/>
      <!-- Glowing Editorial Masthead -->
      <text x="540" y="195" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="28" fill="#ffedd5" text-anchor="middle" filter="${id.url('glow')}">SLOP</text>
      <text x="540" y="210" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="8.5" fill="#38bdf8" text-anchor="middle" letter-spacing="0.18em">COMPUTING ANNUAL · OCT 2026</text>
      <line x1="450" y1="218" x2="630" y2="218" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="0.8"/>
      <text x="452" y="234" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#86efac">&gt; 11 SYSTEMS VERIFIED [OK]</text>
      <text x="452" y="247" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#93c5fd">&gt; NETCODE: 60HZ REWIND NOMINAL</text>
      <text x="452" y="260" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#fde047">&gt; DSP: 2.6MS AUDIO BUFFER READY</text>
      <text x="452" y="274" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#f472b6">&gt; PRESS RUN: 112 PAGES BOUND ▌</text>
      <!-- Glass reflection sheen -->
      <path d="M428 152 L560 152 L470 308 L428 308 Z" fill="#fff" opacity="0.045"/>
    </g>

    <!-- Keyboard (tilted isometric perspective) -->
    <path d="M420 380 L660 380 L685 445 L395 445 Z" fill="${id.url('crt-bezel')}" stroke="#fff5df" stroke-width="1.2" stroke-opacity="0.5"/>
    <path d="M395 445 L685 445 L685 455 L395 455 Z" fill="#75674c"/>
    <!-- Keycap Matrix -->
    ${Array.from({ length: 4 }, (_, r) => {
      const y = 388 + r * 13;
      const count = 14 - (r === 3 ? 4 : 0);
      return Array.from({ length: count }, (__, c) => {
        const x = 422 - r * 6 + c * 18;
        const w = r === 3 && c === 4 ? 68 : 14;
        return `<rect x="${r2(x)}" y="${y}" width="${w}" height="10" rx="1.5" fill="#302e2b" stroke="#4a4640" stroke-width="0.7"/>
                <rect x="${r2(x + 1)}" y="${y + 1}" width="${w - 2}" height="3" fill="#524e47" opacity="0.6"/>`;
      }).join('');
    }).join('')}`;

  // Desk Paraphernalia: Stack of Periodicals, 5.25" Floppy, Ceramic Mug, Pencil
  const paraphernalia = `
    <!-- Stack of Byte / Datamation Magazines on Left Desk -->
    <g class="mag-stack">
      <path d="M45 440 L175 425 L215 455 L85 470 Z" fill="#991b1b"/>
      <path d="M45 440 L85 470 L85 478 L45 448 Z" fill="#601010"/>
      <path d="M85 470 L215 455 L215 463 L85 478 Z" fill="#f5f0e4"/>
      <text x="145" y="471" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="6.5" fill="#601010" transform="rotate(-6 145 471)">BYTE · VOL. 9 NO. 10</text>

      <path d="M50 428 L180 414 L220 444 L90 458 Z" fill="#0047ab"/>
      <path d="M50 428 L90 458 L90 466 L50 436 Z" fill="#002b66"/>
      <path d="M90 458 L220 444 L220 452 L90 466 Z" fill="#f5f0e4"/>
      <text x="150" y="459" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="6.5" fill="#002b66" transform="rotate(-6 150 459)">WHOLE EARTH REVIEW</text>

      <path d="M54 416 L184 402 L224 432 L94 446 Z" fill="#d9381e"/>
      <path d="M54 416 L94 446 L94 454 L54 424 Z" fill="#8f200d"/>
      <path d="M94 446 L224 432 L224 440 L94 454 Z" fill="#f5f0e4"/>
      <text x="152" y="447" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="#8f200d" transform="rotate(-6 152 447)">THE SLOP ANNUAL 1984</text>
    </g>

    <!-- 5.25" Floppy Disk in foreground -->
    <g class="floppy-disk" transform="translate(230, 435) rotate(12)">
      <rect x="0" y="0" width="110" height="110" rx="3" fill="${id.url('floppy')}" stroke="#333" stroke-width="0.8"/>
      <!-- Hub ring -->
      <circle cx="55" cy="55" r="19" fill="#1a1a1c" stroke="#444" stroke-width="0.8"/>
      <circle cx="55" cy="55" r="14" fill="#000"/>
      <!-- Read/write head slot -->
      <rect x="47" y="68" width="16" height="30" rx="8" fill="#000"/>
      <rect x="49" y="70" width="12" height="26" rx="6" fill="#111" stroke="#333" stroke-width="0.5"/>
      <!-- Index hole -->
      <circle cx="68" cy="46" r="3" fill="#000"/>
      <!-- White Adhesive Label -->
      <path d="M8 8 L102 8 L102 38 L8 38 Z" fill="${id.url('floppy-label')}" stroke="#d4c5a9" stroke-width="0.8"/>
      <rect x="12" y="12" width="86" height="3" fill="#d9381e"/>
      <text x="14" y="24" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="600" fill="#141311">SLOP-OS v11.10</text>
      <text x="14" y="33" font-family="IBM Plex Mono, monospace" font-size="6" fill="#655f53">MASTER BUILD · 360KB</text>
    </g>

    <!-- Steaming Ceramic Coffee Mug -->
    <g class="coffee-mug" transform="translate(685, 395)">
      <ellipse cx="28" cy="74" rx="28" ry="8" fill="#000" opacity="0.4" filter="${id.url('soft')}"/>
      <!-- Mug body -->
      <path d="M6 25 L12 70 Q28 78 44 70 L50 25 Z" fill="${id.url('mug')}"/>
      <ellipse cx="28" cy="25" rx="22" ry="7" fill="#421a08" stroke="#ffb09c" stroke-width="1"/>
      <ellipse cx="28" cy="25" rx="18" ry="5.5" fill="#1f0c03"/>
      <!-- Handle -->
      <path d="M48 34 Q64 36 62 52 Q60 64 45 64" fill="none" stroke="${id.url('mug')}" stroke-width="6" stroke-linecap="round"/>
      <!-- Steam Wisps -->
      <path d="M22 18 Q20 5 26 -6 Q32 -16 28 -28" fill="none" stroke="#fff" stroke-width="1.6" opacity="0.35" class="plate-float"/>
      <path d="M32 16 Q36 4 30 -8 Q26 -18 34 -26" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.25" class="plate-float" style="animation-delay: 1.2s;"/>
    </g>

    <!-- Blue Editing Pencil & Brass Drafting Rule -->
    <g transform="translate(320, 520) rotate(-4)">
      <!-- Brass ruler -->
      <rect x="0" y="0" width="160" height="14" fill="${id.url('brass')}" stroke="#785012" stroke-width="0.6"/>
      ${Array.from({ length: 32 }, (_, i) => `<line x1="${i * 5}" y1="0" x2="${i * 5}" y2="${i % 5 === 0 ? 7 : 3.5}" stroke="#422c06" stroke-width="0.6"/>`).join('')}
      <!-- Non-photo blue pencil -->
      <polygon points="12,18 140,18 140,24 12,24" fill="#009fe3"/>
      <polygon points="12,18 0,21 12,24" fill="#d4b483"/>
      <polygon points="3,20 0,21 3,22" fill="#009fe3"/>
    </g>`;

  const body = `
    <!-- Studio Wall Background -->
    ${bleedRect(id.url('wall'))}
    <!-- Halftone shadow over the wall -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${280 - BLEED.y}" fill="${id.url('halftone')}" opacity="0.14"/>

    <!-- Desk Surface (Polished Walnut Wood) -->
    <rect x="${BLEED.x}" y="270" width="${BLEED.w}" height="${BLEED.y + BLEED.h - 270}" fill="${id.url('desk-wood')}"/>
    <!-- Wood grain lines -->
    ${Array.from({ length: 8 }, (_, i) => `<line x1="${BLEED.x}" y1="${300 + i * 40}" x2="${BLEED.x + BLEED.w}" y2="${302 + i * 40}" stroke="#ffe2b0" stroke-opacity="0.04" stroke-width="2"/>`).join('')}

    <!-- Wall Pin-Board Notes & Schematics -->
    <g opacity="0.85">
      <rect x="310" y="42" width="75" height="52" fill="#fffdfa" stroke="#d5c8b0" stroke-width="0.8" transform="rotate(-3 310 42)"/>
      <circle cx="347" cy="46" r="2.5" fill="#d9381e"/>
      <text x="320" y="62" font-family="IBM Plex Mono, monospace" font-size="6" fill="#141311">DEADLINE:</text>
      <text x="320" y="73" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="700" fill="#d9381e">OCT 13 '26</text>
      <text x="320" y="84" font-family="IBM Plex Mono, monospace" font-size="5.5" fill="#666">PRESS LOCK 04:00</text>
    </g>

    <!-- Desk Lamp + Atmosphere -->
    ${lamp}

    <!-- Main Subject: PC + CRT + Keyboard -->
    ${computer}

    <!-- Foreground Paraphernalia -->
    ${paraphernalia}

    <!-- Technical Callouts & Annotations -->
    ${label(400, 95, 'PLATE II · FRONTISPIECE: “THE PRESS ROOM”', { size: 9, fill: '#ffdfb0', anchor: 'middle', plate: 'rgba(10,14,24,0.85)', pad: 5 })}
    ${label(740, 520, '1984 SANCTUARY EDITORIAL TERMINAL', { size: 8, fill: '#ffcf99', anchor: 'end', plate: 'rgba(10,14,24,0.85)', pad: 4 })}`;

  return {
    title: 'The Press Room',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate II: The Press Room — warm editorial desk with 1984 PC, banker lamp and periodicals',
      defs,
      body
    })
  };
}
