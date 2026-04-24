'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import type { JWTPayload } from '@/lib/auth';
import type { VendorHealth } from '@/lib/platform-health/types';

type OverallStatus = VendorHealth['status'];

const HEALTH_DOT: Record<OverallStatus, string> = {
  healthy: '#22C55E',
  warning:  '#F59E0B',
  critical: '#EF4444',
  unknown:  '#9CA3AF',
};
const HEALTH_LABEL: Record<OverallStatus, string> = {
  healthy: 'All Systems OK',
  warning:  'Action Needed',
  critical: 'Urgent',
  unknown:  'Checking...',
};

interface ClientConfig {
  businessName: string;
  tradeType: string;
  contactName: string;
  phone: string;
  twilioNumber: string;
  slug: string;
  clientId: string; // twilioNumber if present, else slug
}

const TRADE_COLORS: Record<string, string> = {
  plumbing: '#3D1FA8', 'gas & heating': '#C01830', electrical: '#9A6200',
  roofing: '#0A7455', building: '#6B3FD0', drainage: '#3D1FA8',
  hvac: '#0A7455', locksmith: '#C9A84C',
};
function tradeColor(t: string) {
  return TRADE_COLORS[(t || '').toLowerCase()] || '#3D1FA8';
}

export default function AdminClient({ user }: { user: JWTPayload }) {
  const router = useRouter();
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [lastActive, setLastActive] = useState<Record<string, string>>({});
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<OverallStatus>('unknown');
  const [healthVendors, setHealthVendors] = useState<VendorHealth[]>([]);
  const [healthError, setHealthError] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/platform-health')
      .then((r) => { if (!r.ok) throw new Error('non-ok'); return r.json(); })
      .then((d) => {
        setHealthStatus(d.overallStatus ?? 'unknown');
        setHealthVendors(d.vendors ?? []);
      })
      .catch(() => setHealthError(true))
      .finally(() => setHealthLoading(false));
  }, []);

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

  // Fetch last active date for each client once the list is loaded
  useEffect(() => {
    if (clients.length === 0) return;
    clients.forEach((client) => {
      fetch(`/api/clients/${encodeURIComponent(client.clientId)}/data`)
        .then((r) => r.json())
        .then((d) => {
          const interactions: any[] = d.interactions || [];
          if (interactions.length > 0) {
            const latest = interactions.reduce((a: any, b: any) =>
              (a.timestamp || '') > (b.timestamp || '') ? a : b
            );
            setLastActive((prev) => ({
              ...prev,
              [client.clientId]: (latest.timestamp || '').slice(0, 10) || '—',
            }));
          } else {
            setLastActive((prev) => ({ ...prev, [client.clientId]: '—' }));
          }
        })
        .catch(() => setLastActive((prev) => ({ ...prev, [client.clientId]: '—' })));
    });
  }, [clients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const filtered = clients.filter(
    (c) => !search ||
      (c.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.tradeType || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.contactName || '').toLowerCase().includes(search.toLowerCase()),
  );

  const activeLines = clients.filter((c) => c.twilioNumber).length;
  const tradeSet = new Set(clients.map((c) => c.tradeType).filter(Boolean));
  const initials = user.name ? user.name.slice(0, 1).toUpperCase() : 'A';

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F8', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* ── Top header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(90deg,#1A0A3C 0%,#26145A 100%)',
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        borderBottom: '2px solid #C9A84C',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.jpg" alt="logo" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '2px' }} />
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff' }}>TradesAI Operator</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Portfolio Overview</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', background: '#22C55E', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 5px rgba(34,197,94,0.5)' }} />
            Live data
          </div>

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button onClick={() => setProfileOpen(p => !p)} style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#C9A84C,#E8C96A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: '#1A0A3C',
              fontFamily: '"Inter Tight",sans-serif',
              border: profileOpen ? '2px solid #fff' : '2px solid transparent',
              cursor: 'pointer', outline: 'none', transition: 'border-color .15s',
            }}>{initials}</button>

            {profileOpen && (
              <div style={{
                position: 'absolute', top: '38px', right: 0,
                background: '#fff', borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                border: '1px solid #D8D0F0', overflow: 'hidden',
                minWidth: '160px', zIndex: 200,
              }}>
                <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid #EAEAF4' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1A0A3C' }}>{user.name}</div>
                  <div style={{ fontSize: '9px', color: '#7468A0' }}>Owner — Admin</div>
                </div>
                {[
                  { label: 'My Account', icon: '👤', href: '/admin/account' },
                  { label: 'Platform Settings', icon: '⚙️', href: '/admin/settings' },
                ].map(item => (
                  <button key={item.label} onClick={() => { setProfileOpen(false); router.push(item.href); }} style={{
                    display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                    padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, color: '#1A0A3C', fontFamily: '"Inter",sans-serif',
                    textAlign: 'left', borderBottom: '1px solid #EAEAF4', transition: 'background .1s',
                  }}>
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
                <button onClick={() => { setProfileOpen(false); logout(); }} disabled={loggingOut} style={{
                  display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                  padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, color: '#C01830', fontFamily: '"Inter",sans-serif',
                  textAlign: 'left', transition: 'background .1s',
                }}>
                  <span>⎋</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 28px 48px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 900, color: 'var(--ink)', marginBottom: '3px' }}>Client Portfolio</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--divider)',
              fontSize: '12px', outline: 'none', width: '240px', background: '#fff',
              color: 'var(--ink)', fontFamily: '"Inter",sans-serif',
              boxShadow: 'var(--shadow-s)',
            }}
          />
        </div>

        {/* KPI cards */}
        <div className="admin-portfolio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>

          {/* Cards 1 & 2 — static */}
          {[
            { stripe: 'var(--a1)', iconBg: 'var(--a1b)', icon: '👥', label: 'Total Clients',   value: loading ? '—' : clients.length, sub: 'registered accounts',  badge: loading ? '…' : `${clients.length} accounts` },
            { stripe: 'var(--a3)', iconBg: 'var(--a3b)', icon: '📞', label: 'AI Lines Active', value: loading ? '—' : activeLines,     sub: 'with Twilio numbers', badge: 'AI answering' },
          ].map((k) => (
            <div key={k.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: k.stripe }} />
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>{k.icon}</div>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: k.iconBg, color: k.stripe }}>{k.badge}</span>
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{k.label}</div>
                <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '32px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{k.sub}</div>
              </div>
            </div>
          ))}

          {/* Card 3 — Platform Health (live, clickable) */}
          {(() => {
            const stripeColor = healthLoading || healthError ? '#9CA3AF' : HEALTH_DOT[healthStatus];
            return (
              <div
                onClick={() => router.push('/admin/platform-health')}
                style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(26,10,60,0.14)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-s)'; }}
              >
                <div style={{ height: '3px', background: stripeColor }} />
                <div style={{ padding: '16px' }}>
                  {healthLoading ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EDE8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Activity size={15} color="#3D1FA8" />
                        </div>
                        <div style={{ width: '48px', height: '14px', borderRadius: '8px', background: 'rgba(0,0,0,0.06)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                      </div>
                      <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>Platform Health</div>
                      <div style={{ width: '72%', height: '20px', borderRadius: '6px', background: 'rgba(0,0,0,0.06)', marginBottom: '10px', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[0,1,2,3].map((i) => (
                          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(0,0,0,0.08)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EDE8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Activity size={15} color="#3D1FA8" />
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#EDE8FF', color: '#3D1FA8' }}>
                          {healthError ? 'UNAVAILABLE' : healthStatus.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>Platform Health</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: stripeColor, flexShrink: 0 }} />
                        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '16px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>
                          {healthError ? 'Unavailable' : HEALTH_LABEL[healthStatus]}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        {healthVendors.map((v) => (
                          <div key={v.vendor} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: HEALTH_DOT[v.status] }} title={v.displayName} />
                            <span style={{ fontSize: '7px', color: 'var(--muted)' }}>{v.vendor === 'retell' ? 'Rtel' : v.vendor === 'twilio' ? 'Twil' : v.vendor === 'make' ? 'Make' : 'Vcl'}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Card 4 — Trade Types (static) */}
          {(() => {
            const k = { stripe: 'var(--a4)', iconBg: 'var(--a4b)', icon: '🏗️', label: 'Trade Types', value: loading ? '—' : tradeSet.size, sub: 'different trades', badge: 'Active' };
            return (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
                <div style={{ height: '3px', background: k.stripe }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>{k.icon}</div>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: k.iconBg, color: k.stripe }}>{k.badge}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>{k.label}</div>
                  <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '32px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{k.value}</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{k.sub}</div>
                </div>
              </div>
            );
          })()}

        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--a4b)', border: '1px solid #F5C0C8', borderRadius: '8px', color: 'var(--a4)', fontSize: '12px', marginBottom: '18px' }}>
            ⚠ {error}
          </div>
        )}

        {/* Section header */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '12px' }}>
          {loading ? 'Loading…' : `${filtered.length} Client${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {/* Client grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '12px' }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ height: '140px', borderRadius: '10px', background: 'rgba(0,0,0,0.04)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '12px' }}>
            {filtered.map((client) => {
              const color = tradeColor(client.tradeType);
              const initials = (client.businessName || 'XX').slice(0, 2).toUpperCase();
              const lastSeen = lastActive[client.clientId];
              return (
                <button
                  key={client.clientId}
                  onClick={() => router.push(`/admin/clients/${encodeURIComponent(client.clientId)}`)}
                  style={{
                    background: '#fff', borderRadius: '10px', padding: '0',
                    border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)',
                    textAlign: 'left', cursor: 'pointer', transition: 'all .18s',
                    display: 'block', width: '100%', overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(201,168,76,0.55)';
                    el.style.boxShadow = '0 6px 24px rgba(201,168,76,0.22)';
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
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '9px', flexShrink: 0,
                        background: `${color}15`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif',
                        fontSize: '14px', fontWeight: 800, color,
                      }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 700,
                          color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {client.businessName || 'Unnamed Client'}
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: `${color}15`, color, display: 'inline-block', marginTop: '3px' }}>
                          {client.tradeType || 'Trade'}
                        </span>
                      </div>
                      <span style={{ fontSize: '18px', color: 'var(--faint)' }}>›</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '12px', borderTop: '1px solid var(--slate)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--ink)', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '68px' }}>Contact</span>
                        <span style={{ fontWeight: 600 }}>{client.contactName || '—'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink)', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '68px' }}>Phone</span>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px' }}>{client.phone || '—'}</span>
                      </div>
                      {client.twilioNumber && (
                        <div style={{ fontSize: '11px', display: 'flex', gap: '8px' }}>
                          <span style={{ color: 'var(--muted)', minWidth: '68px' }}>AI Line</span>
                          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px', color: 'var(--a3)', fontWeight: 600 }}>{client.twilioNumber}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--muted)', minWidth: '68px' }}>Last Active</span>
                        {lastSeen === undefined ? (
                          <span style={{ fontSize: '9px', color: 'var(--faint)' }}>loading…</span>
                        ) : (
                          <span style={{
                            fontFamily: '"IBM Plex Mono",monospace', fontSize: '10px',
                            color: lastSeen === '—' ? 'var(--faint)' : 'var(--a1)', fontWeight: lastSeen === '—' ? 400 : 600,
                          }}>{lastSeen}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && !error && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontSize: '13px' }}>
                No clients found
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '36px', borderTop: '1px solid var(--divider)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--faint)' }}>Powered by <strong>TradesAI Operator</strong> — never miss a lead</div>
          <div style={{ fontSize: '10px', color: 'var(--faint)', fontFamily: '"IBM Plex Mono",monospace' }}>
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@600;700;800;900&display=swap');
        :root{
          --bg:#F2F2F8;--slate:#EAEAF4;--ink:#1A0A3C;--muted:#7468A0;--faint:#B8B0D4;--divider:#D8D0F0;
          --a1:#3D1FA8;--a1b:#EDE8FF;--a2:#C9A84C;--a2b:#FEF8EC;
          --a3:#0A7455;--a3b:#E6FAF4;--a4:#C01830;--a4b:#FDEEF1;
          --shadow-s:0 2px 8px rgba(26,10,60,0.10),0 1px 2px rgba(26,10,60,0.05);
        }
        body{background:var(--bg);color:var(--ink);}
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}
        @media (max-width: 768px) {
          .admin-portfolio-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .admin-portfolio-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
