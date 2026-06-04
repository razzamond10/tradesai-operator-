import { readSheet, resolveTabName } from '@/lib/sheets';

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

  const row = rows.find((r) => (r[0] || '').trim() === token);
  if (!row) return { valid: false };

  const status = (row[3] || '').trim();
  if (status === 'completed') return { valid: false };

  const createdAt = (row[5] || '').trim();
  if (createdAt) {
    const created = new Date(createdAt);
    if (!isNaN(created.getTime())) {
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
