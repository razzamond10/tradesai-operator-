import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  findAndValidateResetToken,
  markTokenUsed,
  upsertAdminUserPassword,
} from '@/lib/passwordReset';
import { userExists } from '@/lib/auth';
import { logAudit, getRequestMeta } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, newPassword } = body || {};

    if (!token || typeof token !== 'string' || token.length !== 64) {
      return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one uppercase letter' }, { status: 400 });
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one number' }, { status: 400 });
    }

    const result = await findAndValidateResetToken(token);
    const { ip, user_agent } = getRequestMeta(req);

    if (!result.valid) {
      const reason = result.error === 'expired' ? 'expired' : 'invalid_token';
      logAudit({
        actor_email: result.email || 'anonymous',
        actor_role: 'anonymous',
        action: 'password.reset.completed',
        target: result.email || 'unknown',
        ip,
        user_agent,
        result: 'failure',
        metadata: { reason },
      });
      const msg =
        result.error === 'expired' ? 'This reset link has expired. Please request a new one.' :
        result.error === 'used'    ? 'This reset link has already been used. Please request a new one.' :
                                     'Invalid reset link. Please request a new one.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Look up user metadata (name, role) for the AdminUsers upsert
    const known = await userExists(result.email).catch(() => null);
    const name = known?.name || result.email;
    const role = known?.role || 'client';

    await upsertAdminUserPassword(result.email, name, role, passwordHash);
    await markTokenUsed(result.rowIndex);

    logAudit({
      actor_email: result.email,
      actor_role: (role as 'admin' | 'client') || 'anonymous',
      action: 'password.reset.completed',
      target: result.email,
      ip,
      user_agent,
      result: 'success',
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Server error — please try again' }, { status: 500 });
  }
}
