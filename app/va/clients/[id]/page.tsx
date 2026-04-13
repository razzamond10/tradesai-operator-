import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import VAClientDetailV13 from './VAClientDetailV13';

export default async function VAClientDetailPage({ params }: { params: { id: string } }) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'va' && user.role !== 'admin') redirect('/login');
  return <VAClientDetailV13 user={user} clientId={params.id} />;
}
