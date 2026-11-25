/**
 * Wave 9 · Cursor & Micro-Interactions orchestrator (Taste Pass §10).
 *
 * Full tier + fine pointer:
 *   1. Decorative ink-nib follower + drying ink stroke + context states (READ/OPEN/PLAY, loupe,
 *      caret) on one fixed canvas (native cursor stays visible; rAF halts after 1.5s idle or when
 *      hidden/keyboard-navigating).
 *   2. Directional proof-ink sheen on .article-ledger-row (flat, non-tilting).
 *   3. Click ink splats on the cursor canvas + opt-in rate-limited sound feedback via carbonSynth.
 *   4. html[data-rizz='max']: gilt spark swarm chases the pointer.
 *
 * Magnetic buttons and 3D card tilt were cut in §10 (taste-skill restraint: flat Swiss editorial
 * cards lift 2px on hover rather than tilting; buttons stay locked to the hairline grid).
 *
 * Lite tier (including coarse / touch pointers):
 *   - No follower, no rAF loop; CSS-only tap ripple on buttons via setVars (--rx/--ry).
 *
 * Off tier (prefers-reduced-motion: reduce):
 *   - Completely quiescent; preserves all existing hover styles.
 */

import { fxTier, maxRizz, onTier, onVisible, pageVisible } from './capability';
import type { FxTier } from './capability';
import { clearVars, setVars } from './vars';
import { carbonSynth } from '../../lib/carbon-synth';
import { createRateLimiter, resolveCursorState } from './cursor/math';
import type { CursorContextResult, ElementProbe, RectLike } from './cursor/math';
import { createCursorCanvas } from './cursor/canvas';
import type { CursorCanvasController } from './cursor/canvas';

const RIPPLE_SELECTOR = '.btn-primary, .btn-secondary, .ctrl-btn, .neon-chip-btn, .sha-pill';
const SHEEN_SELECTOR = '.article-ledger-row';
const LINK_SELECTOR =
  'a[href], button, [role="button"], [role="option"], [role="tab"], .article-ledger-row';
const PLATE_SELECTOR =
  '.plate-art-box, .issue-card-art, .cover-viewport, .neon-study-stage, .plate-figure img, .plate-figure svg';
const CODE_SELECTOR = '.code-specimen pre, .code-specimen code, pre, code';
const KB_KEYS = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown'
]);

interface ActiveSheen {
  el: HTMLElement;
  selector: string;
  rect: RectLike;
  scrollX: number;
  scrollY: number;
}

function isFinePointer(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.pointer === 'coarse') return false;
  return window.matchMedia('(pointer: fine)').matches;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]'));
}

function probeTarget(target: EventTarget | null): CursorContextResult {
  if (!(target instanceof Element)) {
    return { mode: 'default', label: '', tone: 'ink' };
  }

  if (isEditableElement(target)) {
    return resolveCursorState({ isInput: true });
  }

  const interactive = target.closest(LINK_SELECTOR);
  if (interactive) {
    const isLedger = interactive.classList.contains('article-ledger-row');
    const anchor =
      interactive instanceof HTMLAnchorElement
        ? interactive
        : isLedger
          ? interactive.querySelector<HTMLAnchorElement>('a[href]')
          : null;
    const probe: ElementProbe = {
      isLinkOrButton: true,
      href: anchor?.getAttribute('href') || interactive.getAttribute('href') || '',
      targetBlank: anchor?.getAttribute('target') === '_blank',
      text: (interactive.getAttribute('aria-label') || interactive.textContent || '').trim().slice(0, 64),
      explicitLabel: interactive.getAttribute('data-cursor-label') || undefined
    };
    return resolveCursorState(probe);
  }

  if (target.closest(CODE_SELECTOR)) {
    return resolveCursorState({ isCode: true });
  }

  if (target.closest(PLATE_SELECTOR)) {
    return resolveCursorState({ isPlate: true });
  }

  return resolveCursorState({});
}

