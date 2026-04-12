import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import ReviewsClient from './ReviewsClient';

export default async function ReviewsPage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client') redirect('/admin');
  return <ReviewsClient user={user} />;
}
