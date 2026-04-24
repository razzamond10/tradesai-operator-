'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminClientShell from '@/components/AdminClientShell';
import Topbar from '@/components/Topbar';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import DateRangeFilter, { useDateRange } from '@/components/DateRangeFilter';
import ChartRangeOverride from '@/components/ChartRangeOverride';
import { filterByRange, rangeSubLabel, type DateRange } from '@/lib/dateRange';
import { canAccess, TIER_LABELS, type Tier } from '@/lib/tiers';
import type { JWTPayload } from '@/lib/auth';

// ── helpers ────────────────────────────────────────────────────────────────────

function parseValue(v: string) {
  // Strip currency symbols and commas first, then everything except digits/dot
  const cleaned = (v || '').replace(/[£$€,\s]/g, '').replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned || '0');
  // Cap at £99,999 — prevents phone numbers / timestamps from inflating revenue
  if (isNaN(n) || n < 0 || n > 99999) return 0;
  return n;
}

function today() { return new Date().toISOString().slice(0, 10); }

function weekDates() {
  const arr: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

function fmtCurrency(v: number) {
  return v >= 1000 ? `£${(v / 1000).toFixed(1)}k` : `£${Math.round(v)}`;
}

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KPICard({
  stripe, iconBg, icon, badge, badgeWarn, label, value, sub,
}: {
  stripe: string; iconBg: string; icon: string; badge: string;
  badgeWarn?: boolean; label: string; value: string | number; sub: string;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)',
      boxShadow: 'var(--shadow-s)', overflow: 'hidden',
    }}>
      <div style={{ height: '3px', background: stripe }} />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
            {icon}
          </div>
          <span style={{
            fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px',
            background: badgeWarn ? 'var(--a4b)' : iconBg,
            color: badgeWarn ? 'var(--a4)' : stripe,
          }}>{badge}</span>
        </div>
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', fontFamily: '"Inter",sans-serif' }}>{label}</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '30px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)',
      boxShadow: 'var(--shadow-s)', overflow: 'hidden', ...style,
    }}>
      {children}
    </div>
  );
}

// Clickable card that navigates to a section page
function NavCard({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block', ...style }} className="nav-card-link">
      <div className="nav-card" style={{
        background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)',
        boxShadow: 'var(--shadow-s)', overflow: 'hidden', cursor: 'pointer',
      }}>
        {children}
      </div>
    </Link>
  );
}

function CardHdr({ title, sub, badge, badgeColor, viewHref }: { title: string; sub?: string; badge?: string; badgeColor?: string; viewHref?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {badge && (
          <span style={{
            fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
            background: badgeColor ? `${badgeColor}18` : 'var(--slate)',
            color: badgeColor || 'var(--muted)',
          }}>{badge}</span>
        )}
        {viewHref && (
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--a1)', opacity: 0.7 }}>View all ›</span>
        )}
      </div>
    </div>
  );
}

// ── Calls by Hour chart ────────────────────────────────────────────────────────

