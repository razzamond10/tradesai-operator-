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

    return {
      vendor: 'vercel',
      displayName: 'Vercel',
      status: 'healthy',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
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
