/**
 * USSYSITE6 // SLOP ILLUSTRATED (Si.) — ISSUE 01
 * MASTER EDITORIAL LAYOUT, SCROLL OBSERVER, SOURCE ROOM & INTERACTIVE CONTROLLER
 */

import { MAGAZINE_ISSUE_META, USSY_PROJECTS, getProjectById } from './projects.js';
import { initArticleStudy } from './article-studies.js';
import { initCoverPlate } from './cover-plate.js';
import { initSourceRoom } from './source-room.js';
import { initReaderUI } from './reader-ui.js';
import { initPageReader } from './page-reader.js';
import { mountPlate, toRoman } from './plates/index.js';
import { FlexiDiscSynth } from './flexidisc-audio.js';
import { PressSDK } from './press-sdk.js';
import { buildIssueMap, formatFolio } from './issue-map.js';

const issueMap = buildIssueMap(USSY_PROJECTS);
const issueEntries = new Map(issueMap.map((entry) => [entry.id, entry]));
const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Art-directed phrase breaks; the catalog remains the source of headline copy.
const headlineAccents = {
  orbitdesktop: 'the Agent Can Reshape',
  velvetrp: 'The Server Decides.',
  jammate: 'Listens for the Downbeat',
  cocs: 'a 60 Hz Heartbeat',
  'cocs-godot': 'A Native Godot Client.',
  routetok: 'When to Switch',
  rgbagentflightindicator: 'an Agent Status Board',
  mothbake: 'Leaves a Trail',
  warpi: 'Your Model.',
  hermesdashboard: 'of the Agent Fleet',
  becomussy: 'Carries Forward',
};

function typesetHeadline(project) {
  const accent = headlineAccents[project.id];
  if (!accent || !project.headline.endsWith(accent)) return escapeHtml(project.headline);
  return `<span class="headline-opening">${escapeHtml(project.headline.slice(0, -accent.length).trim())}</span> <em class="headline-accent">${escapeHtml(accent)}</em>`;
}

