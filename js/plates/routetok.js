/**
 * PLATE // ROUTETOK — “THE BELL RELAY EXCHANGE”
 * Bell-Labs-grade electro-mechanical telephone relay exchange & circuit breaker:
 * three heavy industrial stepping relays with cylindrical copper coils and brass
 * knife switches (one tripped open with an electrical spark gap), porcelain standoffs,
 * a 3-state FSM inset (CLOSED/OPEN/HALF-OPEN), and braided telegraph cables.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba
} from '../svg-kit.js';

export default function routetokPlate(proj) {
  const id = scope('pl-rtok');
  const rand = rng(106);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #047857 Emerald
  const sec = proj.secondaryInkHex; // #0369a1 Cyan

  const defs = `
    ${standardDefs(id, { ink: '#022416', dot: 0.75, gap: 5 })}
    ${radGrad(id('spark-glow'), [[0, '#ffffff', 1], [0.25, '#67e8f9', 0.9], [0.65, '#0284c7', 0.4], [1, '#000000', 0]], { cx: 480, cy: 300, r: 90, units: 'userSpaceOnUse' })}
    ${linGrad(id('rack-chassis'), [[0, '#0f291e'], [0.4, '#091c14'], [1, '#040d09']])}
    ${linGrad(id('coppercable'), [[0, '#fdba74'], [0.4, '#c2410c'], [0.8, '#7c2d12'], [1, '#431407']])}
    ${linGrad(id('brass-knife'), [[0, '#fef08a'], [0.4, '#ca8a04'], [0.8, '#854d0e'], [1, '#422006']])}
    ${linGrad(id('porcelain'), [[0, '#ffffff'], [0.5, '#e2e8f0'], [1, '#94a3b8']])}
    ${linGrad(id('slate-panel'), [[0, '#1e293b'], [0.5, '#0f172a'], [1, '#020617']])}
    <filter id="${id('spark-bloom')}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. Telephone Switching Rack Chassis & Slate Backing Panel
  const rackFrame = `
    <!-- Heavy Cast-Iron Rack Frame -->
    <rect x="70" y="80" width="660" height="470" rx="6" fill="${id.url('rack-chassis')}" stroke="#065f46" stroke-width="2"/>
    <rect x="85" y="95" width="630" height="440" rx="4" fill="${id.url('slate-panel')}" stroke="#334155" stroke-width="1.2"/>
    <!-- Rivets around perimeter -->
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="${95 + i * 40}" cy="88" r="3" fill="#64748b" stroke="#0f172a" stroke-width="0.8"/>`).join('')}
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="${95 + i * 40}" cy="542" r="3" fill="#64748b" stroke="#0f172a" stroke-width="0.8"/>`).join('')}

    <!-- Vertical Solid Copper Busbars (+48V and GND) -->
    <rect x="135" y="110" width="12" height="410" rx="1.5" fill="${id.url('coppercable')}" stroke="#9a3412" stroke-width="0.8"/>
    <rect x="160" y="110" width="12" height="410" rx="1.5" fill="${id.url('coppercable')}" stroke="#9a3412" stroke-width="0.8"/>
    <text x="141" y="530" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="#fed7aa" text-anchor="middle">BUS A</text>
    <text x="166" y="530" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="#fed7aa" text-anchor="middle">BUS B</text>`;

  // 2. Three Industrial Electro-Mechanical Relays (Relay A, Relay B, Relay C)
  const relayRows = [
    { name: 'PROVIDER A (CLAUDE-3.5)', state: 'CLOSED (ACTIVE)', y: 175, statusCol: '#10b981', knifeOpen: false },
    { name: 'PROVIDER B (OPENAI-429)', state: 'TRIPPED OPEN', y: 300, statusCol: '#ef4444', knifeOpen: true, spark: true },
    { name: 'PROVIDER C (LOCAL vLLM)', state: 'HALF-OPEN PROBE', y: 425, statusCol: '#f59e0b', knifeOpen: false, half: true }
  ].map((r, idx) => {
    // Copper coil windings
    const coil = `
      <g class="relay-coil" transform="translate(230, ${r.y})">
        <!-- Porcelain Standoff Insulator -->
        <rect x="-24" y="-32" width="18" height="64" rx="4" fill="${id.url('porcelain')}" stroke="#64748b" stroke-width="1"/>
        <line x1="-24" y1="-12" x2="-6" y2="-12" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="-24" y1="12" x2="-6" y2="12" stroke="#94a3b8" stroke-width="1.5"/>

        <!-- Iron Core Cylinder -->
        <rect x="0" y="-22" width="120" height="44" rx="3" fill="#334155" stroke="#1e293b" stroke-width="1.2"/>
        <!-- Copper Wire Windings (segmented bands) -->
        ${Array.from({ length: 15 }, (_, i) => `
          <rect x="${6 + i * 7.5}" y="-26" width="6" height="52" rx="1.5" fill="${id.url('coppercable')}" stroke="#7c2d12" stroke-width="0.7"/>
        `).join('')}

        <!-- Status Indicator Lamp -->
        <circle cx="145" cy="0" r="10" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>
        <circle cx="145" cy="0" r="7" fill="${r.statusCol}" filter="${id.url('glow')}"/>
        <circle cx="145" cy="0" r="2.5" fill="#fff" opacity="0.8"/>
      </g>`;

    // Brass Knife Switch Assembly
    const knife = `
      <g class="relay-knife" transform="translate(420, ${r.y})">
        <!-- Contact Block Base (Porcelain) -->
        <rect x="0" y="-18" width="22" height="36" rx="2" fill="${id.url('porcelain')}" stroke="#475569" stroke-width="1"/>
        <rect x="70" y="-18" width="22" height="36" rx="2" fill="${id.url('porcelain')}" stroke="#475569" stroke-width="1"/>

        <!-- Copper Contact Jaws -->
        <rect x="6" y="-12" width="10" height="24" rx="1" fill="${id.url('coppercable')}"/>
        <rect x="76" y="-12" width="10" height="24" rx="1" fill="${id.url('coppercable')}"/>

        <!-- Pivot Pin -->
        <circle cx="11" cy="0" r="4.5" fill="${id.url('brass-knife')}"/>

        <!-- Knife Blade -->
        ${r.knifeOpen ? `
          <!-- Tripped open at 42 degree angle -->
          <polygon points="11,0 68,-38 74,-34 14,4" fill="${id.url('brass-knife')}" stroke="#ffe082" stroke-width="0.8"/>
          <circle cx="70" cy="-36" r="6" fill="#1c1917" stroke="#ca8a04" stroke-width="1"/>
          <!-- Electrical Arc Spark Gap -->
          <path d="M81 -2 L76 -18 L86 -22 L72 -32" fill="none" stroke="#67e8f9" stroke-width="2.5" filter="${id.url('spark-bloom')}"/>
          <path d="M81 -2 L76 -18 L86 -22 L72 -32" fill="none" stroke="#fff" stroke-width="1"/>
          <!-- Spark aura -->
          <circle cx="78" cy="-15" r="38" fill="${id.url('spark-glow')}"/>
        ` : `
          <!-- Closed contact bridge -->
          <polygon points="11,-4 81,-4 81,4 11,4" fill="${id.url('brass-knife')}" stroke="#ffe082" stroke-width="0.8"/>
          <circle cx="86" cy="0" r="5" fill="#1c1917" stroke="#ca8a04" stroke-width="1"/>
          ${r.half ? `<circle cx="81" cy="0" r="6" fill="#f59e0b" opacity="0.6" class="plate-blink"/>` : ''}
        `}
      </g>`;

    // Relay Label Strip
    const textLabel = `
      <g transform="translate(540, ${r.y - 12})">
        <rect x="0" y="0" width="165" height="26" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
        <text x="8" y="11" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7.5" fill="#f8fafc">${r.name}</text>
        <text x="8" y="21" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="${r.statusCol}">${r.state}</text>
      </g>`;

    return coil + knife + textLabel;
  }).join('');

  // 3. Finite State Machine (FSM) Diagram Inset (Top-Right Panel)
  const fsmDiagram = `
    <g class="fsm-inset" transform="translate(565, 30)">
      <rect x="0" y="0" width="145" height="100" rx="3" fill="rgba(8,16,28,0.92)" stroke="#047857" stroke-width="1.2"/>
      <text x="10" y="14" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="6.5" fill="#6ee7b7" letter-spacing="0.1em">CIRCUIT BREAKER FSM</text>

      <!-- 3 State Nodes -->
      <!-- CLOSED Node (Green) -->
      <circle cx="35" cy="45" r="14" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
      <text x="35" y="47.5" font-family="IBM Plex Mono, monospace" font-size="6" font-weight="700" fill="#a7f3d0" text-anchor="middle">CLOSED</text>

      <!-- OPEN Node (Red) -->
      <circle cx="110" cy="45" r="14" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.5"/>
      <text x="110" y="47.5" font-family="IBM Plex Mono, monospace" font-size="6" font-weight="700" fill="#fca5a5" text-anchor="middle">OPEN</text>

      <!-- HALF-OPEN Node (Amber) -->
      <circle cx="72" cy="80" r="14" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="72" y="82.5" font-family="IBM Plex Mono, monospace" font-size="5" font-weight="700" fill="#fde68a" text-anchor="middle">HALF-OP</text>

      <!-- Transition Arrows -->
      <path d="M49 42 Q72 32 96 42" fill="none" stroke="#ef4444" stroke-width="1.2" marker-end="url(#arrow)"/>
      <path d="M104 57 Q96 74 86 78" fill="none" stroke="#f59e0b" stroke-width="1.2"/>
      <path d="M58 78 Q48 74 40 57" fill="none" stroke="#10b981" stroke-width="1.2"/>
    </g>`;

  const body = `
    <!-- Cyanotype Blueprint / Dark Slate Ground -->
    ${bleedRect('#06161a')}
    <!-- Halftone grid -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.14"/>

    <!-- Switching Rack Assembly -->
    ${rackFrame}
    ${relayRows}

    <!-- FSM State Diagram Inset -->
    ${fsmDiagram}

    <!-- Technical Annotations -->
    ${label(400, 55, 'PLATE VIII · “THE BELL RELAY EXCHANGE”', { size: 9, fill: '#6ee7b7', plate: 'rgba(2,36,22,0.9)', pad: 5, anchor: 'middle' })}
    ${label(500, 350, '429 RATE-LIMIT EXHAUSTION (SWITCH OPENED IN 12MS)', { size: 7, fill: '#67e8f9', plate: 'rgba(4,20,30,0.85)', pad: 4 })}
    ${label(400, 520, 'MULTI-ARMED BANDIT ROUTER WITH ACTIVE HEALTH PROBES', { size: 7.5, fill: '#a7f3d0', anchor: 'middle' })}`;

  return {
    title: 'The Bell Relay Exchange',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate VIII: The Bell Relay Exchange — Bell-Labs electro-mechanical relay rack and 3-state circuit breaker',
      defs,
      body
    })
  };
}
