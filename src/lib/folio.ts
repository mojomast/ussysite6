/**
 * Canonical folio numbering & Ussyverse archaeological lore helpers.
 * Pure TypeScript — safe in Astro SSG, Svelte 5 islands, Hono server, and tests.
 */

export interface FolioEntry {
  folio: number;
  folioCode: string;
  kind: 'cover' | 'contents' | 'feature' | 'source-room';
  label: string;
  href: string;
  articleSlug?: string;
}

export function formatFolioNumber(n: number): string {
  if (!Number.isFinite(n) || n < 1) return '00';
  return String(Math.trunc(n)).padStart(2, '0');
}

export function buildIssueFolios(
  issueNumber: string,
  articles: Array<{ articleSlug: string; title: string; index: number }>
): FolioEntry[] {
  const sorted = [...articles].sort((a, b) => a.index - b.index);
  const out: FolioEntry[] = [];
  let folio = 0;

  const push = (kind: FolioEntry['kind'], label: string, href: string, articleSlug?: string) => {
    folio += 1;
    out.push({
      folio,
      folioCode: formatFolioNumber(folio),
      kind,
      label,
      href,
      ...(articleSlug ? { articleSlug } : {})
    });
  };

  push('cover', 'Front Cover', `/issues/${issueNumber}#cover`);
  push('contents', 'Contents & Editor’s Letter', `/issues/${issueNumber}#contents`);

  for (const art of sorted) {
    push('feature', art.title, `/issues/${issueNumber}/${art.articleSlug}`, art.articleSlug);
  }

  push('source-room', 'The Source Room', `/source-room?issue=${issueNumber}`);
  return out;
}

export interface UssyEraRelic {
  era: string;
  repo: string;
  repoUrl: string;
  title: string;
  subtitle: string;
  artifact: string;
  chordLabel: string;
  freqs: [number, number, number, number];
  lore: string;
}

export const USSYVERSE_STRATIGRAPHY: UssyEraRelic[] = [
  {
    era: 'ERA II',
    repo: 'ussysite2',
    repoUrl: 'https://github.com/mojomast/ussysite2',
    title: 'A Constellation You Could Fly',
    subtitle: 'A Three.js project index with a spaceship hidden inside',
    artifact: 'Type u-s-s-y and the projects became planets',
    chordLabel: 'the jump-gate fifths',
    freqs: [196.0, 293.66, 392.0, 587.33],
    lore: 'The portfolio was a field of stars. Type u-s-s-y and it became a cockpit: project nodes turned into planets you could land on, with enemy ships, weapons that overheat and a skill tree you could only spend at a dock.'
  },
  {
    era: 'ERA III',
    repo: 'ussysite3',
    repoUrl: 'https://github.com/mojomast/ussysite3',
    title: 'Twenty-Three Planets',
    subtitle: 'Every project got a world you could walk on',
    artifact: 'Three magma cores bought a faster engine',
    chordLabel: 'the sublight drift',
    freqs: [220.0, 293.66, 329.63, 440.0],
    lore: 'Twenty-three project planets across ten kinds of terrain. You could enter the atmosphere, land, walk around on foot, gather resources and fly home with them, while other pilots sent their positions ten times a second.'
  },
  {
    era: 'ERA IV',
    repo: 'ussysite4',
    repoUrl: 'https://github.com/mojomast/ussysite4',
    title: 'The Helix Organum',
    subtitle: 'A pipe organ buried underground, one stop per project',
    artifact: 'A crypt under the floor, left dormant for an easter egg',
    chordLabel: 'the open diapason',
    freqs: [130.81, 196.0, 261.63, 392.0],
    lore: 'Space was traded for a cathedral underground: eleven repositories as organ stops along a glass helix, a ferrofluid pool that rose beneath whichever one you chose, and a reliquary under the floor left dormant, waiting for an easter egg that never came.'
  },
  {
    era: 'ERA V',
    repo: 'ussysite5',
    repoUrl: 'https://github.com/mojomast/ussysite5',
    title: 'Solaris, at Golden Hour',
    subtitle: 'A tidepool sanctuary that changed with the light',
    artifact: 'A paper lantern, written on and set adrift',
    chordLabel: 'the golden-hour ninth',
    freqs: [261.63, 329.63, 392.0, 493.88],
    lore: 'Four moods of the same shore, from golden hour to dawn mist. You could tap the water to make it ripple and chime, write a reflection on a paper lantern, and let it drift out onto the lagoon.'
  },
  {
    era: 'ERA VI',
    repo: 'ussysite6',
    repoUrl: 'https://github.com/mojomast/ussysite6',
    title: 'A Magazine That Keeps Publishing',
    subtitle: 'The field journal of Issue 01, and this Living Edition',
    artifact: 'Reader numbers #101 to #211, and counting',
    chordLabel: 'the press chord',
    freqs: [261.63, 329.63, 440.0, 587.33],
    lore: 'It stopped being a place you visit and became something that comes out. Every claim is pinned to a commit. New issues arrive as pull requests, and a person reads them before they print.'
  }
];
