import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { logAudit, getRequestMeta } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const { ip, user_agent } = getRequestMeta(req);

  const token = req.cookies.get('tradesai_token')?.value;
  if (token) {
    const user = await verifyJWT(token).catch(() => null);
    if (user) {
      logAudit({
        actor_email: user.email,
        actor_role: user.role as 'admin' | 'client',
        action: 'logout',
        target: user.email,
        ip,
        user_agent,
        result: 'success',
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('tradesai_token', '', { maxAge: 0, path: '/' });
  return res;
}
