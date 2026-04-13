'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

function parseValue(v: string) {
  const n = parseFloat((v || '').replace(/[^0-9.]/g, '') || '0');
  return isNaN(n) ? 0 : n;
}

function fmt(ts: string) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return ts.slice(0, 16); }
}

function statusBadge(s: string) {
  const lower = (s || '').toLowerCase();
  if (lower === 'completed') return { bg: 'var(--a3b)', color: 'var(--a3)' };
  if (lower === 'confirmed') return { bg: 'var(--a1b)', color: 'var(--a1)' };
  if (lower === 'cancelled') return { bg: 'var(--a4b)', color: 'var(--a4)' };
  if (lower === 'pending') return { bg: 'var(--a2b)', color: 'var(--a6)' };
  if (lower === 'in progress') return { bg: '#F0EAFF', color: '#6B3FD0' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

export default function JobsClient({ user }: { user: JWTPayload }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date' | 'value' | 'status'>('date');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  const allStatuses = ['all', ...Array.from(new Set(bookings.map(b => b.status).filter(Boolean)))];

  const filtered = bookings
    .filter(b =>
      (filter === 'all' || (b.status || '') === filter) &&
      (!search ||
        (b.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.jobType || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.phone || '').includes(search))
    )
    .sort((a, b) => {
      if (sort === 'value') return parseValue(b.value) - parseValue(a.value);
      if (sort === 'status') return (a.status || '').localeCompare(b.status || '');
      // date — scheduled first, then timestamp
      const da = a.scheduledDate || a.timestamp || '';
      const db = b.scheduledDate || b.timestamp || '';
      return da > db ? 1 : -1;
    });

  const totalValue = filtered.reduce((s, b) => s + parseValue(b.value), 0);
  const completedCount = bookings.filter(b => b.status?.toLowerCase() === 'completed').length;
  const pendingCount = bookings.filter(b => ['pending','confirmed'].includes((b.status||'').toLowerCase())).length;

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Job Schedule" sub="All bookings from AI-captured calls" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { stripe: 'var(--a1)', icon: '📋', label: 'Total Bookings', val: loading ? '—' : bookings.length, sub: 'all time' },
            { stripe: 'var(--a3)', icon: '✅', label: 'Completed', val: loading ? '—' : completedCount, sub: 'finished jobs' },
            { stripe: 'var(--a2)', icon: '🕐', label: 'Pending / Confirmed', val: loading ? '—' : pendingCount, sub: 'upcoming jobs' },
            { stripe: 'var(--a4)', icon: '💷', label: 'Total Value', val: loading ? '—' : `£${Math.round(totalValue).toLocaleString()}`, sub: `${filtered.length} shown` },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: k.stripe }} />
              <div style={{ padding: '13px 14px' }}>
                <div style={{ fontSize: '16px', marginBottom: '6px' }}>{k.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '3px' }}>{k.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '24px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {allStatuses.map((s) => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: filter === s ? 'var(--a1)' : 'var(--slate)',
                color: filter === s ? '#fff' : 'var(--muted)',
                fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
              }}>{s === 'all' ? `All (${bookings.length})` : s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ padding: '5px 10px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '11px', color: 'var(--ink)', background: '#fff', outline: 'none', cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}>
              <option value="date">Sort: Date</option>
              <option value="value">Sort: Value</option>
              <option value="status">Sort: Status</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{ padding: '5px 12px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '12px', outline: 'none', width: '180px', background: '#fff', color: 'var(--ink)', fontFamily: '"Inter",sans-serif' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Loading bookings…</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr>
                      {['Booked At','Customer','Phone','Job Type','Scheduled Slot','Status','Value'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>No bookings found</td></tr>
                    ) : filtered.map((b, i) => {
                      const sb = statusBadge(b.status);
                      const val = parseValue(b.value);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--slate)'}
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = ''}>
                          <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmt(b.timestamp)}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                          <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{b.phone || '—'}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--ink2)', fontWeight: 500 }}>{b.jobType || '—'}</td>
                          <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{b.scheduledDate || '—'}</td>
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
              </div>
              {filtered.length > 0 && (
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
                  <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 900, color: 'var(--ink)' }}>£{Math.round(totalValue).toLocaleString()} total value</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
