'use client';
import { useEffect, useState, useCallback } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import type { JWTPayload } from '@/lib/auth';

interface ClientData {
  config: any;
  kpis: { callsToday: number; bookingsToday: number; revenue: number; hotLeads: number };
  interactions: any[];
  bookings: any[];
  emergencies: any[];
}

const css = `
.kc{background:#fff;border:1px solid #D8D0F0;border-radius:10px;padding:14px 16px 12px;box-shadow:0 2px 8px rgba(26,10,60,0.10),0 1px 2px rgba(26,10,60,0.05);position:relative;overflow:hidden;transition:box-shadow .2s,transform .15s;cursor:default}
.kc:hover{box-shadow:0 4px 20px rgba(26,10,60,0.12),0 2px 6px rgba(26,10,60,0.06);transform:translateY(-1px)}
.kc-stripe{position:absolute;top:0;left:0;right:0;height:3px;border-radius:10px 10px 0 0}
.kc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.kc-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.kc-badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:#E6FAF4;color:#0A7455}
.kc-badge.warn{background:#FDEEF1;color:#C01830}
.kl{font-size:9px;font-weight:700;color:#7468A0;letter-spacing:.8px;text-transform:uppercase;margin-bottom:5px}
.kv{font-family:"Inter Tight",sans-serif;font-size:30px;font-weight:900;color:#1A0A3C;line-height:1;letter-spacing:-1.5px}
.ks{font-size:10px;color:#7468A0;margin-top:4px}
.card{background:#fff;border:1px solid #D8D0F0;border-radius:10px;box-shadow:0 2px 8px rgba(26,10,60,0.10),0 1px 2px rgba(26,10,60,0.05);overflow:hidden}
.card-hdr{padding:11px 14px 10px;border-bottom:1px solid #D8D0F0;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.card-title{font-family:"Inter Tight",sans-serif;font-size:12px;font-weight:800;color:#1A0A3C}
.card-sub{font-size:9px;color:#7468A0;margin-top:1px}
.ctabs{display:flex;gap:2px;background:#EAEAF4;border-radius:6px;padding:2px}
.ctab{padding:3px 9px;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#3D2580;font-family:"Inter",sans-serif;transition:all .15s}
.ctab.on{background:#fff;color:#1A0A3C;box-shadow:0 1px 2px rgba(26,10,60,0.08)}
.lgnd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:5px}
.lgi{display:flex;align-items:center;gap:4px;font-size:10px;color:#3D2580;font-weight:500}
.lgd{width:7px;height:7px;border-radius:50%}
.jtbl{width:100%;border-collapse:collapse}
.jtbl th{font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#7468A0;padding:7px 12px;text-align:left;border-bottom:1px solid #D8D0F0;background:#F2F2F8}
.jtbl td{padding:8px 12px;font-size:11px;border-bottom:1px solid rgba(0,0,0,.04);vertical-align:middle}
.jtbl tr:last-child td{border-bottom:none}
.jtbl tr:hover td{background:#EAEAF4}
.bdg{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px}
.b-n{background:#E0E0EE;color:#3D2580}
.b-g{background:#E6FAF4;color:#0A7455}
.b-r{background:#FDEEF1;color:#C01830}
.b-a{background:#FEF8EC;color:#9A6200}
.b-b{background:#EDE8FF;color:#3D1FA8}
.b-p{background:#F0EAFF;color:#6B3FD0}
.tag{font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;letter-spacing:.3px;text-transform:uppercase}
.t-bo{background:#E6FAF4;color:#0A7455}
.t-em{background:#FDEEF1;color:#C01830}
.t-nw{background:#EDE8FF;color:#3D1FA8}
.al-row{display:flex;align-items:flex-start;gap:10px;padding:9px 13px;border-bottom:1px solid rgba(0,0,0,.04);cursor:default}
.al-row:last-child{border-bottom:none}
.al-row:hover{background:#EAEAF4}
.al-ico{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.feed-row{display:flex;gap:10px;padding:8px 13px;border-bottom:1px solid rgba(0,0,0,.04);align-items:flex-start}
.feed-row:last-child{border-bottom:none}
.feed-row:hover{background:#EAEAF4}
.feed-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px}
.feed-text{font-size:11px;color:#1A0A3C;line-height:1.4;flex:1}
.feed-time{font-size:9px;color:#7468A0;margin-top:2px;font-family:"IBM Plex Mono",monospace}
.met-row{display:flex;align-items:center;gap:8px;padding:7px 13px;border-bottom:1px solid rgba(0,0,0,.04)}
.met-row:last-child{border-bottom:none}
.met-label{font-size:11px;color:#3D2580;font-weight:500;flex:1}
.met-bar-wrap{width:60px;height:3px;background:#E0E0EE;border-radius:2px;flex-shrink:0;overflow:hidden}
.met-bar{height:100%;border-radius:2px}
.met-val{font-family:"Inter Tight",sans-serif;font-size:11px;font-weight:800;color:#1A0A3C;min-width:52px;text-align:right}
.pipe-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:12px}
.ptile{background:#fff;border:1px solid #D8D0F0;border-radius:10px;padding:11px 12px 10px;box-shadow:0 2px 8px rgba(26,10,60,0.10);transition:box-shadow .2s,transform .15s}
.ptile:hover{box-shadow:0 4px 20px rgba(26,10,60,0.12);transform:translateY(-1px)}
.ptile-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:7px}
.ptv{font-family:"Inter Tight",sans-serif;font-size:26px;font-weight:900;color:#1A0A3C;letter-spacing:-1px;line-height:1}
.ptl{font-size:9px;font-weight:700;color:#7468A0;letter-spacing:.3px;text-transform:uppercase}
.pt-bar{height:3px;background:#E0E0EE;border-radius:2px;overflow:hidden;margin-top:8px}
.pt-barf{height:100%;border-radius:2px;transition:width 2.5s cubic-bezier(.4,0,.2,1)}
.wgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
.wc{background:#fff;border:1px solid #D8D0F0;border-radius:10px;padding:11px 13px;box-shadow:0 2px 8px rgba(26,10,60,0.10)}
.wl{font-size:9px;font-weight:700;color:#7468A0;margin-bottom:6px;letter-spacing:.8px;text-transform:uppercase}
.wv{font-family:"Inter Tight",sans-serif;font-size:24px;font-weight:900;color:#1A0A3C;line-height:1;letter-spacing:-1px}
.wch{font-size:10px;color:#0A7455;margin-top:4px;font-weight:600}
.job-pipeline{display:flex;align-items:flex-start;padding:14px 16px;gap:0;overflow-x:auto}
.jp-stage{display:flex;flex-direction:column;align-items:center;flex:1;min-width:56px}
.jp-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Inter Tight",sans-serif;font-size:11px;font-weight:800;flex-shrink:0;border:2px solid;transition:transform .15s}
.jp-stage:hover .jp-dot{transform:scale(1.1)}
.jp-lbl{font-size:8px;font-weight:600;color:#7468A0;text-align:center;line-height:1.2;margin-top:5px}
.jp-arrow{color:#B8B0D4;font-size:11px;padding:0 3px;padding-top:10px;flex-shrink:0}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.sec-title{font-family:"Inter Tight",sans-serif;font-size:13px;font-weight:800;color:#1A0A3C}
.sec-meta{font-size:10px;color:#7468A0}
.no-data{padding:20px 13px;text-align:center;color:#7468A0;font-size:11px}
`;

