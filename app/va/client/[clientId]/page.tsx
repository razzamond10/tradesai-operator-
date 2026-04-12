import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import VAClientDetail from './VAClientDetail';

export default async function VAClientDetailPage({ params }: { params: { clientId: string } }) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'va' && user.role !== 'admin') redirect('/login');
  return <VAClientDetail user={user} clientId={params.clientId} />;
}
