'use client';
import Sidebar from './Sidebar';

interface PortalShellProps {
  role: 'admin' | 'client' | 'va';
  name: string;
  clientId?: string;
  children: React.ReactNode;
}

export default function PortalShell({ role, name, clientId, children }: PortalShellProps) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F5F4F8',
      fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <Sidebar role={role} name={name} clientId={clientId} />
      <main style={{
        marginLeft: '240px',
        flex: 1,
        padding: '2rem',
        overflowX: 'hidden',
      }}>
        {children}
      </main>
    </div>
  );
}
