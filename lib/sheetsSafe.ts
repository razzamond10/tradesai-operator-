/**
 * lib/sheetsSafe.ts
 * Helpers for safely writing user-controlled strings to Google Sheets.
 *
 * Prevents:
 *   - CSV/Sheets formula injection
 *   - Unbounded length runaways
 *   - Null bytes, C0/C1 control chars, bidirectional override chars
 */

// Build the control-char regex programmatically so the source file
// stays pure printable ASCII. Strips:
//   - C0 controls U+0000-U+001F EXCEPT tab (9), newline (10), CR (13)
//   - DEL + C1 controls U+007F-U+009F
//   - Bidirectional overrides U+202A-U+202E, U+2066-U+2069
const CONTROL_RANGES: Array<[number, number]> = [
  [0x00, 0x08],
  [0x0B, 0x0C],
  [0x0E, 0x1F],
  [0x7F, 0x9F],
  [0x202A, 0x202E],
  [0x2066, 0x2069],
];
const CONTROL_REGEX = new RegExp(
  '[' + CONTROL_RANGES.map(
    ([lo, hi]) => String.fromCharCode(lo) + '-' + String.fromCharCode(hi)
  ).join('') + ']',
  'gu'
);

export function stripControlChars(s: string | undefined | null): string {
  if (!s) return '';
  return String(s).replace(CONTROL_REGEX, '');
}

export function safeForSheets(s: string | undefined | null): string {
  if (!s) return '';
  const str = String(s);
  return /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
}

export function truncateForSheets(s: string | undefined | null, max: number = 500): string {
  if (!s) return '';
  const str = String(s);
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function cleanForSheets(s: string | undefined | null, max: number = 500): string {
  return safeForSheets(truncateForSheets(stripControlChars(s), max));
}
