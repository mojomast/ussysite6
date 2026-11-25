/**
 * Wave 9 · Delight layer runtime controller.
 * Owns MAXIMUM RIZZ mode, printer's devils, seasonal/time-of-day touches,
 * Shift+click Si. ink blot, proofreader overlay, and developer console greeting.
 */
import { fxTier, maxRizz, onTier, onVisible, pageVisible } from './capability';
import { setVars } from './vars';
import { carbonSynth } from '../../lib/carbon-synth';
import { createSequenceDetector, isEditableTarget } from './delight/sequences';
import { getSeasonalState, isFrontPagePath } from './delight/calendar';

const RIZZ_STORAGE_KEY = 'si.rizz.v1';
const RIZZ_CARD_DURATION_MS = 2750;
const RIZZ_CHORD = [293.66, 369.99, 440.0, 587.33];

const DEVIL_IDLE_MS = 45_000;
const DEVIL_COOLDOWN_MS = 180_000;
const DEVIL_TRAVEL_MS = 14_200;
const DEVIL_FLEE_MS = 360;
const DEVIL_MIN_WIDTH = 1024;
const IDLE_THROTTLE_MS = 500;

const BLOT_DURATION_MS = 4900;
const BLOT_CALM_DRY_MS = 1600;
const BLOT_CALM_HIDE_MS = 2800;

const DIALOG_SELECTOR = '.carbon-modal, .neon-drawer, .opus-cold-open';

let greeted = false;

function readSavedRizz(): boolean {
  try {
    return localStorage.getItem(RIZZ_STORAGE_KEY) === 'max';
  } catch {
    return false;
  }
}

function writeSavedRizz(active: boolean): void {
  try {
    if (active) localStorage.setItem(RIZZ_STORAGE_KEY, 'max');
    else localStorage.removeItem(RIZZ_STORAGE_KEY);
  } catch {
    // Private browsing: mode still works for the current page.
  }
}

function printConsoleGreeting(): void {
  if (greeted || typeof console === 'undefined' || typeof console.info !== 'function') return;
  greeted = true;
  console.info(
    '%c Si. %c Slop Illustrated · Living Edition — every claim pinned to a commit. Source: https://github.com/mojomast/ussysite6',
    'background:#ff4422;color:#ffffff;font-weight:700;padding:2px 6px;font-family:Georgia,serif;',
    'color:#e8c36a;font-family:monospace;'
  );
}

