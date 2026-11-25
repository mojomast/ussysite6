<script lang="ts">
  import { API_ENABLED, withBase } from '../../lib/paths';
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

  let { catalog = [], currentPath = '/' }: { catalog?: SearchEntry[]; currentPath?: string } = $props();

  let stock = $state<PaperStock>('graphite');
  let gridOn = $state(false);
  let audioDockOpen = $state(false);
  let soundOn = $state(false);
  let savedNos = $state<number[]>([]);

  let deskOpen = $state(false);
  let menuOpen = $state(false);

  const NAV_ITEMS = [
    { href: '/', label: 'Front Page', exact: true },
    { href: '/issues/02', label: 'Issue 02 · Current', exact: false },
    { href: '/issues/01', label: 'Issue 01', exact: false },
    { href: '/issues', label: 'Back Issues', exact: true },
    { href: '/source-room', label: 'Source Room', exact: false },
    { href: '/about', label: 'About', exact: false }
  ];

  function navIsCurrent(item: { href: string; exact: boolean }): boolean {
    return item.exact
      ? currentPath === item.href
      : currentPath === item.href || currentPath.startsWith(`${item.href}/`);
  }

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
    'Why did photo-to-part build gear_steer.py?',
    'Which projects run with zero npm dependencies?',
    'What’s the difference between bundlebees and hyvv?',
    'How often does the Doppler plugin actually find you?'
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
      flashHud(direction === 'next' ? 'That’s the last page. There is no next.' : 'You’re at the front. Nothing before this.');
      return;
    }
    const label = host?.getAttribute(labelAttr) || href;
    flashHud(`${direction === 'next' ? 'Turning to' : 'Back to'} ${label}`);
    carbonSynth.pageTurn(direction === 'next');
    try {
      sessionStorage.setItem('si.nav.dir', direction === 'next' ? 'forward' : 'backward');
    } catch {
      // Without storage the page still turns, just always forwards.
    }
    window.setTimeout(() => window.location.assign(href), 110);
  }

  onMount(() => {
    pressClient.init();
    soundOn = carbonSynth.isEnabled();
    const unsubSound = carbonSynth.subscribe((on) => (soundOn = on));
    const initial = pressClient.getState();
    stock = initial.printMode;
    gridOn = initial.gridOverlay;
    savedNos = initial.circledServiceNos;

    const unsub = pressClient.subscribe((next) => {
      stock = next.printMode;
      gridOn = next.gridOverlay;
      savedNos = next.circledServiceNos;
    });

    if (API_ENABLED) {
      fetch(withBase('/api/editor/status'))
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            editorEnabled = Boolean(d.enabled && d.configured);
            if (d.model) editorModel = d.model;
          }
        })
        .catch(() => {});
    }

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
        deskOpen = false;
        menuOpen = false;
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
          carbonSynth.thunk();
          flashHud('You found the basement.');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsub();
      unsubSound();
      if (hudTimer) clearTimeout(hudTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  function chooseStock(next: PaperStock, from?: HTMLElement) {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const start = (document as Document & {
      startViewTransition?: (o: { update: () => void; types: string[] }) => unknown;
    }).startViewTransition;
    if (start && !calm && next !== stock) {
      // One sheet of paper: shared-element names would split the page into groups that
      // crossfade on their own instead of taking the ink.
      const root = document.documentElement;
      // The flood starts at the button that was pressed, snapped to a 10% grid of classes
      // because strict CSP rules out setting the origin as an inline style.
      const box = from?.getBoundingClientRect();
      const bx = box ? Math.round(((box.left + box.width / 2) / window.innerWidth) * 10) : 9;
      const by = box ? Math.round(((box.top + box.height / 2) / window.innerHeight) * 10) : 0;
      const inkClasses = ['is-inking', `ink-x-${Math.min(10, Math.max(0, bx))}`, `ink-y-${Math.min(10, Math.max(0, by))}`];
      root.classList.add(...inkClasses);
      try {
        const vt = start.call(document, { update: () => pressClient.setStock(next), types: ['ink'] }) as
          | { finished?: Promise<void> }
          | undefined;
        if (vt?.finished) vt.finished.finally(() => root.classList.remove(...inkClasses));
        else root.classList.remove(...inkClasses);
      } catch {
        root.classList.remove(...inkClasses);
        pressClient.setStock(next);
      }
    } else {
      pressClient.setStock(next);
    }
    carbonSynth.tick(1500);
    flashHud(
      next === 'graphite' ? 'Graphite: for reading at night.' : next === 'rag' ? 'Cotton rag: for reading by a window.' : 'Oxide: blueprint paper, for the engineers.'
    );
  }

  function handleGridToggle() {
    gridOn = pressClient.toggleGrid();
    carbonSynth.tick(1100);
    flashHud(gridOn ? 'Grid on. This is what the layout is hiding.' : 'Grid off.');
  }

  function handleAudioDockToggle() {
    audioDockOpen = !audioDockOpen;
    if (audioDockOpen) carbonSynth.tick(1300);
  }

  function handleSoundToggle() {
    carbonSynth.setEnabled(!soundOn);
    flashHud(carbonSynth.isEnabled() ? 'Sound on. Quietly.' : 'Sound off. The press is silent.');
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
      // Static hosts have no editor server: go straight to the local archive search below.
      if (!API_ENABLED) throw new Error('static host');
      const res = await fetch(withBase('/api/editor/ask'), {
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
          text: data.reply || data.error || 'The editor stepped out. Try again in a moment.',
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
              ? `The press desk is offline, but the archive isn’t. Try ${localHits.map((h) => `${h.title} (Issue ${h.issueNumber})`).join(', ')}.`
              : 'The press desk is offline and nothing in the archive matched. Press / to search everything.',
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
  <button
    type="button"
    class="ctrl-btn"
    aria-expanded={finderOpen}
    onclick={() => {
      finderOpen = !finderOpen;
      editorOpen = false;
      shortcutsOpen = false;
      deskOpen = false;
      menuOpen = false;
    }}
    title="Search every issue (/)"
  >
    Find <kbd class="ctrl-kbd">/</kbd>
  </button>

  <button
    type="button"
    class="ctrl-btn press-desktop-only"
    aria-expanded={editorOpen}
    onclick={() => {
      editorOpen = !editorOpen;
      finderOpen = false;
      shortcutsOpen = false;
      deskOpen = false;
    }}
    title="Ask the editor about anything in the archive"
  >
    Ask Editor
  </button>

  <button
    type="button"
    class="ctrl-btn press-desktop-only"
    aria-expanded={deskOpen}
    aria-controls="press-desk-tray"
    onclick={() => {
      deskOpen = !deskOpen;
      finderOpen = false;
      editorOpen = false;
      shortcutsOpen = false;
    }}
    title="Paper stock, layout grid, sound and flexi-disc"
  >
    Press {deskOpen ? '▴' : '▾'}
  </button>

  <button
    type="button"
    class="ctrl-btn press-mobile-only"
    aria-expanded={menuOpen}
    aria-controls="press-mobile-sheet"
    onclick={() => {
      menuOpen = !menuOpen;
      finderOpen = false;
      editorOpen = false;
      shortcutsOpen = false;
    }}
    aria-label={menuOpen ? 'Close navigation and press controls' : 'Open navigation and press controls'}
  >
    {menuOpen ? 'Close ×' : 'Menu ☰'}
  </button>
</div>

{#if deskOpen}
  <div id="press-desk-tray" class="press-desk-tray" role="region" aria-label="Press Desk">
    <div class="carbon-sheet press-desk-tray-inner">
      <div class="press-desk-group">
        <span class="datum-tag">Stock</span>
        <div class="stock-group" role="group" aria-label="Paper Stock">
          <button
            type="button"
            class="ctrl-btn"
            aria-pressed={stock === 'graphite'}
            onclick={(e) => chooseStock('graphite', e.currentTarget)}
            title="Pyrolytic Graphite dark stock"
          >
            Graphite
          </button>
          <button
            type="button"
            class="ctrl-btn"
            aria-pressed={stock === 'rag'}
            onclick={(e) => chooseStock('rag', e.currentTarget)}
            title="Unbleached Cotton Rag daylight stock"
          >
            Rag
          </button>
          <button
            type="button"
            class="ctrl-btn"
            aria-pressed={stock === 'oxide'}
            onclick={(e) => chooseStock('oxide', e.currentTarget)}
            title="Ferric Blueprint inspection stock"
          >
            Oxide
          </button>
        </div>
      </div>

      <div class="press-desk-group">
        <button
          type="button"
          class="ctrl-btn"
          aria-pressed={gridOn}
          onclick={handleGridToggle}
          title="Show the layout grid"
        >
          Grid
        </button>

        <button
          type="button"
          class="ctrl-btn"
          aria-pressed={soundOn}
          onclick={handleSoundToggle}
          title="Interface sounds. Off unless you turn them on."
        >
          {soundOn ? '♪ Sound on' : 'Sound off'}
        </button>

        <button
          type="button"
          class="ctrl-btn"
          aria-pressed={audioDockOpen}
          onclick={handleAudioDockToggle}
          title="Open the flexi-disc player"
        >
          {audioDockOpen ? 'Flexi-disc ▾' : 'Flexi-disc'}
        </button>

        <button
          type="button"
          class="ctrl-btn"
          onclick={() => {
            deskOpen = false;
            shortcutsOpen = true;
          }}
          title="Keyboard shortcuts (?)"
        >
          Keys <kbd class="ctrl-kbd">?</kbd>
        </button>
      </div>
    </div>
  </div>
{/if}

{#if menuOpen}
  <div id="press-mobile-sheet" class="press-mobile-sheet" role="region" aria-label="Site navigation and press desk">
    <nav class="press-mobile-nav" aria-label="Sections (mobile)">
      {#each NAV_ITEMS as item (item.href)}
        <a
          class="press-mobile-link"
          href={withBase(item.href)}
          aria-current={navIsCurrent(item) ? 'page' : undefined}
          onclick={() => (menuOpen = false)}
        >
          {item.label}
        </a>
      {/each}
    </nav>

    <div class="press-mobile-desk">
      <span class="datum-tag">Paper Stock</span>
      <div class="stock-group" role="group" aria-label="Paper Stock">
        <button type="button" class="ctrl-btn" aria-pressed={stock === 'graphite'} onclick={(e) => chooseStock('graphite', e.currentTarget)}>Graphite</button>
        <button type="button" class="ctrl-btn" aria-pressed={stock === 'rag'} onclick={(e) => chooseStock('rag', e.currentTarget)}>Rag</button>
        <button type="button" class="ctrl-btn" aria-pressed={stock === 'oxide'} onclick={(e) => chooseStock('oxide', e.currentTarget)}>Oxide</button>
      </div>

      <div class="press-mobile-tools">
        <button type="button" class="ctrl-btn" aria-pressed={gridOn} onclick={handleGridToggle}>Grid</button>
        <button type="button" class="ctrl-btn" aria-pressed={soundOn} onclick={handleSoundToggle}>{soundOn ? '♪ Sound on' : 'Sound off'}</button>
        <button type="button" class="ctrl-btn" aria-pressed={audioDockOpen} onclick={() => { handleAudioDockToggle(); menuOpen = false; }}>Flexi-disc</button>
        <button type="button" class="ctrl-btn" onclick={() => { menuOpen = false; editorOpen = true; }}>Ask the Editor</button>
      </div>
    </div>
  </div>
{/if}

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
        <strong id="finder-dialog-title" class="datum-tag">FIND · 22 FEATURES ACROSS TWO ISSUES</strong>
        <button type="button" class="ctrl-btn" onclick={() => (finderOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <div class="source-filter-bar">
          <input
            type="search"
            class="source-search-input"
            placeholder="Try gear, TempleOS, SQLite, or a reader number like 207"
            bind:value={finderQuery}
            aria-label="Search every issue"
          />
          <button type="button" class="ctrl-btn" aria-pressed={savedOnly} onclick={() => (savedOnly = !savedOnly)}>
            Only what I saved ({savedNos.length})
          </button>
        </div>
        <ul class="sources-list">
          {#each filteredCatalog.slice(0, 12) as item (item.readerServiceNo)}
            <li>
              <a href={withBase(`/issues/${item.issueNumber}/${item.articleSlug}`)} onclick={() => (finderOpen = false)}>
                <strong>Issue {item.issueNumber} · #{item.readerServiceNo} — {item.title}</strong>
              </a>
              <div class="datum-tag">{item.category} · {item.techStack.slice(0, 3).join(' · ')}</div>
            </li>
          {:else}
            <li class="datum-tag">Nothing by that name. Either it doesn’t exist, or we haven’t written about it yet.</li>
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
            {editorEnabled ? `Live · ${editorModel}` : 'Archive mode'}
          </span>
          <strong id="ask-editor-title" class="datum-tag">ASK THE EDITOR</strong>
        </div>
        <button type="button" class="ctrl-btn" onclick={() => (editorOpen = false)}>Close [Esc]</button>
      </div>

      <div class="neon-drawer-body">
        <p class="datum-tag">
          Ask about anything we’ve printed. Right now the live editor is switched off, so answers come straight from the
          archive with links to the features they’re from. When the site’s owner turns on
          <code>FEATURE_ASK_EDITOR</code>, <code>{editorModel}</code> writes the reply, still using only what we’ve printed.
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
                <span>{msg.role === 'user' ? 'You asked' : 'The editor'}</span>
                {#if msg.model}
                  <span>{msg.stub ? 'from the archive' : msg.model}</span>
                {/if}
              </div>
              <p>{msg.text}</p>
              {#if msg.citations && msg.citations.length > 0}
                <div class="neon-cite-row">
                  {#each msg.citations as cite}
                    <a class="sha-pill" href={withBase(cite.href)} onclick={() => (editorOpen = false)}>
                      {cite.label} ↗
                    </a>
                  {/each}
                </div>
              {/if}
            </article>
          {:else}
            <div class="sidebar-panel">
              <h3>The desk is open</h3>
              <p class="datum-tag">Pick a question above, or type your own. Follow-ups remember the last few turns.</p>
            </div>
          {/each}
        </div>
      </div>

      <form class="neon-drawer-composer" onsubmit={submitEditorForm}>
        <div class="source-filter-bar">
          <input
            type="text"
            class="source-search-input"
            placeholder="Ask about any project in either issue…"
            bind:value={editorPrompt}
            aria-label="Question for the Editor"
          />
          <button type="submit" class="btn-primary" disabled={editorBusy}>
            {editorBusy ? 'Checking the files…' : 'Ask'}
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
        <strong id="shortcuts-title" class="datum-tag">KEYBOARD</strong>
        <button type="button" class="ctrl-btn" onclick={() => (shortcutsOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <ul class="sources-list">
          <li><kbd class="ctrl-kbd">j</kbd> or <kbd class="ctrl-kbd">]</kbd> Next page in this issue</li>
          <li><kbd class="ctrl-kbd">k</kbd> or <kbd class="ctrl-kbd">[</kbd> Previous page</li>
          <li><kbd class="ctrl-kbd">/</kbd> Find anything we’ve printed</li>
          <li><kbd class="ctrl-kbd">←</kbd> <kbd class="ctrl-kbd">→</kbd> Step through an interactive study once it has focus</li>
          <li><kbd class="ctrl-kbd">u</kbd> <kbd class="ctrl-kbd">s</kbd> <kbd class="ctrl-kbd">s</kbd> <kbd class="ctrl-kbd">y</kbd> Go down to the basement</li>
          <li><kbd class="ctrl-kbd">?</kbd> This list</li>
          <li><kbd class="ctrl-kbd">Esc</kbd> Close whatever is open</li>
        </ul>
      </div>
    </div>
  </div>
{/if}

{#if strataOpen}
  <div class="carbon-modal-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && (strataOpen = false)}>
    <div class="carbon-modal" role="dialog" aria-modal="true" aria-labelledby="strata-dialog-title">
      <div class="carbon-modal-header">
        <strong id="strata-dialog-title" class="datum-tag">THE BASEMENT · EVERYTHING THIS DOMAIN USED TO BE</strong>
        <button type="button" class="ctrl-btn" onclick={() => (strataOpen = false)}>Close [Esc]</button>
      </div>
      <div class="carbon-modal-body">
        <p class="datum-tag">
          Before it was a magazine, this domain was a spaceship, a planet you could walk on, an organ underground and a tidepool
          at golden hour. None of them were deleted. Each one still has its repository, and each one has a chord.
        </p>
        <ul class="sources-list">
          {#each USSYVERSE_STRATIGRAPHY as layer}
            <li>
              <div class="article-kicker-row">
                <span class="service-stamp">{layer.era}</span>
                <strong>{layer.title}</strong>
                <a class="sha-pill" href={withBase(layer.repoUrl)} target="_blank" rel="noopener">{layer.repo} ↗</a>
                <button
                  type="button"
                  class="ctrl-btn neon-btn-accent"
                  onclick={() => carbonSynth.playChord(layer.freqs)}
                >
                  Play {layer.chordLabel}
                </button>
              </div>
              <p>{layer.lore}</p>
              <div class="datum-tag">What we kept: {layer.artifact}</div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}
