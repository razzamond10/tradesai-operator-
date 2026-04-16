import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminSettingsPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/login');

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F8', fontFamily: '"Inter",system-ui,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '40px 48px', boxShadow: '0 4px 20px rgba(26,10,60,0.10)', border: '1px solid #D8D0F0', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#EDE8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
          ⚙️
        </div>
        <div style={{ fontFamily: '"Inter Tight",sans-serif', fontSize: '20px', fontWeight: 900, color: '#1A0A3C', marginBottom: '4px' }}>Platform Settings</div>
        <div style={{ fontSize: '12px', color: '#7468A0', marginBottom: '24px' }}>TradesAI Operator configuration</div>
        <div style={{ padding: '14px 16px', background: '#F2F2F8', borderRadius: '8px', fontSize: '12px', color: '#7468A0', marginBottom: '24px' }}>
          Platform settings coming soon. Global configuration options will appear here.
        </div>
        <Link href="/admin" style={{ display: 'inline-block', padding: '9px 20px', borderRadius: '8px', background: '#3D1FA8', color: '#fff', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: '"Inter",sans-serif' }}>
          ← Back to Portfolio
        </Link>
      </div>
    </div>
  );
}
