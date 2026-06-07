import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { logVAAction } from '@/lib/vaActions';
import { getClientConfig, resolveTabName } from '@/lib/sheets';
import { google } from 'googleapis';

const VALID_STATUSES = ['open', 'acknowledged', 'resolved', 'escalated'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminOrVA(req);
    const { id } = await params;
    const body = await req.json();
    const { clientId, status, phone, timestamp } = body;
    if (!VALID_STATUSES.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    const config = await getClientConfig(clientId);
    if (!config) return Response.json({ error: 'Client not found' }, { status: 404 });
    const tabName = await resolveTabName(config.sheetId, 'emergencies');

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `'${tabName}'!A3:M`,
    });
    const rows = read.data.values || [];
    const idx = rows.findIndex((r) => (r[0] || '').replace(/^'+/, '').trim() === timestamp);
    if (idx < 0) return Response.json({ error: 'Emergency not found' }, { status: 404 });

    const before = rows[idx][8] || 'open';
    const rowNum = idx + 3;
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: `'${tabName}'!I${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[status]] },
    });
    if (status === 'resolved') {
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.sheetId,
        range: `'${tabName}'!L${rowNum}:M${rowNum}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[new Date().toISOString(), session.email]] },
      });
    }
    await logVAAction({
      vaEmail: session.email, vaName: session.email.split('@')[0], actionType: 'emergency.status_change',
      clientId, targetType: 'emergency', targetId: `${phone}|${timestamp}`,
      beforeValue: before, afterValue: status,
      ipAddress: req.headers.get('x-forwarded-for') || '', userAgent: req.headers.get('user-agent') || '',
    });
    return Response.json({ success: true, status });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[va/emergency/status]', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
