import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm text-foreground outline-none transition duration-200 placeholder:text-mutedText hover:border-white/20 focus:-translate-y-0.5 focus:border-success/60 focus:bg-white/[0.075] focus:ring-4 focus:ring-success/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
