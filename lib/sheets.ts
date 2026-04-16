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

function getWriteAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT env var is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
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
  calendarId: string;   // col E — Google Calendar ID
  sheetId: string;      // col F — client data sheet ID
  botpressId: string;   // col G — Botpress bot ID
  makeWebhookUrl: string; // col H — Make.com webhook URL
  twilioNumber: string; // col I — Twilio phone number
  slug: string;         // URL-safe key derived from businessName
  clientId: string;     // twilioNumber if present, else slug — used for routing
}

/** Generate a URL-safe slug from a business name, e.g. "Ryan's Plumbing Services" → "ryans-plumbing-services" */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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
  return rows.map((r) => {
    const businessName = r[0] || '';
    const twilioNumber = r[8] || '';
    const slug = toSlug(businessName);
    return {
      businessName,
      tradeType: r[1] || '',
      contactName: r[2] || '',
      phone: r[3] || '',
      calendarId: r[4] || '',
      sheetId: r[5] || '',
      botpressId: r[6] || '',
      makeWebhookUrl: r[7] || '',
      twilioNumber,
      slug,
      clientId: twilioNumber || slug,
    };
  });
}

/** Normalise a phone string for comparison: decode %2B, collapse to digits-only with optional leading + */
function normalisePhone(raw: string): string {
  return decodeURIComponent(raw).replace(/\s/g, '');
}

export async function getClientConfig(
  id: string
): Promise<ClientConfig | null> {
  const configs = await getClientConfigs();
  const decoded = decodeURIComponent(id);
  const normalId = decoded.toLowerCase();
  const normPhone = normalisePhone(id);
  return configs.find((c) => {
    if (c.clientId === decoded || c.clientId === id) return true;
    if (c.twilioNumber) {
      const t = c.twilioNumber.trim();
      if (t === decoded || t === normPhone) return true;
      // strip leading + from both sides and compare digits
      if (t.replace(/^\+/, '') === normPhone.replace(/^\+/, '')) return true;
    }
    if (c.slug === normalId) return true;
    if (toSlug(c.businessName) === normalId) return true;
    return false;
  }) || null;
}

// ── InteractionsLog ──────────────────────────────────────────────────────────
export interface Interaction {
  businessName: string;
  timestamp: string;
  callerName: string;
  phone: string;
  intent: string;
  outcome: string;
  notes: string;
}

export async function getInteractions(sheetId: string): Promise<Interaction[]> {
  const tabName = await resolveTabName(sheetId, 'interactionslog');
  // Col layout: A=timestamp, B=businessName, C=callerName, D=phone, E=intent, F=outcome, G=notes
  const rows = await readSheet(sheetId, `'${tabName}'!A2:G`);
  return rows.map((r) => ({
    businessName: r[1] || '',
    timestamp: r[0] || '',
    callerName: r[2] || '',
    phone: r[3] || '',
    intent: r[4] || '',
    outcome: r[5] || '',
    notes: r[6] || '',
  }));
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface Booking {
  businessName: string;
  timestamp: string;
  customerName: string;
  phone: string;
  jobType: string;
  scheduledDate: string;
  status: string;
  value: string;
}

export async function getBookings(sheetId: string): Promise<Booking[]> {
  const tabName = await resolveTabName(sheetId, 'bookings');
  // Col layout: A=timestamp, B=businessName, C=customerName, D=phone, E=jobType, F=scheduledDate, G=status, H=value
  const rows = await readSheet(sheetId, `'${tabName}'!A2:H`);
  return rows.map((r) => ({
    businessName: r[1] || '',
    timestamp: r[0] || '',
    customerName: r[2] || '',
    phone: r[3] || '',
    jobType: r[4] || '',
    scheduledDate: r[5] || '',
    status: r[6] || '',
    value: r[7] || '',
  }));
}

// ── Emergencies ───────────────────────────────────────────────────────────────
export interface Emergency {
  businessName: string;
  timestamp: string;
  callerName: string;
  phone: string;
  type: string;
  severity: string;
  resolved: string;
}

export async function getEmergencies(sheetId: string): Promise<Emergency[]> {
  const tabName = await resolveTabName(sheetId, 'emergencies');
  // Col layout: A=timestamp, B=businessName, C=callerName, D=phone, E=type, F=severity, G=resolved
  const rows = await readSheet(sheetId, `'${tabName}'!A2:G`);
  return rows.map((r) => ({
    businessName: r[1] || '',
    timestamp: r[0] || '',
    callerName: r[2] || '',
    phone: r[3] || '',
    type: r[4] || '',
    severity: r[5] || '',
    resolved: r[6] || '',
  }));
}

/** Mark a single emergency row as resolved (column F = "Yes"). rowIndex is 0-based data index. */
export async function resolveEmergency(sheetId: string, rowIndex: number): Promise<void> {
  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const tabName = await resolveTabName(sheetId, 'emergencies');
  const range = `'${tabName}'!G${rowIndex + 2}`; // col G = resolved; +2 skips header, converts 0-based to 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [['Yes']] },
  });
}

// ── KPI helpers ───────────────────────────────────────────────────────────────
export function computeKPIs(
  interactions: Interaction[],
  bookings: Booking[],
  emergencies: Emergency[] = []
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

  const totalInteractions = interactions.length;
  const totalBookings = bookings.length;
  const emergenciesLogged = emergencies.length;
  const conversionRate = totalInteractions > 0
    ? Math.round((totalBookings / totalInteractions) * 100)
    : 0;

  return { callsToday, bookingsToday, revenue, hotLeads, totalInteractions, totalBookings, emergenciesLogged, conversionRate };
}

// ── Write helpers ─────────────────────────────────────────────────────────────

/** Append a row to InteractionsLog. Requires editor access on the sheet. */
export async function logInteraction(
  sheetId: string,
  row: {
    timestamp: string;
    callerName: string;
    phone: string;
    intent: string;
    outcome: string;
    notes: string;
  }
): Promise<void> {
  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'InteractionsLog!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.timestamp,
        row.callerName,
        row.phone,
        row.intent,
        row.outcome,
        row.notes,
      ]],
    },
  });
}

/** Append a row to the Bookings tab. */
export async function logBooking(
  sheetId: string,
  row: {
    timestamp: string;
    customerName: string;
    phone: string;
    jobType: string;
    scheduledDate: string;
    status: string;
    value: string;
  }
): Promise<void> {
  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Bookings!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        row.timestamp,
        row.customerName,
        row.phone,
        row.jobType,
        row.scheduledDate,
        row.status,
        row.value,
      ]],
    },
  });
}

/** Find a client config by their Twilio number. */
export async function getClientByTwilioNumber(twilioNumber: string): Promise<ClientConfig | null> {
  const configs = await getClientConfigs();
  return configs.find((c) =>
    c.twilioNumber === twilioNumber ||
    c.twilioNumber === twilioNumber.replace('+44', '0') ||
    ('+44' + c.twilioNumber.replace(/^0/, '')) === twilioNumber
  ) || null;
}
