import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'motion-field h-12 w-full rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm text-foreground outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-mutedText hover:border-white/20 focus-visible:border-success/60 focus-visible:bg-white/[0.075] focus-visible:ring-4 focus-visible:ring-success/15 disabled:cursor-not-allowed disabled:opacity-55 aria-[invalid=true]:border-danger/70 aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-danger/12',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
