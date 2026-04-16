import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfigs, getInteractions, getBookings } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await verifyJWT(token);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const configs = await getClientConfigs();
    const totalClients = configs.filter(c => c.businessName).length;

    // Fetch all sheets with data in parallel, cap at 10 to avoid timeout
    const withSheet = configs.filter(c => c.sheetId).slice(0, 10);

    const results = await Promise.allSettled(
      withSheet.map(async (c) => {
        const [interactions, bookings] = await Promise.all([
          getInteractions(c.sheetId).catch(() => [] as any[]),
          getBookings(c.sheetId).catch(() => [] as any[]),
        ]);
        const biz = c.businessName.trim().toLowerCase();
        const norm = (s: string) => s.trim().toLowerCase().replace(/[\u2018\u2019\u02bc']/g, "'");
        const filteredBookings = bookings.filter((b: any) => norm(b.businessName) === norm(biz));
        const filteredInteractions = interactions.filter((i: any) => norm(i.businessName) === norm(biz));
        const revenue = filteredBookings.reduce((sum: number, b: any) => {
          const n = parseFloat((b.value || '').replace(/[^0-9.]/g, '') || '0');
          return sum + (isNaN(n) || n > 99999 ? 0 : n);
        }, 0);
        return { calls: filteredInteractions.length, revenue };
      })
    );

    let totalCalls = 0;
    let totalRevenue = 0;
    results.forEach(r => {
      if (r.status === 'fulfilled') {
        totalCalls += r.value.calls;
        totalRevenue += r.value.revenue;
      }
    });

    return NextResponse.json({ totalClients, totalCalls, totalRevenue });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to load stats' }, { status: 500 });
  }
}
