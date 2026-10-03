"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const PROPERTY_IMAGES = [
  { src: "/abjpic1.jpg", alt: "NEST Pool #001 — Maitama exterior", width: 1200, height: 800 },
  { src: "/abjpics2.jpg", alt: "NEST Pool #001 — interior", width: 1200, height: 800 },
  { src: "/abjpic3.jpg", alt: "NEST Pool #001 — view", width: 1200, height: 800 },
];

export default function MobilePropertyCard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([false, false, false]);
  const shouldReduceMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % PROPERTY_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const next = () => setActiveIdx((i) => (i + 1) % PROPERTY_IMAGES.length);
  const prev = () => setActiveIdx((i) => (i - 1 + PROPERTY_IMAGES.length) % PROPERTY_IMAGES.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    setPaused(false);
    touchStartX.current = null;
  };

  return (
    <motion.div
      ref={cardRef}
      className="block md:hidden w-full"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative bg-white rounded-2xl border border-nulo-border overflow-hidden shadow-lg shadow-nulo-primary-dark/10 mx-auto max-w-[420px]">
        {/* Image carousel with swipe support */}
        <div
          className="relative aspect-[16/10] bg-nulo-soft-orange overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {PROPERTY_IMAGES.map((img, i) => (
            <motion.div
              key={img.src}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: i === activeIdx ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {!imageLoaded[i] && (
                <div className="absolute inset-0 bg-nulo-soft-orange animate-pulse" />
              )}
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(max-width: 768px) 100vw, 420px"
                quality={75}
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                onLoad={() => {
                  setImageLoaded((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                  });
                }}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded[i] ? "opacity-100" : "opacity-0"
                }`}
                draggable={false}
              />
            </motion.div>
          ))}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-nulo-primary">
              NEST #001
            </span>
            <span className="bg-green-500/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Image counter */}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums z-10">
            {activeIdx + 1} / {PROPERTY_IMAGES.length}
          </div>

          {/* Bottom address overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 text-white z-10">
            <p className="text-[10px] uppercase tracking-wider opacity-80">3-Bed Apartment</p>
            <p className="font-display text-lg font-bold">Maitama, Abuja</p>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 px-4 pt-3">
          {PROPERTY_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActiveIdx(i)}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                i === activeIdx ? "bg-nulo-primary" : "bg-nulo-border"
              }`}
            />
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-nulo-text-muted">Min share</p>
            <p className="font-bold text-nulo-text text-xs">₦500K</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-nulo-text-muted">Yield p.a.</p>
            <p className="font-bold text-nulo-primary text-xs">8.9%</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-nulo-text-muted">Total value</p>
            <p className="font-bold text-nulo-text text-xs">₦90M</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-nulo-text-secondary font-medium">Pool funded</span>
            <span className="text-nulo-text font-bold">78%</span>
          </div>
          <div className="h-1.5 bg-nulo-soft-orange rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-nulo-primary to-nulo-primary-mid rounded-full" style={{ width: "78%" }} />
          </div>
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-nulo-border">
          <div className="flex items-center gap-1.5 text-[10px] text-nulo-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-nulo-primary" />
            <span>47 / 60 slots taken</span>
          </div>
          <a href="#waitlist" className="text-[10px] font-bold text-nulo-primary hover:text-nulo-primary-mid">
            Reserve share →
          </a>
        </div>
      </div>

      {/* Mobile floating chips — stack below card */}
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        <div className="bg-white rounded-full shadow-md border border-nulo-border px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-base">🔒</span>
          <span className="text-[10px] font-semibold text-nulo-text">Escrow-backed</span>
        </div>
        <div className="bg-nulo-primary text-white rounded-full shadow-md px-3 py-1.5 flex items-center gap-1.5">
          <span className="font-display text-xs font-bold">8.9%</span>
          <span className="text-[10px] font-medium opacity-90">yield p.a.</span>
        </div>
      </div>
    </motion.div>
  );
}