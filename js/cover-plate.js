/**
 * THE MACHINE BENEATH THE SKIN — SLOP ILLUSTRATED, plate I.
 * An original, path-traced biomechanical editorial sculpture, not product hardware.
 * The baked image needs no WebGL runtime; the SVG is an accessible project index.
 * Reproduction source: assets/cover/render-machine.py.
 */
import { USSY_PROJECTS } from './projects.js';
import { esc, svgRoot } from './svg-kit.js';
import { getIssueEntry, formatFolio } from './issue-map.js';

const ART = new URL('../assets/cover/machine-beneath-the-skin.webp', import.meta.url).href;
const shortTitle = (title) => title.split(' // ')[0];
const LABELS = {
  rgbagentflightindicator: 'RGB Flight Indicator',
  hermesdashboard: 'Hermes Dashboard'
};
const IDLE = 'ILLUSTRATED INDEX / SELECT A PROJECT';
const folioFor = (project) => formatFolio(getIssueEntry(USSY_PROJECTS, project.id));

export function buildCoverSvg() {
  const nodes = USSY_PROJECTS.map((project, index) => {
    const left = index < 6;
    const row = left ? index : index - 6;
    const x = left ? 24 : 591;
    const y = 119 + row * 61;
    const name = LABELS[project.id] || shortTitle(project.title);
    const folio = folioFor(project);
    return `<g class="cover-node" data-idx="${index}" transform="translate(${x} ${y})" tabindex="0" role="button"
      aria-label="${esc(`${project.title}, folio ${folio}. Open project article.`)}">
      <title>${esc(project.title)} · Folio ${folio}</title>
      <rect class="node-label-plate" x="0" y="-23" width="145" height="47" rx="2" fill="#101817" fill-opacity=".84"/>
      <rect class="node-focus-ring" x="0" y="-23" width="145" height="47" rx="2" fill="none" stroke="#dfc99d" stroke-width="1.2"/>
      <path class="index-rule" d="M0 24H145" stroke="#657069" stroke-opacity=".5" stroke-width=".5"/>
      <text class="node-number" x="9" y="-8" fill="#b8a382" font-family="monospace" font-size="7.5" letter-spacing="1.3">FOLIO ${folio}</text>
      <text class="node-label-text" x="9" y="9" fill="#e7e1d2" font-family="Arial, sans-serif" font-size="10.5">${esc(name)}</text>
      <path class="node-arrow" d="M128-10h7v7m0-7-8 8" fill="none" stroke="#d4ba8b" stroke-width=".8"/>
    </g>`;
  }).join('');
  const defs = `<linearGradient id="cv-edge"><stop stop-color="#080f0e"/><stop offset=".22" stop-color="#080f0e" stop-opacity="0"/><stop offset=".78" stop-color="#080f0e" stop-opacity="0"/><stop offset="1" stop-color="#080f0e"/></linearGradient>
    <linearGradient id="cv-bottom" x2="0" y2="1"><stop stop-color="#0b1211" stop-opacity="0"/><stop offset="1" stop-color="#0b1211"/></linearGradient>
    <style>
      .cover-svg .node-focus-ring { opacity:0; }
      .cover-svg .cover-node:focus-visible .node-focus-ring,
      .cover-svg .cover-node.is-hot .node-focus-ring { opacity:1; }
      .cover-svg .cover-node.is-hot .node-label-plate,
      .cover-svg .cover-node:focus-visible .node-label-plate { fill:#e7dfca; fill-opacity:1; }
      .cover-svg .cover-node.is-hot .node-label-text,
      .cover-svg .cover-node:focus-visible .node-label-text { fill:#121b18; }
      .cover-svg .cover-node.is-hot .node-number,
      .cover-svg .cover-node:focus-visible .node-number { fill:#515b50; }
      .cover-svg .cover-node.is-hot .node-arrow { stroke:#614d33; }
      .cover-svg .cover-node { cursor:pointer; }
      .cover-svg .node-arrow { opacity:.65; }
      .cover-svg .cover-node.is-hot .node-arrow { opacity:1; }
    </style>`;
  const body = `<rect class="cv-ground" width="760" height="540" fill="#0b1211"/>
    <image class="cv-art" href="${esc(ART)}" width="760" height="540" preserveAspectRatio="xMidYMid slice" aria-hidden="true"/>
    <rect class="cv-edge" width="760" height="540" fill="url(#cv-edge)" pointer-events="none"/>
    <rect class="cv-bottom" y="450" width="760" height="90" fill="url(#cv-bottom)" pointer-events="none"/>
    <g class="cv-edition" fill="#cbc7b5" font-family="monospace" font-size="8" letter-spacing="1.5" aria-hidden="true">
      <text x="25" y="30">Si. / PLATE I</text>
      <text class="cv-edition-right" x="735" y="30" text-anchor="end">AN IMAGINARY ANATOMY</text>
    </g>
    <g class="cv-nodes">${nodes}</g>
    <g class="cv-footer" fill="#bab9a9" font-family="monospace" font-size="7.5" letter-spacing="1.3" aria-hidden="true">
      <text x="25" y="517">ILLUSTRATED INDEX</text>
      <text class="cv-footer-right" x="735" y="517" text-anchor="end">SELECT A PROJECT ↗</text>
    </g>`;
  return svgRoot({ w:760, h:540, cls:'cover-svg', title:'The Machine Beneath the Skin',
    desc:'A conceptual biomechanical sculpture in a dark studio: branching veins cross a smoked-metal carapace above ivory ribs, exposed gears, hydraulic pistons, coiled conduits and a recessed optical iris. Eleven labeled project buttons open the magazine folios. This is editorial artwork, not a depiction of actual product hardware.',
    defs, body });
}

