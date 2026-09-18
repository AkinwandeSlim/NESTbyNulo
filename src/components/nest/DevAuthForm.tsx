'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

type Mode = 'sign-in' | 'sign-up';

/**
 * DEV FALLBACK auth form (ported from dev_gstack's Feature #1 UI).
 *
 * Real server logic behind it: scrypt password hashing + an HMAC-signed
 * HttpOnly session cookie, and a database account created with PENDING status.
 * Restyled to this project's design language (nest tokens + shadcn primitives).
 *
 * Clerk mode is intentionally not wired in the merged app (no keys), so this
 * form IS the sign-in path — see the MERGE NOTE in src/lib/auth.ts.
 */
export default function DevAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      // Map UI mode to backend route: sign-in → login, sign-up → register
      const endpoint = mode === 'sign-in' ? 'login' : 'register';
      const res = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? `Request failed (${res.status})`);
        setPending(false);
        return;
      }
      // Check for redirect URL from investment flow
      const redirectUrl = sessionStorage.getItem('redirectAfterSignIn');
      sessionStorage.removeItem('redirectAfterSignIn');
      router.push(redirectUrl || '/account');
      router.refresh();
    } catch {
      setError('Check your connection and try again.');
      setPending(false);
    }
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none transition focus:border-nest-primary focus:ring-1 focus:ring-nest-primary';
  const labelClass = 'mb-1 block text-sm font-medium text-foreground';

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-nest-primary/20 px-3 py-1.5 rounded-full border border-slate-200 dark:border-nest-primary/30">
          <img
            src="/nuloafrica-newlogo-complete.png"
            alt="NuloAfrica"
            className="h-6 w-auto object-contain dark:hidden"
          />
          <img
            src="/nuloafrica-newlightlogo-complete.png"
            alt="NuloAfrica"
            className="h-6 w-auto object-contain hidden dark:block"
          />
          <span className="text-lg font-bold text-foreground dark:text-nest-primary">
            <span className="text-nest-accent">|</span> NEST
          </span>
        </div>
      </Link>

      <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>DEV FALLBACK AUTH</strong> — Clerk keys are not configured, so a
        local dev sign-in is used. Registration still creates a real database
        account with <strong>PENDING</strong> status that an admin must verify
        before investing is unlocked.
      </div>

      <h1 className="text-xl font-bold text-foreground">
        {mode === 'sign-up' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === 'sign-up'
          ? 'Accounts start as PENDING until an admin verifies them.'
          : 'Sign in to view your account status and wallet.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {mode === 'sign-up' && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  maxLength={50}
                  autoComplete="given-name"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>
                  Last name <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  maxLength={50}
                  autoComplete="family-name"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                autoComplete="tel"
                className={inputClass}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            className={inputClass}
          />
          {mode === 'sign-up' && (
            <p className="mt-1 text-xs text-muted-foreground">
              Minimum 8 characters. Hashed with scrypt — never stored in plain text.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-nest-primary text-sm font-semibold text-white transition hover:bg-nest-primary/90 disabled:opacity-60"
        >
          {pending
            ? 'Please wait…'
            : mode === 'sign-up'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === 'sign-up' ? (
          <>
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-semibold text-nest-primary hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to NEST?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-nest-primary hover:underline"
            >
              Create account
            </Link>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-xs">
        <Link href="/" className="text-muted-foreground hover:underline">
          ← Back to NEST
        </Link>
      </p>
    </div>
  );
}
