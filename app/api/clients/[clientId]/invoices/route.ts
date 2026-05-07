import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoices } from '@/lib/invoices';

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (user.role !== 'admin' && user.role !== 'va') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const config = await getClientConfig(decodeURIComponent(params.clientId));
  if (!config?.sheetId) return NextResponse.json({ invoices: [] });

  const invoices = await getInvoices(config.sheetId);
  const sorted = invoices
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .map(({ rowIndex: _r, ...rest }) => rest);

  return NextResponse.json({ invoices: sorted });
}
