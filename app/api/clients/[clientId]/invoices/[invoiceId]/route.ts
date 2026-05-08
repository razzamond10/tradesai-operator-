import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfig } from '@/lib/sheets';
import { getInvoiceById } from '@/lib/invoices';

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string; invoiceId: string } }
) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (user.role !== 'admin' && user.role !== 'va') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let decodedClientId: string;
  try {
    decodedClientId = decodeURIComponent(params.clientId);
  } catch {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }

  const config = await getClientConfig(decodedClientId);
  if (!config?.sheetId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const invoice = await getInvoiceById(config.sheetId, params.invoiceId);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { rowIndex: _r, ...rest } = invoice;
  return NextResponse.json({ invoice: rest });
}
