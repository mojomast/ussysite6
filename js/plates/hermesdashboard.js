/**
 * PLATE // HERMESDASHBOARD — “THE SUBAGENT CONSTELLATION”
 * Autonomous agent fleet orchestration: a circular PPI radar scope in a heavy
 * console bezel displaying the live parent-child subagent DAG as a glowing constellation,
 * with an active rotating radar sweep line, range rings, and streaming SSE thought traces.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba
} from '../svg-kit.js';

export default function hermesDashboardPlate(proj) {
  const id = scope('pl-herm');
  const rand = rng(110);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #6d28d9 Royal Violet
  const sec = proj.secondaryInkHex; // #be185d Magenta

  const cx = 320;
  const cy = 300;
  const scopeR = 195;

  const defs = `
    ${standardDefs(id, { ink: '#100524', dot: 0.75, gap: 5 })}
    ${radGrad(id('radar-glass'), [[0, '#3b0764'], [0.55, '#1e0538'], [0.85, '#0f021f'], [1, '#05000a']], { cx: 0.48, cy: 0.48, r: 0.75 })}
    ${radGrad(id('radar-glow'), [[0, '#c084fc', 0.45], [0.4, '#a855f7', 0.18], [0.8, '#6d28d9', 0.05], [1, '#000000', 0]], { cx: cx, cy: cy, r: scopeR + 40, units: 'userSpaceOnUse' })}
    ${linGrad(id('console-bezel'), [[0, '#475569'], [0.5, '#334155'], [1, '#1e293b']])}
    ${linGrad(id('stream-panel'), [[0, 'rgba(15,8,30,0.92)'], [1, 'rgba(8,3,18,0.92)']])}
    <clipPath id="${id('scope-clip')}">
      <circle cx="${cx}" cy="${cy}" r="${scopeR}"/>
    </clipPath>
    <filter id="${id('agent-bloom')}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. Radar Scope Console Bezel (Heavy Cast Metal with Degree Markings)
  const consoleBezel = `
    <!-- Drop Shadow -->
    <circle cx="${cx}" cy="${cy + 8}" r="${scopeR + 32}" fill="#000" opacity="0.6" filter="${id.url('soft')}"/>

    <!-- Outer Bezel Ring -->
    <circle cx="${cx}" cy="${cy}" r="${scopeR + 28}" fill="${id.url('console-bezel')}" stroke="#64748b" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${scopeR + 12}" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Compass Azimuth Degree Ticks around Rim (every 10 degrees) -->
    ${Array.from({ length: 36 }, (_, i) => {
      const a = (i * 10 * Math.PI) / 180;
      const isMajor = i % 3 === 0;
      const rad1 = scopeR + 14;
      const rad2 = scopeR + (isMajor ? 24 : 19);
      const x1 = cx + Math.cos(a) * rad1;
      const y1 = cy + Math.sin(a) * rad1;
      const x2 = cx + Math.cos(a) * rad2;
      const y2 = cy + Math.sin(a) * rad2;
      return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${isMajor ? '#c084fc' : '#64748b'}" stroke-width="${isMajor ? 1.4 : 0.7}"/>`;
    }).join('')}

    <!-- Four Cardinal Degree Labels: 000, 090, 180, 270 -->
    <text x="${cx}" y="${cy - scopeR - 4}" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="700" fill="#f5d0fe" text-anchor="middle">000°</text>
    <text x="${cx + scopeR + 5}" y="${cy + 3}" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="700" fill="#f5d0fe">090°</text>
    <text x="${cx}" y="${cy + scopeR + 10}" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="700" fill="#f5d0fe" text-anchor="middle">180°</text>
    <text x="${cx - scopeR - 5}" y="${cy + 3}" font-family="IBM Plex Mono, monospace" font-size="7" font-weight="700" fill="#f5d0fe" text-anchor="end">270°</text>`;

  // 2. Phosphor Radar Scope Glass & Range Rings
  const radarScreen = `
    <circle cx="${cx}" cy="${cy}" r="${scopeR}" fill="${id.url('radar-glass')}"/>

    <g clip-path="url(#${id('scope-clip')})">
      <!-- Ambient phosphor glow -->
      <circle cx="${cx}" cy="${cy}" r="${scopeR}" fill="${id.url('radar-glow')}"/>

      <!-- Concentric Range Rings (Tier 1, Tier 2, Tier 3) -->
      ${[55, 110, 165].map((r, idx) => `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#a855f7" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="2 3"/>
        <text x="${cx + 4}" y="${cy - r + 9}" font-family="IBM Plex Mono, monospace" font-size="6" fill="#c084fc" opacity="0.6">TIER ${idx + 1}</text>
      `).join('')}

      <!-- Crosshairs -->
      <line x1="${cx - scopeR}" y1="${cy}" x2="${cx + scopeR}" y2="${cy}" stroke="#a855f7" stroke-opacity="0.4" stroke-width="0.8"/>
      <line x1="${cx}" y1="${cy - scopeR}" x2="${cx}" y2="${cy + scopeR}" stroke="#a855f7" stroke-opacity="0.4" stroke-width="0.8"/>
      <!-- Diagonal grid lines -->
      <line x1="${cx - scopeR * 0.707}" y1="${cy - scopeR * 0.707}" x2="${cx + scopeR * 0.707}" y2="${cy + scopeR * 0.707}" stroke="#a855f7" stroke-opacity="0.2" stroke-width="0.6"/>
      <line x1="${cx - scopeR * 0.707}" y1="${cy + scopeR * 0.707}" x2="${cx + scopeR * 0.707}" y2="${cy - scopeR * 0.707}" stroke="#a855f7" stroke-opacity="0.2" stroke-width="0.6"/>
    </g>`;

  // 3. Subagent DAG Nodes & Constellation Energy Filaments
  // Root agent at center, 4 Tier-1 children, 7 Tier-2 children
  const nodes = [
    { id: 'ROOT', label: 'HERMES-ORCHESTRATOR', x: cx, y: cy, r: 10, col: '#f59e0b', status: 'ACTIVE' },
    // Tier 1
    { id: 'A1', label: 'RESEARCH-01', x: cx - 45, y: cy - 70, r: 7, col: '#c084fc', parent: 'ROOT' },
    { id: 'A2', label: 'CODER-01', x: cx + 75, y: cy - 50, r: 7, col: '#38bdf8', parent: 'ROOT' },
    { id: 'A3', label: 'VERIFY-01', x: cx + 60, y: cy + 65, r: 7, col: '#4ade80', parent: 'ROOT' },
    { id: 'A4', label: 'SYNTH-01', x: cx - 65, y: cy + 55, r: 7, col: '#f472b6', parent: 'ROOT' },
    // Tier 2 Leaves
    { id: 'B1', label: 'AST-WALK', x: cx - 110, y: cy - 115, r: 5, col: '#e879f9', parent: 'A1' },
    { id: 'B2', label: 'DOCS-LINT', x: cx + 10, y: cy - 145, r: 5, col: '#e879f9', parent: 'A1' },
    { id: 'B3', label: 'RUST-PTY', x: cx + 145, y: cy - 80, r: 5, col: '#38bdf8', parent: 'A2' },
    { id: 'B4', label: 'WGPU-TEX', x: cx + 155, y: cy - 20, r: 5, col: '#38bdf8', parent: 'A2' },
    { id: 'B5', label: 'SPEC-TEST', x: cx + 130, y: cy + 95, r: 5, col: '#4ade80', parent: 'A3' },
    { id: 'B6', label: 'AUDIO-DSP', x: cx - 135, y: cy + 40, r: 5, col: '#f472b6', parent: 'A4' },
    { id: 'B7', label: 'WAVE-SHAPE', x: cx - 105, y: cy + 120, r: 5, col: '#f472b6', parent: 'A4' }
  ];

  // Map to connect parent-child links
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const dagLinks = nodes
    .filter((n) => n.parent)
    .map((child) => {
      const parent = nodeMap.get(child.parent);
      return `
        <line x1="${parent.x}" y1="${parent.y}" x2="${child.x}" y2="${child.y}" stroke="#c084fc" stroke-opacity="0.5" stroke-width="1.4"/>
        <!-- Animated Thought Packet -->
        <circle r="2" fill="#fff" filter="${id.url('agent-bloom')}">
          <animateMotion dur="${2 + (rand() * 1.5)}s" repeatCount="indefinite" path="M${parent.x} ${parent.y} L${child.x} ${child.y}"/>
        </circle>
      `;
    })
    .join('');

  // Render nodes
  const dagNodes = nodes.map((n) => `
    <g class="dag-node" transform="translate(${n.x}, ${n.y})">
      <circle cx="0" cy="0" r="${n.r + 4}" fill="${n.col}" opacity="0.35" filter="url(#${id('agent-bloom')})"/>
      <circle cx="0" cy="0" r="${n.r}" fill="${n.col}" stroke="#fff" stroke-width="1.2"/>
      <circle cx="0" cy="0" r="${r2(n.r * 0.45)}" fill="#fff"/>
      <text x="0" y="${n.r + 10}" font-family="IBM Plex Mono, monospace" font-size="5.5" font-weight="600" fill="#f5d0fe" text-anchor="middle">${n.label}</text>
    </g>
  `).join('');

  // 4. Rotating Radar Sweep Beam Line (Animated)
  const sweepBeam = `
    <g class="radar-sweep" transform="translate(${cx}, ${cy})">
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/>
        <!-- Phosphor Trail Wedge -->
        <path d="M0 0 L${scopeR} 0 A${scopeR} ${scopeR} 0 0 0 ${r2(scopeR * 0.866)} ${r2(-scopeR * 0.5)} Z" fill="${sec}" opacity="0.18"/>
        <!-- Leading Edge Beam -->
        <line x1="0" y1="0" x2="${scopeR}" y2="0" stroke="#f472b6" stroke-width="2" filter="${id.url('agent-bloom')}"/>
        <line x1="0" y1="0" x2="${scopeR}" y2="0" stroke="#fff" stroke-width="0.8"/>
      </g>
    </g>`;

  // 5. Live Server-Sent Events (SSE) Thought Trace Stream (Right Console Box)
  const sseStreamBox = `
    <g class="sse-stream-box" transform="translate(565, 120)">
      <rect x="0" y="0" width="200" height="360" rx="4" fill="${id.url('stream-panel')}" stroke="#7c3aed" stroke-width="1.4"/>
      <rect x="0" y="0" width="200" height="24" fill="#581c87"/>
      <text x="12" y="16" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7.5" fill="#f5d0fe" letter-spacing="0.1em">LIVE SSE FLEET TELEMETRY</text>

      <!-- Live Stream Lines -->
      <g transform="translate(12, 42)">
        <text x="0" y="0" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#a855f7">[04:12:08.112] SSE CONNECTED</text>
        <text x="0" y="14" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#38bdf8">&gt; FLEET: 11 ACTIVE SUBAGENTS</text>
        <text x="0" y="28" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#fde047">&gt; LAG: 6.8MS // NOMINAL</text>
        <text x="0" y="42" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#4ade80">&gt; ROOT: hermes-fleet-0</text>
        <line x1="0" y1="52" x2="175" y2="52" stroke="#4c1d95" stroke-width="0.8"/>

        <text x="0" y="68" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#c084fc">SUBAGENT DISPATCHES:</text>
        <text x="0" y="82" font-family="IBM Plex Mono, monospace" font-size="6" fill="#e9d5ff">#A1 research: grep AST tree [OK]</text>
        <text x="0" y="96" font-family="IBM Plex Mono, monospace" font-size="6" fill="#e9d5ff">#A2 coder: write PTY parser [OK]</text>
        <text x="0" y="110" font-family="IBM Plex Mono, monospace" font-size="6" fill="#e9d5ff">#A3 verify: execute test suite</text>
        <text x="0" y="124" font-family="IBM Plex Mono, monospace" font-size="6" fill="#e9d5ff">#A4 synth: compile audio stem</text>

        <line x1="0" y1="134" x2="175" y2="134" stroke="#4c1d95" stroke-width="0.8"/>
        <text x="0" y="150" font-family="IBM Plex Mono, monospace" font-size="6.5" fill="#f472b6">THOUGHT TRACE BUFFER:</text>
        <text x="0" y="164" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8">"Analyzing 64-byte alignment"</text>
        <text x="0" y="178" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8">"Validating Steward Gate seal"</text>
        <text x="0" y="192" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8">"Broadcasting 60Hz HID state"</text>
        <text x="0" y="206" font-family="IBM Plex Mono, monospace" font-size="6" fill="#4ade80">STREAM LOCKED ▌</text>
      </g>
    </g>`;

  const body = `
    <!-- Dark Operations Room Ground -->
    ${bleedRect('#060212')}
    <!-- Halftone matrix pattern -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.14"/>

    <!-- Radar Scope Console -->
    ${consoleBezel}
    ${radarScreen}

    <g clip-path="url(#${id('scope-clip')})">
      <!-- DAG Constellation Links & Nodes -->
      <g class="dag-links">${dagLinks}</g>
      <g class="dag-nodes">${dagNodes}</g>
      <!-- Sweeping Radar Beam -->
      ${sweepBeam}
    </g>

    <!-- SSE Telemetry Data Stream -->
    ${sseStreamBox}

    <!-- Technical Annotations -->
    ${label(320, 48, 'PLATE XII · “THE SUBAGENT CONSTELLATION”', { size: 9, fill: '#f5d0fe', plate: 'rgba(25,8,45,0.9)', pad: 5, anchor: 'middle' })}
    ${label(320, 550, 'PPI RADAR FLEET DAG · 11 ACTIVE SUBAGENTS (<8MS SSE LAG)', { size: 7.5, fill: '#c084fc', anchor: 'middle' })}`;

  return {
    title: 'The Subagent Constellation',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate XII: The Subagent Constellation — circular PPI radar scope displaying autonomous subagent DAG constellation with rotating sweep beam and live SSE stream',
      defs,
      body
    })
  };
}
