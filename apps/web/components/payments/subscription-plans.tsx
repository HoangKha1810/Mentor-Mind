'use client';

import Link from 'next/link';
import { formatCurrency, toCurrencyNumber } from '@mentormind/shared';
import { CheckCircle2, Crown, Loader2, Sparkles, Wallet } from 'lucide-react';
import { useRef, useState } from 'react';
import { apiFetch, authHeaders } from '@/lib/api';
import { EntitlementsSummary, SubscriptionPlan, WalletSummary } from '@/lib/domain-types';
import { formatDate } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog-provider';

type PurchaseResponse = {
  wallet?: WalletSummary;
  entitlements?: EntitlementsSummary;
};

export function SubscriptionPlans() {
  const confirm = useConfirmDialog();
  const purchaseLockRef = useRef(false);
  const publicPlans = useLiveQuery<SubscriptionPlan[]>('/payments/plans');
  const entitlements = useLiveQuery<EntitlementsSummary>('/payments/entitlements', { auth: true });
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const plans = entitlements.data?.plans ?? publicPlans.data ?? [];
  const activePlan = entitlements.data?.activePlan;
  const wallet = entitlements.data?.wallet;

  async function purchase(plan: SubscriptionPlan) {
    if (purchaseLockRef.current) return;
    if (!entitlements.data && entitlements.unauthenticated) {
      window.location.href = '/login';
      return;
    }
    const planPrice = toCurrencyNumber(plan.price);
    if (planPrice <= 0) return;
    purchaseLockRef.current = true;
    setConfirmingSlug(plan.slug);
    try {
      const accepted = await confirm({
        title: 'Xác nhận mua gói sử dụng',
        description: `Bạn sắp mua gói “${plan.name}”. Ví MentorMind sẽ bị trừ ${formatCurrency(planPrice, plan.currency)} và quyền sử dụng được kích hoạt sau khi giao dịch thành công.`,
        confirmLabel: 'Xác nhận mua',
        cancelLabel: 'Hủy',
        tone: 'warning',
      });
      if (!accepted) return;

      setConfirmingSlug(null);
      setMessage('');
      setPendingSlug(plan.slug);
      try {
        const response = await apiFetch<PurchaseResponse>(
          `/payments/subscriptions/${plan.slug}/purchase`,
          {
            method: 'POST',
            headers: authHeaders(),
          },
        );
        if (response.wallet) {
          window.dispatchEvent(
            new CustomEvent('mentormind:wallet-updated', { detail: { wallet: response.wallet } }),
          );
        }
        entitlements.reload();
        setMessage(`Đã kích hoạt ${plan.name}. Quyền sử dụng được cập nhật ngay.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Không mua được gói sử dụng.');
      }
    } finally {
      purchaseLockRef.current = false;
      setConfirmingSlug(null);
      setPendingSlug(null);
    }
  }

  if (publicPlans.loading && !plans.length) {
    return (
      <Card>
        <CardDescription>Đang tải bảng giá...</CardDescription>
      </Card>
    );
  }

  if (publicPlans.error && !plans.length) {
    return (
      <Card>
        <CardTitle>Không tải được gói sử dụng</CardTitle>
        <CardDescription>{publicPlans.error}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {entitlements.data ? (
        <Card className="border-secondary/20 bg-secondary/8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-secondary">Gói hiện tại</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{activePlan?.name}</h2>
              <p className="mt-2 text-sm leading-6 text-mutedText">
                AI còn {entitlements.data.usage.aiChatMessagesRemaining}/
                {entitlements.data.usage.aiChatMessagesPerDay} tin hôm nay. Ví hiện có{' '}
                {formatCurrency(wallet?.balance ?? 0, wallet?.currency ?? 'VND')}.
              </p>
            </div>
            {activePlan?.expiresAt ? (
              <Badge className="border-success/30 bg-success/10 text-green-100">
                Hết hạn {formatDate(activePlan.expiresAt)}
              </Badge>
            ) : (
              <Badge>Free</Badge>
            )}
          </div>
        </Card>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-secondary/25 bg-secondary/10 p-4 text-sm font-semibold text-secondary">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan) => {
          const isActive = activePlan?.slug === plan.slug;
          const planPrice = toCurrencyNumber(plan.price);
          const canAfford = (wallet?.balance ?? 0) >= planPrice;
          const isPaid = planPrice > 0;
          return (
            <Card
              key={plan.slug}
              className={cn(
                'flex flex-col',
                isActive ? 'border-secondary/40 bg-secondary/8' : '',
                plan.rank >= 50 ? 'shadow-[0_20px_80px_rgba(0,212,255,0.08)]' : '',
              )}
            >
              <CardHeader className="p-0">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge
                    className={
                      plan.rank >= 20 ? 'border-secondary/30 bg-secondary/10 text-secondary' : ''
                    }
                  >
                    {plan.eyebrow}
                  </Badge>
                  {isActive ? <CheckCircle2 className="h-5 w-5 text-success" /> : null}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <div className="mt-5">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-semibold text-white">
                    {planPrice === 0 ? '0đ' : formatCurrency(planPrice, plan.currency)}
                  </span>
                  <span className="pb-1 text-sm text-mutedText">
                    {plan.interval === 'month' ? '/tháng' : plan.interval === 'year' ? '/năm' : ''}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-200">
                {plan.highlights.map((highlight) => (
                  <div key={highlight} className="flex gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span>{highlight}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Crown className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span>
                    {plan.features.premiumCodeIncluded
                      ? 'Bao gồm toàn bộ bài code đặc biệt'
                      : 'Bài đặc biệt tính 20.000đ/bài'}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6">
                {isActive ? (
                  <Button className="w-full" variant="outline" disabled>
                    Đang sử dụng
                  </Button>
                ) : !isPaid ? (
                  <Link href="/register">
                    <Button className="w-full" variant="outline">
                      Bắt đầu miễn phí
                    </Button>
                  </Link>
                ) : entitlements.unauthenticated ? (
                  <Link href="/login">
                    <Button className="w-full">Đăng nhập để mua</Button>
                  </Link>
                ) : canAfford ? (
                  <Button
                    className="w-full"
                    onClick={() => void purchase(plan)}
                    aria-disabled={Boolean(confirmingSlug || pendingSlug)}
                  >
                    {pendingSlug === plan.slug ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {confirmingSlug === plan.slug ? 'Đang xác nhận...' : 'Mua bằng ví'}
                  </Button>
                ) : (
                  <Link href="/dashboard/payments/top-up">
                    <Button className="w-full">
                      <Wallet className="h-4 w-4" />
                      Nạp tiền để mua
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
