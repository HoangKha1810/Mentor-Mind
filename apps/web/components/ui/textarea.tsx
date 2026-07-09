import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-28 w-full rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-500 hover:border-white/20 focus:-translate-y-0.5 focus:border-success/60 focus:bg-white/[0.075] focus:ring-4 focus:ring-success/15',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
