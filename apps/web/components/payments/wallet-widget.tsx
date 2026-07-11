'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@mentormind/shared';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Wallet } from 'lucide-react';
import { WalletSummary } from '@/lib/domain-types';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';

type WalletUpdatedEvent = CustomEvent<{
  wallet?: WalletSummary;
}>;

export function WalletWidget() {
  const reduceMotion = useReducedMotion();
  const query = useLiveQuery<WalletSummary>('/payments/wallet', { auth: true });
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const previousBalanceRef = useRef<number | null>(null);
  const reloadRef = useRef(query.reload);

  useEffect(() => {
    reloadRef.current = query.reload;
  }, [query.reload]);

  useEffect(() => {
    if (!query.data) return;
    setWallet(query.data);
  }, [query.data]);

  useEffect(() => {
    if (!wallet) return;
    const previous = previousBalanceRef.current;
    if (previous !== null && wallet.balance !== previous) {
      setDelta(wallet.balance - previous);
      const timeout = window.setTimeout(() => setDelta(null), 2400);
      previousBalanceRef.current = wallet.balance;
      return () => window.clearTimeout(timeout);
    }
    previousBalanceRef.current = wallet.balance;
  }, [wallet]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') reloadRef.current();
    }, 20000);
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') reloadRef.current();
    };
    const refreshFromEvent = (event: Event) => {
      const detail = (event as WalletUpdatedEvent).detail;
      if (detail?.wallet) {
        setWallet(detail.wallet);
      }
      reloadRef.current();
    };

    document.addEventListener('visibilitychange', refreshOnFocus);
    window.addEventListener('mentormind:wallet-refresh', refreshFromEvent);
    window.addEventListener('mentormind:wallet-updated', refreshFromEvent);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshOnFocus);
      window.removeEventListener('mentormind:wallet-refresh', refreshFromEvent);
      window.removeEventListener('mentormind:wallet-updated', refreshFromEvent);
    };
  }, []);

  if (query.unauthenticated) return null;

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? 'VND';

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.055] p-2 shadow-[0_18px_55px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:border-secondary/[0.28]">
        <div className="hidden min-h-10 items-center gap-2 rounded-full bg-black/20 px-4 text-sm font-semibold text-slate-100 sm:flex">
          <Wallet className="h-4 w-4 text-secondary" />
          <motion.span
            key={`${currency}-${balance}`}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="tabular-nums"
          >
            {query.loading && !wallet ? 'Đang tải ví...' : formatCurrency(balance, currency)}
          </motion.span>
        </div>
        <Link href="/dashboard/payments/top-up">
          <Button type="button" size="md" className="h-11 px-5">
            <Plus className="h-4 w-4" />
            Nạp
          </Button>
        </Link>
      </div>

      <AnimatePresence>
        {delta !== null ? (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: 8, opacity: 0, scale: 0.9 }}
            animate={{ y: -8, opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: -18, opacity: 0, scale: 0.92 }}
            className={`pointer-events-none absolute right-3 top-full mt-2 rounded-full border px-3 py-1 text-xs font-bold shadow-soft ${
              delta >= 0
                ? 'border-success/30 bg-success/15 text-green-100'
                : 'border-red-300/30 bg-red-500/15 text-red-100'
            }`}
          >
            {delta >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(delta), currency)}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
