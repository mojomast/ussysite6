/**
 * USSYSITE6 // EDITORIAL PLATE REGISTRY
 *
 * Each feature spread gets an editorial plate (Fig. N.1): inline vector artwork
 * or a locally rendered Blender still life.
 * Plates live in `js/plates/<project-id>.js` and export a default function:
 *
 *    export default function plate(project) { return { title, svg }; }
 *    // Or: { title, medium, image: { src, width, height, alt, background } }
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
  const mediumEl = figure.querySelector('.editorial-plate-medium');
  figure.classList.toggle('editorial-plate--rendered', Boolean(result.image));
  if (art) {
    if (result.image) {
      const image = document.createElement('img');
      image.className = 'editorial-render-img';
      image.src = result.image.src;
      image.width = result.image.width;
      image.height = result.image.height;
      image.alt = result.image.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      art.replaceChildren(image);
      art.classList.add('is-rendered');
      art.style.setProperty('--art-backdrop', result.image.background || '#151b1a');
    } else {
      art.innerHTML = result.svg;
      art.classList.remove('is-rendered');
    }
    art.classList.add('is-printed');
    const svg = art.querySelector('svg');
    if (svg) watchPlateMotion(svg);
  }
  if (titleEl && result.title) titleEl.textContent = `“${result.title}”`;
  if (mediumEl && result.medium) mediumEl.textContent = result.medium;
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
