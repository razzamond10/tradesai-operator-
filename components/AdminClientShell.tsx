'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface AdminClientShellProps {
  clientId: string;
  clientName?: string;
  tradeType?: string;
  adminName: string;
  children: React.ReactNode;
}

const NAV_SECTIONS = (id: string) => [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: '⊞', href: `/admin/clients/${id}` },
      { label: 'Analytics', icon: '📊', href: `/admin/clients/${id}/analytics` },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Job Schedule',      icon: '📅', href: `/admin/clients/${id}/job-schedule` },
      { label: 'Bookings Calendar', icon: '🗓️', href: `/admin/clients/${id}/bookings` },
      { label: 'Lead Pipeline',     icon: '📋', href: `/admin/clients/${id}/lead-pipeline` },
      { label: 'Emergencies',       icon: '🚨', href: `/admin/clients/${id}/emergencies` },
      { label: 'Communications',    icon: '💬', href: `/admin/clients/${id}/communications` },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { label: 'Revenue Tracker',   icon: '💰', href: `/admin/clients/${id}/revenue` },
      { label: 'Forecasting',       icon: '📈', href: `/admin/clients/${id}/forecast` },
      { label: 'Reviews & Ratings', icon: '⭐', href: `/admin/clients/${id}/reviews` },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Configuration', icon: '⚙️', href: `/admin/clients/${id}/configuration` },
    ],
  },
];

const TRADE_COLORS: Record<string, string> = {
  plumbing: '#3D1FA8', 'gas & heating': '#C01830', electrical: '#9A6200',
  roofing: '#0A7455', building: '#6B3FD0', drainage: '#3D1FA8',
  hvac: '#0A7455', locksmith: '#C9A84C',
};

