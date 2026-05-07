import { google } from 'googleapis';
import { readSheet } from './sheets';

function getWriteAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT env var is not set');
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const TAB = 'Invoices';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  invoiceId: string;
  clientId: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  lineItems: LineItem[];
  notes: string;
  createdAt: string;
  paidAt: string;
  rowIndex?: number;
}

// Columns A–O
function rowToInvoice(row: string[], rowIndex: number): Invoice {
  return {
    invoiceId: row[0] || '',
    clientId: row[1] || '',
    status: (['draft', 'sent', 'paid', 'overdue'].includes(row[2]) ? row[2] : 'draft') as Invoice['status'],
    customerName: row[3] || '',
    customerEmail: row[4] || '',
    issueDate: row[5] || '',
    dueDate: row[6] || '',
    subtotal: parseFloat(row[7]) || 0,
    vatRate: parseFloat(row[8]) || 0,
    vatAmount: parseFloat(row[9]) || 0,
    total: parseFloat(row[10]) || 0,
    lineItems: (() => { try { return JSON.parse(row[11] || '[]'); } catch { return []; } })(),
    notes: row[12] || '',
    createdAt: row[13] || '',
    paidAt: row[14] || '',
    rowIndex,
  };
}

function invoiceToRow(inv: Omit<Invoice, 'rowIndex'>): string[] {
  return [
    inv.invoiceId,
    inv.clientId,
    inv.status,
    inv.customerName,
    inv.customerEmail,
    inv.issueDate,
    inv.dueDate,
    inv.subtotal.toFixed(2),
    inv.vatRate.toString(),
    inv.vatAmount.toFixed(2),
    inv.total.toFixed(2),
    JSON.stringify(inv.lineItems),
    inv.notes,
    inv.createdAt,
    inv.paidAt,
  ];
}

export async function getInvoices(sheetId: string): Promise<Invoice[]> {
  const rows = await readSheet(sheetId, `${TAB}!A2:O`);
  return rows.map((row, i) => rowToInvoice(row, i + 2));
}

export async function getInvoiceById(sheetId: string, invoiceId: string): Promise<Invoice | null> {
  const all = await getInvoices(sheetId);
  return all.find(inv => inv.invoiceId === invoiceId) ?? null;
}

export async function nextInvoiceNumber(sheetId: string): Promise<string> {
  const all = await getInvoices(sheetId);
  const max = all.reduce((n, inv) => {
    const m = inv.invoiceId.match(/^INV-(\d+)$/);
    return m ? Math.max(n, parseInt(m[1], 10)) : n;
  }, 0);
  return `INV-${String(max + 1).padStart(4, '0')}`;
}

export async function createInvoice(
  sheetId: string,
  data: Omit<Invoice, 'invoiceId' | 'createdAt' | 'rowIndex'>
): Promise<Invoice> {
  const invoiceId = await nextInvoiceNumber(sheetId);
  const createdAt = new Date().toISOString();
  const full: Invoice = { ...data, invoiceId, createdAt, paidAt: data.paidAt || '' };

  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${TAB}!A:O`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [invoiceToRow(full)] },
  });
  return full;
}

export async function updateInvoice(
  sheetId: string,
  invoiceId: string,
  updates: Partial<Omit<Invoice, 'invoiceId' | 'clientId' | 'createdAt' | 'rowIndex'>>
): Promise<Invoice | null> {
  const all = await getInvoices(sheetId);
  const existing = all.find(inv => inv.invoiceId === invoiceId);
  if (!existing) return null;

  const updated: Invoice = { ...existing, ...updates };
  const row = invoiceToRow(updated);

  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${TAB}!A${existing.rowIndex}:O${existing.rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
  return updated;
}