export function init(): () => void {
  const root = document.documentElement;
  const liveEl = document.querySelector<HTMLElement>('[data-fx-live]');
  const pillWrap = document.querySelector<HTMLElement>('[data-fx-rizz-pill]');
  const pillOffBtn = document.querySelector<HTMLButtonElement>('[data-fx-rizz-off]');
  const cardEl = document.querySelector<HTMLElement>('[data-fx-rizz-card]');
  const devilLane = document.querySelector<HTMLElement>('[data-fx-devil-lane]');
  const devilSprite = document.querySelector<HTMLElement>('[data-fx-devil-sprite]');
  const inkBlot = document.querySelector<HTMLElement>('[data-fx-ink-blot]');
  const siBadge = document.querySelector<HTMLElement>('.press-masthead .si-badge');

  printConsoleGreeting();

  // Tracked timers for clean teardown
  let liveTimer: number | null = null;
  let cardTimer: number | null = null;
  let blotDryTimer: number | null = null;
  let blotHideTimer: number | null = null;
  let devilIdleTimer: number | null = null;
  let devilEndTimer: number | null = null;
  let devilFleeTimer: number | null = null;
  let seasonalInterval: number | null = null;

  const clearTimer = (id: number | null) => {
    if (id !== null) window.clearTimeout(id);
    return null;
  };

  function announce(message: string): void {
    if (!liveEl) return;
    liveTimer = clearTimer(liveTimer);
    liveEl.textContent = '';
    liveTimer = window.setTimeout(() => {
      liveEl.textContent = message;
      liveTimer = null;
    }, 30);
  }

  // -------------------------------------------------------------------------
  // 1. MAXIMUM RIZZ mode
  // -------------------------------------------------------------------------
  function hideRizzCard(): void {
    cardTimer = clearTimer(cardTimer);
    if (!cardEl) return;
    cardEl.classList.remove('is-entering');
    cardEl.hidden = true;
  }

  function showRizzCard(): void {
    if (!cardEl || fxTier() === 'off') return;
    cardTimer = clearTimer(cardTimer);
    cardEl.classList.remove('is-entering');
    cardEl.hidden = false;
    void cardEl.offsetWidth;
    cardEl.classList.add('is-entering');
    cardTimer = window.setTimeout(() => {
      hideRizzCard();
    }, RIZZ_CARD_DURATION_MS);
  }

  function setMaxRizz(active: boolean, fromUser = true): void {
    if (active) {
      root.dataset.rizz = 'max';
      if (pillWrap) pillWrap.hidden = false;
      writeSavedRizz(true);
      window.dispatchEvent(new CustomEvent('si:rizz', { detail: { active: true } }));
      if (fromUser) {
        announce('Maximum rizz mode enabled. Press Escape or use the Max rizz button to turn it off.');
        showRizzCard();
        if (carbonSynth.isEnabled()) {
          carbonSynth.playChord(RIZZ_CHORD);
        }
      }
    } else {
      delete root.dataset.rizz;
      if (pillWrap) pillWrap.hidden = true;
      hideRizzCard();
      writeSavedRizz(false);
      window.dispatchEvent(new CustomEvent('si:rizz', { detail: { active: false } }));
      if (fromUser) {
        announce('Maximum rizz mode off. Back to standard press stock.');
      }
    }
  }

  // Restore saved Max Rizz state silently on load
  if (readSavedRizz() || maxRizz()) {
    setMaxRizz(true, false);
  }

  const onPillOffClick = () => {
    setMaxRizz(false, true);
  };
  pillOffBtn?.addEventListener('click', onPillOffClick);

  // -------------------------------------------------------------------------
  // 3. Seasonal & time-of-day touches (calm, all tiers)
  // -------------------------------------------------------------------------
  const baseUrl = (import.meta as { env?: Record<string, string | undefined> }).env?.BASE_URL || '/';

  function applySeasonal(): void {
    const seasonal = getSeasonalState(new Date());
    if (seasonal.lateNight) root.dataset.fxNight = 'on';
    else delete root.dataset.fxNight;

    const showDecember = seasonal.december && isFrontPagePath(window.location.pathname, baseUrl);
    if (showDecember) root.dataset.fxDecember = 'on';
    else delete root.dataset.fxDecember;

    if (seasonal.pressDay) root.dataset.fxPressDay = 'on';
    else delete root.dataset.fxPressDay;
  }

  applySeasonal();
  seasonalInterval = window.setInterval(applySeasonal, 10 * 60 * 1000);

  // -------------------------------------------------------------------------
  // 2. Printer's devils (ambient, full tier only, 45s idle, 3m cooldown)
  // -------------------------------------------------------------------------
  let devilActive = false;
  let devilCooldownUntil = 0;
  let devilSide: 'right' | 'left' = 'right';
  let lastIdleReset = 0;

  function canRunDevil(): boolean {
    return (
      fxTier() === 'full' &&
      pageVisible() &&
      window.innerWidth >= DEVIL_MIN_WIDTH &&
      Boolean(devilLane && devilSprite)
    );
  }

  function clearDevilNow(): void {
    devilEndTimer = clearTimer(devilEndTimer);
    devilFleeTimer = clearTimer(devilFleeTimer);
    devilActive = false;
    if (devilLane) {
      devilLane.classList.remove('is-wandering', 'is-fleeing');
      devilLane.hidden = true;
    }
  }

  function scheduleDevilIdle(): void {
    devilIdleTimer = clearTimer(devilIdleTimer);
    if (!canRunDevil() || devilActive) return;
    const wait = Math.max(DEVIL_IDLE_MS, devilCooldownUntil - Date.now());
    devilIdleTimer = window.setTimeout(spawnDevil, wait);
  }

  function spawnDevil(): void {
    devilIdleTimer = null;
    if (!canRunDevil() || devilActive || Date.now() < devilCooldownUntil || !devilLane) {
      scheduleDevilIdle();
      return;
    }
    devilActive = true;
    devilCooldownUntil = Date.now() + DEVIL_COOLDOWN_MS;
    devilLane.dataset.side = devilSide;
    devilSide = devilSide === 'right' ? 'left' : 'right';

    devilLane.classList.remove('is-fleeing', 'is-wandering');
    devilLane.hidden = false;
    void devilLane.offsetWidth;
    devilLane.classList.add('is-wandering');

    devilEndTimer = window.setTimeout(() => {
      clearDevilNow();
      scheduleDevilIdle();
    }, DEVIL_TRAVEL_MS);
  }

  function fleeDevil(): void {
    if (!devilActive || !devilLane) return;
    if (devilLane.classList.contains('is-fleeing')) return;
    devilEndTimer = clearTimer(devilEndTimer);
    devilCooldownUntil = Math.max(devilCooldownUntil, Date.now() + DEVIL_COOLDOWN_MS);
    devilLane.classList.add('is-fleeing');
    devilFleeTimer = window.setTimeout(() => {
      clearDevilNow();
      scheduleDevilIdle();
    }, DEVIL_FLEE_MS);
  }

  const onUserActivity = () => {
    const now = Date.now();
    if (now - lastIdleReset < IDLE_THROTTLE_MS) return;
    lastIdleReset = now;
    if (!devilActive) scheduleDevilIdle();
  };

  const onDevilHover = () => {
    fleeDevil();
  };
  devilSprite?.addEventListener('pointerenter', onDevilHover);

  const activityEvents: Array<keyof WindowEventMap> = [
    'pointermove',
    'pointerdown',
    'wheel',
    'scroll',
    'touchstart'
  ];
  for (const ev of activityEvents) {
    window.addEventListener(ev, onUserActivity, { passive: true });
  }

  const unsubTier = onTier((tier) => {
    if (tier !== 'full') {
      devilIdleTimer = clearTimer(devilIdleTimer);
      clearDevilNow();
      if (tier === 'off') hideRizzCard();
    } else {
      scheduleDevilIdle();
    }
  });

  const unsubVisible = onVisible((visible) => {
    if (!visible) {
      devilIdleTimer = clearTimer(devilIdleTimer);
      clearDevilNow();
    } else {
      scheduleDevilIdle();
    }
  });

  // -------------------------------------------------------------------------
  // 4a. Shift+click Si. badge ink blot
  // -------------------------------------------------------------------------
  function triggerInkBlot(originEl: HTMLElement): void {
    if (!inkBlot) return;
    blotDryTimer = clearTimer(blotDryTimer);
    blotHideTimer = clearTimer(blotHideTimer);

    const rect = originEl.getBoundingClientRect();
    setVars('.fx-ink-blot', {
      '--blot-x': `${Math.round(rect.left + rect.width / 2)}px`,
      '--blot-y': `${Math.round(rect.bottom)}px`
    });

    inkBlot.classList.remove('is-active', 'is-drying');
    inkBlot.hidden = false;
    void inkBlot.offsetWidth;
    inkBlot.classList.add('is-active');

    if (carbonSynth.isEnabled()) {
      carbonSynth.thunk();
    }

    if (fxTier() === 'off') {
      blotDryTimer = window.setTimeout(() => {
        inkBlot.classList.add('is-drying');
      }, BLOT_CALM_DRY_MS);
      blotHideTimer = window.setTimeout(() => {
        inkBlot.classList.remove('is-active', 'is-drying');
        inkBlot.hidden = true;
      }, BLOT_CALM_HIDE_MS);
    } else {
      blotHideTimer = window.setTimeout(() => {
        inkBlot.classList.remove('is-active', 'is-drying');
        inkBlot.hidden = true;
      }, BLOT_DURATION_MS);
    }
  }

  const onBadgeClick = (e: MouseEvent) => {
    if (!e.shiftKey || !siBadge) return;
    e.preventDefault();
    triggerInkBlot(siBadge);
  };
  siBadge?.addEventListener('click', onBadgeClick);

  // -------------------------------------------------------------------------
  // 4b. Proofreader overlay + global key-sequence listener
  // -------------------------------------------------------------------------
  function setProofOverlay(active: boolean): void {
    root.classList.toggle('fx-proof', active);
    announce(active ? 'Proofreader overlay on. Press Escape to turn it off.' : 'Proofreader overlay off.');
  }

  const detector = createSequenceDetector();

  const onKeyDown = (e: KeyboardEvent) => {
    if (devilActive) fleeDevil();
    else onUserActivity();

    if (e.key === 'Escape') {
      detector.reset();
      const dialogOpen = Boolean(document.querySelector(DIALOG_SELECTOR));
      if (dialogOpen) return;
      if (root.classList.contains('fx-proof')) {
        setProofOverlay(false);
      }
      if (maxRizz()) {
        setMaxRizz(false, true);
      }
      return;
    }

    if (isEditableTarget(document.activeElement as HTMLElement | null)) return;

    const action = detector.push(e);
    if (action === 'rizz') {
      setMaxRizz(!maxRizz(), true);
    } else if (action === 'proof') {
      setProofOverlay(!root.classList.contains('fx-proof'));
    }
  };
  window.addEventListener('keydown', onKeyDown);

  return () => {
    liveTimer = clearTimer(liveTimer);
    cardTimer = clearTimer(cardTimer);
    blotDryTimer = clearTimer(blotDryTimer);
    blotHideTimer = clearTimer(blotHideTimer);
    devilIdleTimer = clearTimer(devilIdleTimer);
    clearDevilNow();
    if (seasonalInterval !== null) window.clearInterval(seasonalInterval);
    pillOffBtn?.removeEventListener('click', onPillOffClick);
    devilSprite?.removeEventListener('pointerenter', onDevilHover);
    siBadge?.removeEventListener('click', onBadgeClick);
    window.removeEventListener('keydown', onKeyDown);
    for (const ev of activityEvents) {
      window.removeEventListener(ev, onUserActivity);
    }
    unsubTier();
    unsubVisible();
  };
}
