/**
 * PLATE // JAMMATE — “THE VACUUM & THE BEAM”
 * Real-time audio DSP laboratory workbench: a Tektronix-style dual-trace oscilloscope
 * with a glowing teal phosphor CRT graticule and tanh-clipped overdrive waveform,
 * beside a glowing 12AX7 vacuum tube with an incandescent orange filament coil,
 * knurled potentiometer knobs, and a coiled tweed guitar cable with nickel 1/4" plug.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba
} from '../svg-kit.js';

export default function jammatePlate(proj) {
  const id = scope('pl-jam');
  const rand = rng(103);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #0f766e Teal
  const sec = proj.secondaryInkHex; // #d97706 Amber Phosphor

  const defs = `
    ${standardDefs(id, { ink: '#042220', dot: 0.75, gap: 5 })}
    ${radGrad(id('crt-glow'), [[0, '#2dd4bf', 0.85], [0.35, '#0d9488', 0.35], [0.75, '#042f2e', 0.1], [1, '#021817', 0]], { cx: 280, cy: 300, r: 240, units: 'userSpaceOnUse' })}
    ${radGrad(id('filament-glow'), [[0, '#fffbeb', 1], [0.2, '#fde047', 0.85], [0.55, '#ea580c', 0.45], [0.85, '#7c2d12', 0.15], [1, '#1e0903', 0]], { cx: 640, cy: 260, r: 180, units: 'userSpaceOnUse' })}
    ${linGrad(id('bench-mat'), [[0, '#131b24'], [0.5, '#1e293b'], [1, '#0f172a']], { x1: 0, y1: 220, x2: 0, y2: 600, units: 'userSpaceOnUse' })}
    ${linGrad(id('tek-chassis'), [[0, '#475569'], [0.5, '#334155'], [1, '#1e293b']])}
    ${linGrad(id('tek-front'), [[0, '#243242'], [0.4, '#1b2533'], [1, '#131c26']])}
    ${radGrad(id('crt-glass'), [[0, '#042f2e'], [0.65, '#02201f'], [1, '#011211']], { cx: 0.48, cy: 0.46, r: 0.75 })}
    ${linGrad(id('knob-brass'), [[0, '#e2e8f0'], [0.4, '#94a3b8'], [0.8, '#475569'], [1, '#1e293b']])}
    ${linGrad(id('tube-glass'), [[0, 'rgba(255,255,255,0.45)'], [0.25, 'rgba(180,230,255,0.12)'], [0.7, 'rgba(100,180,240,0.04)'], [1, 'rgba(255,255,255,0.35)']])}
    ${linGrad(id('nickel-plate'), [[0, '#94a3b8'], [0.4, '#475569'], [0.8, '#1e293b'], [1, '#0f172a']])}
    ${linGrad(id('tweed'), [[0, '#ca8a04'], [0.5, '#a16207'], [1, '#713f12']])}
    <clipPath id="${id('crt-clip')}">
      <rect x="130" y="160" width="280" height="230" rx="20"/>
    </clipPath>`;

  // Waveform calculation: fundamental + 3rd harmonic tanh-clipped
  const wavePoints = [];
  for (let x = 130; x <= 410; x += 2) {
    const norm = (x - 130) / 280;
    const theta = norm * Math.PI * 6;
    const raw = Math.sin(theta) * 0.75 + Math.sin(theta * 3) * 0.28;
    const clipped = Math.tanh(raw * 2.2);
    const y = 275 - clipped * 72;
    wavePoints.push([x, y]);
  }
  const wavePath = 'M' + wavePoints.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L');

  // Input sine wave (dimmer cyan trace)
  const inputPoints = [];
  for (let x = 130; x <= 410; x += 2) {
    const norm = (x - 130) / 280;
    const theta = norm * Math.PI * 6;
    const raw = Math.sin(theta) * 45;
    const y = 275 - raw;
    inputPoints.push([x, y]);
  }
  const inputWavePath = 'M' + inputPoints.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L');

  // Tektronix Oscilloscope Chassis & CRT Assembly
  const scopeChassis = `
    <!-- Drop Shadow -->
    <ellipse cx="280" cy="465" rx="210" ry="24" fill="#000" opacity="0.6" filter="${id.url('soft')}"/>

    <!-- Main Steel Cabinet -->
    <path d="M70 110 L480 110 L500 440 L60 440 Z" fill="${id.url('tek-chassis')}" stroke="#94a3b8" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M60 440 L500 440 L495 450 L55 450 Z" fill="#0f172a"/>
    <!-- Aluminum Front Panel Inset -->
    <rect x="75" y="125" width="405" height="305" rx="8" fill="${id.url('tek-front')}" stroke="#64748b" stroke-width="1"/>

    <!-- Left: Bezel & CRT Screen -->
    <rect x="115" y="145" width="310" height="260" rx="24" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <rect x="130" y="160" width="280" height="230" rx="20" fill="${id.url('crt-glass')}"/>

    <g clip-path="url(#${id('crt-clip')})">
      <!-- Ambient phosphor glow -->
      <ellipse cx="270" cy="275" rx="130" ry="100" fill="#2dd4bf" opacity="0.16" filter="${id.url('glow-lg')}"/>

      <!-- 8x10 CRT Precision Graticule Grid -->
      ${Array.from({ length: 9 }, (_, r) => {
        const y = 175 + r * 25;
        const isCenter = r === 4;
        return `<line x1="130" y1="${y}" x2="410" y2="${y}" stroke="#0f766e" stroke-opacity="${isCenter ? 0.7 : 0.35}" stroke-width="${isCenter ? 1.2 : 0.6}" ${isCenter ? '' : 'stroke-dasharray="2 3"'}/>`;
      }).join('')}
      ${Array.from({ length: 11 }, (_, c) => {
        const x = 145 + c * 25;
        const isCenter = c === 5;
        return `<line x1="${x}" y1="160" x2="${x}" y2="390" stroke="#0f766e" stroke-opacity="${isCenter ? 0.7 : 0.35}" stroke-width="${isCenter ? 1.2 : 0.6}" ${isCenter ? '' : 'stroke-dasharray="2 3"'}/>`;
      }).join('')}

      <!-- Center Crosshair Tick Sub-divisions -->
      ${Array.from({ length: 25 }, (_, i) => {
        const x = 145 + i * 10;
        return `<line x1="${x}" y1="272" x2="${x}" y2="278" stroke="#2dd4bf" stroke-width="0.8" opacity="0.8"/>`;
      }).join('')}
      ${Array.from({ length: 19 }, (_, i) => {
        const y = 175 + i * 10;
        return `<line x1="267" y1="${y}" x2="273" y2="${y}" stroke="#2dd4bf" stroke-width="0.8" opacity="0.8"/>`;
      }).join('')}

      <!-- Channel 1: Clean Sine Input (dimmer teal) -->
      <path d="${inputWavePath}" fill="none" stroke="#0d9488" stroke-width="1.4" opacity="0.45" stroke-dasharray="3 3"/>

      <!-- Channel 2: Tanh Overdrive Phosphor Trace with Persistence -->
      <path d="${wavePath}" fill="none" stroke="#2dd4bf" stroke-width="6" opacity="0.25" filter="${id.url('glow')}"/>
      <path d="${wavePath}" fill="none" stroke="#2dd4bf" stroke-width="3" opacity="0.75" filter="${id.url('glow')}"/>
      <path d="${wavePath}" fill="none" stroke="#e6fffa" stroke-width="1.4" opacity="0.95"/>

      <!-- Graticule Screen Readout Text -->
      <text x="142" y="180" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#5eead4" font-weight="600">CH1 1.0V/DIV · 1kHz</text>
      <text x="142" y="380" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#2dd4bf" font-weight="600">CH2 TANH OD [CLIPPED]</text>
      <text x="398" y="180" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#fde047" font-weight="600" text-anchor="end">Δt: 2.6ms</text>
      <text x="398" y="380" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#5eead4" font-weight="600" text-anchor="end">64 SPLS</text>

      <!-- Glass Curved Reflection -->
      <path d="M130 160 Q270 190 410 160 L410 200 Q270 230 130 200 Z" fill="#fff" opacity="0.04"/>
    </g>

    <!-- Scope Controls Column (Right of Screen) -->
    <g class="scope-controls" transform="translate(435, 145)">
      <!-- Channel 1 Volts/Div Knob -->
      <circle cx="25" cy="30" r="15" fill="${id.url('knob-brass')}" stroke="#0f172a" stroke-width="1"/>
      <line x1="25" y1="30" x2="33" y2="19" stroke="#fff" stroke-width="2"/>
      <text x="25" y="54" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8" text-anchor="middle">VOLTS/DIV</text>

      <!-- Channel 2 Volts/Div Knob -->
      <circle cx="25" cy="85" r="15" fill="${id.url('knob-brass')}" stroke="#0f172a" stroke-width="1"/>
      <line x1="25" y1="85" x2="16" y2="74" stroke="#2dd4bf" stroke-width="2"/>
      <text x="25" y="109" font-family="IBM Plex Mono, monospace" font-size="6" fill="#2dd4bf" text-anchor="middle">GAIN (OD)</text>

      <!-- Time/Div Knob (larger master) -->
      <circle cx="25" cy="155" r="18" fill="${id.url('knob-brass')}" stroke="#0f172a" stroke-width="1.2"/>
      <line x1="25" y1="155" x2="25" y2="139" stroke="#fbbf24" stroke-width="2"/>
      <text x="25" y="183" font-family="IBM Plex Mono, monospace" font-size="6" fill="#fbbf24" text-anchor="middle">TIME/DIV</text>

      <!-- BNC Connectors -->
      <circle cx="25" cy="220" r="8" fill="#475569" stroke="#94a3b8" stroke-width="1"/>
      <circle cx="25" cy="220" r="3" fill="#000"/>
      <text x="25" y="236" font-family="IBM Plex Mono, monospace" font-size="5.5" fill="#94a3b8" text-anchor="middle">CH1 IN</text>

      <circle cx="25" cy="255" r="8" fill="#475569" stroke="#2dd4bf" stroke-width="1"/>
      <circle cx="25" cy="255" r="3" fill="#000"/>
      <text x="25" y="271" font-family="IBM Plex Mono, monospace" font-size="5.5" fill="#2dd4bf" text-anchor="middle">CH2 IN</text>
    </g>`;

  // 12AX7 Vacuum Tube (Thermionic Valve) Assembly (Right)
  const vacuumTube = `
    <g class="vacuum-tube" transform="translate(640, 260)">
      <!-- Cast Shadow & Filament Glow Aura -->
      <ellipse cx="0" cy="180" rx="65" ry="18" fill="#000" opacity="0.65" filter="${id.url('soft')}"/>
      <circle cx="0" cy="10" r="150" fill="${id.url('filament-glow')}" style="mix-blend-mode:screen;" opacity="0.85"/>

      <!-- Bakelite / Ceramic 9-Pin Socket Base -->
      <ellipse cx="0" cy="160" rx="48" ry="16" fill="#1c1917" stroke="#44403c" stroke-width="1.5"/>
      <path d="M-48 160 L-46 178 Q0 196 46 178 L48 160 Z" fill="#292524" stroke="#44403c" stroke-width="1"/>
      <!-- Gold-Plated Pins extending into chassis -->
      ${[-32, -18, -6, 6, 18, 32].map((x) => `<rect x="${x - 1.5}" y="174" width="3" height="14" fill="#facc15" stroke="#ca8a04" stroke-width="0.5"/>`).join('')}

      <!-- Internal Triode Elements (Inside Vacuum) -->
      <!-- Support Rods -->
      <line x1="-24" y1="-70" x2="-24" y2="150" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="24" y1="-70" x2="24" y2="150" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Mica Spacer Discs (Top and Bottom) -->
      <ellipse cx="0" cy="-65" rx="38" ry="8" fill="#f1f5f9" opacity="0.6" stroke="#94a3b8" stroke-width="0.8"/>
      <ellipse cx="0" cy="135" rx="38" ry="8" fill="#f1f5f9" opacity="0.6" stroke="#94a3b8" stroke-width="0.8"/>

      <!-- Nickel Plate Anodes (Dual Triode Cylinders) -->
      <rect x="-20" y="-45" width="16" height="150" rx="3" fill="${id.url('nickel-plate')}" stroke="#94a3b8" stroke-width="0.8"/>
      <rect x="4" y="-45" width="16" height="150" rx="3" fill="${id.url('nickel-plate')}" stroke="#94a3b8" stroke-width="0.8"/>
      <!-- Plate cooling ribs / slots -->
      ${Array.from({ length: 9 }, (_, i) => `
        <rect x="-18" y="${-35 + i * 16}" width="12" height="6" fill="#0f172a" opacity="0.75"/>
        <rect x="6" y="${-35 + i * 16}" width="12" height="6" fill="#0f172a" opacity="0.75"/>
      `).join('')}

      <!-- Cathode & Incandescent Filament Coils (Orange/Yellow Glow) -->
      <rect x="-14" y="-30" width="4" height="120" rx="1" fill="#ea580c"/>
      <rect x="10" y="-30" width="4" height="120" rx="1" fill="#ea580c"/>
      <!-- Glowing Filament Wire -->
      <path d="M-12 -25 L-12 85" stroke="#fef08a" stroke-width="2.2" filter="${id.url('glow')}"/>
      <path d="M12 -25 L12 85" stroke="#fef08a" stroke-width="2.2" filter="${id.url('glow')}"/>
      <path d="M-12 -25 L-12 85" stroke="#fff" stroke-width="0.8"/>
      <path d="M12 -25 L12 85" stroke="#fff" stroke-width="0.8"/>

      <!-- Blue Gas Ionization Glow around Cathode Base -->
      <ellipse cx="-12" cy="70" rx="12" ry="25" fill="#38bdf8" opacity="0.35" filter="${id.url('glow')}"/>
      <ellipse cx="12" cy="70" rx="12" ry="25" fill="#38bdf8" opacity="0.35" filter="${id.url('glow')}"/>

      <!-- Top Getter Mirror Deposit (Silver Flash at Tip) -->
      <path d="M-36 -80 Q0 -130 36 -80 Q0 -95 -36 -80 Z" fill="#e2e8f0" opacity="0.85" filter="${id.url('soft')}"/>

      <!-- Glass Envelope (Tubular with Domed Tip) -->
      <path d="M-44 150 L-44 -60 Q-44 -125 0 -125 Q44 -125 44 -60 L44 150 Q0 162 -44 150 Z" fill="${id.url('tube-glass')}" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>

      <!-- Specular Highlights on Glass -->
      <path d="M-38 140 L-38 -55 Q-38 -110 -6 -118" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.65" stroke-linecap="round"/>
      <path d="M38 140 L38 -45" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.4" stroke-linecap="round"/>

      <!-- Tube Etched Type Text -->
      <text x="0" y="35" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="9" fill="#fde047" opacity="0.8" text-anchor="middle" letter-spacing="0.12em">12AX7 / ECC83</text>
      <text x="0" y="47" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#fef08a" opacity="0.75" text-anchor="middle">TRIODE STAGE 1</text>
    </g>`;

  // Coiled Tweed Guitar Cable with Nickel 1/4" Plug (Foreground)
  const guitarCable = `
    <g class="guitar-cable" transform="translate(520, 480)">
      <!-- Braided Tweed Cable Loop -->
      <path d="M-180 -30 Q-110 30 -40 20 Q50 10 140 45 Q210 70 260 20 Q280 -10 240 -40 Q180 -70 80 -40 Q-20 -10 -80 0" fill="none" stroke="#1c1917" stroke-width="14" opacity="0.6" filter="${id.url('soft')}"/>
      <path d="M-180 -30 Q-110 30 -40 20 Q50 10 140 45 Q210 70 260 20 Q280 -10 240 -40 Q180 -70 80 -40 Q-20 -10 -80 0" fill="none" stroke="${id.url('tweed')}" stroke-width="10"/>
      <!-- Tweed Cross-Hatch Pattern -->
      <path d="M-180 -30 Q-110 30 -40 20 Q50 10 140 45 Q210 70 260 20 Q280 -10 240 -40 Q180 -70 80 -40 Q-20 -10 -80 0" fill="none" stroke="#451a03" stroke-width="10" stroke-dasharray="3 4"/>

      <!-- Nickel 1/4" Jack Plug -->
      <g transform="translate(-180, -32) rotate(-15)">
        <!-- Rubber strain relief boot -->
        <rect x="-15" y="-6" width="15" height="12" rx="2" fill="#1c1917"/>
        <!-- Nickel barrel -->
        <rect x="-45" y="-7" width="30" height="14" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8"/>
        <!-- 1/4" plug shaft -->
        <rect x="-65" y="-4.5" width="20" height="9" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.6"/>
        <!-- Black insulator ring -->
        <rect x="-56" y="-5" width="2.5" height="10" fill="#000"/>
        <!-- Tip -->
        <polygon points="-65,-4.5 -72,0 -65,4.5" fill="#f1f5f9" stroke="#94a3b8" stroke-width="0.6"/>
      </g>
    </g>`;

  const body = `
    <!-- Dark Laboratory Bench Workmat -->
    ${bleedRect(id.url('bench-mat'))}
    <!-- Halftone noise grid -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.12"/>

    <!-- Subtle benchtop drafting lines -->
    ${Array.from({ length: 6 }, (_, i) => `<line x1="${BLEED.x}" y1="${200 + i * 70}" x2="${BLEED.x + BLEED.w}" y2="${200 + i * 70}" stroke="#334155" stroke-opacity="0.3" stroke-width="1"/>`).join('')}

    <!-- Oscilloscope Cabinet & CRT Trace -->
    ${scopeChassis}

    <!-- 12AX7 Glowing Vacuum Tube -->
    ${vacuumTube}

    <!-- Braided Tweed Cable & Plug -->
    ${guitarCable}

    <!-- Technical Annotations -->
    ${label(280, 85, 'PLATE V · “THE VACUUM & THE BEAM”', { size: 9, fill: '#5eead4', plate: 'rgba(4,47,46,0.85)', pad: 5, anchor: 'middle' })}
    ${label(640, 475, '12AX7 TRIODE HARMONIC MODEL · 2.6MS SPSC BUFFER', { size: 8, fill: '#fde047', plate: 'rgba(20,10,5,0.85)', pad: 4, anchor: 'middle' })}
    ${label(280, 420, 'TEKTRONIX 2215A DUAL-TRACE BENCH (60Hz REFRESH)', { size: 7.5, fill: '#94a3b8', anchor: 'middle' })}`;

  return {
    title: 'The Vacuum & The Beam',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate V: The Vacuum & The Beam — Tektronix oscilloscope with tanh overdrive waveform and glowing 12AX7 tube',
      defs,
      body
    })
  };
}
