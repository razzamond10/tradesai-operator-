import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { readSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

const SHEET_ID = process.env.MASTER_SHEET_ID!;
const HEADERS = ['timestamp', 'actor_email', 'actor_role', 'action', 'target', 'client_id', 'ip', 'user_agent', 'result', 'metadata'];

function rowToObj(row: string[]) {
  return {
    timestamp:   row[0] || '',
    actor_email: row[1] || '',
    actor_role:  row[2] || '',
    action:      row[3] || '',
    target:      row[4] || '',
    client_id:   row[5] || '',
    ip:          row[6] || '',
    user_agent:  row[7] || '',
    result:      row[8] || '',
    metadata:    row[9] || '',
  };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('tradesai_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifyJWT(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const actor  = searchParams.get('actor')?.toLowerCase() || '';
    const action = searchParams.get('action') || '';
    const from   = searchParams.get('from') || '';
    const to     = searchParams.get('to') || '';
    const limit  = Math.min(parseInt(searchParams.get('limit') || '500', 10), 500);

    const rows = await readSheet(SHEET_ID, `AuditLog!A2:J`);

    let events = rows.map(rowToObj).reverse(); // most recent first

    if (actor)  events = events.filter(e => e.actor_email.toLowerCase().includes(actor));
    if (action) events = events.filter(e => e.action === action);
    if (from)   events = events.filter(e => e.timestamp >= from);
    if (to)     events = events.filter(e => e.timestamp <= to + 'T23:59:59Z');

    events = events.slice(0, limit);

    return NextResponse.json({ events, total: events.length });
  } catch (err: any) {
    console.error('Audit log fetch error:', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
