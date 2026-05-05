import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { setClientStatus } from '@/lib/sheets';
import { logAudit, getRequestMeta } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('tradesai_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifyJWT(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const clientId = decodeURIComponent(params.id);
    const body = await req.json();
    const { status } = body;

    if (status !== 'active' && status !== 'paused') {
      return NextResponse.json({ error: 'Invalid status — must be "active" or "paused"' }, { status: 400 });
    }

    await setClientStatus(clientId, status);

    const { ip, user_agent } = getRequestMeta(req);
    logAudit({
      actor_email: session.email,
      actor_role: 'admin',
      action: status === 'paused' ? 'account.paused' : 'account.resumed',
      target: clientId,
      client_id: clientId,
      ip,
      user_agent,
      result: 'success',
    });

    return NextResponse.json({ clientId, status, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('setClientStatus error:', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
