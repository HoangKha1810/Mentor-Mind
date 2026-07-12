'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { motionDuration, motionEase } from '@/lib/motion-system';

type CircularProgressProps = {
  value: number | null;
  label: string;
  valueText?: string;
  className?: string;
};

export function CircularProgress({ value, label, valueText, className }: CircularProgressProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const hasValue = typeof value === 'number' && Number.isFinite(value);
  const normalizedValue = hasValue ? Math.min(100, Math.max(0, value)) : 0;
  const roundedValue = Math.round(normalizedValue);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={hasValue ? roundedValue : undefined}
      aria-valuetext={valueText ?? (hasValue ? `${roundedValue}%` : 'Chưa có dữ liệu')}
      className={cn('relative h-28 w-28 shrink-0', className)}
    >
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="56"
          cy="56"
          r="47"
          fill="none"
          stroke="rgb(var(--color-foreground) / 0.08)"
          strokeWidth="9"
        />
        <motion.circle
          cx="56"
          cy="56"
          r="47"
          fill="none"
          pathLength={1}
          stroke="rgb(var(--color-secondary))"
          strokeWidth="9"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0.45 }}
          animate={{ pathLength: normalizedValue / 100, opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0 : motionDuration.reveal,
            ease: motionEase.expressive,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-semibold text-foreground">
          {hasValue ? `${roundedValue}%` : '--'}
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-mutedText">{label}</span>
      </div>
    </div>
  );
}
