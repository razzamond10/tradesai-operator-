import { google } from 'googleapis';

const SHEET_ID = process.env.MASTER_SHEET_ID!;
const TAB_NAME = 'AuditLog';

function getWriteAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT env var is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export type AuditAction =
  | 'login.success'
  | 'login.failed'
  | 'logout'
  | 'password.reset.requested'
  | 'password.reset.completed'
  | 'password.changed'
  | 'email.change.requested'
  | 'email.change.verified'
  | 'account.paused'
  | 'account.resumed'
  | 'tier.changed'
  | 'gdpr.export'
  | 'gdpr.delete';

export type AuditRole = 'admin' | 'client' | 'system' | 'anonymous';
export type AuditResult = 'success' | 'failure';

export interface AuditEvent {
  actor_email: string;
  actor_role: AuditRole;
  action: AuditAction;
  target: string;
  client_id?: string;
  ip: string;
  user_agent: string;
  result: AuditResult;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit log writer.
 * NEVER throws — audit failure must never break the caller.
 */
export async function logAudit(event: AuditEvent): Promise<void> {
  setImmediate(async () => {
    try {
      const auth = getWriteAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      const row = [
        new Date().toISOString(),
        event.actor_email,
        event.actor_role,
        event.action,
        event.target,
        event.client_id || '',
        event.ip,
        event.user_agent,
        event.result,
        event.metadata ? JSON.stringify(event.metadata) : '',
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${TAB_NAME}!A:J`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
      });
    } catch (err) {
      console.error('[audit] write failed', err);
    }
  });
}

export function getRequestMeta(req: Request): { ip: string; user_agent: string } {
  const xff = req.headers.get('x-forwarded-for') || '';
  const ip = xff.split(',')[0].trim() || 'unknown';
  const user_agent = req.headers.get('user-agent') || 'unknown';
  return { ip, user_agent };
}
