import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, phone, timestamp } = await req.json();
    const config = await getClientConfig(clientId);
    if (!config) return Response.json({ error: 'Client not found' }, { status: 404 });
    const tabName = await resolveTabName(config.sheetId, 'emergencies');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId, range: "'${tabName}'!A3:M",
    });
    const rows = read.data.values || [];
    const idx = rows.findIndex(r => (r[3] || '').replace(/^'/, '') === phone && r[0] === timestamp);
    if (idx < 0) return Response.json({ error: 'Emergency not found' }, { status: 404 });
    const before = rows[idx][9] || '';
    if (before && before !== session.email) {
      return Response.json({ error: `Already claimed by ${before}` }, { status: 409 });
    }
    const rowNum = idx + 3;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!J${rowNum}`,
      valueInputOption: 'RAW', requestBody: { values: [[session.email]] },
    });
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'emergency.claim',
      clientId, targetType: 'emergency', targetId: `${phone}|${timestamp}`,
      beforeValue: before, afterValue: session.email,
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true, claimedBy: session.email });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/emergency/claim]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
