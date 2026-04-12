import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');

  const user = await verifyJWT(token);
  if (!user) redirect('/login');

  // Admins use /admin; redirect clients only
  if (user.role === 'admin') redirect('/admin');
  if (user.role === 'va') redirect('/va');
  if (!user.clientId) {
    return (
      <div style={{ padding: '3rem', fontFamily: 'Inter, system-ui, sans-serif', color: '#1A0A3C' }}>
        <h2>No client account linked</h2>
        <p>Please contact your account manager.</p>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}
