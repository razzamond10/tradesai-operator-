import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const out: Record<string, any> = {};

  // 1. Env var presence
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  out.GOOGLE_SERVICE_ACCOUNT_length = saRaw.length;
  out.MASTER_SHEET_ID = process.env.MASTER_SHEET_ID || '(not set)';

  // 2. Parse JSON
  let credentials: any = null;
  try {
    credentials = JSON.parse(saRaw);
    out.client_email = credentials.client_email;
    out.private_key_start = (credentials.private_key || '').slice(0, 50);
    out.private_key_length = (credentials.private_key || '').length;
    out.type = credentials.type;
  } catch (e: any) {
    out.json_parse_error = e.message;
    return NextResponse.json(out, { status: 500 });
  }

  // 3. Build auth
  let auth: any;
  try {
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  } catch (e: any) {
    out.auth_init_error = e.message;
    return NextResponse.json(out, { status: 500 });
  }

  // 4. Fetch spreadsheet metadata
  const spreadsheetId = process.env.MASTER_SHEET_ID!;
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId,properties.title,sheets.properties.title,sheets.properties.sheetId',
    });
    out.spreadsheet_title = res.data.properties?.title;
    out.spreadsheet_id = res.data.spreadsheetId;
    out.tabs = res.data.sheets?.map((s: any) => ({
      title: s.properties?.title,
      id: s.properties?.sheetId,
    }));
    out.status = 'ok';
  } catch (e: any) {
    out.sheets_error = e.message;
    out.sheets_error_code = e.code;
    out.sheets_error_status = e.status;
    out.sheets_error_detail = e?.errors?.[0] ?? null;
    return NextResponse.json(out, { status: 500 });
  }

  return NextResponse.json(out);
}
