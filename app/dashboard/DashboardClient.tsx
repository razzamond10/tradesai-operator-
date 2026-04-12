'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import KPICard from '@/components/KPICard';
import ActivityChart from '@/components/ActivityChart';
import type { JWTPayload } from '@/lib/auth';

interface ClientData {
  config: any;
  kpis: { callsToday: number; bookingsToday: number; revenue: number; hotLeads: number };
  interactions: any[];
  bookings: any[];
  emergencies: any[];
}

export default function DashboardClient({ user }: { user: JWTPayload }) {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  return (
    <PortalShell role={user.role} name={user.name} clientId={user.clientId}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem', letterSpacing: '-0.5px' }}>
          {data?.config?.businessName || 'Dashboard'}
        </h1>
        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>
          {data?.config?.tradeType} · Live activity overview
        </p>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {data && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KPICard label="Calls Today" value={data.kpis.callsToday} icon="📞" sub="AI-handled" />
            <KPICard label="Bookings Today" value={data.kpis.bookingsToday} icon="📅" sub="Auto-booked" />
            <KPICard label="Revenue (Completed)" value={`£${data.kpis.revenue.toLocaleString()}`} icon="💷" sub="From completed jobs" />
            <KPICard label="Hot Leads" value={data.kpis.hotLeads} icon="🔥" sub="Ready to convert" />
          </div>

          {/* Chart + Emergencies */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Call Activity (7 days)</h3>
              <ActivityChart interactions={data.interactions} />
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>🚨 Emergencies</h3>
              {data.emergencies.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No emergencies logged</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.emergencies.slice(0, 5).map((em, i) => (
                    <div key={i} style={{
                      padding: '0.65rem 0.85rem', borderRadius: '10px',
                      background: em.resolved === 'Yes' ? 'rgba(0,180,0,0.06)' : 'rgba(220,50,50,0.06)',
                      border: `1px solid ${em.resolved === 'Yes' ? 'rgba(0,180,0,0.2)' : 'rgba(220,50,50,0.2)'}`,
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#1A0A3C' }}>{em.callerName || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{em.type} · {em.severity}</div>
                      <div style={{ fontSize: '0.7rem', color: em.resolved === 'Yes' ? 'green' : '#cc3333', marginTop: '0.2rem', fontWeight: '600' }}>
                        {em.resolved === 'Yes' ? '✓ Resolved' : '⚠ Active'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Jobs Table */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Recent Calls</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {['Time', 'Caller', 'Phone', 'Intent', 'Outcome'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#888', fontWeight: '600', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.interactions.slice(0, 10).map((it, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#888', fontSize: '0.8rem' }}>{formatTime(it.timestamp)}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#1A0A3C', fontWeight: '500' }}>{it.callerName || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#888' }}>{it.phone || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#555' }}>{it.intent || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <OutcomeBadge outcome={it.outcome} />
                      </td>
                    </tr>
                  ))}
                  {data.interactions.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No calls logged yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </PortalShell>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const o = (outcome || '').toLowerCase();
  const color =
    o === 'booked' ? '#16a34a' :
    o === 'hot' ? '#ea580c' :
    o === 'missed' ? '#dc2626' :
    '#888';
  const bg =
    o === 'booked' ? 'rgba(22,163,74,0.1)' :
    o === 'hot' ? 'rgba(234,88,12,0.1)' :
    o === 'missed' ? 'rgba(220,38,38,0.1)' :
    'rgba(0,0,0,0.05)';
  return (
    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px', background: bg, color, fontSize: '0.75rem', fontWeight: '600' }}>
      {outcome || '—'}
    </span>
  );
}

function formatTime(ts: string) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts.slice(0, 16);
  }
}

function LoadingState() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
      {[1,2,3,4].map((i) => (
        <div key={i} style={{ height: '110px', borderRadius: '16px', background: 'rgba(0,0,0,0.06)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: '1.5rem', background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: '12px', color: '#cc3333' }}>
      {message}
    </div>
  );
}
