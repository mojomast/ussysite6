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
    narrationStatus = 'Checking FEATURE_AUDIO_EDITION…';
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
      narrationStatus = data.message || data.error || 'Audio narration stub responded.';
    } catch {
      narrationStatus = 'Offline static preview — client WebAudio Carbon Tonewheel active.';
    } finally {
      narrationBusy = false;
    }
  }

  onDestroy(() => {
    stopAutoCycle();
  });
</script>

{#if open && activeTrack}
  <aside class="neon-audio-dock" aria-label="Audio Edition Flexi-Disc Transport">
    <div class="carbon-sheet neon-audio-dock-inner">
      <div class="press-controls-bar">
        <span class="neon-pill">
          <span class="neon-pulse-dot" aria-hidden="true"></span>
          33⅓ AUDIO EDITION
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
            {narrationStatus || `Track ${trackIdx + 1}/${tracks.length} · WebAudio Tonewheel (${activeTrack.flexiFreqs.map((f) => Math.round(f)).join(' / ')} Hz)`}
          </span>
        </div>
      </div>

      <div class="press-controls-bar">
        <button type="button" class="ctrl-btn" onclick={() => playTrack(trackIdx - 1)} aria-label="Previous folio track">
          ⏮ Prev
        </button>
        <button type="button" class="ctrl-btn neon-btn-accent" aria-pressed={playing} onclick={togglePlay}>
          {playing ? '⏸ Pause' : '▶ Play Chord'}
        </button>
        <button type="button" class="ctrl-btn" onclick={() => playTrack(trackIdx + 1)} aria-label="Next folio track">
          Next ⏭
        </button>
        <button type="button" class="ctrl-btn" aria-pressed={autoCycle} onclick={toggleAutoCycle}>
          {autoCycle ? 'Loop: On' : 'Auto-Step'}
        </button>
        <button
          type="button"
          class="ctrl-btn"
          disabled={narrationBusy}
          onclick={requestServerNarration}
          title="Probe feature-flagged server TTS narration endpoint"
        >
          TTS Stub
        </button>
        <a class="ctrl-btn" href={`/issues/${activeTrack.issueNumber}/${activeTrack.articleSlug}`}>
          Open ↗
        </a>
        <button type="button" class="ctrl-btn" onclick={onClose} aria-label="Close Audio Edition transport">
          ✕
        </button>
      </div>
    </div>
  </aside>
{/if}