function withViewTransition(fn) {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => fn());
  } else {
    fn();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let pageReader;
  const sdk = new PressSDK();
  window.PressSDK = sdk;
  window.AnomalySDK = sdk;

  function applyPrintMode(mode) {
    document.documentElement.dataset.printMode = mode;
    document.querySelectorAll('.stock-btn').forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  const savedMode = sdk.getState().printMode;
  applyPrintMode(MAGAZINE_ISSUE_META.printModes.some((mode) => mode.id === savedMode) ? savedMode : 'darkroom');

  const flexiSynth = new FlexiDiscSynth();

  const runningSectionLabel = document.getElementById('running-section-label');
  const folioPageTabs = document.getElementById('folio-page-tabs');
  const tocArticleList = document.getElementById('toc-article-list');
  const spreadsContainer = document.getElementById('editorial-spreads-container');

  // 1. Render Top Running Header Page Tabs & Table of Contents Index
  function renderNavigationAndToc() {
    folioPageTabs.innerHTML = '';
    tocArticleList.innerHTML = '';
    for (const entry of issueMap) {
      const section = document.getElementById(entry.id);
      if (section) section.dataset.sectionLabel = `FOLIO ${formatFolio(entry)} / ${entry.label.toUpperCase()}`;
    }
    document.querySelectorAll('[data-issue-count]').forEach((el) => { el.textContent = issueMap.length; });
    document.querySelectorAll('[data-issue-folio], [data-issue-number]').forEach((el) => {
      const entry = issueEntries.get(el.dataset.issueFolio || el.dataset.issueNumber);
      if (entry) el.textContent = `${el.hasAttribute('data-issue-folio') ? 'FOLIO ' : ''}${formatFolio(entry)}`;
    });

    for (const proj of USSY_PROJECTS) {
      const entry = issueEntries.get(`spread-${proj.id}`);
      // Top Folio Tab
      const tab = document.createElement('a');
      tab.href = `#spread-${proj.id}`;
      tab.className = 'folio-tab';
      tab.dataset.spreadId = proj.id;
      tab.textContent = formatFolio(entry);
      tab.title = `${proj.title} (Folio ${formatFolio(entry)})`;
      tab.setAttribute('aria-label', `${proj.title.split(' // ')[0]}, folio ${formatFolio(entry)}`);
      folioPageTabs.appendChild(tab);

      // Table of Contents Entry
      const li = document.createElement('li');
      li.className = 'toc-entry';
      li.innerHTML = `
        <a href="#spread-${proj.id}">
          <span class="toc-entry-pages" aria-label="Folio ${formatFolio(entry)}">${formatFolio(entry)}</span>
          <div>
            <strong class="toc-entry-title">${proj.title}</strong>
            <span class="toc-entry-sub">${proj.headline}</span>
          </div>
          <span class="toc-entry-service">${String(proj.index).padStart(2, '0')} / FEATURE</span>
        </a>
      `;
      tocArticleList.appendChild(li);
    }
    const featured = ['orbitdesktop', 'jammate', 'warpi', 'becomussy'];
    document.getElementById('cover-story-list').innerHTML = featured.map((id) => {
      const project = getProjectById(id);
      const entry = issueEntries.get(`spread-${id}`);
      return `<li><a href="${entry.href}"><span class="cover-page-num">FOLIO ${formatFolio(entry)}</span><strong>${escapeHtml(project.title)}</strong><em>${escapeHtml(project.headline)}</em></a></li>`;
    }).join('');
    document.getElementById('cover-departments').innerHTML = USSY_PROJECTS.filter((p) => !featured.includes(p.id)).map((project) => {
      const entry = issueEntries.get(`spread-${project.id}`);
      const title = project.id === 'rgbagentflightindicator' ? 'RGB Flight Indicator' : project.title.split(' // ')[0];
      return `<div><dt>${formatFolio(entry)}</dt><dd><a href="${entry.href}">${escapeHtml(title)}</a></dd></div>`;
    }).join('');
  }

  // 2. Render All 11 Bespoke Magazine Spreads
  function renderAllArticleSpreads() {
    spreadsContainer.innerHTML = '';
    const circledSet = new Set(sdk.getState().circledServiceNos || []);

    for (const proj of USSY_PROJECTS) {
      const isCircled = circledSet.has(proj.readerServiceNo);
      const entry = issueEntries.get(`spread-${proj.id}`);
      const section = document.createElement('article');
      section.id = `spread-${proj.id}`;
      section.className = `magazine-spread article-spread spread--${proj.spreadType}`;
      section.dataset.projectId = proj.id;
      section.dataset.sectionLabel = `FOLIO ${formatFolio(entry)} / ${proj.title.split(' // ')[0]}`;
      section.style.setProperty('--article-spot', proj.spotInkHex);
      const nextProject = USSY_PROJECTS[proj.index];
      const previousProject = USSY_PROJECTS[proj.index - 2];
      const codeStart = Number(proj.codeSource?.url.match(/#L(\d+)/)?.[1] || 1);

      section.innerHTML = `
        <div class="crop-mark crop-tl" aria-hidden="true"></div>
        <div class="crop-mark crop-tr" aria-hidden="true"></div>
        <div class="crop-mark crop-bl" aria-hidden="true"></div>
        <div class="crop-mark crop-br" aria-hidden="true"></div>

        <div class="spread-folio-header">
          <span>${proj.issueSection}</span>
          <span>SLOP ILLUSTRATED · ISSUE 01</span>
          <span>FOLIO ${formatFolio(entry)} · PROJECT #${proj.readerServiceNo}</span>
        </div>

        <header class="article-header-deck">
          <div class="article-headline-col">
            <div class="article-kicker-row">
              <span class="article-kicker-badge">${proj.kicker}</span>
              <span class="article-category-tag">${proj.category}</span>
            </div>
            <h2 class="article-main-headline"><span class="article-project-name">${proj.title}</span><span class="headline-copy">${typesetHeadline(proj)}</span></h2>
            <p class="article-standfirst-deck">${proj.deck}</p>
            <div class="article-byline-strip">
              <span>By SLOPTIMUS PRIME</span>
              <a href="#sources-${proj.id}" class="article-reference-link">Sources ↓</a>
            </div>
          </div>

          <aside class="article-spec-card" aria-label="${proj.title} project facts">
            <div class="spec-card-top">
              <span>At a glance</span>
              <span>#${proj.readerServiceNo}</span>
            </div>
            <p class="spec-context-note">${escapeHtml(proj.glanceNote)}</p>
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
                <span>Open repository</span>
                <span aria-hidden="true">↗</span>
              </a>
              ${
                proj.liveUrl
                  ? `<a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="live-arena-link">
                      <span>Play at arena.ussyco.de</span>
                      <span aria-hidden="true">⚡</span>
                    </a>`
                  : ''
              }
              <div class="article-tool-row">
                <button type="button" class="flexi-track-btn" data-project-id="${proj.id}">
                  ◎ Play sound
                </button>
                <button
                  type="button"
                  class="project-save-btn ${isCircled ? 'is-saved' : ''}"
                  data-service-no="${proj.readerServiceNo}"
                  aria-pressed="${isCircled}"
                  aria-label="Save ${escapeHtml(proj.title)} to your reading list"
                >
                  ${isCircled ? '✓ Saved' : '+ Save project'}
                </button>
              </div>
            </div>
          </aside>
        </header>

        <div class="article-body-workbench">
          <!-- Editorial Prose & Architecture Column -->
          <div class="article-prose-column">
            <p class="article-lead-paragraph">${proj.editorialLead}</p>

            <aside class="editorial-pullquote" aria-label="Editorial takeaway">
              <span class="takeaway-label">THE TAKE</span>
              <span class="takeaway-copy">${proj.pullQuote}</span>
            </aside>

            <h3 class="arch-section-heading">Inside the project</h3>
            <div class="capabilities-tag-grid">
              ${proj.verifiedCapabilities.map((c) => `<div class="capability-box">${c}</div>`).join('')}
            </div>

            <div class="tech-stack-strip">
              ${proj.techStack.map((t) => `<span class="tech-badge">${t}</span>`).join('')}
            </div>

          </div>

          <!-- Illustrated still life + screenshot or SVG study + source listing -->
          <div class="article-lab-column article-media">
            <div class="media-tabs" role="tablist" aria-label="${escapeHtml(proj.title)} images">
              <button type="button" role="tab" id="tab-art-${proj.id}" aria-controls="media-art-${proj.id}" aria-selected="true">Artwork</button>
              <button type="button" role="tab" id="tab-project-${proj.id}" aria-controls="media-project-${proj.id}" aria-selected="false" tabindex="-1">${proj.screenshot ? 'Screenshot' : 'Interactive study'}</button>
            </div>
            <div class="media-panel" id="media-art-${proj.id}" role="tabpanel" aria-labelledby="tab-art-${proj.id}" tabindex="0">
            <figure class="editorial-plate" data-plate="${proj.id}">
              <div class="editorial-plate-art" aria-hidden="false">
                <span class="editorial-plate-placeholder">PLATE ${toRoman(proj.index + 2)} · PLATE IN PRESS…</span>
              </div>
              <figcaption class="editorial-plate-caption">
                <span>PLATE ${toRoman(proj.index + 2)} — <em class="editorial-plate-title">${proj.title}</em></span>
                <span>FIG. ${proj.index}.1 · <span class="editorial-plate-medium">CONCEPTUAL ILLUSTRATION</span></span>
              </figcaption>
            </figure>
            </div>
            <div class="media-panel" id="media-project-${proj.id}" role="tabpanel" aria-labelledby="tab-project-${proj.id}" tabindex="0" hidden>

            ${
              proj.screenshot
                ? `<figure class="article-screenshot-plate">
              <div class="lab-plate-header">
                <span class="lab-plate-badge">ON SCREEN · FIG. ${proj.index}.2</span>
                <span>PROJECT CAPTURE</span>
              </div>
              <a class="screenshot-image-link" href="${proj.screenshot}" target="_blank" rel="noopener" aria-haspopup="dialog" aria-label="Enlarge ${proj.title} screenshot">
              <img
                class="article-screenshot-img"
                src="${proj.screenshot}"
                ${proj.screenshotWidth && proj.screenshotHeight ? `width="${proj.screenshotWidth}" height="${proj.screenshotHeight}"` : ''}
                alt="${escapeHtml(proj.title)} — ${escapeHtml(proj.screenshotCaption || 'screenshot')}"
                loading="lazy"
                decoding="async"
              />
              </a>
              <figcaption class="lab-controls-strip">
                <span>${proj.screenshotCaption || ''}</span>
                <a href="${proj.screenshot}" target="_blank" rel="noopener">View full size ↗</a>
              </figcaption>
            </figure>`
                : `<div class="interactive-lab-plate">
              <div class="lab-plate-header">
                <span class="lab-plate-badge">INTERACTIVE STUDY · FIG. ${proj.index}.2</span>
                <span id="lab-status-${proj.id}">READY</span>
              </div>
              <div
                id="lab-study-${proj.id}"
                class="article-study-stage"
                aria-label="Interactive SVG study for ${escapeHtml(proj.title)}"
              ></div>
              <div class="lab-controls-strip">
                <span>CONCEPTUAL · NOT LIVE DATA</span>
                <button type="button" id="lab-btn-${proj.id}" class="lab-action-btn">
                  Next state ↻
                </button>
              </div>
            </div>`
            }

            </div>
          </div>
        </div>

        <details class="article-deep-dive">
          <summary aria-controls="technical-${proj.id}">
            <span class="deep-dive-copy"><strong>Under the hood</strong><span class="deep-dive-description">Engineering, notes &amp; source code</span></span>
            <span class="deep-dive-action" aria-hidden="true"><span data-deep-dive-label>Explore</span><span class="deep-dive-icon">+</span></span>
          </summary>
          <div id="technical-${proj.id}" class="article-technical-grid">
            <div class="article-technical-prose">
              <p class="article-body-para">${proj.bodyCopy}</p>
              <h3 class="arch-section-heading">Architecture</h3>
              <ul class="arch-bullet-list">${proj.architecture.map((item) => `<li>${item}</li>`).join('')}</ul>
              <aside class="article-field-notes" aria-label="Project notes">
                <h3 class="field-notes-heading">The notebook</h3>
                <ul>${(proj.fieldNotes || []).map((note) => `<li>${note}</li>`).join('')}</ul>
              </aside>
            </div>
            <div class="tractor-listing-box">
              <div class="tractor-listing-header">
                <span>${proj.codeListingTitle}</span>
                <span>${proj.codeSource ? 'REPOSITORY EXCERPT' : 'ILLUSTRATIVE EXAMPLE'}</span>
              </div>
              <pre class="tractor-code-pre"><code>${escapeHtml(proj.codeListing).split('\n').map((line, i) => `<span class="listing-line" data-line="${String(codeStart + i).padStart(2, '0')}">${line || ' '}</span>`).join('')}</code></pre>
              ${proj.codeSource ? `<a class="code-source-link" href="${escapeHtml(proj.codeSource.url)}" target="_blank" rel="noopener">${escapeHtml(proj.codeSource.label)} ↗</a>` : ''}
              <div class="reading-guide"><h4>READING NOTES</h4><ul>${proj.terminalStream.map((line) => `<li>${escapeHtml(line.replace(/^READING GUIDE\s*(?:\/\/|:)?\s*/, ''))}</li>`).join('')}</ul></div>
            </div>
          </div>
        </details>
        ${proj.sources?.length ? `<aside class="article-sources" id="sources-${proj.id}" aria-label="Repository references for ${proj.title}">
          <div class="article-sources-header">
            <h3>Sources</h3>
            <p>Reviewed ${escapeHtml(proj.researchedAt)} · revision <code>${escapeHtml(proj.sourceRevision.slice(0, 8))}</code></p>
          </div>
          <ul>${proj.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)} ↗</a></li>`).join('')}</ul>
        </aside>` : ''}
        <footer class="spread-folio-footer">
          <span class="folio-page">${formatFolio(entry)}</span>
          <span class="folio-imprint"><b>Si.</b> <i>Slop Illustrated</i> / October 2026</span>
          <nav class="article-page-links" aria-label="Feature navigation">
            <a href="${previousProject ? '#spread-' + previousProject.id : '#toc-spread'}" aria-label="Previous: ${escapeHtml(previousProject?.title || 'Contents')}">← Previous</a>
            <a class="folio-next" href="${nextProject ? '#spread-' + nextProject.id : '#reader-service-spread'}">${nextProject ? 'Next / ' + nextProject.title.split(' // ')[0] : 'Source Room'} ↗</a>
          </nav>
        </footer>
      `;

      spreadsContainer.appendChild(section);

      // Lazily mount the editorial SVG or Blender still life for this spread.
      mountPlate(section.querySelector('.editorial-plate'), proj.id, proj);

      // Mount the native-vector study where the feature has no screenshot.
      const studyEl = section.querySelector(`#lab-study-${proj.id}`);
      const statusEl = section.querySelector(`#lab-status-${proj.id}`);
      const stepBtn = section.querySelector(`#lab-btn-${proj.id}`);

      if (studyEl) {
        initArticleStudy(proj, studyEl, statusEl, stepBtn, () => {
          flexiSynth.playRelayClick(540 + proj.index * 35);
        });
      }
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

    // Save directly from a feature to the Source Room reading list.
    document.querySelectorAll('.project-save-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const no = Number(btn.dataset.serviceNo);
        sdk.toggleServiceNumber(no);
        flexiSynth.playRelayClick(820);
      });
    });
  }

  // 3. Keep feature save controls synchronized with the Source Room.
  function syncProjectSaveButtons() {
    const state = sdk.getState();
    const circledSet = new Set(state.circledServiceNos || []);

    // Update article spread buttons
    document.querySelectorAll('.project-save-btn').forEach((btn) => {
      const no = Number(btn.dataset.serviceNo);
      const isCircled = circledSet.has(no);
      btn.classList.toggle('is-saved', isCircled);
      btn.setAttribute('aria-pressed', String(isCircled));
      btn.textContent = isCircled ? '✓ Saved' : '+ Save project';
    });
  }

  // 4. Initialize Front Cover Interactive SVG Lithograph (Plate I) + TOC Plate II
  const coverHost = document.getElementById('cover-illustration');
  const coverReadout = document.getElementById('cover-probe-readout');
  initCoverPlate(coverHost, coverReadout, (projectId) => {
    const target = document.getElementById(`spread-${projectId}`);
    if (target) {
      if (pageReader?.active) pageReader.goTo(target.id, { target, focus: true });
      else target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  });
  mountPlate(document.getElementById('toc-plate'), 'toc', MAGAZINE_ISSUE_META);

  // 5. Paper Stock / Ink Mode Switcher
  document.querySelectorAll('.stock-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      withViewTransition(() => applyPrintMode(mode));
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
    flexiBtnLabel.textContent = flexiSynth.isPlaying ? 'Stop sound' : 'Play sound';
  }

  flexiToggleBtn.addEventListener('click', () => {
    flexiSynth.toggle();
    updateFlexiHeaderButton();
  });

  document.getElementById('btn-cover-audition').addEventListener('click', () => {
    flexiSynth.playToneProgram(USSY_PROJECTS[0].flexiFreqs);
    updateFlexiHeaderButton();
  });

  // 9. IntersectionObserver to Update Running Folio Header & Active Page Tab on Scroll
  function updateRunningFolio(section) {
    if (section.dataset.sectionLabel && runningSectionLabel) runningSectionLabel.textContent = section.dataset.sectionLabel;
    document.querySelectorAll('.folio-tab').forEach((tab) => {
      const active = tab.getAttribute('href') === `#${section.id}`;
      tab.classList.toggle('is-active', active);
      if (active) {
        tab.setAttribute('aria-current', 'location');
        const strip = tab.closest('.running-spread-strip');
        const bounds = tab.getBoundingClientRect();
        const stripBounds = strip.getBoundingClientRect();
        if (bounds.left < stripBounds.left || bounds.right > stripBounds.right) {
          strip.scrollLeft += bounds.left - stripBounds.left - (strip.clientWidth - bounds.width) / 2;
        }
      } else tab.removeAttribute('aria-current');
    });
  }

  function setupSpreadScrollObserver() {
    const sections = document.querySelectorAll('.magazine-spread');
    const observer = new IntersectionObserver(
      (entries) => {
        if (pageReader?.active) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            updateRunningFolio(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  renderNavigationAndToc();
  renderAllArticleSpreads();
  initSourceRoom(document.getElementById('reader-service-spread'), USSY_PROJECTS, sdk, () => flexiSynth.playRelayClick(760));
  initReaderUI(USSY_PROJECTS, sdk);
  pageReader = initPageReader(updateRunningFolio);
  sdk.subscribe(syncProjectSaveButtons);
  syncProjectSaveButtons();
  setupSpreadScrollObserver();
});
