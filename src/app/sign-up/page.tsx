import DevAuthForm from '@/components/nest/DevAuthForm';

export const metadata = { title: 'Create account — NEST by Nulo Africa' };

/**
 * Real URL for registration. Accounts are created with PENDING status and an
 * admin must verify them (Feature #2) before investing unlocks (Feature #4).
 */
export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <DevAuthForm mode="sign-up" />
    </main>
  );
}
