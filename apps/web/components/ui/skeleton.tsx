import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'motion-skeleton relative overflow-hidden rounded-lg bg-white/[0.07]',
        className,
      )}
      {...props}
    />
  );
}
