import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "NEST by Nulo Africa | Fractional Real Estate Investment",
  description:
    "Co-own verified rental properties across Nigeria starting from ₦500,000. Earn rental income every year with NEST by Nulo Africa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-nulo-background text-nulo-text antialiased">
        {children}
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
