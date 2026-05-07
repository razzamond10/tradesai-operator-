import { NextRequest } from 'next/server';
import { withTierGuard } from '@/lib/apiAuth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoiceById, updateInvoice } from '@/lib/invoices';
import { cleanForSheets } from '@/lib/sheetsSafe';

export const GET = withTierGuard('page.invoices', async (req: NextRequest, session) => {
  const id = req.nextUrl.pathname.split('/').at(-1) ?? '';
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return Response.json({ error: 'Not found' }, { status: 404 });

  const invoice = await getInvoiceById(config.sheetId, id);
  if (!invoice) return Response.json({ error: 'Not found' }, { status: 404 });

  const { rowIndex: _r, ...rest } = invoice;
  return Response.json({ invoice: rest });
});

export const PUT = withTierGuard('page.invoices', async (req: NextRequest, session) => {
  const id = req.nextUrl.pathname.split('/').at(-1) ?? '';
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return Response.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, any> = {};

  if (body.customerName !== undefined) updates.customerName = cleanForSheets(body.customerName);
  if (body.customerEmail !== undefined) updates.customerEmail = cleanForSheets(body.customerEmail);
  if (body.issueDate !== undefined) updates.issueDate = body.issueDate;
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
  if (body.notes !== undefined) updates.notes = cleanForSheets(body.notes);

  if (body.lineItems && Array.isArray(body.lineItems)) {
    const lineItems = body.lineItems.map((item: any) => ({
      description: cleanForSheets(item.description || ''),
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }));
    const rate = body.vatRate !== undefined ? Number(body.vatRate) : 0;
    const subtotal = lineItems.reduce(
      (s: number, item: { quantity: number; unitPrice: number }) => s + item.quantity * item.unitPrice,
      0
    );
    const vatAmount = parseFloat((subtotal * rate / 100).toFixed(2));
    const total = parseFloat((subtotal + vatAmount).toFixed(2));

    updates.lineItems = lineItems;
    updates.subtotal = subtotal;
    updates.vatRate = rate;
    updates.vatAmount = vatAmount;
    updates.total = total;
  }

  if (body.status) {
    const allowed = ['draft', 'sent', 'paid', 'overdue'] as const;
    if (!allowed.includes(body.status)) {
      return Response.json({ error: 'Invalid status' }, { status: 422 });
    }
    updates.status = body.status;
    // Set or clear paidAt on status transition
    updates.paidAt = body.status === 'paid' ? new Date().toISOString() : '';
  }

  const updated = await updateInvoice(config.sheetId, id, updates);
  if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });

  const { rowIndex: _r, ...rest } = updated;
  return Response.json({ invoice: rest });
});
