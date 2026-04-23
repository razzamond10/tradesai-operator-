// Open to all tiers — returns raw client business data (interactions, bookings, emergencies, config).
// Tier-specific views are rendered client-side and gated at the page layer.
// For tier-gated endpoints, use withTierGuard() from lib/apiAuth.ts.
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import {
  getClientConfig,
  getInteractions,
  getBookings,
  getEmergencies,
  computeKPIs,
} from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'client' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clientId = user.clientId;
  if (!clientId) return NextResponse.json({ error: 'No clientId in session' }, { status: 400 });

  try {
    const config = await getClientConfig(decodeURIComponent(clientId));
    if (!config) return NextResponse.json({ error: `Client not found` }, { status: 404 });

    const sheetId = config.sheetId;
    if (!sheetId) {
      const kpis = computeKPIs([], []);
      return NextResponse.json({ config, kpis, interactions: [], bookings: [], emergencies: [] });
    }

    const [allInteractions, allBookings, allEmergencies] = await Promise.all([
      getInteractions(sheetId).catch(() => []),
      getBookings(sheetId).catch(() => []),
      getEmergencies(sheetId).catch(() => []),
    ]);

    const normBiz = (s: string) => s.trim().toLowerCase().replace(/[\u2018\u2019\u02bc']/g, "'");
    const bizName = normBiz(config.businessName);
    const interactions = allInteractions.filter((r) => normBiz(r.businessName) === bizName);
    const bookings = allBookings.filter((r) => normBiz(r.businessName) === bizName);
    const emergencies = allEmergencies.filter((r) => normBiz(r.businessName) === bizName);

    const kpis = computeKPIs(interactions, bookings, emergencies);

    return NextResponse.json({
      config,
      kpis,
      interactions: interactions.slice(0, 100),
      bookings: bookings.slice(0, 100),
      emergencies: emergencies.slice(0, 50),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to load data' }, { status: 500 });
  }
}