function HourBarChart({ interactions }: { interactions: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  if (interactions.length === 0) {
    return (
      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '20px' }}>📊</div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>Not enough data yet</div>
      </div>
    );
  }

  useEffect(() => {
    console.log('[HourBarChart] render', { interactions: interactions.length, sample: interactions.slice(0,2).map(i => i.timestamp) });
    // All-time distribution by hour — not filtered to today so historical data always shows
    const hours = new Array(24).fill(0);
    interactions.forEach(i => {
      const h = parseInt((i.timestamp || '').slice(11, 13), 10);
      if (!isNaN(h) && h >= 0 && h < 24) hours[h]++;
    });

    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    console.log('[HourBarChart] hours', hours.reduce((s, v) => s + v, 0), 'total calls mapped to hours');

    import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip }) => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) { console.warn('[HourBarChart] canvas not ready'); return; }
      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: hours,
            backgroundColor: 'rgba(61,31,168,0.7)',
            borderRadius: 3,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.raw} calls` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 8 }, maxTicksLimit: 8 } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 9 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions]);

  return <div style={{ position: 'relative', height: '160px' }}><canvas ref={canvasRef} /></div>;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminClientDetailV13({ user, clientId, isDemoEmpty }: { user: JWTPayload; clientId: string; isDemoEmpty?: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageRange, setPageRange] = useDateRange('month');
  const [actOverride, setActOverride] = useState<DateRange | null>(null);
  // Tier switcher — dev/sales demo tool only, does not persist
  const [demoTier, setDemoTier] = useState<'off' | 'starter' | 'professional' | 'enterprise'>('off');

  // Account status kill switch
  const [accountStatus, setAccountStatus] = useState<'active' | 'paused'>('active');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${encodeURIComponent(clientId)}/data`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load client data'))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => {
    if (data?.config?.status) setAccountStatus(data.config.status as 'active' | 'paused');
  }, [data]);

  async function toggleStatus() {
    setShowPauseModal(false);
    setStatusLoading(true);
    const next: 'active' | 'paused' = accountStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/admin/clients/${encodeURIComponent(clientId)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setAccountStatus(next);
      setStatusToast(next === 'paused' ? 'Account paused.' : 'Account resumed.');
    } catch (e: any) {
      setStatusToast(`Error: ${e.message}`);
    } finally {
      setStatusLoading(false);
      setTimeout(() => setStatusToast(null), 4000);
    }
  }

  // ── derived data ─────────────────────────────────────────────────────────────
  const interactions: any[] = isDemoEmpty ? [] : (data?.interactions || []);
  const bookings: any[] = isDemoEmpty ? [] : (data?.bookings || []);
  const emergencies: any[] = isDemoEmpty ? [] : (data?.emergencies || []);

  const fi = filterByRange(interactions, i => i.timestamp, pageRange);
  const fb = filterByRange(bookings, b => b.timestamp, pageRange);
  const subLabel = rangeSubLabel(pageRange);

  const chartRange = actOverride ?? pageRange;
  const chartI = actOverride ? filterByRange(interactions, i => i.timestamp, actOverride) : fi;
  const chartB = actOverride ? filterByRange(bookings, b => b.timestamp, actOverride) : fb;

  const rangeInteractions = fi.length;
  const rangeBookings = fb.length;
  const rangeRevenue = fb.reduce((s, b) => s + parseValue(b.value), 0);
  const rangeConvRate = fi.length > 0 ? Math.round((fb.length / fi.length) * 100) : 0;
  const hotLeads = fi.filter(i => { const o = (i.outcome || '').toLowerCase(); return o === 'booked' || o === 'hot'; }).length;

  // Lead Sources donut — from intent field
  const intentMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.intent || 'Unknown'; intentMap[k] = (intentMap[k] || 0) + 1; });
  const srcColors = ['#3D1FA8', '#0A7455', '#C9A84C', '#C01830', '#6B3FD0', '#9A6200'];
  const srcData = Object.entries(intentMap).slice(0, 6).map(([label, value], i) => ({ label, value, color: srcColors[i % srcColors.length] }));

  // Pipeline Status donut — from outcome field
  const outcomeMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.outcome || 'Unknown'; outcomeMap[k] = (outcomeMap[k] || 0) + 1; });
  const pipeColors = ['#0A7455', '#C9A84C', '#C01830', '#3D1FA8', '#6B3FD0'];
  const pipeData = Object.entries(outcomeMap).slice(0, 5).map(([label, value], i) => ({ label, value, color: pipeColors[i % pipeColors.length] }));

  // Job schedule — upcoming bookings sorted by date
  const upcoming = [...bookings]
    .filter(b => b.scheduledDate)
    .sort((a, b) => (a.scheduledDate > b.scheduledDate ? 1 : -1))
    .slice(0, 8);

  // Activity feed — most recent interactions
  const feed = [...interactions].reverse().slice(0, 10);

  // Pipeline stage counts from booking status
  const stageCount = (s: string) => bookings.filter(b => (b.status || '').toLowerCase() === s.toLowerCase()).length;
  const pipelineTotal = bookings.length;

  // Week strip
  const wkDates = weekDates();
  const wkCalls = wkDates.reduce((s, d) => s + interactions.filter(i => (i.timestamp || '').startsWith(d)).length, 0);
  const wkBookings = wkDates.reduce((s, d) => s + bookings.filter(b => (b.timestamp || '').startsWith(d)).length, 0);
  const wkRevenue = bookings
    .filter(b => wkDates.some(d => (b.timestamp || '').startsWith(d)))
    .reduce((s, b) => s + parseValue(b.value), 0);
  const wkScores = interactions.filter(i => wkDates.some(d => (i.timestamp || '').startsWith(d))).length;

  // Live alerts — emergencies not resolved
  const openEmergencies = emergencies.filter(e => (e.resolved || '').toLowerCase() !== 'yes');

  // Revenue total badge
  const revTotal = bookings.reduce((s, b) => s + parseValue(b.value), 0);

  // Performance metrics
  const convRate = interactions.length > 0
    ? Math.round((bookings.length / interactions.length) * 100)
    : 0;
  const avgValue = bookings.length > 0
    ? Math.round(bookings.reduce((s, b) => s + parseValue(b.value), 0) / bookings.length)
    : 0;

  const statusBadge = (s: string) => {
    const lower = (s || '').toLowerCase();
    if (lower === 'completed' || lower === 'confirmed') return { bg: 'var(--a3b)', color: 'var(--a3)' };
    if (lower === 'cancelled') return { bg: 'var(--a4b)', color: 'var(--a4)' };
    if (lower === 'pending') return { bg: 'var(--a2b)', color: 'var(--a6)' };
    return { bg: 'var(--slate)', color: 'var(--muted)' };
  };

  const base = `/admin/clients/${clientId}`;

  return (
    <AdminClientShell
      clientId={clientId}
      clientName={data?.config?.businessName}
      tradeType={data?.config?.tradeType}
      adminName={user.name}
    >
      <Topbar
        breadcrumb={data?.config?.businessName || 'Client'}
        page="Dashboard"
        sub="Full overview — live from Google Sheets"
      />

      <div className="dash-content" style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Account Status ── */}
        <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: '#fff', border: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: accountStatus === 'active' ? 'var(--a3)' : 'var(--a4)' }} />
            <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>Account Status</span>
            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: accountStatus === 'active' ? 'var(--a3b)' : 'var(--a4b)', color: accountStatus === 'active' ? 'var(--a3)' : 'var(--a4)' }}>
              {accountStatus === 'active' ? 'Active' : 'Paused'}
            </span>
            {statusToast && <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{statusToast}</span>}
          </div>
          <button
            onClick={() => setShowPauseModal(true)}
            disabled={statusLoading}
            style={{ fontSize: '10px', fontWeight: 700, padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: statusLoading ? 'not-allowed' : 'pointer', opacity: statusLoading ? 0.6 : 1, background: accountStatus === 'active' ? 'var(--a4)' : 'var(--a3)', color: '#fff', fontFamily: '"Inter",sans-serif' }}
          >
            {statusLoading ? '…' : accountStatus === 'active' ? 'Pause Account' : 'Resume Account'}
          </button>
        </div>

        {/* ── Tier Switcher — dev/sales demo tool ── */}
        {(() => {
          const PAGE_FEATURES: Array<{ key: string; label: string }> = [
            { key: 'page.analytics',     label: 'Analytics' },
            { key: 'page.forecasting',   label: 'Forecasting' },
            { key: 'page.revenueTracker',label: 'Revenue Tracker' },
            { key: 'page.leadPipeline',  label: 'Lead Pipeline' },
            { key: 'page.reviews',       label: 'Reviews & Ratings' },
            { key: 'page.smsThreads',    label: 'SMS Threads' },
            { key: 'page.invoices',      label: 'Invoices' },
            { key: 'page.marketplace',   label: 'Marketplace' },
            { key: 'page.aiInsights',    label: 'AI Insights' },
            { key: 'page.multiLocation', label: 'Multi-Location' },
          ];
          const locked = demoTier !== 'off'
            ? PAGE_FEATURES.filter(f => !canAccess(demoTier as Tier, f.key))
            : [];
          const accessible = demoTier !== 'off'
            ? PAGE_FEATURES.filter(f => canAccess(demoTier as Tier, f.key))
            : [];
          return (
            <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: demoTier !== 'off' ? 'var(--a2b)' : 'var(--slate)', border: demoTier !== 'off' ? '1px solid rgba(201,168,76,0.4)' : '1px solid var(--divider)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: demoTier !== 'off' ? '10px' : '0' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: demoTier !== 'off' ? 'var(--a6)' : 'var(--muted)', flexShrink: 0 }}>
                  {demoTier !== 'off' ? '🎭 DEMO MODE — not saved to client record' : '🔍 Preview as client tier:'}
                </span>
                <select
                  value={demoTier}
                  onChange={e => setDemoTier(e.target.value as typeof demoTier)}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}
                >
                  <option value="off">— Admin view (no restriction) —</option>
                  <option value="starter">Starter — £447/mo</option>
                  <option value="professional">Professional — £997/mo</option>
                  <option value="enterprise">Enterprise — £2,197/mo</option>
                </select>
              </div>
              {demoTier !== 'off' && (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--a3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.8px' }}>✓ Accessible at {TIER_LABELS[demoTier as Tier]}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {accessible.map(f => (
                        <span key={f.key} style={{ fontSize: '9px', fontWeight: 600, padding: '2px 7px', borderRadius: '8px', background: 'var(--a3b)', color: 'var(--a3)' }}>{f.label}</span>
                      ))}
                      {accessible.length === 0 && <span style={{ fontSize: '10px', color: 'var(--muted)' }}>—</span>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--a4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.8px' }}>🔒 Locked at {TIER_LABELS[demoTier as Tier]}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {locked.map(f => (
                        <span key={f.key} style={{ fontSize: '9px', fontWeight: 600, padding: '2px 7px', borderRadius: '8px', background: 'var(--a4b)', color: 'var(--a4)' }}>{f.label}</span>
                      ))}
                      {locked.length === 0 && <span style={{ fontSize: '10px', color: 'var(--muted)' }}>None — all features accessible</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {loading && (
          <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {(data || isDemoEmpty) && (
          <>
            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
              <DateRangeFilter value={pageRange} onChange={setPageRange} />
            </div>

            {/* Section: Overview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>
                {subLabel === 'today' ? 'Today at a glance' : `Overview · ${subLabel}`}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '14px' }}>
              <KPICard
                stripe="var(--a1)" iconBg="var(--a1b)" icon="📞"
                badge={subLabel}
                label="Total Interactions" value={rangeInteractions} sub={`calls · ${subLabel}`}
              />
              <KPICard
                stripe="var(--a3)" iconBg="var(--a3b)" icon="✅"
                badge={subLabel}
                label="Total Bookings" value={rangeBookings} sub={`bookings · ${subLabel}`}
              />
              <KPICard
                stripe="var(--a4)" iconBg="var(--a4b)" icon="🚨"
                badge={openEmergencies.length > 0 ? `${openEmergencies.length} open` : 'All clear'}
                badgeWarn={openEmergencies.length > 0}
                label="Emergencies Logged" value={emergencies.length} sub="all time"
              />
              <KPICard
                stripe="var(--a2)" iconBg="var(--a2b)" icon="📈"
                badge={`${fmtCurrency(rangeRevenue)} revenue`}
                label="Conversion Rate" value={`${rangeConvRate}%`} sub="bookings ÷ calls"
              />
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {[
                { label: 'View All Calls', href: `${base}/comms`, icon: '📞', bg: 'var(--a1b)', color: 'var(--a1)' },
                { label: 'Add Booking', href: `${base}/schedule`, icon: '📅', bg: 'var(--a3b)', color: 'var(--a3)' },
                { label: 'Flag Emergency', href: `${base}/emergencies`, icon: '🚨', bg: 'var(--a4b)', color: 'var(--a4)' },
              ].map(a => (
                <button key={a.label} onClick={() => router.push(a.href)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px', border: `1px solid ${a.color}30`,
                  background: a.bg, color: a.color, fontSize: '11px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: '"Inter",sans-serif', transition: 'all .15s',
                }}>
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>

            {/* Row 1: Line chart + 2 donuts */}
            <div className="admin-dash-row-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Card style={{ overflow: 'hidden', maxWidth: '100%', minWidth: 0 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Activity Overview</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      {[['#3D1FA8','Calls'],['#0A7455','Bookings'],['#C9A84C','Revenue ÷100']].map(([c,l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--muted)' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <ChartRangeOverride pageRange={pageRange} override={actOverride} onChange={setActOverride} />
                </div>
                <div style={{ padding: '12px 14px', minHeight: '200px', overflow: 'hidden', width: '100%' }}>
                  <ActivityLineChart interactions={chartI} bookings={chartB} range={chartRange} />
                </div>
              </Card>

              <NavCard href={`${base}/pipeline`} style={{ minWidth: 0 }}>
                <CardHdr title="Lead Sources" sub="Where enquiries originate" viewHref={`${base}/pipeline`} />
                <div className="donut-card-inner" style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                  <DonutChart data={srcData} total={interactions.length} centerLabel="CALLS" />
                  <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', flex: 1, minWidth: 0 }}>
                    {srcData.slice(0,5).map((s) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', minWidth: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                        <span title={s.label} style={{ fontSize: '9.5px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 0', minWidth: 0 }}>{s.label}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', flexShrink: 0, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', minWidth: '24px' }}>{s.value}</span>
                      </div>
                    ))}
                    {srcData.length === 0 && <span style={{ fontSize: '10px', color: 'var(--muted)' }}>No data</span>}
                  </div>
                </div>
              </NavCard>

              <NavCard href={`${base}/pipeline`} style={{ minWidth: 0 }}>
                <CardHdr title="Pipeline Status" sub="Current lead breakdown" viewHref={`${base}/pipeline`} />
                <div className="donut-card-inner" style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                  <DonutChart data={pipeData} total={interactions.length} centerLabel="LEADS" />
                  <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', flex: 1, minWidth: 0 }}>
                    {pipeData.slice(0,5).map((s) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', minWidth: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                        <span title={s.label} style={{ fontSize: '9.5px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 0', minWidth: 0 }}>{s.label}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', flexShrink: 0, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', minWidth: '24px' }}>{s.value}</span>
                      </div>
                    ))}
                    {pipeData.length === 0 && <span style={{ fontSize: '10px', color: 'var(--muted)' }}>No data</span>}
                  </div>
                </div>
              </NavCard>
            </div>

            {/* Row 2: Bar chart + Hour bar + Live alerts */}
            <div className="admin-dash-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <NavCard href={`${base}/revenue`}>
                <CardHdr title="Revenue by Job Type" sub="This month — estimated from bookings" badge={fmtCurrency(revTotal)} badgeColor="var(--a1)" viewHref={`${base}/revenue`} />
                <div style={{ padding: '12px', minHeight: '180px' }}>
                  <BarChart bookings={bookings} />
                </div>
              </NavCard>

              <Card>
                <CardHdr title="Calls by Hour" sub="All-time call distribution by hour" />
                <div style={{ padding: '12px', minHeight: '180px' }}>
                  <HourBarChart interactions={interactions} />
                </div>
              </Card>

              <NavCard href={`${base}/emergencies`}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Live Alerts</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: openEmergencies.length > 0 ? 'var(--a4b)' : 'var(--slate)', color: openEmergencies.length > 0 ? 'var(--a4)' : 'var(--muted)' }}>
                      {openEmergencies.length}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--a1)', opacity: 0.7 }}>View all ›</span>
                  </div>
                </div>
                <div style={{ padding: '8px 10px', maxHeight: '210px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {openEmergencies.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>All clear</div>
                  ) : openEmergencies.map((em, i) => (
                    <div key={i} style={{ padding: '9px 11px', borderRadius: '7px', background: 'var(--a4b)', border: '1px solid rgba(192,24,48,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>{em.callerName || 'Unknown'}</span>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: 'var(--muted)' }}>{em.phone}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#9A6200', fontWeight: 600, marginBottom: '4px' }}>
                        🚨 {em.type || 'Emergency'}{em.severity ? ` · ${em.severity}` : ''}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: 'var(--a4)', color: '#fff' }}>⚠ Unresolved</span>
                        <span style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{(em.timestamp || '').slice(0, 10)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </NavCard>
            </div>

            {/* Row 3: Job Schedule + Performance + Activity Feed */}
            <div className="admin-dash-row-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <NavCard href={`${base}/schedule`}>
                <CardHdr
                  title="Job Schedule"
                  sub={upcoming.length > 0 ? `Next: ${upcoming[0]?.scheduledDate || '—'}` : 'No upcoming jobs'}
                  badge={String(upcoming.length)}
                  badgeColor="var(--a1)"
                  viewHref={`${base}/schedule`}
                />
                {/* Desktop table */}
                <div className="dash-job-table" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr>
                        {['Customer','Issue','Slot','Status'].map(h => (
                          <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>No scheduled jobs</td></tr>
                      ) : upcoming.map((b, i) => {
                        const sb = statusBadge(b.status);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                            <td style={{ padding: '7px 12px', color: 'var(--ink2)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.jobType || '—'}</td>
                            <td style={{ padding: '7px 12px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px' }}>{b.scheduledDate || '—'}</td>
                            <td style={{ padding: '7px 12px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: sb.bg, color: sb.color }}>
                                {b.status || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile list — name + date only */}
                <div className="dash-job-cards" style={{ display: 'none' }}>
                  {upcoming.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>No scheduled jobs</div>
                  ) : upcoming.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--divider)' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--ink)' }}>{b.customerName || '—'}</span>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.scheduledDate || '—'}</span>
                    </div>
                  ))}
                </div>
              </NavCard>

              <NavCard href={`${base}/analytics`}>
                <CardHdr title="Performance" badge="Month" badgeColor="var(--a3)" viewHref={`${base}/analytics`} />
                <div style={{ padding: '12px 14px' }}>
                  {[
                    { label: 'Conversion Rate', value: `${convRate}%`, pct: convRate, color: 'var(--a3)' },
                    { label: 'Calls (all time)', value: String(interactions.length), pct: Math.min(100, interactions.length * 2), color: 'var(--a1)' },
                    { label: 'Avg Job Value', value: `£${avgValue}`, pct: Math.min(100, Math.round(avgValue / 20)), color: 'var(--a2)' },
                    { label: 'Hot Leads', value: String(hotLeads), pct: Math.min(100, hotLeads * 10), color: 'var(--a4)' },
                  ].map((row) => (
                    <div key={row.label} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{row.label}</span>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>{row.value}</span>
                      </div>
                      <div style={{ height: '4px', borderRadius: '2px', background: 'var(--slate)' }}>
                        <div style={{ height: '100%', borderRadius: '2px', background: row.color, width: `${row.pct}%`, transition: 'width .6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </NavCard>

              <NavCard href={`${base}/comms`}>
                <CardHdr title="Activity Feed" badge="Live" badgeColor="var(--a3)" viewHref={`${base}/comms`} />
                <div style={{ padding: '8px 14px', maxHeight: '250px', overflowY: 'auto' }}>
                  {feed.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>No activity yet</div>
                  ) : feed.map((it, i) => (
                    <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.callerName || 'Unknown'}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.intent || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '8.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px',
                          background: (it.outcome || '').toLowerCase() === 'booked' ? 'var(--a3b)' : 'var(--slate)',
                          color: (it.outcome || '').toLowerCase() === 'booked' ? 'var(--a3)' : 'var(--muted)',
                        }}>{it.outcome || '—'}</span>
                        <div style={{ fontSize: '8.5px', color: 'var(--faint)', marginTop: '2px', fontFamily: '"IBM Plex Mono",monospace' }}>
                          {(it.timestamp || '').slice(11, 16)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </NavCard>
            </div>

            {/* Job Status Pipeline */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Job Status Pipeline</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>Full journey — new lead to paid invoice</div>
              </div>
            </div>
            <NavCard href={`${base}/pipeline`} style={{ marginBottom: '12px' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Pipeline Stages</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'var(--a1b)', color: 'var(--a1)' }}>{pipelineTotal} total</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--a1)', opacity: 0.7 }}>View all ›</span>
                </div>
              </div>
              <div className="pipeline-stages-row" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                {[
                  { label: 'New Leads', status: 'new', color: '#3D1FA8' },
                  { label: 'Quoted', status: 'quoted', color: '#9A6200' },
                  { label: 'Booked', status: 'booked', color: '#0A7455' },
                  { label: 'In Progress', status: 'in progress', color: '#6B3FD0' },
                  { label: 'Complete', status: 'completed', color: '#047857' },
                  { label: 'Invoiced', status: 'invoiced', color: '#C9A84C' },
                  { label: 'Paid', status: 'paid', color: '#065F46' },
                ].map((stage, idx, arr) => (
                  <div key={stage.status} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="pipeline-stage-circle" style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: stage.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 900, color: '#fff',
                        margin: '0 auto 4px',
                      }}>
                        {stageCount(stage.status)}
                      </div>
                      <div className="pipeline-stage-label" style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{stage.label}</div>
                    </div>
                    {idx < arr.length - 1 && <div className="pipeline-stage-arrow" style={{ color: 'var(--faint)', fontSize: '16px', marginBottom: '18px', flexShrink: 0 }}>›</div>}
                  </div>
                ))}
              </div>
            </NavCard>

            {/* Pipeline tiles */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Pipeline Overview</div>
            </div>
            <div className="admin-pipeline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '18px' }}>
              {[
                { label: 'New Leads', val: stageCount('new'), badge: 'New', bg: 'var(--a1b)', color: 'var(--a1)', barColor: 'var(--a1)' },
                { label: 'Quoted', val: stageCount('quoted'), badge: 'Quote', bg: 'var(--a2b)', color: 'var(--a6)', barColor: 'var(--a6)' },
                { label: 'Confirmed', val: stageCount('booked'), badge: 'Booked', bg: 'var(--a3b)', color: 'var(--a3)', barColor: 'var(--a3)' },
                { label: 'Follow-up Due', val: stageCount('pending'), badge: 'Chase', bg: 'var(--a4b)', color: 'var(--a4)', barColor: 'var(--a4)' },
                { label: 'Hot Leads', val: hotLeads, badge: 'Hot', bg: '#FEF0E7', color: '#D94F00', barColor: '#D94F00' },
                { label: 'Conversion', val: `${convRate}%`, badge: 'Rate', bg: 'var(--slate)', color: 'var(--muted)', barColor: 'var(--a7)' },
              ].map((t) => (
                <div key={t.label} style={{ background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: 'var(--ink)' }}>{t.val}</div>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: t.bg, color: t.color }}>{t.badge}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>{t.label}</div>
                  <div style={{ height: '3px', borderRadius: '2px', background: 'var(--slate)' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: t.barColor, width: `${Math.min(100, (typeof t.val === 'number' ? (t.val / Math.max(1,pipelineTotal) * 100) : convRate))}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Week strip */}
            <div style={{ marginBottom: '8px', fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>This week</div>
            <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Total Calls', val: wkCalls, change: `${wkCalls} this week` },
                { label: 'Bookings', val: wkBookings, change: `${wkBookings} confirmed` },
                { label: 'Est. Revenue', val: fmtCurrency(wkRevenue), change: 'from bookings' },
                { label: 'Active Interactions', val: wkScores, change: 'tracked' },
              ].map((w) => (
                <div key={w.label} style={{ background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>{w.label}</div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 900, color: 'var(--ink)', marginBottom: '4px' }}>{w.val}</div>
                  <div style={{ fontSize: '9.5px', color: 'var(--a3)', fontWeight: 600 }}>{w.change}</div>
                </div>
              ))}
            </div>

            {/* Emergencies table */}
            {emergencies.length > 0 && (
              <>
                <div style={{ marginBottom: '8px', fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Emergencies Log</div>
                <Card style={{ marginBottom: '20px' }}>
                  {/* Desktop table */}
                  <div className="em-table-wrap" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr>
                          {['Caller','Phone','Type','Severity','Resolved','Time'].map(h => (
                            <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {emergencies.map((em, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: em.resolved !== 'Yes' ? 'rgba(192,24,48,0.02)' : undefined }}>
                            <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--ink)' }}>{em.callerName || '—'}</td>
                            <td style={{ padding: '7px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{em.phone || '—'}</td>
                            <td style={{ padding: '7px 12px', color: 'var(--ink2)', fontWeight: 600 }}>{em.type || '—'}</td>
                            <td style={{ padding: '7px 12px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: em.severity === 'High' ? 'var(--a4b)' : 'var(--a2b)', color: em.severity === 'High' ? 'var(--a4)' : 'var(--a6)' }}>{em.severity || '—'}</span>
                            </td>
                            <td style={{ padding: '7px 12px' }}>
                              <span style={{ fontWeight: 700, color: em.resolved === 'Yes' ? 'var(--a3)' : 'var(--a4)', fontSize: '11px' }}>
                                {em.resolved === 'Yes' ? '✓ Yes' : '⚠ No'}
                              </span>
                            </td>
                            <td style={{ padding: '7px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '9.5px', color: 'var(--muted)' }}>{(em.timestamp || '').slice(0, 16)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile cards */}
                  <div className="em-cards-wrap" style={{ display: 'none', padding: '8px' }}>
                    {emergencies.map((em, i) => {
                      const resolved = em.resolved === 'Yes';
                      return (
                        <div key={i} style={{
                          padding: '12px 14px', borderRadius: '8px', marginBottom: '8px',
                          background: resolved ? '#fff' : 'rgba(192,24,48,0.03)',
                          border: `1px solid ${resolved ? 'var(--divider)' : 'rgba(192,24,48,0.18)'}`,
                          borderLeft: `3px solid ${resolved ? 'var(--a3)' : 'var(--a4)'}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{em.callerName || '—'}</span>
                            <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{em.phone || '—'}</span>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: '#9A6200', marginBottom: '8px' }}>
                            {em.type || 'Emergency'}{em.severity ? ` · ${em.severity}` : ''}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: resolved ? 'var(--a3)' : 'var(--a4)' }}>
                              {resolved ? '✓ Resolved' : '⚠ Unresolved'}
                            </span>
                            <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: 'var(--muted)' }}>
                              {(em.timestamp || '').slice(0, 16).replace('T', ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong> — never miss a lead</div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <style>{`
          @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}
          .nav-card { transition: box-shadow .15s, border-color .15s; }
          .nav-card-link:hover .nav-card { box-shadow: 0 6px 20px rgba(26,10,60,0.14) !important; border-color: rgba(201,168,76,0.4) !important; }
          @media (max-width: 768px) {
            .dash-content { padding: 12px 16px !important; }
            .admin-dash-row-3 { grid-template-columns: 1fr !important; }
            .admin-pipeline-grid { grid-template-columns: repeat(3,1fr) !important; }
            .pipeline-stage-circle { width: 30px !important; height: 30px !important; font-size: 10px !important; }
            .pipeline-stage-label { font-size: 8px !important; }
            .pipeline-stage-arrow { font-size: 12px !important; }
            .pipeline-stages-row { gap: 2px !important; padding: 10px !important; }
            .donut-card-inner { grid-template-columns: 1fr !important; }
            .em-table-wrap { display: none !important; }
            .em-cards-wrap { display: block !important; }
            .dash-job-table { display: none !important; }
            .dash-job-cards { display: block !important; }
          }
          @media (max-width: 480px) {
            .admin-pipeline-grid { grid-template-columns: repeat(2,1fr) !important; }
          }
        `}</style>

        {/* ── Pause / Resume confirmation modal ── */}
        {showPauseModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '380px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                {accountStatus === 'active' ? 'Pause this account?' : 'Resume this account?'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.5, margin: '0 0 20px' }}>
                {accountStatus === 'active'
                  ? 'This will block the client from logging in immediately. They will see a "temporarily paused" message.'
                  : 'This will restore login access for the client immediately.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPauseModal(false)}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--divider)', background: '#fff', color: 'var(--ink)', cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={toggleStatus}
                  style={{ fontSize: '11px', fontWeight: 700, padding: '7px 14px', borderRadius: '6px', border: 'none', background: accountStatus === 'active' ? 'var(--a4)' : 'var(--a3)', color: '#fff', cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}
                >
                  {accountStatus === 'active' ? 'Yes, pause account' : 'Yes, resume account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminClientShell>
  );
}
