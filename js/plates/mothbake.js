/**
 * PLATE // MOTHBAKE — “THE HERMETIC LEPIDOPTERA”
 * Hermetic binary asset compilation: a geometric Atlas Moth specimen pinned to an
 * archival entomology card with brass pins; its wings formed from 64-byte aligned
 * hex-dump cache lines whose structural veins trace a cryptographic Merkle tree
 * rooting in an immutable SHA-256 hash.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba
} from '../svg-kit.js';

export default function mothbakePlate(proj) {
  const id = scope('pl-moth');
  const rand = rng(108);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #ea580c Rust Orange
  const sec = proj.secondaryInkHex; // #334155 Graphite

  const defs = `
    ${standardDefs(id, { ink: '#261205', dot: 0.75, gap: 5 })}
    ${radGrad(id('specimen-card'), [[0, '#fffbf0'], [0.75, '#f5efe0'], [1, '#e3d8be']], { cx: 0.5, cy: 0.5, r: 0.75 })}
    ${linGrad(id('moth-body'), [[0, '#ea580c'], [0.4, '#9a3412'], [0.8, '#431407'], [1, '#1a0601']])}
    ${linGrad(id('wing-fore-l'), [[0, '#fed7aa'], [0.35, '#fb923c'], [0.75, '#c2410c'], [1, '#431407']])}
    ${linGrad(id('wing-fore-r'), [[0, '#fed7aa'], [0.35, '#fb923c'], [0.75, '#c2410c'], [1, '#431407']])}
    ${linGrad(id('brass-pin'), [[0, '#fef08a'], [0.4, '#eab308'], [0.8, '#a16207'], [1, '#451a03']])}
    ${linGrad(id('tag-paper'), [[0, '#ffffff'], [1, '#f1ede4']])}
    <filter id="${id('hash-glow')}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  const cx = 400;
  const cy = 290;

  // 1. Archival Specimen Card with Grid Lines & Brass Mounting Pins
  const specimenCard = `
    <!-- Card Shadow -->
    <rect x="85" y="55" width="630" height="490" rx="4" fill="#000" opacity="0.55" filter="${id.url('soft')}"/>
    <!-- Heavy 100% Rag Cotton Board -->
    <rect x="80" y="50" width="640" height="500" rx="4" fill="${id.url('specimen-card')}" stroke="#c9baa0" stroke-width="1.5"/>
    <rect x="92" y="62" width="616" height="476" rx="2" fill="none" stroke="#d5c7ad" stroke-width="0.8" stroke-dasharray="3 3"/>

    <!-- 10mm Scientific Metric Grid Lines -->
    ${Array.from({ length: 11 }, (_, i) => `<line x1="100" y1="${80 + i * 42}" x2="700" y2="${80 + i * 42}" stroke="#bfae93" stroke-opacity="0.35" stroke-width="0.6"/>`).join('')}
    ${Array.from({ length: 15 }, (_, i) => `<line x1="${120 + i * 40}" y1="65" x2="${120 + i * 40}" y2="535" stroke="#bfae93" stroke-opacity="0.35" stroke-width="0.6"/>`).join('')}

    <!-- 4 Brass Specimen Corner Mounting Pins -->
    ${[[95, 65], [705, 65], [95, 535], [705, 535]].map(([px, py]) => `
      <ellipse cx="${px + 2}" cy="${py + 3}" rx="5" ry="3" fill="#000" opacity="0.4"/>
      <circle cx="${px}" cy="${py}" r="4" fill="${id.url('brass-pin')}" stroke="#78350f" stroke-width="0.7"/>
      <circle cx="${px - 1}" cy="${py - 1}" r="1.5" fill="#fff" opacity="0.9"/>
    `).join('')}`;

  // 2. The Deterministic 64-Byte Cache-Line Wings
  // Left Forewing Path: Polygon from thorax out to apex and back
  const forewingL = `
    <polygon points="${cx - 10},${cy - 20} ${cx - 240},${cy - 160} ${cx - 280},${cy - 60} ${cx - 190},${cy + 40} ${cx - 12},${cy + 10}" fill="${id.url('wing-fore-l')}" stroke="#7c2d12" stroke-width="1.4"/>
  `;
  const forewingR = `
    <polygon points="${cx + 10},${cy - 20} ${cx + 240},${cy - 160} ${cx + 280},${cy - 60} ${cx + 190},${cy + 40} ${cx + 12},${cy + 10}" fill="${id.url('wing-fore-r')}" stroke="#7c2d12" stroke-width="1.4"/>
  `;

  // Hindwings (Lower Wings)
  const hindwingL = `
    <polygon points="${cx - 10},${cy + 10} ${cx - 180},${cy + 40} ${cx - 150},${cy + 160} ${cx - 60},${cy + 180} ${cx - 8},${cy + 60}" fill="#9a3412" stroke="#7c2d12" stroke-width="1.2"/>
  `;
  const hindwingR = `
    <polygon points="${cx + 10},${cy + 10} ${cx + 180},${cy + 40} ${cx + 150},${cy + 160} ${cx + 60},${cy + 180} ${cx + 8},${cy + 60}" fill="#9a3412" stroke="#7c2d12" stroke-width="1.2"/>
  `;

  // Wing Eyespots (Ocelli) — concentric rings mimicking byte alignment targets
  const eyespots = `
    <!-- Left Eyespot -->
    <g transform="translate(${cx - 145}, ${cy - 55})">
      <circle cx="0" cy="0" r="26" fill="#1e293b" stroke="#facc15" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="18" fill="#ea580c" stroke="#fed7aa" stroke-width="1"/>
      <circle cx="0" cy="0" r="9" fill="#0f172a"/>
      <circle cx="0" cy="0" r="3" fill="#fff"/>
      <text x="0" y="3.5" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="#facc15" text-anchor="middle">0x4D</text>
    </g>
    <!-- Right Eyespot -->
    <g transform="translate(${cx + 145}, ${cy - 55})">
      <circle cx="0" cy="0" r="26" fill="#1e293b" stroke="#facc15" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="18" fill="#ea580c" stroke="#fed7aa" stroke-width="1"/>
      <circle cx="0" cy="0" r="9" fill="#0f172a"/>
      <circle cx="0" cy="0" r="3" fill="#fff"/>
      <text x="0" y="3.5" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="#facc15" text-anchor="middle">0x42</text>
    </g>`;

  // 64-Byte Cache-Line Hex Cells on Wings
  // Arrays of 8-byte aligned hex words stamped onto the wings
  const hexCells = [];
  const hexValues = ['7F', '45', '4C', '46', '02', '01', '01', '00', '6D', '6F', '74', '68', '62', '61', '6B', '65'];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const lx = cx - 215 + col * 28 + row * 10;
      const rx = cx + 215 - col * 28 - row * 10;
      const y = cy - 110 + row * 26 + col * 4;
      const val = hexValues[(row * 6 + col) % hexValues.length];
      const isZero = row === 4 && col >= 3;
      hexCells.push(`
        <g opacity="0.85">
          <rect x="${lx - 11}" y="${y - 8}" width="22" height="15" rx="1.5" fill="${isZero ? '#ea580c' : '#1e293b'}" stroke="#fdba74" stroke-width="0.6"/>
          <text x="${lx}" y="${y + 2.5}" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="${isZero ? '#fff' : '#fde047'}" text-anchor="middle">${isZero ? '00' : val}</text>
        </g>
        <g opacity="0.85">
          <rect x="${rx - 11}" y="${y - 8}" width="22" height="15" rx="1.5" fill="${isZero ? '#ea580c' : '#1e293b'}" stroke="#fdba74" stroke-width="0.6"/>
          <text x="${rx}" y="${y + 2.5}" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="${isZero ? '#fff' : '#fde047'}" text-anchor="middle">${isZero ? '00' : val}</text>
        </g>
      `);
    }
  }

  // 3. Merkle Tree Veins (Structural Wing Veins Rooting into Thorax)
  const merkleVeins = `
    <!-- Left Wing Merkle Branches -->
    <path d="M${cx - 240} ${cy - 150} L${cx - 180} ${cy - 80} L${cx - 110} ${cy - 30} L${cx - 14} ${cy}" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M${cx - 260} ${cy - 60} L${cx - 180} ${cy - 80}" fill="none" stroke="#fef08a" stroke-width="1.8"/>
    <path d="M${cx - 180} ${cy + 30} L${cx - 110} ${cy - 30}" fill="none" stroke="#fef08a" stroke-width="1.8"/>
    <path d="M${cx - 140} ${cy + 130} L${cx - 70} ${cy + 50} L${cx - 12} ${cy + 25}" fill="none" stroke="#fef08a" stroke-width="1.8"/>

    <!-- Right Wing Merkle Branches -->
    <path d="M${cx + 240} ${cy - 150} L${cx + 180} ${cy - 80} L${cx + 110} ${cy - 30} L${cx + 14} ${cy}" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M${cx + 260} ${cy - 60} L${cx + 180} ${cy - 80}" fill="none" stroke="#fef08a" stroke-width="1.8"/>
    <path d="M${cx + 180} ${cy + 30} L${cx + 110} ${cy - 30}" fill="none" stroke="#fef08a" stroke-width="1.8"/>
    <path d="M${cx + 140} ${cy + 130} L${cx + 70} ${cy + 50} L${cx + 12} ${cy + 25}" fill="none" stroke="#fef08a" stroke-width="1.8"/>

    <!-- Merkle Hash Nodes (Circles at bifurcations) -->
    ${[
      [cx - 180, cy - 80], [cx - 110, cy - 30],
      [cx + 180, cy - 80], [cx + 110, cy - 30],
      [cx - 70, cy + 50], [cx + 70, cy + 50]
    ].map(([nx, ny]) => `
      <circle cx="${nx}" cy="${ny}" r="4" fill="#facc15" stroke="#78350f" stroke-width="1"/>
      <circle cx="${nx}" cy="${ny}" r="1.5" fill="#fff"/>
    `).join('')}`;

  // 4. Moth Body (Head, Feathery Antennae, Thorax, Segmented Abdomen)
  const mothBody = `
    <!-- Antennae (Feathery Silk-Moth Pectinate Antennae) -->
    <g stroke="#9a3412" stroke-width="1.4" fill="none">
      <path d="M${cx - 6} ${cy - 50} Q${cx - 45} ${cy - 95} ${cx - 85} ${cy - 110}"/>
      <path d="M${cx + 6} ${cy - 50} Q${cx + 45} ${cy - 95} ${cx + 85} ${cy - 110}"/>
      <!-- Side comb branches -->
      ${Array.from({ length: 12 }, (_, i) => {
        const t = (i + 1) / 13;
        const lx = cx - 6 - t * 75;
        const ly = cy - 50 - t * 55;
        const rx = cx + 6 + t * 75;
        const ry = cy - 50 - t * 55;
        return `
          <line x1="${r2(lx)}" y1="${r2(ly)}" x2="${r2(lx - 12)}" y2="${r2(ly - 6)}" stroke="#ea580c" stroke-width="0.9"/>
          <line x1="${r2(rx)}" y1="${r2(ry)}" x2="${r2(rx + 12)}" y2="${r2(ry - 6)}" stroke="#ea580c" stroke-width="0.9"/>
        `;
      }).join('')}
    </g>

    <!-- Head & Compound Eyes -->
    <ellipse cx="${cx}" cy="${cy - 45}" rx="11" ry="9" fill="#431407"/>
    <circle cx="${cx - 9}" cy="${cy - 47}" r="5" fill="#1c1917" stroke="#ea580c" stroke-width="0.8"/>
    <circle cx="${cx + 9}" cy="${cy - 47}" r="5" fill="#1c1917" stroke="#ea580c" stroke-width="0.8"/>

    <!-- Thorax (Tufted Fur & SHA-256 Merkle Root Cylinder) -->
    <ellipse cx="${cx}" cy="${cy}" rx="18" ry="26" fill="${id.url('moth-body')}" stroke="#ea580c" stroke-width="1.5"/>
    <ellipse cx="${cx}" cy="${cy}" rx="12" ry="18" fill="#facc15" filter="url(#${id('hash-glow')})" opacity="0.85"/>
    <circle cx="${cx}" cy="${cy}" r="4" fill="#fff"/>

    <!-- Segmented Abdomen -->
    ${Array.from({ length: 7 }, (_, i) => {
      const ay = cy + 30 + i * 13;
      const arx = 14 - i * 1.5;
      return `
        <ellipse cx="${cx}" cy="${ay}" rx="${arx}" ry="7.5" fill="${i % 2 === 0 ? '#7c2d12' : '#ea580c'}" stroke="#431407" stroke-width="0.8"/>
      `;
    }).join('')}

    <!-- Central Brass Mounting Pin through Thorax -->
    <ellipse cx="${cx + 10}" cy="${cy + 8}" rx="8" ry="4" fill="#000" opacity="0.45" filter="${id.url('soft')}"/>
    <circle cx="${cx}" cy="${cy - 2}" r="5.5" fill="${id.url('brass-pin')}" stroke="#78350f" stroke-width="1"/>
    <circle cx="${cx - 1.5}" cy="${cy - 3.5}" r="2" fill="#fff" opacity="0.9"/>`;

  // 5. Archival Entomology Specimen Tag (Lower Right)
  const museumTag = `
    <g class="specimen-tag" transform="translate(480, 430) rotate(-3)">
      <rect x="0" y="0" width="220" height="92" rx="2" fill="${id.url('tag-paper')}" stroke="#a89a82" stroke-width="1"/>
      <!-- Thread tie ring on left -->
      <circle cx="16" cy="46" r="6" fill="#fffdf5" stroke="#786a55" stroke-width="1.2"/>
      <circle cx="16" cy="46" r="3" fill="#0f172a"/>
      <!-- Thread to thorax pin -->
      <path d="M16 46 Q120 490 395 292" fill="none" stroke="#786a55" stroke-width="0.8" stroke-dasharray="2 2"/>

      <!-- Letterpress Specimen Text -->
      <text x="32" y="18" font-family="Fraunces, Georgia, serif" font-weight="900" font-size="8.5" fill="#431407">MOTHOCOCCUS DETERMINISTICUS</text>
      <text x="32" y="30" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="#ea580c">FAMILY: HERMETIC CODECS (64-BYTE)</text>
      <line x1="32" y1="36" x2="210" y2="36" stroke="#c4b59d" stroke-width="0.6"/>
      <text x="32" y="47" font-family="IBM Plex Mono, monospace" font-size="6" fill="#1c1917">SHA256: e3b0c44298fc1c149afbf4c8...</text>
      <text x="32" y="58" font-family="IBM Plex Mono, monospace" font-size="6" fill="#64748b">PADDING: ZERO DRIFT VERIFIED</text>
      <text x="32" y="70" font-family="IBM Plex Mono, monospace" font-size="6" fill="#64748b">DATE: 13-OCT-2026 · ARCHIVE #108</text>
      <rect x="32" y="76" width="65" height="10" rx="1" fill="#ea580c"/>
      <text x="64.5" y="83.5" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="5.5" fill="#fff" text-anchor="middle">CLEAN-ROOM SEAL</text>
    </g>`;

  const body = `
    <!-- Dark Specimen Drawer Background -->
    ${bleedRect('#140b05')}
    <!-- Halftone drawer shadow -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.14"/>

    <!-- Archival Cotton Board & Grid -->
    ${specimenCard}

    <!-- Hindwings & Forewings -->
    ${hindwingL}
    ${hindwingR}
    ${forewingL}
    ${forewingR}

    <!-- 64-Byte Cache-Line Hex Dump Cells -->
    <g class="hex-dump-wings">${hexCells.join('')}</g>

    <!-- Eyespots -->
    ${eyespots}

    <!-- Merkle Tree Vein Structure -->
    ${merkleVeins}

    <!-- Moth Body & Antennae -->
    ${mothBody}

    <!-- Museum Specimen Tag -->
    ${museumTag}

    <!-- Technical Annotations -->
    ${label(400, 38, 'PLATE X · “THE HERMETIC LEPIDOPTERA”', { size: 9, fill: '#ea580c', plate: 'rgba(255,251,240,0.95)', pad: 5, anchor: 'middle' })}
    ${label(400, 240, 'MERKLE ROOT SHA-256 (64-BYTE ALIGNED)', { size: 7.5, fill: '#facc15', plate: 'rgba(20,8,2,0.85)', pad: 4, anchor: 'middle' })}
    ${label(240, 520, 'ZERO-PADDING ENFORCED ON EVERY STRUCT BOUNDARY', { size: 7, fill: '#786a55' })}`;

  return {
    title: 'The Hermetic Lepidoptera',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate X: The Hermetic Lepidoptera — geometric Atlas Moth with 64-byte aligned hex wings and Merkle tree veins',
      defs,
      body
    })
  };
}
