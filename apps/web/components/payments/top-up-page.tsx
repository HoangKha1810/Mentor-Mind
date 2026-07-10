'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@mentormind/shared';
import { ArrowRight, CreditCard, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { WalletSummary } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { cn } from '@/lib/utils';
import { AuthRequiredCard, ErrorCard, LoadingCard } from '@/components/dashboard/live-common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type TopUpResponse = {
  checkoutUrl?: string;
};

const presets = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];

export function TopUpPage() {
  const walletQuery = useLiveQuery<WalletSummary>('/payments/wallet', { auth: true });
  const [amount, setAmount] = useState('200000');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const numericAmount = useMemo(() => Number(amount.replace(/[^\d]/g, '')), [amount]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

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

  if (walletQuery.unauthenticated) return <AuthRequiredCard />;
  if (walletQuery.loading && !walletQuery.data) return <LoadingCard label="Đang tải ví..." />;
  if (walletQuery.error)
    return <ErrorCard message={walletQuery.error} onRetry={walletQuery.reload} />;

  const wallet = walletQuery.data;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#57b846,#00d4ff)]" />
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/12 text-secondary">
            <CreditCard className="h-6 w-6" />
          </div>
          <CardTitle>Nạp tiền qua PayOS</CardTitle>
          <CardDescription>
            Chọn số tiền, chuyển sang PayOS để thanh toán. Khi webhook xác nhận, số dư ví sẽ tự cập
            nhật và thanh ví có animation cộng tiền.
          </CardDescription>
        </CardHeader>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-200">Chọn nhanh</label>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98]',
                    numericAmount === preset
                      ? 'border-secondary/45 bg-secondary/12 text-secondary'
                      : 'border-white/10 bg-white/[0.035] text-slate-200 hover:border-white/20 hover:bg-white/[0.06]',
                  )}
                >
                  {formatCurrency(preset, 'VND')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-200">Số tiền khác</label>
            <Input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              placeholder="Nhập số tiền VND"
              className="mt-3"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-mutedText">Số tiền sẽ nạp</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {formatCurrency(Number.isFinite(numericAmount) ? numericAmount : 0, 'VND')}
                </p>
              </div>
              <Badge className="gap-1.5 border-success/30 bg-success/10 text-green-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                PayOS bảo mật
              </Badge>
            </div>
            {wallet?.pendingTopUp ? (
              <p className="mt-3 text-sm text-warning">
                Đang chờ xác nhận: {formatCurrency(wallet.pendingTopUp, wallet.currency)}
              </p>
            ) : null}
            {message ? <p className="mt-3 text-sm text-warning">{message}</p> : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Thanh toán qua PayOS
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/pricing">
              <Button type="button" variant="outline">
                Xem gói sử dụng
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      <aside className="space-y-5">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-mutedText">Số dư hiện tại</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(wallet?.balance ?? 0, wallet?.currency ?? 'VND')}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader className="p-0">
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>
              Ví dùng để mua gói, mở khóa bài code đặc biệt và nạp PayOS.
            </CardDescription>
          </CardHeader>
          <div className="mt-4 space-y-3">
            {wallet?.transactions.length ? (
              wallet.transactions.slice(0, 8).map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      className={
                        transaction.type === 'CREDIT'
                          ? 'border-success/30 bg-success/10 text-green-100'
                          : 'border-secondary/30 bg-secondary/10 text-secondary'
                      }
                    >
                      {transaction.type === 'CREDIT' ? 'Cộng tiền' : 'Trừ tiền'}
                    </Badge>
                    <span className="text-sm font-semibold text-white">
                      {transaction.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-mutedText">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-white/12 p-3 text-sm leading-6 text-mutedText">
                Chưa có giao dịch ví.
              </p>
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}
