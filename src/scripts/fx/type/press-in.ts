/**
 * One-shot Syne ink-press when a headline first enters view. It's a timed animation started by
 * a class, not a scroll-linked one: weight changes re-lay out the headline, and a view()
 * timeline would do that on every scroll frame while the headline is in range.
 */
const SELECTOR = '.section-heading, .article-headline, .under-hood-section h2';

export function initPressIn(): () => void {
  if (typeof IntersectionObserver !== 'function') return () => {};
  const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => !el.closest('astro-island'));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-fx-pressed-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -18% 0px' }
  );
  for (const el of els) io.observe(el);
  return () => {
    io.disconnect();
    for (const el of els) el.classList.remove('is-fx-pressed-in');
  };
}
