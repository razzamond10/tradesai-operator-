'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'admin' | 'client' | 'va';
  name: string;
}

const clientNavSections = [
  {
    label: 'Main',
    items: [
      { label: 'Command Centre', icon: '⊞', href: '/dashboard' },
      { label: 'Analytics', icon: '📈', href: '/dashboard/analytics' },
      { label: 'Schedule', icon: '📅', href: '/dashboard/jobs' },
      { label: 'Pipeline', icon: '◎', href: '/dashboard/pipeline' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Emergencies', icon: '🚨', href: '/dashboard/emergencies', badge: true },
      { label: 'Comms', icon: '💬', href: '/dashboard/comms' },
      { label: 'Revenue', icon: '💷', href: '/dashboard/revenue' },
      { label: 'Reviews', icon: '⭐', href: '/dashboard/reviews' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Configuration', icon: '⚙', href: '/dashboard/config' },
    ],
  },
];

const adminNavSections = [
  { label: 'Main', items: [{ label: 'All Clients', icon: '👥', href: '/admin' }] },
];

const vaNavSections = [
  { label: 'Main', items: [{ label: 'Clients', icon: '👥', href: '/va' }] },
];

export default function Sidebar({ role, name }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const sections =
    role === 'admin' ? adminNavSections :
    role === 'va' ? vaNavSections :
    clientNavSections;

  const initials = name ? name.slice(0, 1).toUpperCase() : 'U';
  const roleLabel = role === 'admin' ? 'Owner — Admin' : role === 'va' ? 'Virtual Assistant' : 'Client';

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
      background: 'linear-gradient(180deg,#1A0A3C 0%,#26145A 100%)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
      fontFamily: '"Inter",system-ui,sans-serif',
    }}>
      {/* Top: logo + live indicator */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <img src="/logo.jpg" alt="logo" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '7px', background: '#fff', padding: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '14px', fontWeight: 700, color: '#fff' }}>TradesAI Operator</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{role === 'admin' ? 'Admin Portal' : role === 'va' ? 'VA Portal' : 'Client Portal'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
          <span style={{ width: '6px', height: '6px', background: '#22C55E', borderRadius: '50%', animation: 'pulse 2s infinite', boxShadow: '0 0 5px rgba(34,197,94,0.5)', display: 'inline-block' }} />
          Live data
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        {sections.map((section) => (
          <div key={section.label}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 8px 4px', marginTop: '4px' }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '8px 10px', borderRadius: '7px',
                  fontSize: '12px', fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  background: active ? 'rgba(106,60,210,0.30)' : 'transparent',
                  textDecoration: 'none', marginBottom: '1px', transition: 'all .15s',
                }}>
                  <span style={{ fontSize: '13px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                  {(item as any).badge && (
                    <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', background: '#C01830', color: '#fff' }}>!</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8C96A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#1A0A3C', flexShrink: 0, fontFamily: '"Inter Tight",sans-serif' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{roleLabel}</div>
          </div>
          <button
            onClick={logout}
            disabled={loggingOut}
            title="Sign out"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '2px', lineHeight: 1 }}
          >
            ⎋
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
        aside a:hover{background:rgba(255,255,255,0.06)!important;color:rgba(255,255,255,0.85)!important}
      `}</style>
    </aside>
  );
}
