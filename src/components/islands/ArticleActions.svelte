<script lang="ts">
  import { withBase } from '../../lib/paths';
  import { onMount } from 'svelte';
  import { pressClient } from '../../lib/press-client';
  import { carbonSynth } from '../../lib/carbon-synth';

  let {
    readerServiceNo,
    title,
    issueNumber,
    articleSlug,
    repoUrl,
    sourceRevision,
    flexiFreqs = [261.63, 329.63, 392.0, 523.25]
  }: {
    readerServiceNo: number;
    title: string;
    issueNumber: string;
    articleSlug: string;
    repoUrl: string;
    sourceRevision: string;
    flexiFreqs?: number[];
  } = $props();

  let saved = $state(false);
  let communityCount = $state(0);
  let copiedStatus = $state('');

  onMount(() => {
    pressClient.init();
    const sync = () => {
      const s = pressClient.getState();
      const c = pressClient.getCommunity();
      saved = s.circledServiceNos.includes(readerServiceNo);
      communityCount = c.saveCountsByServiceNo[String(readerServiceNo)] || 0;
    };
    sync();
    return pressClient.subscribe(sync);
  });

  function toggleSave() {
    saved = pressClient.toggleServiceNo(readerServiceNo);
    carbonSynth.tick(saved ? 1700 : 900);
  }

  function playSketch() {
    carbonSynth.playChord(flexiFreqs);
  }

  async function copyCitation() {
    const line = `${title} — Slop Illustrated Issue ${issueNumber} (#${readerServiceNo}), source pinned at ${repoUrl}/tree/${sourceRevision}`;
    try {
      await navigator.clipboard.writeText(line);
      copiedStatus = 'Copied. Pinned to the commit.';
      setTimeout(() => {
        copiedStatus = '';
      }, 2600);
    } catch {
      copiedStatus = `Couldn’t copy. It’s @${sourceRevision.slice(0, 7)}`;
    }
  }
</script>

<div class="press-controls-bar" role="group" aria-label="Article Actions">
  <button type="button" class="ctrl-btn" aria-pressed={saved} onclick={toggleSave}>
    {saved ? `Saved ✓ #${readerServiceNo}` : `Save for later · #${readerServiceNo}`}
    {#if communityCount > 0}
      <span>· {communityCount} {communityCount === 1 ? 'reader' : 'readers'}</span>
    {/if}
  </button>

  <button type="button" class="ctrl-btn" onclick={playSketch}>
    ◎ Play its chord
  </button>

  <button type="button" class="ctrl-btn" onclick={copyCitation}>
    {copiedStatus || 'Copy citation'}
  </button>

  <a class="btn-primary" href={withBase(repoUrl)} target="_blank" rel="noopener">
    Open the repo ↗
  </a>
</div>
