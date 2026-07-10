'use client';

import { forwardRef } from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ y: -2, scale: 1.018, filter: 'brightness(1.06)' }}
      whileTap={{ scale: 0.97, y: 0, filter: 'brightness(0.72)' }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full border font-semibold tracking-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-success/30 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'theme-on-color border-transparent bg-[linear-gradient(135deg,#16a34a,#0d9488)] text-white shadow-[0_14px_30px_rgba(22,163,74,0.26)] hover:shadow-[0_18px_42px_rgba(13,148,136,0.34)]',
        variant === 'secondary' &&
          'border-secondary/40 bg-secondary/[0.12] text-secondary shadow-[0_10px_28px_rgba(0,212,255,0.12)] hover:bg-secondary/[0.18]',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-foreground/85 hover:bg-white/[0.08]',
        variant === 'outline' &&
          'border-white/12 bg-white/[0.04] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:bg-white/[0.08]',
        size === 'sm' && 'h-9 px-4 text-xs',
        size === 'md' && 'h-11 px-5 text-sm',
        size === 'lg' && 'h-12 px-7 text-base',
        size === 'icon' && 'h-10 w-10 p-0',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
