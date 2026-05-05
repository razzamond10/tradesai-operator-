/**
 * Email change token storage (EmailChanges sheet tab).
 *
 * EmailChanges tab schema:
 *   currentEmail | newEmail | tokenHash | expiresAt | used | createdAt
 *
 * All operations use MASTER_SHEET_ID.
 */
import { google } from 'googleapis';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SPREADSHEET_ID = process.env.MASTER_SHEET_ID!;

function getWriteAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT env var is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheetsClient() {
  const auth = getWriteAuth();
  return google.sheets({ version: 'v4', auth });
}

async function getSheetTabs(): Promise<Array<{ id: number; title: string }>> {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties.sheetId,sheets.properties.title',
  });
  return (meta.data.sheets ?? []).map((s: any) => ({
    id: s.properties.sheetId,
    title: s.properties.title,
  }));
}

async function ensureTabExists(tabName: string, headers: string[]): Promise<void> {
  const sheets = await getSheetsClient();
  const tabs = await getSheetTabs();
  const exists = tabs.some((t) => t.title === tabName);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${tabName}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }
}

async function readTab(tabName: string, range: string): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tabName}'!${range}`,
  });
  return (res.data.values as string[][]) || [];
}

// ── EmailChanges ──────────────────────────────────────────────────────────────

const CHANGE_TAB = 'EmailChanges';
const CHANGE_HEADERS = ['currentEmail', 'newEmail', 'tokenHash', 'expiresAt', 'used', 'createdAt'];

export interface EmailChange {
  currentEmail: string;
  newEmail: string;
  tokenHash: string;
  expiresAt: string;
  used: string;
  createdAt: string;
  rowIndex: number;
}

async function getEmailChanges(): Promise<EmailChange[]> {
  await ensureTabExists(CHANGE_TAB, CHANGE_HEADERS);
  const rows = await readTab(CHANGE_TAB, 'A2:F');
  return rows.map((r, i) => ({
    currentEmail: (r[0] || '').trim().toLowerCase(),
    newEmail:     (r[1] || '').trim().toLowerCase(),
    tokenHash:    (r[2] || '').trim(),
    expiresAt:    (r[3] || '').trim(),
    used:         (r[4] || '').trim(),
    createdAt:    (r[5] || '').trim(),
    rowIndex: i,
  }));
}

/** Count how many change requests this email has made in the last hour. */
export async function countRecentChanges(currentEmail: string): Promise<number> {
  const changes = await getEmailChanges();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return changes.filter((c) => {
    if (c.currentEmail !== currentEmail.toLowerCase().trim()) return false;
    const created = new Date(c.createdAt).getTime();
    return created >= oneHourAgo;
  }).length;
}

/** Append a new email change record. Returns the plaintext token. */
export async function createEmailChange(
  currentEmail: string,
  newEmail: string,
): Promise<string> {
  await ensureTabExists(CHANGE_TAB, CHANGE_HEADERS);
  const sheets = await getSheetsClient();
  const plaintextToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(plaintextToken, 10);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  const createdAt = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${CHANGE_TAB}'!A:F`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        currentEmail.toLowerCase().trim(),
        newEmail.toLowerCase().trim(),
        tokenHash,
        expiresAt,
        'false',
        createdAt,
      ]],
    },
  });
  return plaintextToken;
}

export interface ChangeTokenResult {
  currentEmail: string;
  newEmail: string;
  rowIndex: number;
  valid: boolean;
  error?: 'not_found' | 'expired' | 'used';
}

/** Find and validate a plaintext token by bcrypt-comparing against stored hashes. */
export async function findAndValidateChangeToken(
  plaintextToken: string,
): Promise<ChangeTokenResult> {
  const changes = await getEmailChanges();
  const now = Date.now();
  const candidates = changes.filter((c) => c.tokenHash && c.used === 'false');

  for (const c of candidates) {
    let match = false;
    try {
      match = await bcrypt.compare(plaintextToken, c.tokenHash);
    } catch {
      continue;
    }
    if (!match) continue;

    if (c.used === 'true') {
      return { currentEmail: c.currentEmail, newEmail: c.newEmail, rowIndex: c.rowIndex, valid: false, error: 'used' };
    }
    if (new Date(c.expiresAt).getTime() < now) {
      return { currentEmail: c.currentEmail, newEmail: c.newEmail, rowIndex: c.rowIndex, valid: false, error: 'expired' };
    }
    return { currentEmail: c.currentEmail, newEmail: c.newEmail, rowIndex: c.rowIndex, valid: true };
  }

  return { currentEmail: '', newEmail: '', rowIndex: -1, valid: false, error: 'not_found' };
}

/** Mark an email change token row as used. */
export async function markChangeTokenUsed(rowIndex: number): Promise<void> {
  const sheets = await getSheetsClient();
  const sheetRow = rowIndex + 2; // +1 header +1 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${CHANGE_TAB}'!E${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['true']] },
  });
}
