'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import KPICard from '@/components/KPICard';
import ActivityChart from '@/components/ActivityChart';
import type { JWTPayload } from '@/lib/auth';

export default function VAClientDetail({ user, clientId }: { user: JWTPayload; clientId: string }) {
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
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <PortalShell role={user.role} name={user.name}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => router.push('/va')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', padding: 0, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back to Clients
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
            {data?.config?.businessName || 'Loading…'}
          </h1>
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(100,100,200,0.1)', color: '#6366f1', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px' }}>READ-ONLY</span>
        </div>
        <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
          {data?.config?.tradeType} · {data?.config?.contactName}
        </p>
      </div>

      {error && <div style={{ padding: '1rem', background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: '12px', color: '#cc3333', marginBottom: '1.5rem' }}>{error}</div>}
      {loading && <p style={{ color: '#aaa' }}>Loading…</p>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KPICard label="Calls Today" value={data.kpis.callsToday} icon="📞" />
            <KPICard label="Bookings Today" value={data.kpis.bookingsToday} icon="📅" />
            <KPICard label="Hot Leads" value={data.kpis.hotLeads} icon="🔥" />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(['overview', 'bookings', 'emergencies'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                border: tab === t ? '1px solid #6366f1' : '1px solid rgba(0,0,0,0.1)',
                background: tab === t ? 'rgba(99,102,241,0.1)' : '#fff',
                color: tab === t ? '#6366f1' : '#888', cursor: 'pointer', textTransform: 'capitalize',
              }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Call Activity (7 days)</h3>
              <ActivityChart interactions={data.interactions} />
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', color: '#1A0A3C', fontSize: '0.875rem', fontWeight: '600' }}>Recent Calls</h4>
                {data.interactions.slice(0, 8).map((it: any, i: number) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.82rem', color: '#1A0A3C' }}>{it.callerName || 'Unknown'}</span>
                      <span style={{ color: '#888', fontSize: '0.78rem', marginLeft: '0.5rem' }}>{it.intent}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{it.outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'bookings' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Bookings (read-only)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead><tr>{['Customer', 'Job Type', 'Scheduled', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#888', fontWeight: '600', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {data.bookings.map((b: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#1A0A3C', fontWeight: '500' }}>{b.customerName || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#555' }}>{b.jobType || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#888', fontSize: '0.8rem' }}>{b.scheduledDate || '—'}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.75rem', fontWeight: '600', color: '#555' }}>{b.status || '—'}</td>
                    </tr>
                  ))}
                  {data.bookings.length === 0 && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No bookings</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'emergencies' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.25rem', color: '#1A0A3C', fontWeight: '700', fontSize: '0.95rem' }}>Emergencies (read-only)</h3>
              {data.emergencies.length === 0 ? <p style={{ color: '#aaa' }}>None logged</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.emergencies.map((em: any, i: number) => (
                    <div key={i} style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: em.resolved === 'Yes' ? 'rgba(0,180,0,0.06)' : 'rgba(220,50,50,0.06)', border: `1px solid ${em.resolved === 'Yes' ? 'rgba(0,180,0,0.2)' : 'rgba(220,50,50,0.2)'}` }}>
                      <div style={{ fontWeight: '600', color: '#1A0A3C', fontSize: '0.875rem' }}>{em.callerName} — {em.type}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>{em.severity} · {em.resolved === 'Yes' ? '✓ Resolved' : '⚠ Active'}</div>
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
