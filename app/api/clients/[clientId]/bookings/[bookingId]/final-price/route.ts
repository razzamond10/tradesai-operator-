import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfig, updateBookingFinalPrice } from '@/lib/sheets';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { clientId: string; bookingId: string } }
) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rule 72: admin OR va OR client-self
  if (user.role !== 'admin' && user.role !== 'va') {
    if (user.role !== 'client' ||
        decodeURIComponent(user.clientId || '') !== decodeURIComponent(params.clientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const rowIndex = parseInt(params.bookingId, 10);
  if (isNaN(rowIndex) || rowIndex < 2) {
    return NextResponse.json({ error: 'Invalid bookingId' }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const finalPrice = Number(body.finalPrice);
  if (isNaN(finalPrice) || finalPrice < 0 || finalPrice > 99999) {
    return NextResponse.json({ error: 'finalPrice must be a number 0–99999' }, { status: 400 });
  }

  const config = await getClientConfig(decodeURIComponent(params.clientId));
  if (!config?.sheetId) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  await updateBookingFinalPrice(config.sheetId, rowIndex, finalPrice);

  return NextResponse.json({ ok: true, rowIndex, finalPrice });
}
