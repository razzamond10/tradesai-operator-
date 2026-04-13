'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import type { JWTPayload } from '@/lib/auth';

const STAGES = ['New Enquiry', 'Quoted', 'Booked', 'In Progress', 'Completed'];

const stageColor: Record<string, string> = {
  'New Enquiry': '#6366f1',
  'Quoted': '#f59e0b',
  'Booked': '#3b82f6',
  'In Progress': '#8b5cf6',
  'Completed': '#22c55e',
};

export default function PipelineClient({ user }: { user: JWTPayload }) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => {
        setInteractions(d.interactions || []);
        setBookings(d.bookings || []);
      })
      .finally(() => setLoading(false));
  }, [user.clientId]);

  // Map to pipeline stages based on outcome / status
  function getStage(item: any, type: 'interaction' | 'booking'): string {
    if (type === 'booking') {
      const s = (item.status || '').toLowerCase();
      if (s === 'completed') return 'Completed';
      if (s === 'confirmed') return 'Booked';
      if (s === 'pending') return 'Quoted';
      return 'Quoted';
    }
    const o = (item.outcome || '').toLowerCase();
    if (o === 'booked') return 'Booked';
    if (o === 'hot') return 'Quoted';
    return 'New Enquiry';
  }

  const pipelineItems = [
    ...interactions.map((it) => ({ ...it, _type: 'interaction', _stage: getStage(it, 'interaction'), _name: it.callerName, _sub: it.intent })),
    ...bookings.map((b) => ({ ...b, _type: 'booking', _stage: getStage(b, 'booking'), _name: b.customerName, _sub: b.jobType })),
  ];

  const byStage: Record<string, typeof pipelineItems> = {};
  STAGES.forEach((s) => { byStage[s] = []; });
  pipelineItems.forEach((item) => {
    if (byStage[item._stage]) byStage[item._stage].push(item);
  });

  return (
    <PortalShell role={user.role} name={user.name} >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1A0A3C', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem' }}>Pipeline</h1>
        <p style={{ color: '#888', margin: 0, fontSize: '0.875rem' }}>Leads and jobs by stage</p>
      </div>

      {loading ? (
        <p style={{ color: '#aaa' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {STAGES.map((stage) => (
            <div key={stage} style={{ minWidth: '200px', flex: '0 0 200px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '0.75rem',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stageColor[stage] }} />
                <span style={{ fontWeight: '700', fontSize: '0.8rem', color: '#1A0A3C' }}>{stage}</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', color: '#666' }}>
                  {byStage[stage].length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {byStage[stage].slice(0, 15).map((item, i) => (
                  <div key={i} style={{
                    background: '#fff', borderRadius: '12px', padding: '0.85rem',
                    border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '0.82rem', color: '#1A0A3C', marginBottom: '0.25rem' }}>
                      {item._name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{item._sub || '—'}</div>
                    <div style={{
                      marginTop: '0.5rem', display: 'inline-block',
                      padding: '0.15rem 0.5rem', borderRadius: '10px',
                      background: `${stageColor[stage]}18`,
                      color: stageColor[stage], fontSize: '0.7rem', fontWeight: '600',
                    }}>
                      {item._type === 'booking' ? 'Booking' : 'Lead'}
                    </div>
                  </div>
                ))}
                {byStage[stage].length === 0 && (
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', textAlign: 'center', color: '#ccc', fontSize: '0.8rem', border: '1px dashed rgba(0,0,0,0.08)' }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
