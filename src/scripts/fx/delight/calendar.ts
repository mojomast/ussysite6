/**
 * Pure local-date helpers for seasonal and time-of-day decorative touches.
 * Uses local Date fields (hours, month, day of month) so callers and tests
 * can pass any mocked Date instance directly.
 */

export interface SeasonalState {
  /** Local hour is 22:00..23:59 or 00:00..04:59. */
  lateNight: boolean;
  /** Local month is December (month index 11). */
  december: boolean;
  /** Local day of month is the 23rd (Issue 02 press day). */
  pressDay: boolean;
}

export function getSeasonalState(date: Date = new Date()): SeasonalState {
  const hour = date.getHours();
  const month = date.getMonth();
  const day = date.getDate();

  return {
    lateNight: hour >= 22 || hour < 5,
    december: month === 11,
    pressDay: day === 23
  };
}

/** Subpath-safe check for whether `pathname` is the magazine front page. */
export function isFrontPagePath(pathname: string, baseUrl = '/'): boolean {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  let rel = pathname || '/';
  if (cleanBase && rel.startsWith(cleanBase)) {
    rel = rel.slice(cleanBase.length) || '/';
  }
  const normalized = rel.replace(/\/+$/, '') || '/';
  return normalized === '/' || normalized === '/index.html';
}
