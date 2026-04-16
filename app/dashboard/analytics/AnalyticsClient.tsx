'use client';
import { useEffect, useRef, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import type { JWTPayload } from '@/lib/auth';

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

// 30-day trend chart
function TrendChart({ interactions, bookings }: { interactions: any[]; bookings: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const labels = days.map(d => {
      const dt = new Date(d);
      return `${dt.getDate()}/${dt.getMonth() + 1}`;
    });
    const callData = days.map(d => interactions.filter(i => (i.timestamp || '').startsWith(d)).length);
    const bookingData = days.map(d => bookings.filter(b => (b.timestamp || '').startsWith(d)).length);

    import('chart.js').then(({ Chart, LineController, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend }) => {
      Chart.register(LineController, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;
      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Calls', data: callData, borderColor: '#3D1FA8', backgroundColor: 'rgba(61,31,168,0.06)', borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4 },
            { label: 'Bookings', data: bookingData, borderColor: '#0A7455', backgroundColor: 'rgba(10,116,85,0.05)', borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'top', labels: { font: { size: 10 }, color: '#7468A0', boxWidth: 10 } }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 9 }, maxTicksLimit: 10 } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions, bookings]);

  return <div style={{ position: 'relative', height: '220px' }}><canvas ref={canvasRef} /></div>;
}

// Day-of-week heatmap (bar)
function DowChart({ interactions }: { interactions: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    interactions.forEach(i => {
      const d = new Date(i.timestamp || '');
      if (!isNaN(d.getTime())) counts[d.getDay()]++;
    });

    import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip }) => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;
      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            data: counts,
            backgroundColor: counts.map(v => `rgba(61,31,168,${0.2 + (v / (Math.max(...counts) || 1)) * 0.6})`),
            borderRadius: 5,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.raw} calls` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 10 } } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 9 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions]);

  return <div style={{ position: 'relative', height: '160px' }}><canvas ref={canvasRef} /></div>;
}

export default function AnalyticsClient({ user }: { user: JWTPayload }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  const interactions: any[] = data?.interactions || [];
  const bookings: any[] = data?.bookings || [];

  const totalCalls = interactions.length;
  const totalBookings = bookings.length;
  const convRate = totalCalls > 0 ? Math.round((totalBookings / totalCalls) * 100) : 0;
  const completedRevenue = bookings.filter(b => b.status?.toLowerCase() === 'completed').reduce((s, b) => {
    const v = parseFloat((b.value || '').replace(/[^0-9.]/g, '') || '0');
    return s + (isNaN(v) ? 0 : v);
  }, 0);

  const intentMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.intent || 'Unknown'; intentMap[k] = (intentMap[k] || 0) + 1; });
  const srcColors = ['#3D1FA8', '#0A7455', '#C9A84C', '#C01830', '#6B3FD0'];
  const srcData = Object.entries(intentMap).slice(0, 5).map(([label, value], i) => ({ label, value, color: srcColors[i % srcColors.length] }));

  const outcomeMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.outcome || 'Unknown'; outcomeMap[k] = (outcomeMap[k] || 0) + 1; });
  const pipeColors = ['#0A7455', '#C9A84C', '#C01830', '#3D1FA8', '#6B3FD0'];
  const pipeData = Object.entries(outcomeMap).slice(0, 5).map(([label, value], i) => ({ label, value, color: pipeColors[i % pipeColors.length] }));

  // Peak hour
  const hourCounts = new Array(24).fill(0);
  interactions.forEach(i => {
    const h = parseInt((i.timestamp || '').slice(11, 13), 10);
    if (!isNaN(h)) hourCounts[h]++;
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Analytics" sub="Performance deep-dive" onPeriod={setChartMode as any} period={chartMode} />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Performance summary</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { stripe: 'var(--a1)', icon: '📞', label: 'Total Calls', val: loading ? '—' : totalCalls, sub: 'all time' },
            { stripe: 'var(--a3)', icon: '✅', label: 'Total Bookings', val: loading ? '—' : totalBookings, sub: 'confirmed' },
            { stripe: 'var(--a2)', icon: '📊', label: 'Conversion Rate', val: loading ? '—' : `${convRate}%`, sub: 'calls to bookings' },
            { stripe: 'var(--a4)', icon: '💷', label: 'Completed Revenue', val: loading ? '—' : `£${Math.round(completedRevenue).toLocaleString()}`, sub: 'invoiced & completed' },
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

        {/* 30-day trend */}
        <Card style={{ marginBottom: '12px' }}>
          <CardHdr title="30-Day Trend" sub="Calls and bookings over the past month" />
          <div style={{ padding: '14px' }}>
            {loading ? <div style={{ height: '220px', background: 'var(--slate)', borderRadius: '6px', animation: 'shimmer 1.5s ease-in-out infinite' }} /> : <TrendChart interactions={interactions} bookings={bookings} />}
          </div>
        </Card>

        {/* Row: Activity + Sources + Pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <Card>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>Call Activity</div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {(['today','week','month'] as const).map((m) => (
                  <button key={m} onClick={() => setChartMode(m)} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', background: chartMode === m ? 'var(--a1)' : 'var(--slate)', color: chartMode === m ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif' }}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px' }}>
              <ActivityLineChart interactions={interactions} bookings={bookings} mode={chartMode} />
            </div>
          </Card>
          <Card>
            <CardHdr title="Intent Breakdown" sub="What callers are asking about" />
            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
              <DonutChart data={srcData} total={totalCalls} centerLabel="CALLS" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {srcData.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '9px', color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <CardHdr title="Outcome Breakdown" sub="Call results" />
            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
              <DonutChart data={pipeData} total={totalCalls} centerLabel="LEADS" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {pipeData.map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '9px', color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Row: DOW + Revenue + Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <Card>
            <CardHdr title="Calls by Day of Week" sub="All-time call volume per day" />
            <div style={{ padding: '14px' }}><DowChart interactions={interactions} /></div>
          </Card>
          <Card>
            <CardHdr title="Revenue by Job Type" sub="Estimated from bookings" />
            <div style={{ padding: '12px' }}><BarChart bookings={bookings} /></div>
          </Card>
          <Card>
            <CardHdr title="Key Insights" />
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: '📈', label: 'Conversion Rate', value: `${convRate}%`, note: convRate >= 50 ? 'Above average' : 'Room to improve', color: convRate >= 50 ? 'var(--a3)' : 'var(--a2)' },
                { icon: '⏰', label: 'Peak Call Hour', value: `${peakHour}:00`, note: 'Busiest time of day', color: 'var(--a1)' },
                { icon: '📞', label: 'Total Calls Handled', value: String(totalCalls), note: 'Never missed a lead', color: 'var(--a3)' },
                { icon: '💰', label: 'Revenue Generated', value: `£${Math.round(completedRevenue).toLocaleString()}`, note: 'From completed jobs', color: 'var(--a2)' },
              ].map((ins) => (
                <div key={ins.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '7px', background: 'var(--slate)' }}>
                  <span style={{ fontSize: '16px' }}>{ins.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>{ins.label}</div>
                    <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '15px', fontWeight: 900, color: 'var(--ink)' }}>{ins.value}</div>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: ins.color }}>{ins.note}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
