import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import AdminAccountClient from './AdminAccountClient';

export default async function AdminAccountPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/login');

  return <AdminAccountClient user={{ email: user.email, name: user.name, role: user.role }} />;
}
