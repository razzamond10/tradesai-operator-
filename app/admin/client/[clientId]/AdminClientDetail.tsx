'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import KPICard from '@/components/KPICard';
import ActivityChart from '@/components/ActivityChart';
import type { JWTPayload } from '@/lib/auth';

export default function AdminClientDetail({ user, clientId }: { user: JWTPayload; clientId: string }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'bookings' | 'emergencies'>('overview');

  useEffect(() => {
    fetch(`/api/clients/${clientId}/data`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <PortalShell role={user.role} name={user.name}>
      {/* Back button + header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/admin')}
          style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ← Back to Clients
        </button>
        <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem' }}>
          {data?.config?.businessName || 'Loading…'}
        </h1>
        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>
          {data?.config?.tradeType} · {data?.config?.contactName} · {data?.config?.phone}
        </p>
      </div>

      {error && <div style={{ padding: '1rem', background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: '12px', color: '#cc3333', marginBottom: '1.5rem' }}>{error}</div>}

      {loading && <p style={{ color: '#aaa' }}>Loading client data…</p>}

      {data && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KPICard label="Calls Today" value={data.kpis.callsToday} icon="📞" />
            <KPICard label="Bookings Today" value={data.kpis.bookingsToday} icon="📅" />
            <KPICard label="Revenue (Completed)" value={`£${data.kpis.revenue.toLocaleString()}`} icon="💷" />
            <KPICard label="Hot Leads" value={data.kpis.hotLeads} icon="🔥" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(['overview', 'bookings', 'emergencies'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                border: tab === t ? '1px solid #C9A84C' : '1px solid rgba(0,0,0,0.1)',
                background: tab === t ? 'rgba(201,168,76,0.1)' : '#fff',
                color: tab === t ? '#C9A84C' : '#888', cursor: 'pointer', textTransform: 'capitalize',
              }}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Call Activity (7 days)</h3>
                <ActivityChart interactions={data.interactions} />
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Recent Calls</h3>
                {data.interactions.slice(0, 8).map((it: any, i: number) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.8rem', color: '#1A0A3C' }}>{it.callerName || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{it.intent || '—'} · {it.outcome || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings tab */}
          {tab === 'bookings' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Bookings</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>{['Customer', 'Job Type', 'Scheduled', 'Status', 'Value'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#888', fontWeight: '600', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {data.bookings.map((b: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#1A0A3C', fontWeight: '500' }}>{b.customerName || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#555' }}>{b.jobType || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#888', fontSize: '0.8rem' }}>{b.scheduledDate || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(0,0,0,0.05)', fontSize: '0.75rem', fontWeight: '600', color: '#555' }}>{b.status || '—'}</span></td>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: '600', color: '#1A0A3C' }}>{b.value || '—'}</td>
                    </tr>
                  ))}
                  {data.bookings.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No bookings</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Emergencies tab */}
          {tab === 'emergencies' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Emergencies</h3>
              {data.emergencies.length === 0 ? (
                <p style={{ color: '#aaa' }}>No emergencies logged</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.emergencies.map((em: any, i: number) => (
                    <div key={i} style={{
                      padding: '0.85rem 1rem', borderRadius: '12px',
                      background: em.resolved === 'Yes' ? 'rgba(0,180,0,0.06)' : 'rgba(220,50,50,0.06)',
                      border: `1px solid ${em.resolved === 'Yes' ? 'rgba(0,180,0,0.2)' : 'rgba(220,50,50,0.2)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#1A0A3C' }}>{em.callerName || 'Unknown'} — {em.type}</span>
                        <span style={{ fontSize: '0.75rem', color: em.resolved === 'Yes' ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                          {em.resolved === 'Yes' ? '✓ Resolved' : '⚠ Active'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{em.severity} · {em.phone} · {em.timestamp?.slice(0, 16)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PortalShell>
  );
}
