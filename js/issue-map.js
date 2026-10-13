/**
 * SLOP ILLUSTRATED (Si.) // js/issue-map.js
 * CANONICAL LOGICAL DIGITAL-FOLIO NUMBERING
 *
 * The issue is a living, responsive scrolling website — not a fixed press run.
 * It has no meaningful physical page count and no fixed page ranges, so claims
 * such as "112 pages" or "pp. 08–17" are not honest on the web. What the issue
 * *does* have is a stable, ordered set of **folios**: one navigable spread per
 * folio, numbered in reading order. Every running head, table-of-contents row,
 * spread footer, cover plate and next/back link can point at the same canonical
 * number.
 *
 * Folios are derived entirely from the catalog argument, so adding, removing or
 * reordering features renumbers the issue correctly with no hard-coded totals:
 *
 *   folio 01   cover            #issue-cover
 *   folio 02   contents         #toc-spread
 *   folio 03…  features         #spread-<project.id>   (one per project, in order)
 *   last folio reader-service   #reader-service-spread
 *
 * With the eleven current projects that is cover 01, contents 02, features
 * 03–13, and reader-service 14 — fourteen logical folios. The number is never
 * written down here; it is `projects.length + 3`.
 *
 * This module is pure ESM: no DOM, no network, no side effects. It is safe to
 * import from the browser, from `server.mjs` and from tests.
 */

/** Entry kinds. Useful for filtering/switching in nav, TOC and footers. */
export const FOLIO_KIND = Object.freeze({
  COVER: 'cover',
  CONTENTS: 'contents',
  FEATURE: 'feature',
  READER_SERVICE: 'reader-service'
});

/** Fixed DOM ids already used by `index.html` / `js/app.js`. */
export const COVER_ID = 'issue-cover';
export const CONTENTS_ID = 'toc-spread';
export const READER_SERVICE_ID = 'reader-service-spread';

/** DOM id of a feature spread, matching `section.id = \`spread-${project.id}\``. */
export function featureId(projectId) {
  return `spread-${projectId}`;
}

/**
 * Build the ordered issue map for a project catalog.
 *
 * @param {Array<{id: string, title?: string}>} projects Feature catalog, in reading order.
 * @returns {Array<{id: string, href: string, folio: number, label: string, kind: string, projectId?: string}>}
 */
export function buildIssueMap(projects) {
  const list = Array.isArray(projects) ? projects : [];
  const entries = [];
  const seen = new Set();
  let folio = 0;

  // Accept an entry only once; a duplicate id would produce an ambiguous anchor.
  const add = (id, href, label, kind, projectId) => {
    if (seen.has(id)) return;
    seen.add(id);
    entries.push(projectId ? { id, href, folio: ++folio, label, kind, projectId } : { id, href, folio: ++folio, label, kind });
  };

  add(COVER_ID, `#${COVER_ID}`, 'Front Cover', FOLIO_KIND.COVER);
  add(CONTENTS_ID, `#${CONTENTS_ID}`, 'Contents', FOLIO_KIND.CONTENTS);

  for (const project of list) {
    const projectId = project && project.id;
    if (typeof projectId !== 'string' || projectId.length === 0) continue;
    add(featureId(projectId), `#${featureId(projectId)}`, project.title || projectId, FOLIO_KIND.FEATURE, projectId);
  }

  add(READER_SERVICE_ID, `#${READER_SERVICE_ID}`, 'The Source Room', FOLIO_KIND.READER_SERVICE);

  return entries;
}

/** Total logical folios in an issue (cover + contents + features + reader service). */
export function totalFolios(projects) {
  return buildIssueMap(projects).length;
}

/**
 * Zero-padded folio label, e.g. `formatFolio(3) === '03'`.
 * Accepts a folio number or an entry object.
 */
export function formatFolio(folioOrEntry, pad = 2) {
  const value = folioOrEntry && typeof folioOrEntry === 'object' ? folioOrEntry.folio : folioOrEntry;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return '';
  return String(Math.trunc(n)).padStart(pad, '0');
}

/**
 * Look up a single entry by DOM id (`spread-jammate`) or project id (`jammate`).
 * @returns {{id: string, href: string, folio: number, label: string, kind: string, projectId?: string}|null}
 */
export function getIssueEntry(projects, key) {
  if (!key) return null;
  const wanted = String(key);
  return (
    buildIssueMap(projects).find((entry) => entry.id === wanted || entry.projectId === wanted) || null
  );
}

/**
 * Collision check for verification scripts. Returns the ids that would repeat,
 * so an author can fix the catalog before it ships. Empty array === healthy.
 */
export function findDuplicateIssueIds(projects) {
  const list = Array.isArray(projects) ? projects : [];
  const counts = new Map();
  const bump = (id) => counts.set(id, (counts.get(id) || 0) + 1);

  bump(COVER_ID);
  bump(CONTENTS_ID);
  bump(READER_SERVICE_ID);
  for (const project of list) {
    const projectId = project && project.id;
    if (typeof projectId !== 'string' || projectId.length === 0) continue;
    bump(featureId(projectId));
  }

  return [...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id);
}
