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

/**
 * Normalise a Google Sheets timestamp to ISO-like "YYYY-MM-DD HH:MM:SS".
 * Handles: "DD/MM/YYYY HH:MM:SS" (UK Sheets locale), "MM/DD/YYYY ..." (US),
 * and already-ISO "YYYY-MM-DD ..." strings.
 */
function normTimestamp(raw: string): string {
  if (!raw) return '';
  // Already starts with YYYY- → keep as-is
  if (/^\d{4}-/.test(raw)) return raw;
  // Match D/M/YYYY or DD/MM/YYYY with optional time
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(.*)$/);
  if (m) {
    const n1 = parseInt(m[1]), n2 = parseInt(m[2]);
    const year = m[3], rest = m[4] ? ' ' + m[4].trim() : '';
    let day: number, month: number;
    if (n1 > 12)      { day = n1; month = n2; } // definitely DD/MM
    else if (n2 > 12) { day = n2; month = n1; } // definitely MM/DD
    else              { day = n1; month = n2; } // ambiguous — assume DD/MM (UK)
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}${rest}`;
  }
  return raw;
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
    const businessName = (r[0] || '').trim();
    const twilioNumber = (r[8] || '').trim();
    const slug = toSlug(businessName);
    return {
      businessName,
      tradeType: (r[1] || '').trim(),
      contactName: (r[2] || '').trim(),
      phone: (r[3] || '').trim(),
      calendarId: (r[4] || '').trim(),
      sheetId: (r[5] || '').trim(),
      botpressId: (r[6] || '').trim(),
      makeWebhookUrl: (r[7] || '').trim(),
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
    timestamp: normTimestamp(r[0] || ''),
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
  postcode: string;
  jobType: string;
  scheduledDate: string;
  calendarEventId: string;
  bookingDateReadable: string;
  status: string;
  value: string;
}

export async function getBookings(sheetId: string): Promise<Booking[]> {
  const tabName = await resolveTabName(sheetId, 'bookings');
  // Col layout: A=timestamp, B=businessName, C=customerName, D=phone, E=postcode, F=jobType/issue, G=bookingSlot, H=calendarEventId, I=bookingDateReadable, J=status, K=value
  const rows = await readSheet(sheetId, `'${tabName}'!A2:K`);
  return rows.map((r) => ({
    businessName: r[1] || '',
    timestamp: normTimestamp(r[0] || ''),
    customerName: r[2] || '',
    phone: r[3] || '',
    postcode: r[4] || '',
    jobType: r[5] || '',
    scheduledDate: r[6] || '',
    calendarEventId: r[7] || '',
    bookingDateReadable: r[8] || '',
    status: r[9] || '',
    value: r[10] || '',
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
    timestamp: normTimestamp(r[0] || ''),
    callerName: r[2] || '',
    phone: r[3] || '',
    type: r[4] || '',
    severity: r[5] || '',
    resolved: r[6] || '',
  }));
}

/** Mark a single emergency row as resolved. rowIndex is 0-based index in the FULL (unfiltered) emergencies array. */
export async function resolveEmergency(sheetId: string, rowIndex: number): Promise<void> {
  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const tabName = await resolveTabName(sheetId, 'emergencies');
  const range = `'${tabName}'!G${rowIndex + 2}`; // +2: skip header row + convert 0-based to 1-based
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [['Yes']] },
  });
}

/**
 * Resolve an emergency by phone + timestamp composite key.
 * Reads the FULL sheet (all businesses) to find the correct row index —
 * avoids the off-by-one bug when the client sends an index into its
 * businessName-filtered slice rather than the full sheet order.
 */
export async function resolveEmergencyByKey(sheetId: string, phone: string, timestamp: string): Promise<void> {
  const all = await getEmergencies(sheetId);
  const rowIndex = all.findIndex(e => e.phone === phone && e.timestamp === timestamp);
  if (rowIndex < 0) throw new Error(`Emergency not found: phone=${phone} timestamp=${timestamp}`);
  await resolveEmergency(sheetId, rowIndex);
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
