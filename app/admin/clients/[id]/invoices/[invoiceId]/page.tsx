import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import AdminInvoiceDetailReadOnly from './AdminInvoiceDetailReadOnly';

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: { id: string; invoiceId: string };
}) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user || (user.role !== 'admin' && user.role !== 'va')) redirect('/login');

  let decodedClientId: string;
  try {
    decodedClientId = decodeURIComponent(params.id);
  } catch {
    redirect(`/admin/clients/${params.id}`);
  }

  return (
    <AdminInvoiceDetailReadOnly
      clientId={decodedClientId}
      invoiceId={params.invoiceId}
      user={{ email: user.email, name: user.name, role: user.role, planTier: user.planTier }}
    />
  );
}
