/**
 * USSYSITE6 // EDITORIAL PLATE REGISTRY
 *
 * Each feature spread gets a full-bleed illustrated plate (Fig. N.2) rendered as inline SVG.
 * Plates live in `js/plates/<project-id>.js` and export a default function:
 *
 *    export default function plate(project) { return { title: string, svg: string }; }
 *
 * Plates are loaded lazily (dynamic import) so a missing/broken plate never takes down the
 * page — the frame simply keeps its printed placeholder.
 */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
export const toRoman = (n) => ROMAN[n - 1] || String(n);

export async function loadPlate(name, arg) {
  try {
    const mod = await import(`./${name}.js`);
    return mod.default(arg);
  } catch (err) {
    console.warn(`[plates] could not render plate "${name}":`, err);
    return null;
  }
}

/**
 * Mount a plate into a `.editorial-plate` figure. The figure must contain
 * `.editorial-plate-art` and an optional `.editorial-plate-title` element.
 */
export async function mountPlate(figure, name, arg) {
  if (!figure) return;
  const result = await loadPlate(name, arg);
  if (!result) return;
  const art = figure.querySelector('.editorial-plate-art');
  const titleEl = figure.querySelector('.editorial-plate-title');
  if (art) {
    art.innerHTML = result.svg;
    art.classList.add('is-printed');
    const svg = art.querySelector('svg');
    if (svg) watchPlateMotion(svg);
  }
  if (titleEl && result.title) titleEl.textContent = `“${result.title}”`;
}

const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionObserver = null;

/** Run plate animations only while the plate is on screen (and never under reduced motion). */
export function watchPlateMotion(svg) {
  const setRunning = (on) => {
    svg.classList.toggle('is-paused', !on);
    if (typeof svg.pauseAnimations === 'function') {
      on ? svg.unpauseAnimations() : svg.pauseAnimations();
    }
  };
  if (reduceMotion) {
    setRunning(false);
    return;
  }
  if (typeof IntersectionObserver !== 'function') return;
  motionObserver ||= new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.__setPlateRunning?.(e.isIntersecting)),
    { rootMargin: '120px 0px' }
  );
  svg.__setPlateRunning = setRunning;
  motionObserver.observe(svg);
}
