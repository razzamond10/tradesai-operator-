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

    console.log(`[data] Config for ${params.clientId}: businessName="${config.businessName}" sheetId="${config.sheetId}"`);

    const sheetId = config.sheetId;

    if (!sheetId) {
      // Config exists but no sheet linked yet — return config with empty data
      console.warn(`[data] No sheetId in config for ${params.clientId}`);
      const kpis = computeKPIs([], []);
      return NextResponse.json({ config, kpis, interactions: [], bookings: [], emergencies: [] });
    }

    // Fetch each tab independently so a missing tab doesn't crash the whole request
    const [interactions, bookings, emergencies] = await Promise.all([
      getInteractions(sheetId).catch((e) => {
        console.error(`[data] InteractionsLog FAILED for sheetId=${sheetId}:`, e?.message);
        return [];
      }),
      getBookings(sheetId).catch((e) => {
        console.error(`[data] Bookings FAILED for sheetId=${sheetId}:`, e?.message);
        return [];
      }),
      getEmergencies(sheetId).catch((e) => {
        console.error(`[data] Emergencies FAILED for sheetId=${sheetId}:`, e?.message);
        return [];
      }),
    ]);

    console.log(`[data] Fetched: interactions=${interactions.length} bookings=${bookings.length} emergencies=${emergencies.length}`);

    const kpis = computeKPIs(interactions, bookings, emergencies);

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
