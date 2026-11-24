/**
 * Wave 9 · transitions.
 * Same-document View Transitions for PressControls dialogs (Finder, Keyboard Reference)
 * and InteractiveStudy step changes, intercepted cleanly from outside the Svelte islands.
 * Cross-document route choreography lives in public/motion-boot.js + src/styles/fx/transitions.css.
 */
import { fxTier, onTier, type FxTier } from './capability';

interface ViewTransitionHandle {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition?: () => void;
  types?: Set<string>;
}

interface StartViewTransitionOptions {
  update: () => void | Promise<void>;
  types?: string[];
}

type StartViewTransitionFn = (
  arg: (() => void | Promise<void>) | StartViewTransitionOptions
) => ViewTransitionHandle;

const DIALOG_SELECTOR = '#finder-dialog-title, #shortcuts-title';

function getStartVT(): StartViewTransitionFn | null {
  const doc = document as Document & { startViewTransition?: StartViewTransitionFn };
  return typeof doc.startViewTransition === 'function' ? doc.startViewTransition.bind(doc) : null;
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || el.nodeType !== 1) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

function waitForCommit(root: Node | null): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      mo?.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const mo =
      root && typeof MutationObserver === 'function'
        ? new MutationObserver(() => queueMicrotask(finish))
        : null;
    if (mo && root) mo.observe(root, { childList: true, subtree: true, attributes: true });
    const timer = window.setTimeout(finish, 40);
  });
}

function findFinderToggle(target: Element): HTMLButtonElement | null {
  const btn = target.closest<HTMLButtonElement>('.press-controls-bar button[aria-expanded]');
  if (!btn) return null;
  const title = btn.getAttribute('title') || '';
  return title.includes('Search every issue') ? btn : null;
}

function findTrackedDialogClose(target: Element): HTMLElement | null {
  const backdrop = target.closest<HTMLElement>('.carbon-modal-backdrop');
  if (!backdrop || !backdrop.querySelector(DIALOG_SELECTOR)) return null;
  if (target === backdrop) return backdrop;
  const closeBtn = target.closest<HTMLButtonElement>('.carbon-modal-header button');
  return closeBtn || null;
}

function resolveStudyClick(
  target: Element
): { bench: HTMLElement; stage: HTMLElement; dir: 'study-next' | 'study-prev'; dispatchEl: Element } | null {
  const bench = target.closest<HTMLElement>('.neon-study-bench');
  if (!bench) return null;
  const stage = bench.querySelector<HTMLElement>('.neon-study-stage');
  if (!stage) return null;

  const tab = target.closest<HTMLButtonElement>('.neon-step-tab');
  if (tab) {
    const tabs = [...bench.querySelectorAll<HTMLButtonElement>('.neon-step-tab')];
    const currentIdx = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const nextIdx = tabs.indexOf(tab);
    if (nextIdx === -1 || nextIdx === currentIdx) return null;
    return {
      bench,
      stage,
      dir: nextIdx > currentIdx ? 'study-next' : 'study-prev',
      dispatchEl: tab
    };
  }

  const ctrlBtn = target.closest<HTMLButtonElement>('.neon-study-controls button');
  if (ctrlBtn) {
    const label = (ctrlBtn.textContent || '').trim();
    const dir = label.includes('Back') || label.includes('←') ? 'study-prev' : 'study-next';
    return { bench, stage, dir, dispatchEl: ctrlBtn };
  }

  if (target.closest('.neon-study-stage')) {
    return { bench, stage, dir: 'study-next', dispatchEl: stage };
  }

  return null;
}

