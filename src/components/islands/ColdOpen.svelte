<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { carbonSynth } from '../../lib/carbon-synth';

  let {
    lines = [],
    issueNumber = '02',
    issueTitle = ''
  }: {
    lines?: string[];
    issueNumber?: string;
    issueTitle?: string;
  } = $props();

  const LINE_START_MS = 500;
  const LINE_STEP_MS = 380;
  const TITLE_MS = 4100;
  const EXIT_MS = 6000;
  const EXIT_DURATION_MS = 660;

  let mounted = $state(false);
  let open = $state(false);
  let leaving = $state(false);
  let staticMode = $state(false);
  let skipButton = $state<HTMLButtonElement | null>(null);
  let timers: number[] = [];

  const parsed = $derived(
    lines.map((line) => {
      const [left, right] = line.split('···').map((s) => s.trim());
      const verdict = (right || '').toLowerCase();
      const tone = verdict.includes('rejected')
        ? 'is-fail'
        : verdict.includes('anyway') || verdict.includes('slop')
          ? 'is-gilt'
          : verdict
            ? 'is-pass'
            : 'is-head';
      return { left, right: right || '', tone };
    })
  );

  function clearTimers() {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
  }

  async function play(force = false) {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    staticMode = reduce;
    if (reduce && !force) return;
    clearTimers();
    leaving = false;
    open = true;
    try {
      sessionStorage.setItem(`si.coldopen.${issueNumber}`, 'seen');
    } catch {
      // No session storage: the opening may play again next visit, which is fine.
    }
    await tick();
    skipButton?.focus({ preventScroll: true });

    if (staticMode) return;

    timers.push(window.setTimeout(() => carbonSynth.thunk(), 360));
    lines.forEach((_, i) => {
      timers.push(window.setTimeout(() => carbonSynth.tick(1200 + (i % 3) * 140), LINE_START_MS + i * LINE_STEP_MS));
    });
    timers.push(window.setTimeout(() => carbonSynth.thunk(), TITLE_MS + 380));
    timers.push(window.setTimeout(() => close(), EXIT_MS));
  }

  function finish() {
    open = false;
    leaving = false;
    const main = document.getElementById('main-content');
    main?.focus({ preventScroll: true });
  }

  function close() {
    if (!open || leaving) return;
    clearTimers();
    if (staticMode) {
      finish();
      return;
    }
    // The press opens; the cover is underneath.
    leaving = true;
    carbonSynth.pageTurn(true);
    timers.push(window.setTimeout(finish, EXIT_DURATION_MS));
  }

  onMount(() => {
    mounted = true;
    let seen = false;
    try {
      seen = sessionStorage.getItem(`si.coldopen.${issueNumber}`) === 'seen';
    } catch {
      seen = false;
    }
    const wantsReplay = window.location.hash === '#opening';
    if (wantsReplay) {
      void play(true);
    } else if (!seen) {
      void play(false);
    }

    const onKey = (e: KeyboardEvent) => {
      if (open && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimers();
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

{#if mounted}
  <button type="button" class="ctrl-btn opus-replay-btn" onclick={() => play(true)}>
    ▶ Replay the opening
  </button>
{/if}

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class={`opus-cold-open ${staticMode ? 'is-static' : ''} ${leaving ? 'is-leaving' : ''}`}
    role="dialog"
    aria-modal="true"
    aria-label={`Opening sequence for Issue ${issueNumber}`}
    tabindex="-1"
    onclick={close}
  >
    <div class="co-plate co-plate--top" aria-hidden="true"></div>
    <div class="co-plate co-plate--bottom" aria-hidden="true"></div>
    <div class="co-flash" aria-hidden="true"></div>
    <div class="opus-cold-open-inner">
      <ol class="opus-co-log" aria-label="Press run log">
        {#each parsed as line}
          <li class={`opus-co-line ${line.tone}`}>
            <span class="opus-co-left">{line.left}</span>
            {#if line.right}
              <span class="opus-co-dots" aria-hidden="true"></span>
              <span class="opus-co-right">{line.right}</span>
            {/if}
          </li>
        {/each}
      </ol>

      <div class="opus-co-title">
        <span class="opus-co-seal" aria-hidden="true">Si.</span>
        <span class="co-splash" aria-hidden="true"></span>
        <p class="opus-co-masthead">
          <span class="sr-only">SLOP Illustrated.</span>
          <span class="co-letters" aria-hidden="true"><span>S</span><span>L</span><span>O</span><span>P</span></span>
          <em class="co-ill" aria-hidden="true">Illustrated.</em>
        </p>
        <p class="opus-co-issue">Issue {issueNumber} · {issueTitle}</p>
      </div>
    </div>

    <div class="opus-co-footer">
      <span class="datum-tag">{staticMode ? 'Reduced motion: shown all at once' : 'Click, Enter or Esc to skip'}</span>
      <button
        type="button"
        class="ctrl-btn neon-btn-accent"
        bind:this={skipButton}
        onclick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        {staticMode ? 'Start reading' : 'Skip'} →
      </button>
    </div>
    <div class="opus-co-progress" aria-hidden="true"></div>
  </div>
{/if}
