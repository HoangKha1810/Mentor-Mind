import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'border-primary/60 bg-primary px-5 text-white shadow-glow hover:bg-primary/90',
        variant === 'secondary' &&
          'border-secondary/50 bg-secondary/12 px-5 text-secondary hover:bg-secondary/18',
        variant === 'ghost' && 'border-transparent bg-transparent px-4 text-slate-200 hover:bg-white/8',
        variant === 'outline' &&
          'border-white/12 bg-white/[0.03] px-5 text-slate-100 hover:bg-white/[0.07]',
        size === 'sm' && 'h-9 text-sm',
        size === 'md' && 'h-11 text-sm',
        size === 'lg' && 'h-12 text-base',
        size === 'icon' && 'h-10 w-10 p-0',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
