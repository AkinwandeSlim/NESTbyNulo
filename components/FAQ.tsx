"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

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
        <Reveal className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            Common Questions
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            Everything you need to know
          </h2>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal
              key={i}
              delay={((i + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
              className={`rounded-2xl border transition-all duration-300 ${
                open === i ? "border-l-4 border-l-nulo-primary bg-nulo-soft-orange border-nulo-border" : "bg-white border-nulo-border hover:border-nulo-primary/40"
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
