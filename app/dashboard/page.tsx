import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import ClientDashboard from '@/components/ClientDashboard';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role === 'admin') redirect('/admin');
  if (user.role === 'va') redirect('/va');
  if (user.role !== 'client') redirect('/login');
  if (!user.clientId) {
    return (
      <div style={{ padding: '3rem', fontFamily: 'Inter, system-ui, sans-serif', color: '#1A0A3C' }}>
        <h2>No client account linked</h2>
        <p>Please contact support at admin@tradesaioperator.uk</p>
      </div>
    );
  }
  const isDemoEmpty = searchParams?.demo === 'empty';
  return <ClientDashboard user={user} isDemoEmpty={isDemoEmpty} />;
}
