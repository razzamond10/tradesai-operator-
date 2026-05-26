import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import VACommDetailClient from './VACommDetailClient';

export default async function VACommDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'va' && user.role !== 'admin') redirect('/login');
  return <VACommDetailClient user={user} id={params.id} />;
}
