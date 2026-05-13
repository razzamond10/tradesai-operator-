import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/apiAuth';
import { getClientConfig, getBookings } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (session.role !== 'client' && session.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const clientId = session.clientId;
    if (!clientId) return Response.json({ bookings: [] });

    const config = await getClientConfig(decodeURIComponent(clientId));
    if (!config?.sheetId) return Response.json({ bookings: [] });

    const all = await getBookings(config.sheetId);
    // Return last 20 completed bookings with a final price set, most recent first
    const recent = all
      .filter(b => b.customerName && b.status.toLowerCase() === 'completed' && parseFloat(b.finalPrice) > 0)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 20)
      .map(b => ({
        customerName: b.customerName,
        phone: b.phone,
        jobType: b.jobType,
        scheduledDate: b.scheduledDate,
        postcode: b.postcode,
        finalPrice: b.finalPrice,
      }));

    return Response.json({ bookings: recent });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Failed to load bookings' }, { status: 500 });
  }
}
