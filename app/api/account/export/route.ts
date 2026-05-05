import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { getClientConfig, getInteractions, getBookings, getEmergencies, logInteraction } from '@/lib/sheets';
import { logAudit, getRequestMeta } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('tradesai_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.clientId) return NextResponse.json({ error: 'No client account associated with this session' }, { status: 400 });

    const config = await getClientConfig(user.clientId);
    if (!config) return NextResponse.json({ error: 'Client config not found' }, { status: 404 });

    const [interactions, bookings, emergencies] = await Promise.all([
      getInteractions(config.sheetId).catch(() => []),
      getBookings(config.sheetId).catch(() => []),
      getEmergencies(config.sheetId).catch(() => []),
    ]);

    // Log the export request (non-fatal)
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    logInteraction(config.sheetId, {
      timestamp,
      callerName: user.name ?? user.email,
      phone: config.phone,
      intent: 'gdpr_export',
      outcome: 'completed',
      notes: 'GDPR data export requested via portal',
    }).catch(() => {/* non-fatal */});

    const { ip, user_agent } = getRequestMeta(req);
    logAudit({
      actor_email: user.email,
      actor_role: user.role as 'admin' | 'client',
      action: 'gdpr.export',
      target: user.email,
      client_id: user.clientId,
      ip,
      user_agent,
      result: 'success',
    });

    const exportDate = new Date().toISOString().slice(0, 10);
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      requestedBy: { email: user.email, name: user.name, clientId: user.clientId },
      clientConfig: {
        businessName: config.businessName,
        tradeType: config.tradeType,
        contactName: config.contactName,
        phone: config.phone,
        twilioNumber: config.twilioNumber,
        businessHoursStart: config.businessHoursStart,
        businessHoursEnd: config.businessHoursEnd,
      },
      interactions,
      bookings,
      emergencies,
    }, null, 2);

    return new NextResponse(payload, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tao-data-export-${exportDate}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('GDPR export error:', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
