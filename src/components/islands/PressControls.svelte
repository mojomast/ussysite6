<script lang="ts">
  import { onMount } from 'svelte';
  import { pressClient, type PaperStock } from '../../lib/press-client';
  import { carbonSynth } from '../../lib/carbon-synth';
  import { USSYVERSE_STRATIGRAPHY } from '../../lib/folio';

  interface SearchEntry {
    issueNumber: string;
    articleSlug: string;
    readerServiceNo: number;
    folioCode: string;
    title: string;
    headline: string;
    category: string;
    techStack: string[];
  }

  let { catalog = [] }: { catalog?: SearchEntry[] } = $props();

  let stock = $state<PaperStock>('graphite');
  let gridOn = $state(false);
  let soundOn = $state(false);
  let savedNos = $state<number[]>([]);

  let finderOpen = $state(false);
  let finderQuery = $state('');
  let savedOnly = $state(false);

  let editorOpen = $state(false);
  let editorEnabled = $state(false);
  let editorModel = $state('gemini-2.5-flash-lite');
  let editorPrompt = $state('');
  let editorBusy = $state(false);
  let editorReply = $state<string | null>(null);
  let editorCitations = $state<Array<{ label: string; href: string }>>([]);

  let strataOpen = $state(false);

  const filteredCatalog = $derived.by(() => {
    const q = finderQuery.trim().toLowerCase();
    return catalog.filter((item) => {
      if (savedOnly && !savedNos.includes(item.readerServiceNo)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.techStack.some((t) => t.toLowerCase().includes(q)) ||
        String(item.readerServiceNo).includes(q)
      );
    });
  });

  onMount(() => {
    pressClient.init();
    const initial = pressClient.getState();
    stock = initial.printMode;
    gridOn = initial.gridOverlay;
    savedNos = initial.circledServiceNos;

    const unsub = pressClient.subscribe((next) => {
      stock = next.printMode;
      gridOn = next.gridOverlay;
      savedNos = next.circledServiceNos;
    });

    fetch('/api/editor/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          editorEnabled = Boolean(d.enabled && d.configured);
          if (d.model) editorModel = d.model;
        }
      })
      .catch(() => {});

    let ussyBuffer = '';
    let lastKeyTime = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput = Boolean(
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      );

      if (e.key === 'Escape') {
        finderOpen = false;
        editorOpen = false;
        strataOpen = false;
        return;
      }

      if (!inInput && e.key === '/') {
        e.preventDefault();
        finderOpen = !finderOpen;
        editorOpen = false;
        return;
      }

      if (!inInput && e.key.length === 1) {
        const now = Date.now();
        if (now - lastKeyTime > 1500) ussyBuffer = '';
        lastKeyTime = now;
        ussyBuffer = (ussyBuffer + e.key.toLowerCase()).slice(-4);
        if (ussyBuffer === 'ussy') {
          ussyBuffer = '';
          strataOpen = true;
          carbonSynth.playChord([196.0, 293.66, 392.0, 587.33]);
        }
      }
    };

    const onOpenStrata = () => {
      strataOpen = true;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('si:open-stratigraphy', onOpenStrata);
    return () => {
      unsub();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('si:open-stratigraphy', onOpenStrata);
    };
  });

  function chooseStock(next: PaperStock) {
    pressClient.setStock(next);
    carbonSynth.click(720);
  }

  function handleGridToggle() {
    gridOn = pressClient.toggleGrid();
    carbonSynth.click(540);
  }

  function handleSoundToggle() {
    soundOn = carbonSynth.toggle();
  }

  async function submitEditorQuestion(e: SubmitEvent) {
    e.preventDefault();
    const q = editorPrompt.trim();
    if (!q || editorBusy) return;
    editorBusy = true;
    editorReply = null;
    editorCitations = [];
    try {
      const res = await fetch('/api/editor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      editorReply = data.reply || data.error || 'The Editor stepped out for toner.';
      editorCitations = Array.isArray(data.citations) ? data.citations : [];
    } catch {
      const localHits = catalog
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q.toLowerCase()) ||
            c.category.toLowerCase().includes(q.toLowerCase()) ||
            c.headline.toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 3);
      editorReply =
        localHits.length > 0
          ? `[Static Offline Stub] Ask-the-Editor API is unreachable, but ${localHits.map((h) => `${h.title} (Issue ${h.issueNumber})`).join(', ')} matched in the local catalog.`
          : '[Static Offline Stub] Ask-the-Editor runs behind FEATURE_ASK_EDITOR on the Hono backend. Browse the 22 monographs via Find (/).';
      editorCitations = localHits.map((h) => ({
        label: `Issue ${h.issueNumber} · ${h.title}`,
        href: `/issues/${h.issueNumber}/${h.articleSlug}`
      }));
    } finally {
      editorBusy = false;
    }
  }
</script>

