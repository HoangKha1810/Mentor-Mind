'use client';

import { CheckCheck } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { NotificationItem } from '@/lib/domain-types';
import { formatDateTime, formatStatus } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function NotificationsList() {
  const query = useLiveQuery<NotificationItem[]>('/notifications/me', { auth: true });

  async function markRead(id: string) {
    await apiFetch(`/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    query.reload();
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải thông báo của tài khoản..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="Chưa có thông báo"
        description="Khi lộ trình được duyệt, lịch học được tạo, bài tập được giao hoặc thanh toán đổi trạng thái, thông báo sẽ xuất hiện tại đây."
      />
    );
  }

  return (
    <div className="space-y-4">
      {query.data.map((notification) => (
        <Card key={notification.id} className={!notification.readAt ? 'border-secondary/40' : undefined}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusBadge value={notification.type} />
                {!notification.readAt ? <StatusBadge value="OPEN" /> : <StatusBadge value="CLOSED" />}
              </div>
              <CardHeader className="mb-2">
                <CardTitle>{notification.title}</CardTitle>
                <CardDescription>{notification.message}</CardDescription>
              </CardHeader>
              <p className="text-xs text-mutedText">
                {formatDateTime(notification.createdAt)}
                {notification.readAt ? ` · Đã đọc ${formatDateTime(notification.readAt)}` : ''}
              </p>
            </div>
            {!notification.readAt ? (
              <Button variant="outline" onClick={() => markRead(notification.id)}>
                <CheckCheck className="h-4 w-4" />
                Đánh dấu đã đọc
              </Button>
            ) : (
              <span className="text-sm text-mutedText">{formatStatus('CLOSED')}</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
