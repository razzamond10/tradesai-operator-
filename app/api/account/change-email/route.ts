import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { countRecentChanges, createEmailChange } from '@/lib/emailChange';
import { sendChangeEmailVerification } from '@/lib/email';
import { getAdminUsers } from '@/lib/passwordReset';
import { logAudit, getRequestMeta } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const RATE_LIMIT = 3;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('tradesai_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { newEmail } = await req.json();
    if (!newEmail || typeof newEmail !== 'string') {
      return NextResponse.json({ error: 'newEmail is required' }, { status: 400 });
    }
    const trimmed = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const currentEmail = user.email.toLowerCase().trim();
    if (trimmed === currentEmail) {
      return NextResponse.json({ error: 'New email must differ from current email' }, { status: 400 });
    }

    // Rate limit: max 3 change requests per hour per currentEmail
    const recent = await countRecentChanges(currentEmail);
    if (recent >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many change requests. Please wait an hour.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    }

    // Collision check: reject if newEmail already belongs to another user
    const existing = await getAdminUsers();
    const taken = existing.some((u) => u.email.toLowerCase() === trimmed);
    if (taken) {
      return NextResponse.json({ error: 'Email already taken' }, { status: 409 });
    }

    const plaintextToken = await createEmailChange(currentEmail, trimmed);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
    const verifyUrl = `${baseUrl}/api/account/verify-email?token=${plaintextToken}`;

    await sendChangeEmailVerification({
      to: trimmed,
      verifyUrl,
      currentEmail,
      newEmail: trimmed,
    });

    const { ip, user_agent } = getRequestMeta(req);
    logAudit({
      actor_email: user.email,
      actor_role: user.role as 'admin' | 'client',
      action: 'email.change.requested',
      target: trimmed,
      ip,
      user_agent,
      result: 'success',
      metadata: { old_email: currentEmail },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Change email error:', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
