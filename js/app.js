/**
 * USSYSITE6 // THE USSY COMPUTING ANNUAL (VOL. 11, NO. 10 — OCTOBER 2026)
 * MASTER EDITORIAL LAYOUT, SCROLL OBSERVER, BINGO CARD & INTERACTIVE CONTROLLER
 */

import { MAGAZINE_ISSUE_META, USSY_PROJECTS, getProjectById } from './projects.js';
import { initCoverIllustrationCanvas, initArticleLabCanvas } from './magazine-widgets.js';
import { FlexiDiscSynth } from './flexidisc-audio.js';
import { PressSDK } from './press-sdk.js';

function withViewTransition(fn) {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => fn());
  } else {
    fn();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sdk = new PressSDK();
  window.PressSDK = sdk;
  window.AnomalySDK = sdk;

  const flexiSynth = new FlexiDiscSynth();

  const runningSectionLabel = document.getElementById('running-section-label');
  const folioPageTabs = document.getElementById('folio-page-tabs');
  const tocArticleList = document.getElementById('toc-article-list');
  const spreadsContainer = document.getElementById('editorial-spreads-container');

  // Reader Service Bingo Card Elements
  const bingoNumbersGrid = document.getElementById('bingo-numbers-grid');
  const bingoSelectionSummary = document.getElementById('bingo-selection-summary');
  const bingoNoteForm = document.getElementById('bingo-note-form');
  const bingoReaderNote = document.getElementById('bingo-reader-note');
  const bingoRecentDispatches = document.getElementById('bingo-recent-dispatches');

  // 1. Render Top Running Header Page Tabs & Table of Contents Index
  function renderNavigationAndToc() {
    folioPageTabs.innerHTML = '';
    tocArticleList.innerHTML = '';

    for (const proj of USSY_PROJECTS) {
      // Top Folio Tab
      const tab = document.createElement('a');
      tab.href = `#spread-${proj.id}`;
      tab.className = 'folio-tab';
      tab.dataset.spreadId = proj.id;
      tab.textContent = String(proj.index).padStart(2, '0');
      tab.title = `${proj.title} (${proj.pageRange})`;
      folioPageTabs.appendChild(tab);

      // Table of Contents Entry
      const li = document.createElement('li');
      li.className = 'toc-entry';
      li.innerHTML = `
        <a href="#spread-${proj.id}">
          <span class="toc-entry-pages">${proj.pageRange}</span>
          <div>
            <strong class="toc-entry-title">${proj.title} — ${proj.headline}</strong>
            <span class="toc-entry-sub">${proj.deck}</span>
          </div>
          <span class="toc-entry-service">CARD #${proj.readerServiceNo}</span>
        </a>
      `;
      tocArticleList.appendChild(li);
    }
  }

  // 2. Render All 11 Bespoke Magazine Spreads
  function renderAllArticleSpreads() {
    spreadsContainer.innerHTML = '';
    const circledSet = new Set(sdk.getState().circledServiceNos || []);

    for (const proj of USSY_PROJECTS) {
      const isCircled = circledSet.has(proj.readerServiceNo);
      const section = document.createElement('article');
      section.id = `spread-${proj.id}`;
      section.className = `magazine-spread article-spread spread--${proj.spreadType}`;
      section.dataset.projectId = proj.id;
      section.dataset.sectionLabel = `${proj.pageRange} // ${proj.issueSection}`;
      section.style.setProperty('--article-spot', proj.spotInkHex);

      section.innerHTML = `
        <div class="crop-mark crop-tl" aria-hidden="true"></div>
        <div class="crop-mark crop-tr" aria-hidden="true"></div>
        <div class="crop-mark crop-bl" aria-hidden="true"></div>
        <div class="crop-mark crop-br" aria-hidden="true"></div>

        <div class="spread-folio-header">
          <span>${proj.issueSection}</span>
          <span>THE USSY COMPUTING ANNUAL · VOL. 11, NO. 10</span>
          <span>${proj.pageRange.toUpperCase()} · SERVICE NO. #${proj.readerServiceNo}</span>
        </div>

        <header class="article-header-deck">
          <div class="article-headline-col">
            <div class="article-kicker-row">
              <span class="article-kicker-badge">${proj.kicker}</span>
              <span class="article-category-tag">${proj.category}</span>
            </div>
            <h2 class="article-main-headline">${proj.title}: ${proj.headline}</h2>
            <p class="article-standfirst-deck">${proj.deck}</p>
            <div class="article-byline-strip">
              <span>${proj.byline}</span>
              <span>·</span>
              <span>VERIFIED OPEN-SOURCE ARCHITECTURE</span>
            </div>
          </div>

          <aside class="article-spec-card" aria-label="${proj.title} Specification Scorecard">
            <div class="spec-card-top">
              <span>BENCHMARK SCORECARD</span>
              <span>#${proj.readerServiceNo}</span>
            </div>
            <div class="spec-metrics-grid">
              ${proj.metrics
                .map(
                  (m) => `
                  <div class="spec-metric-row">
                    <span>${m.label}</span>
                    <strong>${m.value}</strong>
                  </div>
                `
                )
                .join('')}
            </div>
            <div class="spec-card-actions">
              <a href="${proj.repoUrl}" target="_blank" rel="noopener noreferrer" class="repo-dispatch-link">
                <span>SOURCE REPOSITORY (${proj.id})</span>
                <span aria-hidden="true">↗</span>
              </a>
              ${
                proj.liveUrl
                  ? `<a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="live-arena-link">
                      <span>LIVE MULTIPLAYER ARENA (cocs.ussyco.de)</span>
                      <span aria-hidden="true">⚡</span>
                    </a>`
                  : ''
              }
              <div class="article-tool-row">
                <button type="button" class="flexi-track-btn" data-project-id="${proj.id}">
                  ◎ Audition Tone
                </button>
                <button
                  type="button"
                  class="bingo-circle-btn ${isCircled ? 'is-circled' : ''}"
                  data-service-no="${proj.readerServiceNo}"
                >
                  ${isCircled ? '✓ Circled #' + proj.readerServiceNo : '◯ Circle #' + proj.readerServiceNo}
                </button>
              </div>
            </div>
          </aside>
        </header>

        <div class="article-body-workbench">
          <!-- Editorial Prose & Architecture Column -->
          <div class="article-prose-column">
            <p class="article-lead-paragraph">${proj.editorialLead}</p>

            <blockquote class="editorial-pullquote">
              ${proj.pullQuote}
            </blockquote>

            <h3 class="arch-section-heading">SYSTEM ARCHITECTURE &amp; ENGINEERING NOTES</h3>
            <ul class="arch-bullet-list">
              ${proj.architecture.map((item) => `<li>${item}</li>`).join('')}
            </ul>

            <h3 class="arch-section-heading">VERIFIED BENCHMARK CAPABILITIES</h3>
            <div class="capabilities-tag-grid">
              ${proj.verifiedCapabilities.map((c) => `<div class="capability-box">${c}</div>`).join('')}
            </div>

            <div class="tech-stack-strip">
              ${proj.techStack.map((t) => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
          </div>

          <!-- Interactive 2D Lab Plate + Green-Bar Type-In Listing Column -->
          <div class="article-lab-column">
            <div class="interactive-lab-plate">
              <div class="lab-plate-header">
                <span class="lab-plate-badge">INTERACTIVE 2D BENCH · FIG. ${proj.index}.1</span>
                <span id="lab-status-${proj.id}">READY</span>
              </div>
              <canvas
                id="lab-canvas-${proj.id}"
                class="lab-canvas-stage"
                width="540"
                height="240"
                aria-label="Interactive 2D technical diagram for ${proj.title}"
              ></canvas>
              <div class="lab-controls-strip">
                <span>CLICK DIAGRAM OR BUTTON TO STEP SIMULATION STATE</span>
                <button type="button" id="lab-btn-${proj.id}" class="lab-action-btn">
                  Step Bench State ↻
                </button>
              </div>
            </div>

            <div class="tractor-listing-box">
              <div class="tractor-listing-header">
                <span>${proj.codeListingTitle}</span>
                <span>TRACTOR-FEED LISTING</span>
              </div>
              <pre class="tractor-code-pre"><code>${proj.codeListing.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
              <pre class="teletype-log-box">${proj.terminalStream.join('\n')}</pre>
            </div>
          </div>
        </div>
      `;

      spreadsContainer.appendChild(section);

      // Initialize the interactive 2D Canvas workbench for this spread
      const canvasEl = section.querySelector(`#lab-canvas-${proj.id}`);
      const statusEl = section.querySelector(`#lab-status-${proj.id}`);
      const stepBtn = section.querySelector(`#lab-btn-${proj.id}`);

      initArticleLabCanvas(proj, canvasEl, statusEl, stepBtn, () => {
        flexiSynth.playRelayClick(540 + proj.index * 35);
      });
    }

    // Bind Flexi-Disc track buttons inside articles
    document.querySelectorAll('.flexi-track-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const proj = getProjectById(btn.dataset.projectId);
        if (proj) {
          flexiSynth.playToneProgram(proj.flexiFreqs);
          updateFlexiHeaderButton();
        }
      });
    });

    // Bind Reader Service Circle buttons inside articles
    document.querySelectorAll('.bingo-circle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const no = Number(btn.dataset.serviceNo);
        sdk.toggleServiceNumber(no);
        flexiSynth.playRelayClick(820);
        syncReaderServiceUI();
      });
    });
  }

  // 3. Render & Synchronize Detachable Reader Service "Bingo" Card (Page 112)
  function syncReaderServiceUI() {
    const state = sdk.getState();
    const circledSet = new Set(state.circledServiceNos || []);

    // Update article spread buttons
    document.querySelectorAll('.bingo-circle-btn').forEach((btn) => {
      const no = Number(btn.dataset.serviceNo);
      const isCircled = circledSet.has(no);
      btn.classList.toggle('is-circled', isCircled);
      btn.textContent = isCircled ? `✓ Circled #${no}` : `◯ Circle #${no}`;
    });

    // Render 11-cell Reader Service Grid
    bingoNumbersGrid.innerHTML = '';
    for (const proj of USSY_PROJECTS) {
      const isCircled = circledSet.has(proj.readerServiceNo);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `bingo-num-cell ${isCircled ? 'is-circled' : ''}`;
      cell.innerHTML = `
        <span class="bingo-num-code">#${proj.readerServiceNo} ${isCircled ? '●' : '○'}</span>
        <span class="bingo-num-label">${proj.title}</span>
      `;
      cell.addEventListener('click', () => {
        sdk.toggleServiceNumber(proj.readerServiceNo);
        flexiSynth.playRelayClick(760);
        syncReaderServiceUI();
      });
      bingoNumbersGrid.appendChild(cell);
    }

    // Render Selected Repositories Summary
    const selectedProjects = USSY_PROJECTS.filter((p) => circledSet.has(p.readerServiceNo));
    if (selectedProjects.length === 0) {
      bingoSelectionSummary.innerHTML = `<em>No Reader Service numbers currently circled. Click any #101–#111 cell to queue source dispatches.</em>`;
    } else {
      bingoSelectionSummary.innerHTML =
        `<strong>QUEUED DISPATCHES (${selectedProjects.length} OF 11 CIRCLED):</strong><br/>` +
        selectedProjects
          .map(
            (p) =>
              `<a href="${p.repoUrl}" target="_blank" rel="noopener" style="color:var(--spot-ink);margin-right:0.75rem;">[#${p.readerServiceNo} ${p.title} ↗]</a>`
          )
          .join(' ');
    }

    // Render Recent Reader Dispatches
    const notes = state.readerNotes || [];
    bingoRecentDispatches.innerHTML = notes
      .slice(0, 4)
      .map((n) => `<div>✦ “${n.text}”</div>`)
      .join('');
  }

  // 4. Initialize Front Cover Interactive Vector Lithograph
  const coverCanvas = document.getElementById('cover-illustration-canvas');
  const coverReadout = document.getElementById('cover-probe-readout');
  initCoverIllustrationCanvas(coverCanvas, coverReadout, (projectId) => {
    const target = document.getElementById(`spread-${projectId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // 5. Paper Stock / Ink Mode Switcher
  document.querySelectorAll('.stock-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      withViewTransition(() => {
        document.documentElement.dataset.printMode = mode;
        document.querySelectorAll('.stock-btn').forEach((b) => {
          b.classList.toggle('is-active', b.dataset.mode === mode);
        });
      });
      sdk.setPrintMode(mode);
      flexiSynth.playRelayClick(620);
    });
  });

  // 6. Printer's Loupe Registration Grid Toggle
  const loupeBtn = document.getElementById('btn-loupe-toggle');
  loupeBtn.addEventListener('click', () => {
    const isOn = document.documentElement.dataset.loupe === 'on';
    const next = !isOn;
    document.documentElement.dataset.loupe = next ? 'on' : 'off';
    loupeBtn.setAttribute('aria-pressed', String(next));
    flexiSynth.playRelayClick(920);
  });

  // 7. Bound-in 33⅓ RPM Flexi-Disc Audio Controls
  const flexiToggleBtn = document.getElementById('btn-flexi-toggle');
  const flexiBtnLabel = document.getElementById('flexi-btn-label');

  function updateFlexiHeaderButton() {
    flexiToggleBtn.setAttribute('aria-pressed', String(flexiSynth.isPlaying));
    flexiBtnLabel.textContent = flexiSynth.isPlaying ? '33⅓ Spinning' : '33⅓ Flexi-Disc';
  }

  flexiToggleBtn.addEventListener('click', () => {
    flexiSynth.toggle();
    updateFlexiHeaderButton();
  });

  document.getElementById('btn-cover-audition').addEventListener('click', () => {
    flexiSynth.playToneProgram(USSY_PROJECTS[0].flexiFreqs);
    updateFlexiHeaderButton();
  });

  // 8. Reader Service Card Form & Circle-All Button
  document.getElementById('btn-circle-all').addEventListener('click', () => {
    sdk.circleAllServiceNumbers(USSY_PROJECTS.map((p) => p.readerServiceNo));
    flexiSynth.playToneProgram([261.63, 329.63, 392.00, 523.25]);
    updateFlexiHeaderButton();
    syncReaderServiceUI();
  });

  bingoNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = bingoReaderNote.value.trim();
    if (!val) return;
    sdk.addReaderNote(val);
    bingoReaderNote.value = '';
    flexiSynth.playRelayClick(880);
    syncReaderServiceUI();
  });

  // 9. IntersectionObserver to Update Running Folio Header & Active Page Tab on Scroll
  function setupSpreadScrollObserver() {
    const sections = document.querySelectorAll('.magazine-spread');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const label = entry.target.dataset.sectionLabel;
            if (label && runningSectionLabel) {
              runningSectionLabel.textContent = label;
            }
            const projId = entry.target.dataset.projectId;
            document.querySelectorAll('.folio-tab[data-spread-id]').forEach((tab) => {
              tab.classList.toggle('is-active', tab.dataset.spreadId === projId);
            });
          }
        }
      },
      { threshold: 0.25 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  renderNavigationAndToc();
  renderAllArticleSpreads();
  syncReaderServiceUI();
  setupSpreadScrollObserver();
});
