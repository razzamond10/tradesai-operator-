import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { getClientConfig, requestClientDeletion, logInteraction } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

// DELETE /api/account — GDPR erasure request (soft-delete with 30-day grace period)
// Hard deletion cron job is a separate task — this is soft-delete only.
// Note: email confirmation not yet implemented — no email pattern exists in codebase.
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('tradesai_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.clientId) return NextResponse.json({ error: 'No client account associated with this session' }, { status: 400 });

    // Admin accounts cannot self-delete via this endpoint
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted via this endpoint' }, { status: 403 });
    }

    const config = await getClientConfig(user.clientId);
    if (!config) return NextResponse.json({ error: 'Client config not found' }, { status: 404 });

    // Mark account as pending deletion (status = pending_deletion:<iso-date>)
    const { scheduledAt } = await requestClientDeletion(user.clientId);

    // Log the deletion request to the client's own InteractionsLog (non-fatal)
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    logInteraction(config.sheetId, {
      timestamp,
      callerName: user.name ?? user.email,
      phone: config.phone,
      intent: 'gdpr_deletion_request',
      outcome: 'pending',
      notes: `GDPR deletion requested. Scheduled purge: ${scheduledAt}. 30-day grace period applies.`,
    }).catch(() => {/* non-fatal */});

    // TODO: Send confirmation email to client at config.email / user.email
    // No email pattern currently exists in the codebase — implement as separate task.

    return NextResponse.json({
      ok: true,
      message: 'Deletion request received. Your account data will be permanently deleted after a 30-day grace period.',
      scheduledAt,
      note: 'HMRC-required accounting records (6 years) are exempt from immediate deletion.',
    });
  } catch (err: any) {
    console.error('GDPR deletion error:', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
