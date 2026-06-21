Here is the complete, production-ready codebase for the NEST landing page and waitlist system. Follow the output order specified in your prompt.

### 1. `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nulo: {
          primary: "#FF6600",
          "primary-mid": "#EA580C",
          "primary-dark": "#C2410C",
          "primary-light": "#F97316",
          accent: "#F59E0B",
          "soft-orange": "#FFF7ED",
          text: "#0F172A",
          "text-secondary": "#334155",
          "text-muted": "#475569",
          background: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E2E8F0",
          ivory: "oklch(0.98 0.01 75)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

### 2. `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --nulo-primary: #FF6600;
  --nulo-primary-dark: #C2410C;
  --nulo-primary-mid: #EA580C;
  --nulo-accent: #F59E0B;
  --nulo-soft-orange: #FFF7ED;
  --nulo-text: #0F172A;
  --nulo-muted-text: #475569;
  --nulo-background: #FFFFFF;
  --nulo-card: #FFFFFF;
  --nulo-border: #E2E8F0;

  --background: oklch(0.98 0.01 75);
  --foreground: oklch(0.15 0.01 60);
  --primary: oklch(0.65 0.08 75);
  --primary-foreground: oklch(0.98 0.005 75);
  --border: oklch(0.9 0.005 75);
  --ring: oklch(0.3 0.06 195);
}

body {
  background-color: var(--background);
  color: var(--nulo-text);
  font-family: var(--font-body), system-ui, sans-serif;
}

@keyframes tile-assemble {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-tile {
  animation: tile-assemble 0.6s ease-out forwards;
  opacity: 0;
}

html {
  scroll-behavior: smooth;
}
```

### 3. `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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
  description: "Co-own verified rental properties across Nigeria starting from ₦500,000. Earn rental income every year with NEST by Nulo Africa.",
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
      </body>
    </html>
  );
}
```

### 4. `lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

export const createBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, anonKey);
};

export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, serviceKey);
};
```

### 5. Components

#### `components/Navbar.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-nulo-border shadow-sm text-nulo-text"
          : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-2xl text-nulo-primary">
            NEST
          </span>
          <span className={`text-sm ${scrolled ? "text-nulo-text-muted" : "text-white/80"}`}>
            by Nulo
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className={`text-sm font-medium hover:text-nulo-primary transition-colors ${scrolled ? "text-nulo-text-secondary" : "text-white/90"}`}>
            How It Works
          </a>
          <a href="#returns" className={`text-sm font-medium hover:text-nulo-primary transition-colors ${scrolled ? "text-nulo-text-secondary" : "text-white/90"}`}>
            Returns
          </a>
          <a href="#faq" className={`text-sm font-medium hover:text-nulo-primary transition-colors ${scrolled ? "text-nulo-text-secondary" : "text-white/90"}`}>
            FAQ
          </a>
        </div>

        <a
          href="#waitlist"
          className="bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}
```

#### `components/Hero.tsx`

```typescript
"use client";

