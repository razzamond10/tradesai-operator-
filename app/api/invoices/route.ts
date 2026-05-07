import { NextRequest } from 'next/server';
import { withTierGuard } from '@/lib/apiAuth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoices, createInvoice } from '@/lib/invoices';
import { cleanForSheets } from '@/lib/sheetsSafe';

export const GET = withTierGuard('page.invoices', async (req: NextRequest, session) => {
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return Response.json({ invoices: [] });

  const invoices = await getInvoices(config.sheetId);
  // Return most recent first; strip rowIndex before sending
  const sorted = invoices
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ rowIndex: _r, ...rest }) => rest);

  return Response.json({ invoices: sorted });
});

export const POST = withTierGuard('page.invoices', async (req: NextRequest, session) => {
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return Response.json({ error: 'Sheet not configured' }, { status: 400 });

  const body = await req.json();
  const { customerName, customerEmail, issueDate, dueDate, lineItems, vatRate, notes } = body;

  if (!customerName || !issueDate || !dueDate || !Array.isArray(lineItems) || lineItems.length === 0) {
    return Response.json({ error: 'Missing required fields' }, { status: 422 });
  }

  const rate = Number(vatRate) || 0;
  const subtotal = lineItems.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0
  );
  const vatAmount = parseFloat((subtotal * rate / 100).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));

  const invoice = await createInvoice(config.sheetId, {
    clientId,
    status: 'draft',
    customerName: cleanForSheets(customerName),
    customerEmail: cleanForSheets(customerEmail || ''),
    issueDate,
    dueDate,
    subtotal,
    vatRate: rate,
    vatAmount,
    total,
    lineItems: lineItems.map((item: any) => ({
      description: cleanForSheets(item.description || ''),
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    })),
    notes: cleanForSheets(notes || ''),
    paidAt: '',
  });

  return Response.json({ invoice }, { status: 201 });
});
