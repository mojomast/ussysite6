/** Reader utilities: project search, media tabs, image viewing and save feedback. */
import { formatFolio, getIssueEntry } from './issue-map.js';

const shortTitle = (project) => project.title.split(' // ')[0];

export function initReaderUI(projects, sdk) {
  const header = document.querySelector('.press-running-header');
  const measureHeader = () => document.documentElement.style.setProperty('--reader-header-height', `${header.getBoundingClientRect().height}px`);
  measureHeader();
  if (typeof ResizeObserver === 'function') new ResizeObserver(measureHeader).observe(header);
  const finder = document.getElementById('project-finder');
  const query = document.getElementById('project-query');
  const results = document.getElementById('project-results');
  const savedFilter = document.getElementById('finder-saved');
  const resultCount = document.getElementById('finder-result-count');
  let savedOnly = false;

  // Native dialogs provide focus containment, Escape dismissal and focus return.
  document.querySelectorAll('.reader-dialog').forEach((dialog) => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });

  function filterProjects() {
    const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const saved = new Set(sdk.getState().circledServiceNos);
    const matches = projects.filter((project) => {
      const haystack = [project.title, project.headline, project.deck, project.category, ...project.techStack].join(' ').toLowerCase();
      return (!savedOnly || saved.has(project.readerServiceNo)) && terms.every((term) => haystack.includes(term));
    });
    results.replaceChildren(...matches.map((project) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#spread-${project.id}`;
      const folio = document.createElement('span');
      folio.className = 'finder-folio';
      folio.textContent = formatFolio(getIssueEntry(projects, project.id));
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = shortTitle(project);
      const description = document.createElement('small');
      description.textContent = project.headline;
      copy.append(title, description);
      const mark = document.createElement('span');
      mark.textContent = saved.has(project.readerServiceNo) ? '✓' : '↗';
      mark.setAttribute('aria-hidden', 'true');
      link.append(folio, copy, mark);
      item.append(link);
      return item;
    }));
    resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'project' : 'projects'}`;
    document.getElementById('finder-empty').hidden = matches.length > 0;
  }

  function openFinder() {
    if (document.querySelector('dialog[open]')) return;
    filterProjects();
    finder.showModal();
    query.focus();
    query.select();
  }
  document.getElementById('btn-find-project').addEventListener('click', openFinder);
  query.addEventListener('input', filterProjects);
  savedFilter.addEventListener('click', () => {
    savedOnly = !savedOnly;
    savedFilter.setAttribute('aria-pressed', String(savedOnly));
    filterProjects();
  });
  finder.addEventListener('keydown', (event) => {
    const links = [...results.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp'].includes(event.key) && (index >= 0 || event.target === query)) {
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? (index + 1) % links.length : index <= 0 ? links.length - 1 : index - 1;
      links[next]?.focus();
    } else if (event.key === 'Enter' && event.target === query && links.length) {
      event.preventDefault();
      links[0].click();
    }
  });
  finder.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    finder.close();
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    const editing = event.target.closest('input, textarea, select, [contenteditable="true"]');
    if (event.isComposing || editing || document.querySelector('dialog[open]')) return;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openFinder();
    }
  });
  sdk.subscribe(() => { if (finder.open) filterProjects(); });

  document.querySelectorAll('.article-media').forEach((media) => {
    const tabs = [...media.querySelectorAll('[role="tab"]')];
    const activate = (tab) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(tabs[next]);
        tabs[next].focus();
      });
    });
  });

  const viewer = document.getElementById('image-viewer');
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.screenshot-image-link, .render-image-link');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const image = link.querySelector('img');
    if (!image) return;
    event.preventDefault();
    const figure = link.closest('figure');
    const title = figure.querySelector('.editorial-plate-title')?.textContent || figure.closest('article')?.querySelector('.article-project-name')?.textContent || 'Project image';
    document.getElementById('image-viewer-title').textContent = title;
    document.getElementById('image-viewer-caption').textContent = image.alt;
    const enlarged = document.getElementById('image-viewer-image');
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt;
    document.getElementById('image-viewer-original').href = link.href;
    viewer.showModal();
  });

  const options = document.querySelector('.reader-options');
  document.addEventListener('click', (event) => {
    if (!options.contains(event.target)) options.open = false;
  });
  options.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && options.open) {
      event.preventDefault();
      options.open = false;
      options.querySelector('summary').focus();
    }
  });

  const feedback = document.getElementById('reader-feedback');
  let feedbackTimer;
  let previousSelection = new Set(sdk.getState().circledServiceNos);
  const dismiss = () => { feedback.hidden = true; clearTimeout(feedbackTimer); };
  feedback.querySelector('button').addEventListener('click', dismiss);
  feedback.querySelector('a').addEventListener('click', dismiss);
  sdk.subscribe((state) => {
    const next = new Set(state.circledServiceNos);
    const changed = projects.filter((project) => next.has(project.readerServiceNo) !== previousSelection.has(project.readerServiceNo));
    previousSelection = next;
    if (changed.length !== 1 || !document.activeElement?.closest('.project-save-btn')) return;
    const project = changed[0];
    document.getElementById('reader-feedback-text').textContent = `${shortTitle(project)} ${next.has(project.readerServiceNo) ? 'saved' : 'removed'}.`;
    feedback.hidden = false;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { if (!feedback.contains(document.activeElement)) dismiss(); }, 6000);
  });

  // Keep the full article printable, including inactive media and disclosures.
  let closedDetails = [];
  window.addEventListener('beforeprint', () => {
    closedDetails = [...document.querySelectorAll('.article-deep-dive:not([open])')];
    closedDetails.forEach((details) => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    closedDetails.forEach((details) => { details.open = false; });
    closedDetails = [];
  });

  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
}
