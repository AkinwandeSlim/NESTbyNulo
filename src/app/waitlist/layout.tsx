import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./waitlist.css";

export const metadata: Metadata = {
  title: "NEST by Nulo Africa | Fractional Real Estate Investment",
  description:
    "Co-own verified rental properties across Nigeria starting from ₦500,000. Earn rental income every year with NEST by Nulo Africa.",
};

/**
 * Waitlist landing route (port of the original waitlist-backup app).
 * - Fonts: Fraunces (display) + Inter (body) loaded at RUNTIME via <link>
 *   tags below (hoisted into <head> by React 19) — keeps `next build` free
 *   of external fetches (this repo avoids build-time font downloads, and
 *   Turbopack drops remote @import rules from CSS files).
 * - `.waitlist-root` scopes the ported focus styles.
 * - sonner <Toaster /> for WaitlistForm toasts (the root layout only mounts
 *   the shadcn radix toaster, which this form does not use).
 */
export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="waitlist-root min-h-screen bg-nulo-background font-body text-nulo-text antialiased">
      {/* Runtime font loading (see note above) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Inter:wght@400..800&display=swap"
      />
      {children}
      <Toaster position="top-right" />
    </div>
  );
}
