import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { checkRetell } from '@/lib/platform-health/retell';
import { checkTwilio } from '@/lib/platform-health/twilio';
import { checkMake }   from '@/lib/platform-health/make';
import { checkVercel } from '@/lib/platform-health/vercel';
import type { VendorHealth } from '@/lib/platform-health/types';

const STATUS_RANK: Record<VendorHealth['status'], number> = {
  critical: 3,
  warning:  2,
  unknown:  1,
  healthy:  0,
};

function worstStatus(vendors: VendorHealth[]): VendorHealth['status'] {
  return vendors.reduce<VendorHealth['status']>((worst, v) => {
    return STATUS_RANK[v.status] > STATUS_RANK[worst] ? v.status : worst;
  }, 'healthy');
}

export const dynamic = 'force-dynamic';

export async function GET() {
  // Admin-only endpoint
  const token = cookies().get('tradesai_token')?.value;
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await verifyJWT(token);
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Run all vendor checks in parallel; isolate failures
  const results = await Promise.allSettled([
    checkRetell(),
    checkTwilio(),
    checkMake(),
    checkVercel(),
  ]);

  const vendors: VendorHealth[] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;

    // Vendor check threw unexpectedly — return a safe unknown record
    const fallbackNames: VendorHealth['vendor'][] = ['retell', 'twilio', 'make', 'vercel'];
    const displayNames = ['Retell AI', 'Twilio', 'Make.com', 'Vercel'];
    const topUpUrls = [
      'https://dashboard.retellai.com/billing',
      'https://console.twilio.com/billing/recharge',
      'https://eu1.make.com/profile/subscription',
      'https://vercel.com/account/billing',
    ];
    return {
      vendor:          fallbackNames[i],
      displayName:     displayNames[i],
      status:          'unknown' as const,
      balance:         null,
      currency:        'USD',
      usageThisMonth:  null,
      lastChecked:     new Date().toISOString(),
      errorMessage:    (r.reason as any)?.message ?? 'Check failed unexpectedly',
      topUpUrl:        topUpUrls[i],
      rawData:         null,
    };
  });

  return Response.json(
    {
      vendors,
      checkedAt:     new Date().toISOString(),
      overallStatus: worstStatus(vendors),
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
