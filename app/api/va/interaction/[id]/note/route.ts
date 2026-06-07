import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, conversationId, note } = await req.json();
    if (!note || typeof note !== 'string' || note.length > 2000) {
      return Response.json({ error: 'Invalid note (max 2000 chars)' }, { status: 400 });
    }
    const config = await getClientConfig(clientId);
    if (!config) return Response.json({ error: 'Client not found' }, { status: 404 });
    const tabName = await resolveTabName(config.sheetId, 'interactionslog');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId, range: `'${tabName}'!A2:W`,
    });
    const rows = read.data.values || [];
    const idx = rows.findIndex((r) => r[14] === conversationId);
    if (idx < 0) return Response.json({ error: 'Interaction not found' }, { status: 404 });
    const before = rows[idx][18] || '';
    const stamp = `[${new Date().toISOString()}] ${session.email}: ${note}`;
    const after = before ? `${before}\n${stamp}` : stamp;
    const rowNum = idx + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!S${rowNum}`,
      valueInputOption: 'RAW', requestBody: { values: [[after]] },
    });
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'interaction.note',
      clientId, targetType: 'interaction', targetId: conversationId,
      beforeValue: '', afterValue: note,
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/interaction/note]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