export default function AdminClientShell({ clientId, clientName, tradeType, adminName, children }: AdminClientShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const sections = NAV_SECTIONS(clientId);
  const initials = adminName ? adminName.slice(0, 1).toUpperCase() : 'A';
  const tradeColor = TRADE_COLORS[(tradeType || '').toLowerCase()] || '#3D1FA8';

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

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

  // exact match for dashboard root, prefix match for sub-pages
  function isActive(href: string) {
    if (href === `/admin/clients/${clientId}`) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F2F2F8',
      fontFamily: '"Inter",system-ui,sans-serif', fontSize: '14px',
    }}>
      {/* ── Mobile overlay ── */}
      {mobileNavOpen && (
        <div className="admin-nav-overlay" onClick={() => setMobileNavOpen(false)} style={{ display: 'none' }} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${mobileNavOpen ? ' admin-sidebar-open' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
        background: 'linear-gradient(180deg,#1A0A3C 0%,#26145A 100%)',
        display: 'flex', flexDirection: 'column', zIndex: 100,
        boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
        fontFamily: '"Inter",system-ui,sans-serif',
        transition: 'transform 0.25s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <img src="/logo.jpg" alt="logo" style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: '#fff' }}>TradesAI</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Admin Portal</div>
            </div>
          </div>

          {/* Back to portfolio */}
          <Link href="/admin" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 8px', borderRadius: '6px',
            fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none', transition: 'all .15s',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontSize: '11px' }}>←</span> All Clients
          </Link>
        </div>

        {/* Client context badge */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '5px' }}>Viewing client</div>
          <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '12px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clientName || '…'}
          </div>
          {tradeType && (
            <span style={{
              display: 'inline-block', marginTop: '4px',
              fontSize: '8px', fontWeight: 700, padding: '1px 6px', borderRadius: '8px',
              background: `${tradeColor}30`, color: tradeColor,
              border: `1px solid ${tradeColor}40`,
            }}>
              {tradeType}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 8px', flex: 1, overflowY: 'auto' }}>
          {sections.map((section) => (
            <div key={section.label}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 8px 3px', marginTop: '4px' }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '7px 10px', borderRadius: '7px', marginBottom: '1px',
                    fontSize: '12px', fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                    background: active ? 'rgba(106,60,210,0.32)' : 'transparent',
                    textDecoration: 'none', transition: 'all .15s',
                    borderLeft: active ? '2px solid #C9A84C' : '2px solid transparent',
                  }}>
                    <span style={{ fontSize: '13px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + profile dropdown + logout */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative' }} ref={profileRef}>
          {/* Profile dropdown */}
          {profileOpen && (
            <div style={{
              position: 'absolute', bottom: '56px', left: '10px', right: '10px',
              background: '#fff', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              border: '1px solid var(--divider)', overflow: 'hidden', zIndex: 200,
            }}>
              {[
                { label: 'My Account', icon: '👤', href: '/admin/account' },
                { label: 'Platform Settings', icon: '⚙️', href: '/admin/settings' },
              ].map(item => (
                <button key={item.label} onClick={() => { setProfileOpen(false); router.push(item.href); }} style={{
                  display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                  padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, color: 'var(--ink)', fontFamily: '"Inter",sans-serif',
                  textAlign: 'left', borderBottom: '1px solid var(--slate)', transition: 'background .1s',
                }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button onClick={() => { setProfileOpen(false); logout(); }} disabled={loggingOut} style={{
                display: 'flex', alignItems: 'center', gap: '9px', width: '100%',
                padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600, color: 'var(--a4)', fontFamily: '"Inter",sans-serif',
                textAlign: 'left', transition: 'background .1s',
              }}>
                <span style={{ fontSize: '14px' }}>⎋</span>
                Sign Out
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <button onClick={() => router.push('/admin/account')} className="profile-row-btn" style={{
              display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
              borderRadius: '8px', textAlign: 'left', transition: 'background .15s',
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#C9A84C,#E8C96A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800, color: '#1A0A3C',
                fontFamily: '"Inter Tight",sans-serif',
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Owner — Admin</div>
              </div>
            </button>
            <button onClick={logout} disabled={loggingOut} title="Sign out"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '2px', lineHeight: 1, flexShrink: 0 }}>
              ⎋
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
          aside a:hover{background:rgba(255,255,255,0.07)!important;color:rgba(255,255,255,0.9)!important}
          .profile-row-btn:hover{background:rgba(255,255,255,0.08)!important}
        `}</style>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-main" style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Mobile header bar */}
        <div className="admin-mobile-header" style={{ display: 'none' }}>
          <button
            onClick={() => setMobileNavOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#1A0A3C', fontSize: '20px', lineHeight: 1 }}
            aria-label="Open navigation"
          >☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.jpg" alt="logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
            <span style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A0A3C' }}>TradesAI</span>
          </div>
          <div style={{ width: '36px' }} />
        </div>
        {children}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@600;700;800;900&display=swap');
        :root {
          --bg:#F2F2F8;--white:#FFFFFF;--slate:#EAEAF4;--slate2:#E0E0EE;
          --ink:#1A0A3C;--ink2:#2A1560;--ink3:#3D2580;
          --muted:#7468A0;--faint:#B8B0D4;--divider:#D8D0F0;
          --a1:#3D1FA8;--a1b:#EDE8FF;
          --a2:#C9A84C;--a2b:#FEF8EC;
          --a3:#0A7455;--a3b:#E6FAF4;
          --a4:#C01830;--a4b:#FDEEF1;
          --a5:#6B3FD0;--a5b:#F0EAFF;
          --a6:#9A6200;--a6b:#FEF8EC;
          --a7:#4A2090;--a7b:#EDE8FF;
          --shadow-s:0 2px 8px rgba(26,10,60,0.10),0 1px 2px rgba(26,10,60,0.05);
          --shadow-m:0 4px 20px rgba(26,10,60,0.12),0 2px 6px rgba(26,10,60,0.06);
          --r:10px;
        }
        body{background:var(--bg);color:var(--ink);}
        *{box-sizing:border-box;margin:0;padding:0;}
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%) !important; }
          .admin-sidebar.admin-sidebar-open { transform: translateX(0) !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-mobile-header {
            display: flex !important; align-items: center; justify-content: space-between;
            padding: 10px 14px; background: #fff; border-bottom: 1px solid var(--divider);
            position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 4px rgba(26,10,60,0.08);
          }
          .admin-nav-overlay {
            display: block !important; position: fixed; inset: 0;
            background: rgba(0,0,0,0.45); z-index: 99;
          }
          .admin-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-grid-3 { grid-template-columns: 1fr !important; }
          .admin-dash-row-3 { grid-template-columns: 1fr !important; }
          .admin-pipeline-grid { grid-template-columns: repeat(3,1fr) !important; }
          .admin-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          .admin-card-stack { flex-direction: column !important; }
          .topbar-clock { display: none !important; }
          .topbar-divider { display: none !important; }
        }
        @media (max-width: 480px) {
          .admin-grid-4 { grid-template-columns: 1fr !important; }
          .admin-pipeline-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
