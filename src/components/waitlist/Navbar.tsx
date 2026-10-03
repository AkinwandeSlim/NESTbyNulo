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

  // Hero is light, so the navbar is always light. We still add a subtle
  // shadow + tighter backdrop once the user scrolls past the hero.
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-nulo-border shadow-sm"
          : "bg-nulo-ivory/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-2xl text-nulo-primary">
            NEST
          </span>
          <span className="text-sm text-nulo-text-muted">by Nulo</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-nulo-text-secondary hover:text-nulo-primary transition-colors">
            How It Works
          </a>
          <a href="#returns" className="text-sm font-medium text-nulo-text-secondary hover:text-nulo-primary transition-colors">
            Returns
          </a>
          <a href="#faq" className="text-sm font-medium text-nulo-text-secondary hover:text-nulo-primary transition-colors">
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
