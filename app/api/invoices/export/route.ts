export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { withTierGuard } from '@/lib/apiAuth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoices } from '@/lib/invoices';

function esc(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const EMPTY_HEADER = 'Invoice ID,Status,Customer,Phone,Address,Issue Date,Due Date,Subtotal,VAT Amount,Total,Paid Date,Notes';

export const GET = withTierGuard('page.invoices', async (_req: NextRequest, session) => {
  const clientId = session.clientId;
  if (!clientId) return Response.json({ error: 'No clientId' }, { status: 400 });

  const config = await getClientConfig(decodeURIComponent(clientId));
  if (!config?.sheetId) return new Response('﻿' + EMPTY_HEADER + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invoices.csv"',
    },
  });

  const invoices = await getInvoices(config.sheetId);
  const sorted = invoices.sort((a, b) => b.issueDate.localeCompare(a.issueDate));

  const rows = sorted.map(inv =>
    [
      esc(inv.invoiceId),
      esc(inv.status),
      esc(inv.customerName),
      esc(inv.customerPhone),
      esc(inv.customerAddress),
      esc(inv.issueDate),
      esc(inv.dueDate),
      esc(inv.subtotal.toFixed(2)),
      esc(inv.vatAmount.toFixed(2)),
      esc(inv.total.toFixed(2)),
      esc(inv.paidAt ? inv.paidAt.slice(0, 10) : ''),
      esc(inv.notes),
    ].join(',')
  );

  const csv = '﻿' + [EMPTY_HEADER, ...rows].join('\r\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invoices.csv"',
    },
  });
});
