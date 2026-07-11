'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatStatus } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthRequiredCard({ message = 'Đăng nhập để xem dữ liệu của tài khoản này.' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cần đăng nhập</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <Link href="/login">
        <Button>Đăng nhập</Button>
      </Link>
    </Card>
  );
}

export function LoadingCard({ label = 'Đang tải dữ liệu thật từ tài khoản...' }) {
  return (
    <Card interactive={false} reveal={false} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)]">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </Card>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-white">Không tải được dữ liệu</p>
            <p className="mt-1 text-sm leading-6 text-mutedText">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </Card>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  return <Badge>{formatStatus(value)}</Badge>;
}

export function JsonBlock({ value }: { value: unknown }) {
  if (!value) return null;
  return (
    <pre className="mt-3 max-h-80 overflow-auto rounded-md border border-white/8 bg-black/20 p-3 text-xs leading-6 text-slate-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
