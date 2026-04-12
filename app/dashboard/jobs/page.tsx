import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import JobsClient from './JobsClient';

export default async function JobsPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client') redirect('/admin');
  return <JobsClient user={user} />;
}
