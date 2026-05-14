'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  clientId: string;
}

interface RawBooking {
  customerName?: string;
  jobType?: string;
  scheduledDate?: string;
  status?: string;
  timestamp?: string;
}

interface AggBooking extends RawBooking {
  clientName: string;
  clientId: string;
}

function ReadOnlyBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '8px 14px', borderRadius: '8px', background: '#EDE8FF', border: '1px solid rgba(61,31,168,0.15)' }}>
      <span style={{ fontSize: '13px' }}>👁</span>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#3D1FA8' }}>VA View — Read-only. You can view all client dashboards but cannot modify data or billing.</div>
      <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'rgba(61,31,168,0.12)', color: '#3D1FA8' }}>READ-ONLY</span>
    </div>
  );
}

function statusBadge(s: string) {
  const l = (s || '').toLowerCase();
  if (l === 'confirmed' || l === 'completed') return { bg: 'var(--a3b)', color: 'var(--a3)' };
  if (l === 'cancelled') return { bg: 'var(--a4b)', color: 'var(--a4)' };
  if (l === 'pending') return { bg: 'var(--a2b)', color: 'var(--a6)' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

function weekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return {
    start: mon.toISOString().slice(0, 10),
    end: sun.toISOString().slice(0, 10),
  };
}

function monthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function monthEnd(): string {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return last.toISOString().slice(0, 10);
}

export default function VABookingsClient({ user }: { user: JWTPayload }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<AggBooking[]>([]);
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const todayStr = new Date().toISOString().slice(0, 10);
  const week = weekRange();
  const mStart = monthStart();
  const mEnd = monthEnd();

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/clients');
        const d = await r.json();
        if (d.error) { setError(d.error); setLoading(false); return; }
        const clients: ClientConfig[] = d.clients || [];

        const results = await Promise.all(
          clients.map(async (c) => {
            try {
              const dr = await fetch(`/api/clients/${c.clientId}/data`);
              const dd = await dr.json();
              return { clientId: c.clientId, clientName: c.businessName, bookings: (dd.bookings || []) as RawBooking[] };
            } catch {
              return { clientId: c.clientId, clientName: c.businessName, bookings: [] };
            }
          })
        );

        const all: AggBooking[] = [];
        results.forEach(({ clientId, clientName, bookings: bks }) => {
          bks.forEach((b) => all.push({ ...b, clientId, clientName }));
        });
        all.sort((a, b) => {
          const ta = a.scheduledDate || a.timestamp || '';
          const tb = b.scheduledDate || b.timestamp || '';
          return ta > tb ? 1 : -1;
        });
        setBookings(all);
      } catch {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function dateKey(b: AggBooking) { return b.scheduledDate || b.timestamp || ''; }

  const todayCount = bookings.filter(b => dateKey(b).startsWith(todayStr)).length;
  const weekCount = bookings.filter(b => { const d = dateKey(b).slice(0, 10); return d >= week.start && d <= week.end; }).length;
  const monthCount = bookings.filter(b => { const d = dateKey(b).slice(0, 10); return d >= mStart && d <= mEnd; }).length;

  const visible = filter === 'today'
    ? bookings.filter(b => dateKey(b).startsWith(todayStr))
    : filter === 'week'
    ? bookings.filter(b => { const d = dateKey(b).slice(0, 10); return d >= week.start && d <= week.end; })
    : filter === 'month'
    ? bookings.filter(b => { const d = dateKey(b).slice(0, 10); return d >= mStart && d <= mEnd; })
    : bookings;

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal" page="Bookings" sub="All jobs and confirmed bookings across all clients" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
          {[
            { label: "Today's Bookings", val: loading ? '—' : todayCount, stripe: 'var(--a1)', note: todayStr },
            { label: 'This Week', val: loading ? '—' : weekCount, stripe: 'var(--a3)', note: `${week.start} – ${week.end}` },
            { label: 'This Month', val: loading ? '—' : monthCount, stripe: 'var(--a2)', note: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: s.stripe }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--ink)', marginBottom: '2px' }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{s.note}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>⚠ {error}</div>}

        {/* Filter + table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
              Job Schedule {!loading && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)' }}>({visible.length})</span>}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['today','week','month','all'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === f ? 'var(--a1)' : 'var(--slate)', color: filter === f ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>
                  {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: '36px', borderRadius: '6px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : visible.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>No bookings for this period</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>{['Client','Customer','Job Type','Slot','Status'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {visible.map((b, i) => {
                    const sb = statusBadge(b.status || '');
                    const slot = b.scheduledDate || b.timestamp || '—';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--a1)', fontSize: '10px', whiteSpace: 'nowrap' }}>{b.clientName}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)' }}>{b.customerName || '—'}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{b.jobType || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{slot.length > 10 ? `${slot.slice(0,10)} ${slot.slice(11,16)}` : slot}</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: sb.bg, color: sb.color }}>{b.status || '—'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
