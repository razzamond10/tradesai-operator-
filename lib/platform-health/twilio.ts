import type { VendorHealth } from './types';

export async function checkTwilio(): Promise<VendorHealth> {
  const lastChecked = new Date().toISOString();
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? '';
  const authToken  = process.env.TWILIO_AUTH_TOKEN  ?? '';

  if (!accountSid || !authToken) {
    return {
      vendor: 'twilio',
      displayName: 'Twilio',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: 'TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env var not set',
      topUpUrl: 'https://console.twilio.com/billing/recharge',
      rawData: null,
    };
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  let rawData: any = null;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`,
      {
        headers: { Authorization: `Basic ${credentials}` },
      }
    );

    rawData = { status: res.status };

    if (!res.ok) {
      return {
        vendor: 'twilio',
        displayName: 'Twilio',
        status: res.status === 401 || res.status === 403 ? 'critical' : 'unknown',
        balance: null,
        currency: 'USD',
        usageThisMonth: null,
        lastChecked,
        errorMessage:
          res.status === 401 || res.status === 403
            ? 'API credentials invalid or account suspended'
            : `Unexpected response: HTTP ${res.status}`,
        topUpUrl: 'https://console.twilio.com/billing/recharge',
        rawData,
      };
    }

    const json = await res.json();
    rawData = json;

    const balance  = parseFloat(json.balance ?? '0');
    const currency = (json.currency ?? 'USD').toUpperCase();

    let status: VendorHealth['status'];
    if (balance < 5)  status = 'critical';
    else if (balance < 20) status = 'warning';
    else status = 'healthy';

    return {
      vendor: 'twilio',
      displayName: 'Twilio',
      status,
      balance,
      currency,
      usageThisMonth: null,
      lastChecked,
      errorMessage: null,
      topUpUrl: 'https://console.twilio.com/billing/recharge',
      rawData,
    };
  } catch (err: any) {
    return {
      vendor: 'twilio',
      displayName: 'Twilio',
      status: 'unknown',
      balance: null,
      currency: 'USD',
      usageThisMonth: null,
      lastChecked,
      errorMessage: err?.message ?? 'Network error',
      topUpUrl: 'https://console.twilio.com/billing/recharge',
      rawData,
    };
  }
}
