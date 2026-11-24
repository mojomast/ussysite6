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
    title: 'Cybernetic Constellation',
    subtitle: 'Three.js Spatial Index & Hidden 6DOF Space Combat',
    artifact: 'Jump Gate Nav Beacon · Keycode: USSY',
    chordLabel: 'Cold-Jump Fifths',
    freqs: [196.0, 293.66, 392.0, 587.33],
    lore: 'Typing u-s-s-y outside an input field transformed the portfolio constellation into dockable project planets with shield bleedthrough, heat management, and dock-only skill trees.'
  },
  {
    era: 'ERA III',
    repo: 'ussysite3',
    repoUrl: 'https://github.com/mojomast/ussysite3',
    title: 'Planetary Biomes & Sublight Autopilot',
    subtitle: '23 Deterministic Worlds Across Ten Morphology Families',
    artifact: '3× Magma Cores · 3× Synaptic Pearls',
    chordLabel: 'Orbital Sublight Sus4',
    freqs: [220.0, 293.66, 329.63, 440.0],
    lore: 'Added atmospheric entry, on-foot surface harvesting, guided resource expeditions, and 10 Hz ticketed SSE multiplayer telemetry with authority-gated WebAudio.'
  },
  {
    era: 'ERA IV',
    repo: 'ussysite4',
    repoUrl: 'https://github.com/mojomast/ussysite4',
    title: 'The Helix Organum',
    subtitle: 'Subterranean Pipe Organ & Ferrofluid Nave Basin',
    artifact: 'Stops I–XI · Sub-Floor Crypt Reliquary (y = -14.2)',
    chordLabel: 'Windchest Open Diapason',
    freqs: [130.81, 196.0, 261.63, 392.0],
    lore: 'Replaced outer space with salt-glass Voronoi caustics, 60,000 curl-noise pneuma particles, and a smooth-minimum ferrofluid pool rising into Rosensweig peaks beneath eleven harmonic repository stops.'
  },
  {
    era: 'ERA V',
    repo: 'ussysite5',
    repoUrl: 'https://github.com/mojomast/ussysite5',
    title: 'SOLARIS // VESPERS',
    subtitle: 'Golden Hour Tidepool Sanctuary & Bioluminescent Lagoon',
    artifact: 'Paper Wish Lantern · Aeolian Cmaj9 Crown',
    chordLabel: 'Solaris Cmaj9 Aeolian',
    freqs: [261.63, 329.63, 392.0, 493.88],
    lore: 'Four living coastal moods (17:48 Solaris to 05:36 Aurora), 80,000 dinoflagellate plankton particles, and travertine pavilions where visitors cast wish lanterns adrift onto glowing water ripples.'
  },
  {
    era: 'ERA VI',
    repo: 'ussysite6',
    repoUrl: 'https://github.com/mojomast/ussysite6',
    title: 'SLOP ILLUSTRATED · Living Edition',
    subtitle: 'Source-Linked Periodical Press (Issue 01 Darkroom -> Issue 02 Carbon)',
    artifact: 'Reader Service #101–#211 · SQLite Source Room',
    chordLabel: 'Carbon Allotrope C6/9',
    freqs: [261.63, 329.63, 440.0, 587.33],
    lore: 'Turned the Ussyverse into a multi-issue software periodical where every claim carries a 40-char commit SHA, new issues arrive as pull requests from real GitHub activity, and each redesign skins the same archival content.'
  }
];
