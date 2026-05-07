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
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  bookingRef: string;
  lineItems: LineItem[];
  subtotal: number;
  vatRate: number;   // derived at read time (not stored); kept for UI display
  vatAmount: number;
  total: number;
  paidAt: string;
  notes: string;
  rowIndex?: number;
}

// Columns A–P (16 columns)
// A=invoiceId  B=clientId  C=invoiceNumber(=invoiceId)  D=status
// E=issueDate  F=dueDate   G=customerName  H=customerPhone
// I=customerAddress  J=bookingRef  K=lineItemsJSON
// L=subtotal  M=vatAmount  N=total  O=paidAt  P=notes

function rowToInvoice(row: string[], rowIndex: number): Invoice {
  const subtotal = parseFloat(row[11]) || 0;
  const vatAmount = parseFloat(row[12]) || 0;
  const vatRate = subtotal > 0 ? Math.round((vatAmount / subtotal) * 100) : 0;
  return {
    invoiceId: row[0] || '',
    clientId: row[1] || '',
    // row[2] = invoiceNumber — identical to invoiceId, ignored
    status: (['draft', 'sent', 'paid', 'overdue'].includes(row[3]) ? row[3] : 'draft') as Invoice['status'],
    issueDate: row[4] || '',
    dueDate: row[5] || '',
    customerName: row[6] || '',
    customerPhone: row[7] || '',
    customerAddress: row[8] || '',
    bookingRef: row[9] || '',
    lineItems: (() => { try { return JSON.parse(row[10] || '[]'); } catch { return []; } })(),
    subtotal,
    vatAmount,
    vatRate,
    total: parseFloat(row[13]) || 0,
    paidAt: row[14] || '',
    notes: row[15] || '',
    rowIndex,
  };
}

function invoiceToRow(inv: Omit<Invoice, 'rowIndex'>): string[] {
  return [
    inv.invoiceId,                   // A
    inv.clientId,                    // B
    inv.invoiceId,                   // C — Invoice Number = Invoice ID
    inv.status,                      // D
    inv.issueDate,                   // E
    inv.dueDate,                     // F
    inv.customerName,                // G
    inv.customerPhone,               // H
    inv.customerAddress,             // I
    inv.bookingRef,                  // J
    JSON.stringify(inv.lineItems),   // K
    inv.subtotal.toFixed(2),         // L
    inv.vatAmount.toFixed(2),        // M
    inv.total.toFixed(2),            // N
    inv.paidAt,                      // O
    inv.notes,                       // P
  ];
}

export async function getInvoices(sheetId: string): Promise<Invoice[]> {
  const rows = await readSheet(sheetId, `${TAB}!A2:P`);
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
  data: Omit<Invoice, 'invoiceId' | 'rowIndex'>
): Promise<Invoice> {
  const invoiceId = await nextInvoiceNumber(sheetId);
  const full: Invoice = { ...data, invoiceId, paidAt: data.paidAt || '' };

  const auth = getWriteAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${TAB}!A:P`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [invoiceToRow(full)] },
  });
  return full;
}

export async function updateInvoice(
  sheetId: string,
  invoiceId: string,
  updates: Partial<Omit<Invoice, 'invoiceId' | 'clientId' | 'rowIndex'>>
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
    range: `${TAB}!A${existing.rowIndex}:P${existing.rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
  return updated;
}
