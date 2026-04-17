import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import ClientSection from './ClientSection';

const VALID_SECTIONS = [
  'analytics', 'schedule', 'pipeline', 'job-schedule', 'bookings',
  'lead-pipeline', 'emergencies', 'comms', 'communications',
  'revenue', 'forecast', 'forecasting', 'reviews', 'configuration',
];

export default async function DashboardSectionPage({
  params,
  searchParams,
}: {
  params: { section: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client' && user.role !== 'admin') redirect('/login');
  if (!VALID_SECTIONS.includes(params.section)) redirect('/dashboard');
  const isDemoEmpty = searchParams?.demo === 'empty';
  return <ClientSection section={params.section} user={user} isDemoEmpty={isDemoEmpty} />;
}