export function initCoverPlate(host, readoutEl, onSelectNode) {
  if (!host) return;
  host.innerHTML = buildCoverSvg();
  const svg = host.querySelector('svg');
  svg.setAttribute('role', 'group');
  const nodes = [...svg.querySelectorAll('.cover-node')];
  const reduce = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let visible = true;
  let focused = -1;
  let hovered = -1;

  // No perpetual render loop: path tracing is baked into the image. Keep the
  // motion contract for the shared SVG styles and respect background tabs.
  const syncMotion = () => {
    const running = visible && !document.hidden && !reduce?.matches;
    svg.classList.toggle('is-paused', !running);
    if (running) svg.unpauseAnimations?.();
    else svg.pauseAnimations?.();
  };
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncMotion();
    });
    observer.observe(host);
  }
  reduce?.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();

  const setHot = () => {
    const index = hovered >= 0 ? hovered : focused;
    nodes.forEach((node, i) => node.classList.toggle('is-hot', i === index));
    const project = USSY_PROJECTS[index];
    if (readoutEl) readoutEl.textContent = project
      ? `FOLIO ${folioFor(project)} / ${shortTitle(project.title).toUpperCase()}`
      : IDLE;
  };
  nodes.forEach((node, index) => {
    node.addEventListener('pointerenter', () => { hovered = index; setHot(); });
    node.addEventListener('pointerleave', () => { hovered = -1; setHot(); });
    node.addEventListener('focus', () => { focused = index; hovered = -1; setHot(); });
    node.addEventListener('blur', () => { focused = -1; setHot(); });
    const select = () => onSelectNode?.(USSY_PROJECTS[index].id);
    node.addEventListener('click', select);
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      } else if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? nodes.length - 1 :
          (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + nodes.length) % nodes.length;
        nodes[next].focus();
      }
    });
  });
  setHot();

  // Recompose, rather than shrinking eleven tiny labels on a phone. The same
  // buttons keep their focus, listeners and accessible names across resizes.
  let compact;
  let laidOutWidth = -1;
  const layout = () => {
    // Compose from the paper's layout width, before whole-sheet scaling.
    const width = host.clientWidth;
    const next = width < 520;
    if (next === compact && Math.abs(width - laidOutWidth) < 0.5) return;
    compact = next;
    laidOutWidth = width;
    const rowHeight = Math.max(56, 44 * 420 / Math.max(220, width - 2));
    const height = compact ? 920 + (rowHeight - 56) * 6 : 540;
    const labelSize = Math.min(18, Math.max(14, 11 * 420 / Math.max(220, width)));
    svg.setAttribute('viewBox', compact ? `0 0 420 ${height}` : '0 0 760 540');
    host.style.aspectRatio = compact ? `420 / ${height}` : '760 / 540';
    host.style.flex = '0 0 auto';
    const attrs = (selector, values) => {
      const el = svg.querySelector(selector);
      Object.entries(values).forEach(([key, value]) => el.setAttribute(key, value));
    };
    attrs('.cv-ground', { width:compact ? 420 : 760, height });
    attrs('.cv-art', { x:compact ? -128 : 0, y:compact ? 15 : 0, width:compact ? 676 : 760, height:compact ? 480 : 540 });
    attrs('.cv-edge', { width:compact ? 420 : 760, height:compact ? 495 : 540 });
    attrs('.cv-bottom', { y:compact ? 410 : 450, width:compact ? 420 : 760, height:90 });
    attrs('.cv-edition-right', { x:compact ? 395 : 735 });
    attrs('.cv-footer', { transform:compact ? 'translate(0 -35)' : 'translate(0 0)' });
    attrs('.cv-footer-right', { x:compact ? 395 : 735 });
    nodes.forEach((node, index) => {
      const x = compact ? 25 + index % 2 * 194 : index < 6 ? 24 : 591;
      const y = compact ? 532 + Math.floor(index / 2) * (rowHeight + 8) : 119 + (index < 6 ? index : index - 6) * 61;
      node.setAttribute('transform', `translate(${x} ${y})`);
      node.querySelectorAll('rect').forEach((rect) => {
        rect.setAttribute('width', compact ? 176 : 145);
        rect.setAttribute('height', compact ? rowHeight : 47);
      });
      node.querySelector('.node-label-text').setAttribute('font-size', compact ? labelSize : 10.5);
      node.querySelector('.node-label-text').setAttribute('y', compact ? 14 + (rowHeight - 56) / 2 : 9);
      node.querySelector('.node-number').setAttribute('font-size', compact ? labelSize * 0.715 : 7.5);
      node.querySelector('.node-number').setAttribute('y', compact ? -8 + (rowHeight - 56) / 2 : -8);
      node.querySelector('.index-rule').setAttribute('d', compact ? `M0 ${rowHeight - 23}H176` : 'M0 24H145');
      node.querySelector('.node-arrow').setAttribute('transform', compact ? 'translate(31 0)' : 'translate(0 0)');
    });
  };
  layout();
  if (typeof ResizeObserver === 'function') new ResizeObserver(layout).observe(host);
  else window.addEventListener('resize', layout);
}