export default function Hero() {
  const tiles = Array.from({ length: 24 });

  return (
    <section className="relative bg-nulo-ivory pt-32 pb-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 60% 0%, rgba(255,102,0,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-nulo-text leading-tight mb-6">
            You don&apos;t need ₦90 million to own property in Abuja.
          </h1>
          <p className="text-lg text-nulo-text-secondary mb-8 max-w-lg">
            NEST lets you co-own verified rental properties across Nigeria — starting from ₦500,000. Earn rental income every year. No agents. No full purchase.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a
              href="#waitlist"
              className="bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-full px-6 py-3 font-semibold text-center transition-colors"
            >
              Join the Waitlist →
            </a>
            <a
              href="#how-it-works"
              className="border border-nulo-primary text-nulo-primary hover:bg-nulo-soft-orange rounded-full px-6 py-3 font-semibold text-center transition-colors"
            >
              See how it works ↓
            </a>
          </div>

          <div className="flex flex-wrap gap-2">
            {["🔒 Escrow-backed", "✅ Verified properties", "🤖 AI-powered", "📊 Transparent reporting"].map((badge) => (
              <span key={badge} className="bg-white border border-nulo-border rounded-full px-3 py-1 text-xs text-nulo-text-secondary">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="grid grid-cols-4 gap-3 p-6 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl shadow-lg">
            {tiles.map((_, i) => {
              const opacity = 0.2 + (i % 4) * 0.2;
              return (
                <div
                  key={i}
                  className="animate-tile aspect-square rounded-lg shadow-sm"
                  style={{
                    backgroundColor: `rgba(255, 102, 0, ${opacity})`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### `components/Problem.tsx`

```typescript
const problems = [
  {
    icon: "🏦",
    title: "Renting builds nothing",
    body: "Every year, millions pay rent that grows someone else's wealth — not their own.",
  },
  {
    icon: "💸",
    title: "Buying is out of reach",
    body: "Lagos properties start at ₦50M. Abuja at ₦80M. That's not accessible for most.",
  },
  {
    icon: "🤝",
    title: "Real estate is full of trust gaps",
    body: "Agents, developers, and landlords — finding someone reliable is harder than finding the money.",
  },
];

export default function Problem() {
  return (
    <section className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            The Problem
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Why most Nigerians never own property
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl shadow-sm border border-nulo-border p-6">
              <div className="w-12 h-12 bg-nulo-soft-orange rounded-xl flex items-center justify-center text-2xl mb-4">
                {p.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-nulo-text mb-2">{p.title}</h3>
              <p className="text-nulo-text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### `components/Solution.tsx`

```typescript
const features = [
  {
    icon: "◈",
    title: "Fractional Ownership",
    body: "Own a verified percentage of a real property",
    color: "text-nulo-accent",
  },
  {
    icon: "₦",
    title: "Annual Rental Income",
    body: "Receive your share of rent collected, every year",
    color: "text-nulo-primary",
  },
  {
    icon: "🔒",
    title: "Legal Protection",
    body: "Trust deed, escrow-backed, regulated structure",
    color: "text-nulo-accent",
  },
  {
    icon: "🤖",
    title: "AI-Powered Management",
    body: "Tenant screening, maintenance, transparent reporting",
    color: "text-nulo-primary",
  },
];

export default function Solution() {
  return (
    <section className="bg-white py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            The Solution
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            NEST changes the equation.
          </h2>
          <p className="text-nulo-text-muted mt-2">Co-own. Co-earn. Stay in control.</p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-2 snap-x md:grid md:grid-cols-2 md:pb-0">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-nulo-soft-orange border border-orange-100 rounded-2xl p-5 snap-start min-w-[260px] md:min-w-0"
            >
              <div className={`text-3xl mb-3 ${f.color}`}>{f.icon}</div>
              <h3 className="font-display text-lg font-bold text-nulo-text mb-1">{f.title}</h3>
              <p className="text-nulo-text-muted text-sm">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### `components/HowItWorks.tsx`

```typescript
const steps = [
  {
    n: 1,
    title: "Join a Property Pool",
    body: "Browse available NEST properties and select one that fits your budget",
  },
  {
    n: 2,
    title: "Co-Invest with Others",
    body: "Contribute your share (min ₦500K) alongside verified co-investors",
  },
  {
    n: 3,
    title: "Nulo Manages Everything",
    body: "We handle tenants, maintenance, legal, and rent collection",
  },
  {
    n: 4,
    title: "Earn & Appreciate",
    body: "Receive rental income annually + benefit as the property value grows",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Four steps to your first property share
          </h2>
        </div>

        <div className="relative">
          {/* Desktop Line */}
          <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-nulo-primary-mid mx-12" />
          
          {/* Desktop Grid / Mobile Timeline */}
          <div className="grid md:grid-cols-4 gap-12 md:gap-4 relative">
            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center md:pt-16">
                {/* Mobile Line */}
                <div className="md:hidden absolute left-4 top-10 bottom-[-3rem] w-0.5 bg-nulo-primary-mid" />
                
                <div className="w-10 h-10 rounded-full bg-nulo-primary text-white font-bold flex items-center justify-center relative z-10 mb-4 border-4 border-nulo-soft-orange">
                  {s.n}
                </div>
                <h3 className="font-display text-lg font-bold text-nulo-text mb-2">{s.title}</h3>
                <p className="text-nulo-text-muted text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### `components/Returns.tsx`

```typescript
"use client";

import { useState } from "react";

export default function Returns() {
  const [investment, setInvestment] = useState(500000);

  const propertyValue = 90000000;
  const annualRent = 8000000;

  const share = (investment / propertyValue) * 100;
  const annualReturn = (investment / propertyValue) * annualRent;
  const monthlyReturn = annualReturn / 12;

  return (
    <section id="returns" className="bg-white py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            The Numbers
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            What does your return actually look like?
          </h2>
        </div>

        <div className="bg-gradient-to-br from-nulo-soft-orange to-white border border-orange-100 rounded-2xl p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-nulo-text-muted uppercase tracking-wide mb-1">Property</p>
              <p className="font-display text-xl font-bold text-nulo-text">3-Bedroom Apartment, Maitama, Abuja</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-nulo-text-muted uppercase tracking-wide mb-1">Total Value</p>
                <p className="font-bold text-nulo-text">₦90,000,000</p>
              </div>
              <div>
                <p className="text-sm text-nulo-text-muted uppercase tracking-wide mb-1">Annual Rent</p>
                <p className="font-bold text-nulo-text">₦8,000,000</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="investment" className="block text-sm font-medium text-nulo-text-secondary mb-2">
              Your Investment: <span className="font-bold text-nulo-text">₦{investment.toLocaleString()}</span>
            </label>
            <input
              id="investment"
              type="range"
              min={500000}
              max={5000000}
              step={100000}
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full accent-nulo-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-nulo-text-muted mt-1">
              <span>₦500K</span>
              <span>₦5M</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-nulo-border text-center">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs text-nulo-text-muted uppercase mb-1">Your Share</p>
                <p className="font-display text-xl font-bold text-nulo-text">{share.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-nulo-text-muted uppercase mb-1">Monthly Est.</p>
                <p className="font-display text-xl font-bold text-nulo-text">₦{monthlyReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-xs text-nulo-text-muted uppercase mb-1">Annual Return</p>
                <p className="text-nulo-primary text-3xl font-display font-bold">₦{annualReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            <p className="text-xs text-nulo-text-muted">* Based on 100% occupancy. Illustrative purposes only.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### `components/TrustLayer.tsx`

```typescript
const pillars = [
  {
    icon: "🔒",
    title: "Escrow-Protected Funds",
    desc: "Your investment is held in regulated escrow — not a founder's account",
  },
  {
    icon: "✅",
    title: "Verified Properties",
    desc: "Every property is inspected, titled, and legally cleared before listing",
  },
  {
    icon: "📊",
    title: "Transparent Reporting",
    desc: "Annual income statements, occupancy data, and property updates",
  },
  {
    icon: "🤖",
    title: "AI Tenant Screening",
    desc: "Nulo's AI evaluates tenant reliability before any lease is signed",
  },
];

export default function TrustLayer() {
  return (
    <section className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            Why Trust NEST
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Built for a market where trust is everything.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl p-6 border border-nulo-border shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {p.icon}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-nulo-text mb-1">{p.title}</h3>
                <p className="text-nulo-text-muted text-sm">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### `components/SocialProof.tsx`

```typescript
const testimonials = [
  { name: "Amara O.", role: "Software Engineer", city: "Lagos", quote: "I never thought I could own property in Abuja on my salary. NEST makes this real." },
  { name: "Chukwuemeka B.", role: "Marketing Manager", city: "Abuja", quote: "The transparency is what got me. I can see exactly what I own and what I earn." },
  { name: "Tolu A.", role: "Diaspora, UK", quote: "Sending money home for years. Finally a structured way to actually own something." },
];

export default function SocialProof() {
  return (
    <section className="bg-gradient-to-br from-nulo-primary via-nulo-primary-mid to-nulo-primary-dark py-16 md:py-24 px-4 md:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="font-display font-semibold text-2xl md:text-3xl mb-4">
            &quot;Nulo is building the financial infrastructure that makes real estate participation possible for every Nigerian — not just the wealthy.&quot;
          </p>
          <p className="text-white/80 text-sm">— Nulo Africa Founding Team</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <p className="text-white/90 text-sm mb-6 italic">&quot;{t.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-white/70 text-xs">{t.role} · {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### `components/FAQ.tsx`

```typescript
"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is NEST?",
    a: "A fractional real estate investment product that lets you co-own rental properties through Nulo Africa's trust infrastructure.",
  },
  {
    q: "What's the minimum investment?",
    a: "₦500,000 per property pool.",
  },
  {
    q: "How do I receive my income?",
    a: "Annual payouts directly to your verified Nigerian bank account.",
  },
  {
    q: "Is this regulated?",
    a: "NEST operates under a legal Trust deed structure. Full compliance documentation is available on request.",
  },
  {
    q: "What if tenants don't pay?",
    a: "Nulo Africa's escrow model and AI tenant screening protect investors. Rental guarantees are part of NEST's trust model.",
  },
  {
    q: "Can diaspora Nigerians invest?",
    a: "Yes. NEST supports diaspora participation with USD/GBP conversion options at point of investment.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            Common Questions
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Everything you need to know
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all duration-300 ${
                open === i ? "border-l-4 border-l-nulo-primary bg-nulo-soft-orange border-nulo-border" : "bg-white border-nulo-border"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-5 flex justify-between items-center"
              >
                <span className="font-semibold text-nulo-text">{faq.q}</span>
                <span className={`text-nulo-primary transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  open === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-5 pb-5 text-nulo-text-muted text-sm">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

#### `components/FinalCTA.tsx`

```typescript
export default function FinalCTA() {
  return (
    <section className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8 border-t border-nulo-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mb-4">
          Ready to own your first piece of Nigeria?
        </h2>
        <p className="text-nulo-text-muted mb-8 max-w-xl mx-auto">
          Join thousands building wealth through property — without the ₦90M price tag.
        </p>
        <a
          href="#waitlist"
          className="inline-block bg-gradient-to-br from-nulo-primary via-nulo-primary-mid to-nulo-primary-dark text-white rounded-full px-8 py-4 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Claim Your Waitlist Spot
        </a>
      </div>
    </section>
  );
}
```

#### `components/WaitlistForm.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  investor_type: string;
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    investor_type: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ position: number; referral_code: string } | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferredBy(ref);
  }, []);

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!/^(\+234|0)[0-9]{10}$/.test(formData.phone)) newErrors.phone = "Valid Nigerian phone required";
    if (!formData.city) newErrors.city = "Please select a city";
    if (!formData.investor_type) newErrors.investor_type = "Please select an investor type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referred_by: referredBy }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setServerError("This email is already on the waitlist.");
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setSuccess({ position: data.position, referral_code: data.referral_code });
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const referralLink = success ? `${window.location.origin}?ref=${success.referral_code}` : "";

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-nulo-border p-8 text-center shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h3 className="font-display text-2xl font-bold text-nulo-text mb-2">You&apos;re on the list!</h3>
        <p className="text-nulo-text-muted mb-1">You are</p>
        <p className="text-5xl font-display font-black text-nulo-primary mb-1">#{success.position}</p>
        <p className="text-nulo-text-muted mb-6">on the NEST waitlist</p>

        <div className="bg-nulo-soft-orange rounded-xl p-4 mb-6">
          <p className="text-sm text-nulo-text-secondary mb-2 font-semibold">Your referral link</p>
          <p className="text-sm text-nulo-primary font-mono break-all mb-3">{referralLink}</p>
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="bg-nulo-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-nulo-primary-mid transition-colors"
          >
            Copy Link
          </button>
        </div>

        <p className="text-sm text-nulo-text-muted">
          🚀 Refer <strong>5 friends</strong> → Get <strong>priority access</strong> before public launch
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-nulo-border p-8 max-w-xl mx-auto">
      {referredBy && (
        <div className="bg-nulo-soft-orange border border-orange-200 rounded-xl px-4 py-2 text-sm text-nulo-primary mb-6">
          🎉 You were referred by a NEST member. You&apos;ll both get priority access.
        </div>
      )}

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text placeholder:text-nulo-text-muted focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition"
            placeholder="Jane Doe"
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text placeholder:text-nulo-text-muted focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition"
            placeholder="jane@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text placeholder:text-nulo-text-muted focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition"
            placeholder="08012345678"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-nulo-text-secondary mb-1">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition bg-white"
            >
              <option value="">Select...</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Port Harcourt">Port Harcourt</option>
              <option value="Other">Other</option>
              <option value="Diaspora">Diaspora</option>
            </select>
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-nulo-text-secondary mb-1">Investor Type</label>
            <select
              name="investor_type"
              value={formData.investor_type}
              onChange={handleChange}
              className="w-full border border-nulo-border rounded-xl px-4 py-3 text-nulo-text focus:outline-none focus:ring-2 focus:ring-nulo-primary focus:border-transparent transition bg-white"
            >
              <option value="">Select...</option>
              <option value="first_time">First-Time Investor</option>
              <option value="existing_landlord">Existing Landlord</option>
              <option value="diaspora">Diaspora Investor</option>
            </select>
            {errors.investor_type && <p className="text-red-500 text-sm mt-1">{errors.investor_type}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-xl py-4 font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </button>
      </form>
    </div>
  );
}
```

#### `components/Footer.tsx`

```typescript
export default function Footer() {
  return (
    <footer className="bg-nulo-text text-white py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-center">
        <div>
          <h3 className="font-display font-bold text-xl text-white">
            NEST <span className="text-sm font-body text-white/60">by Nulo Africa</span>
          </h3>
          <p className="text-white/60 text-sm mt-1">Building trust in the rental economy.</p>
        </div>

        <div className="flex justify-center gap-6 text-sm text-white/80">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>

        <div className="text-center md:text-right text-white/40 text-sm">
          © 2025 Nulo Africa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

### 6. `app/page.tsx`

```typescript
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Returns from "@/components/Returns";
import TrustLayer from "@/components/TrustLayer";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Returns />
      <TrustLayer />
      <SocialProof />
      <FAQ />
      <FinalCTA />

      <section id="waitlist" className="bg-nulo-soft-orange py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
              Join The Waitlist
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2 max-w-2xl mx-auto">
              Your first share of Nigerian real estate is one step away.
            </h2>
            <p className="text-nulo-text-muted mt-4 max-w-xl mx-auto">
              Join thousands of Nigerians building wealth through property — without the ₦90M price tag.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
```

### 7. `app/api/waitlist/join/route.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { full_name, email, phone, city, investor_type, referred_by } = body;

  if (!full_name || !email || !phone || !city || !investor_type) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Duplicate check
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  // Insert
  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      full_name,
      email,
      phone,
      city,
      investor_type,
      referred_by: referred_by || null,
    })
    .select("waitlist_position, referral_code")
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  // Confirmation email
  const resend = new Resend(process.env.RESEND_API_KEY);
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${data.referral_code}`;

  await resend.emails.send({
    from: "NEST by Nulo <nest@nuloafrica.com>",
    to: email,
    subject: `You're #${data.waitlist_position} on the NEST waitlist 🎉`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #FF6600; font-size: 28px; margin-bottom: 8px;">Welcome to NEST, ${full_name.split(" ")[0]}!</h1>
        <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">
          You're officially on the list. Here's your spot:
        </p>
        <div style="background: #FFF7ED; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #475569; margin: 0 0 4px 0; font-size: 14px;">Your waitlist position</p>
          <p style="color: #FF6600; font-size: 48px; font-weight: 900; margin: 0;">#${data.waitlist_position}</p>
        </div>
        <p style="color: #334155; font-size: 15px; margin-bottom: 8px;"><strong>Your referral link:</strong></p>
        <p style="background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 13px; color: #FF6600; word-break: break-all; margin-bottom: 24px;">${referralLink}</p>
        <p style="color: #475569; font-size: 14px;">Refer <strong>5 friends</strong> to get priority access before public launch. 🚀</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 12px;">NEST by Nulo Africa · Building trust in the rental economy</p>
      </div>
    `,
  });

  return Response.json({
    success: true,
    position: data.waitlist_position,
    referral_code: data.referral_code,
  });
}
```

### 8. Supabase SQL Schema

Run this in your Supabase SQL Editor:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  investor_type TEXT CHECK (investor_type IN ('first_time', 'existing_landlord', 'diaspora')) NOT NULL,
  referral_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  referred_by TEXT REFERENCES waitlist(referral_code),
  referral_count INTEGER DEFAULT 0,
  waitlist_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-assign sequential waitlist position on insert
CREATE SEQUENCE waitlist_position_seq;

CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.waitlist_position := nextval('waitlist_position_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_waitlist_position
BEFORE INSERT ON waitlist
FOR EACH ROW EXECUTE FUNCTION assign_waitlist_position();

-- Increment referral count on the referrer's row when someone joins via their link
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE waitlist SET referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_referral_join
AFTER INSERT ON waitlist
FOR EACH ROW EXECUTE FUNCTION increment_referral_count();
```

### 9. `.env.local` Template

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_BASE_URL=https://nest.nuloafrica.com
```