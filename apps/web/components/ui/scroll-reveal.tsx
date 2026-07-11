'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import { motionDistance, motionDuration, motionEase } from '@/lib/motion-system';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const directionOffset = {
    up: { y: motionDistance.reveal, x: 0 },
    down: { y: -motionDistance.reveal, x: 0 },
    left: { x: motionDistance.reveal, y: 0 },
    right: { x: -motionDistance.reveal, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, ...directionOffset[direction] }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.18, margin: '0px 0px -48px' }}
      transition={{
        duration: reduceMotion ? 0 : motionDuration.reveal,
        delay: reduceMotion ? 0 : Math.min(delay, 0.32),
        ease: motionEase.expressive,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
