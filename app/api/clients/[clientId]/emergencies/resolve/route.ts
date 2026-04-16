import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfig, resolveEmergency } from '@/lib/sheets';

export async function POST(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let rowIndex: number;
  try {
    const body = await req.json();
    rowIndex = body.rowIndex;
    if (typeof rowIndex !== 'number' || rowIndex < 0) throw new Error();
  } catch {
    return NextResponse.json({ error: 'rowIndex (number) required' }, { status: 400 });
  }

  const config = await getClientConfig(decodeURIComponent(params.clientId));
  if (!config?.sheetId) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  await resolveEmergency(config.sheetId, rowIndex);
  return NextResponse.json({ ok: true });
}
