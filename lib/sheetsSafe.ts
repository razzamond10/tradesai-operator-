/**
 * lib/sheetsSafe.ts
 * Helpers for safely writing user-controlled strings to Google Sheets.
 *
 * Prevents:
 *   - CSV/Sheets formula injection
 *   - Unbounded length runaways
 */

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
  return safeForSheets(truncateForSheets(s, max));
}
