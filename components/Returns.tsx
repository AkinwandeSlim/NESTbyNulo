"use client";

import { useState } from "react";
import Reveal from "@/components/reveal";

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
        <Reveal className="text-center mb-12">
          <span className="text-nulo-primary font-semibold tracking-widest text-xs uppercase">
            The Numbers
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nulo-text mt-2">
            What does your return actually look like?
          </h2>
        </Reveal>

        <Reveal variant="scale" className="bg-gradient-to-br from-nulo-soft-orange to-white border border-orange-100 rounded-2xl p-8 shadow-sm noise-texture">
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
        </Reveal>
      </div>
    </section>
  );
}
