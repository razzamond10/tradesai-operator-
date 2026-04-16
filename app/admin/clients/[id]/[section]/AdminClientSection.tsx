'use client';
import { useEffect, useRef, useState } from 'react';
import AdminClientShell from '@/components/AdminClientShell';
import Topbar from '@/components/Topbar';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import BookingsCalendar from '@/components/BookingsCalendar';
import type { JWTPayload } from '@/lib/auth';

// ── helpers ────────────────────────────────────────────────────────────────────

function parseValue(v: string) {
  const n = parseFloat((v || '').replace(/[£$€,\s]/g, '').replace(/[^0-9.]/g, '') || '0');
  if (isNaN(n) || n < 0 || n > 99999) return 0;
  return n;
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

const _MONTHS: Record<string, string> = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12' };
function parseScheduledDate(raw: string): { date: string; time: string } | null {
  if (!raw) return null;
  let m = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (m) return { date: m[1], time: m[2] };
  m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return { date: m[1], time: '' };
  m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{2}:\d{2}))?/);
  if (m) return { date: `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`, time: m[4] || '' };
  m = raw.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(?:at\s+)?(\d{2}:\d{2}))?/i);
  if (m) { const mo = _MONTHS[m[2].toLowerCase().slice(0,3)]; if (mo) return { date: `${m[3]}-${mo}-${m[1].padStart(2,'0')}`, time: m[4] || '' }; }
  return null;
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
    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', minHeight: '92px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: '60px', flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {badge && (
        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: badgeColor ? `${badgeColor}18` : 'var(--slate)', color: badgeColor || 'var(--muted)', flexShrink: 0, alignSelf: 'flex-start' }}>{badge}</span>
      )}
    </div>
  );
}

function KPICard({ stripe, iconBg, icon, label, value, sub, badge }: { stripe: string; iconBg: string; icon: string; label: string; value: string | number; sub: string; badge?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '3px', background: stripe, flexShrink: 0 }} />
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
        {/* Icon slot — fixed height so label always starts at same Y */}
        <div style={{ height: '36px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{icon}</div>
          {badge && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: iconBg, color: stripe }}>{badge}</span>}
        </div>
        {/* Label slot — fixed minHeight so value always starts at same Y regardless of wrap */}
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', lineHeight: '1.3', minHeight: '2.8em', marginBottom: '8px' }}>{label}</div>
        {/* Value slot — pinned to same Y on every card */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '4px' }}>{value}</div>
        {/* Sub slot */}
        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{sub}</div>
      </div>
    </div>
  );
}

function statusColor(status: string): { bg: string; color: string } {
  const lower = (status || '').toLowerCase();
  if (lower.includes('confirm') || lower.includes('complet') || lower.includes('done') || lower.includes('paid')) return { bg: 'var(--a3b)', color: 'var(--a3)' };
  if (lower.includes('cancel') || lower.includes('declin') || lower.includes('reject') || lower.includes('no show')) return { bg: 'var(--a4b)', color: 'var(--a4)' };
  if (lower.includes('pending') || lower.includes('await') || lower.includes('scheduled') || lower.includes('booked') || lower.includes('new')) return { bg: 'var(--a2b)', color: 'var(--a6)' };
  if (lower.includes('progress') || lower.includes('active') || lower.includes('ongoing')) return { bg: 'var(--a1b)', color: 'var(--a1)' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

function StatusBadge({ status }: { status: string }) {
  const { bg, color } = statusColor(status);
  return (
    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: bg, color }}>{status || 'Unknown'}</span>
  );
}

// ── Section renderers ──────────────────────────────────────────────────────────

