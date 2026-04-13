'use client';
import { useEffect, useRef, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import BarChart from '@/components/charts/BarChart';
import type { JWTPayload } from '@/lib/auth';

function parseValue(v: string) {
  const n = parseFloat((v || '').replace(/[^0-9.]/g, '') || '0');
  return isNaN(n) ? 0 : n;
}

function fmtCurrency(v: number) {
  if (v >= 1000) return `£${(v / 1000).toFixed(1)}k`;
  return `£${Math.round(v).toLocaleString()}`;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', ...style }}>{children}</div>;
}

function CardHdr({ title, sub, badge, badgeColor }: { title: string; sub?: string; badge?: string; badgeColor?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {badge && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: badgeColor ? `${badgeColor}18` : 'var(--slate)', color: badgeColor || 'var(--muted)' }}>{badge}</span>}
    </div>
  );
}

// Revenue over time chart
function RevTrendChart({ bookings }: { bookings: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const labels = days.map(d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth() + 1}`; });
    const data = days.map(d =>
      bookings.filter(b => (b.timestamp || '').startsWith(d)).reduce((s, b) => s + parseValue(b.value), 0)
    );

    import('chart.js').then(({ Chart, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip }) => {
      Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;
      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Revenue', data,
            borderColor: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.08)',
            borderWidth: 2.5, pointRadius: 3, fill: true, tension: 0.4,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` £${c.raw.toLocaleString()}` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 9 }, maxTicksLimit: 10 } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 9 }, callback: (v: any) => `£${v}` }, beginAtZero: true },
          },
        },
      });
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [bookings]);

  return <div style={{ position: 'relative', height: '200px' }}><canvas ref={canvasRef} /></div>;
}

export default function RevenueClient({ user }: { user: JWTPayload }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  const bookings: any[] = data?.bookings || [];
  const statuses = ['all', ...Array.from(new Set(bookings.map(b => b.status).filter(Boolean)))];
  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => (b.status || '') === statusFilter);

  const totalRev = bookings.reduce((s, b) => s + parseValue(b.value), 0);
  const completedRev = bookings.filter(b => b.status?.toLowerCase() === 'completed').reduce((s, b) => s + parseValue(b.value), 0);
  const pendingRev = bookings.filter(b => b.status?.toLowerCase() !== 'completed' && b.status?.toLowerCase() !== 'cancelled').reduce((s, b) => s + parseValue(b.value), 0);
  const avgValue = bookings.length > 0 ? totalRev / bookings.length : 0;

  const statusBadge = (s: string) => {
    const lower = (s || '').toLowerCase();
    if (lower === 'completed') return { bg: 'var(--a3b)', color: 'var(--a3)' };
    if (lower === 'cancelled') return { bg: 'var(--a4b)', color: 'var(--a4)' };
    if (lower === 'pending') return { bg: 'var(--a2b)', color: 'var(--a6)' };
    if (lower === 'confirmed') return { bg: 'var(--a1b)', color: 'var(--a1)' };
    return { bg: 'var(--slate)', color: 'var(--muted)' };
  };

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Revenue Tracker" sub="Bookings & financial overview" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          Revenue overview
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { stripe: 'var(--a2)', icon: '💰', label: 'Total Revenue', val: loading ? '—' : fmtCurrency(totalRev), sub: 'all bookings' },
            { stripe: 'var(--a3)', icon: '✅', label: 'Completed', val: loading ? '—' : fmtCurrency(completedRev), sub: 'invoiced & paid' },
            { stripe: 'var(--a1)', icon: '🕐', label: 'Pipeline Value', val: loading ? '—' : fmtCurrency(pendingRev), sub: 'in progress' },
            { stripe: 'var(--a4)', icon: '📊', label: 'Avg Job Value', val: loading ? '—' : fmtCurrency(avgValue), sub: 'per booking' },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: k.stripe }} />
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>{k.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{k.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '26px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Card>
            <CardHdr title="Revenue Trend" sub="30-day revenue from bookings" badge={fmtCurrency(totalRev)} badgeColor="var(--a2)" />
            <div style={{ padding: '14px' }}>
              {loading ? <div style={{ height: '200px', background: 'var(--slate)', borderRadius: '6px', animation: 'shimmer 1.5s ease-in-out infinite' }} /> : <RevTrendChart bookings={bookings} />}
            </div>
          </Card>
          <Card>
            <CardHdr title="Revenue by Job Type" sub="Breakdown by trade" />
            <div style={{ padding: '12px' }}><BarChart bookings={bookings} /></div>
          </Card>
        </div>

        {/* Bookings table */}
        <Card>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>All Bookings</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>Filter by status</div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {statuses.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === s ? 'var(--a1)' : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>{s === 'all' ? 'All' : s}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Loading…</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>
                    {['Date','Customer','Phone','Job Type','Status','Value'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>No bookings</td></tr>
                  ) : [...filtered].reverse().map((b, i) => {
                    const sb = statusBadge(b.status);
                    const val = parseValue(b.value);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{(b.timestamp || '—').slice(0, 10)}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.phone || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{b.jobType || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: sb.bg, color: sb.color }}>{b.status || '—'}</span>
                        </td>
                        <td style={{ padding: '8px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: val > 0 ? 'var(--ink)' : 'var(--muted)' }}>
                          {val > 0 ? `£${val.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Total row */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate)' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
              <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 900, color: 'var(--ink)' }}>
                {fmtCurrency(filtered.reduce((s, b) => s + parseValue(b.value), 0))} total
              </span>
            </div>
          )}
        </Card>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