export default function DashboardClient({ user }: { user: JWTPayload }) {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('today');
  const [chartMode, setChartMode] = useState<'today' | 'week' | 'month'>('today');

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  // --- KPI helpers ---
  const interactions = data?.interactions || [];
  const bookings = data?.bookings || [];
  const emergencies = data?.emergencies || [];

  const filterByPeriod = (rows: any[], field = 'timestamp') => {
    if (period === 'today') return rows.filter(r => (r[field] || '').startsWith(today));
    if (period === 'week') return rows.filter(r => new Date(r[field]) >= weekAgo);
    return rows;
  };

  const filteredInteractions = filterByPeriod(interactions);
  const filteredBookings = filterByPeriod(bookings);
  const unresolved = emergencies.filter(e => e.resolved !== 'Yes');

  const revenue = filteredBookings
    .filter(b => (b.status || '').toLowerCase() === 'completed')
    .reduce((s, b) => s + parseFloat((b.value || '').replace(/[^0-9.]/g, '') || '0'), 0);

  // --- Activity Feed ---
  const feed = [...interactions].slice(0, 8).map(it => ({
    text: `${it.callerName || 'Unknown'} — ${it.intent || 'Enquiry'}`,
    time: fmtTime(it.timestamp),
    color: it.outcome?.toLowerCase() === 'booked' ? '#0A7455' : it.outcome?.toLowerCase() === 'hot' ? '#C9A84C' : '#3D1FA8',
  }));

  // --- Pipeline counts ---
  const newLeads = interactions.filter(i => !['booked','completed'].includes((i.outcome||'').toLowerCase())).length;
  const quoted = interactions.filter(i => (i.outcome||'').toLowerCase() === 'quoted').length;
  const booked = bookings.filter(b => (b.status||'').toLowerCase() === 'confirmed').length;
  const inProgress = bookings.filter(b => (b.status||'').toLowerCase() === 'in progress').length;
  const completed = bookings.filter(b => (b.status||'').toLowerCase() === 'completed').length;
  const hotLeads = interactions.filter(i => (i.outcome||'').toLowerCase() === 'hot').length;
  const convRate = interactions.length > 0 ? Math.round((booked / interactions.length) * 100) : 0;
  const pipeTotal = newLeads + quoted + booked + inProgress + completed;
  const pipeMax = Math.max(pipeTotal, 1);

  // --- Week strip ---
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6);
  const weekInteractions = interactions.filter(i => new Date(i.timestamp) >= weekStart);
  const weekBookings = bookings.filter(b => new Date(b.timestamp) >= weekStart);
  const weekRevenue = weekBookings.filter(b => (b.status||'').toLowerCase() === 'completed')
    .reduce((s, b) => s + parseFloat((b.value||'').replace(/[^0-9.]/g,'') || '0'), 0);

  // --- Perf metrics ---
  const totalCalls = interactions.length;
  const totalBooked = bookings.length;
  const answeredPct = totalCalls > 0 ? 100 : 0;
  const bookingRate = totalCalls > 0 ? Math.round((totalBooked / totalCalls) * 100) : 0;
  const resolvedEmerg = emergencies.filter(e => e.resolved === 'Yes').length;
  const resolvedPct = emergencies.length > 0 ? Math.round((resolvedEmerg / emergencies.length) * 100) : 100;

  // --- Lead sources (from intent) ---
  const sourceCounts: Record<string, number> = {};
  interactions.forEach(i => {
    const src = i.intent || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const srcColors = ['#3D1FA8', '#C9A84C', '#0A7455', '#6B3FD0'];

  // --- Pipeline status donut ---
  const pipeStatuses = [
    { label: 'New', count: newLeads, color: '#3D1FA8' },
    { label: 'Quoted', count: quoted, color: '#9A6200' },
    { label: 'Booked', count: booked, color: '#0A7455' },
    { label: 'Hot', count: hotLeads, color: '#C9A84C' },
  ];

  return (
    <PortalShell role={user.role} name={user.name}>
      <style>{css}</style>
      <Topbar
        breadcrumb="Operations"
        page="Command Centre"
        sub={data?.config?.tradeType}
        onRefresh={load}
        period={period}
        onPeriod={setPeriod}
      />

      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {error && <div style={{ padding: '10px 14px', background: '#FDEEF1', border: '1px solid #F5C0C8', borderRadius: '8px', color: '#C01830', fontSize: '12px', marginBottom: '14px' }}>{error}</div>}

        {/* KPI section header */}
        <div className="sec-hdr">
          <div className="sec-title">Today at a glance</div>
          <div className="sec-meta">{data?.config?.businessName || '—'}</div>
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
          <KCard stripe="#3D1FA8" iconBg="#EDE8FF" icon="📞" badgeTxt={`${filteredInteractions.length} total`} label="Total Calls" value={filteredInteractions.length} sub="AI-handled" />
          <KCard stripe="#0A7455" iconBg="#E6FAF4" icon="✅" badgeTxt={`${bookingRate}% conv.`} label="Bookings" value={filteredBookings.length} sub="confirmed" />
          <KCard stripe="#C9A84C" iconBg="#FEF8EC" icon="💷" badgeTxt="" label="Revenue" value={`£${Math.round(revenue).toLocaleString()}`} sub="from completed jobs" />
          <KCard stripe="#C01830" iconBg="#FDEEF1" icon="🚨" badgeTxt={unresolved.length > 0 ? 'Unresolved' : 'All clear'} label="Emergencies" value={emergencies.length} sub="today" warn={unresolved.length > 0} />
        </div>

        {/* Row 1: Line chart + 2 donuts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* Activity line chart */}
          <div className="card">
            <div className="card-hdr">
              <div>
                <div className="card-title">Activity Overview</div>
                <div className="lgnd">
                  <div className="lgi"><div className="lgd" style={{ background: '#3D1FA8' }} />Calls</div>
                  <div className="lgi"><div className="lgd" style={{ background: '#0A7455' }} />Bookings</div>
                  <div className="lgi"><div className="lgd" style={{ background: '#C9A84C' }} />Revenue ÷100</div>
                </div>
              </div>
              <div className="ctabs">
                {(['today','week','month'] as const).map(m => (
                  <button key={m} className={`ctab${chartMode === m ? ' on' : ''}`} onClick={() => setChartMode(m)}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <ActivityLineChart interactions={interactions} bookings={bookings} mode={chartMode} />
            </div>
          </div>

          {/* Lead Sources donut */}
          <div className="card">
            <div className="card-hdr"><div><div className="card-title">Lead Sources</div><div className="card-sub">Where enquiries originate</div></div></div>
            <div style={{ padding: '8px 12px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
              <DonutChart data={topSources.map(([l,v],i)=>({ label: l, value: v, color: srcColors[i] || '#ccc' }))} total={interactions.length} centerLabel="CALLS" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {topSources.map(([l, v], i) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#3D2580' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: srcColors[i] || '#ccc', flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</span>
                    <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: '#7468A0' }}>{v}</span>
                  </div>
                ))}
                {topSources.length === 0 && <div style={{ color: '#7468A0', fontSize: '10px' }}>No data</div>}
              </div>
            </div>
          </div>

          {/* Pipeline status donut */}
          <div className="card">
            <div className="card-hdr"><div><div className="card-title">Pipeline Status</div><div className="card-sub">Current lead breakdown</div></div></div>
            <div style={{ padding: '8px 12px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
              <DonutChart data={pipeStatuses.filter(p => p.count > 0).map(p => ({ label: p.label, value: p.count, color: p.color }))} total={pipeTotal} centerLabel="LEADS" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {pipeStatuses.map(p => (
                  <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#3D2580' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{p.label}</span>
                    <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: '#7468A0' }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Bar chart + Calls by Hour + Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* Revenue by Job Type */}
          <div className="card">
            <div className="card-hdr">
              <div><div className="card-title">Revenue by Job Type</div><div className="card-sub">Estimated from bookings</div></div>
              <span className="bdg b-n">£{Math.round(revenue).toLocaleString()}</span>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <BarChart bookings={bookings} />
            </div>
          </div>
          {/* Calls by Hour */}
          <div className="card">
            <div className="card-hdr"><div><div className="card-title">Calls by Hour</div><div className="card-sub">Today's call distribution</div></div></div>
            <div style={{ padding: '8px 12px 12px' }}>
              <HourBarChart interactions={interactions.filter(i => (i.timestamp||'').startsWith(today))} />
            </div>
          </div>
          {/* Live Alerts */}
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Live Alerts</div>
              <span className={`bdg ${unresolved.length > 0 ? 'b-r' : 'b-g'}`}>{unresolved.length > 0 ? unresolved.length : 'Clear'}</span>
            </div>
            <div>
              {emergencies.length === 0
                ? <div className="no-data">All clear ✓</div>
                : emergencies.slice(0, 5).map((em, i) => (
                  <div key={i} className="al-row">
                    <div className="al-ico" style={{ background: em.resolved === 'Yes' ? '#E6FAF4' : '#FDEEF1' }}>
                      {em.resolved === 'Yes' ? '✅' : '🚨'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1A0A3C' }}>{em.callerName || 'Unknown'}</div>
                      <div style={{ fontSize: '10px', color: '#3D2580', marginTop: '2px', lineHeight: 1.4 }}>{em.type} · {em.severity}</div>
                    </div>
                    <span className={`bdg ${em.resolved === 'Yes' ? 'b-g' : 'b-r'}`}>{em.resolved === 'Yes' ? 'Done' : 'Active'}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Row 3: Job Schedule + Performance + Activity Feed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* Job Schedule */}
          <div className="card">
            <div className="card-hdr">
              <div><div className="card-title">Job Schedule</div><div className="card-sub">{bookings.length} total bookings</div></div>
              <span className="bdg b-b">{filteredBookings.length}</span>
            </div>
            <table className="jtbl">
              <thead><tr><th>Customer</th><th>Issue</th><th>Scheduled</th><th>Status</th></tr></thead>
              <tbody>
                {filteredBookings.slice(0, 6).map((b, i) => (
                  <tr key={i}>
                    <td><div style={{ fontWeight: 600, fontSize: '12px', color: '#1A0A3C' }}>{b.customerName || '—'}</div></td>
                    <td><div style={{ fontSize: '10px', color: '#3D2580' }}>{b.jobType || '—'}</div></td>
                    <td><div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: '#3D1FA8' }}>{b.scheduledDate || '—'}</div></td>
                    <td><StatusTag status={b.status} /></td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#7468A0', padding: '20px', fontSize: '11px' }}>No bookings {period === 'today' ? 'today' : 'this period'}</td></tr>}
              </tbody>
            </table>
          </div>
          {/* Performance */}
          <div className="card">
            <div className="card-hdr"><div className="card-title">Performance</div><span className="bdg b-g">All time</span></div>
            <div>
              {[
                { label: 'Answer Rate', val: `${answeredPct}%`, pct: answeredPct, color: '#0A7455' },
                { label: 'Booking Rate', val: `${bookingRate}%`, pct: bookingRate, color: '#3D1FA8' },
                { label: 'Emergency Resolved', val: `${resolvedPct}%`, pct: resolvedPct, color: '#C9A84C' },
                { label: 'Calls Handled', val: totalCalls.toString(), pct: Math.min(100, totalCalls * 2), color: '#6B3FD0' },
              ].map(m => (
                <div key={m.label} className="met-row">
                  <div className="met-label">{m.label}</div>
                  <div className="met-bar-wrap"><div className="met-bar" style={{ background: m.color, width: `${m.pct}%` }} /></div>
                  <div className="met-val">{m.val}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Activity Feed */}
          <div className="card">
            <div className="card-hdr"><div className="card-title">Activity Feed</div><span className="bdg b-n">Live</span></div>
            <div>
              {feed.length === 0
                ? <div className="no-data">No activity yet</div>
                : feed.map((f, i) => (
                  <div key={i} className="feed-row">
                    <div className="feed-dot" style={{ background: f.color }} />
                    <div style={{ flex: 1 }}>
                      <div className="feed-text">{f.text}</div>
                      <div className="feed-time">{f.time}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Job Status Pipeline */}
        <div className="sec-hdr"><div className="sec-title">Job Status Pipeline</div><div className="sec-meta">Full journey — new lead to paid</div></div>
        <div className="card" style={{ marginBottom: '12px' }}>
          <div className="card-hdr">
            <div><div className="card-title">Pipeline Stages</div><div className="card-sub">Every job from first call to payment</div></div>
            <span className="bdg b-b">{pipeTotal} total</span>
          </div>
          <div className="job-pipeline">
            {[
              { label: 'New Leads', count: newLeads, dotBg: '#EDE8FF', dotColor: '#3D1FA8', border: '#3D1FA8' },
              { label: 'Quoted', count: quoted, dotBg: '#FEF8EC', dotColor: '#9A6200', border: '#C9A84C' },
              { label: 'Booked', count: booked, dotBg: '#E4F8F0', dotColor: '#047857', border: '#047857' },
              { label: 'In Progress', count: inProgress, dotBg: '#FEF8EC', dotColor: '#8A6000', border: '#C9A84C' },
              { label: 'Complete', count: completed, dotBg: '#F0FFF4', dotColor: '#166534', border: '#166534' },
              { label: 'Hot Leads', count: hotLeads, dotBg: '#FFF3E0', dotColor: '#C94C00', border: '#FF7B00' },
            ].map((stage, i, arr) => (
              <span key={stage.label} style={{ display: 'contents' }}>
                <div className="jp-stage">
                  <div className="jp-dot" style={{ background: stage.dotBg, color: stage.dotColor, borderColor: stage.border }}>
                    {stage.count}
                  </div>
                  <div className="jp-lbl">{stage.label}</div>
                </div>
                {i < arr.length - 1 && <div className="jp-arrow">›</div>}
              </span>
            ))}
          </div>
        </div>

        {/* Pipeline Tiles */}
        <div className="sec-hdr"><div className="sec-title">Pipeline Overview</div></div>
        <div className="pipe-grid">
          <PipeTile value={newLeads} label="New Leads" badge="New" badgeCls="b-b" barColor="#3D1FA8" max={pipeMax} />
          <PipeTile value={quoted} label="Quoted" badge="Quote" badgeCls="b-a" barColor="#9A6200" max={pipeMax} />
          <PipeTile value={booked} label="Confirmed" badge="Booked" badgeCls="b-g" barColor="#0A7455" max={pipeMax} />
          <PipeTile value={hotLeads} label="Hot Leads" badge="Hot" badgeCls="b-a" barColor="#D94F00" max={pipeMax} />
          <PipeTile value={completed} label="Completed" badge="Done" badgeCls="b-g" barColor="#047857" max={pipeMax} />
          <PipeTile value={`${convRate}%`} label="Conversion" badge="Rate" badgeCls="b-n" barColor="#4A2090" max={100} raw={convRate} />
        </div>

        {/* Week Strip */}
        <div className="sec-hdr"><div className="sec-title">This week</div></div>
        <div className="wgrid" style={{ marginBottom: '12px' }}>
          <div className="wc"><div className="wl">Total Calls</div><div className="wv">{weekInteractions.length}</div><div className="wch">last 7 days</div></div>
          <div className="wc"><div className="wl">Bookings</div><div className="wv">{weekBookings.length}</div><div className="wch">confirmed</div></div>
          <div className="wc"><div className="wl">Est. Revenue</div><div className="wv">£{Math.round(weekRevenue).toLocaleString()}</div><div className="wch">completed jobs</div></div>
          <div className="wc"><div className="wl">Hot Leads</div><div className="wv">{weekInteractions.filter(i => (i.outcome||'').toLowerCase() === 'hot').length}</div><div className="wch">ready to convert</div></div>
        </div>

      </div>
    </PortalShell>
  );
}

/* ── Sub-components ─────────────────────────────── */
function KCard({ stripe, iconBg, icon, badgeTxt, label, value, sub, warn }: any) {
  return (
    <div className="kc">
      <div className="kc-stripe" style={{ background: stripe }} />
      <div className="kc-top">
        <div className="kc-ico" style={{ background: iconBg }}>{icon}</div>
        {badgeTxt && <span className={`kc-badge${warn ? ' warn' : ''}`}>{badgeTxt}</span>}
      </div>
      <div className="kl">{label}</div>
      <div className="kv">{value}</div>
      <div className="ks">{sub}</div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const cls = s === 'completed' ? 't-bo' : s === 'confirmed' ? 't-bo' : s === 'cancelled' ? 't-em' : 't-nw';
  return <span className={`tag ${cls}`}>{status || '—'}</span>;
}

function PipeTile({ value, label, badge, badgeCls, barColor, max, raw }: any) {
  const pct = typeof raw === 'number' ? raw : (typeof value === 'number' ? Math.round((value / Math.max(max, 1)) * 100) : 0);
  return (
    <div className="ptile">
      <div className="ptile-top">
        <div className="ptv">{value}</div>
        <span className={`bdg ${badgeCls}`}>{badge}</span>
      </div>
      <div className="ptl">{label}</div>
      <div className="pt-bar"><div className="pt-barf" style={{ background: barColor, width: `${pct}%` }} /></div>
    </div>
  );
}

function HourBarChart({ interactions }: { interactions: any[] }) {
  const hours: number[] = new Array(24).fill(0);
  interactions.forEach(i => {
    const ts = i.timestamp || '';
    const h = parseInt(ts.slice(11, 13), 10);
    if (!isNaN(h)) hours[h]++;
  });
  const max = Math.max(...hours, 1);
  const workHours = hours.slice(7, 21);
  const labels = Array.from({ length: 14 }, (_, i) => `${i + 7}h`);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
      {workHours.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <div style={{ width: '100%', background: v > 0 ? '#3D1FA8' : '#EAEAF4', borderRadius: '3px 3px 0 0', height: `${Math.round((v / max) * 60) + (v > 0 ? 4 : 2)}px`, transition: 'height .3s' }} />
          </div>
          {i % 3 === 0 && <div style={{ fontSize: '7px', color: '#7468A0' }}>{labels[i]}</div>}
        </div>
      ))}
    </div>
  );
}

function fmtTime(ts: string) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ts.slice(11, 16) || '—'; }
}
