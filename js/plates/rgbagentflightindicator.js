/**
 * PLATE // RGBAGENTFLIGHTINDICATOR — “THE AVIONICS SWITCHBOARD”
 * 60Hz per-key QMK/USB HID cockpit flight-deck keyboard: custom anodized aluminum case
 * with glowing RGB keycaps (amber caution row, cyan token wave, steward kill switch),
 * aircraft annunciator warning lights, and tactile mechanical switch cutaway.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba, makeIso, isoBoxSvg
} from '../svg-kit.js';

export default function rgbAgentPlate(proj) {
  const id = scope('pl-rgb');
  const rand = rng(107);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #d97706 Caution Amber
  const sec = proj.secondaryInkHex; // #0284c7 Avionics Cyan

  const defs = `
    ${standardDefs(id, { ink: '#0a0d14', dot: 0.75, gap: 5 })}
    ${radGrad(id('cockpit-glow'), [[0, '#38bdf8', 0.22], [0.4, '#0284c7', 0.1], [0.85, '#d97706', 0.05], [1, '#05070d', 0]], { cx: 400, cy: 300, r: 350, units: 'userSpaceOnUse' })}
    ${radGrad(id('amber-halo'), [[0, '#fde047', 0.95], [0.35, '#f59e0b', 0.55], [0.75, '#b45309', 0.18], [1, '#000000', 0]], { cx: 400, cy: 115, r: 140, units: 'userSpaceOnUse' })}
    ${linGrad(id('case-alum'), [[0, '#334155'], [0.45, '#1e293b'], [1, '#0f172a']])}
    ${linGrad(id('brass-weight'), [[0, '#fde047'], [0.4, '#d97706'], [0.8, '#92400e'], [1, '#451a03']])}
    ${linGrad(id('annun-bezel'), [[0, '#1e293b'], [0.5, '#0f172a'], [1, '#020617']])}
    <filter id="${id('key-bloom')}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. Aircraft Overhead Master Caution Annunciator Light Strip
  const annunciatorStrip = `
    <g class="annunciator-bank" transform="translate(100, 80)">
      <!-- Heavy Billet Aluminum Enclosure -->
      <rect x="0" y="0" width="600" height="65" rx="4" fill="${id.url('annun-bezel')}" stroke="#475569" stroke-width="1.5"/>
      <rect x="6" y="6" width="588" height="53" rx="2" fill="#020617" stroke="#1e293b" stroke-width="1"/>

      <!-- 6 Split-Legend Cockpit Annunciators -->
      ${[
        { top: 'MASTER', bot: 'CAUTION', col: '#f59e0b', lit: true, blink: true },
        { top: 'AGENT-5', bot: 'STEWARD', col: '#ef4444', lit: true },
        { top: 'TOKEN-FLOW', bot: '114 TOK/S', col: '#10b981', lit: true },
        { top: 'HID LINK', bot: '60HZ LOCK', col: '#38bdf8', lit: true },
        { top: 'BUFFER Q', bot: 'NOMINAL', col: '#10b981', lit: false },
        { top: 'FIREWALL', bot: 'ARMED', col: '#f59e0b', lit: false }
      ].map((tile, i) => {
        const x = 12 + i * 96;
        return `
          <g transform="translate(${x}, 10)">
            <rect x="0" y="0" width="90" height="45" rx="2" fill="${tile.lit ? rgba(tile.col, 0.18) : '#090d16'}" stroke="${tile.lit ? tile.col : '#334155'}" stroke-width="${tile.lit ? 1.4 : 0.8}"/>
            <line x1="0" y1="22.5" x2="90" y2="22.5" stroke="${tile.lit ? tile.col : '#1e293b'}" stroke-width="0.8"/>
            <text x="45" y="15" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="7" fill="${tile.lit ? tile.col : '#64748b'}" text-anchor="middle" ${tile.blink ? 'class="plate-blink"' : ''}>${tile.top}</text>
            <text x="45" y="36" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="700" fill="${tile.lit ? tile.col : '#64748b'}" text-anchor="middle" ${tile.blink ? 'class="plate-blink"' : ''}>${tile.bot}</text>
            ${tile.lit ? `<circle cx="82" cy="8" r="2.5" fill="${tile.col}" filter="${id.url('glow')}"/>` : ''}
          </g>
        `;
      }).join('')}
    </g>`;

  // 2. High-End Custom Mechanical Keyboard (Isometric View)
  const iso = makeIso({ ox: 400, oy: 380, sx: 0.866, sy: 0.42 });

  // Keyboard Case (Anodized Aluminum with Angled Chin & Brass Weight)
  const kbCase = `
    <!-- Contact Drop Shadow -->
    <ellipse cx="400" cy="445" rx="280" ry="45" fill="#000" opacity="0.75" filter="${id.url('soft')}"/>

    <!-- Anodized 6063 Aluminum Case -->
    ${isoBoxSvg(iso, [-230, -110, 0, 460, 220, 24], {
      top: '#1e293b',
      left: '#0f172a',
      right: '#090d16',
      edge: '#64748b',
      edgeW: 1.2
    })}

    <!-- Polished Mirror Brass Weight on Underside Bevel -->
    ${isoBoxSvg(iso, [-180, -70, -4, 360, 140, 4], {
      top: id.url('brass-weight'),
      left: '#92400e',
      right: '#78350f',
      edge: '#fef08a',
      edgeW: 0.8
    })}`;

  // 3. Keycap Matrix (6 Rows: Function, Numbers, QWERTY, Home, Bottom, Space)
  // Generating sculpted keycaps with per-key RGB backlighting
  let keycaps = '';
  const keyRows = [
    { count: 14, h: 18, colorTheme: 'amber' }, // F-row (Caution Amber)
    { count: 14, h: 24, colorTheme: 'wave' },  // Number row
    { count: 14, h: 24, colorTheme: 'wave' },  // QWERTY row
    { count: 13, h: 24, colorTheme: 'wave' },  // Home row
    { count: 12, h: 24, colorTheme: 'wave' },  // Shift row
    { count: 8,  h: 24, colorTheme: 'mod' }    // Spacebar row
  ];

  keyRows.forEach((row, rIdx) => {
    const yPos = -95 + rIdx * 34;
    for (let c = 0; c < row.count; c++) {
      const isSpace = rIdx === 5 && c === 3;
      const kw = isSpace ? 110 : 26;
      const xPos = -210 + c * 30 + (rIdx === 5 && c > 3 ? 84 : 0);
      const isEsc = rIdx === 0 && c === 0;

      // Color computation: Amber on F-row, Cyan/Emerald wave on alphas, Red on Esc
      let keyColor = '#0284c7'; // default cyan
      if (isEsc) {
        keyColor = '#ef4444'; // Emergency Steward Abort
      } else if (row.colorTheme === 'amber') {
        keyColor = '#f59e0b'; // Caution Amber
      } else if (row.colorTheme === 'wave') {
        const wave = Math.sin(c * 0.45 + rIdx * 0.6);
        keyColor = wave > 0.3 ? '#10b981' : wave > -0.3 ? '#38bdf8' : '#818cf8';
      }

      // Render 3D keycap using iso projection
      keycaps += isoBoxSvg(iso, [xPos, yPos, 24, kw, 24, 10], {
        top: '#1e293b',
        left: '#0f172a',
        right: '#090d16',
        edge: rgba(keyColor, 0.9),
        edgeW: 0.8
      });

      // Keycap top legend glow
      const [kx, ky] = iso(xPos + kw / 2, yPos + 12, 34);
      keycaps += `
        <!-- Per-key RGB LED Glow Pool -->
        <ellipse cx="${r2(kx)}" cy="${r2(ky)}" rx="${r2(kw * 0.42)}" ry="6" fill="${keyColor}" opacity="0.55" filter="url(#${id('key-bloom')})"/>
        <circle cx="${r2(kx)}" cy="${r2(ky)}" r="2" fill="#fff" opacity="0.9"/>
      `;
    }
  });

  // 4. Inset Mechanical Switch Diagram (Cherry MX Stem Cutaway)
  const switchCutaway = `
    <g class="switch-cutaway" transform="translate(640, 420)">
      <rect x="0" y="0" width="125" height="130" rx="3" fill="rgba(8,12,20,0.92)" stroke="#334155" stroke-width="1"/>
      <text x="10" y="14" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="6.5" fill="#f59e0b" letter-spacing="0.08em">TACTILE SWITCH CUTAWAY</text>

      <!-- Clear Switch Housing -->
      <rect x="25" y="25" width="75" height="70" rx="3" fill="rgba(255,255,255,0.08)" stroke="#64748b" stroke-width="1"/>

      <!-- Cross Stem (Amber POM) -->
      <rect x="52" y="35" width="21" height="35" fill="#d97706" stroke="#fde047" stroke-width="0.8"/>
      <rect x="44" y="44" width="37" height="10" fill="#d97706" stroke="#fde047" stroke-width="0.8"/>

      <!-- Gold Crosspoint Leaf Springs -->
      <path d="M38 85 L48 65 L48 55" fill="none" stroke="#facc15" stroke-width="1.8"/>
      <path d="M87 85 L77 68 L77 58" fill="none" stroke="#facc15" stroke-width="1.8"/>

      <!-- SMD RGB LED mounted beneath stem -->
      <rect x="54" y="86" width="17" height="8" rx="1" fill="#38bdf8" filter="${id.url('glow')}"/>
      <circle cx="62.5" cy="90" r="2.5" fill="#fff"/>

      <text x="62.5" y="115" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8" text-anchor="middle">55G ACTUATION · 2.0MM</text>
    </g>`;

  const body = `
    <!-- Cockpit Dark Interior -->
    ${bleedRect('#04070d')}
    <!-- Halftone cockpit shadow -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.12"/>

    <!-- Cockpit Ambient Glow -->
    <circle cx="400" cy="300" r="350" fill="${id.url('cockpit-glow')}"/>
    <circle cx="400" cy="115" r="140" fill="${id.url('amber-halo')}"/>

    <!-- Annunciator Master Warning Strip -->
    ${annunciatorStrip}

    <!-- Mechanical Flight Deck Keyboard Case & Keys -->
    ${kbCase}
    <g class="kb-keycaps">${keycaps}</g>

    <!-- Switch Mechanism Cutaway Inset -->
    ${switchCutaway}

    <!-- Technical Annotations -->
    ${label(400, 50, 'PLATE IX · “THE AVIONICS SWITCHBOARD”', { size: 9, fill: '#fde047', plate: 'rgba(20,15,5,0.9)', pad: 5, anchor: 'middle' })}
    ${label(110, 485, '60HZ USB RAW HID FLIGHT DECK (QMK FIRMWARE)', { size: 7.5, fill: '#38bdf8', plate: 'rgba(5,15,25,0.85)', pad: 4 })}
    ${label(400, 545, 'PER-KEY ADDRESSABLE RGB MATRIX WITH SWARM TELEMETRY', { size: 7.5, fill: '#94a3b8', anchor: 'middle' })}`;

  return {
    title: 'The Avionics Switchboard',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate IX: The Avionics Switchboard — mechanical keyboard transformed into an aircraft cockpit caution matrix',
      defs,
      body
    })
  };
}
