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

    const orgId = org.id as number | undefined;

    // Step 3 — fetch organisation usage for ops-used-this-month
    let usageThisMonth: number | null = org.operations > 0 ? Number(org.operations) : null;

    if (orgId) {
      try {
        const usageRes = await fetch(`${BASE}/organizations/${orgId}/usage`, { headers });
        if (usageRes.ok) {
          const usageJson = await usageRes.json();
          rawData.usage = usageJson;
          // Make API returns usage under several possible paths — try the most common ones
          const usageArray: Array<{ date?: string; operations?: number }> | undefined =
            usageJson?.usage?.data ?? usageJson?.data;

          if (Array.isArray(usageArray)) {
            const now = new Date();
            const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
            let monthTotal = 0;
            for (const entry of usageArray) {
              if (typeof entry?.date === 'string' && entry.date.startsWith(yearMonth)) {
                monthTotal += Number(entry.operations ?? 0);
              }
            }
            usageThisMonth = monthTotal;
          }
        }
      } catch {
        // Non-fatal — keep usageThisMonth from orgs response
      }
    }

    const limit     = Number(org.operationsLimit ?? org.plan?.operations ?? 0);
    const remaining = limit > 0 ? limit - (usageThisMonth ?? 0) : null;
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
      usageThisMonth,
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
