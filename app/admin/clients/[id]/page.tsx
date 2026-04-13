import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import AdminClientDetailV13 from './AdminClientDetailV13';

export default async function AdminClientDetailPage({ params }: { params: { id: string } }) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/login');
  return <AdminClientDetailV13 user={user} clientId={params.id} />;
}
