import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfigs } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user || (user.role !== 'admin' && user.role !== 'va')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const clients = await getClientConfigs();
    return NextResponse.json({ clients });
  } catch (err) {
    console.error('Sheets error:', err);
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}
