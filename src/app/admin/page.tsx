import { adminPageGate } from '@/lib/admin-page';
import AdminAccessDenied from '@/components/nest/AdminAccessDenied';
import AdminRouteShell from '@/components/nest/AdminRouteShell';

export const metadata = { title: 'Admin — NEST by Nulo Africa' };
export const dynamic = 'force-dynamic';

/**
 * Real /admin route. Server-gated per request (Feature #2):
 * anonymous -> /sign-in, non-admin -> 403 card, admin -> dashboard.
 */
export default async function AdminPage() {
  const access = await adminPageGate();
  if (!access.ok) return <AdminAccessDenied email={access.user?.email} />;

  return <AdminRouteShell view="admin" />;
}
