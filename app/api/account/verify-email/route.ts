import { NextRequest, NextResponse } from 'next/server';
import { findAndValidateChangeToken, markChangeTokenUsed } from '@/lib/emailChange';
import { updateAdminUserEmail } from '@/lib/sheets';
import { logAudit, getRequestMeta } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', req.url));
  }

  const { ip, user_agent } = getRequestMeta(req);

  try {
    const result = await findAndValidateChangeToken(token);

    if (!result.valid) {
      const reason = result.error === 'expired' ? 'expired_link' : 'invalid_link';
      logAudit({
        actor_email: result.currentEmail || 'anonymous',
        actor_role: 'anonymous',
        action: 'email.change.verified',
        target: result.newEmail || 'unknown',
        ip,
        user_agent,
        result: 'failure',
        metadata: { reason: result.error === 'expired' ? 'expired' : 'invalid_token', old_email: result.currentEmail },
      });
      return NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));
    }

    await updateAdminUserEmail(result.currentEmail, result.newEmail);
    await markChangeTokenUsed(result.rowIndex);

    logAudit({
      actor_email: result.newEmail,
      actor_role: 'anonymous',
      action: 'email.change.verified',
      target: result.newEmail,
      ip,
      user_agent,
      result: 'success',
      metadata: { old_email: result.currentEmail },
    });

    const response = NextResponse.redirect(new URL('/login?email_changed=true', req.url));
    response.cookies.set('tradesai_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Verify email error:', err);
    return NextResponse.redirect(new URL('/login?error=invalid_link', req.url));
  }
}
