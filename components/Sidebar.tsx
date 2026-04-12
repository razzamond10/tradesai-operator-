'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'admin' | 'client' | 'va';
  name: string;
  clientId?: string;
}

const clientNav = [
  { label: 'Overview', icon: '◈', href: '/dashboard' },
  { label: 'Jobs', icon: '🔧', href: '/dashboard/jobs' },
  { label: 'Pipeline', icon: '📊', href: '/dashboard/pipeline' },
  { label: 'Reviews', icon: '⭐', href: '/dashboard/reviews' },
];

const adminNav = [
  { label: 'Clients', icon: '◈', href: '/admin' },
];

const vaNav = [
  { label: 'Clients', icon: '◈', href: '/va' },
];

export default function Sidebar({ role, name, clientId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const nav =
    role === 'admin' ? adminNav :
    role === 'va' ? vaNav :
    clientNav;

  async function logout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: '#1A0A3C',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(201,168,76,0.15)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="logo" style={{ height: '36px', width: 'auto', borderRadius: '8px' }} />
          <div>
            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '-0.3px' }}>
              Trades <span style={{ color: '#C9A84C' }}>Ai</span>
            </div>
            <div style={{ color: '#666', fontSize: '0.65rem', letterSpacing: '0.5px' }}>OPERATOR</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: '20px', padding: '0.25rem 0.75rem',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', display: 'inline-block' }} />
          <span style={{ color: '#C9A84C', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {role}
          </span>
        </div>
        <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.4rem', paddingLeft: '0.25rem' }}>
          {name}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ color: '#555', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '1px', padding: '0 0.5rem 0.5rem', textTransform: 'uppercase' }}>
          Navigation
        </div>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: '10px',
                color: active ? '#C9A84C' : '#aaa',
                background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: active ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: active ? '600' : '400',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <button
          onClick={logout}
          disabled={loggingOut}
          style={{
            width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            color: '#888', fontSize: '0.85rem', cursor: 'pointer',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(220,50,50,0.4)';
            (e.currentTarget as HTMLElement).style.color = '#ff8080';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLElement).style.color = '#888';
          }}
        >
          ⎋ {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
