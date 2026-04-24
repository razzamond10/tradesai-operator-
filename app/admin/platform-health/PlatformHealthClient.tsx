'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import type { VendorHealth } from '@/lib/platform-health/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface HealthResponse {
  vendors: VendorHealth[];
  checkedAt: string;
  overallStatus: VendorHealth['status'];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function minutesAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 minute ago';
  return `${diff} minutes ago`;
}

function formatBalance(v: VendorHealth): string | null {
  if (v.balance !== null) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: v.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v.balance);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const STATUS_DOT: Record<VendorHealth['status'], string> = {
  healthy:  'bg-green-500',
  warning:  'bg-amber-500',
  critical: 'bg-red-500',
  unknown:  'bg-slate-400',
};

const STATUS_PILL: Record<VendorHealth['status'], string> = {
  healthy:  'bg-green-50 text-green-700 border border-green-200',
  warning:  'bg-amber-50 text-amber-700 border border-amber-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
  unknown:  'bg-slate-50 text-slate-600 border border-slate-200',
};

const STATUS_HEADLINE: Record<VendorHealth['status'], string> = {
  healthy:  'All Systems Operational',
  warning:  'Action Needed Soon',
  critical: 'Urgent Attention Required',
  unknown:  'Status Check Pending',
};

const VENDOR_ICONS: Record<VendorHealth['vendor'], string> = {
  retell: '🎙️',
  twilio: '📞',
  make:   '⚙️',
  vercel: '▲',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-100 rounded w-24" />
        <div className="h-5 bg-slate-100 rounded-full w-16" />
      </div>
      <div className="h-9 bg-slate-100 rounded w-28 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-36 mb-4" />
      <div className="h-8 bg-slate-100 rounded w-full" />
    </div>
  );
}

function VendorCard({ vendor }: { vendor: VendorHealth }) {
  const balanceStr  = formatBalance(vendor);
  const showTopUp   = vendor.status === 'warning' || vendor.status === 'critical';
  const topUpLabel  = vendor.status === 'critical' ? '⚡ Top up now' : 'Top up soon';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Colour stripe */}
      <div className={`h-1 w-full ${STATUS_DOT[vendor.status]}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top row: name + status pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{VENDOR_ICONS[vendor.vendor]}</span>
            <span className="font-semibold text-sm text-slate-800">{vendor.displayName}</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_PILL[vendor.status]}`}>
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </span>
        </div>

        {/* Balance / usage — main figure */}
        <div>
          {balanceStr !== null ? (
            <p className="text-3xl font-bold text-slate-900 leading-tight">{balanceStr}</p>
          ) : vendor.usageThisMonth !== null ? (
            <p className="text-3xl font-bold text-slate-900 leading-tight">
              {vendor.usageThisMonth.toLocaleString()}
              <span className="text-base font-normal text-slate-500 ml-1">ops this month</span>
            </p>
          ) : (
            <p className="text-3xl font-bold text-slate-400">—</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Last checked {minutesAgo(vendor.lastChecked)}
          </p>
        </div>

        {/* Error message */}
        {vendor.errorMessage && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 leading-snug">{vendor.errorMessage}</p>
          </div>
        )}
      </div>

      {/* Top-up CTA — only warning/critical */}
      {showTopUp && (
        <div className="px-5 pb-5">
          <a
            href={vendor.topUpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center w-full py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 ${
              vendor.status === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {topUpLabel}
          </a>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PlatformHealthClient({ adminName }: { adminName: string }) {
  const [vendors,       setVendors]       = useState<VendorHealth[]>([]);
  const [checkedAt,     setCheckedAt]     = useState<string>('');
  const [overallStatus, setOverallStatus] = useState<VendorHealth['status']>('unknown');
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/platform-health');
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as HealthResponse;
      setVendors(data.vendors);
      setCheckedAt(data.checkedAt);
      setOverallStatus(data.overallStatus);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const initials = adminName ? adminName.slice(0, 1).toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-[#F2F2F8] font-sans">

      {/* ── Sidebar (matches AdminClientShell) ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
        background: 'linear-gradient(180deg,#1A0A3C 0%,#26145A 100%)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
        fontFamily: '"Inter",system-ui,sans-serif',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <img src="/logo.jpg" alt="logo" style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: '#fff' }}>TradesAI</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Admin Portal</div>
            </div>
          </div>
          <Link href="/admin" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 8px', borderRadius: '6px',
            fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontSize: '11px' }}>←</span> Portfolio
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '8.5px', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 8px 3px' }}>
            System
          </div>
          <Link href="/admin/platform-health" style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '7px 10px', borderRadius: '7px', marginBottom: '1px',
            fontSize: '12px', fontWeight: 600,
            color: '#fff',
            background: 'rgba(106,60,210,0.32)',
            textDecoration: 'none',
            borderLeft: '2px solid #C9A84C',
          }}>
            <Activity size={14} color="rgba(255,255,255,0.85)" />
            Platform Health
          </Link>
          <Link href="/admin/settings" style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '7px 10px', borderRadius: '7px',
            fontSize: '12px', fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            background: 'transparent',
            textDecoration: 'none',
            borderLeft: '2px solid transparent',
          }}>
            <span style={{ fontSize: '13px', width: '18px', textAlign: 'center' }}>⚙️</span>
            Platform Settings
          </Link>
        </nav>

        {/* User row */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#C9A84C,#E8C96A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 800, color: '#1A0A3C',
              fontFamily: '"Inter Tight",sans-serif',
            }}>{initials}</div>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{adminName}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Owner — Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ marginLeft: '220px' }} className="flex flex-col min-h-screen">

        {/* Mobile header — matches AdminClientShell pattern */}
        <div className="admin-mobile-header hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="logo" className="w-6 h-6 rounded" />
            <span className="font-bold text-sm text-[#1A0A3C]">TradesAI</span>
          </div>
        </div>

        <main className="flex-1 p-7 max-w-5xl w-full mx-auto">

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#1A0A3C] leading-tight" style={{ fontFamily: '"Inter Tight",sans-serif' }}>
              Platform Health
            </h1>
            <p className="text-xs text-[#7468A0] mt-0.5">
              Vendor API status &amp; billing — checks run automatically at 09:00 UTC
            </p>
          </div>

          {/* Fetch error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Couldn&apos;t reach platform health API</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => load()}
                className="text-xs font-semibold text-red-600 underline underline-offset-2 shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Overall status bar */}
          {!loading && !error && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full shrink-0 ${STATUS_DOT[overallStatus]}`} />
                <div>
                  <p className="font-bold text-slate-900 text-base leading-tight">
                    {STATUS_HEADLINE[overallStatus]}
                  </p>
                  {checkedAt && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Last checked {minutesAgo(checkedAt)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0"
                style={{ background: '#3D1FA8' }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Checking…' : 'Refresh now'}
              </button>
            </div>
          )}

          {/* Vendor cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              vendors.map((v) => <VendorCard key={v.vendor} vendor={v} />)
            )}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-header { display: flex !important; align-items: center; justify-content: space-between; padding: 10px 14px; background: #fff; border-bottom: 1px solid #D8D0F0; position: sticky; top: 0; z-index: 50; }
          aside { display: none !important; }
          div[style*="margin-left: 220px"] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
