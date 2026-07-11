'use client';

import { MotionConfig } from 'framer-motion';
import { ReactNode } from 'react';
import { motionDuration, motionEase } from '@/lib/motion-system';

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: motionDuration.standard, ease: motionEase.standard }}
    >
      {children}
    </MotionConfig>
  );
}
