import DevAuthForm from '@/components/nest/DevAuthForm';

export const metadata = { title: 'Sign in — NEST by Nulo Africa' };

/**
 * Real URL for sign-in (dev_gstack Feature #1 route, kept here so the demo has
 * judge-visible URLs and the E2E auth suite can exercise the page).
 */
export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <DevAuthForm mode="sign-in" />
    </main>
  );
}
