/**
 * Wave 9 · scrolly. Owned by the scrolly track.
 *
 * CSS scroll-driven animations handle all per-frame visual motion (the press run
 * horizontal track, depth parallax layers, @property integer counters, the vertical
 * reading-progress ink fill, and reveal choreography). This module only wires the
 * small pieces CSS cannot express on its own:
 *   1. Binding any dynamic [data-fx-count] integers via CSP-safe setVars().
 *   2. Discovering article h2 headings to place chapter ticks along the vertical ink rail
 *      and lighting them up as passed using IntersectionObserver (no scroll listeners).
 *   3. Revealing a keyboard-focused sheet inside the sticky horizontal press run so
 *      keyboard Tab users never focus an offscreen sheet.
 */
import { fxTier, onInView, onTier } from './capability';
import { setVars } from './vars';

function bindDynamicCounters(): void {
  const seen = new Set<number>();
  document.querySelectorAll<HTMLElement>('[data-fx-count]').forEach((el) => {
    const raw = el.dataset.fxCount;
    if (!raw) return;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n <= 0 || seen.has(n)) return;
    seen.add(n);
    setVars(`[data-fx-count="${n}"]`, { '--fx-count-to': n });
  });
}

function initReadingInk(): (() => void) | null {
  const rail = document.querySelector<HTMLElement>('[data-fx-ink-rail]');
  const tickList = rail?.querySelector<HTMLOListElement>('[data-fx-ink-ticks]');
  const article = document.querySelector<HTMLElement>('.article-monograph');
  if (!rail || !tickList || !article) return null;

  const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2'));
  if (headings.length === 0) return null;

  const cleanups: Array<() => void> = [];
  const ticks: Array<{ heading: HTMLHeadingElement; li: HTMLLIElement; index: number }> = [];

  tickList.replaceChildren();
  headings.forEach((heading, idx) => {
    const li = document.createElement('li');
    li.className = 'fx-ink-tick';
    li.dataset.fxTick = String(idx);

    const nib = document.createElement('span');
    nib.className = 'fx-ink-tick-nib';

    const label = document.createElement('span');
    label.className = 'fx-ink-tick-label';
    label.textContent = (heading.textContent || '').trim();

    li.append(nib, label);
    tickList.appendChild(li);
    ticks.push({ heading, li, index: idx });
  });

  const positionTicks = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    for (const { heading, index } of ticks) {
      const topDoc = heading.getBoundingClientRect().top + window.scrollY;
      // Align tick with the moment the heading reaches the upper reading band (~28% down viewport).
      const triggerScroll = Math.max(0, topDoc - window.innerHeight * 0.28);
      const pct = Math.min(96, Math.max(4, (triggerScroll / maxScroll) * 100));
      setVars(`.fx-ink-tick[data-fx-tick="${index}"]`, { '--fx-tick-y': `${pct.toFixed(2)}%` });
    }
  };

  positionTicks();

  let resizeTimer: number | null = null;
  const onResize = () => {
    if (resizeTimer !== null) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resizeTimer = null;
      positionTicks();
    }, 180);
  };
  window.addEventListener('resize', onResize, { passive: true });
  cleanups.push(() => {
    window.removeEventListener('resize', onResize);
    if (resizeTimer !== null) window.clearTimeout(resizeTimer);
  });

  const passed = new Set<number>();
  const syncClasses = () => {
    let highest = -1;
    for (const i of passed) if (i > highest) highest = i;
    for (const { li, index } of ticks) {
      li.classList.toggle('is-passed', passed.has(index));
      li.classList.toggle('is-current', index === highest);
    }
  };

  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      (entries) => {
        const thresholdY = window.innerHeight * 0.42;
        for (const entry of entries) {
          const item = ticks.find((t) => t.heading === entry.target);
          if (!item) continue;
          if (entry.isIntersecting || entry.boundingClientRect.top <= thresholdY) {
            passed.add(item.index);
          } else {
            passed.delete(item.index);
          }
        }
        syncClasses();
      },
      { rootMargin: '-8% 0px -58% 0px', threshold: [0, 1] }
    );
    for (const { heading } of ticks) io.observe(heading);
    cleanups.push(() => io.disconnect());
  }

  const endMark = article.querySelector<HTMLElement>('[data-read-end]');
  const endCap = rail.querySelector<HTMLElement>('[data-fx-ink-end]');
  if (endMark && endCap) {
    cleanups.push(
      onInView(endMark, (visible) => {
        if (visible) endCap.classList.add('is-reached');
      }, '0px')
    );
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}

function initPressRunFocus(): (() => void) | null {
  const section = document.querySelector<HTMLElement>('[data-fx-press-run]');
  const track = section?.querySelector<HTMLElement>('[data-fx-press-track]');
  if (!section || !track) return null;

  const total = Number.parseInt(section.dataset.sheetCount || '0', 10);
  if (total > 1) {
    setVars('[data-fx-press-run]', { '--fx-sheet-total': total });
  }

  const onFocusIn = (ev: FocusEvent) => {
    if (fxTier() === 'off') return;
    if (window.innerWidth < 960) return;
    const target = ev.target as HTMLElement | null;
    const sheet = target?.closest<HTMLElement>('.fx-press-sheet');
    if (!sheet) return;
    const rect = sheet.getBoundingClientRect();
    // Only adjust if keyboard focus landed on a sheet currently outside the horizontal viewport.
    if (rect.left >= 0 && rect.right <= window.innerWidth) return;
    const idx = Number.parseInt(sheet.dataset.sheetIndex || '1', 10) - 1;
    const count = Math.max(2, total);
    const ratio = Math.min(1, Math.max(0, idx / (count - 1)));
    const secRect = section.getBoundingClientRect();
    const secTop = secRect.top + window.scrollY;
    const scrollable = Math.max(0, section.offsetHeight - window.innerHeight);
    if (scrollable <= 0) return;
    window.scrollTo({ top: secTop + scrollable * ratio, behavior: 'auto' });
  };

  track.addEventListener('focusin', onFocusIn);
  return () => track.removeEventListener('focusin', onFocusIn);
}

export function init(): void | (() => void) {
  const cleanups: Array<() => void> = [];

  const inkCleanup = initReadingInk();
  if (inkCleanup) cleanups.push(inkCleanup);

  const pressCleanup = initPressRunFocus();
  if (pressCleanup) cleanups.push(pressCleanup);

  let countersBound = false;
  cleanups.push(
    onTier((tier) => {
      if (tier !== 'off' && !countersBound) {
        countersBound = true;
        bindDynamicCounters();
      }
    })
  );

  return () => {
    for (const fn of cleanups) fn();
  };
}
