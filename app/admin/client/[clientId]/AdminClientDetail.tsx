'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import KPICard from '@/components/KPICard';
import ActivityLineChart from '@/components/charts/ActivityLineChart';
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
      .then((d) => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Admin" page={data?.config?.businessName || 'Client'} sub={data?.config?.tradeType} />
      <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>

        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← All Clients
        </button>

        {error && <div style={{ padding: '10px 14px', background: '#FDEEF1', border: '1px solid #F5C0C8', borderRadius: '8px', color: '#C01830', fontSize: '12px', marginBottom: '14px' }}>{error}</div>}
        {loading && <p style={{ color: '#7468A0', fontSize: '12px' }}>Loading…</p>}

        {data && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
              <KPICard label="Calls Today" value={data.kpis.callsToday} icon="📞" accent="#3D1FA8" />
              <KPICard label="Bookings Today" value={data.kpis.bookingsToday} icon="📅" accent="#0A7455" />
              <KPICard label="Revenue (Completed)" value={`£${data.kpis.revenue.toLocaleString()}`} icon="💷" accent="#C9A84C" />
              <KPICard label="Hot Leads" value={data.kpis.hotLeads} icon="🔥" accent="#C01830" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#EAEAF4', borderRadius: '6px', padding: '2px', width: 'fit-content', marginBottom: '14px' }}>
              {(['overview', 'bookings', 'emergencies'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '4px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, border: 'none',
                  background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1A0A3C' : '#7468A0',
                  cursor: 'pointer', boxShadow: tab === t ? '0 1px 2px rgba(26,10,60,0.08)' : 'none',
                  fontFamily: '"Inter",sans-serif', textTransform: 'capitalize',
                }}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div style={{ background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #D8D0F0', boxShadow: '0 2px 8px rgba(26,10,60,0.10)' }}>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 800, color: '#1A0A3C', marginBottom: '12px' }}>Call Activity (7 days)</div>
                  <ActivityLineChart interactions={data.interactions} bookings={data.bookings} mode="week" />
                </div>
                <div style={{ background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #D8D0F0', boxShadow: '0 2px 8px rgba(26,10,60,0.10)' }}>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 800, color: '#1A0A3C', marginBottom: '10px' }}>Recent Calls</div>
                  {data.interactions.slice(0, 8).map((it: any, i: number) => (
                    <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '11px', color: '#1A0A3C' }}>{it.callerName || 'Unknown'}</div>
                        <div style={{ fontSize: '10px', color: '#7468A0' }}>{it.intent || '—'}</div>
                      </div>
                      <span style={{ fontSize: '9px', color: '#7468A0', flexShrink: 0 }}>{it.outcome || '—'}</span>
                    </div>
                  ))}
                  {data.interactions.length === 0 && <p style={{ color: '#7468A0', fontSize: '11px' }}>No calls yet</p>}
                </div>
              </div>
            )}

            {tab === 'bookings' && (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #D8D0F0', boxShadow: '0 2px 8px rgba(26,10,60,0.10)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead><tr>{['Customer','Job Type','Scheduled','Status','Value'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#7468A0', fontWeight: 700, fontSize: '9px', letterSpacing: '.8px', textTransform: 'uppercase', borderBottom: '1px solid #D8D0F0', background: '#F2F2F8' }}>{h}</th>
                  ))}</tr></thead>
                  <tbody>
                    {data.bookings.map((b: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1A0A3C' }}>{b.customerName || '—'}</td>
                        <td style={{ padding: '8px 12px', color: '#3D2580' }}>{b.jobType || '—'}</td>
                        <td style={{ padding: '8px 12px', color: '#7468A0', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px' }}>{b.scheduledDate || '—'}</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', background: '#EAEAF4', color: '#3D2580' }}>{b.status || '—'}</span></td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1A0A3C', fontFamily: '"Inter Tight",sans-serif' }}>{b.value || '—'}</td>
                      </tr>
                    ))}
                    {data.bookings.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#7468A0' }}>No bookings</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'emergencies' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.emergencies.length === 0 ? (
                  <div style={{ padding: '24px', background: '#fff', borderRadius: '10px', border: '1px solid #D8D0F0', textAlign: 'center', color: '#7468A0', fontSize: '12px' }}>No emergencies logged</div>
                ) : data.emergencies.map((em: any, i: number) => (
                  <div key={i} style={{
                    padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: em.resolved === 'Yes' ? '#E6FAF4' : '#FDEEF1',
                    border: `1px solid ${em.resolved === 'Yes' ? '#B0E8D4' : '#F5C0C8'}`,
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1A0A3C', fontSize: '12px' }}>{em.callerName || 'Unknown'} — {em.type}</div>
                      <div style={{ fontSize: '10px', color: '#7468A0', marginTop: '2px' }}>{em.severity} · {em.phone}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: em.resolved === 'Yes' ? '#0A7455' : '#C01830' }}>
                      {em.resolved === 'Yes' ? '✓ Resolved' : '⚠ Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PortalShell>
  );
}
