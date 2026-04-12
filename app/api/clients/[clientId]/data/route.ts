import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import {
  getClientConfig,
  getInteractions,
  getBookings,
  getEmergencies,
  computeKPIs,
} from '@/lib/sheets';

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Clients can only see their own data
  if (user.role === 'client' && user.clientId !== params.clientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const config = await getClientConfig(params.clientId);
    if (!config) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const [interactions, bookings, emergencies] = await Promise.all([
      getInteractions(config.sheetId),
      getBookings(config.sheetId),
      getEmergencies(config.sheetId),
    ]);

    const kpis = computeKPIs(interactions, bookings);

    return NextResponse.json({
      config,
      kpis,
      interactions: interactions.slice(0, 50),
      bookings: bookings.slice(0, 50),
      emergencies: emergencies.slice(0, 20),
    });
  } catch (err) {
    console.error('Client data error:', err);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
