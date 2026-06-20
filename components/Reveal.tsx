"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Variant = "fade-up" | "blur" | "scale";

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  as?: "div" | "section" | "article" | "li" | "span";
  id?: string;
}

const hiddenByVariant = {
  "fade-up": { opacity: 0, y: 28 },
  blur: { opacity: 0, y: 18, filter: "blur(10px)" },
  scale: { opacity: 0, scale: 0.96, y: 12 },
} as const;

const visibleByVariant = {
  "fade-up": { opacity: 1, y: 0 },
  blur: { opacity: 1, y: 0, filter: "blur(0px)" },
  scale: { opacity: 1, scale: 1, y: 0 },
} as const;

const delayMap = { 0: 0, 1: 0.08, 2: 0.16, 3: 0.24, 4: 0.32, 5: 0.4, 6: 0.48 } as const;

export default function Reveal({ children, className = "", variant = "fade-up", delay = 0, id }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      initial={shouldReduceMotion ? false : hiddenByVariant[variant]}
      whileInView={shouldReduceMotion ? undefined : visibleByVariant[variant]}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
      transition={shouldReduceMotion ? undefined : { duration: 0.8, delay: delayMap[delay], ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}