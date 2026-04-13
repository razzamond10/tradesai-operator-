'use client';
import { useEffect, useState } from 'react';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

export default function EmergenciesClient({ user }: { user: JWTPayload }) {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    fetch(`/api/clients/${user.clientId}/data`)
      .then((r) => r.json())
      .then((d) => setEmergencies(d.emergencies || []))
      .finally(() => setLoading(false));
  }, [user.clientId]);

  const active   = emergencies.filter(e => (e.resolved || '').toLowerCase() !== 'yes');
  const resolved = emergencies.filter(e => (e.resolved || '').toLowerCase() === 'yes');

  const filtered = filter === 'active' ? active : filter === 'resolved' ? resolved : emergencies;

  const severityStyle = (s: string) => {
    const lower = (s || '').toLowerCase();
    if (lower === 'high' || lower === 'critical') return { bg: 'var(--a4b)', color: 'var(--a4)', icon: '🔴' };
    if (lower === 'medium') return { bg: 'var(--a2b)', color: 'var(--a6)', icon: '🟡' };
    return { bg: 'var(--slate)', color: 'var(--muted)', icon: '🟢' };
  };

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Dashboard" page="Emergencies" sub="All urgent calls captured by AI" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* Alert banner if active emergencies */}
        {!loading && active.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '8px', background: 'var(--a4b)', border: '1px solid #F5C0C8', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--a4)' }}>{active.length} unresolved emergency{active.length !== 1 ? 'ies' : 'y'}</div>
              <div style={{ fontSize: '10px', color: 'var(--a4)', marginTop: '1px' }}>Action required — contact affected customers immediately</div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { stripe: 'var(--a4)', icon: '🚨', label: 'Total Emergencies', val: loading ? '—' : emergencies.length, sub: 'all time' },
            { stripe: '#C01830', icon: '⚠️', label: 'Active / Unresolved', val: loading ? '—' : active.length, sub: 'need attention' },
            { stripe: 'var(--a3)', icon: '✅', label: 'Resolved', val: loading ? '—' : resolved.length, sub: 'handled' },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: k.stripe }} />
              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>{k.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{k.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Emergency Log</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all','active','resolved'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', background: filter === f ? (f === 'active' ? 'var(--a4)' : f === 'resolved' ? 'var(--a3)' : 'var(--a1)') : 'var(--slate)', color: filter === f ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>
                {f === 'all' ? `All (${emergencies.length})` : f === 'active' ? `Active (${active.length})` : `Resolved (${resolved.length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>Loading emergencies…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              {filter === 'active' ? 'No active emergencies' : filter === 'resolved' ? 'No resolved emergencies' : 'No emergencies logged'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>All clear — AI is monitoring for urgent calls</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...filtered].reverse().map((em, i) => {
              const sev = severityStyle(em.severity);
              const isActive = (em.resolved || '').toLowerCase() !== 'yes';
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: '10px', padding: '14px 16px',
                  border: `1px solid ${isActive ? '#F5C0C8' : 'var(--divider)'}`,
                  boxShadow: 'var(--shadow-s)',
                  borderLeft: `4px solid ${isActive ? 'var(--a4)' : 'var(--a3)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <div style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{isActive ? '🚨' : '✅'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{em.callerName || 'Unknown'}</div>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: sev.bg, color: sev.color }}>{sev.icon} {em.severity || 'Unknown'}</span>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: isActive ? 'var(--a4b)' : 'var(--a3b)', color: isActive ? 'var(--a4)' : 'var(--a3)' }}>
                            {isActive ? '⚠ Unresolved' : '✓ Resolved'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink2)', marginBottom: '6px' }}>{em.type || 'Emergency'}</div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                            <span style={{ fontWeight: 600 }}>Phone: </span>
                            <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{em.phone || '—'}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                            <span style={{ fontWeight: 600 }}>Time: </span>
                            <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{(em.timestamp || '—').slice(0, 16).replace('T', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ flexShrink: 0 }}>
                        <a
                          href={`tel:${em.phone}`}
                          style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '7px', background: 'var(--a4)', color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none', fontFamily: '"Inter",sans-serif' }}
                        >
                          📞 Call Now
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
