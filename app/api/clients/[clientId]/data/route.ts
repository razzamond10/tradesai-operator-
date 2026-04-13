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
    if (!config) return NextResponse.json({ error: `Client "${params.clientId}" not found in master sheet` }, { status: 404 });

    const sheetId = config.sheetId;

    if (!sheetId) {
      // Config exists but no sheet linked yet — return config with empty data
      const kpis = computeKPIs([], []);
      return NextResponse.json({ config, kpis, interactions: [], bookings: [], emergencies: [] });
    }

    // Fetch each tab independently so a missing tab doesn't crash the whole request
    const [interactions, bookings, emergencies] = await Promise.all([
      getInteractions(sheetId).catch((e) => {
        console.warn(`[data] InteractionsLog unavailable for ${sheetId}:`, e?.message);
        return [];
      }),
      getBookings(sheetId).catch((e) => {
        console.warn(`[data] Bookings unavailable for ${sheetId}:`, e?.message);
        return [];
      }),
      getEmergencies(sheetId).catch((e) => {
        console.warn(`[data] Emergencies unavailable for ${sheetId}:`, e?.message);
        return [];
      }),
    ]);

    const kpis = computeKPIs(interactions, bookings);

    return NextResponse.json({
      config,
      kpis,
      interactions: interactions.slice(0, 100),
      bookings: bookings.slice(0, 100),
      emergencies: emergencies.slice(0, 50),
    });
  } catch (err: any) {
    console.error('[data] Fatal error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to load client data' },
      { status: 500 }
    );
  }
}
