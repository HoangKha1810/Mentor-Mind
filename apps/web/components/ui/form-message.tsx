'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motionDuration, motionEase } from '@/lib/motion-system';
import { cn } from '@/lib/utils';

export function FormMessage({
  message,
  tone = 'error',
  className,
}: {
  message?: string | null;
  tone?: 'error' | 'success';
  className?: string;
}) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {message ? (
        <motion.p
          key={`${tone}-${message}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: motionDuration.fast, ease: motionEase.standard }}
          role={tone === 'error' ? 'alert' : 'status'}
          aria-live={tone === 'error' ? 'assertive' : 'polite'}
          className={cn(
            'mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm',
            tone === 'error'
              ? 'border-danger/20 bg-danger/10 text-red-600 dark:text-red-200'
              : 'border-success/20 bg-success/10 text-green-700 dark:text-green-200',
            className,
          )}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
