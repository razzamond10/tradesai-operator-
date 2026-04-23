export interface VendorHealth {
  vendor: 'retell' | 'twilio' | 'make' | 'vercel';
  displayName: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  balance: number | null;       // USD; null when not applicable
  currency: string;
  usageThisMonth: number | null;
  lastChecked: string;          // ISO 8601 timestamp
  errorMessage: string | null;
  topUpUrl: string;
  rawData: any;                 // full API response for debugging
}
