"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Reveal from "@/components/Reveal";

const PROPERTY_IMAGES = [
  { src: "/abjpic1.jpg", alt: "NEST Pool #001 — Maitama exterior" },
  { src: "/abjpics2.jpg", alt: "NEST Pool #001 — interior" },
  { src: "/abjpic3.jpg", alt: "NEST Pool #001 — view" },
];

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % PROPERTY_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const next = () => setActiveIdx((i) => (i + 1) % PROPERTY_IMAGES.length);
  const prev = () => setActiveIdx((i) => (i - 1 + PROPERTY_IMAGES.length) % PROPERTY_IMAGES.length);

  return (
    <section className="relative bg-nulo-ivory pt-24 md:pt-28 lg:pt-32 pb-20 md:pb-28 lg:pb-36 overflow-hidden">
      {/* Animated gradient blobs — staggered for layered motion */}
      <motion.div
        className="absolute top-10 right-1/4 w-[520px] h-[520px] bg-gradient-to-br from-nulo-primary/35 to-nulo-accent/20 rounded-full blur-2xl pointer-events-none"
        animate={shouldReduceMotion ? undefined : { x: [0, 64, 118, -40, 0], y: [0, -34, 28, 72, 0], scale: [1, 1.12, 0.94, 1.06, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-gradient-to-tr from-nulo-primary/25 to-nulo-accent/15 rounded-full blur-2xl pointer-events-none"
        animate={shouldReduceMotion ? undefined : { x: [0, -92, 54, 0], y: [0, -76, -18, 0], scale: [1, 1.14, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.div
        className="absolute top-24 left-[12%] hidden lg:block w-28 h-28 rounded-[2rem] bg-gradient-to-br from-nulo-primary/12 to-nulo-accent/18 blur-md pointer-events-none"
        animate={shouldReduceMotion ? undefined : { y: [0, -18, 12, 0], rotate: [0, 6, -4, 0], scale: [1, 1.06, 0.98, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
      />
      <motion.div
        className="absolute bottom-24 right-[18%] hidden xl:block w-16 h-16 rounded-[1.5rem] border border-nulo-primary/25 bg-white/20 backdrop-blur-sm pointer-events-none"
        animate={shouldReduceMotion ? undefined : { y: [0, -14, 8, 0], rotate: [0, -8, 6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Dot grid — CSS background, gently pans diagonally */}
      <div
        className="absolute top-20 left-4 lg:left-12 w-[200px] h-[200px] pointer-events-none hidden md:block animate-dot-pan opacity-50"
        style={{
          backgroundImage: "radial-gradient(circle, #FF6600 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
          animationDelay: "-1.1s",
        }}
      />

      {/* Decorative rings — staggered timing for natural depth */}
      <motion.div
        className="absolute bottom-12 right-8 hidden lg:block w-28 h-28 rounded-full border-2 border-dashed border-nulo-primary/40 pointer-events-none"
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 hidden lg:block w-14 h-14 rounded-full border-2 border-nulo-accent/50 pointer-events-none"
        animate={shouldReduceMotion ? undefined : { rotate: -360, scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 0.6 }}
      />
      <motion.div
        className="absolute top-32 right-1/3 hidden md:block w-20 h-20 rounded-full border-2 border-dotted border-nulo-primary/30 pointer-events-none"
        animate={shouldReduceMotion ? undefined : { rotate: 360, y: [0, -10, 0] }}
        transition={{ rotate: { duration: 14, repeat: Infinity, ease: "linear", delay: 1.2 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
      />
      <motion.div
        className="absolute top-[22%] left-[42%] hidden lg:block w-12 h-12 rounded-full border border-nulo-accent/35 pointer-events-none"
        animate={shouldReduceMotion ? undefined : { rotate: -360, x: [0, 8, 0] }}
        transition={{ rotate: { duration: 16, repeat: Infinity, ease: "linear", delay: 0.9 }, x: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.9 } }}
      />

      {/* Filled accents */}
      <div className="absolute top-1/2 right-12 w-10 h-10 rounded-full bg-nulo-primary/15 border-2 border-nulo-primary/40 hidden xl:block pointer-events-none animate-orbit" style={{ animationDelay: "-1s" }} />
      <div className="absolute bottom-[18%] left-[10%] w-8 h-8 rotate-45 rounded-lg bg-nulo-accent/20 border border-nulo-accent/30 hidden lg:block pointer-events-none animate-blob-1" style={{ animationDelay: "-1.3s" }} />

      {/* Moving diagonal grid overlay — CSS-driven pan */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] animate-dot-pan"
        style={{
          backgroundImage:
            "linear-gradient(115deg, #FF6600 1px, transparent 1px), linear-gradient(245deg, #FF6600 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animationDelay: "-0.7s",
        }}
      />

      {/* Floating accent particles — visible pulses */}
      <div className="absolute top-1/3 left-1/3 w-3 h-3 rounded-full bg-nulo-primary/60 blur-sm pointer-events-none hidden md:block animate-shimmer-pulse" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-nulo-accent/70 blur-sm pointer-events-none hidden md:block animate-shimmer-pulse" style={{ animationDelay: "-0.9s" }} />
      <div className="absolute bottom-1/3 left-1/2 w-2.5 h-2.5 rounded-full bg-nulo-primary/50 blur-sm pointer-events-none hidden md:block animate-shimmer-pulse" style={{ animationDelay: "-1.5s" }} />
      <div className="absolute top-[18%] right-[14%] w-2.5 h-2.5 rounded-full bg-nulo-accent/55 blur-sm pointer-events-none hidden lg:block animate-shimmer-pulse" style={{ animationDelay: "-0.5s" }} />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[560px] lg:min-h-[640px]">
          {/* Left column — copy + CTAs */}
          <div className="lg:col-span-7 relative z-10 pt-2">
            <Reveal className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-nulo-border rounded-full px-3 py-1 text-xs font-medium text-nulo-text-secondary mb-5 shadow-sm">
              <span className="relative w-1.5 h-1.5 rounded-full bg-nulo-primary live-pulse" />
              Now onboarding investors for NEST Pool #001
            </Reveal>

            <motion.h1
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-[3.75rem] font-bold text-nulo-text leading-[1.05] mb-6"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={shouldReduceMotion ? undefined : { duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              You don&apos;t need ₦90 million to own property in Abuja.
            </motion.h1>
            <Reveal className="text-lg text-nulo-text-secondary mb-8 max-w-xl leading-relaxed">
              NEST lets you co-own verified rental properties across Nigeria — starting from ₦500,000. Earn rental income every year. No agents. No full purchase.
            </Reveal>

            <Reveal className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href="#waitlist"
                className="bg-nulo-primary hover:bg-nulo-primary-mid text-white rounded-full px-6 py-3.5 font-semibold text-center transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Join the Waitlist →
              </a>
              <a
                href="#how-it-works"
                className="border border-nulo-primary text-nulo-primary hover:bg-nulo-soft-orange rounded-full px-6 py-3.5 font-semibold text-center transition-colors"
              >
                See how it works ↓
              </a>
            </Reveal>

            <Reveal className="flex flex-wrap gap-2 mb-6">
              {["🔒 Escrow-backed", "✅ Verified properties", "🤖 AI-powered", "📊 Transparent reporting"].map((badge) => (
                <span key={badge} className="bg-white/80 backdrop-blur-sm border border-nulo-border rounded-full px-3 py-1 text-xs text-nulo-text-secondary hover:border-nulo-primary/40 hover:bg-white transition-colors">
                  {badge}
                </span>
              ))}
            </Reveal>

            {/* Trust counter */}
            <Reveal className="flex items-center gap-3 pt-4 border-t border-nulo-border/60">
              <div className="flex -space-x-2">
                {["AM", "CB", "TA", "JO"].map((initials, i) => (
                  <div
                    key={initials}
                    className={`w-8 h-8 rounded-full ring-2 ring-nulo-ivory flex items-center justify-center text-[10px] font-bold text-white ${
                      ["bg-nulo-primary", "bg-nulo-primary-mid", "bg-nulo-accent", "bg-nulo-primary-dark"][i]
                    }`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-nulo-text-secondary">
                <span className="font-bold text-nulo-text">1,247 Nigerians</span> already on the waitlist
                <span className="text-nulo-text-muted"> · this week: +184</span>
              </p>
            </Reveal>
          </div>

          {/* Right column — card extends beyond column to the right */}
          <div className="lg:col-span-5 relative hidden md:block">
            {/* Card glow halo */}
            <div className="absolute -inset-8 bg-gradient-to-br from-nulo-primary/30 via-nulo-accent/15 to-transparent rounded-[2rem] blur-3xl pointer-events-none opacity-80 transition-[transform,opacity] duration-300 ease-in-out" />

            {/* The card wrapper — extends right via negative margin on lg */}
            <motion.div
              className="relative lg:-mr-8 xl:-mr-24 z-10 group/hero-card"
              initial={shouldReduceMotion ? false : { opacity: 0, x: 32, y: 18, scale: 0.97 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={shouldReduceMotion ? undefined : { duration: 0.85, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.015 }}
            >
              <div className="relative bg-white rounded-3xl border border-nulo-border overflow-hidden transition-[box-shadow,filter] duration-300 ease-in-out motion-reduce:transition-none shadow-[0_24px_60px_-24px_rgba(15,23,42,0.22)] group-hover/hero-card:shadow-[0_38px_96px_-30px_rgba(194,65,12,0.36)] group-hover/hero-card:brightness-[1.02]">
                {/* Property image carousel */}
                <div
                  className="relative h-56 bg-nulo-soft-orange overflow-hidden group/hero-image"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  {PROPERTY_IMAGES.map((img, i) => (
                    <img
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-700 ease-in-out motion-reduce:transition-none group-hover/hero-card:scale-[1.03] ${
                        i === activeIdx ? "opacity-100" : "opacity-0"
                      }`}
                      draggable={false}
                    />
                  ))}

                  {/* Gradient overlays so text/badges stay legible */}
                  <div className="absolute inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out motion-reduce:transition-none group-hover/hero-card:opacity-[0.06]" />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-nulo-primary">
                      NEST #001
                    </span>
                    <span className="bg-green-500/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  {/* Image counter */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums">
                    {activeIdx + 1} / {PROPERTY_IMAGES.length}
                  </div>

                  {/* Prev / Next arrows */}
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-nulo-text shadow-md flex items-center justify-center opacity-0 group-hover/hero-image:opacity-100 transition-opacity duration-300 ease-in-out"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-nulo-text shadow-md flex items-center justify-center opacity-0 group-hover/hero-image:opacity-100 transition-opacity duration-300 ease-in-out"
                  >
                    ›
                  </button>

                  {/* Bottom address overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs uppercase tracking-wider opacity-80">3-Bed Apartment</p>
                    <p className="font-display text-2xl font-bold">Maitama, Abuja</p>
                  </div>
                </div>

                {/* Dot indicators + thumbnail strip */}
                <div className="px-5 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    {PROPERTY_IMAGES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Show image ${i + 1}`}
                        onClick={() => setActiveIdx(i)}
                        className={`flex-1 h-1.5 rounded-full transition-all ${
                          i === activeIdx ? "bg-nulo-primary" : "bg-nulo-border hover:bg-nulo-primary/40"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Thumbnail strip */}
                  <div className="flex gap-2 mb-4">
                    {PROPERTY_IMAGES.map((img, i) => (
                      <button
                        key={img.src}
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        className={`relative flex-1 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeIdx ? "border-nulo-primary" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-nulo-text-muted">Min share</p>
                      <p className="font-bold text-nulo-text text-sm">₦500K</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-nulo-text-muted">Yield p.a.</p>
                      <p className="font-bold text-nulo-primary text-sm">8.9%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-nulo-text-muted">Total value</p>
                      <p className="font-bold text-nulo-text text-sm">₦90M</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-nulo-text-secondary font-medium">Pool funded</span>
                      <span className="text-nulo-text font-bold">78%</span>
                    </div>
                    <div className="h-2 bg-nulo-soft-orange rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-nulo-primary to-nulo-primary-mid rounded-full" style={{ width: "78%" }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-nulo-border">
                    <div className="flex items-center gap-2 text-xs text-nulo-text-muted">
                      <span className="w-2 h-2 rounded-full bg-nulo-primary" />
                      <span>47 / 60 slots taken</span>
                    </div>
                    <a href="#waitlist" className="text-xs font-bold text-nulo-primary hover:text-nulo-primary-mid">
                      Reserve share →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating yield chip — sits BESIDE the card, not on top */}
            <div className="hidden xl:block absolute -left-10 top-16 bg-white rounded-2xl shadow-xl border border-nulo-border px-4 py-3 rotate-[-4deg] z-20">
              <p className="text-[10px] uppercase tracking-wider text-nulo-text-muted">Projected yield</p>
              <p className="font-display text-2xl font-bold text-nulo-primary">8.9%</p>
              <p className="text-[10px] text-nulo-text-muted">per annum</p>
            </div>

            {/* Floating badge — sits BESIDE the card */}
            <div className="hidden xl:flex absolute -left-6 bottom-20 bg-nulo-text text-white rounded-full shadow-xl px-4 py-2 items-center gap-2 rotate-[3deg] z-20">
              <span className="text-base">🔒</span>
              <span className="text-xs font-semibold">Escrow-backed</span>
            </div>

            {/* Floating review */}
            <div className="hidden xl:flex absolute -right-4 -bottom-6 bg-white rounded-2xl shadow-xl border border-nulo-border px-4 py-3 items-center gap-3 rotate-[2deg] z-20">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-nulo-primary ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">AM</div>
                <div className="w-7 h-7 rounded-full bg-nulo-accent ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">CB</div>
              </div>
              <div>
                <div className="flex text-nulo-accent text-[10px]">★★★★★</div>
                <p className="text-[10px] text-nulo-text-muted">2,847 reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
