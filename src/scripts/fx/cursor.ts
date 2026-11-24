/**
 * Wave 9 · Cursor & Micro-Interactions orchestrator.
 *
 * Full tier + fine pointer:
 *   1. Ink-nib follower + drying ink stroke + context states (READ/OPEN/PLAY, loupe, caret)
 *      on one fixed canvas (rAF halts after 1.5s idle or when hidden/keyboard-navigating).
 *   2. Magnetic buttons & chips (data-magnet-id + setVars --mx/--my + inner label depth).
 *   3. 3D perspective tilt + specular radial glare on cards & plates (data-tilt-id + setVars).
 *   4. Directional ink sheen on .article-ledger-row.
 *   5. Click ink splats on the cursor canvas + opt-in rate-limited sound feedback via carbonSynth.
 *   6. html[data-rizz='max']: gilt bee/spark swarm + stronger magnetic pull & deeper tilt.
 *
 * Lite tier (including coarse / touch pointers):
 *   - No follower, no magnets, no tilt, no rAF loop.
 *   - CSS-only tap/click ripple on buttons using setVars (--rx/--ry) + dual-phase animation.
 *
 * Off tier (prefers-reduced-motion: reduce):
 *   - Completely quiescent; preserves all existing hover styles.
 */

import { fxTier, maxRizz, onTier, onVisible, pageVisible } from './capability';
import type { FxTier } from './capability';
import { clearVars, setVars } from './vars';
import { carbonSynth } from '../../lib/carbon-synth';
import {
  computeMagnetOffset,
  computeTilt,
  createRateLimiter,
  resolveCursorState
} from './cursor/math';
import type { CursorContextResult, ElementProbe, RectLike } from './cursor/math';
import { createCursorCanvas } from './cursor/canvas';
import type { CursorCanvasController } from './cursor/canvas';

const MAGNET_SELECTOR =
  '.btn-primary, .btn-secondary, .ctrl-btn, .neon-chip-btn, .sha-pill, .nav-link';
const RIPPLE_SELECTOR =
  '.btn-primary, .btn-secondary, .ctrl-btn, .neon-chip-btn, .sha-pill';
const TILT_SELECTOR =
  '.issue-folio-card, .cover-stage-frame, .plate-figure, .dispatch-cell';
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

interface MagnetRecord {
  el: HTMLElement;
  id: string;
  selector: string;
  rect: RectLike;
  radius: number;
  maxX: number;
  maxY: number;
  active: boolean;
  dx: number;
  dy: number;
  fixed: boolean;
}

interface ActiveTilt {
  el: HTMLElement;
  id: string;
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
          ? interactive.querySelector<HTMLAnchorElement>('h3 a[href]')
          : null;

    const probe: ElementProbe = {
      isLinkOrButton: true,
      explicitLabel: interactive.getAttribute('data-cursor-label'),
      href: anchor?.getAttribute('href') || interactive.getAttribute('href'),
      targetBlank: anchor?.target === '_blank' || interactive.getAttribute('target') === '_blank',
      text: isLedger ? 'read' : (interactive.textContent || '').slice(0, 64),
      ariaLabel: interactive.getAttribute('aria-label') || '',
      isAccentSignal:
        interactive.classList.contains('neon-btn-accent') ||
        interactive.classList.contains('neon-chip-btn') ||
        interactive.classList.contains('neon-step-tab') ||
        interactive.classList.contains('sha-pill'),
      isGilt:
        interactive.classList.contains('opus-lamp-btn') ||
        Boolean(interactive.closest('.opus-last-page'))
    };
    return resolveCursorState(probe);
  }

  if (target.closest(CODE_SELECTOR)) {
    return resolveCursorState({ isCode: true });
  }

  if (target.closest(PLATE_SELECTOR)) {
    return resolveCursorState({ isPlate: true });
  }

  return { mode: 'default', label: '', tone: 'ink' };
}

function wrapStaticButtonLabel(el: HTMLElement): void {
  // Never mutate children inside Svelte islands; Svelte tracks child nodes directly.
  if (el.closest('astro-island')) return;
  if (el.querySelector(':scope > .fx-mag-label')) return;
  if (el.childNodes.length === 0) return;

  const span = document.createElement('span');
  span.className = 'fx-mag-label';
  while (el.firstChild) {
    span.appendChild(el.firstChild);
  }
  el.appendChild(span);
}

