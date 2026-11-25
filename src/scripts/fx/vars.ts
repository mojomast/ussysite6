/**
 * CSP-safe dynamic values. House rule: no element.style and no style="" (strict CSP, no
 * 'unsafe-inline'). Per-frame values (cursor position, tilt, magnet offset) are written as
 * custom properties into one adopted constructable stylesheet instead, which CSP allows and
 * which leaves no style attributes on elements.
 *
 *   setVars(':root', { '--cursor-x': '120px', '--cursor-y': '80px' });
 *   setVars('[data-magnet-id="3"]', { '--mx': '4px' });
 */
let sheet: CSSStyleSheet | null = null;
const rules = new Map<string, CSSStyleRule>();

function ensureSheet(): CSSStyleSheet | null {
  if (sheet) return sheet;
  if (typeof document === 'undefined' || typeof CSSStyleSheet !== 'function' || !('adoptedStyleSheets' in document)) return null;
  try {
    sheet = new CSSStyleSheet();
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } catch {
    sheet = null;
  }
  return sheet;
}

function ruleFor(selector: string): CSSStyleRule | null {
  const existing = rules.get(selector);
  if (existing) return existing;
  const s = ensureSheet();
  if (!s) return null;
  const index = s.insertRule(`${selector} {}`, s.cssRules.length);
  const rule = s.cssRules[index] as CSSStyleRule;
  rules.set(selector, rule);
  return rule;
}

/** Set custom properties on a selector. Only `--*` names are accepted. */
export function setVars(selector: string, vars: Record<string, string | number>): void {
  const rule = ruleFor(selector);
  if (!rule) return;
  for (const [name, value] of Object.entries(vars)) {
    if (name.startsWith('--')) rule.style.setProperty(name, String(value));
  }
}

/** Remove every custom property previously set on a selector. */
export function clearVars(selector: string): void {
  const rule = rules.get(selector);
  if (!rule) return;
  for (let i = rule.style.length - 1; i >= 0; i--) rule.style.removeProperty(rule.style[i]);
}
