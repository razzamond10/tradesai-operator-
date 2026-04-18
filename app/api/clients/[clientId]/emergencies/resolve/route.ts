import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfig, resolveEmergencyByKey } from '@/lib/sheets';

export async function POST(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') {
    // Allow clients to resolve their own client's emergencies
    if (user.role !== 'client' || decodeURIComponent(user.clientId || '') !== decodeURIComponent(params.clientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let phone: string, timestamp: string;
  try {
    const body = await req.json();
    phone = String(body.phone || '').trim();
    timestamp = String(body.timestamp || '').trim();
    if (!phone || !timestamp) throw new Error();
  } catch {
    return NextResponse.json({ error: 'phone and timestamp required' }, { status: 400 });
  }

  const config = await getClientConfig(decodeURIComponent(params.clientId));
  if (!config?.sheetId) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  await resolveEmergencyByKey(config.sheetId, phone, timestamp);
  return NextResponse.json({ ok: true });
}
