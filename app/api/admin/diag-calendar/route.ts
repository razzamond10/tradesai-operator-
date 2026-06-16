import { NextRequest } from 'next/server';
import { requireAdminOrVA } from '@/lib/apiAuth';
import { google } from 'googleapis';
import { getCalendarAuth } from '@/lib/google';

export async function GET(req: NextRequest) {
  try {
    await requireAdminOrVA(req);
    const calendar = google.calendar({ version: 'v3', auth: getCalendarAuth() });
    const calendarId = 'admin@tradesaioperator.uk';
    const testEventId = '0gpg1prd5pho9oqkjjj7cile4i';

    const result: any = { calendarId, testEventId };

    // Test 1: events.get for the manual eventId
    try {
      const e = await calendar.events.get({ calendarId, eventId: testEventId });
      result.get_success = true;
      result.get_summary = e.data.summary;
      result.get_id = e.data.id;
    } catch (err) {
      result.get_success = false;
      result.get_error = (err as Error).message;
    }

    // Test 2: events.list — show real IDs from recent events
    try {
      const list = await calendar.events.list({
        calendarId,
        maxResults: 10,
        timeMin: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
      });
      result.list_count = list.data.items?.length || 0;
      result.list_items = (list.data.items || []).map(e => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
      }));
    } catch (err) {
      result.list_error = (err as Error).message;
    }

    return Response.json(result);
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
