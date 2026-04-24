import type { VendorHealth } from './types';

export async function checkVercel(): Promise<VendorHealth> {
  const lastChecked = new Date().toISOString();
  const token = process.env.VERCEL_API_TOKEN ?? '';

  if (!token) {
    return {
      vendor: 'vercel',
      displayName: 'Vercel',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: 'VERCEL_API_TOKEN env var not set',
      topUpUrl: 'https://vercel.com/account/billing',
      rawData: null,
    };
  }

  let rawData: any = null;

  try {
    // Use /v1/user to verify the token is valid
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${token}` },
    });

    rawData = { status: res.status };

    if (res.status === 401 || res.status === 403) {
      return {
        vendor: 'vercel',
        displayName: 'Vercel',
        status: 'critical',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: 'API token invalid or account suspended',
        topUpUrl: 'https://vercel.com/account/billing',
        rawData,
      };
    }

    if (!res.ok) {
      return {
        vendor: 'vercel',
        displayName: 'Vercel',
        status: 'unknown',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: `Unexpected response: HTTP ${res.status}`,
        topUpUrl: 'https://vercel.com/account/billing',
        rawData,
      };
    }

    const json = await res.json().catch(() => ({}));
    rawData = json;

    // Step 2 — count deployments this calendar month
    let usageThisMonth: number | null = null;
    try {
      const teamId: string | undefined = json?.user?.defaultTeamId ?? json?.defaultTeamId;
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const deploymentsUrl = teamId
        ? `https://api.vercel.com/v6/deployments?teamId=${encodeURIComponent(teamId)}&limit=100&since=${startOfMonth}`
        : `https://api.vercel.com/v6/deployments?limit=100&since=${startOfMonth}`;

      const depRes = await fetch(deploymentsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (depRes.ok) {
        const depJson = await depRes.json();
        rawData.deployments = depJson;
        const list: unknown[] = depJson?.deployments ?? depJson?.data ?? [];
        usageThisMonth = list.length;
      }
    } catch {
      // Non-fatal — usageThisMonth stays null
    }

    return {
      vendor: 'vercel',
      displayName: 'Vercel',
      status: 'healthy',
      balance: null,
      currency: 'USD',
      usageThisMonth,
      lastChecked,
      errorMessage: null,
      topUpUrl: 'https://vercel.com/account/billing',
      rawData,
    };
  } catch (err: any) {
    return {
      vendor: 'vercel',
      displayName: 'Vercel',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: err?.message ?? 'Network error',
      topUpUrl: 'https://vercel.com/account/billing',
      rawData,
    };
  }
}
