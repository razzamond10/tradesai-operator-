import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import AdminSectionClient from '../AdminSectionClient';

export default async function AdminSchedulePage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user || user.role !== 'admin') redirect('/login');
  return <AdminSectionClient section="schedule" user={user} />;
}
