import Link from 'next/link';

/**
 * 403 card for a signed-in user who is not an admin (Feature #2).
 * Rendered instead of the admin shell — the shell is never shipped to a
 * non-admin browser, so admin screens cannot be reached by hiding UI.
 */
export default function AdminAccessDenied({ email }: { email?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-red-300 bg-red-50 p-6">
        <h1 className="text-lg font-bold text-red-900">Admin access required</h1>
        <p className="mt-2 text-sm text-red-800">
          {email ? (
            <>
              <strong>{email}</strong> is signed in, but this account does not
              have the ADMIN role.
            </>
          ) : (
            <>This account does not have the ADMIN role.</>
          )}{' '}
          Admin screens are gated server-side on every request.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/" className="font-semibold text-nest-primary hover:underline">
            ← Back to NEST
          </Link>
        </p>
      </div>
    </main>
  );
}
