'use client';
import { useEffect, useState } from 'react';
import AdminClientShell from '@/components/AdminClientShell';
import Topbar from '@/components/Topbar';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import type { JWTPayload } from '@/lib/auth';

// ── helpers ────────────────────────────────────────────────────────────────────

function parseValue(v: string) {
  const n = parseFloat((v || '').replace(/[^0-9.]/g, '') || '0');
  return isNaN(n) ? 0 : n;
}
function fmtCurrency(v: number) {
  return v >= 1000 ? `£${(v / 1000).toFixed(1)}k` : `£${Math.round(v)}`;
}
function last30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}

// ── Reusable sub-components ────────────────────────────────────────────────────

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

function CardHdr({ title, sub, badge, badgeColor }: { title: string; sub?: string; badge?: string; badgeColor?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {badge && (
        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: badgeColor ? `${badgeColor}18` : 'var(--slate)', color: badgeColor || 'var(--muted)' }}>{badge}</span>
      )}
    </div>
  );
}

function KPICard({ stripe, iconBg, icon, label, value, sub, badge }: { stripe: string; iconBg: string; icon: string; label: string; value: string | number; sub: string; badge?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
      <div style={{ height: '3px', background: stripe }} />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{icon}</div>
          {badge && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: iconBg, color: stripe }}>{badge}</span>}
        </div>
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const lower = (status || '').toLowerCase();
  let bg = 'var(--slate)', color = 'var(--muted)';
  if (lower === 'completed' || lower === 'confirmed') { bg = 'var(--a3b)'; color = 'var(--a3)'; }
  else if (lower === 'cancelled') { bg = 'var(--a4b)'; color = 'var(--a4)'; }
  else if (lower === 'pending') { bg = 'var(--a2b)'; color = 'var(--a6)'; }
  return (
    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: bg, color }}>{status || 'Unknown'}</span>
  );
}

// ── Section renderers ──────────────────────────────────────────────────────────

