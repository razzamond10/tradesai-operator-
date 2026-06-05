import { readSheet, resolveTabName } from '@/lib/sheets';

/**
 * Parse a UK-locale date string ("DD/MM/YYYY HH:mm:ss") into a Date.
 * Also handles ISO "YYYY-MM-DD ..." strings returned by some sheet locales.
 * Returns null if the string cannot be parsed — callers must treat null as
 * "unknown, do not expire" (fail-open) so a date quirk never locks out a client.
 */
function parseUKDate(raw: string): Date | null {
  if (!raw) return null;
  // ISO format: starts with YYYY-
  if (/^\d{4}-/.test(raw)) {
    const d = new Date(raw.replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  }
  // UK/EU format: DD/MM/YYYY [HH:mm[:ss]]
  const m = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (!m) return null;
  const day   = parseInt(m[1], 10);
  const month = parseInt(m[2], 10); // 1-based
  const year  = parseInt(m[3], 10);
  const hh    = parseInt(m[4] || '0', 10);
  const mm    = parseInt(m[5] || '0', 10);
  const ss    = parseInt(m[6] || '0', 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day, hh, mm, ss);
}

export function generateToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, '') +
    crypto.randomUUID().replace(/-/g, '')
  );
}

export interface TokenValidResult {
  valid: true;
  status: string;
  current_step: number;
  draft_json: Record<string, unknown> | null;
  business_name: string;
  trade_type: string;
  client_email: string;
}

export interface TokenInvalidResult {
  valid: false;
}

export type ValidateResult = TokenValidResult | TokenInvalidResult;

// Onboarding tab columns (A–L, 0-indexed):
// 0=token  1=client_email  2=business_name  3=status  4=current_step
// 5=created_at  6=last_activity_at  7=completed_at  8=draft_json
// 9=stripe_session_id  10=abandonment_email_sent  11=trade_type

export async function validateToken(token: string): Promise<ValidateResult> {
  const spreadsheetId = process.env.MASTER_SHEET_ID!;
  const tabName = await resolveTabName(spreadsheetId, 'onboarding');
  const rows = await readSheet(spreadsheetId, `'${tabName}'!A2:L`);

  // Strip leading apostrophe (Sheets text-force prefix) + whitespace (Rule 70, Rule 90)
  const row = rows.find((r) => (r[0] || '').replace(/^'+/, '').trim() === token);
  if (!row) return { valid: false };

  const status = (row[3] || '').trim().toLowerCase();
  // Closed states — reject. Empty/blank → treat as 'pending' (fail-open into wizard).
  if (status === 'completed' || status === 'abandoned') return { valid: false };

  const createdAt = (row[5] || '').trim();
  if (createdAt) {
    const created = parseUKDate(createdAt);
    // If parse returns null (unrecognised format) → fail-open: do not expire.
    // A date quirk must never lock out a paid client whose token and status are valid.
    if (created !== null) {
      const ageMs = Date.now() - created.getTime();
      if (ageMs > 7 * 24 * 60 * 60 * 1000) return { valid: false };
    }
  }

  let draft_json: Record<string, unknown> | null = null;
  const rawDraft = (row[8] || '').trim();
  if (rawDraft) {
    try {
      draft_json = JSON.parse(rawDraft);
    } catch {
      draft_json = null;
    }
  }

  return {
    valid: true,
    status,
    current_step: Math.max(1, Math.min(5, parseInt((row[4] || '1').trim()) || 1)),
    draft_json,
    business_name: (row[2] || '').trim(),
    trade_type: (row[11] || '').trim(),
    client_email: (row[1] || '').trim(),
  };
}
