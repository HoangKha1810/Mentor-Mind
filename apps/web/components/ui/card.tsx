'use client';

import { HTMLAttributes } from 'react';
import { HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { motionDuration, motionEase, motionSpring } from '@/lib/motion-system';

type CardProps = HTMLMotionProps<'div'> & {
  interactive?: boolean;
  reveal?: boolean;
};

export function Card({ className, interactive = false, reveal = false, ...props }: CardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reveal && !reduceMotion ? { opacity: 0, y: 12 } : false}
      whileInView={reveal ? { opacity: 1, y: 0 } : undefined}
      whileHover={interactive ? { y: -3, scale: 1.002 } : undefined}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -40px' }}
      transition={
        interactive
          ? motionSpring.interaction
          : { duration: motionDuration.standard, ease: motionEase.standard }
      }
      className={cn(
        'dashboard-surface glass relative overflow-hidden rounded-xl p-5 shadow-soft transition-[background-color,border-color,box-shadow] duration-300 hover:border-secondary/25 hover:bg-white/[0.045]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold tracking-normal text-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-6 text-mutedText', className)} {...props} />;
}
