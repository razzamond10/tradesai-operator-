import { google } from 'googleapis';

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT env var is not set');

  let credentials: any;
  try {
    credentials = JSON.parse(raw);
  } catch (e) {
    throw new Error(`GOOGLE_SERVICE_ACCOUNT is not valid JSON: ${(e as Error).message}`);
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

export async function getSpreadsheetMeta(spreadsheetId: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'properties.title,sheets.properties.title',
  });
  return res.data;
}

export async function readSheet(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as string[][]) || [];
}

export interface ClientConfig {
  businessName: string;
  tradeType: string;
  contactName: string;
  phone: string;
  calendarId: string;
  sheetId: string;
  twilioNumber: string;
  clientId: string;
}

/** Strip leading emoji / non-ASCII characters from a tab name for comparison */
function normaliseTabName(name: string): string {
  return name.replace(/^[\p{Emoji}\p{So}\s]+/u, '').trim().toLowerCase();
}

/** Find the exact tab title whose normalised form includes the search string */
async function resolveTabName(spreadsheetId: string, search: string): Promise<string> {
  const meta = await getSpreadsheetMeta(spreadsheetId);
  const tabs: string[] = (meta.sheets ?? []).map((s: any) => s.properties?.title ?? '');
  const needle = search.toLowerCase();
  const match = tabs.find((t) => normaliseTabName(t).includes(needle));
  if (!match) {
    throw new Error(
      `Tab matching "${search}" not found. Available tabs: ${tabs.map((t) => `"${t}"`).join(', ')}`
    );
  }
  return match;
}

export async function getClientConfigs(): Promise<ClientConfig[]> {
  const spreadsheetId = process.env.MASTER_SHEET_ID!;
  const tabName = await resolveTabName(spreadsheetId, 'client config');
  const rows = await readSheet(spreadsheetId, `'${tabName}'!A2:I`);
  return rows.map((r) => ({
    businessName: r[0] || '',
    tradeType: r[1] || '',
    contactName: r[2] || '',
    phone: r[3] || '',
    calendarId: r[4] || '',
    sheetId: r[5] || '',
    twilioNumber: r[7] || '',
    clientId: r[8] || '',
  }));
}

export async function getClientConfig(
  clientId: string
): Promise<ClientConfig | null> {
  const configs = await getClientConfigs();
  return configs.find((c) => c.clientId === clientId) || null;
}

// ── InteractionsLog ──────────────────────────────────────────────────────────
export interface Interaction {
  timestamp: string;
  callerName: string;
  phone: string;
  intent: string;
  outcome: string;
  notes: string;
}

export async function getInteractions(sheetId: string): Promise<Interaction[]> {
  const rows = await readSheet(sheetId, 'InteractionsLog!A2:F');
  return rows.map((r) => ({
    timestamp: r[0] || '',
    callerName: r[1] || '',
    phone: r[2] || '',
    intent: r[3] || '',
    outcome: r[4] || '',
    notes: r[5] || '',
  }));
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface Booking {
  timestamp: string;
  customerName: string;
  phone: string;
  jobType: string;
  scheduledDate: string;
  status: string;
  value: string;
}

export async function getBookings(sheetId: string): Promise<Booking[]> {
  const rows = await readSheet(sheetId, 'Bookings!A2:G');
  return rows.map((r) => ({
    timestamp: r[0] || '',
    customerName: r[1] || '',
    phone: r[2] || '',
    jobType: r[3] || '',
    scheduledDate: r[4] || '',
    status: r[5] || '',
    value: r[6] || '',
  }));
}

// ── Emergencies ───────────────────────────────────────────────────────────────
export interface Emergency {
  timestamp: string;
  callerName: string;
  phone: string;
  type: string;
  severity: string;
  resolved: string;
}

export async function getEmergencies(sheetId: string): Promise<Emergency[]> {
  const rows = await readSheet(sheetId, 'Emergencies!A2:F');
  return rows.map((r) => ({
    timestamp: r[0] || '',
    callerName: r[1] || '',
    phone: r[2] || '',
    type: r[3] || '',
    severity: r[4] || '',
    resolved: r[5] || '',
  }));
}

// ── KPI helpers ───────────────────────────────────────────────────────────────
export function computeKPIs(
  interactions: Interaction[],
  bookings: Booking[]
) {
  const today = new Date().toISOString().slice(0, 10);

  const callsToday = interactions.filter((i) =>
    i.timestamp.startsWith(today)
  ).length;

  const bookingsToday = bookings.filter((b) =>
    b.timestamp.startsWith(today)
  ).length;

  const revenue = bookings
    .filter((b) => b.status?.toLowerCase() === 'completed')
    .reduce((sum, b) => {
      const v = parseFloat(b.value?.replace(/[^0-9.]/g, '') || '0');
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

  const hotLeads = interactions.filter(
    (i) => i.outcome?.toLowerCase() === 'booked' || i.outcome?.toLowerCase() === 'hot'
  ).length;

  return { callsToday, bookingsToday, revenue, hotLeads };
}
