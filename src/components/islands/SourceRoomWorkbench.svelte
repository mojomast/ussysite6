<script lang="ts">
  import { onMount } from 'svelte';
  import { pressClient, type MarginNote } from '../../lib/press-client';
  import { carbonSynth } from '../../lib/carbon-synth';

  interface SourceItem {
    issueNumber: string;
    articleSlug: string;
    folioCode: string;
    readerServiceNo: number;
    title: string;
    category: string;
    repoUrl: string;
    sourceRevision: string;
    techStack: string[];
  }

  let { items = [] }: { items: SourceItem[] } = $props();

  let issueFilter = $state<'all' | '02' | '01'>('all');
  let searchQuery = $state('');
  let onlySaved = $state(false);
  let savedNos = $state<number[]>([]);
  let communityCounts = $state<Record<string, number>>({});
  let dispatches = $state<MarginNote[]>([]);
  let localNotes = $state<MarginNote[]>([]);
  let noteDraft = $state('');
  let statusMsg = $state('');
  let markdownFallback = $state('');
  let runtimeFlags = $state<{ askEditor: boolean; aiIllustration: boolean; audioEdition: boolean }>({
    askEditor: false,
    aiIllustration: false,
    audioEdition: false
  });

  const visibleItems = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (issueFilter !== 'all' && item.issueNumber !== issueFilter) return false;
      if (onlySaved && !savedNos.includes(item.readerServiceNo)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.techStack.some((t) => t.toLowerCase().includes(q)) ||
        String(item.readerServiceNo).includes(q)
      );
    });
  });

  const savedItems = $derived(items.filter((item) => savedNos.includes(item.readerServiceNo)));

  onMount(() => {
    pressClient.init();
    const params = new URLSearchParams(window.location.search);
    const requestedIssue = params.get('issue');
    if (requestedIssue === '01' || requestedIssue === '02') {
      issueFilter = requestedIssue;
    }

    const sync = () => {
      const s = pressClient.getState();
      const c = pressClient.getCommunity();
      savedNos = s.circledServiceNos;
      localNotes = s.readerNotes;
      communityCounts = c.saveCountsByServiceNo || {};
      dispatches = c.recentDispatches || [];
    };
    sync();
    const unsub = pressClient.subscribe(sync);

    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.features) {
          runtimeFlags = {
            askEditor: Boolean(d.features.askEditor),
            aiIllustration: Boolean(d.features.aiIllustration),
            audioEdition: Boolean(d.features.audioEdition)
          };
        }
      })
      .catch(() => {});

    return unsub;
  });

  function toggleItem(no: number, title: string) {
    const active = pressClient.toggleServiceNo(no);
    carbonSynth.click(active ? 760 : 500);
    statusMsg = `${title} ${active ? 'saved to' : 'removed from'} your Source Room list.`;
    markdownFallback = '';
  }

  function saveAllShown() {
    const merged = [...new Set([...savedNos, ...visibleItems.map((i) => i.readerServiceNo)])];
    pressClient.setAllServiceNos(merged);
    statusMsg = `Saved ${visibleItems.length} visible repositories.`;
    markdownFallback = '';
  }

  function clearAll() {
    pressClient.setAllServiceNos([]);
    statusMsg = 'Cleared your reading list.';
    markdownFallback = '';
  }

  async function copyMarkdown() {
    if (savedItems.length === 0) return;
    const md = [
      '# SLOP ILLUSTRATED (Si.) — My Source Room Reading List',
      '',
      ...savedItems.map(
        (item) =>
          `- [${item.title}](${item.repoUrl}) — Issue ${item.issueNumber}, Folio ${item.folioCode} (\`@${item.sourceRevision.slice(0, 7)}\`)`
      ),
      ''
    ].join('\n');

    try {
      await navigator.clipboard.writeText(md);
      statusMsg = `Copied ${savedItems.length} repositories as Markdown.`;
      markdownFallback = '';
    } catch {
      markdownFallback = md;
      statusMsg = 'Clipboard unavailable—select and copy the Markdown below.';
    }
  }

  async function submitNote(e: SubmitEvent) {
    e.preventDefault();
    const created = await pressClient.addDispatch(noteDraft, {
      issueNumber: issueFilter === 'all' ? '02' : issueFilter
    });
    if (created) {
      noteDraft = '';
      statusMsg = 'Margin dispatch recorded.';
      carbonSynth.click(820);
    }
  }
</script>

