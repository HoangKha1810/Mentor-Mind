'use client';

import { FormEvent, useState } from 'react';
import { LifeBuoy, Send } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { SupportTicket } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function SupportCenter() {
  const query = useLiveQuery<SupportTicket[]>('/support/tickets/me', { auth: true });
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await apiFetch('/support/tickets', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          subject: form.get('subject'),
          message: form.get('message'),
          priority: form.get('priority') || 'MEDIUM',
        }),
      });
      formElement.reset();
      setMessage('Đã gửi yêu cầu hỗ trợ. Admin sẽ xử lý trên hệ thống.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không gửi được yêu cầu hỗ trợ');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Tạo ticket hỗ trợ</CardTitle>
          <CardDescription>
            Gửi vấn đề thật vào hệ thống để admin theo dõi trạng thái và phản hồi.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input name="subject" placeholder="Tiêu đề vấn đề" required />
          <Select name="priority" defaultValue="MEDIUM">
            <SelectTrigger aria-label="Mức độ ưu tiên">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Thấp</SelectItem>
              <SelectItem value="MEDIUM">Vừa</SelectItem>
              <SelectItem value="HIGH">Cao</SelectItem>
              <SelectItem value="URGENT">Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            name="message"
            placeholder="Mô tả chi tiết lỗi, trang đang dùng và điều bạn cần hỗ trợ"
            required
          />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <Button>
            <Send className="h-4 w-4" />
            Gửi ticket
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {query.loading ? <LoadingCard label="Đang tải ticket của tài khoản..." /> : null}
        {query.error ? <ErrorCard message={query.error} onRetry={query.reload} /> : null}
        {!query.loading && !query.error && query.data?.length === 0 ? (
          <EmptyState
            title="Chưa có ticket"
            description="Khi bạn gửi yêu cầu hỗ trợ, ticket sẽ xuất hiện tại đây cùng trạng thái xử lý."
          />
        ) : null}
        {query.data?.map((ticket) => (
          <Card key={ticket.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-secondary" />
                  <h3 className="font-semibold text-white">{ticket.subject}</h3>
                </div>
                <p className="text-sm leading-6 text-mutedText">{ticket.message}</p>
                <p className="mt-3 text-xs text-mutedText">
                  Tạo lúc {formatDateTime(ticket.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={ticket.priority} />
                <StatusBadge value={ticket.status} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