function magnetStrengthFor(el: HTMLElement): { radius: number; maxX: number; maxY: number } {
  if (el.closest('.stock-group')) {
    return { radius: 22, maxX: 2.5, maxY: 2 };
  }
  if (el.classList.contains('btn-primary') || el.classList.contains('btn-secondary')) {
    return { radius: 74, maxX: 10, maxY: 7 };
  }
  if (el.classList.contains('neon-chip-btn')) {
    return { radius: 52, maxX: 6.5, maxY: 5 };
  }
  if (el.classList.contains('nav-link')) {
    return { radius: 36, maxX: 5, maxY: 4 };
  }
  return { radius: 46, maxX: 6, maxY: 4.5 };
}

export function init(): void | (() => void) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.documentElement;
  const canvasEl = document.getElementById('fx-cursor-canvas');
  let tier: FxTier = fxTier();
  let canvasCtrl: CursorCanvasController | null = null;

  let magnetSeq = 0;
  let tiltSeq = 0;
  let sheenSeq = 0;
  let rippleSeq = 0;

  let magnets: MagnetRecord[] = [];
  let scanDirty = true;
  let rectsDirty = true;
  let lastRectRefreshMs = 0;

  let activeTilt: ActiveTilt | null = null;
  let activeSheen: ActiveTilt | null = null;
  let kbMode = false;

  const canMagnetTick = createRateLimiter(190);
  const canSplatPop = createRateLimiter(140);

  const isFullFine = (): boolean => tier === 'full' && isFinePointer();

  const playOptInTick = (pitch: number, gate: (now: number) => boolean) => {
    if (!carbonSynth.isEnabled()) return;
    const now = performance.now();
    if (!gate(now)) return;
    carbonSynth.tick(pitch);
  };

  const scanMagnets = () => {
    scanDirty = false;
    const nodes = document.querySelectorAll<HTMLElement>(MAGNET_SELECTOR);
    const next: MagnetRecord[] = [];
    const byEl = new Map<HTMLElement, MagnetRecord>();
    for (const rec of magnets) byEl.set(rec.el, rec);

    for (const el of nodes) {
      let rec = byEl.get(el);
      if (!rec) {
        let id = el.dataset.magnetId;
        if (!id) {
          id = String(++magnetSeq);
          el.dataset.magnetId = id;
        }
        wrapStaticButtonLabel(el);
        const cfg = magnetStrengthFor(el);
        const fixed = Boolean(
          el.closest('.press-masthead, .neon-audio-dock, .carbon-modal, .neon-drawer')
        );
        rec = {
          el,
          id,
          selector: `[data-magnet-id="${id}"]`,
          rect: { left: 0, top: 0, width: 0, height: 0 },
          radius: cfg.radius,
          maxX: cfg.maxX,
          maxY: cfg.maxY,
          active: false,
          dx: 0,
          dy: 0,
          fixed
        };
      }
      next.push(rec);
    }

    // Clear stale selectors for removed elements (e.g. closed modals/drawers)
    const nextSet = new Set(nodes);
    for (const old of magnets) {
      if (!nextSet.has(old.el)) {
        clearVars(old.selector);
      }
    }

    magnets = next;
    rectsDirty = true;
  };

  const refreshMagnetRects = () => {
    rectsDirty = false;
    lastRectRefreshMs = performance.now();
    for (let i = 0; i < magnets.length; i++) {
      const m = magnets[i];
      const r = m.el.getBoundingClientRect();
      // Subtract current active translation so the resting anchor never drifts
      m.rect = {
        left: r.left - m.dx,
        top: r.top - m.dy,
        width: r.width,
        height: r.height
      };
    }
  };

  const resetAllMagnets = () => {
    for (let i = 0; i < magnets.length; i++) {
      const m = magnets[i];
      if (m.active || m.dx !== 0 || m.dy !== 0) {
        m.active = false;
        m.dx = 0;
        m.dy = 0;
        delete m.el.dataset.magnetActive;
        setVars(m.selector, { '--mx': '0px', '--my': '0px' });
      }
    }
  };

  const updateMagnets = (px: number, py: number, rizz: boolean) => {
    if (scanDirty) scanMagnets();
    const now = performance.now();
    if (rectsDirty && now - lastRectRefreshMs > 90) {
      refreshMagnetRects();
    }

    const vh = window.innerHeight;
    for (let i = 0; i < magnets.length; i++) {
      const m = magnets[i];
      const r = m.rect;
      if (r.width === 0 || r.height === 0) continue;
      if (r.top + r.height < -140 || r.top > vh + 140) {
        if (m.active) {
          m.active = false;
          m.dx = 0;
          m.dy = 0;
          delete m.el.dataset.magnetActive;
          setVars(m.selector, { '--mx': '0px', '--my': '0px' });
        }
        continue;
      }

      const res = computeMagnetOffset(px, py, r, {
        radius: m.radius,
        maxX: m.maxX,
        maxY: m.maxY,
        rizz
      });

      if (res.active) {
        const justEngaged = !m.active;
        m.active = true;
        m.dx = res.dx;
        m.dy = res.dy;
        m.el.dataset.magnetActive = 'on';
        setVars(m.selector, {
          '--mx': `${res.dx.toFixed(2)}px`,
          '--my': `${res.dy.toFixed(2)}px`
        });
        if (justEngaged) {
          playOptInTick(1850, canMagnetTick);
        }
      } else if (m.active) {
        m.active = false;
        m.dx = 0;
        m.dy = 0;
        delete m.el.dataset.magnetActive;
        setVars(m.selector, { '--mx': '0px', '--my': '0px' });
      }
    }
  };

  const resetActiveTilt = () => {
    if (!activeTilt) return;
    delete activeTilt.el.dataset.tiltActive;
    setVars(activeTilt.selector, {
      '--tilt-rx': '0deg',
      '--tilt-ry': '0deg',
      '--glare-o': '0'
    });
    activeTilt = null;
  };

  const resetActiveSheen = () => {
    if (!activeSheen) return;
    delete activeSheen.el.dataset.sheenActive;
    setVars(activeSheen.selector, { '--glare-o': '0' });
    activeSheen = null;
  };

  const updateTiltCard = (target: EventTarget | null, px: number, py: number, rizz: boolean) => {
    const card = target instanceof Element ? target.closest<HTMLElement>(TILT_SELECTOR) : null;
    if (!card) {
      resetActiveTilt();
      return;
    }

    if (!activeTilt || activeTilt.el !== card) {
      resetActiveTilt();
      let id = card.dataset.tiltId;
      if (!id) {
        id = String(++tiltSeq);
        card.dataset.tiltId = id;
      }
      const r = card.getBoundingClientRect();
      activeTilt = {
        el: card,
        id,
        selector: `[data-tilt-id="${id}"]`,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
      card.dataset.tiltActive = 'on';
    }

    // Compensate for any scroll delta since enter without forcing a layout read
    const dsx = window.scrollX - activeTilt.scrollX;
    const dsy = window.scrollY - activeTilt.scrollY;
    const adjustedRect: RectLike = {
      left: activeTilt.rect.left - dsx,
      top: activeTilt.rect.top - dsy,
      width: activeTilt.rect.width,
      height: activeTilt.rect.height
    };

    const maxDeg = rizz ? 8.5 : 6;
    const t = computeTilt(px, py, adjustedRect, maxDeg);
    setVars(activeTilt.selector, {
      '--tilt-rx': `${t.rx.toFixed(2)}deg`,
      '--tilt-ry': `${t.ry.toFixed(2)}deg`,
      '--glare-x': `${t.glareX.toFixed(1)}%`,
      '--glare-y': `${t.glareY.toFixed(1)}%`,
      '--glare-o': '1'
    });
  };

  const updateLedgerSheen = (target: EventTarget | null, px: number, py: number) => {
    const row = target instanceof Element ? target.closest<HTMLElement>(SHEEN_SELECTOR) : null;
    if (!row) {
      resetActiveSheen();
      return;
    }

    if (!activeSheen || activeSheen.el !== row) {
      resetActiveSheen();
      let id = row.dataset.sheenId;
      if (!id) {
        id = String(++sheenSeq);
        row.dataset.sheenId = id;
      }
      const r = row.getBoundingClientRect();
      activeSheen = {
        el: row,
        id,
        selector: `[data-sheen-id="${id}"]`,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
      row.dataset.sheenActive = 'on';
    }

    const dsx = window.scrollX - activeSheen.scrollX;
    const dsy = window.scrollY - activeSheen.scrollY;
    const rx = ((px - (activeSheen.rect.left - dsx)) / Math.max(1, activeSheen.rect.width)) * 100;
    const ry = ((py - (activeSheen.rect.top - dsy)) / Math.max(1, activeSheen.rect.height)) * 100;
    setVars(activeSheen.selector, {
      '--glare-x': `${Math.max(0, Math.min(100, rx)).toFixed(1)}%`,
      '--glare-y': `${Math.max(0, Math.min(100, ry)).toFixed(1)}%`,
      '--glare-o': '1'
    });
  };

  const triggerLiteRipple = (target: EventTarget | null, clientX: number, clientY: number) => {
    if (!(target instanceof Element)) return;
    const btn = target.closest<HTMLElement>(RIPPLE_SELECTOR);
    if (!btn) return;

    let id = btn.dataset.rippleId;
    if (!id) {
      id = String(++rippleSeq);
      btn.dataset.rippleId = id;
    }

    const r = btn.getBoundingClientRect();
    const xPct = ((clientX - r.left) / Math.max(1, r.width)) * 100;
    const yPct = ((clientY - r.top) / Math.max(1, r.height)) * 100;
    setVars(`[data-ripple-id="${id}"]`, {
      '--rx': `${Math.max(0, Math.min(100, xPct)).toFixed(1)}%`,
      '--ry': `${Math.max(0, Math.min(100, yPct)).toFixed(1)}%`
    });
    // Alternate between two identical keyframe animations to restart cleanly with zero sync reflow
    btn.dataset.ripplePhase = btn.dataset.ripplePhase === 'a' ? 'b' : 'a';
  };

  const ensureCanvas = () => {
    if (!canvasCtrl && canvasEl instanceof HTMLCanvasElement) {
      canvasCtrl = createCursorCanvas(canvasEl);
      canvasCtrl.setVisible(pageVisible());
    }
  };

  const teardownFullMode = () => {
    resetAllMagnets();
    resetActiveTilt();
    resetActiveSheen();
    delete root.dataset.cursorInput;
    canvasCtrl?.setSuppressed(true, 'off');
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isFullFine()) return;
    if (e.pointerType === 'touch') return;

    if (kbMode) {
      kbMode = false;
      delete root.dataset.cursorKb;
    }

    ensureCanvas();
    const rizz = maxRizz();
    const ctx = probeTarget(e.target);

    if (ctx.mode === 'input') {
      root.dataset.cursorInput = 'on';
      resetAllMagnets();
      resetActiveTilt();
      resetActiveSheen();
    } else {
      delete root.dataset.cursorInput;
      updateMagnets(e.clientX, e.clientY, rizz);
      updateTiltCard(e.target, e.clientX, e.clientY, rizz);
      updateLedgerSheen(e.target, e.clientX, e.clientY);
    }

    canvasCtrl?.onPointerMove(e.clientX, e.clientY, ctx, rizz);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (tier === 'off') return;
    if (isEditableElement(e.target)) return;

    const useLiteRipple = tier === 'lite' || !isFinePointer() || e.pointerType === 'touch';
    if (useLiteRipple) {
      triggerLiteRipple(e.target, e.clientX, e.clientY);
      playOptInTick(520, canSplatPop);
      return;
    }

    if (kbMode) {
      kbMode = false;
      delete root.dataset.cursorKb;
    }

    ensureCanvas();
    const ctx = probeTarget(e.target);
    canvasCtrl?.onPointerDown(e.clientX, e.clientY, ctx.tone, maxRizz());
    playOptInTick(520, canSplatPop);
  };

  const onPointerLeave = () => {
    if (!isFullFine()) return;
    resetAllMagnets();
    resetActiveTilt();
    resetActiveSheen();
    canvasCtrl?.onPointerLeave();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!isFullFine()) return;
    if (!KB_KEYS.has(e.key)) return;
    if (!kbMode) {
      kbMode = true;
      root.dataset.cursorKb = 'on';
      resetAllMagnets();
      resetActiveTilt();
      resetActiveSheen();
      canvasCtrl?.setSuppressed(true, 'kb');
    }
  };

  const onScroll = () => {
    rectsDirty = true;
  };

  const onResize = () => {
    rectsDirty = true;
    resetActiveTilt();
    resetActiveSheen();
  };

  // Watch paper stock & max-rizz attribute toggles on <html>
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

  // Flag lazy magnet rescan when Svelte drawers/modals mount or unmount
  const bodyObserver = new MutationObserver(() => {
    scanDirty = true;
    rectsDirty = true;
  });
  if (document.body) {
    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  const unsubTier = onTier((nextTier) => {
    tier = nextTier;
    if (isFullFine()) {
      ensureCanvas();
      scanDirty = true;
      rectsDirty = true;
    } else {
      teardownFullMode();
    }
  });

  const unsubVisible = onVisible((vis) => {
    canvasCtrl?.setVisible(vis);
    if (!vis) {
      resetAllMagnets();
      resetActiveTilt();
      resetActiveSheen();
    }
  });

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onPointerLeave, { passive: true });
  window.addEventListener('keydown', onKeyDown, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  return () => {
    unsubTier();
    unsubVisible();
    rootObserver.disconnect();
    bodyObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onPointerLeave);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    teardownFullMode();
    for (const m of magnets) clearVars(m.selector);
    magnets = [];
    canvasCtrl?.destroy();
    canvasCtrl = null;
  };
}