export function init(): void | (() => void) {
  let tier: FxTier = fxTier();
  let replaying = false;
  let activeVT: ViewTransitionHandle | null = null;

  const runTransition = (
    types: string[],
    rootClass: string,
    targetEl: HTMLElement | null,
    targetClass: string | null,
    observeRoot: Node | null,
    replay: () => void
  ): boolean => {
    const startVT = getStartVT();
    if (!startVT || tier === 'off') return false;

    if (activeVT) {
      activeVT.skipTransition?.();
      activeVT = null;
      return false;
    }

    const html = document.documentElement;
    html.classList.add(rootClass);
    if (targetEl && targetClass) targetEl.classList.add(targetClass);

    const cleanup = () => {
      html.classList.remove(rootClass);
      if (targetEl && targetClass) targetEl.classList.remove(targetClass);
      activeVT = null;
    };

    try {
      const vt = startVT({
        types,
        update: async () => {
          const committed = waitForCommit(observeRoot);
          replaying = true;
          try {
            replay();
          } finally {
            replaying = false;
          }
          await committed;
        }
      });
      activeVT = vt;
      vt.finished.then(cleanup, cleanup);
      return true;
    } catch {
      cleanup();
      return false;
    }
  };

  const onClick = (e: MouseEvent) => {
    if (replaying || tier === 'off' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    // 1. Finder button toggle (open or close)
    const finderBtn = findFinderToggle(target);
    if (finderBtn) {
      const opening = !document.getElementById('finder-dialog-title');
      const host = finderBtn.closest('.press-controls-wrap') || document.body;
      const started = runTransition(
        ['dialog-unfold', opening ? 'dialog-open' : 'dialog-close'],
        'is-vt-dialog',
        null,
        null,
        host,
        () => finderBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))
      );
      if (started) {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    }

    // 2. Finder or Keyboard-reference dialog close (button or backdrop)
    const closeEl = findTrackedDialogClose(target);
    if (closeEl) {
      const host = closeEl.closest('.press-controls-wrap') || document.body;
      const started = runTransition(
        ['dialog-unfold', 'dialog-close'],
        'is-vt-dialog',
        null,
        null,
        host,
        () => closeEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))
      );
      if (started) {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    }

    // 3. Interactive study step click
    const study = resolveStudyClick(target);
    if (study) {
      const started = runTransition(
        ['study-slide', study.dir],
        'is-vt-study',
        study.stage,
        'is-vt-study-target',
        study.bench,
        () => study.dispatchEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }))
      );
      if (started) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (replaying || tier === 'off') return;

    // 1. Escape closes Finder or Keyboard-reference dialog
    if (e.key === 'Escape') {
      const openDialog = document.querySelector(DIALOG_SELECTOR);
      if (!openDialog) return;
      const host = openDialog.closest('.press-controls-wrap') || document.body;
      const dispatchTarget = e.target instanceof EventTarget ? e.target : window;
      const started = runTransition(
        ['dialog-unfold', 'dialog-close'],
        'is-vt-dialog',
        null,
        null,
        host,
        () =>
          dispatchTarget.dispatchEvent(
            new KeyboardEvent('keydown', { key: e.key, code: e.code, bubbles: true, cancelable: true, composed: true })
          )
      );
      if (started) {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // 2. '/' (Finder) or '?' (Keyboard reference) when not typing in an input
    if ((e.key === '/' || e.key === '?') && !isEditableTarget(e.target)) {
      const targetId = e.key === '/' ? 'finder-dialog-title' : 'shortcuts-title';
      const opening = !document.getElementById(targetId);
      const host = document.querySelector('.press-controls-wrap') || document.body;
      const started = runTransition(
        ['dialog-unfold', opening ? 'dialog-open' : 'dialog-close'],
        'is-vt-dialog',
        null,
        null,
        host,
        () =>
          window.dispatchEvent(
            new KeyboardEvent('keydown', { key: e.key, code: e.code, bubbles: true, cancelable: true })
          )
      );
      if (started) {
        e.stopPropagation();
        e.preventDefault();
      }
      return;
    }

    // 3. Arrow / Home / End stepping on focused InteractiveStudy stage
    const stageEl = e.target instanceof Element ? e.target.closest<HTMLElement>('.neon-study-stage') : null;
    if (stageEl) {
      let dir: 'study-next' | 'study-prev' | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'End') dir = 'study-next';
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Home') dir = 'study-prev';
      if (!dir) return;
      const bench = stageEl.closest<HTMLElement>('.neon-study-bench');
      const started = runTransition(
        ['study-slide', dir],
        'is-vt-study',
        stageEl,
        'is-vt-study-target',
        bench,
        () =>
          stageEl.dispatchEvent(
            new KeyboardEvent('keydown', { key: e.key, code: e.code, bubbles: true, cancelable: true, composed: true })
          )
      );
      if (started) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };

  document.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);
  const unsubTier = onTier((next) => {
    tier = next;
    if (next === 'off' && activeVT) {
      activeVT.skipTransition?.();
      activeVT = null;
    }
  });

  return () => {
    unsubTier();
    document.removeEventListener('click', onClick, true);
    window.removeEventListener('keydown', onKeyDown, true);
    activeVT?.skipTransition?.();
    activeVT = null;
  };
}
