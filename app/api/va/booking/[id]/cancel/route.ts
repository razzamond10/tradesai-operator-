import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, eventId, reason } = await req.json();
    const config = await getClientConfig(clientId);
    if (!config) return Response.json({ error: 'Client not found' }, { status: 404 });
    const tabName = await resolveTabName(config.sheetId, 'bookings');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
      ],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const calendar = google.calendar({ version: 'v3', auth });
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId, range: `'${tabName}'!A2:P`,
    });
    const rows = read.data.values || [];
    const idx = rows.findIndex((r) => r[7] === eventId);
    if (idx < 0) return Response.json({ error: 'Booking not found' }, { status: 404 });
    const before = rows[idx][9] || '';
    const rowNum = idx + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!J${rowNum}`,
      valueInputOption: 'RAW', requestBody: { values: [['cancelled']] },
    });
    try {
      await calendar.events.delete({ calendarId: config.calendarId, eventId });
    } catch (e) {
      console.warn('[va/booking/cancel] Calendar delete failed:', (e as Error).message);
    }
    try {
      const noteRead = await sheets.spreadsheets.values.get({
        spreadsheetId: config.sheetId, range: `'${tabName}'!M${rowNum}`,
      });
      const existing = noteRead.data.values?.[0]?.[0] || '';
      const stamp = `[${new Date().toISOString()}] ${session.email}: cancelled — ${reason || 'no reason given'}`;
      const merged = existing ? `${existing}\n${stamp}` : stamp;
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.sheetId, range: `'${tabName}'!M${rowNum}`,
        valueInputOption: 'RAW', requestBody: { values: [[merged]] },
      });
    } catch (e) {
      console.warn('[va/booking/cancel] Note append failed:', (e as Error).message);
    }
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'booking.cancel',
      clientId, targetType: 'booking', targetId: eventId,
      beforeValue: before, afterValue: 'cancelled', notes: reason || '',
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/booking/cancel]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
