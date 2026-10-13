/**
 * PLATE // WARPI — “THE AIR-GAPPED MONOLITH”
 * Native Rust PTY multiplexer & air-gapped Pi coding helper: a detailed green PCB
 * single-board computer (SoC, 40-pin GPIO, ports, SMD components, circuit traces)
 * with floating translucent terminal command blocks rising in phosphor green projection.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba, makeIso, isoBoxSvg
} from '../svg-kit.js';

export default function warpiPlate(proj) {
  const id = scope('pl-warpi');
  const rand = rng(109);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #15803d Phosphor Green
  const sec = proj.secondaryInkHex; // #1e293b Charcoal

  const iso = makeIso({ ox: 380, oy: 380, sx: 0.866, sy: 0.42 });

  const defs = `
    ${standardDefs(id, { ink: '#052e16', dot: 0.75, gap: 5 })}
    ${radGrad(id('terminal-glow'), [[0, '#4ade80', 0.35], [0.45, '#16a34a', 0.15], [0.85, '#14532d', 0.04], [1, '#021206', 0]], { cx: 380, cy: 300, r: 350, units: 'userSpaceOnUse' })}
    ${linGrad(id('pcb-green'), [[0, '#15803d'], [0.45, '#166534'], [1, '#14532d']])}
    ${linGrad(id('soc-silver'), [[0, '#e2e8f0'], [0.4, '#94a3b8'], [0.8, '#475569'], [1, '#1e293b']])}
    ${linGrad(id('gold-pin'), [[0, '#fef08a'], [0.5, '#eab308'], [1, '#a16207']])}
    ${linGrad(id('port-metal'), [[0, '#cbd5e1'], [0.5, '#64748b'], [1, '#334155']])}
    <filter id="${id('phosphor-bloom')}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. Single-Board Computer Green PCB (Isometric View at z=0)
  const pcbSBC = `
    <!-- Drop Shadow -->
    <ellipse cx="380" cy="445" rx="270" ry="50" fill="#000" opacity="0.65" filter="${id.url('soft')}"/>

    <!-- Main Green FR4 Fiberglass PCB Board (380x250x12) -->
    ${isoBoxSvg(iso, [-200, -130, 0, 400, 260, 12], {
      top: id.url('pcb-green'),
      left: '#0f3d1f',
      right: '#0b2b15',
      edge: '#4ade80',
      edgeW: 1.2
    })}

    <!-- Copper Circuit Traces on PCB Surface -->
    ${[
      [-160, -90, -70, -90, -70, -30],
      [-160, -70, -90, -70, -90, -10],
      [50, -90, 110, -90, 110, -40],
      [50, -70, 90, -70, 90, -20],
      [-50, 40, -50, 80, 20, 80],
      [-30, 40, -30, 60, 40, 60]
    ].map((coords) => {
      const p1 = iso(coords[0], coords[1], 12);
      const p2 = iso(coords[2], coords[3], 12);
      const p3 = iso(coords[4], coords[5], 12);
      return `<path d="M${r2(p1[0])} ${r2(p1[1])} L${r2(p2[0])} ${r2(p2[1])} L${r2(p3[0])} ${r2(p3[1])}" fill="none" stroke="#facc15" stroke-opacity="0.45" stroke-width="1.2"/>`;
    }).join('')}

    <!-- Broadcom 64-bit SoC CPU with Heatspreader (Center of Board) -->
    ${isoBoxSvg(iso, [-45, -45, 12, 90, 90, 10], {
      top: id.url('soc-silver'),
      left: '#334155',
      right: '#1e293b',
      edge: '#f1f5f9',
      edgeW: 0.8
    })}
    <!-- Laser etched SoC text -->
    <g transform="translate(${r2(iso(0, 0, 22)[0])}, ${r2(iso(0, 0, 22)[1])})">
      <text x="0" y="-3" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="#1e293b" text-anchor="middle" letter-spacing="0.1em">BCM2712</text>
      <text x="0" y="6" font-family="IBM Plex Mono, monospace" font-size="5.5" fill="#334155" text-anchor="middle">QUAD CORTEX-A76</text>
    </g>

    <!-- 40-Pin Dual-Row GPIO Header (Gold Pins along Top Edge) -->
    ${Array.from({ length: 20 }, (_, i) => {
      const px = -160 + i * 16;
      return `
        ${isoBoxSvg(iso, [px, -120, 12, 6, 6, 18], { top: id.url('gold-pin'), left: '#a16207', right: '#78350f' })}
        ${isoBoxSvg(iso, [px, -108, 12, 6, 6, 18], { top: id.url('gold-pin'), left: '#a16207', right: '#78350f' })}
      `;
    }).join('')}

    <!-- Dual USB 3.0 Ports (Stacked Blue Inserts) -->
    ${isoBoxSvg(iso, [160, -100, 12, 45, 65, 34], {
      top: id.url('port-metal'),
      left: '#475569',
      right: '#334155',
      edge: '#cbd5e1',
      edgeW: 1
    })}

    <!-- RJ45 Gigabit Ethernet Port -->
    ${isoBoxSvg(iso, [160, -20, 12, 45, 60, 32], {
      top: id.url('port-metal'),
      left: '#475569',
      right: '#334155',
      edge: '#cbd5e1',
      edgeW: 1
    })}

    <!-- USB-C Power & Micro-HDMI Ports -->
    ${isoBoxSvg(iso, [-180, 110, 12, 28, 20, 12], { top: id.url('port-metal'), left: '#334155', right: '#1e293b' })}
    ${isoBoxSvg(iso, [-130, 110, 12, 24, 18, 10], { top: id.url('port-metal'), left: '#334155', right: '#1e293b' })}

    <!-- Surface-mount capacitors & status LEDs -->
    ${[-80, -60, -40, 20, 40].map((x) => `
      <circle cx="${r2(iso(x, 70, 12)[0])}" cy="${r2(iso(x, 70, 12)[1])}" r="3.5" fill="#94a3b8" stroke="#1e293b" stroke-width="0.8"/>
    `).join('')}
    <circle cx="${r2(iso(-185, 90, 12)[0])}" cy="${r2(iso(-185, 90, 12)[1])}" r="2.5" fill="#22c55e" filter="${id.url('glow')}"/>
    <circle cx="${r2(iso(-175, 90, 12)[0])}" cy="${r2(iso(-175, 90, 12)[1])}" r="2.5" fill="#ea580c"/>`;

  // 2. Floating Phosphor Terminal Command Blocks (Projected above hardware at z=60...180)
  // Command Block 1: Cargo Test Suite Execution
  const block1 = `
    <g class="cmd-block-1" transform="translate(180, 130)">
      <rect x="0" y="0" width="280" height="90" rx="4" fill="rgba(6,22,12,0.92)" stroke="#22c55e" stroke-width="1.4"/>
      <rect x="0" y="0" width="280" height="18" fill="#14532d"/>
      <circle cx="10" cy="9" r="3" fill="#ef4444"/>
      <circle cx="20" cy="9" r="3" fill="#facc15"/>
      <circle cx="30" cy="9" r="3" fill="#22c55e"/>
      <text x="42" y="12" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="600" fill="#dcfce7">PTY BLOCK #01 · RUST CARGO HARNESS</text>

      <text x="12" y="34" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#4ade80">&gt; cargo test --workspace [14ms lock]</text>
      <text x="12" y="48" font-family="IBM Plex Mono, monospace" font-size="7" fill="#86efac">  test pty::demux_vt100_stream ... ok</text>
      <text x="12" y="60" font-family="IBM Plex Mono, monospace" font-size="7" fill="#86efac">  test pi_sidecar::zero_cloud_socket ... ok</text>
      <text x="12" y="74" font-family="IBM Plex Mono, monospace" font-size="7.5" font-weight="700" fill="#22c55e">test result: ok. 14 passed; 0 failed; 0 ignored</text>
    </g>`;

  // Command Block 2: 120Hz WGPU Glyph Texture Atlas
  const block2 = `
    <g class="cmd-block-2" transform="translate(480, 160)">
      <rect x="0" y="0" width="240" height="110" rx="4" fill="rgba(6,22,12,0.92)" stroke="#16a34a" stroke-width="1.2"/>
      <rect x="0" y="0" width="240" height="18" fill="#14532d"/>
      <text x="10" y="12" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="#dcfce7" letter-spacing="0.08em">WGPU GLYPH TEXTURE ATLAS (120HZ)</text>

      <!-- Glyph Cache Grid Matrix -->
      ${Array.from({ length: 4 }, (_, r) => {
        return Array.from({ length: 8 }, (__, c) => {
          const gx = 14 + c * 26;
          const gy = 26 + r * 18;
          const char = ['F', 'n', '&gt;', '{', '}', '$', '_', ';', 'P', 'T', 'Y', '1', '2', '0', 'H', 'z', 'W', 'a', 'r', 'p', 'i', 'O', 'S', '8', '0', 'x', '7', 'F', '4', '5', '4', 'C'][(r * 8 + c) % 32];
          return `
            <rect x="${gx}" y="${gy}" width="22" height="15" rx="1" fill="#052e16" stroke="#22c55e" stroke-width="0.5"/>
            <text x="${gx + 11}" y="${gy + 10.5}" font-family="IBM Plex Mono, monospace" font-size="7" fill="#86efac" text-anchor="middle">${char}</text>
          `;
        }).join('');
      }).join('')}
      <text x="10" y="103" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#86efac">GPU VRAM: 1.8MB · ZERO RE-RASTER</text>
    </g>`;

  // Light projection beams rising from PCB up to floating blocks
  const projectionBeams = `
    <path d="M${r2(iso(0, 0, 22)[0])} ${r2(iso(0, 0, 22)[1])} L320 220" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.65"/>
    <path d="M${r2(iso(120, -50, 22)[0])} ${r2(iso(120, -50, 22)[1])} L600 270" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.65"/>`;

  const body = `
    <!-- Dark Laboratory Background -->
    ${bleedRect('#030d07')}
    <!-- Halftone grid -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.12"/>

    <!-- Green Terminal Phosphor Halo -->
    <circle cx="380" cy="300" r="350" fill="${id.url('terminal-glow')}"/>

    <!-- Single-Board Computer PCB Base -->
    ${pcbSBC}

    <!-- Projection Beams & Terminal Command Blocks -->
    ${projectionBeams}
    ${block1}
    ${block2}

    <!-- Technical Annotations -->
    ${label(400, 65, 'PLATE XI · “THE AIR-GAPPED MONOLITH”', { size: 9, fill: '#86efac', plate: 'rgba(5,30,12,0.9)', pad: 5, anchor: 'middle' })}
    ${label(400, 525, '14MS RUST PTY RUNTIME · AIR-GAPPED PI SIDECAR (ZERO CLOUD SOCKETS)', { size: 7.5, fill: '#4ade80', anchor: 'middle' })}`;

  return {
    title: 'The Air-Gapped Monolith',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate XI: The Air-Gapped Monolith — green SBC circuit board with floating WGPU terminal command blocks',
      defs,
      body
    })
  };
}
