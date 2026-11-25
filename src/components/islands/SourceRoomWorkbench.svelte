<script lang="ts">
  import { API_ENABLED, withBase } from '../../lib/paths';
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

    if (API_ENABLED) {
      fetch(withBase('/api/health'))
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
    }

    return unsub;
  });

  function toggleItem(no: number, title: string) {
    const active = pressClient.toggleServiceNo(no);
    carbonSynth.tick(active ? 1700 : 900);
    statusMsg = active ? `${title} is on your list.` : `${title} is off your list.`;
    markdownFallback = '';
  }

  function saveAllShown() {
    const merged = [...new Set([...savedNos, ...visibleItems.map((i) => i.readerServiceNo)])];
    pressClient.setAllServiceNos(merged);
    statusMsg = `All ${visibleItems.length} on screen are saved. Ambitious.`;
    markdownFallback = '';
  }

  function clearAll() {
    pressClient.setAllServiceNos([]);
    statusMsg = 'List cleared. A clean desk.';
    markdownFallback = '';
  }

  async function copyMarkdown() {
    if (savedItems.length === 0) return;
    const md = [
      '# My reading list, from Slop Illustrated',
      '',
      ...savedItems.map(
        (item) =>
          `- [${item.title}](${item.repoUrl}) — Issue ${item.issueNumber}, Folio ${item.folioCode} (\`@${item.sourceRevision.slice(0, 7)}\`)`
      ),
      ''
    ].join('\n');

    try {
      await navigator.clipboard.writeText(md);
      statusMsg = `Copied ${savedItems.length} ${savedItems.length === 1 ? 'link' : 'links'} as Markdown, commits included.`;
      markdownFallback = '';
    } catch {
      markdownFallback = md;
      statusMsg = 'Your browser won’t let us copy. The Markdown is below; select it and copy it yourself.';
    }
  }

  async function submitNote(e: SubmitEvent) {
    e.preventDefault();
    const created = await pressClient.addDispatch(noteDraft, {
      issueNumber: issueFilter === 'all' ? '02' : issueFilter
    });
    if (created) {
      noteDraft = '';
      statusMsg = 'Written in the margin.';
      carbonSynth.tick(1500);
    }
  }
</script>

<div class="source-room-grid">
  <div>
    <div class="source-filter-bar" role="region" aria-label="Filter repositories">
      <div class="stock-group" role="group" aria-label="Filter by issue">
        <button type="button" class="ctrl-btn" aria-pressed={issueFilter === 'all'} onclick={() => (issueFilter = 'all')}>
          Both issues ({items.length})
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
        placeholder="Filter by name, language or topic"
        bind:value={searchQuery}
        aria-label="Filter the directory"
      />

      <button type="button" class="ctrl-btn" aria-pressed={onlySaved} onclick={() => (onlySaved = !onlySaved)}>
        Saved ({savedNos.length})
      </button>
    </div>

    <ul class="source-catalog-list" aria-label="Every repository we have written about">
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
              <a href={withBase(`/issues/${item.issueNumber}/${item.articleSlug}`)}>{item.title}</a>
            </h3>
            <div class="datum-tag">
              {item.category} · {item.techStack.slice(0, 3).join(' / ')} ·
              <a href={withBase(`${item.repoUrl}/tree/${item.sourceRevision}`)} target="_blank" rel="noopener">
                @{item.sourceRevision.slice(0, 7)} ↗
              </a>
            </div>
          </div>
          <div class="press-controls-bar">
            <a class="ctrl-btn" href={withBase(item.repoUrl)} target="_blank" rel="noopener">Repo ↗</a>
            <button
              type="button"
              class="ctrl-btn"
              aria-pressed={isSaved}
              onclick={() => toggleItem(item.readerServiceNo, item.title)}
            >
              {isSaved ? 'Saved ✓' : 'Save'}{saves > 0 ? ` (${saves})` : ''}
            </button>
          </div>
        </li>
      {:else}
        <li class="source-catalog-item">
          <div class="datum-tag">00</div>
          <div>Nothing matches. Try fewer words, or a different issue.</div>
          <div></div>
        </li>
      {/each}
    </ul>
  </div>

  <aside class="source-desk-sticky" aria-label="Personal Reading List & Margin Dispatches">
    <div class="article-kicker-row">
      <span class="service-stamp">YOUR DESK</span>
      <span class="datum-tag">{savedItems.length} of {items.length} saved</span>
    </div>

    {#if savedItems.length > 0}
      <ul class="sources-list">
        {#each savedItems as sItem (sItem.readerServiceNo)}
          <li>
            <a href={withBase(`/issues/${sItem.issueNumber}/${sItem.articleSlug}`)}>
              <strong>#{sItem.readerServiceNo} {sItem.title}</strong>
            </a>
            <span class="datum-tag"> (Iss. {sItem.issueNumber})</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="desk-empty-note">
        Nothing here yet. Press Save on anything that made you curious and it will wait for you, on this device and,
        if the server is up, in a small SQLite file that only knows you by a random number.
      </p>
    {/if}

    <div class="cta-row">
      <button type="button" class="ctrl-btn" onclick={saveAllShown}>Save everything shown</button>
      <button type="button" class="ctrl-btn" disabled={savedItems.length === 0} onclick={clearAll}>Clear</button>
      <button type="button" class="btn-primary" disabled={savedItems.length === 0} onclick={copyMarkdown}>
        Copy as Markdown
      </button>
    </div>

    <p class="datum-tag" role="status" aria-live="polite">{statusMsg}</p>

    {#if markdownFallback}
      <label class="datum-tag" for="md-export-fallback">Your list, ready to copy:</label>
      <textarea id="md-export-fallback" class="source-search-input" rows="5" readonly value={markdownFallback}></textarea>
    {/if}

    <hr />

    <form onsubmit={submitNote}>
      <label class="datum-tag" for="margin-dispatch-input">WRITE IN THE MARGIN · 180 CHARACTERS</label>
      <div class="source-filter-bar">
        <input
          id="margin-dispatch-input"
          type="text"
          maxlength="180"
          class="source-search-input"
          placeholder="A note for the next reader. Be kind, be specific."
          bind:value={noteDraft}
        />
        <button type="submit" class="ctrl-btn">Pin it</button>
      </div>
    </form>

    {#if dispatches.length > 0 || localNotes.length > 0}
      <div class="sidebar-panel">
        <h3>Lately, in the margins</h3>
        <ul class="sources-list">
          {#each (dispatches.length > 0 ? dispatches : localNotes).slice(0, 5) as note (note.id)}
            <li>{note.text}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="sidebar-panel">
      <h3>Switched off on purpose</h3>
      <ul class="sources-list">
        <li>
          <strong>Ask the Editor, live:</strong>
          <span class="datum-tag"> {runtimeFlags.askEditor ? 'on' : 'off, answering from the archive'}</span>
        </li>
        <li>
          <strong>Generated illustrations:</strong>
          <span class="datum-tag"> {runtimeFlags.aiIllustration ? 'on' : 'off, the plates are drawn by hand and by Blender'}</span>
        </li>
        <li>
          <strong>Narrated audio edition:</strong>
          <span class="datum-tag"> {runtimeFlags.audioEdition ? 'on' : 'off, the flexi-disc still plays chords'}</span>
        </li>
      </ul>
    </div>
  </aside>
</div>
