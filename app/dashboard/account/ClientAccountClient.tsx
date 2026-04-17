'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientShell from '@/components/ClientShell';
import Topbar from '@/components/Topbar';

function StatCard({ icon, label, value, sub, stripe }: { icon: string; label: string; value: string | number; sub: string; stripe: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', overflow: 'hidden' }}>
      <div style={{ height: '3px', background: stripe }} />
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--ink)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>
      </div>
    </div>
  );
}

export default function ClientAccountClient({ user }: { user: { email: string; name: string; role: string; clientId?: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/data')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) { setPwMsg('All fields are required.'); return; }
    if (newPw !== confirmPw) { setPwMsg('New password and confirmation do not match.'); return; }
    if (newPw.length < 8) { setPwMsg('Password must be at least 8 characters.'); return; }
    setPwLoading(true); setPwMsg('');
    await new Promise(r => setTimeout(r, 600));
    setPwLoading(false);
    setPwMsg('Password changes must be applied by your admin. Contact admin@tradesaioperator.uk');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const totalCalls = data?.interactions?.length ?? 0;
  const totalBookings = data?.bookings?.length ?? 0;
  const totalEmergencies = data?.emergencies?.length ?? 0;
  const businessName = data?.config?.businessName;

  return (
    <ClientShell businessName={businessName} tradeType={data?.config?.tradeType} userName={user.name}>
      <Topbar breadcrumb={businessName || 'My Business'} page="My Account" sub="Profile and account settings" />
      <div style={{ padding: '24px 22px', flex: 1, overflowY: 'auto', maxWidth: '760px' }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', marginBottom: '20px', overflow: 'hidden' }}>
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
              <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'break-all' }}>{user.email}</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', background: 'var(--a1b)', color: 'var(--a1)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                Client{businessName ? ` — ${businessName}` : ''}
              </span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Session</div>
              <div style={{ fontSize: '11px', color: 'var(--ink)', fontFamily: '"IBM Plex Mono",monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>Active</div>
            </div>
          </div>
        </div>

        {/* My Stats */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--a1)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          My Business Stats
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatCard icon="📞" label="Total Calls" value={totalCalls.toLocaleString()} sub="captured by AI" stripe="var(--a1)" />
          <StatCard icon="📅" label="Total Bookings" value={totalBookings.toLocaleString()} sub="confirmed via AI" stripe="var(--a3)" />
          <StatCard icon="🚨" label="Emergencies" value={totalEmergencies.toLocaleString()} sub="flagged and handled" stripe="var(--a4)" />
        </div>

        {/* Change password */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--a1)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          Change Password
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--divider)', boxShadow: 'var(--shadow-s)', padding: '24px 28px', marginBottom: '20px' }}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Current Password', value: currentPw, set: setCurrentPw },
              { label: 'New Password', value: newPw, set: setNewPw },
              { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--ink2)', marginBottom: '5px' }}>{label}</label>
                <input type="password" value={value} onChange={e => set(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '7px', border: '1px solid var(--divider)', fontSize: '13px', outline: 'none', fontFamily: '"Inter",sans-serif', background: '#FAFAFC', boxSizing: 'border-box' }} />
              </div>
            ))}
            {pwMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '7px', background: pwMsg.includes('admin') ? 'var(--a2b)' : 'var(--a4b)', border: `1px solid ${pwMsg.includes('admin') ? '#F5D78A' : '#F5C0C8'}`, color: pwMsg.includes('admin') ? '#8A6A00' : 'var(--a4)', fontSize: '11px', lineHeight: 1.5 }}>{pwMsg}</div>
            )}
            <button type="submit" disabled={pwLoading} style={{ alignSelf: 'flex-start', padding: '9px 22px', borderRadius: '8px', background: pwLoading ? 'var(--muted)' : 'var(--a1)', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', fontFamily: '"Inter",sans-serif' }}>
              {pwLoading ? 'Processing…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Support */}
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '11px', fontWeight: 700, color: 'var(--a1)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px' }}>
          Support
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--divider)', padding: '20px 28px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '3px' }}>Need help?</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Contact the TradesAI team at <strong>admin@tradesaioperator.uk</strong></div>
          </div>
          <a href="mailto:admin@tradesaioperator.uk" style={{ padding: '9px 20px', borderRadius: '8px', background: 'var(--a1)', color: '#fff', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: '"Inter",sans-serif' }}>
            Email Support
          </a>
        </div>

        {/* Sign out */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #F5C0C8', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '3px' }}>Sign out</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>You will be returned to the login page.</div>
          </div>
          <button onClick={handleLogout} style={{ padding: '9px 20px', borderRadius: '8px', background: 'var(--a4)', color: '#fff', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: '"Inter",sans-serif' }}>
            Sign Out
          </button>
        </div>

      </div>
    </ClientShell>
  );
}