function AnalyticsSection({ interactions, bookings }: { interactions: any[]; bookings: any[] }) {

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
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📞" label="Total Calls" value={interactions.length} sub="all time" badge="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="📅" label="Bookings" value={bookings.length} sub="from AI calls" badge="total" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🎯" label="Conversion Rate" value={`${convRate}%`} sub="calls → bookings" badge="rate" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="💰" label="Total Revenue" value={fmtCurrency(revTotal)} sub="from bookings" badge="value" />
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <CardHdr title="30-Day Call Volume" sub="Calls captured by AI" badge={`${interactions.length} total`} badgeColor="#3D1FA8" />
        <div style={{ padding: '14px' }}>
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

  const sorted = [...bookings].sort((a, b) => (a.scheduledDate > b.scheduledDate ? 1 : -1));

  const filtered = sorted.filter(b => {
    const matchStatus = statusFilter === 'all' || (b.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchSearch = !search ||
      (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.jobType || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Derive status counts from actual data — not hardcoded strings
  const statusCounts: Record<string, number> = { all: bookings.length };
  bookings.forEach(b => { const s = (b.status || '').trim(); if (s) statusCounts[s] = (statusCounts[s] || 0) + 1; });
  const distinctStatuses = Object.keys(statusCounts).filter(s => s !== 'all');

  // KPI counts using partial matching so "Confirmed ✓" still counts as confirmed
  const confirmedCount = bookings.filter(b => statusColor(b.status).color === 'var(--a3)').length;
  const pendingCount   = bookings.filter(b => statusColor(b.status).color === 'var(--a6)').length;
  const cancelledCount = bookings.filter(b => statusColor(b.status).color === 'var(--a4)').length;

  return (
    <>
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="📅" label="Total Bookings" value={bookings.length} sub="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="✅" label="Confirmed / Done" value={confirmedCount} sub="confirmed or completed" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="⏳" label="Pending / Booked" value={pendingCount} sub="awaiting or scheduled" />
        <KPICard stripe="var(--a4)" iconBg="var(--a4b)" icon="❌" label="Cancelled" value={cancelledCount} sub="not proceeding" />
      </div>

      <Card>
        <CardHdr title="Job Schedule" sub="Bookings sorted by date" badge={`${filtered.length} jobs`} badgeColor="#C9A84C" />
        <div style={{ padding: '12px 14px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--divider)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Filter tabs derived from real status values in the data */}
          {['all', ...distinctStatuses].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: statusFilter === s ? 'var(--a2)' : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)',
              fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>{s} ({s === 'all' ? bookings.length : statusCounts[s] || 0})</button>
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
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--ink2)' }}>{b.jobType || '—'}</td>
                    <td style={{ padding: '9px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.phone || '—'}</td>
                    <td style={{ padding: '9px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: 'var(--a3)' }}>{parseValue(b.value) > 0 ? `£${parseValue(b.value).toLocaleString()}` : '—'}</td>
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
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
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

function EmergenciesSection({ emergencies, clientId }: { emergencies: any[]; clientId: string }) {
  const [filter, setFilter] = useState<'all'|'active'|'resolved'>('all');
  const [resolving, setResolving] = useState<Record<number, boolean>>({});
  const [localResolved, setLocalResolved] = useState<Record<number, boolean>>({});

  // Merge sheet data with optimistic local overrides
  const merged = emergencies.map((e, i) => localResolved[i] ? { ...e, resolved: 'Yes' } : e);
  const active = merged.filter(e => (e.resolved || '').toLowerCase() !== 'yes');
  const resolved = merged.filter(e => (e.resolved || '').toLowerCase() === 'yes');
  const filtered = filter === 'active' ? active : filter === 'resolved' ? resolved : merged;

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
              {[...filtered].reverse().map((em, origIdx) => {
                // origIdx in reversed array; find original index in emergencies for the API call
                const dataIdx = emergencies.findIndex(
                  (e) => e.timestamp === em.timestamp && e.phone === em.phone
                );
                const sev = sevStyle(em.severity);
                const isActive = (em.resolved || '').toLowerCase() !== 'yes';
                const isResolving = resolving[dataIdx];
                return (
                  <div key={origIdx} style={{ padding: '12px 14px', borderRadius: '8px', border: `1px solid ${isActive ? '#F5C0C8' : 'var(--divider)'}`, borderLeft: `4px solid ${isActive ? 'var(--a4)' : 'var(--a3)'}`, background: '#fff' }}>
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
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {isActive && (
                          <a href={`tel:${em.phone}`} style={{ padding: '5px 12px', borderRadius: '7px', background: 'var(--a4)', color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>📞 Call</a>
                        )}
                        {isActive && (
                          <button
                            disabled={isResolving || dataIdx < 0}
                            onClick={async () => {
                              if (dataIdx < 0) return;
                              setResolving(prev => ({ ...prev, [dataIdx]: true }));
                              try {
                                await fetch(`/api/clients/${encodeURIComponent(clientId)}/emergencies/resolve`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ rowIndex: dataIdx }),
                                });
                                setLocalResolved(prev => ({ ...prev, [dataIdx]: true }));
                              } finally {
                                setResolving(prev => ({ ...prev, [dataIdx]: false }));
                              }
                            }}
                            style={{
                              padding: '5px 12px', borderRadius: '7px',
                              background: isResolving ? 'var(--slate)' : 'var(--a3b)',
                              color: isResolving ? 'var(--muted)' : 'var(--a3)',
                              fontSize: '11px', fontWeight: 700, border: '1px solid var(--a3)',
                              cursor: isResolving ? 'not-allowed' : 'pointer',
                              fontFamily: '"Inter",sans-serif', transition: 'all .15s',
                            }}
                          >
                            {isResolving ? '…' : '✓ Mark Resolved'}
                          </button>
                        )}
                      </div>
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
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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
        <CardHdr title="Call Log" sub="Click any row to expand full transcript" badge={`${filtered.length} shown`} badgeColor="#3D1FA8" />
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
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No calls found</div>
          ) : filtered.map((item, i) => {
            const key = `${item.timestamp}-${i}`;
            const isOpen = expandedKey === key;
            const os = outcomeStyle(item.outcome);
            return (
              <div key={key} style={{ borderBottom: '1px solid var(--slate)' }}>
                {/* Summary row */}
                <div
                  onClick={() => setExpandedKey(isOpen ? null : key)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', transition: 'background .12s',
                    background: isOpen ? 'var(--a1b)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '10px', color: 'var(--faint)', transition: 'transform .15s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--ink)' }}>{item.callerName || 'Unknown'}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px', background: os.bg, color: os.color }}>{item.outcome || '—'}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', display: 'flex', gap: '10px' }}>
                      <span>{item.intent || 'General'}</span>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{(item.timestamp || '').slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  </div>
                </div>
                {/* Expanded details */}
                {isOpen && (
                  <div style={{ padding: '12px 14px 14px 32px', background: 'var(--a1b)', borderTop: '1px solid rgba(61,31,168,0.08)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px 20px', marginBottom: item.notes ? '12px' : 0 }}>
                      {[
                        { label: 'Phone', val: item.phone, mono: true },
                        { label: 'Time', val: (item.timestamp || '').slice(0, 16).replace('T', ' '), mono: true },
                        { label: 'Intent', val: item.intent },
                        { label: 'Outcome', val: item.outcome },
                      ].map(({ label, val, mono }) => (
                        <div key={label}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '2px' }}>{label}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: mono ? '"IBM Plex Mono",monospace' : 'inherit' }}>{val || '—'}</div>
                        </div>
                      ))}
                    </div>
                    {item.notes && (
                      <div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Transcript / Notes</div>
                        <div style={{ fontSize: '11px', color: 'var(--ink2)', lineHeight: 1.6, padding: '8px 10px', background: '#fff', borderRadius: '6px', border: '1px solid var(--divider)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.notes}</div>
                      </div>
                    )}
                    {!item.notes && (
                      <div style={{ fontSize: '10px', color: 'var(--faint)', fontStyle: 'italic' }}>No transcript or notes recorded for this call.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function RevenueSection({ bookings }: { bookings: any[] }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const revTotal = bookings.reduce((s, b) => s + parseValue(b.value), 0);
  // Use partial-match colour check to identify "confirmed/completed" bookings
  const confirmed = bookings.filter(b => statusColor(b.status).color === 'var(--a3)');
  const revConfirmed = confirmed.reduce((s, b) => s + parseValue(b.value), 0);
  const avgValue = bookings.length > 0 ? Math.round(revTotal / bookings.length) : 0;

  const distinctStatuses = [...new Set(bookings.map(b => (b.status || '').trim()).filter(Boolean))];
  const filtered = bookings.filter(b => statusFilter === 'all' || (b.status || '').trim() === statusFilter);

  let running = 0;
  const withRunning = [...filtered].map(b => { running += parseValue(b.value); return { ...b, running }; });

  return (
    <>
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
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
          {['all', ...distinctStatuses].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '3px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: statusFilter === s ? 'var(--a2)' : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)',
              fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
            }}>{s}</button>
          ))}
        </div>
        <>
          {/* Desktop table */}
          <div className="rev-table-wrap" style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{b.serviceType || b.jobType || '—'}</td>
                    <td style={{ padding: '8px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: parseValue(b.value) > 0 ? 'var(--a3)' : 'var(--muted)' }}>{parseValue(b.value) > 0 ? `£${parseValue(b.value).toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '8px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: 'var(--ink2)', fontSize: '10px' }}>{fmtCurrency(b.running)}</td>
                    <td style={{ padding: '8px 12px' }}><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="rev-cards-wrap" style={{ display: 'none', padding: '8px' }}>
            {withRunning.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No bookings found</div>
            ) : withRunning.map((b, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{b.customerName || '—'}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink2)', marginBottom: '6px' }}>{b.serviceType || b.jobType || '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 900, color: parseValue(b.value) > 0 ? 'var(--a3)' : 'var(--muted)' }}>
                    {parseValue(b.value) > 0 ? `£${parseValue(b.value).toLocaleString()}` : '—'}
                  </span>
                  <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: 'var(--muted)' }}>{(b.timestamp||'').slice(0,10)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      </Card>
    </>
  );
}

function DowBarChart({ interactions }: { interactions: any[] }) {
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
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    interactions.forEach(i => {
      // timestamp is "YYYY-MM-DD HH:MM:SS" — parse as local date to get correct weekday
      const raw = (i.timestamp || '').replace(' ', 'T');
      const d = new Date(raw);
      if (!isNaN(d.getTime())) counts[d.getDay()]++;
    });

    const maxVal = Math.max(...counts, 1);

    import('chart.js').then(({ Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip }) => {
      Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      if (!canvasRef.current) return;
      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: dayLabels,
          datasets: [{
            data: counts,
            backgroundColor: counts.map(v => `rgba(61,31,168,${0.2 + (v / maxVal) * 0.65})`),
            borderRadius: 5,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.raw} call${c.raw === 1 ? '' : 's'}` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#7468A0', font: { size: 11 } } },
            y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#7468A0', font: { size: 10 }, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [interactions]);

  return <div style={{ position: 'relative', height: '150px' }}><canvas ref={canvasRef} /></div>;
}

function ForecastSection({ interactions, bookings }: { interactions: any[]; bookings: any[] }) {
  const days = last30Days();
  const callsByDay = days.map(d => interactions.filter(i => (i.timestamp||'').startsWith(d)).length);
  const revByDay = days.map(d => bookings.filter(b => (b.timestamp||'').startsWith(d)).reduce((s, b) => s + parseValue(b.value), 0));

  const totalCalls30 = callsByDay.reduce((a, b) => a + b, 0);
  const totalRev30   = revByDay.reduce((a, b) => a + b, 0);

  // Use all-time data for averages when the 30-day window has too few points
  const effectiveCalls = totalCalls30 > 0 ? totalCalls30 : interactions.length;
  const effectiveDays  = totalCalls30 > 0 ? 30 : Math.max(
    (() => {
      const dates = [...new Set(interactions.map(i => (i.timestamp||'').slice(0,10)).filter(Boolean))];
      if (dates.length < 2) return 1;
      const span = (new Date(dates[dates.length-1]).getTime() - new Date(dates[0]).getTime()) / 86400000;
      return Math.max(Math.round(span) + 1, 1);
    })(),
    1
  );

  const avgCallsRaw = effectiveCalls / effectiveDays;
  // Show 1 decimal when fractional to avoid rounding to 0
  const avgCallsDisplay = avgCallsRaw === 0 ? '0' : avgCallsRaw < 1 ? avgCallsRaw.toFixed(1) : String(Math.round(avgCallsRaw));

  const effectiveRev  = totalRev30 > 0 ? totalRev30 : bookings.reduce((s, b) => s + parseValue(b.value), 0);
  const effectiveRevDays = totalRev30 > 0 ? 30 : Math.max(effectiveDays, 1);
  const avgRevRaw = effectiveRev / effectiveRevDays;

  // 30-day projection: extrapolate from observed rate
  const projCalls30 = Math.round(avgCallsRaw * 30);
  const projRev30   = Math.round(avgRevRaw * 30);

  return (
    <>
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="📞" label="Avg Daily Calls" value={avgCallsDisplay} sub="per day (all-time rate)" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="💰" label="Avg Daily Revenue" value={fmtCurrency(avgRevRaw)} sub="per day (all-time rate)" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📈" label="Projected Calls (30d)" value={projCalls30} sub="at current rate" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="💷" label="Projected Revenue (30d)" value={fmtCurrency(projRev30)} sub="at current rate" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Card>
          <CardHdr title="Call Volume Trend" sub="Last 30 days" />
          <div style={{ padding: '14px' }}>
            <ActivityLineChart interactions={interactions} bookings={bookings} mode="month" />
          </div>
        </Card>
        <Card>
          <CardHdr title="Revenue Trend" sub="Last 30 days" />
          <div style={{ padding: '14px' }}>
            <ActivityLineChart interactions={interactions} bookings={bookings} mode="month" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHdr title="Busiest Days of Week" sub="Call volume by day" badge="all time" badgeColor="#C9A84C" />
        <div style={{ padding: '14px 14px 24px' }}>
          <DowBarChart interactions={interactions} />
        </div>
      </Card>
    </>
  );
}

function ReviewsSection({ interactions: _interactions }: { interactions: any[] }) {
  return (
    <Card>
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px', lineHeight: 1 }}>⭐</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px' }}>No Reviews Collected Yet</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 28px' }}>
          Reviews feature coming in Professional tier (Oct 2026). Customers will be able to leave star ratings and written feedback automatically after each completed job.
        </div>
        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', padding: '10px 20px', borderRadius: '10px', background: 'var(--a2b)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span style={{ fontSize: '16px' }}>🗓️</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--a6)' }}>Coming October 2026 — Professional Tier</span>
        </div>
      </div>
    </Card>
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
    { label: 'Twilio Number', value: config.twilioNumber, icon: '📱', mono: true },
    { label: 'AI Webhook', value: config.makeWebhookUrl, icon: '🔗', mono: true },
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

// ── New section renderers ──────────────────────────────────────────────────────

type SortKey = 'date' | 'customer' | 'status' | 'value';

function JobScheduleSection({ bookings }: { bookings: any[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const parsed = bookings.map(b => {
    const p = parseScheduledDate(b.scheduledDate);
    return { ...b, _date: p?.date || '', _time: p?.time || '' };
  });
  const distinctStatuses = [...new Set(bookings.map(b => (b.status||'').trim()).filter(Boolean))];
  const filtered = parsed.filter(b => {
    const matchStatus = statusFilter === 'all' || (b.status||'').trim() === statusFilter;
    const matchSearch = !search ||
      (b.customerName||'').toLowerCase().includes(search.toLowerCase()) ||
      (b.jobType||'').toLowerCase().includes(search.toLowerCase()) ||
      (b.postcode||'').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });
  const sorted = [...filtered].sort((a, b) => {
    let av = '', bv = '';
    if (sortKey === 'date')     { av = a._date + a._time; bv = b._date + b._time; }
    else if (sortKey === 'customer') { av = a.customerName || ''; bv = b.customerName || ''; }
    else if (sortKey === 'status')   { av = a.status || ''; bv = b.status || ''; }
    else if (sortKey === 'value')    { av = String(parseValue(a.value)); bv = String(parseValue(b.value)); }
    const cmp = av.localeCompare(bv, undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });
  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }
  const si = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const confirmedCount = bookings.filter(b => statusColor(b.status).color === 'var(--a3)').length;
  const pendingCount   = bookings.filter(b => statusColor(b.status).color === 'var(--a6)').length;
  const revTotal = bookings.reduce((s, b) => s + parseValue(b.value), 0);

  return (
    <>
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="📅" label="Total Bookings" value={bookings.length} sub="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="✅" label="Confirmed / Done" value={confirmedCount} sub="confirmed or completed" />
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="⏳" label="Pending" value={pendingCount} sub="awaiting or scheduled" />
        <KPICard stripe="var(--a5)" iconBg="var(--a5b)" icon="💰" label="Total Value" value={fmtCurrency(revTotal)} sub="from all bookings" />
      </div>
      <Card>
        <CardHdr title="Job Schedule" sub="All bookings sorted by scheduled date" badge={`${sorted.length} jobs`} badgeColor="#C9A84C" />
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setStatusFilter('all')} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === 'all' ? 'var(--a2)' : 'var(--slate)', color: statusFilter === 'all' ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif' }}>All ({bookings.length})</button>
          {distinctStatuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === s ? 'var(--a2)' : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>{s} ({bookings.filter(b=>(b.status||'').trim()===s).length})</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, issue, postcode…" style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '11px', outline: 'none', width: '200px', fontFamily: '"Inter",sans-serif' }} />
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No bookings found</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="sched-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {([['date','Date'],['','Time'],['customer','Customer Name'],['','Phone'],['','Postcode'],['','Issue'],['status','Status'],['value','Value']] as [string,string][]).map(([k,label]) => (
                      <th key={label} onClick={k ? () => toggleSort(k as SortKey) : undefined} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--ink)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px', cursor: k ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none' }}>
                        {label}{k ? si(k as SortKey) : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((b, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--slate)', background: i%2===0 ? '#fff' : 'var(--bg)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--ink2)', whiteSpace: 'nowrap' }}>{b._date || '—'}</td>
                      <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{b._time || '—'}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{b.customerName || '—'}</td>
                      <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{b.phone || '—'}</td>
                      <td style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--ink2)', whiteSpace: 'nowrap' }}>{b.postcode || '—'}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--ink2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.jobType || '—'}</td>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}><StatusBadge status={b.status} /></td>
                      <td style={{ padding: '8px 12px', fontFamily: '"Inter Tight",sans-serif', fontWeight: 700, color: parseValue(b.value)>0 ? 'var(--a3)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{parseValue(b.value)>0 ? `£${parseValue(b.value).toLocaleString()}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="sched-cards-wrap" style={{ display: 'none', padding: '8px' }}>
              {sorted.map((b, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '11px', fontWeight: 700, color: 'var(--ink2)' }}>
                      {b._date || '—'}{b._time ? ` · ${b._time}` : ''}
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '3px' }}>{b.customerName || '—'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink2)', marginBottom: '4px' }}>{b.jobType || '—'}</div>
                  {parseValue(b.value) > 0 && <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--a3)' }}>£{parseValue(b.value).toLocaleString()}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}

function LeadPipelineSection({ interactions, bookings }: { interactions: any[]; bookings: any[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const bookedPhones = new Set(bookings.map(b => b.phone));
  const isBooked = (i: any) =>
    (i.outcome || '').toLowerCase().includes('book') || bookedPhones.has(i.phone);
  const isHot = (i: any) => {
    const o = (i.outcome || '').toLowerCase();
    return o.includes('quot') || o.includes('follow') || o.includes('hot') || o.includes('interest');
  };

  const leads = interactions.filter(i => !isBooked(i));
  const allOutcomes = [...new Set(leads.map(i => (i.outcome||'New').trim()).filter(Boolean))];

  const outcomeStyle = (o: string) => {
    const l = (o || 'new').toLowerCase();
    if (l.includes('quot'))   return { bg: 'var(--a2b)', color: 'var(--a6)', label: 'Quoted' };
    if (l.includes('follow')) return { bg: 'var(--a1b)', color: 'var(--a1)', label: 'Follow-up' };
    if (l.includes('close') || l.includes('lost') || l.includes('cancel')) return { bg: 'var(--a4b)', color: 'var(--a4)', label: 'Closed' };
    return { bg: 'var(--slate)', color: 'var(--muted)', label: o || 'New' };
  };

  const filtered = leads.filter(l => {
    const matchStatus = statusFilter === 'all' || (l.outcome||'New').trim() === statusFilter;
    const matchSearch = !search ||
      (l.callerName||'').toLowerCase().includes(search.toLowerCase()) ||
      (l.intent||'').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone||'').includes(search);
    return matchStatus && matchSearch;
  });
  const sorted = [...filtered].sort((a, b) => {
    const aHot = isHot(a) ? 0 : 1, bHot = isHot(b) ? 0 : 1;
    if (aHot !== bHot) return aHot - bHot;
    return (b.timestamp||'').localeCompare(a.timestamp||'');
  });

  const hotCount  = leads.filter(isHot).length;
  const coldCount = leads.filter(l => !isHot(l)).length;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📥" label="Total Leads" value={leads.length} sub="unbooked interactions" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🔥" label="Hot Leads" value={hotCount} sub="quoted or follow-up" />
        <KPICard stripe="var(--slate)" iconBg="var(--slate)" icon="❄️" label="Cold Leads" value={coldCount} sub="new or no status" />
      </div>
      <Card>
        <CardHdr title="Lead Pipeline" sub="Interactions that didn't convert to bookings" badge={`${sorted.length} leads`} badgeColor="#3D1FA8" />
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setStatusFilter('all')} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === 'all' ? 'var(--a1)' : 'var(--slate)', color: statusFilter === 'all' ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif' }}>All ({leads.length})</button>
          {allOutcomes.map(s => {
            const os = outcomeStyle(s);
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: statusFilter === s ? os.color : 'var(--slate)', color: statusFilter === s ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif' }}>
                {os.label} ({leads.filter(l=>(l.outcome||'New').trim()===s).length})
              </button>
            );
          })}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, issue…" style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '11px', outline: 'none', width: '200px', fontFamily: '"Inter",sans-serif' }} />
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            {leads.length === 0 ? '🎉 All interactions converted to bookings!' : 'No leads match your filter'}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="lead-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Date', 'Customer Name', 'Phone', 'Issue', 'Quote / Notes', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--ink)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((lead, i) => {
                    const hot = isHot(lead);
                    const os = outcomeStyle(lead.outcome);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--slate)', background: hot ? 'rgba(201,168,76,0.05)' : i%2===0 ? '#fff' : 'var(--bg)', borderLeft: hot ? '3px solid var(--a2)' : '3px solid transparent' }}>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--ink2)', whiteSpace: 'nowrap' }}>{(lead.timestamp||'').slice(0,10) || '—'}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{hot && <span style={{ marginRight: '4px' }}>🔥</span>}{lead.callerName || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{lead.phone || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.intent || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.notes || '—'}</td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: os.bg, color: os.color }}>{os.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="lead-cards-wrap" style={{ display: 'none', padding: '8px' }}>
              {sorted.map((lead, i) => {
                const hot = isHot(lead);
                const os = outcomeStyle(lead.outcome);
                return (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: '8px', marginBottom: '8px',
                    background: hot ? 'rgba(201,168,76,0.06)' : '#fff',
                    border: `1px solid ${hot ? 'rgba(201,168,76,0.35)' : 'var(--divider)'}`,
                    borderLeft: `3px solid ${hot ? 'var(--a2)' : 'var(--divider)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>
                        {hot && <span style={{ marginRight: '4px' }}>🔥</span>}{lead.callerName || '—'}
                      </span>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: 'var(--muted)' }}>{(lead.timestamp||'').slice(0,10)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink2)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lead.intent || '—'}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: os.bg, color: os.color }}>{os.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </>
  );
}

const COMMS_TABS = ['All', 'Booked', 'Quoted', 'Emergency', 'Follow-up'] as const;
type CommsTab = typeof COMMS_TABS[number];

function CommunicationsSection({ interactions }: { interactions: any[] }) {
  const [tab, setTab] = useState<CommsTab>('All');
  const [search, setSearch] = useState('');

  function matchTab(i: any, t: CommsTab) {
    if (t === 'All') return true;
    const o = (i.outcome || '').toLowerCase();
    if (t === 'Booked')    return o.includes('book');
    if (t === 'Quoted')    return o.includes('quot');
    if (t === 'Emergency') return o.includes('emergency') || o.includes('urgent') || (i.notes||'').toLowerCase().includes('emergency');
    if (t === 'Follow-up') return o.includes('follow');
    return true;
  }
  const bookingMade = (i: any) => (i.outcome || '').toLowerCase().includes('book');
  const outcomeStyle = (o: string) => {
    const l = (o || '').toLowerCase();
    if (l.includes('book'))      return { bg: 'var(--a3b)', color: 'var(--a3)' };
    if (l.includes('emergency') || l.includes('urgent')) return { bg: 'var(--a4b)', color: 'var(--a4)' };
    if (l.includes('quot'))      return { bg: 'var(--a2b)', color: 'var(--a6)' };
    if (l.includes('follow'))    return { bg: 'var(--a1b)', color: 'var(--a1)' };
    return { bg: 'var(--slate)', color: 'var(--muted)' };
  };

  const sorted = [...interactions].reverse();
  const filtered = sorted.filter(i => {
    return matchTab(i, tab) && (!search ||
      (i.callerName||'').toLowerCase().includes(search.toLowerCase()) ||
      (i.phone||'').includes(search) ||
      (i.intent||'').toLowerCase().includes(search.toLowerCase()));
  });
  const tabCounts = Object.fromEntries(COMMS_TABS.map(t => [t, interactions.filter(i => matchTab(i, t)).length]));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '16px' }}>
        <KPICard stripe="var(--a1)" iconBg="var(--a1b)" icon="📞" label="Total Calls" value={interactions.length} sub="all time" />
        <KPICard stripe="var(--a3)" iconBg="var(--a3b)" icon="📅" label="Bookings Made" value={interactions.filter(bookingMade).length} sub="from AI calls" />
        <KPICard stripe="var(--a2)" iconBg="var(--a2b)" icon="🕐" label="Today" value={interactions.filter(i=>(i.timestamp||'').startsWith(new Date().toISOString().slice(0,10))).length} sub="calls today" />
      </div>
      <Card>
        <CardHdr title="Full Call Log" sub="All AI-handled interactions" badge={`${filtered.length} shown`} badgeColor="#3D1FA8" />
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {COMMS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: tab === t ? 'var(--a1)' : 'var(--slate)', color: tab === t ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif' }}>
              {t} ({tabCounts[t]})
            </button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '11px', outline: 'none', width: '160px', fontFamily: '"Inter",sans-serif' }} />
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No calls found</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="comms-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Date', 'Customer Name', 'Phone', 'Issue / Intent', 'Booking Made', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--ink)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const booked = bookingMade(item);
                    const os = outcomeStyle(item.outcome);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--slate)', background: i%2===0 ? '#fff' : 'var(--bg)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--ink2)', whiteSpace: 'nowrap' }}>{(item.timestamp||'—').slice(0,16).replace('T',' ')}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{item.callerName || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{item.phone || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.intent || '—'}</td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: booked ? 'var(--a3)' : 'var(--muted)' }}>{booked ? '✓ Yes' : '✗ No'}</span>
                        </td>
                        <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: os.bg, color: os.color }}>{item.outcome || 'Unknown'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="comms-cards-wrap" style={{ display: 'none', padding: '8px' }}>
              {filtered.map((item, i) => {
                const booked = bookingMade(item);
                const os = outcomeStyle(item.outcome);
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--divider)', background: '#fff', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{item.callerName || '—'}</span>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '9px', color: 'var(--muted)' }}>{(item.timestamp||'').slice(0,10)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink2)', marginBottom: '8px' }}>{item.intent || '—'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: booked ? 'var(--a3)' : 'var(--muted)' }}>{booked ? '✓ Booked' : '✗ No booking'}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: os.bg, color: os.color }}>{item.outcome || 'Unknown'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </>
  );
}

function ConfigurationSection({ config }: { config: any }) {
  const [showContactMsg, setShowContactMsg] = useState(false);
  if (!config) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No configuration found</div>;

  const fields = [
    { label: 'Business Name',  value: config.businessName,    icon: '🏢' },
    { label: 'Trade Type',     value: config.tradeType,       icon: '🔧' },
    { label: 'Contact Name',   value: config.contactName,     icon: '👤' },
    { label: 'Phone Number',   value: config.phone,           icon: '📞', mono: true },
    { label: 'Twilio Number',  value: config.twilioNumber,    icon: '📱', mono: true },
    { label: 'Calendar ID',    value: config.calendarId,      icon: '📅', mono: true },
    { label: 'Sheet ID',       value: config.sheetId,         icon: '📊', mono: true },
    { label: 'Webhook URL',    value: config.makeWebhookUrl,  icon: '🔗', mono: true },
    { label: 'Client ID',      value: config.clientId,        icon: '🔑', mono: true },
    { label: 'Plan Tier',      value: 'Starter',              icon: '⭐' },
  ].filter(f => f.value);

  return (
    <Card>
      <CardHdr title="Client Configuration" sub="Settings from master Google Sheet" badge="read-only" />
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column' }}>
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
      <div style={{ padding: '16px', borderTop: '1px solid var(--divider)', marginTop: '4px' }}>
        <button onClick={() => setShowContactMsg(m => !m)} style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--a1)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}>
          ✏️ Edit Configuration
        </button>
        {showContactMsg && (
          <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'var(--a1b)', border: '1px solid rgba(61,31,168,0.15)', fontSize: '12px', color: 'var(--a1)', fontWeight: 500 }}>
            To update your configuration, please contact support at <strong>admin@tradesaioperator.uk</strong>
          </div>
        )}
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
  config:          { label: 'Configuration',      sub: 'Client settings and AI configuration'         },
  bookings:        { label: 'Bookings Calendar',  sub: 'Monthly view of all scheduled jobs'           },
  'job-schedule':  { label: 'Job Schedule',       sub: 'Sortable table of all booked jobs'            },
  'lead-pipeline': { label: 'Lead Pipeline',      sub: 'Unbooked interactions and hot leads'          },
  communications:  { label: 'Communications',     sub: 'Full AI call log and interaction history'     },
  configuration:   { label: 'Configuration',      sub: 'Client settings and AI configuration'         },
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminClientSection({ clientId, section, user }: { clientId: string; section: string; user: JWTPayload }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${encodeURIComponent(clientId)}/data`)
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
      <div className="admin-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
      </div>
    );
    if (error) return (
      <div style={{ padding: '16px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px' }}>⚠ {error}</div>
    );
    switch (section) {
      case 'analytics':   return <AnalyticsSection interactions={interactions} bookings={bookings} />;
      case 'schedule':    return <ScheduleSection bookings={bookings} />;
      case 'pipeline':    return <PipelineSection interactions={interactions} bookings={bookings} />;
      case 'emergencies': return <EmergenciesSection emergencies={emergencies} clientId={clientId} />;
      case 'comms':       return <CommsSection interactions={interactions} />;
      case 'revenue':     return <RevenueSection bookings={bookings} />;
      case 'forecast':    return <ForecastSection interactions={interactions} bookings={bookings} />;
      case 'reviews':     return <ReviewsSection interactions={interactions} />;
      case 'config':      return <ConfigSection config={config} />;
      case 'bookings':        return (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '18px' }}>
          <BookingsCalendar bookings={bookings} />
        </div>
      );
      case 'job-schedule':    return <JobScheduleSection bookings={bookings} />;
      case 'lead-pipeline':   return <LeadPipelineSection interactions={interactions} bookings={bookings} />;
      case 'communications':  return <CommunicationsSection interactions={interactions} />;
      case 'configuration':   return <ConfigurationSection config={config} />;
      default:                return null;
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
        <style>{`
          @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}
          @media (max-width: 768px) {
            .sched-table-wrap { display: none !important; }
            .sched-cards-wrap { display: block !important; }
            .comms-table-wrap { display: none !important; }
            .comms-cards-wrap { display: block !important; }
            .rev-table-wrap { display: none !important; }
            .rev-cards-wrap { display: block !important; }
            .lead-table-wrap { display: none !important; }
            .lead-cards-wrap { display: block !important; }
          }
        `}</style>
      </div>
    </AdminClientShell>
  );
}