<div class="press-controls-bar" role="region" aria-label="Press Room Controls">
  <div class="stock-group" role="group" aria-label="Paper Stock">
    <button
      type="button"
      class="ctrl-btn"
      aria-pressed={stock === 'graphite'}
      onclick={() => chooseStock('graphite')}
      title="Pyrolytic Graphite dark stock"
    >
      Graphite
    </button>
    <button
      type="button"
      class="ctrl-btn"
      aria-pressed={stock === 'rag'}
      onclick={() => chooseStock('rag')}
      title="Unbleached Cotton Rag daylight stock"
    >
      Rag
    </button>
    <button
      type="button"
      class="ctrl-btn"
      aria-pressed={stock === 'oxide'}
      onclick={() => chooseStock('oxide')}
      title="Ferric Blueprint inspection stock"
    >
      Oxide
    </button>
  </div>

  <button
    type="button"
    class="ctrl-btn"
    aria-pressed={gridOn}
    onclick={handleGridToggle}
    title="Toggle structural registration grid"
  >
    Grid
  </button>

  <button
    type="button"
    class="ctrl-btn"
    aria-pressed={soundOn}
    onclick={handleSoundToggle}
    title="Toggle 33⅓ RPM Carbon Tonewheel audio"
  >
    {soundOn ? 'Sound: On' : 'Sound'}
  </button>

  <button
    type="button"
    class="ctrl-btn"
    aria-expanded={editorOpen}
    onclick={() => {
      editorOpen = !editorOpen;
      finderOpen = false;
    }}
    title="Ask SLOPTIMUS PRIME (Feature-Flagged Runtime Interface)"
  >
    Ask Editor
  </button>

  <button
    type="button"
    class="ctrl-btn"
    aria-expanded={finderOpen}
    onclick={() => {
      finderOpen = !finderOpen;
      editorOpen = false;
    }}
    title="Search all issues and repositories"
  >
    Find <kbd class="ctrl-kbd">/</kbd>
  </button>
</div>

{#if finderOpen}
  <div class="carbon-modal-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (finderOpen = false)}>
    <div class="carbon-modal" role="dialog" aria-modal="true" aria-labelledby="finder-dialog-title">
      <div class="carbon-modal-header">
        <strong id="finder-dialog-title" class="datum-tag">CATALOG INDEX // 22 MONOGRAPHS ACROSS ISSUES 01 &amp; 02</strong>
        <button type="button" class="ctrl-btn" onclick={() => (finderOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <div class="source-filter-bar">
          <input
            type="search"
            class="source-search-input"
            placeholder="Search repo, stack, category, or Reader Service # (e.g. rizzstack, templeos, 207)…"
            bind:value={finderQuery}
            aria-label="Search magazine catalog"
          />
          <button type="button" class="ctrl-btn" aria-pressed={savedOnly} onclick={() => (savedOnly = !savedOnly)}>
            Saved Only ({savedNos.length})
          </button>
        </div>
        <ul class="sources-list">
          {#each filteredCatalog.slice(0, 12) as item (item.readerServiceNo)}
            <li>
              <a href={`/issues/${item.issueNumber}/${item.articleSlug}`} onclick={() => (finderOpen = false)}>
                <strong>Issue {item.issueNumber} · #{item.readerServiceNo} — {item.title}</strong>
              </a>
              <div class="datum-tag">{item.category} · {item.techStack.slice(0, 3).join(' · ')}</div>
            </li>
          {:else}
            <li class="datum-tag">No matching monographs found.</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}

{#if editorOpen}
  <div class="carbon-modal-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (editorOpen = false)}>
    <div class="carbon-modal" role="dialog" aria-modal="true" aria-labelledby="ask-editor-title">
      <div class="carbon-modal-header">
        <strong id="ask-editor-title" class="datum-tag">
          ASK THE EDITOR // {editorEnabled ? `LIVE (${editorModel})` : 'STUB MODE (FEATURE_ASK_EDITOR=false)'}
        </strong>
        <button type="button" class="ctrl-btn" onclick={() => (editorOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <p class="datum-tag">
          Ask SLOPTIMUS PRIME about any project in Issue 01 or Issue 02. When <code>FEATURE_ASK_EDITOR=true</code> and
          <code>GEMINI_API_KEY</code> are set on the server, Gemini Flash-Lite answers from the verified catalog; otherwise
          the deterministic press-desk stub cites matching monographs directly.
        </p>
        <form class="source-filter-bar" onsubmit={submitEditorQuestion}>
          <input
            type="text"
            class="source-search-input"
            placeholder="e.g. Why did photo-to-part block involute scripts?"
            bind:value={editorPrompt}
            aria-label="Question for the Editor"
          />
          <button type="submit" class="btn-primary" disabled={editorBusy}>
            {editorBusy ? 'Checking Proofs…' : 'Ask Desk'}
          </button>
        </form>
        {#if editorReply}
          <div class="sidebar-panel">
            <h3>Editor’s Wire Reply</h3>
            <p>{editorReply}</p>
            {#if editorCitations.length > 0}
              <ul class="sources-list">
                {#each editorCitations as cite}
                  <li><a href={cite.href}>{cite.label} ↗</a></li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if strataOpen}
  <div class="carbon-modal-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (strataOpen = false)}>
    <div class="carbon-modal" role="dialog" aria-modal="true" aria-labelledby="strata-dialog-title">
      <div class="carbon-modal-header">
        <strong id="strata-dialog-title" class="datum-tag">USSYVERSE ARCHAEOLOGICAL STRATIGRAPHY // KEYCODE: U-S-S-Y</strong>
        <button type="button" class="ctrl-btn" onclick={() => (strataOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <p class="datum-tag">
          Five geological layers of <code>ussy.host</code> preserved beneath the floorboards—from 6DOF space flight and
          the subterranean Helix Organum pipe organ to Solaris tidepool wish lanterns and Carbon Press.
        </p>
        <ul class="sources-list">
          {#each USSYVERSE_STRATIGRAPHY as layer}
            <li>
              <div class="article-kicker-row">
                <span class="service-stamp">{layer.era}</span>
                <strong>{layer.title}</strong>
                <a class="sha-pill" href={layer.repoUrl} target="_blank" rel="noopener">{layer.repo} ↗</a>
                <button
                  type="button"
                  class="ctrl-btn"
                  onclick={() => carbonSynth.playChord(layer.freqs)}
                >
                  Play {layer.chordLabel}
                </button>
              </div>
              <p>{layer.lore}</p>
              <div class="datum-tag">Relic: {layer.artifact}</div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}
