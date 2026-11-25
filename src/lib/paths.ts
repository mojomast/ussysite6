/**
 * Base-path helpers. The site is served from `/` on ussy.host and from `/ussysite6/` on the
 * GitHub Pages preview (`DEPLOY_TARGET=pages`), so every root-relative URL goes through here.
 */
// import.meta.env only exists under Vite; the Hono server and Node tests import this file too.
const ENV: Record<string, string | undefined> = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const RAW_BASE = ENV.BASE_URL || '/';

/** '' at the domain root, '/ussysite6' under a subpath. Never ends with a slash. */
export const BASE_PATH = RAW_BASE.replace(/\/+$/, '');

/** Prefix a root-relative path with the base. External, hash and relative URLs pass through. */
export function withBase(path: string): string;
export function withBase(path: string | null | undefined): string | null | undefined;
export function withBase(path: string | null | undefined): string | null | undefined {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return `${BASE_PATH}${path}`;
}

/** Turn a pathname from the address bar back into a site path ('/issues/02', not '/ussysite6/issues/02'). */
export function stripBase(pathname: string): string {
  if (!BASE_PATH || !pathname.startsWith(BASE_PATH)) return pathname || '/';
  return pathname.slice(BASE_PATH.length) || '/';
}

/**
 * False on static-only hosts (GitHub Pages), where there is no Hono server behind `/api`.
 * Islands skip their network calls and use their local fallbacks instead, so the console
 * stays free of 404s.
 */
export const API_ENABLED: boolean = ENV.PUBLIC_SI_STATIC !== 'true';
