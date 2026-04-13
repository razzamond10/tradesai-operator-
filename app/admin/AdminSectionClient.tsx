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

type SectionKey = 'analytics' | 'schedule' | 'pipeline' | 'emergencies' | 'comms' | 'revenue' | 'forecast' | 'reviews' | 'config' | 'clients';

const SECTIONS: Record<SectionKey, { icon: string; label: string; desc: string; stripe: string; iconBg: string; ctaLabel: string }> = {
  analytics:   { icon: '📊', label: 'Analytics',         desc: 'Performance metrics and call trends across all clients',   stripe: 'var(--a1)', iconBg: 'var(--a1b)', ctaLabel: 'View Analytics'   },
  schedule:    { icon: '📅', label: 'Job Schedule',       desc: 'Upcoming jobs and confirmed bookings across all clients',  stripe: 'var(--a2)', iconBg: 'var(--a2b)', ctaLabel: 'View Schedule'    },
  pipeline:    { icon: '📋', label: 'Lead Pipeline',      desc: 'Lead status and conversion rates across all clients',      stripe: 'var(--a3)', iconBg: 'var(--a3b)', ctaLabel: 'View Pipeline'    },
  emergencies: { icon: '🚨', label: 'Emergencies',        desc: 'Urgent calls requiring immediate attention',               stripe: 'var(--a4)', iconBg: 'var(--a4b)', ctaLabel: 'View Emergencies' },
  comms:       { icon: '💬', label: 'Communications',     desc: 'All AI call interactions and message logs across clients', stripe: 'var(--a1)', iconBg: 'var(--a1b)', ctaLabel: 'View Comms'       },
  revenue:     { icon: '💰', label: 'Revenue Tracker',    desc: 'Booking values, revenue totals and payment status',        stripe: 'var(--a3)', iconBg: 'var(--a3b)', ctaLabel: 'View Revenue'     },
  forecast:    { icon: '📈', label: 'Forecasting',        desc: 'Projected revenue, call volume and seasonal trends',       stripe: 'var(--a2)', iconBg: 'var(--a2b)', ctaLabel: 'View Forecast'    },
  reviews:     { icon: '⭐', label: 'Reviews & Ratings',  desc: 'Customer satisfaction scores and review sentiment',        stripe: 'var(--a2)', iconBg: 'var(--a2b)', ctaLabel: 'View Reviews'     },
  config:      { icon: '⚙️', label: 'Configuration',      desc: 'Client settings, Twilio numbers and AI configuration',    stripe: 'var(--a1)', iconBg: 'var(--a1b)', ctaLabel: 'Configure'        },
  clients:     { icon: '👥', label: 'Clients',            desc: 'Manage and view all registered client accounts',          stripe: 'var(--a1)', iconBg: 'var(--a1b)', ctaLabel: 'Open Dashboard'   },
};

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

export default function AdminSectionClient({ section, user }: { section: SectionKey; user: JWTPayload }) {
  const router = useRouter();
  const cfg = SECTIONS[section];

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
      (c.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.tradeType || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.contactName || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PortalShell role={user.role} name={user.name}>
      <Topbar breadcrumb="Admin" page={cfg.label} sub={cfg.desc} />

      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>

        {/* Section hero */}
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid var(--divider)',
          boxShadow: 'var(--shadow-s)', overflow: 'hidden', marginBottom: '20px',
        }}>
          <div style={{ height: '3px', background: cfg.stripe }} />
          <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
              background: cfg.iconBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '22px',
            }}>{cfg.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '3px' }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{cfg.desc}</div>
            </div>
            <div style={{
              fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px',
              background: cfg.iconBg, color: cfg.stripe, fontFamily: '"Inter",sans-serif',
            }}>
              {loading ? '…' : `${clients.length} client${clients.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* Instruction row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px' }}>
              Select a Client
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
              Click any card to open their {cfg.label} dashboard
            </div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{
              padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--divider)',
              fontSize: '12px', outline: 'none', width: '200px', background: '#fff',
              color: 'var(--ink)', fontFamily: '"Inter",sans-serif',
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '14px' }}>
            ⚠ {error}
          </div>
        )}

        {/* Client grid */}
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
                      <div style={{
                        flexShrink: 0, fontSize: '9px', fontWeight: 700, padding: '3px 8px',
                        borderRadius: '7px', background: cfg.iconBg, color: cfg.stripe,
                        fontFamily: '"Inter",sans-serif',
                      }}>
                        {cfg.ctaLabel} ›
                      </div>
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
            {filtered.length === 0 && !error && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontSize: '12px' }}>
                No clients found
              </div>
            )}
          </div>
        )}

        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </PortalShell>
  );
}
