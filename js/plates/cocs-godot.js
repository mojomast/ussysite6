/**
 * PLATE // COCS-GODOT — “FORWARD+ LIGHTFIELD & PARTICLE FOUNDRY”
 * Godot 4 Vulkan Forward+ rendering architecture: clustered light culling grid,
 * SDFGI global illumination bounce light on a glossy sphere and glass cube,
 * a cone of 32,000 procedural GPU particles, and mechanical recoil spring telemetry.
 */
import {
  rng, r2, scope, standardDefs, linGrad, radGrad, label, svgRoot,
  BLEED, bleedRect, tint, shade, rgba, makeIso, isoBoxSvg
} from '../svg-kit.js';

export default function cocsGodotPlate(proj) {
  const id = scope('pl-godot');
  const rand = rng(105);
  const W = 800;
  const H = 600;
  const spot = proj.spotInkHex; // #2563eb Ultramarine
  const sec = proj.secondaryInkHex; // #7c3aed Violet

  const iso = makeIso({ ox: 380, oy: 410, sx: 0.866, sy: 0.42 });

  const defs = `
    ${standardDefs(id, { ink: '#0a081a', dot: 0.75, gap: 5 })}
    ${radGrad(id('sdfgi-bounce'), [[0, '#38bdf8', 0.45], [0.35, '#818cf8', 0.22], [0.75, '#c084fc', 0.08], [1, '#050414', 0]], { cx: 340, cy: 330, r: 280, units: 'userSpaceOnUse' })}
    ${radGrad(id('omni-violet'), [[0, '#f472b6', 0.85], [0.4, '#a855f7', 0.35], [1, '#000000', 0]], { cx: 210, cy: 220, r: 160, units: 'userSpaceOnUse' })}
    ${radGrad(id('omni-cyan'), [[0, '#67e8f9', 0.85], [0.4, '#0284c7', 0.35], [1, '#000000', 0]], { cx: 560, cy: 240, r: 160, units: 'userSpaceOnUse' })}
    ${linGrad(id('godot-sky'), [[0, '#030208'], [0.4, '#09081f'], [0.85, '#12113d'], [1, '#060517']], { x1: 0, y1: BLEED.y, x2: 0, y2: 320, units: 'userSpaceOnUse' })}
    ${radGrad(id('chrome-sphere'), [[0, '#ffffff'], [0.15, '#e0f2fe'], [0.45, '#38bdf8'], [0.75, '#1e3a8a'], [1, '#090d24']], { cx: 0.32, cy: 0.28, r: 0.7 })}
    ${linGrad(id('glass-cube-top'), [[0, '#ede9fe'], [0.5, '#c4b5fd'], [1, '#8b5cf6']])}
    ${linGrad(id('glass-cube-left'), [[0, '#6d28d9'], [0.5, '#4c1d95'], [1, '#2e1065']])}
    ${linGrad(id('glass-cube-right'), [[0, '#7c3aed'], [0.5, '#5b21b6'], [1, '#3b0764']])}
    <filter id="${id('particle-bloom')}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  // 1. Clustered Forward+ Tile Grid Floor (Isometric)
  let floorTiles = '';
  const cols = 9;
  const rows = 9;
  const tw = 48;
  for (let r = -4; r <= 4; r++) {
    for (let c = -4; c <= 4; c++) {
      const x = c * tw;
      const y = r * tw;
      const [p0, p1, p2, p3] = [
        iso(x, y, 0),
        iso(x + tw, y, 0),
        iso(x + tw, y + tw, 0),
        iso(x, y + tw, 0)
      ];
      // Clustered light count heatmap (more lights near center)
      const dist = Math.hypot(c, r);
      const heat = Math.max(0, 1 - dist / 5);
      const strokeCol = heat > 0.6 ? '#c084fc' : heat > 0.3 ? '#38bdf8' : '#334155';
      const strokeOp = 0.2 + heat * 0.65;
      floorTiles += `
        <polygon points="${r2(p0[0])},${r2(p0[1])} ${r2(p1[0])},${r2(p1[1])} ${r2(p2[0])},${r2(p2[1])} ${r2(p3[0])},${r2(p3[1])}" fill="#0b0f1e" stroke="${strokeCol}" stroke-opacity="${r2(strokeOp)}" stroke-width="${heat > 0.5 ? 1.2 : 0.7}"/>
        ${heat > 0.4 ? `<circle cx="${r2((p0[0] + p2[0]) / 2)}" cy="${r2((p0[1] + p2[1]) / 2)}" r="1.5" fill="${strokeCol}" opacity="${r2(strokeOp)}"/>` : ''}
      `;
    }
  }

  // 2. Glossy Chrome Sphere (Left Center, with colored bounce light reflections)
  const sphereX = 260;
  const sphereY = 320;
  const sphereR = 64;
  const chromeSphere = `
    <!-- Cast Contact Shadow -->
    <ellipse cx="${sphereX}" cy="${sphereY + 60}" rx="68" ry="18" fill="#000" opacity="0.65" filter="${id.url('soft')}"/>
    <!-- Colored SDFGI bounce shadow -->
    <ellipse cx="${sphereX + 10}" cy="${sphereY + 58}" rx="55" ry="14" fill="#7c3aed" opacity="0.4" filter="${id.url('soft')}"/>

    <!-- Main Chrome Sphere Surface -->
    <circle cx="${sphereX}" cy="${sphereY}" r="${sphereR}" fill="${id.url('chrome-sphere')}"/>

    <!-- Dual Lightprobe Reflections (Violet Left, Cyan Right) -->
    <ellipse cx="${sphereX - 22}" cy="${sphereY - 20}" rx="28" ry="16" fill="#f472b6" opacity="0.6" filter="${id.url('glow')}" transform="rotate(-25 ${sphereX - 22} ${sphereY - 20})"/>
    <ellipse cx="${sphereX + 26}" cy="${sphereY - 14}" rx="22" ry="12" fill="#38bdf8" opacity="0.55" filter="${id.url('glow')}" transform="rotate(25 ${sphereX + 26} ${sphereY - 14})"/>

    <!-- High-specular primary keylight glint -->
    <circle cx="${sphereX - 18}" cy="${sphereY - 24}" r="8" fill="#ffffff" filter="${id.url('glow')}"/>
    <circle cx="${sphereX - 16}" cy="${sphereY - 26}" r="3" fill="#ffffff"/>

    <!-- Equator Horizon Curve Reflection -->
    <path d="M${sphereX - sphereR + 4} ${sphereY + 12} Q${sphereX} ${sphereY + 38} ${sphereX + sphereR - 4} ${sphereY + 12}" fill="none" stroke="#67e8f9" stroke-width="1.8" opacity="0.5"/>
    <path d="M${sphereX - sphereR + 8} ${sphereY + 22} Q${sphereX} ${sphereY + 48} ${sphereX + sphereR - 8} ${sphereY + 22}" fill="none" stroke="#c084fc" stroke-width="1.2" opacity="0.35"/>`;

  // 3. Frosted Glass Cube with Forward+ Shader Refraction (Right Center)
  const glassCube = `
    <!-- Contact Shadow -->
    <ellipse cx="460" cy="385" rx="72" ry="22" fill="#000" opacity="0.6" filter="${id.url('soft')}"/>
    <!-- Iso Box 80x80x80 at [30, -50, 0] -->
    <g class="glass-cube">
      ${isoBoxSvg(iso, [30, -50, 0, 75, 75, 75], {
        top: id.url('glass-cube-top'),
        left: id.url('glass-cube-left'),
        right: id.url('glass-cube-right'),
        edge: '#e0e7ff',
        edgeW: 1.2
      })}
      <!-- Internal Refraction Core -->
      ${isoBoxSvg(iso, [45, -35, 15, 45, 45, 45], {
        top: '#a78bfa',
        left: '#581c87',
        right: '#6b21a8',
        edge: '#f5d0fe',
        edgeW: 0.6,
        extra: 'opacity="0.65"'
      })}
    </g>`;

  // 4. Volumetric Light Probes (Cyan & Violet Spheres with Field Rings)
  const lightProbes = `
    <!-- Violet Probe (Left) -->
    <g class="lightprobe-violet" transform="translate(200, 190)">
      <circle cx="0" cy="0" r="14" fill="#f472b6" filter="${id.url('glow')}"/>
      <circle cx="0" cy="0" r="5" fill="#fff"/>
      <circle cx="0" cy="0" r="32" fill="none" stroke="#f472b6" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.65"/>
      <circle cx="0" cy="0" r="54" fill="none" stroke="#c084fc" stroke-width="0.5" stroke-dasharray="2 4" opacity="0.35"/>
      <text x="0" y="-18" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="#f472b6" text-anchor="middle">OMNI PROBE 01</text>
    </g>

    <!-- Cyan Probe (Right) -->
    <g class="lightprobe-cyan" transform="translate(570, 210)">
      <circle cx="0" cy="0" r="14" fill="#38bdf8" filter="${id.url('glow')}"/>
      <circle cx="0" cy="0" r="5" fill="#fff"/>
      <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.65"/>
      <circle cx="0" cy="0" r="54" fill="none" stroke="#7dd3fc" stroke-width="0.5" stroke-dasharray="2 4" opacity="0.35"/>
      <text x="0" y="-18" font-family="IBM Plex Mono, monospace" font-size="6.5" font-weight="600" fill="#38bdf8" text-anchor="middle">OMNI PROBE 02</text>
    </g>`;

  // 5. 32K GPU Compute Particle Fountain (Center Vent Erupting Upwards)
  const particleCone = [];
  const pCount = 95;
  for (let i = 0; i < pCount; i++) {
    const a = rand() * Math.PI * 2;
    const spread = Math.pow(rand(), 0.7) * 90;
    const h = 40 + rand() * 220;
    const px = 370 + Math.cos(a) * spread * (h / 220);
    const py = 390 - h;
    const r = 0.8 + rand() * 2.2;
    const col = rand() < 0.4 ? '#38bdf8' : rand() < 0.75 ? '#c084fc' : '#fde047';
    const op = 0.4 + rand() * 0.6;
    particleCone.push(`<circle cx="${r2(px)}" cy="${r2(py)}" r="${r2(r)}" fill="${col}" opacity="${r2(op)}" filter="url(#${id('particle-bloom')})"/>`);
  }

  // 6. Recoil Spring Damper Diagram (Telemetry Inset Left)
  const springTelemetry = `
    <g class="spring-damper-box" transform="translate(80, 420)">
      <rect x="0" y="0" width="130" height="75" rx="3" fill="rgba(11,15,30,0.88)" stroke="#334155" stroke-width="1"/>
      <text x="8" y="14" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="6.5" fill="#c084fc" letter-spacing="0.08em">PROCEDURAL RECOIL SPRING</text>
      <!-- Spring Helix Trace -->
      <path d="M15 45 L30 45 L35 32 L45 58 L55 32 L65 58 L75 32 L85 58 L90 45 L115 45" fill="none" stroke="#38bdf8" stroke-width="1.8"/>
      <text x="8" y="66" font-family="IBM Plex Mono, monospace" font-size="6" fill="#94a3b8">K = 180 N/m · ζ = 0.82</text>
    </g>`;

  const body = `
    <!-- Background Rendering Space -->
    ${bleedRect(id.url('godot-sky'))}
    <!-- Halftone matrix pattern -->
    <rect x="${BLEED.x}" y="${BLEED.y}" width="${BLEED.w}" height="${BLEED.h}" fill="${id.url('halftone')}" opacity="0.12"/>

    <!-- Global Illumination Bounce Light -->
    <circle cx="340" cy="330" r="280" fill="${id.url('sdfgi-bounce')}"/>
    <circle cx="210" cy="220" r="160" fill="${id.url('omni-violet')}"/>
    <circle cx="560" cy="240" r="160" fill="${id.url('omni-cyan')}"/>

    <!-- Clustered Forward+ Tile Grid Floor -->
    <g class="forward-tiles">${floorTiles}</g>

    <!-- Chrome Sphere & Frosted Glass Cube Still Life -->
    ${chromeSphere}
    ${glassCube}

    <!-- Light Probes -->
    ${lightProbes}

    <!-- 32K GPU Particle Fountain -->
    <g class="particle-fountain">${particleCone.join('')}</g>

    <!-- Recoil Spring Telemetry -->
    ${springTelemetry}

    <!-- Engineering Annotations -->
    ${label(400, 65, 'PLATE VII · “FORWARD+ LIGHTFIELD & PARTICLE FOUNDRY”', { size: 9, fill: '#c084fc', plate: 'rgba(15,10,35,0.85)', pad: 5, anchor: 'middle' })}
    ${label(370, 150, '32,000 GPU COMPUTE PARTICLES (COMPUTE SHADER)', { size: 7.5, fill: '#e0e7ff', plate: 'rgba(15,10,35,0.85)', pad: 4, anchor: 'middle' })}
    ${label(500, 485, 'VULKAN FORWARD+ CLUSTERED LIGHT GRID (16x16x24)', { size: 7.5, fill: '#38bdf8', anchor: 'middle' })}`;

  return {
    title: 'Forward+ Lightfield & Particle Foundry',
    svg: svgRoot({
      w: W,
      h: H,
      title: 'Plate VII: Forward+ Lightfield & Particle Foundry — Godot 4 Vulkan Forward+ clustered culling, SDFGI bounce, chrome sphere, and GPU particles',
      defs,
      body
    })
  };
}
