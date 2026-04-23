import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import UpgradePage from './UpgradeClient';

export default async function DashboardUpgradePage({
  searchParams,
}: {
  searchParams?: { feature?: string; action?: string };
}) {
  const token = cookies().get('tradesai_token')?.value;
  if (!token) redirect('/login');
  const user = await verifyJWT(token);
  if (!user) redirect('/login');
  if (user.role !== 'client' && user.role !== 'admin') redirect('/login');

  return (
    <UpgradePage
      featureKey={searchParams?.feature ?? null}
      action={searchParams?.action ?? null}
      planTier={user.planTier ?? 'starter'}
      userName={user.name}
    />
  );
}
