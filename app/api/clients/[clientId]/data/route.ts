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
    const [allInteractions, allBookings, allEmergencies] = await Promise.all([
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

    console.log(`[data] Raw totals: interactions=${allInteractions.length} bookings=${allBookings.length} emergencies=${allEmergencies.length}`);

    // Filter to rows belonging to this client — the shared sheet has data for all clients
    const bizName = config.businessName.trim().toLowerCase();
    const interactions = allInteractions.filter((r) => r.businessName.trim().toLowerCase() === bizName);
    const bookings = allBookings.filter((r) => r.businessName.trim().toLowerCase() === bizName);
    const emergencies = allEmergencies.filter((r) => r.businessName.trim().toLowerCase() === bizName);

    console.log(`[data] After businessName filter ("${config.businessName}"): interactions=${interactions.length} bookings=${bookings.length} emergencies=${emergencies.length}`);

    const kpis = computeKPIs(interactions, bookings, emergencies);

    // _debug is stripped in production use but lets us diagnose without Vercel log access
    const _debug = {
      sheetId,
      configBusinessName: config.businessName,
      rawTotals: { interactions: allInteractions.length, bookings: allBookings.length, emergencies: allEmergencies.length },
      filteredTotals: { interactions: interactions.length, bookings: bookings.length, emergencies: emergencies.length },
      sampleBusinessNames: {
        interactions: allInteractions.slice(0, 3).map((r) => r.businessName),
        bookings: allBookings.slice(0, 3).map((r) => r.businessName),
      },
    };

    return NextResponse.json({
      config,
      kpis,
      interactions: interactions.slice(0, 100),
      bookings: bookings.slice(0, 100),
      emergencies: emergencies.slice(0, 50),
      _debug,
    });
  } catch (err: any) {
    console.error('[data] Fatal error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to load client data' },
      { status: 500 }
    );
  }
}
