import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';
import type { VendorHealth } from '@/lib/platform-health/types';

// Vendor icons (emoji fallbacks — no external deps needed)
const VENDOR_ICONS: Record<string, string> = {
  retell:  '🎙️',
  twilio:  '📞',
  make:    '⚙️',
  vercel:  '▲',
};

const STATUS_COLORS: Record<VendorHealth['status'], { bg: string; border: string; text: string; dot: string }> = {
  healthy:  { bg: '#EDFDF3', border: '#86EFAC', text: '#15803D', dot: '#22C55E' },
  warning:  { bg: '#FFFBEB', border: '#FCD34D', text: '#B45309', dot: '#F59E0B' },
  critical: { bg: '#FEF2F2', border: '#FCA5A5', text: '#B91C1C', dot: '#EF4444' },
  unknown:  { bg: '#F8F8FC', border: '#D1D5DB', text: '#6B7280', dot: '#9CA3AF' },
};

const STATUS_LABELS: Record<VendorHealth['status'], string> = {
  healthy:  'Healthy',
  warning:  'Warning',
  critical: 'Critical',
  unknown:  'Unknown',
};

const OVERALL_STRIPE: Record<VendorHealth['status'], string> = {
  healthy:  '#22C55E',
  warning:  '#F59E0B',
  critical: '#EF4444',
  unknown:  '#9CA3AF',
};

function formatBalance(v: VendorHealth): string {
  if (v.balance !== null) {
    return `${v.currency} ${v.balance.toFixed(2)}`;
  }
  if (v.usageThisMonth !== null) {
    return `${v.usageThisMonth.toLocaleString()} ops`;
  }
  return '—';
}

function formatChecked(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface HealthResponse {
  vendors: VendorHealth[];
  checkedAt: string;
  overallStatus: VendorHealth['status'];
  error?: string;
}

async function fetchHealth(baseUrl: string): Promise<HealthResponse> {
  // Forward the auth cookie so the API route can verify the admin session
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const res = await fetch(`${baseUrl}/api/platform-health`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return {
        vendors: [],
        checkedAt: new Date().toISOString(),
        overallStatus: 'unknown',
        error: j.error ?? `HTTP ${res.status}`,
      };
    }
    return res.json();
  } catch (err: any) {
    return {
      vendors: [],
      checkedAt: new Date().toISOString(),
      overallStatus: 'unknown',
      error: err?.message ?? 'Failed to fetch health data',
    };
  }
}

export default async function PlatformHealthPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/login');

  // Derive base URL for the internal API call
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

  const { vendors, checkedAt, overallStatus, error } = await fetchHealth(baseUrl);
  const stripe = OVERALL_STRIPE[overallStatus];

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F8', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* ── Header (matches AdminClient.tsx) ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(90deg,#1A0A3C 0%,#26145A 100%)',
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        borderBottom: '2px solid #C9A84C',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.jpg" alt="logo" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '2px' }} />
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff' }}>TradesAI Operator</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Platform Health</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Overall status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
            <span style={{ width: '7px', height: '7px', background: stripe, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 6px ${stripe}88` }} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Overall: </span>
            <span style={{ color: '#fff' }}>{STATUS_LABELS[overallStatus]}</span>
          </div>
          <Link href="/admin" style={{
            padding: '6px 14px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.10)', color: '#fff',
            fontSize: '11px', fontWeight: 600, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>← Portfolio</Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 28px 48px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 900, color: '#1A0A3C', marginBottom: '3px' }}>
            Platform Health
          </div>
          <div style={{ fontSize: '12px', color: '#7468A0' }}>
            Vendor API status &amp; balances · last checked {checkedAt ? formatChecked(checkedAt) : '—'}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#B91C1C', fontSize: '12px', marginBottom: '20px' }}>
            ⚠ {error}
          </div>
        )}

        {/* Vendor cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {vendors.map((v) => {
            const sc = STATUS_COLORS[v.status];
            const icon = VENDOR_ICONS[v.vendor] ?? '🔌';
            return (
              <div key={v.vendor} style={{
                background: '#fff', borderRadius: '12px',
                border: '1px solid #D8D0F0', boxShadow: '0 2px 8px rgba(26,10,60,0.07)',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                {/* Colour stripe */}
                <div style={{ height: '3px', background: sc.dot }} />

                <div style={{ padding: '18px 18px 14px' }}>
                  {/* Vendor name + icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: '#EDE8FF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '18px',
                      }}>{icon}</div>
                      <div>
                        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 800, color: '#1A0A3C' }}>{v.displayName}</div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '3px 9px', borderRadius: '20px',
                      background: sc.bg, border: `1px solid ${sc.border}`,
                      fontSize: '10px', fontWeight: 700, color: sc.text,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                      {STATUS_LABELS[v.status]}
                    </div>
                  </div>

                  {/* Balance / usage — large display */}
                  <div style={{
                    fontFamily: '"Inter Tight",sans-serif',
                    fontSize: '28px', fontWeight: 900, color: '#1A0A3C',
                    marginBottom: '4px', letterSpacing: '-0.5px',
                  }}>
                    {formatBalance(v)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#7468A0', marginBottom: '12px' }}>
                    {v.balance !== null ? 'account balance' : v.usageThisMonth !== null ? 'operations used this month' : 'balance not available via API'}
                  </div>

                  {/* Error message */}
                  {v.errorMessage && (
                    <div style={{
                      padding: '8px 10px', background: '#FEF2F2',
                      border: '1px solid #FCA5A5', borderRadius: '6px',
                      fontSize: '10.5px', color: '#B91C1C', marginBottom: '12px',
                      lineHeight: 1.4,
                    }}>
                      {v.errorMessage}
                    </div>
                  )}

                  {/* Last checked */}
                  <div style={{ fontSize: '9.5px', color: '#9CA3AF', marginBottom: '14px' }}>
                    Checked {formatChecked(v.lastChecked)}
                  </div>
                </div>

                {/* Top up CTA */}
                <div style={{ padding: '0 18px 18px', marginTop: 'auto' }}>
                  <a
                    href={v.topUpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '9px 16px', borderRadius: '8px',
                      background: v.status === 'critical' ? '#EF4444' : v.status === 'warning' ? '#F59E0B' : '#3D1FA8',
                      color: '#fff', fontSize: '11.5px', fontWeight: 700,
                      textDecoration: 'none', fontFamily: '"Inter",sans-serif',
                    }}
                  >
                    {v.status === 'critical' ? '⚡ Top up now' : v.status === 'warning' ? '⚠ Top up soon' : '↗ Billing dashboard'}
                  </a>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {!error && vendors.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#7468A0', fontSize: '13px' }}>
              No vendor data available. Check that API keys are configured in Vercel environment variables.
            </div>
          )}
        </div>

        {/* System section nav hint */}
        <div style={{ marginTop: '32px', padding: '14px 18px', background: '#fff', borderRadius: '10px', border: '1px solid #D8D0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1A0A3C', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '2px' }}>SYSTEM</div>
            <div style={{ fontSize: '11px', color: '#7468A0' }}>This page auto-refreshes every 6 hours via Vercel cron. Visit <code style={{ background: '#F2F2F8', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>/api/platform-health</code> for raw JSON.</div>
          </div>
          <Link href="/admin/settings" style={{
            padding: '7px 14px', borderRadius: '8px',
            background: '#F2F2F8', color: '#3D1FA8',
            fontSize: '11px', fontWeight: 600, textDecoration: 'none',
            border: '1px solid #D8D0F0',
          }}>Platform Settings →</Link>
        </div>
      </main>
    </div>
  );
}
