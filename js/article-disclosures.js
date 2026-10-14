/** Unfold engineering panels and resize fitted sheets in the same paint. */
export function initArticleDisclosures() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const controllers = [...document.querySelectorAll('.article-deep-dive')].map((details) => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('.article-technical-grid');
    const label = summary.querySelector('[data-deep-dive-label]');
    let expanded = details.open;
    let frame = 0;

    const resize = () => details.dispatchEvent(new Event('article-resize', { bubbles: true }));
    const syncControl = () => {
      summary.setAttribute('aria-expanded', String(expanded));
      label.textContent = expanded ? 'Close' : 'Explore';
    };
    const finish = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      details.open = expanded;
      details.style.removeProperty('height');
      details.classList.remove('is-disclosure-animating');
      content.inert = false;
      syncControl();
      resize();
    };

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const start = parseFloat(getComputedStyle(details).height);
      cancelAnimationFrame(frame);
      frame = 0;
      expanded = !expanded;
      if (!expanded && content.contains(document.activeElement)) summary.focus({ preventScroll: true });
      syncControl();
      if (reducedMotion.matches || matchMedia('print').matches) { finish(); return; }

      // Keep native content present while closing. Measuring the unscaled CSS
      // height also works when page view has shrunk the sheet to fit the screen.
      details.open = true;
      details.style.removeProperty('height');
      const full = details.offsetHeight;
      const style = getComputedStyle(details);
      const closed = summary.offsetHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const end = expanded ? full : closed;
      if (Math.abs(end - start) < 1) { finish(); return; }

      details.classList.add('is-disclosure-animating');
      content.inert = true;
      details.style.height = `${start}px`;
      const duration = Math.max(180, 620 * Math.min(1, Math.abs(end - start) / Math.max(1, full - closed)));
      const began = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - began) / duration);
        const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
        details.style.height = `${start + (end - start) * eased}px`;
        resize();
        if (t < 1) frame = requestAnimationFrame(step);
        else finish();
      };
      frame = requestAnimationFrame(step);
    });

    // Native/programmatic changes (including the print edition) stay in sync.
    details.addEventListener('toggle', () => {
      if (frame) return;
      expanded = details.open;
      syncControl();
    });
    syncControl();
    return { finish: () => { if (frame) finish(); } };
  });

  const finishAll = () => controllers.forEach((controller) => controller.finish());
  window.addEventListener('resize', finishAll);
  document.addEventListener('reader-layout-change', finishAll);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finishAll(); });
  return finishAll;
}
