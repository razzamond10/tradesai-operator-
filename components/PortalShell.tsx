'use client';
import Sidebar from './Sidebar';

interface PortalShellProps {
  role: 'admin' | 'client' | 'va';
  name: string;
  children: React.ReactNode;
}

export default function PortalShell({ role, name, children }: PortalShellProps) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F2F2F8',
      fontFamily: '"Inter",system-ui,sans-serif',
      fontSize: '14px',
    }}>
      <Sidebar role={role} name={name} />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
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
        body { background: var(--bg); color: var(--ink); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}
