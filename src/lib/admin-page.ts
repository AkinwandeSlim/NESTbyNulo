import { redirect } from 'next/navigation';
import { requireAdmin, type AdminAccess } from '@/lib/admin';

/**
 * Feature #2 server-side page gate.
 *
 * Every /admin/* page calls this itself — authorization is never inferred from
 * a URL matcher or client state, so an admin resource cannot be reached by
 * relying on a shared middleware rule (the dev_gstack design principle).
 *
 *   anonymous    -> redirect('/sign-in')  (307, so the E2E suite can observe it)
 *   signed in but not an admin -> caller renders the 403 card
 *   admin        -> access granted
 */
export async function adminPageGate(): Promise<AdminAccess> {
  const access = await requireAdmin();
  if (!access.ok && access.reason === 'UNAUTHENTICATED') redirect('/sign-in');
  return access;
}
