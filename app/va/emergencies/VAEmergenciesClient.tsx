'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  clientId: string;
}

interface RawEmergency {
  callerName?: string;
  type?: string;
  severity?: string;
  resolved?: string;
  postcode?: string;
  timestamp?: string;
  createdAt?: string;
}

interface AggEmergency extends RawEmergency {
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

function severityBadge(s: string) {
  const lower = (s || '').toLowerCase();
  if (lower === 'critical' || lower === 'high') return { bg: 'var(--a4b)', color: 'var(--a4)' };
  if (lower === 'medium') return { bg: 'var(--a2b)', color: 'var(--a6)' };
  return { bg: 'var(--slate)', color: 'var(--muted)' };
}

function resolvedBadge(r: string) {
  return (r || '').toLowerCase() === 'yes'
    ? { bg: 'var(--a3b)', color: 'var(--a3)', label: 'Resolved' }
    : { bg: 'var(--a4b)', color: 'var(--a4)', label: 'Open' };
}

export default function VAEmergenciesClient({ user }: { user: JWTPayload }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emergencies, setEmergencies] = useState<AggEmergency[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

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
              return { clientId: c.clientId, clientName: c.businessName, emergencies: (dd.emergencies || []) as RawEmergency[] };
            } catch {
              return { clientId: c.clientId, clientName: c.businessName, emergencies: [] };
            }
          })
        );

        const all: AggEmergency[] = [];
        results.forEach(({ clientId, clientName, emergencies: emgs }) => {
          emgs.forEach((e) => all.push({ ...e, clientId, clientName }));
        });
        all.sort((a, b) => {
          const ta = a.timestamp || a.createdAt || '';
          const tb = b.timestamp || b.createdAt || '';
          return tb > ta ? 1 : -1;
        });
        setEmergencies(all);
      } catch {
        setError('Failed to load emergencies');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const open = emergencies.filter(e => (e.resolved || '').toLowerCase() !== 'yes');
  const resolved = emergencies.filter(e => (e.resolved || '').toLowerCase() === 'yes');
  const visible = filter === 'open' ? open : filter === 'resolved' ? resolved : emergencies;

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal" page="Emergencies" sub="All urgent alerts across all clients" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <ReadOnlyBanner />

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
          {[
            { label: 'Total Alerts', val: loading ? '—' : emergencies.length, stripe: 'var(--a1)', warn: false },
            { label: 'Open', val: loading ? '—' : open.length, stripe: 'var(--a4)', warn: open.length > 0 },
            { label: 'Resolved', val: loading ? '—' : resolved.length, stripe: 'var(--a3)', warn: false },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: s.stripe }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '24px', fontWeight: 900, color: s.warn ? 'var(--a4)' : 'var(--ink)' }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>⚠ {error}</div>}

        {/* Filter + table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
              Emergencies {!loading && <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)' }}>({visible.length})</span>}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all','open','resolved'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', background: filter === f ? 'var(--a1)' : 'var(--slate)', color: filter === f ? '#fff' : 'var(--muted)', fontFamily: '"Inter",sans-serif', textTransform: 'capitalize' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: '36px', borderRadius: '6px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : visible.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
              {filter === 'open' ? '✅ No open emergencies' : 'No emergencies found'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>{['Client','Customer','Issue','Postcode','Time','Severity','Status'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.6px', textTransform: 'uppercase', borderBottom: '1px solid var(--divider)', background: 'var(--slate)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {visible.map((em, i) => {
                    const sv = severityBadge(em.severity || '');
                    const rv = resolvedBadge(em.resolved || '');
                    const ts = em.timestamp || em.createdAt || '';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: rv.label === 'Open' ? 'rgba(192,24,48,0.02)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--a1)', fontSize: '10px', whiteSpace: 'nowrap' }}>{em.clientName}</td>
                        <td style={{ padding: 0, fontWeight: 600 }}><Link href={`/va/emergencies/${encodeURIComponent(em.clientId + '__' + (em.timestamp || em.createdAt || ''))}`} style={{ color: 'var(--a1)', textDecoration: 'none', display: 'block', padding: '8px 12px' }}>{em.callerName || '—'}</Link></td>
                        <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{em.type || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)' }}>{em.postcode || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{ts ? `${ts.slice(0,10)} ${ts.slice(11,16)}` : '—'}</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: sv.bg, color: sv.color }}>{em.severity || '—'}</span></td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: rv.bg, color: rv.color }}>{rv.label}</span></td>
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
