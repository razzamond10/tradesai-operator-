import type { VendorHealth } from './types';

const BASE = 'https://eu1.make.com/api/v2';

export async function checkMake(): Promise<VendorHealth> {
  const lastChecked = new Date().toISOString();
  const token = process.env.MAKE_API_TOKEN ?? '';

  if (!token) {
    return {
      vendor: 'make',
      displayName: 'Make.com',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: 'MAKE_API_TOKEN env var not set',
      topUpUrl: 'https://eu1.make.com/profile/subscription',
      rawData: null,
    };
  }

  const headers = { Authorization: `Token ${token}`, 'Content-Type': 'application/json' };
  let rawData: any = {};

  try {
    // Step 1 — verify auth and get user
    const userRes = await fetch(`${BASE}/users/me`, { headers });
    rawData.userStatus = userRes.status;

    if (userRes.status === 401 || userRes.status === 403) {
      return {
        vendor: 'make',
        displayName: 'Make.com',
        status: 'critical',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: 'API token invalid or account suspended',
        topUpUrl: 'https://eu1.make.com/profile/subscription',
        rawData,
      };
    }

    if (!userRes.ok) {
      return {
        vendor: 'make',
        displayName: 'Make.com',
        status: 'unknown',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: `Unexpected response from /users/me: HTTP ${userRes.status}`,
        topUpUrl: 'https://eu1.make.com/profile/subscription',
        rawData,
      };
    }

    const userJson = await userRes.json();
    rawData.user = userJson;

    // Step 2 — get organisations to read operations usage
    const orgsRes = await fetch(`${BASE}/organizations`, { headers });
    rawData.orgsStatus = orgsRes.status;

    if (!orgsRes.ok) {
      // Auth works but can't read orgs — return healthy with unknown usage
      return {
        vendor: 'make',
        displayName: 'Make.com',
        status: 'healthy',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: null,
        topUpUrl: 'https://eu1.make.com/profile/subscription',
        rawData,
      };
    }

    const orgsJson = await orgsRes.json();
    rawData.orgs = orgsJson;

    // Pick the first organisation (most accounts have one)
    const orgs: any[] = orgsJson.organizations ?? orgsJson.data ?? [];
    const org = orgs[0];

    if (!org) {
      return {
        vendor: 'make',
        displayName: 'Make.com',
        status: 'healthy',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage: null,
        topUpUrl: 'https://eu1.make.com/profile/subscription',
        rawData,
      };
    }

    const used      = Number(org.operations ?? 0);
    const limit     = Number(org.operationsLimit ?? org.plan?.operations ?? 0);
    const remaining = limit > 0 ? limit - used : null;
    const pctRemain = limit > 0 ? (remaining! / limit) * 100 : null;

    let status: VendorHealth['status'] = 'healthy';
    if (pctRemain !== null) {
      if (pctRemain < 10)  status = 'critical';
      else if (pctRemain < 25) status = 'warning';
    }

    return {
      vendor: 'make',
      displayName: 'Make.com',
      status,
      balance: null,
      currency: 'USD',
      usageThisMonth: used > 0 ? used : null,
      lastChecked,
      errorMessage: null,
      topUpUrl: 'https://eu1.make.com/profile/subscription',
      rawData,
    };
  } catch (err: any) {
    return {
      vendor: 'make',
      displayName: 'Make.com',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: err?.message ?? 'Network error',
      topUpUrl: 'https://eu1.make.com/profile/subscription',
      rawData,
    };
  }
}
