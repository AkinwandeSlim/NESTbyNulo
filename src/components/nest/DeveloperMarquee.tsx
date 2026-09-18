'use client';

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/nest-utils';

const DEVELOPERS = [
  { name: 'JULIUS BERGER NIGERIA', tagline: 'Infrastructure & Construction' },
  { name: 'COSTAIN WEST AFRICA', tagline: 'Building Excellence Since 1948' },
  { name: 'ARM PENSIONS', tagline: 'Real Estate Investment' },
  { name: 'UPDC PLC', tagline: 'Premium Real Estate Development' },
  { name: 'GLOMOBILE', tagline: 'Commercial Property Development' },
  { name: 'BUA CEMENT', tagline: 'Industrial & Residential Projects' },
  { name: 'DANGOTE GROUP', tagline: 'Mixed-Use Developments' },
  { name: 'NIGERIA LNG', tagline: 'Housing & Infrastructure' },
  { name: 'SHELTER AFRIQUE', tagline: 'Affordable Housing Solutions' },
  { name: 'FOUR POINTS', tagline: 'Hospitality & Commercial' },
];

export default function DeveloperMarquee() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-nest-primary/5 via-nest-primary/10 to-nest-primary/5 py-8 border-y border-nest-primary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="size-4 text-nest-primary" />
          <p className="text-xs font-semibold text-nest-primary uppercase tracking-wider">
            Trusted by Nigeria's Leading Developers
          </p>
        </div>
        
        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-8"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {/* First set */}
            {DEVELOPERS.map((dev, i) => (
              <div
                key={`first-${i}`}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-nest-primary/10 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nest-primary/10 text-nest-primary font-bold text-sm">
                  {dev.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{dev.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dev.tagline}</p>
                </div>
              </div>
            ))}
            
            {/* Duplicate for seamless loop */}
            {DEVELOPERS.map((dev, i) => (
              <div
                key={`second-${i}`}
                className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-nest-primary/10 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nest-primary/10 text-nest-primary font-bold text-sm">
                  {dev.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{dev.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dev.tagline}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
