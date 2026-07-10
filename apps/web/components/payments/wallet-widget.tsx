'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@mentormind/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Loader2, Plus, Wallet } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { WalletSummary } from '@/lib/domain-types';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TopUpResponse = {
  checkoutUrl?: string;
};

type WalletUpdatedEvent = CustomEvent<{
  wallet?: WalletSummary;
}>;

export function WalletWidget() {
  const query = useLiveQuery<WalletSummary>('/payments/wallet', { auth: true });
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState('100000');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
    const interval = window.setInterval(() => reloadRef.current(), 4000);
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

  async function submitTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const numericAmount = Number(amount.replace(/[^\d]/g, ''));
    if (!Number.isFinite(numericAmount) || numericAmount < 10_000) {
      setMessage('Số tiền nạp tối thiểu là 10.000đ.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch<TopUpResponse>('/payments/wallet/top-up', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: numericAmount }),
      });
      if (!response.checkoutUrl) {
        throw new Error('Không tạo được link thanh toán PayOS.');
      }
      window.location.href = response.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tạo được link nạp tiền');
      setSubmitting(false);
    }
  }

  if (query.unauthenticated) return null;

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? 'VND';

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-soft">
        <div className="hidden items-center gap-2 rounded-full bg-black/18 px-3 py-1.5 text-xs font-semibold text-slate-100 sm:flex">
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
        <Button type="button" size="sm" onClick={() => setExpanded((current) => !current)}>
          <Plus className="h-4 w-4" />
          Nạp
        </Button>
      </div>

      <AnimatePresence>
        {delta !== null ? (
          <motion.div
            initial={{ y: 8, opacity: 0, scale: 0.9 }}
            animate={{ y: -8, opacity: 1, scale: 1 }}
            exit={{ y: -18, opacity: 0, scale: 0.92 }}
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

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ y: -8, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.96 }}
            className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,88vw)] rounded-xl border border-white/10 bg-[#0b1628] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-secondary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Nạp tiền qua PayOS</p>
                <p className="mt-1 text-xs leading-5 text-mutedText">
                  Sau khi PayOS xác nhận, số dư sẽ tự cộng và có hiệu ứng ngay trên thanh ví.
                </p>
              </div>
            </div>
            <form onSubmit={submitTopUp} className="mt-4 space-y-3">
              <Input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="numeric"
                placeholder="Số tiền VND"
              />
              {wallet?.pendingTopUp ? (
                <p className="text-xs text-warning">
                  Đang chờ xác nhận: {formatCurrency(wallet.pendingTopUp, wallet.currency)}
                </p>
              ) : null}
              {message ? <p className="text-xs text-warning">{message}</p> : null}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Nạp ngay
                </Button>
                <Button type="button" variant="outline" onClick={() => setExpanded(false)}>
                  Đóng
                </Button>
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
