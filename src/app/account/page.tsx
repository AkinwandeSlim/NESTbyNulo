import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import InvestorDashboard from '@/components/nest/InvestorDashboard';

export const metadata = { title: 'My Account — NEST by Nulo Africa' };

/**
 * Investor dashboard with sidebar layout (Overview | Portfolio | Wallet).
 * Matches admin dashboard UX pattern for consistency.
 */
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  return <InvestorDashboard user={user} />;
}