import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, eventId, newStart, newEnd, reason } = await req.json();
    if (!newStart || !newEnd) {
      return Response.json({ error: 'newStart and newEnd required (ISO strings)' }, { status: 400 });
    }
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
    const beforeSlot = rows[idx][6] || '';
    const beforeHistory = rows[idx][14] || '';
    const rowNum = idx + 2;
    const newSlot = `${newStart.replace('T', ' ').slice(0, 16)}`;
    const stamp = `[${new Date().toISOString()}] ${session.email}: ${beforeSlot} → ${newSlot}${reason ? ` (${reason})` : ''}`;
    const newHistory = beforeHistory ? `${beforeHistory}\n${stamp}` : stamp;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!G${rowNum}`,
      valueInputOption: 'RAW', requestBody: { values: [[newSlot]] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!O${rowNum}`,
      valueInputOption: 'RAW', requestBody: { values: [[newHistory]] },
    });
    try {
      await calendar.events.patch({
        calendarId: config.calendarId, eventId,
        requestBody: { start: { dateTime: newStart }, end: { dateTime: newEnd } },
      });
    } catch (e) {
      console.warn('[va/booking/reschedule] Calendar patch failed:', (e as Error).message);
    }
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'booking.reschedule',
      clientId, targetType: 'booking', targetId: eventId,
      beforeValue: beforeSlot, afterValue: newSlot, notes: reason || '',
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true, newSlot });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/booking/reschedule]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