export function init(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  const root = document.documentElement;
  let tier: FxTier = fxTier();
  let kbMode = false;
  let nextSheenId = 1;
  let nextRippleId = 1;

  let canvasCtrl: CursorCanvasController | null = null;
  let activeSheen: ActiveSheen | null = null;

  const canSplatPop = createRateLimiter(140);

  const isFullFine = () => tier === 'full' && isFinePointer();

  const ensureCanvas = () => {
    if (canvasCtrl || !isFullFine()) return;
    const canvas = document.getElementById('fx-cursor-canvas');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    canvasCtrl = createCursorCanvas(canvas);
    canvasCtrl.setRizz(maxRizz());
    canvasCtrl.setVisible(pageVisible());
    if (kbMode) canvasCtrl.setSuppressed(true, 'kb');
  };

  const resetActiveSheen = () => {
    if (!activeSheen) return;
    setVars(activeSheen.selector, { '--glare-o': '0' });
    activeSheen = null;
  };

  const teardownFullMode = () => {
    resetActiveSheen();
    delete root.dataset.cursorKb;
    kbMode = false;
    canvasCtrl?.setSuppressed(true, 'off');
  };

  const playOptInPop = () => {
    if (!carbonSynth.isEnabled()) return;
    if (!canSplatPop(performance.now())) return;
    carbonSynth.tick(520);
  };

  const triggerLiteRipple = (el: HTMLElement, clientX: number, clientY: number) => {
    let rid = el.dataset.rippleId;
    if (!rid) {
      rid = String(nextRippleId++);
      el.dataset.rippleId = rid;
    }
    const r = el.getBoundingClientRect();
    const rx = r.width > 0 ? Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)) : 50;
    const ry = r.height > 0 ? Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100)) : 50;
    setVars(`[data-ripple-id="${rid}"]`, {
      '--rx': `${rx.toFixed(1)}%`,
      '--ry': `${ry.toFixed(1)}%`
    });
    el.dataset.ripplePhase = el.dataset.ripplePhase === 'a' ? 'b' : 'a';
  };

  const updateSheen = (clientX: number, clientY: number, target: EventTarget | null) => {
    const row = target instanceof Element ? target.closest<HTMLElement>(SHEEN_SELECTOR) : null;
    if (!row) {
      resetActiveSheen();
      return;
    }
    if (!activeSheen || activeSheen.el !== row) {
      resetActiveSheen();
      let sid = row.dataset.sheenId;
      if (!sid) {
        sid = String(nextSheenId++);
        row.dataset.sheenId = sid;
      }
      const r = row.getBoundingClientRect();
      activeSheen = {
        el: row,
        selector: `[data-sheen-id="${sid}"]`,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
    }
    const dx = window.scrollX - activeSheen.scrollX;
    const dy = window.scrollY - activeSheen.scrollY;
    const curLeft = activeSheen.rect.left - dx;
    const curTop = activeSheen.rect.top - dy;
    const gx = activeSheen.rect.width > 0 ? ((clientX - curLeft) / activeSheen.rect.width) * 100 : 50;
    const gy = activeSheen.rect.height > 0 ? ((clientY - curTop) / activeSheen.rect.height) * 100 : 50;
    setVars(activeSheen.selector, {
      '--glare-x': `${Math.min(100, Math.max(0, gx)).toFixed(1)}%`,
      '--glare-y': `${Math.min(100, Math.max(0, gy)).toFixed(1)}%`,
      '--glare-o': '1'
    });
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isFullFine()) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;

    if (kbMode) {
      kbMode = false;
      delete root.dataset.cursorKb;
    }

    ensureCanvas();
    const ctx = probeTarget(e.target);
    if (ctx.mode === 'input') {
      canvasCtrl?.setSuppressed(true, 'input');
    } else {
      canvasCtrl?.setSuppressed(false, 'input');
      canvasCtrl?.setSuppressed(false, 'kb');
      canvasCtrl?.setSuppressed(false, 'off');
      canvasCtrl?.onPointerMove(e.clientX, e.clientY, ctx, maxRizz());
    }

    updateSheen(e.clientX, e.clientY, e.target);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (tier === 'off') return;
    if (isEditableElement(e.target)) return;

    if (!isFullFine()) {
      const btn = e.target instanceof Element ? e.target.closest<HTMLElement>(RIPPLE_SELECTOR) : null;
      if (btn) {
        triggerLiteRipple(btn, e.clientX, e.clientY);
        playOptInPop();
      }
      return;
    }

    if (kbMode) {
      kbMode = false;
      delete root.dataset.cursorKb;
    }

    ensureCanvas();
    const ctx = probeTarget(e.target);
    canvasCtrl?.onPointerDown(e.clientX, e.clientY, ctx.tone, maxRizz());
    playOptInPop();
  };

  const onPointerLeave = () => {
    if (!isFullFine()) return;
    resetActiveSheen();
    canvasCtrl?.onPointerLeave();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!isFullFine()) return;
    if (!KB_KEYS.has(e.key)) return;
    if (!kbMode) {
      kbMode = true;
      root.dataset.cursorKb = 'on';
      resetActiveSheen();
      canvasCtrl?.setSuppressed(true, 'kb');
    }
  };

  const onResize = () => {
    resetActiveSheen();
  };

  const rootObserver = new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.attributeName === 'data-stock') {
        canvasCtrl?.refreshPalette();
      } else if (rec.attributeName === 'data-rizz') {
        canvasCtrl?.setRizz(maxRizz());
      }
    }
  });
  rootObserver.observe(root, { attributes: true, attributeFilter: ['data-stock', 'data-rizz'] });

  const unsubTier = onTier((nextTier) => {
    tier = nextTier;
    if (isFullFine()) {
      ensureCanvas();
    } else {
      teardownFullMode();
    }
  });

  const unsubVisible = onVisible((vis) => {
    canvasCtrl?.setVisible(vis);
    if (!vis) resetActiveSheen();
  });

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onPointerLeave, { passive: true });
  window.addEventListener('keydown', onKeyDown, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    unsubTier();
    unsubVisible();
    rootObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onPointerLeave);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    teardownFullMode();
    canvasCtrl?.destroy();
    canvasCtrl = null;
    clearVars('[data-sheen-id]');
  };
}
