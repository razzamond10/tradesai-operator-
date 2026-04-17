import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import ClientSection from '@/app/dashboard/[section]/ClientSection';

export default async function AnalyticsPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client' && user.role !== 'admin') redirect('/login');
  return <ClientSection section="analytics" user={user} isDemoEmpty={searchParams?.demo === 'empty'} />;
}
