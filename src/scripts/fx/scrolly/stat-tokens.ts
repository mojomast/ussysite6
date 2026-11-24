/**
 * Splits a factual stat string into plain-text segments and clean positive integers
 * suitable for CSS @property <integer> scroll-driven counters.
 *
 * Skips decimals (8.5, 16.67), semver strings (0.3.1, v0.2.10), comma-formatted
 * thousands (1,284), dates and years (18 Oct, 23 Nov, 2026), pixel dimensions (640×480),
 * prefixed/suffixed technical tokens (SHA-256, 48k/128, 8K, 20s, Node 20), and zero.
 */
export interface StatToken {
  kind: 'text' | 'int';
  text: string;
  value?: number;
}

const MONTH_AFTER = /^\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;
const TECH_BEFORE = /\b(?:Node|Python|Godot|SHA-|v|HTTP|ES|W|AC-|C·|Ne·|Au·|Mo·)\s*$/i;
const RANGE_VERSION_BEFORE = /\bNode\s+\d+\s*&\s*$/i;

export function parseStatTokens(input: string): StatToken[] {
  const tokens: StatToken[] = [];
  const re = /\d+/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushText = (chunk: string) => {
    if (!chunk) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.kind === 'text') prev.text += chunk;
    else tokens.push({ kind: 'text', text: chunk });
  };

  while ((match = re.exec(input)) !== null) {
    const raw = match[0];
    const start = match.index;
    const end = start + raw.length;
    const before = input.slice(0, start);
    const after = input.slice(end);
    const prevChar = start > 0 ? input[start - 1] : '';
    const nextChar = end < input.length ? input[end] : '';
    const num = Number.parseInt(raw, 10);

    const attachedToDecimal = prevChar === '.' || nextChar === '.';
    const attachedToCommaThousands =
      (prevChar === ',' && /\d$/.test(before.slice(0, -1))) ||
      (nextChar === ',' && /^\d{3}\b/.test(after.slice(1)));
    const attachedToLetter = /[a-zA-Z_]/.test(prevChar) || /[a-zA-Z_]/.test(nextChar);
    const attachedToDimension = prevChar === '×' || nextChar === '×' || prevChar === 'x' || nextChar === 'x';
    const attachedToSlashWord =
      (prevChar === '/' && /[a-zA-Z]\d*[a-zA-Z]?$/.test(before.slice(0, -1))) ||
      (nextChar === '/' && /^\d+[a-zA-Z]/.test(after.slice(1)));
    const attachedToDash =
      (prevChar === '-' && /[a-zA-Z0-9]$/.test(before.slice(0, -1))) ||
      (nextChar === '-' && /^\d/.test(after.slice(1)));
    const isDateOrYear =
      (num >= 1900 && num <= 2099) ||
      MONTH_AFTER.test(after) ||
      TECH_BEFORE.test(before) ||
      RANGE_VERSION_BEFORE.test(before);
    const isOutOfRange = !Number.isFinite(num) || num <= 0 || num > 9999;

    pushText(input.slice(lastIndex, start));

    if (
      attachedToDecimal ||
      attachedToCommaThousands ||
      attachedToLetter ||
      attachedToDimension ||
      attachedToSlashWord ||
      attachedToDash ||
      isDateOrYear ||
      isOutOfRange
    ) {
      pushText(raw);
    } else {
      tokens.push({ kind: 'int', text: raw, value: num });
    }

    lastIndex = end;
  }

  pushText(input.slice(lastIndex));
  return tokens;
}
