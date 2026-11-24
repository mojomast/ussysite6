<script lang="ts">
  import { onMount } from 'svelte';
  import { pressClient, type PaperStock } from '../../lib/press-client';
  import { carbonSynth } from '../../lib/carbon-synth';
  import { USSYVERSE_STRATIGRAPHY } from '../../lib/folio';
  import AudioEditionBar from './AudioEditionBar.svelte';

  interface SearchEntry {
    issueNumber: string;
    articleSlug: string;
    readerServiceNo: number;
    folioCode: string;
    title: string;
    headline: string;
    category: string;
    techStack: string[];
    flexiFreqs: number[];
  }

  interface EditorMessage {
    id: string;
    role: 'user' | 'editor';
    text: string;
    stub?: boolean;
    model?: string;
    citations?: Array<{ label: string; href: string }>;
  }

  let { catalog = [] }: { catalog?: SearchEntry[] } = $props();

  let stock = $state<PaperStock>('graphite');
  let gridOn = $state(false);
  let audioDockOpen = $state(false);
  let savedNos = $state<number[]>([]);

  let finderOpen = $state(false);
  let finderQuery = $state('');
  let savedOnly = $state(false);

  let editorOpen = $state(false);
  let editorEnabled = $state(false);
  let editorModel = $state('gemini-3.5-flash-lite');
  let editorPrompt = $state('');
  let editorBusy = $state(false);
  let editorMessages = $state<EditorMessage[]>([]);

  let strataOpen = $state(false);
  let shortcutsOpen = $state(false);
  let hudNotice = $state('');
  let hudTimer: ReturnType<typeof setTimeout> | null = null;

  const STARTER_PROMPTS = [
    'Which Nov 2026 repos have zero npm dependencies?',
    'Why did photo-to-part build gear_steer.py?',
    'Compare bundlebees and hyvv contracts',
    'How honest is aircraft Doppler geolocation?'
  ];

  const audioTracks = $derived(
    catalog
      .filter((c) => c.issueNumber === '02')
      .concat(catalog.filter((c) => c.issueNumber !== '02'))
      .map((c) => ({
        issueNumber: c.issueNumber,
        articleSlug: c.articleSlug,
        folioCode: c.folioCode,
        readerServiceNo: c.readerServiceNo,
        title: c.title,
        flexiFreqs: c.flexiFreqs
      }))
  );

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

  function flashHud(text: string) {
    hudNotice = text;
    if (hudTimer) clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
      hudNotice = '';
    }, 1700);
  }

  function navigateFolio(direction: 'next' | 'prev') {
    const attr = direction === 'next' ? 'data-folio-next' : 'data-folio-prev';
    const labelAttr = direction === 'next' ? 'data-folio-next-label' : 'data-folio-prev-label';
    const host = document.querySelector(`[${attr}]`);
    const href = host?.getAttribute(attr);
    if (!href) {
      flashHud(direction === 'next' ? 'END OF FOLIO SEQUENCE' : 'AT COVER FOLIO');
      return;
    }
    const label = host?.getAttribute(labelAttr) || href;
    flashHud(`${direction === 'next' ? 'NEXT ->' : '<- PREV'} ${label.toUpperCase()}`);
    carbonSynth.click(direction === 'next' ? 740 : 540);
    window.location.assign(href);
  }

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
        shortcutsOpen = false;
        return;
      }

      if (inInput || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        finderOpen = !finderOpen;
        editorOpen = false;
        shortcutsOpen = false;
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        shortcutsOpen = !shortcutsOpen;
        finderOpen = false;
        editorOpen = false;
        return;
      }

      const anyDialogOpen = finderOpen || editorOpen || strataOpen || shortcutsOpen;
      if (!anyDialogOpen && (e.key === 'j' || e.key === ']')) {
        e.preventDefault();
        navigateFolio('next');
        return;
      }

      if (!anyDialogOpen && (e.key === 'k' || e.key === '[')) {
        e.preventDefault();
        navigateFolio('prev');
        return;
      }

      if (e.key.length === 1) {
        const now = Date.now();
        if (now - lastKeyTime > 1500) ussyBuffer = '';
        lastKeyTime = now;
        ussyBuffer = (ussyBuffer + e.key.toLowerCase()).slice(-4);
        if (ussyBuffer === 'ussy') {
          ussyBuffer = '';
          strataOpen = true;
          carbonSynth.playChord([196.0, 293.66, 392.0, 587.33]);
          flashHud('USSYVERSE STRATIGRAPHY UNLOCKED');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsub();
      if (hudTimer) clearTimeout(hudTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  function chooseStock(next: PaperStock) {
    pressClient.setStock(next);
    carbonSynth.click(720);
    flashHud(`STOCK: ${next.toUpperCase()}`);
  }

  function handleGridToggle() {
    gridOn = pressClient.toggleGrid();
    carbonSynth.click(540);
    flashHud(`REGISTRATION GRID: ${gridOn ? 'ON' : 'OFF'}`);
  }

  function handleAudioDockToggle() {
    audioDockOpen = !audioDockOpen;
    if (audioDockOpen) {
      carbonSynth.click(680);
    }
  }

  async function askEditor(questionText: string) {
    const q = questionText.trim();
    if (!q || editorBusy) return;
    editorPrompt = '';
    editorBusy = true;

    const historyPayload = editorMessages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text
    }));

    editorMessages = [
      ...editorMessages,
      { id: `u_${Date.now()}`, role: 'user', text: q }
    ];

    try {
      const res = await fetch('/api/editor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history: historyPayload })
      });
      const data = await res.json();
      editorMessages = [
        ...editorMessages,
        {
          id: `e_${Date.now()}`,
          role: 'editor',
          text: data.reply || data.error || 'The Editor stepped out for toner.',
          stub: Boolean(data.stub),
          model: data.model || editorModel,
          citations: Array.isArray(data.citations) ? data.citations : []
        }
      ];
    } catch {
      const localHits = catalog
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q.toLowerCase()) ||
            c.category.toLowerCase().includes(q.toLowerCase()) ||
            c.headline.toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 3);

      editorMessages = [
        ...editorMessages,
        {
          id: `e_${Date.now()}`,
          role: 'editor',
          stub: true,
          model: editorModel,
          text:
            localHits.length > 0
              ? `[Static Offline Stub] Ask-the-Editor API is unreachable, but ${localHits.map((h) => `${h.title} (Issue ${h.issueNumber})`).join(', ')} matched locally.`
              : `[Static Offline Stub] Ask-the-Editor runs behind FEATURE_ASK_EDITOR (${editorModel}) on the Hono backend.`,
          citations: localHits.map((h) => ({
            label: `Issue ${h.issueNumber} · ${h.title}`,
            href: `/issues/${h.issueNumber}/${h.articleSlug}`
          }))
        }
      ];
    } finally {
      editorBusy = false;
    }
  }

  function submitEditorForm(e: SubmitEvent) {
    e.preventDefault();
    void askEditor(editorPrompt);
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
    class="ctrl-btn neon-btn-accent"
    aria-pressed={audioDockOpen}
    onclick={handleAudioDockToggle}
    title="Open 33⅓ RPM Audio Edition transport dock"
  >
    {audioDockOpen ? 'Audio: Docked' : 'Audio'}
  </button>

  <button
    type="button"
    class="ctrl-btn neon-btn-accent"
    aria-expanded={editorOpen}
    onclick={() => {
      editorOpen = !editorOpen;
      finderOpen = false;
      shortcutsOpen = false;
    }}
    title={`Ask SLOPTIMUS PRIME (${editorModel} behind FEATURE_ASK_EDITOR)`}
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
      shortcutsOpen = false;
    }}
    title="Search all issues and repositories (/)"
  >
    Find <kbd class="ctrl-kbd">/</kbd>
  </button>
