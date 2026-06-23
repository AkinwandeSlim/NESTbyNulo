"use client";

import { useEffect } from "react";
import { ERROR_MESSAGES } from "@/lib/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error reporter here (Sentry, LogRocket, etc.)
    console.error("[app/error.tsx] Unhandled error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-nulo-ivory flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-nulo-soft-orange border border-orange-200 flex items-center justify-center text-4xl">
          ⚠️
        </div>
        <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
          Something went wrong
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-3 mb-4">
          We hit an unexpected snag
        </h1>
        <p className="text-nulo-text-muted mb-8 text-base">
          {ERROR_MESSAGES.server}
        </p>
        {error.digest && (
          <p className="text-xs text-nulo-text-muted mb-6 font-mono">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-full px-6 py-3 font-semibold transition-colors shadow-md"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-nulo-primary text-nulo-primary hover:bg-nulo-soft-orange rounded-full px-6 py-3 font-semibold transition-colors"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
