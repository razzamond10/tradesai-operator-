'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import type { JWTPayload } from '@/lib/auth';

export default function JobsClient({ user }: { user: JWTPayload }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  const statuses = ['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <PortalShell role={user.role} name={user.name} >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem' }}>Jobs & Bookings</h1>
        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>All bookings captured by TradesAI</p>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
            border: filter === s ? '1px solid #C9A84C' : '1px solid rgba(0,0,0,0.1)',
            background: filter === s ? 'rgba(201,168,76,0.1)' : '#fff',
            color: filter === s ? '#C9A84C' : '#888', cursor: 'pointer',
          }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <p style={{ color: '#aaa' }}>Loading…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  {['Booked At', 'Customer', 'Phone', 'Job Type', 'Scheduled', 'Status', 'Value'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#888', fontWeight: '600', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#888', fontSize: '0.8rem' }}>{fmt(b.timestamp)}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#1A0A3C', fontWeight: '500' }}>{b.customerName || '—'}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#888' }}>{b.phone || '—'}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#555' }}>{b.jobType || '—'}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#555' }}>{b.scheduledDate || '—'}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#1A0A3C', fontWeight: '600' }}>{b.value || '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const map: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' },
    confirmed: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb' },
    pending: { bg: 'rgba(234,179,8,0.1)', color: '#ca8a04' },
    cancelled: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
  };
  const style = map[s] || { bg: 'rgba(0,0,0,0.05)', color: '#888' };
  return <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px', background: style.bg, color: style.color, fontSize: '0.75rem', fontWeight: '600' }}>{status || '—'}</span>;
}

function fmt(ts: string) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return ts.slice(0, 16); }
}
