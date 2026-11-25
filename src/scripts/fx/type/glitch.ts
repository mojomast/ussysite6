/**
 * Sparingly placed RGB-split + slice-displacement glitch:
 * 1. The 404 headline (.opus-404-headline)
 * 2. Standalone word "slop" wherever it appears in headlines
 * 3. Brief arrival burst on the page's primary headline under html[data-rizz="max"]
 *
 * Decorative ::before/::after layers always sit on aria-hidden="true" spans with data-text
 * set at runtime so screen readers never read duplicated text.
 */
import type { FxTier } from '../capability.ts';

const SLOP_WORD_RE = /\bslop\b/gi;

/**
 * Pure matcher for standalone "slop" occurrences (case-insensitive word boundary).
 */
export function findSlopMatches(text: string): Array<{ start: number; end: number; match: string }> {
  const out: Array<{ start: number; end: number; match: string }> = [];
  SLOP_WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SLOP_WORD_RE.exec(text)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
  }
  return out;
}

export function initGlitch(getTier: () => FxTier, getRizz: () => boolean): () => void {
  const cleanups: Array<() => void> = [];
  const timers: number[] = [];

  // 1. Tag the 404 headline's aria-hidden visual layer
  const headline404 = document.querySelector<HTMLElement>('.opus-404-headline');
  if (headline404) {
    const kt = headline404.querySelector<HTMLElement>('.kt');
    const raw = (headline404.querySelector('.sr-only')?.textContent || headline404.textContent || '').trim();
    if (kt && raw) {
      kt.dataset.text = raw;
      kt.classList.add('fx-glitch-vis', 'fx-glitch-404');
      cleanups.push(() => {
        kt.classList.remove('fx-glitch-vis', 'fx-glitch-404');
        delete kt.dataset.text;
      });
    }
  }

  // 2a. Front-page masthead S-L-O-P letters (already aria-hidden="true")
  const mastheadLetters = document.querySelector<HTMLElement>('.masthead-monument .mo-masthead-letters');
  if (mastheadLetters) {
    mastheadLetters.dataset.text = 'SLOP';
    mastheadLetters.classList.add('fx-glitch-vis', 'fx-glitch-slop');
    cleanups.push(() => {
      mastheadLetters.classList.remove('fx-glitch-vis', 'fx-glitch-slop');
      delete mastheadLetters.dataset.text;
    });
  }

  // 2b. Standalone word "slop" in any headline (h1, h2, h3) outside .sr-only / already-tagged nodes
  const wrapSlopInTextNode = (textNode: Text) => {
    const value = textNode.nodeValue || '';
    const matches = findSlopMatches(value);
    if (matches.length === 0) return;

    const parent = textNode.parentNode;
    if (!parent) return;

    const frag = document.createDocumentFragment();
    const inserted: Node[] = [];
    let cursor = 0;

    for (const hit of matches) {
      if (hit.start > cursor) {
        const before = document.createTextNode(value.slice(cursor, hit.start));
        frag.appendChild(before);
        inserted.push(before);
      }

      const wrap = document.createElement('span');
      wrap.className = 'fx-glitch-wrap';

      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = hit.match;

      const vis = document.createElement('span');
      vis.className = 'fx-glitch-vis fx-glitch-slop';
      vis.setAttribute('aria-hidden', 'true');
      vis.dataset.text = hit.match;
      vis.textContent = hit.match;

      wrap.append(sr, vis);
      frag.appendChild(wrap);
      inserted.push(wrap);
      cursor = hit.end;
    }

    if (cursor < value.length) {
      const after = document.createTextNode(value.slice(cursor));
      frag.appendChild(after);
      inserted.push(after);
    }

    parent.replaceChild(frag, textNode);

    cleanups.push(() => {
      if (!inserted[0]?.parentNode) return;
      const restored = document.createTextNode(value);
      inserted[0].parentNode.insertBefore(restored, inserted[0]);
      for (const n of inserted) n.parentNode?.removeChild(n);
    });
  };

  const headings = document.querySelectorAll<HTMLElement>('h1, h2, h3');
  for (const h of headings) {
    if (h.closest('astro-island, .opus-cold-open')) continue;
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        if (el.closest('.sr-only, .fx-glitch-vis, .mo-masthead-letters, .fx-char-vis')) {
          return NodeFilter.FILTER_REJECT;
        }
        return /\bslop\b/i.test(node.nodeValue || '')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }
    for (const tn of textNodes) wrapSlopInTextNode(tn);
  }

  // 3. Brief arrival glitch under html[data-rizz="max"]
  const triggerArrivalGlitch = () => {
    if (getTier() === 'off' || !getRizz()) return;
    const primaryH1 = document.querySelector<HTMLElement>('main h1');
    if (!primaryH1) return;

    const target =
      primaryH1.querySelector<HTMLElement>('.mo-masthead-letters') ||
      primaryH1.querySelector<HTMLElement>('.kt') ||
      primaryH1.querySelector<HTMLElement>('.fx-char-vis') ||
      primaryH1.querySelector<HTMLElement>('.word-illustrated') ||
      primaryH1;

    const prevText = target.dataset.text;
    const raw =
      (target === primaryH1
        ? primaryH1.querySelector('.sr-only')?.textContent || primaryH1.textContent
        : target.classList.contains('mo-masthead-letters')
          ? 'SLOP'
          : primaryH1.querySelector('.sr-only')?.textContent || target.textContent) || '';

    const trimmed = raw.trim();
    if (!trimmed) return;

    target.dataset.text = trimmed;
    target.classList.add('fx-glitch-vis', 'is-fx-arrival-glitch');

    const t = window.setTimeout(() => {
      target.classList.remove('is-fx-arrival-glitch');
      if (!target.classList.contains('fx-glitch-404') && !target.classList.contains('fx-glitch-slop')) {
        target.classList.remove('fx-glitch-vis');
        if (prevText === undefined) delete target.dataset.text;
        else target.dataset.text = prevText;
      }
    }, 840);
    timers.push(t);
  };

  if (getRizz()) {
    triggerArrivalGlitch();
  }

  let rizzObserver: MutationObserver | null = null;
  if (typeof MutationObserver === 'function') {
    rizzObserver = new MutationObserver(() => {
      if (getRizz()) triggerArrivalGlitch();
    });
    rizzObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-rizz']
    });
  }

  return () => {
    rizzObserver?.disconnect();
    for (const t of timers) window.clearTimeout(t);
    timers.length = 0;
    for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
    cleanups.length = 0;
  };
}
