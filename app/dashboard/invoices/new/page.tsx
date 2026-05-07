import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import NewInvoiceClient from './NewInvoiceClient';

export default async function NewInvoicePage() {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client' && user.role !== 'admin') redirect('/login');
  return <NewInvoiceClient user={{ email: user.email, name: user.name, role: user.role, clientId: user.clientId, planTier: user.planTier }} />;
}
