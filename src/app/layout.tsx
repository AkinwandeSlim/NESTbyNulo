import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Fallback system fonts (no external fetch required)
const geistSans = {
  variable: "--font-geist-sans",
  style: { fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
};

const geistMono = {
  variable: "--font-geist-mono",
  style: { fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace" },
};

export const metadata: Metadata = {
  title: "NEST by Nulo Africa — Fractional Real Estate Investment",
  description: "Invest from ₦500,000 in professionally managed African real estate. Build wealth through rental income, capital appreciation, and diversified property portfolios.",
  keywords: ["NEST", "Nulo Africa", "real estate", "investment", "fractional", "Nigeria", "Africa", "property"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
