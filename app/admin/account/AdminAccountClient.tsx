'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function fmtCurrency(v: number) {
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}m`;
  if (v >= 1_000) return `£${(v / 1_000).toFixed(1)}k`;
  return `£${Math.round(v)}`;
}

function StatCard({ icon, label, value, sub, stripe }: { icon: string; label: string; value: string | number; sub: string; stripe: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #D8D0F0', boxShadow: '0 2px 8px rgba(26,10,60,0.06)', overflow: 'hidden' }}>
      <div style={{ height: '3px', background: stripe }} />
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#7468A0', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: '#1A0A3C', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: '#9A90C0', marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
}

export default function AdminAccountClient({ user }: { user: { email: string; name: string; role: string } }) {
  const router = useRouter();
  const [stats, setStats] = useState<{ totalClients: number; totalCalls: number; totalRevenue: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats({ totalClients: 0, totalCalls: 0, totalRevenue: 0 }))
      .finally(() => setStatsLoading(false));
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) { setPwMsg('All fields are required.'); return; }
    if (newPw !== confirmPw) { setPwMsg('New password and confirmation do not match.'); return; }
    if (newPw.length < 8) { setPwMsg('New password must be at least 8 characters.'); return; }
    setPwLoading(true);
    setPwMsg('');
    // Credentials are stored as environment variables. Password changes require an admin to
    // regenerate the bcrypt hash and update the Vercel env var, then redeploy.
    await new Promise(r => setTimeout(r, 600));
    setPwLoading(false);
    setPwMsg('Password change requests must be applied by updating the USER_*_HASH environment variable and redeploying. Contact your system administrator.');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F8', fontFamily: '"Inter",system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1A0A3C', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚙</div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9A84C', fontFamily: '"Inter",sans-serif', letterSpacing: '.5px' }}>← PORTFOLIO</span>
        </Link>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '.5px' }}>MY ACCOUNT</div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #D8D0F0', boxShadow: '0 2px 10px rgba(26,10,60,0.07)', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '4px', background: 'linear-gradient(90deg,#3D1FA8,#C9A84C)' }} />
          <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#3D1FA8,#6B3FD0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Inter Tight",sans-serif', fontSize: '22px', fontWeight: 900, color: '#fff',
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: '#1A0A3C', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#7468A0', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'break-all' }}>{user.email}</div>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                background: '#3D1FA818', color: '#3D1FA8',
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px',
              }}>{user.role}</span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9A90C0', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Session</div>
              <div style={{ fontSize: '11px', color: '#1A0A3C', fontFamily: '"IBM Plex Mono",monospace' }}>Active</div>
            </div>
          </div>
        </div>

        {/* Platform stats */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: '#3D1FA8', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          Platform Overview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          {statsLoading ? (
            [1,2,3].map(i => (
              <div key={i} style={{ height: '110px', borderRadius: '10px', background: 'rgba(61,31,168,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))
          ) : (
            <>
              <StatCard icon="🏢" label="Total Clients" value={stats?.totalClients ?? 0} sub="active on platform" stripe="#3D1FA8" />
              <StatCard icon="📞" label="Total Calls" value={(stats?.totalCalls ?? 0).toLocaleString()} sub="all time, all clients" stripe="#0A7455" />
              <StatCard icon="💰" label="Total Revenue" value={fmtCurrency(stats?.totalRevenue ?? 0)} sub="booked via AI, all clients" stripe="#C9A84C" />
            </>
          )}
        </div>

        {/* Change password */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: '#3D1FA8', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          Change Password
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #D8D0F0', boxShadow: '0 2px 10px rgba(26,10,60,0.07)', padding: '24px 28px', marginBottom: '20px' }}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Current Password', value: currentPw, set: setCurrentPw },
              { label: 'New Password', value: newPw, set: setNewPw },
              { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#3D2580', marginBottom: '5px' }}>{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={e => set(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '7px',
                    border: '1px solid #D8D0F0', fontSize: '13px', outline: 'none',
                    fontFamily: '"Inter",sans-serif', background: '#FAFAFC',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            {pwMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '7px',
                background: pwMsg.startsWith('Password change') ? '#FFF8E6' : '#FFF0F2',
                border: `1px solid ${pwMsg.startsWith('Password change') ? '#F5D78A' : '#F5C0C8'}`,
                color: pwMsg.startsWith('Password change') ? '#8A6A00' : '#C01830',
                fontSize: '11px', lineHeight: 1.5,
              }}>
                {pwMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              style={{
                alignSelf: 'flex-start', padding: '9px 22px', borderRadius: '8px',
                background: pwLoading ? '#9A90C0' : '#3D1FA8',
                color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none',
                cursor: pwLoading ? 'not-allowed' : 'pointer',
                fontFamily: '"Inter",sans-serif', transition: 'all .15s',
              }}
            >
              {pwLoading ? 'Processing…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: '#C01830', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          Danger Zone
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #F5C0C8', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A0A3C', marginBottom: '3px' }}>Sign out of admin panel</div>
            <div style={{ fontSize: '11px', color: '#9A90C0' }}>You will be returned to the login page.</div>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            style={{
              padding: '9px 20px', borderRadius: '8px',
              background: logoutLoading ? '#F5C0C8' : '#C01830',
              color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none',
              cursor: logoutLoading ? 'not-allowed' : 'pointer',
              fontFamily: '"Inter",sans-serif', transition: 'all .15s',
            }}
          >
            {logoutLoading ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>

      </div>
    </div>
  );
}
