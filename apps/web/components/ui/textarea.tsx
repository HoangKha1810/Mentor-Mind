import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-secondary/60 focus:ring-2 focus:ring-secondary/20',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
