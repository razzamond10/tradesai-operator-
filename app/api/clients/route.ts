import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getClientConfigs, getSpreadsheetMeta } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tradesai_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await verifyJWT(token);
  if (!user || (user.role !== 'admin' && user.role !== 'va')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sheetId = process.env.MASTER_SHEET_ID;
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  console.log('[clients] MASTER_SHEET_ID:', sheetId);
  console.log('[clients] GOOGLE_SERVICE_ACCOUNT length:', saRaw.length, '| starts with:', saRaw.slice(0, 40));
  try {
    const parsed = JSON.parse(saRaw);
    console.log('[clients] SA client_email:', parsed.client_email);
    console.log('[clients] SA private_key starts with:', (parsed.private_key || '').slice(0, 40));
  } catch (e) {
    console.error('[clients] GOOGLE_SERVICE_ACCOUNT is not valid JSON:', (e as Error).message);
  }

  // Step 1 — confirm service account can access the spreadsheet at all
  try {
    const meta = await getSpreadsheetMeta(sheetId!);
    const sheetNames = meta.sheets?.map((s: any) => s.properties?.title) ?? [];
    console.log('[clients] Spreadsheet title:', meta.properties?.title);
    console.log('[clients] Available tab names:', JSON.stringify(sheetNames));
  } catch (metaErr: any) {
    console.error('[clients] METADATA FETCH FAILED:', metaErr?.message ?? metaErr);
    console.error('[clients] Meta error code:', metaErr?.code);
    console.error('[clients] Meta error status:', metaErr?.status);
    return NextResponse.json(
      { error: 'Cannot access spreadsheet — check service account permissions', detail: metaErr?.message },
      { status: 500 }
    );
  }

  // Step 2 — read the ClientConfig tab
  try {
    const clients = await getClientConfigs();
    console.log('[clients] Rows returned:', clients.length);
    return NextResponse.json({ clients });
  } catch (err: any) {
    console.error('[clients] getClientConfigs FAILED:', err?.message ?? err);
    console.error('[clients] Error code:', err?.code);
    console.error('[clients] Error status:', err?.status);
    console.error('[clients] Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json(
      { error: 'Failed to read Client Config tab', detail: err?.message },
      { status: 500 }
    );
  }
}
