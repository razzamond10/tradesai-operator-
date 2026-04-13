'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalShell from '@/components/PortalShell';
import Topbar from '@/components/Topbar';
import type { JWTPayload } from '@/lib/auth';

interface ClientConfig {
  businessName: string;
  tradeType: string;
  contactName: string;
  phone: string;
  clientId: string;
  twilioNumber: string;
}

const TRADE_COLORS: Record<string, string> = {
  plumbing: '#3D1FA8',
  'gas & heating': '#C01830',
  electrical: '#9A6200',
  roofing: '#0A7455',
  building: '#6B3FD0',
  drainage: '#3D1FA8',
  hvac: '#0A7455',
  locksmith: '#C9A84C',
};

function tradeColor(t: string) {
  return TRADE_COLORS[(t || '').toLowerCase()] || '#3D1FA8';
}

export default function VAClient({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setClients(d.clients || []); })
      .catch(() => setError('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.tradeType.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase()),
  );

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="VA Portal" page="Client Overview" sub="Read-only view" />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* READ-ONLY banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '8px 14px', borderRadius: '8px', background: '#EDE8FF', border: '1px solid rgba(61,31,168,0.15)' }}>
          <span style={{ fontSize: '13px' }}>👁</span>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#3D1FA8' }}>
            VA View — Read-only. You can view all client dashboards but cannot modify data or billing.
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'rgba(61,31,168,0.12)', color: '#3D1FA8' }}>READ-ONLY</span>
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>
              Clients
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{today}</div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '12px', outline: 'none', width: '220px', background: '#fff', color: 'var(--ink)', fontFamily: '"Inter",sans-serif' }}
          />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '18px' }}>
          {[
            { label: 'Total Clients', val: loading ? '—' : clients.length, stripe: 'var(--a1)' },
            { label: 'AI Lines Active', val: loading ? '—' : clients.filter(c=>c.twilioNumber).length, stripe: 'var(--a3)' },
            { label: 'Trade Types', val: loading ? '—' : new Set(clients.map(c=>c.tradeType).filter(Boolean)).size, stripe: 'var(--a2)' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: s.stripe }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '24px', fontWeight: 900, color: 'var(--ink)' }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {[1,2,3,4,5,6].map((i) => <div key={i} style={{ height: '130px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {filtered.map((client) => {
              const color = tradeColor(client.tradeType);
              const initials = (client.businessName || 'XX').slice(0, 2).toUpperCase();
              return (
                <button
                  key={client.clientId}
                  onClick={() => router.push(`/va/clients/${client.clientId}`)}
                  style={{ background: '#fff', borderRadius: '10px', padding: '0', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', textAlign: 'left', cursor: 'pointer', transition: 'all .15s', display: 'block', width: '100%', overflow: 'hidden' }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(61,31,168,0.3)'; el.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--divider)'; el.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ height: '3px', background: color }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 800, color }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.businessName || 'Unnamed Client'}
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', background: `${color}18`, color, display: 'inline-block', marginTop: '2px' }}>
                          {client.tradeType || 'Trade'}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--faint)' }}>›</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '10px', borderTop: '1px solid var(--slate)' }}>
                      <div style={{ fontSize: '10.5px', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '52px' }}>Contact</span>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{client.contactName || '—'}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '52px' }}>Phone</span>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--ink)' }}>{client.phone || '—'}</span>
                      </div>
                      {client.twilioNumber && (
                        <div style={{ fontSize: '10.5px', display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--muted)', minWidth: '52px' }}>AI Line</span>
                          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--a3)', fontWeight: 600 }}>{client.twilioNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '12px' }}>No clients found</div>
            )}
          </div>
        )}

        <div style={{ marginTop: '28px', paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong></div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>{new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
