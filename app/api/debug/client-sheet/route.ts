import { NextRequest, NextResponse } from 'next/server';
import { readSheet, getSpreadsheetMeta } from '@/lib/sheets';

const KNOWN_SHEET_ID = '1Fb4Hkr_r7dtsLx8Hs7vDliPoHpwZ7Oe-YPEPtYZPXD0';

export async function GET(req: NextRequest) {
  const sheetId = req.nextUrl.searchParams.get('sheetId') || KNOWN_SHEET_ID;
  const out: Record<string, any> = { sheetId };

  try {
    const meta = await getSpreadsheetMeta(sheetId);
    out.title = meta.properties?.title;
    out.tabs = meta.sheets?.map((s: any) => s.properties?.title) ?? [];
  } catch (e: any) {
    return NextResponse.json({ error: 'Meta fetch failed', detail: e.message }, { status: 500 });
  }

  // Read first 3 data rows from each tab (raw, no mapping)
  const samples: Record<string, any> = {};
  for (const tab of out.tabs as string[]) {
    try {
      const rows = await readSheet(sheetId, `'${tab}'!A1:J3`);
      samples[tab] = rows;
    } catch (e: any) {
      samples[tab] = { error: e.message };
    }
  }
  out.samples = samples;

  return NextResponse.json(out);
}
