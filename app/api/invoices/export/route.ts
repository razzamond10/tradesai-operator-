import { NextRequest } from 'next/server';
import { withTierGuard } from '@/lib/apiAuth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoices } from '@/lib/invoices';

function esc(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = withTierGuard('page.invoices', async (req: NextRequest, session) => {
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return new Response('﻿Invoice ID,Status,Customer,Email,Issue Date,Due Date,Subtotal,VAT %,VAT Amount,Total,Notes,Created\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invoices.csv"',
    },
  });

  const invoices = await getInvoices(config.sheetId);
  const sorted = invoices.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const header = 'Invoice ID,Status,Customer,Email,Issue Date,Due Date,Subtotal,VAT %,VAT Amount,Total,Notes,Created';
  const rows = sorted.map(inv =>
    [
      esc(inv.invoiceId),
      esc(inv.status),
      esc(inv.customerName),
      esc(inv.customerEmail),
      esc(inv.issueDate),
      esc(inv.dueDate),
      esc(inv.subtotal.toFixed(2)),
      esc(inv.vatRate),
      esc(inv.vatAmount.toFixed(2)),
      esc(inv.total.toFixed(2)),
      esc(inv.notes),
      esc(inv.createdAt.slice(0, 10)),
    ].join(',')
  );

  const csv = '﻿' + [header, ...rows].join('\r\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invoices.csv"',
    },
  });
});
