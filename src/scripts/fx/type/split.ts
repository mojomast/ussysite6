/**
 * Runtime text-to-character splitter for headings.
 * Always keeps the intact sentence available to screen readers (.sr-only copy paired with
 * aria-hidden split spans), preserves inline <em> / <a> elements and existing <Kinetic>
 * markup, and cleanly restores the original DOM on teardown.
 */

const MAX_STAGGER_INDEX = 24;

interface SplitRecord {
  el: HTMLElement;
  kind: 'masthead' | 'kinetic' | 'wrapped';
  chars: HTMLElement[];
  restore: () => void;
}

const splitRecords = new Map<HTMLElement, SplitRecord>();

function createCharSpan(ch: string, index: number): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'fx-ch';
  span.dataset.fxCi = String(Math.min(index, MAX_STAGGER_INDEX));
  span.textContent = ch;
  return span;
}

function appendSplitText(text: string, target: Node, chars: HTMLElement[]): void {
  const tokens = text.split(/(\s+)/);
  for (const token of tokens) {
    if (!token) continue;
    if (/^\s+$/.test(token)) {
      target.appendChild(document.createTextNode(token));
      continue;
    }
    const wordSpan = document.createElement('span');
    wordSpan.className = 'fx-w';
    for (const ch of [...token]) {
      const chSpan = createCharSpan(ch, chars.length);
      chars.push(chSpan);
      wordSpan.appendChild(chSpan);
    }
    target.appendChild(wordSpan);
  }
}

function cloneSplitNodes(source: Node, target: Node, chars: HTMLElement[]): void {
  for (const child of [...source.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      appendSplitText(child.textContent || '', target, chars);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (el.classList.contains('sr-only')) continue;
      const clone = el.cloneNode(false) as HTMLElement;
      cloneSplitNodes(el, clone, chars);
      target.appendChild(clone);
    }
  }
}

export function splitElementToChars(el: HTMLElement): HTMLElement[] {
  const existing = splitRecords.get(el);
  if (existing) return existing.chars;

  // Case 1: Masthead S-L-O-P already has .sr-only + .mo-masthead-letters > span
  const mastheadLetters = el.querySelector<HTMLElement>('.mo-masthead-letters');
  if (mastheadLetters) {
    const spans = [...mastheadLetters.querySelectorAll<HTMLElement>(':scope > span')];
    spans.forEach((span, idx) => {
      span.classList.add('fx-ch');
      span.dataset.fxCi = String(Math.min(idx, MAX_STAGGER_INDEX));
    });
    el.dataset.fxSplit = '1';
    const record: SplitRecord = {
      el,
      kind: 'masthead',
      chars: spans,
      restore: () => {
        for (const span of spans) {
          span.classList.remove('fx-ch');
          delete span.dataset.fxCi;
          delete span.dataset.fxId;
        }
        delete el.dataset.fxSplit;
        el.classList.remove('fx-chars-reveal', 'is-fx-press');
      }
    };
    splitRecords.set(el, record);
    return spans;
  }

  // Case 2: <Kinetic> already provides .sr-only + .kt[aria-hidden="true"] > .kt-w > .kt-wi
  const kt = el.querySelector<HTMLElement>('.kt');
  if (kt) {
    const words = [...kt.querySelectorAll<HTMLElement>('.kt-wi')];
    const originals = words.map((w) => w.textContent || '');
    const chars: HTMLElement[] = [];

    words.forEach((wordEl, wIdx) => {
      const raw = originals[wIdx];
      wordEl.textContent = '';
      for (const ch of [...raw]) {
        const chSpan = createCharSpan(ch, chars.length);
        chars.push(chSpan);
        wordEl.appendChild(chSpan);
      }
    });

    el.dataset.fxSplit = '1';
    const record: SplitRecord = {
      el,
      kind: 'kinetic',
      chars,
      restore: () => {
        words.forEach((wordEl, wIdx) => {
          wordEl.textContent = originals[wIdx];
        });
        delete el.dataset.fxSplit;
        el.classList.remove('fx-chars-reveal', 'is-fx-press');
      }
    };
    splitRecords.set(el, record);
    return chars;
  }

  // Case 3: Plain heading, heading with <em>, or heading wrapping a single <a> link.
  // If the only element child is an <a>, split inside the <a> so focus/href stay intact.
  const host =
    el.children.length === 1 && el.children[0].tagName === 'A'
      ? (el.children[0] as HTMLElement)
      : el;

  const originalNodes = [...host.childNodes].map((n) => n.cloneNode(true));
  const fullText = host.textContent || '';

  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = fullText;

  const vis = document.createElement('span');
  vis.className = 'fx-char-vis';
  vis.setAttribute('aria-hidden', 'true');

  const chars: HTMLElement[] = [];
  cloneSplitNodes(host, vis, chars);

  host.textContent = '';
  host.append(sr, vis);
  el.dataset.fxSplit = '1';

  const record: SplitRecord = {
    el,
    kind: 'wrapped',
    chars,
    restore: () => {
      host.textContent = '';
      for (const node of originalNodes) host.appendChild(node.cloneNode(true));
      delete el.dataset.fxSplit;
      el.classList.remove('fx-chars-reveal', 'is-fx-press');
    }
  };
  splitRecords.set(el, record);
  return chars;
}

export function restoreAllSplits(): void {
  for (const record of splitRecords.values()) {
    record.restore();
  }
  splitRecords.clear();
}

const CHAR_REVEAL_SELECTOR =
  'h2.section-heading, .under-hood-section h2, .opus-about .article-prose-body h2, h2.hero-issue-headline:not(.vt-issue-title)';

/**
 * Splits h2 section heads so CSS view() timelines can reveal each character
 * (rise + de-blur + Syne wght) staggered via data-fx-ci custom properties.
 */
export function initCharReveals(): () => void {
  const headings = [...document.querySelectorAll<HTMLElement>(CHAR_REVEAL_SELECTOR)];
  const prepared: HTMLElement[] = [];

  for (const h2 of headings) {
    if (h2.closest('astro-island')) continue;
    const text = (h2.textContent || '').trim();
    if (!text || text.length > 90) continue;
    splitElementToChars(h2);
    h2.classList.add('fx-chars-reveal');
    prepared.push(h2);
  }

  return () => {
    for (const h2 of prepared) {
      h2.classList.remove('fx-chars-reveal');
    }
  };
}
