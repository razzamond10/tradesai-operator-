import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminOrVA(req);
    const { clientId, conversationId, required, dueDate, done } = await req.json();
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
    const idx = rows.findIndex((r, i) => i > 0 && r[1] === conversationId);
    if (idx < 0) return Response.json({ error: 'Interaction not found' }, { status: 404 });
    const before = `req=${rows[idx][19] || ''} by=${rows[idx][20] || ''} done=${rows[idx][22] || ''}`;
    const rowNum = idx + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId, range: `'${tabName}'!T${rowNum}:W${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[required ? 'Yes' : 'No', dueDate || '', session.email, done ? 'Yes' : 'No']] },
    });
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'interaction.followup',
      clientId, targetType: 'interaction', targetId: conversationId,
      beforeValue: before, afterValue: `req=${required} by=${session.email} due=${dueDate || ''} done=${done}`,
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/interaction/followup]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
