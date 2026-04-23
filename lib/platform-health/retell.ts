import type { VendorHealth } from './types';

export async function checkRetell(): Promise<VendorHealth> {
  const lastChecked = new Date().toISOString();
  const apiKey = process.env.RETELL_API_KEY ?? '';

  if (!apiKey) {
    return {
      vendor: 'retell',
      displayName: 'Retell AI',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: 'RETELL_API_KEY env var not set',
      topUpUrl: 'https://dashboard.retellai.com/billing',
      rawData: null,
    };
  }

  let rawData: any = null;

  try {
    const res = await fetch('https://api.retellai.com/v2/list-calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 1 }),
    });

    rawData = { status: res.status };

    if (res.status === 401 || res.status === 403) {
      return {
        vendor: 'retell',
        displayName: 'Retell AI',
        status: 'critical',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: 'API key invalid or account suspended',
        topUpUrl: 'https://dashboard.retellai.com/billing',
        rawData,
      };
    }

    if (!res.ok) {
      return {
        vendor: 'retell',
        displayName: 'Retell AI',
        status: 'unknown',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: `Unexpected response: HTTP ${res.status}`,
        topUpUrl: 'https://dashboard.retellai.com/billing',
        rawData,
      };
    }

    const json = await res.json().catch(() => ({}));
    rawData = json;

    return {
      vendor: 'retell',
      displayName: 'Retell AI',
      status: 'healthy',
      balance: null, // Retell doesn't expose balance via API
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: null,
      topUpUrl: 'https://dashboard.retellai.com/billing',
      rawData,
    };
  } catch (err: any) {
    return {
      vendor: 'retell',
      displayName: 'Retell AI',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: err?.message ?? 'Network error',
      topUpUrl: 'https://dashboard.retellai.com/billing',
      rawData,
    };
  }
}
