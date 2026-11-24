<script lang="ts">
  import { onDestroy } from 'svelte';
  import { carbonSynth } from '../../lib/carbon-synth';

  export interface AudioTrack {
    issueNumber: string;
    articleSlug: string;
    folioCode: string;
    readerServiceNo: number;
    title: string;
    flexiFreqs: number[];
  }

  let {
    open = false,
    tracks = [],
    onClose
  }: {
    open: boolean;
    tracks: AudioTrack[];
    onClose: () => void;
  } = $props();

  let trackIdx = $state(0);
  let playing = $state(false);
  let autoCycle = $state(false);
  let narrationStatus = $state('');
  let narrationBusy = $state(false);
  let cycleTimer: ReturnType<typeof setInterval> | null = null;

  const activeTrack = $derived(tracks[trackIdx] || tracks[0]);

  function stopAutoCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }
  }

  function playTrack(idx: number) {
    if (tracks.length === 0) return;
    trackIdx = ((idx % tracks.length) + tracks.length) % tracks.length;
    const tr = tracks[trackIdx];
    carbonSynth.playChord(tr.flexiFreqs);
    playing = true;
    narrationStatus = '';
  }

  function togglePlay() {
    if (playing) {
      carbonSynth.toggle(false);
      playing = false;
      stopAutoCycle();
    } else {
      playTrack(trackIdx);
    }
  }

  function toggleAutoCycle() {
    autoCycle = !autoCycle;
    stopAutoCycle();
    if (autoCycle) {
      if (!playing) playTrack(trackIdx);
      cycleTimer = setInterval(() => {
        playTrack(trackIdx + 1);
      }, 2800);
    }
  }

  async function requestServerNarration() {
    if (!activeTrack || narrationBusy) return;
    narrationBusy = true;
    narrationStatus = 'Asking the server…';
    try {
      const res = await fetch('/api/audio/edition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueNumber: activeTrack.issueNumber,
          articleSlug: activeTrack.articleSlug,
          voice: 'editorial'
        })
      });
      const data = await res.json();
      narrationStatus = data.stub ? 'Narration is switched off on this site. The chords are all yours.' : data.message || 'The narrator answered.';
    } catch {
      narrationStatus = 'No server here, so no narrator. The chords still work.';
    } finally {
      narrationBusy = false;
    }
  }

  onDestroy(() => {
    stopAutoCycle();
  });
</script>

{#if open && activeTrack}
  <aside class="neon-audio-dock" aria-label="Flexi-disc player">
    <div class="carbon-sheet neon-audio-dock-inner">
      <div class="press-controls-bar">
        <span class="neon-pill">
          <span class="neon-pulse-dot" aria-hidden="true"></span>
          FLEXI-DISC · 33⅓
        </span>

        <div class={`neon-eq-bars ${playing ? 'is-live' : ''}`} aria-hidden="true">
          <span class="neon-eq-bar"></span>
          <span class="neon-eq-bar"></span>
          <span class="neon-eq-bar"></span>
          <span class="neon-eq-bar"></span>
          <span class="neon-eq-bar"></span>
        </div>

        <div class="neon-audio-track-meta">
          <strong>
            ISS.{activeTrack.issueNumber} · FOLIO {activeTrack.folioCode} — {activeTrack.title}
          </strong>
          <span class="datum-tag">
            {narrationStatus || `Track ${trackIdx + 1} of ${tracks.length} · every feature has its own chord (${activeTrack.flexiFreqs.map((f) => Math.round(f)).join(' · ')} Hz)`}
          </span>
        </div>
      </div>

      <div class="press-controls-bar">
        <button type="button" class="ctrl-btn" onclick={() => playTrack(trackIdx - 1)} aria-label="Previous folio track">
          ⏮ Prev
        </button>
        <button type="button" class="ctrl-btn neon-btn-accent" aria-pressed={playing} onclick={togglePlay}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button type="button" class="ctrl-btn" onclick={() => playTrack(trackIdx + 1)} aria-label="Next folio track">
          Next ⏭
        </button>
        <button type="button" class="ctrl-btn" aria-pressed={autoCycle} onclick={toggleAutoCycle}>
          {autoCycle ? 'Playing the side' : 'Play the whole side'}
        </button>
        <button
          type="button"
          class="ctrl-btn"
          disabled={narrationBusy}
          onclick={requestServerNarration}
          title="Ask the server for a narrated reading (switched off by default)"
        >
          Narration
        </button>
        <a class="ctrl-btn" href={`/issues/${activeTrack.issueNumber}/${activeTrack.articleSlug}`}>
          Read it ↗
        </a>
        <button type="button" class="ctrl-btn" onclick={onClose} aria-label="Close Audio Edition transport">
          ✕
        </button>
      </div>
    </div>
  </aside>
{/if}