<div class="source-room-grid">
  <div>
    <div class="source-filter-bar" role="region" aria-label="Filter repositories">
      <div class="stock-group" role="group" aria-label="Filter by issue">
        <button type="button" class="ctrl-btn" aria-pressed={issueFilter === 'all'} onclick={() => (issueFilter = 'all')}>
          All Issues ({items.length})
        </button>
        <button type="button" class="ctrl-btn" aria-pressed={issueFilter === '02'} onclick={() => (issueFilter = '02')}>
          Issue 02
        </button>
        <button type="button" class="ctrl-btn" aria-pressed={issueFilter === '01'} onclick={() => (issueFilter = '01')}>
          Issue 01
        </button>
      </div>

      <input
        type="search"
        class="source-search-input"
        placeholder="Filter by name, language, or domain…"
        bind:value={searchQuery}
        aria-label="Filter repository directory"
      />

      <button type="button" class="ctrl-btn" aria-pressed={onlySaved} onclick={() => (onlySaved = !onlySaved)}>
        Saved ({savedNos.length})
      </button>
    </div>

    <ul class="source-catalog-list" aria-label="Verified repository directory">
      {#each visibleItems as item (item.readerServiceNo)}
        {@const isSaved = savedNos.includes(item.readerServiceNo)}
        {@const saves = communityCounts[String(item.readerServiceNo)] || 0}
        <li class={`source-catalog-item ${isSaved ? 'is-saved' : ''}`}>
          <div>
            <div class="datum-tag">ISS.{item.issueNumber}</div>
            <div class="service-stamp">#{item.readerServiceNo}</div>
          </div>
          <div>
            <h3>
              <a href={`/issues/${item.issueNumber}/${item.articleSlug}`}>{item.title}</a>
            </h3>
            <div class="datum-tag">
              {item.category} · {item.techStack.slice(0, 3).join(' / ')} ·
              <a href={`${item.repoUrl}/tree/${item.sourceRevision}`} target="_blank" rel="noopener">
                @{item.sourceRevision.slice(0, 7)} ↗
              </a>
            </div>
          </div>
          <div class="press-controls-bar">
            <a class="ctrl-btn" href={item.repoUrl} target="_blank" rel="noopener">Repo ↗</a>
            <button
              type="button"
              class="ctrl-btn"
              aria-pressed={isSaved}
              onclick={() => toggleItem(item.readerServiceNo, item.title)}
            >
              {isSaved ? '✓ Saved' : '+ Save'}{saves > 0 ? ` (${saves})` : ''}
            </button>
          </div>
        </li>
      {:else}
        <li class="source-catalog-item">
          <div class="datum-tag">00</div>
          <div>No repositories match your current filter.</div>
          <div></div>
        </li>
      {/each}
    </ul>
  </div>

  <aside class="source-desk-sticky" aria-label="Personal Reading List & Margin Dispatches">
    <div class="article-kicker-row">
      <span class="service-stamp">READER DESK</span>
      <span class="datum-tag">{String(savedItems.length).padStart(2, '0')} / {items.length} SAVED</span>
    </div>

    {#if savedItems.length > 0}
      <ul class="sources-list">
        {#each savedItems as sItem (sItem.readerServiceNo)}
          <li>
            <a href={`/issues/${sItem.issueNumber}/${sItem.articleSlug}`}>
              <strong>#{sItem.readerServiceNo} {sItem.title}</strong>
            </a>
            <span class="datum-tag"> (Iss. {sItem.issueNumber})</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="datum-tag">
        Save any project across Issue 01 or Issue 02 to build a portable, per-reader SQLite-synced reading list.
      </p>
    {/if}

    <div class="cta-row">
      <button type="button" class="ctrl-btn" onclick={saveAllShown}>Save Shown</button>
      <button type="button" class="ctrl-btn" disabled={savedItems.length === 0} onclick={clearAll}>Clear</button>
      <button type="button" class="btn-primary" disabled={savedItems.length === 0} onclick={copyMarkdown}>
        Export Markdown ↗
      </button>
    </div>

    <p class="datum-tag" role="status" aria-live="polite">{statusMsg}</p>

    {#if markdownFallback}
      <label class="datum-tag" for="md-export-fallback">Copy Markdown manually:</label>
      <textarea id="md-export-fallback" class="source-search-input" rows="5" readonly value={markdownFallback}></textarea>
    {/if}

    <hr />

    <form onsubmit={submitNote}>
      <label class="datum-tag" for="margin-dispatch-input">LEAVE A MARGIN DISPATCH (MAX 180 CHARS)</label>
      <div class="source-filter-bar">
        <input
          id="margin-dispatch-input"
          type="text"
          maxlength="180"
          class="source-search-input"
          placeholder="Note on an article or architecture choice…"
          bind:value={noteDraft}
        />
        <button type="submit" class="ctrl-btn">Post</button>
      </div>
    </form>

    {#if dispatches.length > 0 || localNotes.length > 0}
      <div class="sidebar-panel">
        <h3>Recent Press Dispatches</h3>
        <ul class="sources-list">
          {#each (dispatches.length > 0 ? dispatches : localNotes).slice(0, 5) as note (note.id)}
            <li>{note.text}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="sidebar-panel">
      <h3>Runtime Feature Flags (Neon Handoff Ready)</h3>
      <ul class="sources-list">
        <li>
          <strong>Ask the Editor (Gemini Flash-Lite):</strong>
          <span class="datum-tag"> {runtimeFlags.askEditor ? 'LIVE' : 'STUB INTERFACE'}</span>
        </li>
        <li>
          <strong>Per-Issue AI Illustration:</strong>
          <span class="datum-tag"> {runtimeFlags.aiIllustration ? 'LIVE' : 'STUB (/api/illustrations/status)'}</span>
        </li>
        <li>
          <strong>Audio Edition Narration:</strong>
          <span class="datum-tag"> {runtimeFlags.audioEdition ? 'LIVE' : 'STUB + WEBAUDIO SYNTH'}</span>
        </li>
      </ul>
    </div>
  </aside>
</div>