</div>

{#if hudNotice}
  <div class="neon-shortcut-hud" role="status" aria-live="polite">
    {hudNotice}
  </div>
{/if}

<AudioEditionBar
  open={audioDockOpen}
  tracks={audioTracks}
  onClose={() => (audioDockOpen = false)}
/>

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
  <div class="neon-drawer-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (editorOpen = false)}>
    <div class="neon-drawer" role="dialog" aria-modal="true" aria-labelledby="ask-editor-title">
      <div class="carbon-modal-header">
        <div class="press-controls-bar">
          <span class="neon-pill">
            <span class="neon-pulse-dot" aria-hidden="true"></span>
            {editorEnabled ? `LIVE · ${editorModel}` : `STUB · ${editorModel}`}
          </span>
          <strong id="ask-editor-title" class="datum-tag">ASK THE EDITOR WIRE</strong>
        </div>
        <button type="button" class="ctrl-btn" onclick={() => (editorOpen = false)}>Close [Esc]</button>
      </div>

      <div class="neon-drawer-body">
        <p class="datum-tag">
          Multi-turn press desk grounded strictly in our 22 commit-pinned monographs. When
          <code>FEATURE_ASK_EDITOR=true</code> + <code>GEMINI_API_KEY</code> are set on the server,
          <code>{editorModel}</code> synthesizes replies; otherwise deterministic BM25 press-desk search answers directly.
        </p>

        <div class="neon-starter-chips" aria-label="Suggested editor prompts">
          {#each STARTER_PROMPTS as prompt}
            <button
              type="button"
              class="neon-chip-btn"
              disabled={editorBusy}
              onclick={() => void askEditor(prompt)}
            >
              ↗ {prompt}
            </button>
          {/each}
        </div>

        <div class="neon-chat-thread" aria-live="polite">
          {#each editorMessages as msg (msg.id)}
            <article class={`neon-msg ${msg.role === 'user' ? 'neon-msg--user' : 'neon-msg--editor'}`}>
              <div class="neon-msg-role">
                <span>{msg.role === 'user' ? 'READER QUERY' : 'SLOPTIMUS PRIME · DESK WIRE'}</span>
                {#if msg.model}
                  <span>{msg.stub ? 'BM25 STUB' : msg.model}</span>
                {/if}
              </div>
              <p>{msg.text}</p>
              {#if msg.citations && msg.citations.length > 0}
                <div class="neon-cite-row">
                  {#each msg.citations as cite}
                    <a class="sha-pill" href={cite.href} onclick={() => (editorOpen = false)}>
                      {cite.label} ↗
                    </a>
                  {/each}
                </div>
              {/if}
            </article>
          {:else}
            <div class="sidebar-panel">
              <h3>Press Desk Ready</h3>
              <p class="datum-tag">Pick a starter chip above or ask a follow-up question below.</p>
            </div>
          {/each}
        </div>
      </div>

      <form class="neon-drawer-composer" onsubmit={submitEditorForm}>
        <div class="source-filter-bar">
          <input
            type="text"
            class="source-search-input"
            placeholder="Ask a question or follow-up…"
            bind:value={editorPrompt}
            aria-label="Question for the Editor"
          />
          <button type="submit" class="btn-primary" disabled={editorBusy}>
            {editorBusy ? 'Checking…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if shortcutsOpen}
  <div class="carbon-modal-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (shortcutsOpen = false)}>
    <div class="carbon-modal" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
      <div class="carbon-modal-header">
        <strong id="shortcuts-title" class="datum-tag">NEON KEYBOARD FOLIO SHORTCUTS</strong>
        <button type="button" class="ctrl-btn" onclick={() => (shortcutsOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <ul class="sources-list">
          <li><kbd class="ctrl-kbd">j</kbd> or <kbd class="ctrl-kbd">]</kbd> — Jump to Next Folio in current issue</li>
          <li><kbd class="ctrl-kbd">k</kbd> or <kbd class="ctrl-kbd">[</kbd> — Jump to Previous Folio</li>
          <li><kbd class="ctrl-kbd">/</kbd> — Open 22-Monograph Catalog Finder</li>
          <li><kbd class="ctrl-kbd">←</kbd> / <kbd class="ctrl-kbd">→</kbd> — Step through Interactive Monograph Studies when focused</li>
          <li><kbd class="ctrl-kbd">u</kbd> <kbd class="ctrl-kbd">s</kbd> <kbd class="ctrl-kbd">s</kbd> <kbd class="ctrl-kbd">y</kbd> — Unlock Ussyverse Archaeological Stratigraphy (Eras II–VI)</li>
          <li><kbd class="ctrl-kbd">?</kbd> — Toggle this Keyboard Reference</li>
        </ul>
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
          the subterranean Helix Organum pipe organ to Solaris tidepool wish lanterns and Carbon × Neon Press.
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
                  class="ctrl-btn neon-btn-accent"
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
