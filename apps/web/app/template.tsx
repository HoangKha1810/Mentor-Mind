'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { motionDistance, motionDuration, motionEase } from '@/lib/motion-system';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: motionDistance.page }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? motionDuration.instant : motionDuration.page,
        ease: motionEase.standard,
      }}
    >
      {children}
    </motion.div>
  );
}
