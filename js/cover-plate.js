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
const IDLE = 'Eleven projects / Select a folio';
const folioFor = (project) => formatFolio(getIssueEntry(USSY_PROJECTS, project.id));

export function buildCoverSvg() {
  const nodes = USSY_PROJECTS.map((project, index) => {
    const left = index < 6;
    const row = left ? index : index - 6;
    const x = left ? 32 : 728;
    const y = 118 + row * 62;
    const folio = folioFor(project);
    return `<g class="cover-node" data-idx="${index}" transform="translate(${x} ${y})" tabindex="0" role="button"
      aria-label="${esc(`${project.title}, folio ${folio}. Open project article.`)}">
      <title>${esc(project.title)} · Folio ${folio}</title>
      <rect class="node-hit-area" x="-22" y="-22" width="44" height="44" fill="transparent"/>
      <rect class="node-focus-ring" x="-21" y="-21" width="42" height="42" fill="none" stroke="#dfc99d" stroke-width="1"/>
      <path class="index-rule" d="${left ? 'M20 0H66' : 'M-20 0H-66'}" fill="none" stroke="#a3a697" stroke-opacity=".5" stroke-width=".6"/>
      <text class="node-number" x="0" y="4" text-anchor="middle" fill="#d4cfbb" font-family="'IBM Plex Mono', monospace" font-size="11">${folio}</text>
    </g>`;
  }).join('');
  const defs = `<style>
      .cover-svg .node-focus-ring { opacity:0; }
      .cover-svg .cover-node:focus-visible .node-focus-ring { opacity:1; }
      .cover-svg .cover-node.is-hot .node-number,
      .cover-svg .cover-node:focus-visible .node-number { fill:#fff6e3; }
      .cover-svg .cover-node.is-hot .index-rule { stroke:#fff6e3; stroke-opacity:1; }
      .cover-svg .cover-node { cursor:pointer; }
    </style>`;
  const body = `<rect class="cv-ground" width="760" height="540" fill="#0b1211"/>
    <image class="cv-art" href="${esc(ART)}" width="760" height="540" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>
    <g class="cv-nodes">${nodes}</g>`;
  return svgRoot({ w:760, h:540, cls:'cover-svg', title:'The Machine Beneath the Skin',
    desc:'A conceptual biomechanical sculpture in a dark studio: branching veins cross a smoked-metal carapace above ivory ribs, exposed gears, hydraulic pistons, coiled conduits and a recessed optical iris. Eleven numbered annotations open the corresponding magazine folios; focus an annotation to reveal its project name. This is editorial artwork, not a depiction of actual product hardware.',
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
      ? `${folioFor(project)} / ${shortTitle(project.title)}`
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

  // Small sheets move annotations below the intact artwork. Folio targets stay
  // at least 44 layout pixels; listeners and keyboard focus survive recomposition.
  let compact;
  let laidOutWidth = -1;
  const layout = () => {
    // Compose from the paper's layout width, before whole-sheet scaling.
    const width = host.clientWidth;
    if (!width) return; // A hidden reader leaf has no new layout to measure.
    const next = width < 760;
    if (next === compact && Math.abs(width - laidOutWidth) < 0.5) return;
    compact = next;
    laidOutWidth = width;
    const unit = 420 / width;
    const columns = Math.max(1, Math.min(11, Math.floor(width / 44)));
    const rowHeight = Math.max(48, 44 * unit);
    const artHeight = 420 * 540 / 760;
    const height = compact ? artHeight + 12 + Math.ceil(nodes.length / columns) * rowHeight : 540;
    svg.setAttribute('viewBox', compact ? `0 0 420 ${height}` : '0 0 760 540');
    host.style.aspectRatio = compact ? `420 / ${height}` : '760 / 540';
    host.style.flex = '0 0 auto';
    const attrs = (selector, values) => {
      const el = svg.querySelector(selector);
      Object.entries(values).forEach(([key, value]) => el.setAttribute(key, value));
    };
    attrs('.cv-ground', { width:compact ? 420 : 760, height });
    attrs('.cv-art', { x:0, y:0, width:compact ? 420 : 760, height:compact ? artHeight : 540 });
    nodes.forEach((node, index) => {
      const columnWidth = 420 / columns;
      const x = compact ? (index % columns + 0.5) * columnWidth : index < 6 ? 32 : 728;
      const y = compact ? artHeight + 12 + (Math.floor(index / columns) + 0.5) * rowHeight : 118 + (index < 6 ? index : index - 6) * 62;
      node.setAttribute('transform', `translate(${x} ${y})`);
      const targetWidth = compact ? columnWidth : 44;
      const targetHeight = compact ? rowHeight : 44;
      node.querySelectorAll('rect').forEach((rect) => {
        const inset = rect.classList.contains('node-focus-ring') ? 2 : 0;
        rect.setAttribute('x', -targetWidth / 2 + inset);
        rect.setAttribute('y', -targetHeight / 2 + inset);
        rect.setAttribute('width', targetWidth - inset * 2);
        rect.setAttribute('height', targetHeight - inset * 2);
      });
      const labelSize = compact ? Math.max(11, 12 * unit) : 11;
      node.querySelector('.node-number').setAttribute('font-size', labelSize);
      node.querySelector('.node-number').setAttribute('y', labelSize * 0.36);
      node.querySelector('.index-rule').setAttribute('d', compact
        ? `M${-targetWidth * 0.2} ${targetHeight / 2 - 3}h${targetWidth * 0.4}`
        : index < 6 ? 'M20 0H66' : 'M-20 0H-66');
    });
  };
  layout();
  if (typeof ResizeObserver === 'function') new ResizeObserver(layout).observe(host);
  else window.addEventListener('resize', layout);
}
