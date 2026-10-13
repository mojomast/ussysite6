/** The Source Room: a source shelf and portable, persistent reading list. */
import { getIssueEntry, formatFolio } from './issue-map.js';

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shortTitle = (project) => project.title.split(' // ')[0];

export function initSourceRoom(host, projects, sdk, onAction = () => {}) {
  const shelf = host.querySelector('#source-projects');
  const queue = host.querySelector('#source-queue');
  const count = host.querySelector('#source-saved-count');
  const copyButton = host.querySelector('#source-copy');
  const clearButton = host.querySelector('#source-clear');
  const status = host.querySelector('#source-action-status');
  const fallback = host.querySelector('#source-export-fallback');
  const exportText = host.querySelector('#source-export-text');
  const noteInput = host.querySelector('#source-note');
  const notes = host.querySelector('#source-notes');
  const announce = (text) => { status.textContent = text; };
  const selection = () => {
    const saved = new Set(sdk.getState().circledServiceNos);
    return projects.filter((project) => saved.has(project.readerServiceNo));
  };

  // Create controls once so toggling a project preserves keyboard focus.
  shelf.innerHTML = projects.map((project) => {
    const folio = formatFolio(getIssueEntry(projects, project.id));
    return `<li class="source-project" data-source-id="${project.id}" style="--source-accent:${project.spotInkHex}">
      <div class="source-project-meta"><a href="#spread-${project.id}">FOLIO ${folio} ↗</a><span>${escapeHtml(project.category.split(' / ')[0])}</span></div>
      <h4><a href="${project.repoUrl}" target="_blank" rel="noopener">${escapeHtml(shortTitle(project))}<span aria-hidden="true">↗</span></a></h4>
      <p>${escapeHtml(project.techStack.slice(0, 2).join(' / '))}</p>
      <div class="source-project-actions">
        <a href="${project.repoUrl}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(shortTitle(project))} repository">Open repository ↗</a>
        <button type="button" data-source-save="${project.readerServiceNo}" aria-label="Save ${escapeHtml(shortTitle(project))} to your reading list" aria-pressed="false">+ Save</button>
      </div>
    </li>`;
  }).join('') + `<li class="source-project source-project--more"><span class="source-more-mark" aria-hidden="true">Si.</span><h4>Still curious?</h4><p>There’s more on the workbench.</p><a href="https://github.com/mojomast" target="_blank" rel="noopener">SLOPTIMUS PRIME on GitHub ↗</a></li>`;

  shelf.addEventListener('click', (event) => {
    const button = event.target.closest('[data-source-save]');
    if (!button) return;
    const number = Number(button.dataset.sourceSave);
    const project = projects.find((item) => item.readerServiceNo === number);
    const saved = sdk.toggleServiceNumber(number);
    announce(`${shortTitle(project)} ${saved ? 'added to' : 'removed from'} your reading list.`);
    onAction();
  });

  function sync() {
    const selected = selection();
    const saved = new Set(selected.map((project) => project.readerServiceNo));
    shelf.querySelectorAll('[data-source-save]').forEach((button) => {
      const active = saved.has(Number(button.dataset.sourceSave));
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '✓ Saved' : '+ Save';
      button.closest('.source-project').classList.toggle('is-saved', active);
    });
    count.innerHTML = `${String(selected.length).padStart(2, '0')}<span> / ${projects.length}</span>`;
    queue.innerHTML = selected.length
      ? `<ol>${selected.map((project) => `<li><span>${formatFolio(getIssueEntry(projects, project.id))}</span><a href="${project.repoUrl}" target="_blank" rel="noopener">${escapeHtml(shortTitle(project))} ↗</a></li>`).join('')}</ol>`
      : '<p class="source-empty"><strong>Follow your curiosity.</strong>Save a project from the shelf or from any feature. Your next reading session starts here.</p>';
    copyButton.disabled = clearButton.disabled = selected.length === 0;
    host.querySelector('#source-save-all').disabled = selected.length === projects.length;
    notes.innerHTML = sdk.getState().readerNotes.slice(0, 4).map((note) => `<li>${escapeHtml(note.text)}</li>`).join('');
    // Do not leave an out-of-date export visible after changing the selection.
    fallback.hidden = true;
    exportText.value = '';
    announce('');
  }

  host.querySelector('#source-save-all').addEventListener('click', () => {
    sdk.circleAllServiceNumbers(projects.map((project) => project.readerServiceNo));
    copyButton.focus({ preventScroll: true });
    announce(`All ${projects.length} projects saved.`);
    onAction();
  });
  clearButton.addEventListener('click', () => {
    sdk.circleAllServiceNumbers([]);
    // Clear becomes disabled; keep keyboard focus on an available action.
    host.querySelector('#source-save-all').focus({ preventScroll: true });
    announce('Reading list cleared.');
    onAction();
  });
  copyButton.addEventListener('click', async () => {
    const selected = selection();
    if (!selected.length) return;
    const markdown = `# SLOP ILLUSTRATED — Issue 01\n\nMy repository reading list\n\n${selected.map((project) => `- [${shortTitle(project)}](${project.repoUrl}) — Folio ${formatFolio(getIssueEntry(projects, project.id))}`).join('\n')}\n`;
    try {
      await navigator.clipboard.writeText(markdown);
      announce(`${selected.length} repository ${selected.length === 1 ? 'link' : 'links'} copied as Markdown.`);
    } catch {
      fallback.hidden = false;
      exportText.value = markdown;
      exportText.focus();
      exportText.select();
      announce('Your list is ready below. Copy the selected text.');
    }
  });
  host.querySelector('#source-note-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!sdk.addReaderNote(noteInput.value)) return;
    noteInput.value = '';
    announce('Reading note saved.');
    onAction();
  });

  sdk.subscribe(sync);
  sync();
}
