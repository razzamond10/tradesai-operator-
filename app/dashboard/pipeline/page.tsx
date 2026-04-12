import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import PipelineClient from './PipelineClient';

export default async function PipelinePage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client') redirect('/admin');
  return <PipelineClient user={user} />;
}
