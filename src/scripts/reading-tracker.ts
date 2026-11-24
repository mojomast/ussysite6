/**
 * Proofreader's ticks. When a reader reaches the end of a feature, it is marked read in
 * localStorage, and every contents list on the site gets a vermilion tick beside it.
 * Nothing leaves the browser.
 */
import { carbonSynth } from '../lib/carbon-synth';

const KEY = 'si.read.v1';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function save(set: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // Storage is full or blocked; ticks will simply not persist.
  }
}

function countFor(set: Set<string>, issue: string): number {
  let n = 0;
  for (const key of set) if (key.startsWith(`${issue}/`)) n++;
  return n;
}

function paint(set: Set<string>): void {
  document.querySelectorAll<HTMLElement>('[data-read-id]').forEach((el) => {
    const key = el.dataset.readId || '';
    const isRead = set.has(key);
    el.classList.toggle('is-read', isRead);
    const mark = el.querySelector<HTMLElement>('.opus-read-mark');
    if (mark) mark.textContent = isRead ? '✓ read' : '';
  });

  document.querySelectorAll<HTMLElement>('[data-read-counter]').forEach((el) => {
    const issue = el.dataset.readCounter || '';
    const total = Number(el.dataset.readTotal || 0);
    const n = countFor(set, issue);
    el.classList.toggle('is-complete', total > 0 && n >= total);
    if (n === 0) {
      el.textContent = `Nothing read yet. ${total} features, no rush.`;
    } else if (n >= total) {
      el.textContent = `Read cover to cover, all ${total}. The editor would like to say thank you, and means it.`;
    } else {
      el.textContent = `You’ve read ${n} of ${total}.`;
    }
  });
}

function stamp(text: string, complete: boolean): void {
  const el = document.createElement('div');
  el.className = `opus-read-stamp${complete ? ' is-complete' : ''}`;
  el.setAttribute('role', 'status');
  el.textContent = text;
  document.body.appendChild(el);
  window.setTimeout(() => el.classList.add('is-leaving'), 3200);
  window.setTimeout(() => el.remove(), 3800);
}

function watchArticleEnd(set: Set<string>): void {
  const article = document.querySelector<HTMLElement>('[data-read-article]');
  const end = document.querySelector<HTMLElement>('[data-read-end]');
  if (!article || !end || typeof IntersectionObserver !== 'function') return;
  const key = article.dataset.readArticle || '';
  const issue = key.split('/')[0];
  const total = Number(article.dataset.readTotal || 0);

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    if (set.has(key)) return;
    set.add(key);
    save(set);
    paint(set);
    const n = countFor(set, issue);
    carbonSynth.tick(1600);
    if (total > 0 && n >= total) {
      stamp(`That’s all ${total}. Cover to cover. Thank you.`, true);
    } else {
      stamp(`✓ Marked read · ${n} of ${total} in Issue ${issue}`, false);
    }
  });
  io.observe(end);
}

function init(): void {
  const set = load();
  paint(set);
  watchArticleEnd(set);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
