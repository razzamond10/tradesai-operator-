import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import AdminClientDetail from './AdminClientDetail';

export default async function AdminClientDetailPage({ params }: { params: { clientId: string } }) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/login');
  return <AdminClientDetail user={user} clientId={params.clientId} />;
}
