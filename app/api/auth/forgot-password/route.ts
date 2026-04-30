import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userExists } from '@/lib/auth';
import { countRecentResets, createPasswordReset } from '@/lib/passwordReset';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || '').trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    // Rate limit: max 3 requests per email per hour
    const recentCount = await countRecentResets(email).catch(() => 0);
    if (recentCount >= 3) {
      // Return 200 to avoid confirming the email exists / leaking rate-limit info to attackers
      return NextResponse.json({ ok: true });
    }

    // Always send 200 — never reveal whether the email exists (anti-enumeration)
    const known = await userExists(email).catch(() => null);

    if (known) {
      const plaintextToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(plaintextToken, 10);

      await createPasswordReset(email, tokenHash);

      const appUrl = process.env.APP_URL || 'https://app.tradesaioperator.uk';
      const resetUrl = `${appUrl}/reset-password?token=${plaintextToken}`;

      await sendPasswordResetEmail(email, resetUrl).catch((err) => {
        console.error('Failed to send reset email:', err);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    // Still return 200 — prevents timing attacks that reveal server errors
    return NextResponse.json({ ok: true });
  }
}
