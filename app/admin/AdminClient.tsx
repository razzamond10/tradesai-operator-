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

function KPICard({
  stripe, iconBg, icon, badge, badgeWarn, label, value, sub,
}: {
  stripe: string; iconBg: string; icon: string; badge: string;
  badgeWarn?: boolean; label: string; value: string | number; sub: string;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)',
      boxShadow: 'var(--shadow-s)', overflow: 'hidden',
    }}>
      <div style={{ height: '3px', background: stripe }} />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
            {icon}
          </div>
          <span style={{
            fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px',
            background: badgeWarn ? '#FDEEF1' : iconBg, color: badgeWarn ? '#C01830' : stripe,
          }}>{badge}</span>
        </div>
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px', fontFamily: '"Inter",sans-serif' }}>{label}</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '30px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
}

export default function AdminClient({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setClients(d.clients || []);
      })
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

  const activeLines = clients.filter((c) => c.twilioNumber).length;
  const tradeSet = new Set(clients.map((c) => c.tradeType).filter(Boolean));
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Admin" page="Command Centre" sub="All clients — live from Google Sheets" />

      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: '"Inter Tight",sans-serif' }}>
              Portfolio at a glance
            </div>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: '"IBM Plex Mono",monospace' }}>{today}</div>
        </div>

        {/* 4 KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          <KPICard
            stripe="var(--a1)" iconBg="var(--a1b)" icon="👥"
            badge={loading ? '…' : `${clients.length} accounts`}
            label="Total Clients" value={loading ? '—' : clients.length}
            sub="registered accounts"
          />
          <KPICard
            stripe="var(--a3)" iconBg="var(--a3b)" icon="📞"
            badge="AI answering"
            label="AI Lines Active" value={loading ? '—' : activeLines}
            sub="with Twilio numbers"
          />
          <KPICard
            stripe="var(--a2)" iconBg="var(--a2b)" icon="⚡"
            badge="All green"
            label="System Status" value="Live"
            sub="Sheets · Twilio · AI"
          />
          <KPICard
            stripe="var(--a4)" iconBg="var(--a4b)" icon="🏗️"
            badge="Active trades"
            label="Trade Types" value={loading ? '—' : tradeSet.size}
            sub="different trades"
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {/* Clients section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>Clients</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>Click any card to open the full client dashboard</div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{
              padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--divider)',
              fontSize: '12px', outline: 'none', width: '220px', background: '#fff',
              color: 'var(--ink)', fontFamily: '"Inter",sans-serif',
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ height: '130px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {filtered.map((client) => {
              const color = tradeColor(client.tradeType);
              const initials = (client.businessName || 'XX').slice(0, 2).toUpperCase();
              return (
                <button
                  key={client.clientId}
                  onClick={() => router.push(`/admin/clients/${client.clientId}`)}
                  style={{
                    background: '#fff', borderRadius: '10px', padding: '0',
                    border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)',
                    textAlign: 'left', cursor: 'pointer', transition: 'all .15s',
                    display: 'block', width: '100%', overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(201,168,76,0.5)';
                    el.style.boxShadow = '0 4px 20px rgba(201,168,76,0.2)';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--divider)';
                    el.style.boxShadow = 'var(--shadow-s)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ height: '3px', background: color }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                        background: `${color}18`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif',
                        fontSize: '12px', fontWeight: 800, color,
                      }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700,
                          color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {client.businessName || 'Unnamed Client'}
                        </div>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px',
                          background: `${color}18`, color, display: 'inline-block', marginTop: '2px',
                        }}>
                          {client.tradeType || 'Trade'}
                        </span>
                      </div>
                      <span style={{ fontSize: '16px', color: 'var(--faint)' }}>›</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '10px', borderTop: '1px solid var(--slate)' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--ink)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '52px' }}>Contact</span>
                        <span style={{ fontWeight: 600 }}>{client.contactName || '—'}</span>
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ink)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '52px' }}>Phone</span>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px' }}>{client.phone || '—'}</span>
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
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '12px' }}>
                No clients found
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '28px', paddingTop: '14px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong> — never miss a lead</div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <style>{`
          @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}
        `}</style>
      </div>
    </PortalShell>
  );
}
