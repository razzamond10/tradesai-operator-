import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import ClientAccountClient from './ClientAccountClient';

export default async function ClientAccountPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client' && user.role !== 'admin') redirect('/login');
  return <ClientAccountClient user={{ email: user.email, name: user.name, role: user.role, clientId: user.clientId }} />;
}