function AnalyticsSection({ interactions, bookings, emergencies }: { interactions: any[]; bookings: any[]; emergencies: any[] }) {

  const intentMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.intent || 'Unknown'; intentMap[k] = (intentMap[k] || 0) + 1; });
  const intentColors = ['#3D1FA8','#0A7455','#C9A84C','#C01830','#6B3FD0','#9A6200'];
  const intentData = Object.entries(intentMap).slice(0, 6).map(([label, value], i) => ({ label, value, color: intentColors[i] }));

  const outcomeMap: Record<string, number> = {};
  interactions.forEach(i => { const k = i.outcome || 'Unknown'; outcomeMap[k] = (outcomeMap[k] || 0) + 1; });
  const outcomeColors = ['#0A7455','#C9A84C','#C01830','#3D1FA8','#6B3FD0'];
  const outcomeData = Object.entries(outcomeMap).slice(0, 5).map(([label, value], i) => ({ label, value, color: outcomeColors[i] }));

  const convRate = interactions.length > 0 ? Math.round((bookings.length / interactions.length) * 100) : 0;
  const revTotal = bookings.reduce((s, b) => s + parseValue(b.value), 0);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📞" label="Total Calls" value={interactions.length} sub="all time" badge="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="📅" label="Bookings" value={bookings.length} sub="from AI calls" badge="total" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🎯" label="Conversion Rate" value={`${convRate}%`} sub="calls → bookings" badge="rate" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="💰" label="Total Revenue" value={fmtCurrency(revTotal)} sub="from bookings" badge="value" />
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <CardHdr title="30-Day Call Volume" sub="Calls captured by AI" badge={`${interactions.length} total`} badgeColor="#3D1FA8" />
        <div style={{ padding: '14px', height: '180px' }}>
          <ActivityLineChart interactions={interactions} bookings={bookings} mode="month" />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Card>
          <CardHdr title="Call Intents" sub="What callers ask for" badge={`${Object.keys(intentMap).length} types`} badgeColor="#0A7455" />
          <div style={{ padding: '14px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {intentData.length > 0 ? <DonutChart data={intentData} total={interactions.length} centerLabel="INTENTS" /> : <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No data yet</div>}
          </div>
        </Card>
        <Card>
          <CardHdr title="Call Outcomes" sub="How calls resolved" badge={`${Object.keys(outcomeMap).length} types`} badgeColor="#C9A84C" />
          <div style={{ padding: '14px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {outcomeData.length > 0 ? <DonutChart data={outcomeData} total={interactions.length} centerLabel="OUTCOMES" /> : <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No data yet</div>}
          </div>
        </Card>
      </div>
    </>
  );
}

function ScheduleSection({ bookings }: { bookings: any[] }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const upcoming = [...bookings]
    .filter(b => b.scheduledDate)
    .sort((a, b) => (a.scheduledDate > b.scheduledDate ? 1 : -1));

  const filtered = upcoming.filter(b => {
    const matchStatus = statusFilter === 'all' || (b.status || '').toLowerCase() === statusFilter;
    const matchSearch = !search ||
      (b.callerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.serviceType || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts: Record<string, number> = { all: upcoming.length };
  upcoming.forEach(b => { const s = (b.status || 'unknown').toLowerCase(); statusCounts[s] = (statusCounts[s] || 0) + 1; });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="📅" label="Total Bookings" value={bookings.length} sub="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="✅" label="Confirmed" value={bookings.filter(b => (b.status||'').toLowerCase()==='confirmed').length} sub="scheduled" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="⏳" label="Pending" value={bookings.filter(b => (b.status||'').toLowerCase()==='pending').length} sub="awaiting confirmation" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="❌" label="Cancelled" value={bookings.filter(b => (b.status||'').toLowerCase()==='cancelled').length} sub="not proceeding" />
      </div>

      <Card>
        <CardHdr title="Job Schedule" sub="Bookings sorted by date" badge={`${filtered.length} jobs`} badgeColor="#C9A84C" />
        <div style={{ padding: '12px 14px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--divider)', flexWrap: 'wrap', alignItems: 'center' }}>
          {['all','confirmed','pending','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: statusFilter === s ? 'var(--a2)' : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)',
              fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>{s} {s === 'all' ? `(${statusCounts.all})` : `(${statusCounts[s] || 0})`}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '11px', outline: 'none', width: '160px', fontFamily: '"Inter",sans-serif' }} />
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No bookings found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: 'var(--slate)' }}>
                  {['Date', 'Customer', 'Service', 'Phone', 'Value', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--ink)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--slate)', background: i % 2 === 0 ? '#fff' : 'var(--bg)' }}>
                    <td style={{ padding: '9px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--ink2)' }}>{b.scheduledDate || '—'}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.callerName || '—'}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--ink2)' }}>{b.serviceType || '—'}</td>
                    <td style={{ padding: '9px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.phone || '—'}</td>
                    <td style={{ padding: '9px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: 'var(--a3)' }}>{b.value ? `£${b.value}` : '—'}</td>
                    <td style={{ padding: '9px 12px' }}><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

function PipelineSection({ interactions, bookings }: { interactions: any[]; bookings: any[] }) {
  const stages = [
    { label: 'New Lead', icon: '📥', key: 'new', color: '#3D1FA8' },
    { label: 'Contacted', icon: '📞', key: 'contacted', color: '#6B3FD0' },
    { label: 'Quoted', icon: '📋', key: 'quoted', color: '#C9A84C' },
    { label: 'Negotiating', icon: '🤝', key: 'negotiating', color: '#9A6200' },
    { label: 'Confirmed', icon: '✅', key: 'confirmed', color: '#0A7455' },
    { label: 'Completed', icon: '🏁', key: 'completed', color: '#0A7455' },
    { label: 'Cancelled', icon: '❌', key: 'cancelled', color: '#C01830' },
  ];

  const stageCounts: Record<string, any[]> = {};
  stages.forEach(s => { stageCounts[s.key] = []; });
  bookings.forEach(b => {
    const key = (b.status || 'new').toLowerCase();
    if (stageCounts[key]) stageCounts[key].push(b);
    else stageCounts['new'].push(b);
  });
  // Unbooked interactions → new leads
  const bookedPhones = new Set(bookings.map(b => b.phone));
  interactions.filter(i => !bookedPhones.has(i.phone)).forEach(i => stageCounts['new'].push(i));

  const total = bookings.length + interactions.filter(i => !bookedPhones.has(i.phone)).length;
  const convRate = total > 0 ? Math.round((stageCounts['completed'].length / total) * 100) : 0;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📥" label="Total Leads" value={total} sub="calls captured" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="✅" label="Completed Jobs" value={stageCounts['completed'].length} sub="successfully finished" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🎯" label="Conversion Rate" value={`${convRate}%`} sub="lead to completion" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="❌" label="Cancelled" value={stageCounts['cancelled'].length} sub="lost leads" />
      </div>

      <Card>
        <CardHdr title="Lead Pipeline" sub="All leads by stage" badge={`${total} total`} badgeColor="#3D1FA8" />
        <div style={{ padding: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {stages.map((stage) => {
            const items = stageCounts[stage.key] || [];
            const pct = total > 0 ? Math.round((items.length / total) * 100) : 0;
            return (
              <div key={stage.key} style={{ flex: '0 0 auto', width: '140px', background: 'var(--slate)', borderRadius: '10px', padding: '12px', borderTop: `3px solid ${stage.color}` }}>
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stage.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>{stage.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '24px', fontWeight: 900, color: stage.color, lineHeight: 1.1 }}>{items.length}</div>
                <div style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '4px' }}>{pct}% of total</div>
                <div style={{ marginTop: '8px', height: '3px', borderRadius: '2px', background: '#D8D0F0' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: '2px', background: stage.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function EmergenciesSection({ emergencies }: { emergencies: any[] }) {
  const [filter, setFilter] = useState<'all'|'active'|'resolved'>('all');
  const active = emergencies.filter(e => (e.resolved || '').toLowerCase() !== 'yes');
  const resolved = emergencies.filter(e => (e.resolved || '').toLowerCase() === 'yes');
  const filtered = filter === 'active' ? active : filter === 'resolved' ? resolved : emergencies;

  const sevStyle = (s: string) => {
    const l = (s || '').toLowerCase();
    if (l === 'high' || l === 'critical') return { bg: 'var(--a4b)', color: 'var(--a4)', icon: '🔴' };
    if (l === 'medium') return { bg: 'var(--a2b)', color: 'var(--a6)', icon: '🟡' };
    return { bg: 'var(--slate)', color: 'var(--muted)', icon: '🟢' };
  };

  return (
    <>
      {active.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', background: 'var(--a4b)', border: '1px solid #F5C0C8', marginBottom: '14px' }}>
          <span style={{ fontSize: '16px' }}>🚨</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--a4)' }}>{active.length} unresolved emergency{active.length !== 1 ? 'ies' : ''}</div>
            <div style={{ fontSize: '10px', color: 'var(--a4)', marginTop: '1px' }}>Action required — contact affected customers</div>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="🚨" label="Total Emergencies" value={emergencies.length} sub="all time" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="⚠️" label="Unresolved" value={active.length} sub="need attention" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="✅" label="Resolved" value={resolved.length} sub="handled" />
      </div>

      <Card>
        <CardHdr title="Emergency Log" sub="Urgent calls requiring action" />
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', gap: '6px' }}>
          {(['all','active','resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: filter === f ? (f === 'active' ? 'var(--a4)' : f === 'resolved' ? 'var(--a3)' : 'var(--a1)') : 'var(--slate)',
              color: filter === f ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>
              {f === 'all' ? `All (${emergencies.length})` : f === 'active' ? `Active (${active.length})` : `Resolved (${resolved.length})`}
            </button>
          ))}
        </div>
        <div style={{ padding: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No emergencies</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...filtered].reverse().map((em, i) => {
                const sev = sevStyle(em.severity);
                const isActive = (em.resolved || '').toLowerCase() !== 'yes';
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: '8px', border: `1px solid ${isActive ? '#F5C0C8' : 'var(--divider)'}`, borderLeft: `4px solid ${isActive ? 'var(--a4)' : 'var(--a3)'}`, background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{isActive ? '🚨' : '✅'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{em.callerName || 'Unknown'}</span>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: sev.bg, color: sev.color }}>{sev.icon} {em.severity || 'Unknown'}</span>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: isActive ? 'var(--a4b)' : 'var(--a3b)', color: isActive ? 'var(--a4)' : 'var(--a3)' }}>{isActive ? '⚠ Unresolved' : '✓ Resolved'}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{em.phone || '—'}</span>
                          {em.timestamp && <span> · {em.timestamp.slice(0, 16).replace('T', ' ')}</span>}
                        </div>
                      </div>
                      {isActive && (
                        <a href={`tel:${em.phone}`} style={{ padding: '5px 12px', borderRadius: '7px', background: 'var(--a4)', color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>📞 Call</a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

function CommsSection({ interactions }: { interactions: any[] }) {
  const [search, setSearch] = useState('');
  const [outcome, setOutcome] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  const outcomes = [...new Set(interactions.map(i => i.outcome).filter(Boolean))];
  const filtered = [...interactions].reverse().filter(i => {
    const matchOutcome = outcome === 'all' || i.outcome === outcome;
    const matchSearch = !search || (i.callerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.intent || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.notes || '').toLowerCase().includes(search.toLowerCase());
    return matchOutcome && matchSearch;
  });

  const outcomeStyle = (o: string) => {
    const l = (o || '').toLowerCase();
    if (l.includes('booking') || l.includes('booked')) return { bg: 'var(--a3b)', color: 'var(--a3)' };
    if (l.includes('emergency')) return { bg: 'var(--a4b)', color: 'var(--a4)' };
    if (l.includes('quote')) return { bg: 'var(--a2b)', color: 'var(--a6)' };
    return { bg: 'var(--slate)', color: 'var(--muted)' };
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📞" label="Total Calls" value={interactions.length} sub="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="📅" label="With Bookings" value={interactions.filter(i => (i.outcome||'').toLowerCase().includes('book')).length} sub="converted" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🕐" label="Today" value={interactions.filter(i => (i.timestamp||'').startsWith(new Date().toISOString().slice(0,10))).length} sub="calls so far" />
      </div>

      <Card>
        <CardHdr title="Call Log" sub="All AI-answered interactions" badge={`${filtered.length} shown`} badgeColor="#3D1FA8" />
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['all', ...outcomes.slice(0,5)].map(o => (
              <button key={o} onClick={() => setOutcome(o)} style={{
                padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
                background: outcome === o ? 'var(--a1)' : 'var(--slate)', color: outcome === o ? '#fff' : 'var(--muted)',
                fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
              }}>{o === 'all' ? 'All' : o}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '11px', outline: 'none', width: '160px' }} />
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px', borderRight: selected ? '1px solid var(--divider)' : 'none' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No calls found</div>
            ) : filtered.map((item, i) => {
              const os = outcomeStyle(item.outcome);
              return (
                <div key={i} onClick={() => setSelected(selected?.timestamp === item.timestamp ? null : item)} style={{
                  padding: '10px 14px', borderBottom: '1px solid var(--slate)', cursor: 'pointer', transition: 'background .12s',
                  background: selected?.timestamp === item.timestamp ? 'var(--a1b)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--ink)' }}>{item.callerName || 'Unknown'}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: os.bg, color: os.color }}>{item.outcome || '—'}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', display: 'flex', gap: '10px' }}>
                    <span>{item.intent || 'General'}</span>
                    <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{(item.timestamp || '').slice(0, 16).replace('T', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Detail panel */}
          {selected && (
            <div style={{ width: '280px', padding: '14px', flexShrink: 0 }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>{selected.callerName || 'Unknown'}</div>
              {[
                { label: 'Phone', val: selected.phone },
                { label: 'Time', val: (selected.timestamp || '').slice(0,16).replace('T',' ') },
                { label: 'Intent', val: selected.intent },
                { label: 'Outcome', val: selected.outcome },
                { label: 'Notes', val: selected.notes },
              ].map(({ label, val }) => (
                <div key={label} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: label === 'Phone' || label === 'Time' ? '"IBM Plex Mono",monospace' : 'inherit' }}>{val || '—'}</div>
                </div>
              ))}
              <button onClick={() => setSelected(null)} style={{ marginTop: '8px', fontSize: '10px', fontWeight: 600, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Close ✕</button>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

function RevenueSection({ bookings }: { bookings: any[] }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const revTotal = bookings.reduce((s, b) => s + parseValue(b.value), 0);
  const confirmed = bookings.filter(b => ['confirmed','completed'].includes((b.status||'').toLowerCase()));
  const revConfirmed = confirmed.reduce((s, b) => s + parseValue(b.value), 0);
  const avgValue = bookings.length > 0 ? Math.round(revTotal / bookings.length) : 0;

  const filtered = bookings.filter(b => statusFilter === 'all' || (b.status||'').toLowerCase() === statusFilter);

  let running = 0;
  const withRunning = [...filtered].map(b => { running += parseValue(b.value); return { ...b, running }; });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="💰" label="Total Revenue" value={fmtCurrency(revTotal)} sub="all bookings" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="✅" label="Confirmed Value" value={fmtCurrency(revConfirmed)} sub="confirmed jobs" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="📊" label="Avg Job Value" value={fmtCurrency(avgValue)} sub="per booking" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="📅" label="Total Bookings" value={bookings.length} sub="all time" />
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <CardHdr title="Daily Revenue (30 days)" sub="Booking value captured by AI" badge={fmtCurrency(revTotal)} badgeColor="#0A7455" />
        <div style={{ padding: '14px', height: '160px' }}>
          <BarChart bookings={bookings} />
        </div>
      </Card>

      <Card>
        <CardHdr title="Bookings" sub="All jobs with revenue" badge={`${filtered.length} entries`} badgeColor="#C9A84C" />
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', gap: '4px' }}>
          {['all','confirmed','pending','completed','cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: statusFilter === s ? 'var(--a2)' : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)',
              fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: 'var(--slate)' }}>
                {['Date', 'Customer', 'Service', 'Value', 'Running Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--ink)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withRunning.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>No bookings found</td></tr>
              ) : withRunning.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--slate)', background: i % 2 === 0 ? '#fff' : 'var(--bg)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--ink2)' }}>{(b.timestamp||'—').slice(0,10)}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.callerName || '—'}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{b.serviceType || '—'}</td>
                  <td style={{ padding: '8px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: parseValue(b.value) > 0 ? 'var(--a3)' : 'var(--muted)' }}>{b.value ? `£${b.value}` : '—'}</td>
                  <td style={{ padding: '8px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: 'var(--ink2)', fontSize: '10px' }}>{fmtCurrency(b.running)}</td>
                  <td style={{ padding: '8px 12px' }}><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function ForecastSection({ interactions, bookings }: { interactions: any[]; bookings: any[] }) {
  const days = last30Days();
  const callsByDay = days.map(d => interactions.filter(i => (i.timestamp||'').startsWith(d)).length);
  const revByDay = days.map(d => bookings.filter(b => (b.timestamp||'').startsWith(d)).reduce((s, b) => s + parseValue(b.value), 0));

  const avgCalls = Math.round(callsByDay.reduce((a, b) => a + b, 0) / 30);
  const avgRev = Math.round(revByDay.reduce((a, b) => a + b, 0) / 30);

  const projCalls30 = avgCalls * 30;
  const projRev30 = avgRev * 30;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="📞" label="Avg Daily Calls" value={avgCalls} sub="last 30 days" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="💰" label="Avg Daily Revenue" value={fmtCurrency(avgRev)} sub="last 30 days" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📈" label="Projected Calls (30d)" value={projCalls30} sub="based on trend" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="💷" label="Projected Revenue (30d)" value={fmtCurrency(projRev30)} sub="based on trend" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Card>
          <CardHdr title="Call Volume Trend" sub="Last 30 days" />
          <div style={{ padding: '14px', height: '160px' }}>
            <ActivityLineChart interactions={interactions} bookings={bookings} mode="month" />
          </div>
        </Card>
        <Card>
          <CardHdr title="Revenue Trend" sub="Last 30 days" />
          <div style={{ padding: '14px', height: '160px' }}>
            <ActivityLineChart interactions={interactions} bookings={bookings} mode="month" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHdr title="Busiest Days of Week" sub="Call volume by day" badge="all time" badgeColor="#C9A84C" />
        <div style={{ padding: '14px', height: '160px' }}>
          <BarChart bookings={bookings} />
        </div>
      </Card>
    </>
  );
}

function ReviewsSection({ interactions }: { interactions: any[] }) {
  const feedback = interactions.filter(i => (i.intent || '').toLowerCase().includes('feedback') || (i.intent || '').toLowerCase().includes('review') || (i.outcome || '').toLowerCase().includes('feedback'));
  const positive = feedback.filter(i => ['great','good','excellent','happy','satisfied','positive','recommend'].some(w => (i.notes||'').toLowerCase().includes(w)));
  const negative = feedback.filter(i => ['complaint','bad','poor','unhappy','dissatisfied','issue','problem'].some(w => (i.notes||'').toLowerCase().includes(w)));
  const neutral = feedback.filter(i => !positive.includes(i) && !negative.includes(i));

  const score = feedback.length > 0 ? Math.round(((positive.length * 100 + neutral.length * 50) / feedback.length)).toFixed(0) : '—';

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="⭐" label="Feedback Calls" value={feedback.length} sub="review interactions" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="😊" label="Positive" value={positive.length} sub="happy customers" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="😐" label="Neutral" value={neutral.length} sub="no strong sentiment" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="😞" label="Negative" value={negative.length} sub="complaints" />
      </div>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>Sentiment Score</div>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '48px', fontWeight: 900, color: 'var(--a2)', lineHeight: 1 }}>{score}{feedback.length > 0 ? '%' : ''}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>Based on {feedback.length} feedback call{feedback.length !== 1 ? 's' : ''}</div>
        </div>
      </Card>

      <Card>
        <CardHdr title="Feedback Interactions" sub="Calls with review or feedback intent" badge={`${feedback.length} total`} badgeColor="#C9A84C" />
        {feedback.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No feedback interactions logged yet</div>
        ) : (
          <div>
            {[...feedback].reverse().map((item, i) => {
              const isPos = positive.includes(item);
              const isNeg = negative.includes(item);
              return (
                <div key={i} style={{ padding: '12px 14px', borderBottom: '1px solid var(--slate)', borderLeft: `3px solid ${isPos ? 'var(--a3)' : isNeg ? 'var(--a4)' : 'var(--faint)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{item.callerName || 'Unknown'}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: isPos ? 'var(--a3b)' : isNeg ? 'var(--a4b)' : 'var(--slate)', color: isPos ? 'var(--a3)' : isNeg ? 'var(--a4)' : 'var(--muted)' }}>
                      {isPos ? '😊 Positive' : isNeg ? '😞 Negative' : '😐 Neutral'}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{(item.timestamp||'').slice(0,10)}</span>
                  </div>
                  {item.notes && <div style={{ fontSize: '11px', color: 'var(--ink2)' }}>"{item.notes}"</div>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

function ConfigSection({ config }: { config: any }) {
  if (!config) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No configuration found</div>;

  const fields = [
    { label: 'Business Name', value: config.businessName, icon: '🏢' },
    { label: 'Trade Type', value: config.tradeType, icon: '🔧' },
    { label: 'Contact Name', value: config.contactName, icon: '👤' },
    { label: 'Phone Number', value: config.phone, icon: '📞', mono: true },
    { label: 'Email', value: config.email, icon: '✉️', mono: true },
    { label: 'Location', value: config.location, icon: '📍' },
    { label: 'Twilio Number', value: config.twilioNumber, icon: '🤖', mono: true },
    { label: 'Sheet ID', value: config.sheetId, icon: '📊', mono: true },
    { label: 'Client ID', value: config.clientId, icon: '🔑', mono: true },
    { label: 'AI Greeting', value: config.aiGreeting, icon: '💬' },
    { label: 'Business Hours', value: config.businessHours, icon: '🕐' },
    { label: 'Emergency Keywords', value: config.emergencyKeywords, icon: '🚨' },
  ].filter(f => f.value);

  return (
    <Card>
      <CardHdr title="Client Configuration" sub="Settings from master Google Sheet" badge="read-only" />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '0' }}>
        {fields.map(({ label, value, icon, mono }, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: i < fields.length - 1 ? '1px solid var(--slate)' : 'none' }}>
            <span style={{ fontSize: '16px', flexShrink: 0, width: '24px', textAlign: 'center', marginTop: '1px' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>{label}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink)', fontFamily: mono ? '"IBM Plex Mono",monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Section meta ───────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; sub: string }> = {
  analytics:   { label: 'Analytics',        sub: 'Performance metrics and call trends'            },
  schedule:    { label: 'Job Schedule',      sub: 'Confirmed bookings and upcoming jobs'           },
  pipeline:    { label: 'Lead Pipeline',     sub: 'All leads tracked through conversion stages'   },
  emergencies: { label: 'Emergencies',       sub: 'Urgent calls requiring immediate action'       },
  comms:       { label: 'Communications',   sub: 'Full AI call log and interaction history'       },
  revenue:     { label: 'Revenue Tracker',  sub: 'Booking values and revenue totals'              },
  forecast:    { label: 'Forecasting',      sub: 'Trends, projections and call patterns'          },
  reviews:     { label: 'Reviews & Ratings', sub: 'Customer feedback and sentiment analysis'      },
  config:      { label: 'Configuration',    sub: 'Client settings and AI configuration'           },
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminClientSection({ clientId, section, user }: { clientId: string; section: string; user: JWTPayload }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${clientId}/data`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load client data'))
      .finally(() => setLoading(false));
  }, [clientId]);

  const interactions: any[] = data?.interactions || [];
  const bookings: any[] = data?.bookings || [];
  const emergencies: any[] = data?.emergencies || [];
  const config = data?.config || null;

  const meta = SECTION_META[section] || { label: section, sub: '' };

  function renderSection() {
    if (loading) return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
      </div>
    );
    if (error) return (
      <div style={{ padding: '16px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px' }}>⚠ {error}</div>
    );
    switch (section) {
      case 'analytics':   return <AnalyticsSection interactions={interactions} bookings={bookings} emergencies={emergencies} />;
      case 'schedule':    return <ScheduleSection bookings={bookings} />;
      case 'pipeline':    return <PipelineSection interactions={interactions} bookings={bookings} />;
      case 'emergencies': return <EmergenciesSection emergencies={emergencies} />;
      case 'comms':       return <CommsSection interactions={interactions} />;
      case 'revenue':     return <RevenueSection bookings={bookings} />;
      case 'forecast':    return <ForecastSection interactions={interactions} bookings={bookings} />;
      case 'reviews':     return <ReviewsSection interactions={interactions} />;
      case 'config':      return <ConfigSection config={config} />;
      default:            return null;
    }
  }

  return (
    <AdminClientShell
      clientId={clientId}
      clientName={config?.businessName}
      tradeType={config?.tradeType}
      adminName={user.name}
    >
      <Topbar
        breadcrumb={config?.businessName || 'Client'}
        page={meta.label}
        sub={meta.sub}
      />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        {renderSection()}
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </AdminClientShell>
  );
}
