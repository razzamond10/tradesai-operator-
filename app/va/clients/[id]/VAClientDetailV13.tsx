'use client';
/**
 * VA read-only version of the V13 client dashboard.
 * Identical to AdminClientDetailV13 but:
 * - Shows READ-ONLY banner
 * - No delete/edit actions
 * - Revenue KPI shows "—" (VA shouldn't see revenue details)
 * - Back link goes to /va
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import type { JWTPayload } from '@/lib/auth';

function parseValue(v: string) {
  const n = parseFloat((v || '').replace(/[^0-9.]/g, '') || '0');
  return isNaN(n) ? 0 : n;
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

function KPICard({ stripe, iconBg, icon, badge, badgeWarn, label, value, sub }: {
  stripe: string; iconBg: string; icon: string; badge: string;
  badgeWarn?: boolean; label: string; value: string | number; sub: string;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
      <div style={{ height: '3px', background: stripe }} />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{icon}</div>
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: badgeWarn ? 'var(--a4b)' : iconBg, color: badgeWarn ? 'var(--a4)' : stripe }}>{badge}</span>
        </div>
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', fontFamily: '"Inter",sans-serif' }}>{label}</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '30px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
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

function HourBarChart({ interactions }: { interactions: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  useEffect(() => {
    const todayStr = today();
    const hours = new Array(24).fill(0);
    interactions.filter(i => (i.timestamp || '').startsWith(todayStr)).forEach(i => {
      const h = parseInt((i.timestamp || '').slice(11, 13), 10);
      if (!isNaN(h) && h >= 0 && h < 24) hours[h]++;
    });
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    import('chart.js').then(({ Chart, CategoryScale, LinearScale, BarElement, Tooltip }) => {
      Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;
      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: { labels, datasets: [{ data: hours, backgroundColor: 'rgba(61,31,168,0.7)', borderRadius: 3, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 8 }, maxTicksLimit: 8 } }, y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 9 }, stepSize: 1 }, beginAtZero: true } } },
      });
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions]);
  return <div style={{ position: 'relative', height: '160px' }}><canvas ref={canvasRef} /></div>;
}

export default function VAClientDetailV13({ user, clientId }: { user: JWTPayload; clientId: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartMode, setChartMode] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetch(`/api/clients/${clientId}/data`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load client data'))
      .finally(() => setLoading(false));
  }, [clientId]);

  const interactions: any[] = data?.interactions || [];
  const bookings: any[] = data?.bookings || [];
  const emergencies: any[] = data?.emergencies || [];
  const kpis = data?.kpis || { callsToday: 0, bookingsToday: 0, revenue: 0, hotLeads: 0 };

  const srcColors = ['#3D1FA8', '#0A7455', '#C9A84C', '#C01830', '#6B3FD0', '#9A6200'];
  const intentMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.intent || 'Unknown'; intentMap[k] = (intentMap[k] || 0) + 1; });
  const srcData = Object.entries(intentMap).slice(0, 6).map(([label, value], i) => ({ label, value, color: srcColors[i % srcColors.length] }));

  const pipeColors = ['#0A7455', '#C9A84C', '#C01830', '#3D1FA8', '#6B3FD0'];
  const outcomeMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.outcome || 'Unknown'; outcomeMap[k] = (outcomeMap[k] || 0) + 1; });
  const pipeData = Object.entries(outcomeMap).slice(0, 5).map(([label, value], i) => ({ label, value, color: pipeColors[i % pipeColors.length] }));

  const upcoming = [...bookings].filter(b => b.scheduledDate).sort((a, b) => a.scheduledDate > b.scheduledDate ? 1 : -1).slice(0, 8);
  const feed = [...interactions].reverse().slice(0, 10);
  const openEmergencies = emergencies.filter(e => (e.resolved || '').toLowerCase() !== 'yes');
  const convRate = interactions.length > 0 ? Math.round((bookings.length / interactions.length) * 100) : 0;
  const wkDates = weekDates();
  const wkCalls = wkDates.reduce((s, d) => s + interactions.filter(i => (i.timestamp || '').startsWith(d)).length, 0);
  const wkBookings = wkDates.reduce((s, d) => s + bookings.filter(b => (b.timestamp || '').startsWith(d)).length, 0);

  const stageCount = (s: string) => bookings.filter(b => (b.status || '').toLowerCase() === s.toLowerCase()).length;

  const statusBadge = (s: string) => {
    const lower = (s || '').toLowerCase();
    if (lower === 'completed' || lower === 'confirmed') return { bg: 'var(--a3b)', color: 'var(--a3)' };
    if (lower === 'cancelled') return { bg: 'var(--a4b)', color: 'var(--a4)' };
    if (lower === 'pending') return { bg: 'var(--a2b)', color: 'var(--a6)' };
    return { bg: 'var(--slate)', color: 'var(--muted)' };
  };

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA / Clients" page={data?.config?.businessName || 'Client Dashboard'} sub={data?.config?.tradeType} />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <button onClick={() => router.push('/va')} style={{ background: 'none', border: 'none', color: 'var(--a2)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, padding: 0, display: 'flex', alignItems: 'center', gap: '4px', fontFamily: '"Inter",sans-serif' }}>
            ← Back to All Clients
          </button>
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 10px', borderRadius: '10px', background: 'var(--a1b)', color: 'var(--a1)' }}>READ-ONLY</span>
        </div>

        {error && <div style={{ padding: '10px 14px', background: 'var(--a4b)', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>⚠ {error}</div>}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
          </div>
        )}

        {data && (
          <>
            {/* KPIs — no revenue for VA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Today at a glance</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
              <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📞" badge={`${kpis.callsToday} today`} label="Total Calls" value={kpis.callsToday} sub="calls today" />
              <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="✅" badge={`${convRate}% conv.`} label="Bookings" value={kpis.bookingsToday} sub="confirmed today" />
              <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🔥" badge={`${kpis.hotLeads} hot`} label="Hot Leads" value={kpis.hotLeads} sub="high-priority" />
              <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="🚨" badge={openEmergencies.length > 0 ? 'Active' : 'Clear'} badgeWarn={openEmergencies.length > 0} label="Emergencies" value={openEmergencies.length} sub="open alerts" />
            </div>

            {/* Row 1: Line + 2 donuts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Card>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Activity Overview</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      {[['#3D1FA8','Calls'],['#0A7455','Bookings'],['#C9A84C','Revenue ÷100']].map(([c,l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--muted)' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />{l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {(['today','week','month'] as const).map((m) => (
                      <button key={m} onClick={() => setChartMode(m)} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', background: chartMode === m ? 'var(--a1)' : 'var(--slate)', color: chartMode === m ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif' }}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <ActivityLineChart interactions={interactions} bookings={bookings} mode={chartMode} />
                </div>
              </Card>

              <Card>
                <CardHdr title="Lead Sources" sub="Where enquiries originate" />
                <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
                  <DonutChart data={srcData} total={interactions.length} centerLabel="CALLS" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {srcData.slice(0,5).map((s) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '9.5px', color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <CardHdr title="Pipeline Status" sub="Current lead breakdown" />
                <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
                  <DonutChart data={pipeData} total={interactions.length} centerLabel="LEADS" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {pipeData.slice(0,5).map((s) => (
                      <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '9.5px', color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Row 2: Bar + Hour + Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Card>
                <CardHdr title="Revenue by Job Type" sub="Estimated from bookings" />
                <div style={{ padding: '12px' }}><BarChart bookings={bookings} /></div>
              </Card>
              <Card>
                <CardHdr title="Calls by Hour" sub="Today's distribution" />
                <div style={{ padding: '12px' }}><HourBarChart interactions={interactions} /></div>
              </Card>
              <Card>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Live Alerts</div>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: openEmergencies.length > 0 ? 'var(--a4b)' : 'var(--slate)', color: openEmergencies.length > 0 ? 'var(--a4)' : 'var(--muted)' }}>{openEmergencies.length}</span>
                </div>
                <div style={{ padding: '8px 14px', maxHeight: '210px', overflowY: 'auto' }}>
                  {openEmergencies.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>All clear</div>
                  ) : openEmergencies.map((em, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>🚨</span>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>{em.callerName || 'Unknown'}</div>
                        <div style={{ fontSize: '10px', color: 'var(--a4)', fontWeight: 600 }}>{em.type} · {em.severity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Row 3: Schedule + Feed */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <Card>
                <CardHdr title="Job Schedule" badge={String(upcoming.length)} badgeColor="var(--a1)" />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead><tr>{['Customer','Job Type','Slot','Status'].map(h => <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {upcoming.length === 0 ? <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>No scheduled jobs</td></tr>
                      : upcoming.map((b, i) => {
                        const sb = statusBadge(b.status);
                        return <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <td style={{ padding: '7px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                          <td style={{ padding: '7px 12px', color: 'var(--ink2)' }}>{b.jobType || '—'}</td>
                          <td style={{ padding: '7px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.scheduledDate || '—'}</td>
                          <td style={{ padding: '7px 12px' }}><span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: sb.bg, color: sb.color }}>{b.status || '—'}</span></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardHdr title="Activity Feed" badge="Live" badgeColor="var(--a3)" />
                <div style={{ padding: '8px 14px', maxHeight: '260px', overflowY: 'auto' }}>
                  {feed.length === 0 ? <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '11px' }}>No activity</div>
                  : feed.map((it, i) => (
                    <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.callerName || 'Unknown'}</div>
                        <div style={{ fontSize: '9.5px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.intent || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: (it.outcome || '').toLowerCase() === 'booked' ? 'var(--a3b)' : 'var(--slate)', color: (it.outcome || '').toLowerCase() === 'booked' ? 'var(--a3)' : 'var(--muted)' }}>{it.outcome || '—'}</span>
                        <div style={{ fontSize: '8.5px', color: 'var(--faint)', marginTop: '2px', fontFamily: '"IBM Plex Mono",monospace' }}>{(it.timestamp || '').slice(11, 16)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Week strip */}
            <div style={{ marginBottom: '8px', fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>This week</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Total Calls', val: wkCalls, note: 'this week' },
                { label: 'Bookings', val: wkBookings, note: 'confirmed' },
                { label: 'Hot Leads', val: kpis.hotLeads, note: 'high priority' },
                { label: 'Conversion', val: `${convRate}%`, note: 'call to booking' },
              ].map((w) => (
                <div key={w.label} style={{ background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>{w.label}</div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 900, color: 'var(--ink)', marginBottom: '4px' }}>{w.val}</div>
                  <div style={{ fontSize: '9.5px', color: 'var(--a3)', fontWeight: 600 }}>{w.note}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
