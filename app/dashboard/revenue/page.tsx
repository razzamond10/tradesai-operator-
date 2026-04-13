import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import RevenueClient from './RevenueClient';

export default async function RevenuePage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (!user.clientId) redirect('/dashboard');
  return <RevenueClient user={user} />;
}
