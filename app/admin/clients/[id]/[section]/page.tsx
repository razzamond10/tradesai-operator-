import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import AdminClientSection from './AdminClientSection';

const VALID_SECTIONS = ['analytics', 'schedule', 'pipeline', 'emergencies', 'comms', 'revenue', 'forecast', 'reviews', 'config'];

export default async function AdminClientSectionPage({
  params,
}: {
  params: { id: string; section: string };
}) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user || user.role !== 'admin') redirect('/login');
  if (!VALID_SECTIONS.includes(params.section)) redirect(`/admin/clients/${params.id}`);
  return <AdminClientSection clientId={params.id} section={params.section} user={user} />;
}
