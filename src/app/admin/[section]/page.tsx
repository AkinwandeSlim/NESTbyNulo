import { notFound } from 'next/navigation';
import { adminPageGate } from '@/lib/admin-page';
import AdminAccessDenied from '@/components/nest/AdminAccessDenied';
import AdminRouteShell from '@/components/nest/AdminRouteShell';
import type { View } from '@/lib/nest-store';

/**
 * Deep-linkable admin panels. Each one is server-gated on request, so the
 * authorization decision cannot be bypassed by navigating straight to a URL.
 */
const SECTIONS: Record<string, View> = {
  crm: 'admin-crm',
  support: 'admin-support',
  analytics: 'admin-analytics',
  finance: 'admin-finance',
  opportunities: 'admin-opportunities',
  properties: 'admin-properties',
};

export const dynamic = 'force-dynamic';

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const view = SECTIONS[section];
  if (!view) notFound();

  const access = await adminPageGate();
  if (!access.ok) return <AdminAccessDenied email={access.user?.email} />;

  return <AdminRouteShell view={view} />;
}
