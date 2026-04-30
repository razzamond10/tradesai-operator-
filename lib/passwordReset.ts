/**
 * Password reset token storage (PasswordResets sheet tab) and
 * AdminUsers sheet operations for password override storage.
 *
 * AdminUsers tab schema: email | name | role | passwordHash
 * PasswordResets tab schema: email | tokenHash | expiresAt | used | createdAt
 *
 * All operations use MASTER_SHEET_ID.
 */
import { google } from 'googleapis';
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

// ── Tab helpers ──────────────────────────────────────────────────────────────

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

// ── AdminUsers ────────────────────────────────────────────────────────────────

const ADMIN_TAB = 'AdminUsers';
const ADMIN_HEADERS = ['email', 'name', 'role', 'passwordHash'];

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  rowIndex: number; // 0-based in data rows (row 2 in sheet = rowIndex 0)
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await ensureTabExists(ADMIN_TAB, ADMIN_HEADERS);
  const rows = await readTab(ADMIN_TAB, 'A2:D');
  return rows
    .map((r, i) => ({
      email: (r[0] || '').trim().toLowerCase(),
      name: (r[1] || '').trim(),
      role: (r[2] || '').trim(),
      passwordHash: (r[3] || '').trim(),
      rowIndex: i,
    }))
    .filter((u) => u.email);
}

export async function findAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const users = await getAdminUsers();
  return users.find((u) => u.email === email.toLowerCase().trim()) || null;
}

/** Upsert a user's password hash into AdminUsers. Creates row if missing. */
export async function upsertAdminUserPassword(
  email: string,
  name: string,
  role: string,
  passwordHash: string
): Promise<void> {
  await ensureTabExists(ADMIN_TAB, ADMIN_HEADERS);
  const sheets = await getSheetsClient();
  const existing = await findAdminUserByEmail(email);

  if (existing) {
    // Update only the passwordHash column (D) in the existing row
    const sheetRow = existing.rowIndex + 2; // +1 header +1 1-based
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${ADMIN_TAB}'!A${sheetRow}:D${sheetRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[email.toLowerCase().trim(), name, role, passwordHash]] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${ADMIN_TAB}'!A:D`,
      valueInputOption: 'RAW',
      requestBody: { values: [[email.toLowerCase().trim(), name, role, passwordHash]] },
    });
  }
}

// ── PasswordResets ────────────────────────────────────────────────────────────

const RESET_TAB = 'PasswordResets';
const RESET_HEADERS = ['email', 'tokenHash', 'expiresAt', 'used', 'createdAt'];

export interface PasswordReset {
  email: string;
  tokenHash: string;
  expiresAt: string;
  used: string;
  createdAt: string;
  rowIndex: number;
}

async function getPasswordResets(): Promise<PasswordReset[]> {
  await ensureTabExists(RESET_TAB, RESET_HEADERS);
  const rows = await readTab(RESET_TAB, 'A2:E');
  return rows.map((r, i) => ({
    email: (r[0] || '').trim().toLowerCase(),
    tokenHash: (r[1] || '').trim(),
    expiresAt: (r[2] || '').trim(),
    used: (r[3] || '').trim(),
    createdAt: (r[4] || '').trim(),
    rowIndex: i,
  }));
}

/** Count how many reset requests this email has made in the last hour. */
export async function countRecentResets(email: string): Promise<number> {
  const resets = await getPasswordResets();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return resets.filter((r) => {
    if (r.email !== email.toLowerCase().trim()) return false;
    const created = new Date(r.createdAt).getTime();
    return created >= oneHourAgo;
  }).length;
}

/** Append a new reset token record. */
export async function createPasswordReset(
  email: string,
  tokenHash: string
): Promise<void> {
  await ensureTabExists(RESET_TAB, RESET_HEADERS);
  const sheets = await getSheetsClient();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  const createdAt = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${RESET_TAB}'!A:E`,
    valueInputOption: 'RAW',
    requestBody: { values: [[email.toLowerCase().trim(), tokenHash, expiresAt, 'false', createdAt]] },
  });
}

export interface ResetTokenResult {
  email: string;
  rowIndex: number;
  valid: boolean;
  error?: 'not_found' | 'expired' | 'used';
}

/** Find and validate a plaintext token by bcrypt-comparing against stored hashes. */
export async function findAndValidateResetToken(
  plaintextToken: string
): Promise<ResetTokenResult> {
  const resets = await getPasswordResets();
  const now = Date.now();

  // Only compare against unused rows to limit bcrypt calls
  const candidates = resets.filter((r) => r.tokenHash && r.used === 'false');

  for (const r of candidates) {
    let match = false;
    try {
      match = await bcrypt.compare(plaintextToken, r.tokenHash);
    } catch {
      continue;
    }
    if (!match) continue;

    // Found matching token — now validate
    if (r.used === 'true') {
      return { email: r.email, rowIndex: r.rowIndex, valid: false, error: 'used' };
    }
    if (new Date(r.expiresAt).getTime() < now) {
      return { email: r.email, rowIndex: r.rowIndex, valid: false, error: 'expired' };
    }
    return { email: r.email, rowIndex: r.rowIndex, valid: true };
  }

  return { email: '', rowIndex: -1, valid: false, error: 'not_found' };
}

/** Mark a reset token row as used. */
export async function markTokenUsed(rowIndex: number): Promise<void> {
  const sheets = await getSheetsClient();
  const sheetRow = rowIndex + 2; // +1 header +1 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${RESET_TAB}'!D${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['true']] },
  });
}
