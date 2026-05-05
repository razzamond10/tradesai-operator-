import { NextRequest, NextResponse } from 'next/server';
import { validateUser, signJWT } from '@/lib/auth';
import { getClientStatus } from '@/lib/sheets';
import { checkLimit, incrementLimit, clearLimit } from '@/lib/rateLimit';
import { SESSION_DURATIONS } from '@/lib/jwt';
import { logAudit, getRequestMeta } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';

    const { allowed } = checkLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': '900' } },
      );
    }

    const { email, password, rememberMe = false } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { ip: auditIp, user_agent } = getRequestMeta(req);
    const normalEmail = email.toLowerCase().trim();
    const user = await validateUser(normalEmail, password);

    if (!user) {
      incrementLimit(ip);
      logAudit({
        actor_email: normalEmail,
        actor_role: 'anonymous',
        action: 'login.failed',
        target: normalEmail,
        ip: auditIp,
        user_agent,
        result: 'failure',
        metadata: { reason: 'wrong_password' },
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Block paused client accounts before issuing JWT — admin/va are never blocked
    if (user.role === 'client' && user.clientId) {
      const status = await getClientStatus(user.clientId);
      if (status === 'paused') {
        return NextResponse.json({ error: 'paused' }, { status: 403 });
      }
    }

    clearLimit(ip);

    logAudit({
      actor_email: user.email,
      actor_role: user.role as 'admin' | 'client',
      action: 'login.success',
      target: user.email,
      ip: auditIp,
      user_agent,
      result: 'success',
    });

    const duration = rememberMe ? SESSION_DURATIONS.long : SESSION_DURATIONS.short;
    const token = await signJWT(user, duration);

    const response = NextResponse.json({ ok: true, role: user.role, name: user.name });
    response.cookies.set('tradesai_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: duration,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
