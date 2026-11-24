/**
 * The one strict Content Security Policy: no 'unsafe-inline', no remote scripts.
 * The Hono server sends it as a header; static hosts without header control (GitHub Pages)
 * get it as a <meta http-equiv> tag instead.
 */
export const CSP_DIRECTIVES: readonly string[] = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'"
];

export const STRICT_CSP_HEADER = CSP_DIRECTIVES.join('; ');

/** Browsers ignore frame-ancestors in a meta tag and log an error for it, so it is dropped here. */
export const STRICT_CSP_META = CSP_DIRECTIVES.filter((d) => !d.startsWith('frame-ancestors')).join('; ');
