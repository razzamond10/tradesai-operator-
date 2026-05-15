import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, eventId, note } = await req.json();
    if (!note || typeof note !== 'string' || note.length > 2000) {
      return Response.json({ error: 'Invalid note (max 2000 chars)' }, { status: 400 });
    }
    const config = await getClientConfig(clientId);
    if (!config) return Response.json({ error: 'Client not found' }, { status: 404 });
    const tabName = await resolveTabName(config.sheetId, 'bookings');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId, range: `'${tabName}'!A2:P`,
    });
    const rows = read.data.values || [];
    const idx = rows.findIndex((r, i) => i > 0 && r[7] === eventId);
    if (idx < 0) return Response.json({ error: 'Booking not found' }, { status: 404 });
    const before = rows[idx][12] || '';
    const stamp = `[${new Date().toISOString()}] ${session.email}: ${note}`;
    const after = before ? `${before}\n${stamp}` : stamp;
    const rowNum = idx + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!M${rowNum}`,
      valueInputOption: 'RAW', requestBody: { values: [[after]] },
    });
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'booking.note',
      clientId, targetType: 'booking', targetId: eventId,
      beforeValue: '', afterValue: note,
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/booking/note]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
