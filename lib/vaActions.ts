import { google } from 'googleapis';

const MASTER_SHEET_ID = process.env.MASTER_SHEET_ID || '1Fb4HKr_r7dtsLx8Hs7vDliPoHpwZ7Oe-YPEPtYZPXD0';

function getWriteAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT env var is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export interface VAActionInput {
  vaEmail: string;
  vaName: string;
  actionType: string;
  clientId?: string;
  targetType?: string;
  targetId?: string;
  beforeValue?: string;
  afterValue?: string;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Append an audit row to the "VA Actions Log" sheet tab.
 * Non-blocking with a 2-second timeout to prevent slow Sheets API
 * calls from blocking write endpoints. Failures are logged, not thrown.
 */
export async function logVAAction(input: VAActionInput): Promise<void> {
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.warn('[vaActions] logVAAction timed out after 2s, continuing');
      resolve();
    }, 2000);
  });

  const writePromise = (async () => {
    try {
      const auth = getWriteAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const timestamp = new Date().toISOString();
      const row = [
        timestamp,
        input.vaEmail || '',
        input.vaName || '',
        input.actionType || '',
        input.clientId || '',
        input.targetType || '',
        input.targetId || '',
        input.beforeValue || '',
        input.afterValue || '',
        input.notes || '',
        input.ipAddress || '',
        input.userAgent || '',
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId: MASTER_SHEET_ID,
        range: "'VA Actions Log'!A:L",
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      });
    } catch (e) {
      console.error('[vaActions] logVAAction failed:', (e as Error).message);
    }
  })();

  await Promise.race([writePromise, timeoutPromise]);
}
