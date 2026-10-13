/**
 * PLATE // BECOMUSSY — “THE FIVE GEOLOGICAL STRATA”
 * Governed agent memory architecture: an intricate geological cliff cross-section
 * showing five distinct stratigraphic memory layers (L1 Ephemeral Pumice, L2 Episodic Sandstone,
 * L3 Semantic Metamorphic Schist, L4 Procedural Basalt Honeycomb, and L5 Molten Bedrock Core
 * with an Ed25519 Cryptographic Steward Gate geode vault).
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba
} from '../svg-kit.js';

export default function becomussyPlate(proj) {
  const id = scope('pl-bec');
  const rand = rng(111);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #b45309 Archival Gold-Ochre
  const sec = proj.secondaryInkHex; // #0f766e Deep Verdigris

  const defs = `
    ${standardDefs(id, { ink: '#2a1a08', dot: 0.8, gap: 5 })}
    ${radGrad(id('vault-glow'), [[0, '#fef08a', 1], [0.35, '#f59e0b', 0.8], [0.75, '#b45309', 0.35], [1, '#1c0d02', 0]], { cx: 430, cy: 485, r: 160, units: 'userSpaceOnUse' })}
    ${linGrad(id('l1-pumice'), [[0, '#d6c7b2'], [0.5, '#bfae95'], [1, '#a8977c']])}
    ${linGrad(id('l2-sandstone'), [[0, '#9a3412'], [0.4, '#c2410c'], [0.7, '#ea580c'], [1, '#7c2d12']])}
    ${linGrad(id('l3-schist'), [[0, '#0f766e'], [0.4, '#115e59'], [0.8, '#134e4a'], [1, '#042f2e']])}
    ${linGrad(id('l4-basalt'), [[0, '#334155'], [0.5, '#1e293b'], [1, '#0f172a']])}
    ${linGrad(id('l5-obsidian'), [[0, '#1c1917'], [0.5, '#0c0a09'], [1, '#000000']])}
    ${linGrad(id('gold-key'), [[0, '#fffbeb'], [0.4, '#fde047'], [0.8, '#d97706'], [1, '#78350f']])}
    <filter id="${id('geode-bloom')}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  const cliffLeft = 140;
  const cliffRight = 720;
  const cliffWidth = cliffRight - cliffLeft;

  // Strata boundary y-coordinates (5 layers)
  // L1: 90 to 160 (h=70)
  // L2: 160 to 245 (h=85)
  // L3: 245 to 335 (h=90)
  // L4: 335 to 430 (h=95)
  // L5: 430 to 540 (h=110)

  // 1. Stratigraphic Cliff Layers (Polygons with organic wavy boundary lines)
  const layerPaths = [];
  const boundaries = [90, 160, 245, 335, 430, 540];

  // Helper to make an organic geological boundary path
  function makeWaveLine(yBase, amp, seed) {
    const r = rng(seed);
    const pts = [];
    for (let x = cliffLeft; x <= cliffRight; x += 30) {
      const y = yBase + (r() - 0.5) * amp;
      pts.push([x, y]);
    }
    return pts;
  }

  const w0 = makeWaveLine(boundaries[0], 6, 1);
  const w1 = makeWaveLine(boundaries[1], 12, 2);
  const w2 = makeWaveLine(boundaries[2], 14, 3);
  const w3 = makeWaveLine(boundaries[3], 14, 4);
  const w4 = makeWaveLine(boundaries[4], 16, 5);
  const w5 = makeWaveLine(boundaries[5], 8, 6);

  function polyFromWaves(topWave, botWave) {
    const reversedBot = [...botWave].reverse();
    return [...topWave, ...reversedBot].map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
  }

  // Layer 1: Ephemeral Pumice & Ash (Top Surface)
  const l1Poly = polyFromWaves(w0, w1);
  // Layer 2: Episodic Sandstone (Crimson / Terracotta Sedimentary Bands)
  const l2Poly = polyFromWaves(w1, w2);
  // Layer 3: Semantic Metamorphic Schist (Verdigris / Emerald Foliated Slate)
  const l3Poly = polyFromWaves(w2, w3);
  // Layer 4: Procedural Basalt (Hexagonal Prism Columns)
  const l4Poly = polyFromWaves(w3, w4);
  // Layer 5: Molten Obsidian Bedrock Core
  const l5Poly = polyFromWaves(w4, w5);

  // 2. Embedded Fossils, Crystals & Glyphs in each Stratum
  // L1: Volcanic quartz crystals & transient sensory sparks
  const l1Details = Array.from({ length: 8 }, (_, i) => {
    const qx = cliffLeft + 40 + i * 65;
    const qy = 125 + (i % 3) * 8;
    return `
      <polygon points="${qx},${qy - 8} ${qx + 5},${qy} ${qx},${qy + 8} ${qx - 5},${qy}" fill="#fff" opacity="0.85"/>
      <circle cx="${qx + 18}" cy="${qy - 4}" r="1.5" fill="#facc15" filter="${id.url('glow')}"/>
    `;
  }).join('');

  // L2: Ammonite fossil spiral & journal ledger lines
  const l2Details = `
    <!-- Ammonite Memory Fossil -->
    <g transform="translate(260, 202)">
      <path d="M0 0 A6 6 0 0 1 6 6 A12 12 0 0 1 -6 12 A18 18 0 0 1 -18 -6 A24 24 0 0 1 6 -24 A30 30 0 0 1 30 6" fill="none" stroke="#fde047" stroke-width="1.6" opacity="0.75"/>
      <circle cx="0" cy="0" r="3" fill="#fde047"/>
      <text x="36" y="9" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="#fed7aa">EPISODE #0412</text>
    </g>
    <!-- Sedimentary Rock Ribbons -->
    ${Array.from({ length: 4 }, (_, i) => `
      <line x1="${cliffLeft + 20}" y1="${180 + i * 16}" x2="${cliffRight - 20}" y2="${182 + i * 16}" stroke="#fed7aa" stroke-opacity="0.3" stroke-width="1.2" stroke-dasharray="8 6"/>
    `).join('')}`;

  // L3: Semantic Knowledge Graph Nodes & Neural Mycelium
  const l3Details = `
    <!-- Glowing Knowledge Graph Clusters -->
    <g class="semantic-graph" transform="translate(480, 290)">
      ${[
        [0, 0, '#5eead4', 'IDENTITY'],
        [-60, -18, '#2dd4bf', 'SKILL::DSP'],
        [70, -15, '#2dd4bf', 'NETCODE::60HZ'],
        [-35, 24, '#99f6e4', 'HERMES::DAG'],
        [50, 22, '#99f6e4', 'CODEC::64B']
      ].map(([gx, gy, col, lbl]) => `
        <line x1="0" y1="0" x2="${gx}" y2="${gy}" stroke="#2dd4bf" stroke-opacity="0.6" stroke-width="1.2"/>
        <circle cx="${gx}" cy="${gy}" r="6" fill="${col}" filter="${id.url('glow')}"/>
        <circle cx="${gx}" cy="${gy}" r="2.5" fill="#fff"/>
        <text x="${gx}" y="${gy + 14}" font-family="IBM Plex Mono, monospace" font-size="5.5" font-weight="700" fill="#ccfbf1" text-anchor="middle">${lbl}</text>
      `).join('')}
    </g>`;

  // L4: Basalt Prisms (Giant's Causeway Columns)
  const l4Details = `
    <g class="basalt-columns">
      ${Array.from({ length: 14 }, (_, i) => {
        const bx = cliffLeft + 25 + i * 40;
        return `
          <rect x="${bx}" y="355" width="28" height="60" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <line x1="${bx + 14}" y1="355" x2="${bx + 14}" y2="415" stroke="#64748b" stroke-width="0.8"/>
          <text x="${bx + 14}" y="388" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8" text-anchor="middle">fn_${i + 1}</text>
        `;
      }).join('')}
    </g>`;

  // L5: Molten Bedrock Core & Ed25519 Cryptographic Steward Gate Geode Vault
  const l5Details = `
    <g class="steward-gate-vault">
      <!-- Ambient Molten Heat Glow -->
      <circle cx="430" cy="485" r="160" fill="${id.url('vault-glow')}"/>

      <!-- Crystalline Geode Cave Chamber -->
      <path d="M310 520 Q310 435 430 435 Q550 435 550 520 Z" fill="#0c0a09" stroke="#f59e0b" stroke-width="2.5"/>
      <!-- Internal Crystal Geode Spikes -->
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI) / 15;
        const cxp = 430 + Math.cos(Math.PI + a) * 115;
        const cyp = 520 + Math.sin(Math.PI + a) * 75;
        return `
          <polygon points="${r2(cxp)},${r2(cyp)} ${r2(cxp + 8)},${r2(cyp + 18)} ${r2(cxp - 8)},${r2(cyp + 18)}" fill="#fde047" stroke="#b45309" stroke-width="0.8"/>
        `;
      }).join('')}

      <!-- Center Cryptographic Seal: Ed25519 Key Tablet -->
      <rect x="375" y="455" width="110" height="58" rx="4" fill="#1c1917" stroke="#facc15" stroke-width="2"/>
      <rect x="380" y="460" width="100" height="48" rx="2" fill="none" stroke="#fef08a" stroke-dasharray="2 2" stroke-width="0.8"/>

      <!-- Key Symbol & Seal Text -->
      <circle cx="400" cy="484" r="8" fill="none" stroke="#fde047" stroke-width="2"/>
      <path d="M408 484 L422 484 M416 484 L416 490 M420 484 L420 488" stroke="#fde047" stroke-width="2"/>
      <text x="430" y="478" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="#fef08a">STEWARD GATE</text>
      <text x="430" y="492" font-family="IBM Plex Mono, monospace" font-size="6" fill="#fde047">ED25519 SEALED</text>

      <text x="430" y="534" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="#fde047" text-anchor="middle">IMMUTABLE COVENANT // ZERO DRIFT</text>
    </g>`;

  // 3. Left Geological Core Sample Drill Tube with Metric Depth Scale
  const coreDrill = `
    <g class="core-drill" transform="translate(65, 80)">
      <!-- Cylinder Casing -->
      <rect x="0" y="0" width="38" height="470" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
      <!-- Inner Glass Core Tube -->
      <rect x="6" y="8" width="26" height="454" rx="2" fill="none" stroke="#64748b" stroke-width="1"/>

      <!-- Strata sample segments inside cylinder -->
      <rect x="8" y="10" width="22" height="65" fill="${id.url('l1-pumice')}"/>
      <rect x="8" y="75" width="22" height="85" fill="${id.url('l2-sandstone')}"/>
      <rect x="8" y="160" width="22" height="90" fill="${id.url('l3-schist')}"/>
      <rect x="8" y="250" width="22" height="95" fill="${id.url('l4-basalt')}"/>
      <rect x="8" y="345" width="22" height="115" fill="${id.url('l5-obsidian')}"/>

      <!-- Glass Specular Highlight -->
      <rect x="10" y="8" width="4" height="454" fill="#fff" opacity="0.3"/>

      <!-- Metric Depth Ticks & Labels -->
      ${[
        [10, '0m · L1'],
        [75, '-50m · L2'],
        [160, '-250m · L3'],
        [250, '-1000m · L4'],
        [345, '-5000m · L5']
      ].map(([dy, txt]) => `
        <line x1="38" y1="${dy}" x2="48" y2="${dy}" stroke="#facc15" stroke-width="1.2"/>
        <text x="-4" y="${dy + 3}" font-family="IBM Plex Mono, monospace" font-size="6" font-weight="600" fill="#94a3b8" text-anchor="end">${txt}</text>
      `).join('')}
    </g>`;

  // Layer Title Tags on Right Edge
  const layerTags = [
    { y: 130, t: 'L1 // EPHEMERAL SENSORY BUFFER', col: '#d6c7b2' },
    { y: 205, t: 'L2 // EPISODIC JOURNAL ARCHIVE', col: '#fb923c' },
    { y: 290, t: 'L3 // SEMANTIC KNOWLEDGE GRAPH', col: '#2dd4bf' },
    { y: 385, t: 'L4 // PROCEDURAL SKILL VAULT', col: '#94a3b8' },
    { y: 490, t: 'L5 // CORE IDENTITY COVENANT', col: '#facc15' }
  ].map((tag) => `
    <g transform="translate(${cliffRight + 12}, ${tag.y})">
      <line x1="-12" y1="0" x2="0" y2="0" stroke="${tag.col}" stroke-width="1.2"/>
      <text x="4" y="3" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="${tag.col}">${tag.t}</text>
    </g>
  `).join('');

  const body = `
    <!-- Deep Subterranean Earth Background -->
    ${bleedRect('#080402')}
    <!-- Halftone geological grain -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.15"/>

    <!-- Stratigraphic Rock Polygons -->
    <polygon points="${l5Poly}" fill="${id.url('l5-obsidian')}" stroke="#000" stroke-width="1"/>
    <polygon points="${l4Poly}" fill="${id.url('l4-basalt')}" stroke="#1e293b" stroke-width="1"/>
    <polygon points="${l3Poly}" fill="${id.url('l3-schist')}" stroke="#064e3b" stroke-width="1"/>
    <polygon points="${l2Poly}" fill="${id.url('l2-sandstone')}" stroke="#7c2d12" stroke-width="1"/>
    <polygon points="${l1Poly}" fill="${id.url('l1-pumice')}" stroke="#786a55" stroke-width="1"/>

    <!-- Strata Details & Embedded Artifacts -->
    ${l1Details}
    ${l2Details}
    ${l3Details}
    ${l4Details}
    ${l5Details}

    <!-- Left Core Drill Cylinder -->
    ${coreDrill}

    <!-- Right Margin Strata Tags -->
    ${layerTags}

    <!-- Technical Annotations -->
    ${label(400, 52, 'PLATE XIII · “THE FIVE GEOLOGICAL STRATA”', { size: 9, fill: '#facc15', plate: 'rgba(20,10,3,0.92)', pad: 5, anchor: 'middle' })}
    ${label(400, 565, 'BECOMUSSY 5-LAYER MEMORY STRATIGRAPHY & ED25519 STEWARD GATE', { size: 7.5, fill: '#f59e0b', anchor: 'middle' })}`;

  return {
    title: 'The Five Geological Strata',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate XIII: The Five Geological Strata — five-layer agent memory stratigraphy and Ed25519 Steward Gate geode vault',
      defs,
      body
    })
  };
}
