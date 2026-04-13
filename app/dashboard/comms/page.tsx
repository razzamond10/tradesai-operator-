import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import CommsClient from './CommsClient';

export default async function CommsPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (!user.clientId) redirect('/dashboard');
  return <CommsClient user={user} />;
}
