'use client';

import { PointerEvent, ReactNode, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import { motionSpring } from '@/lib/motion-system';

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowingCard({ children, className = '' }: GlowingCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(-500);
  const pointerY = useMotionValue(-500);
  const spotlightOpacity = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${pointerX}px ${pointerY}px, rgba(0, 212, 255, 0.14), transparent 42%)`;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !boundsRef.current) return;
    const rect = boundsRef.current;
    pointerX.set(event.clientX - rect.left);
    pointerY.set(event.clientY - rect.top);
  };

  const showSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    if (!reduceMotion && event.pointerType === 'mouse' && containerRef.current) {
      boundsRef.current = containerRef.current.getBoundingClientRect();
      spotlightOpacity.set(1);
    }
  };

  const hideSpotlight = () => {
    boundsRef.current = null;
    spotlightOpacity.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={showSpotlight}
      onPointerLeave={hideSpotlight}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.006 }}
      transition={motionSpring.interaction}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-soft backdrop-blur-md transition-colors hover:bg-white/[0.04] ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{ opacity: spotlightOpacity, background: spotlight }}
      />
      <div className="relative h-full w-full">{children}</div>
    </motion.div>
  );
}
