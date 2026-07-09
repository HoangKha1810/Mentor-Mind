'use client';

import { FormEvent, useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { CvReview } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, EmptyState, ErrorCard, JsonBlock, LoadingCard } from './live-common';

export function CvReviewPanel() {
  const query = useLiveQuery<CvReview[]>('/ai/cv-review/me', { auth: true });
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/ai/cv-review', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          cvText: form.get('cvText'),
          jdText: form.get('jdText'),
          targetRole: form.get('targetRole') || 'Software Developer',
          portfolioUrl: empty(form.get('portfolioUrl')),
          githubUrl: empty(form.get('githubUrl')),
        }),
      });
      setMessage('Đã tạo phân tích CV mới.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không phân tích được CV');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Phân tích CV theo JD</CardTitle>
          <CardDescription>
            Dán CV và JD để AI đánh giá độ phù hợp, keyword còn thiếu và các điểm nên sửa.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input name="targetRole" placeholder="Vai trò mục tiêu" required />
          <Textarea name="cvText" placeholder="Dán nội dung CV của bạn" required className="min-h-44" />
          <Textarea name="jdText" placeholder="Dán JD hoặc mô tả công việc" className="min-h-36" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="portfolioUrl" placeholder="Portfolio URL" />
            <Input name="githubUrl" placeholder="GitHub URL" />
          </div>
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <Button>
            <Sparkles className="h-4 w-4" />
            Phân tích CV
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {query.loading ? <LoadingCard label="Đang tải lịch sử phân tích CV..." /> : null}
        {query.error ? <ErrorCard message={query.error} onRetry={query.reload} /> : null}
        {!query.loading && !query.error && query.data?.length === 0 ? (
          <EmptyState
            title="Chưa có phân tích CV"
            description="Sau khi gửi CV/JD, kết quả phân tích theo tài khoản sẽ xuất hiện tại đây."
          />
        ) : null}
        {query.data?.map((review) => (
          <Card key={review.id}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary" />
                <p className="font-medium text-white">Điểm tổng quan: {review.overallScore}/100</p>
              </div>
              <span className="text-xs text-mutedText">{formatDateTime(review.createdAt)}</span>
            </div>
            <JsonBlock value={review.result} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function empty(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? text : undefined;
}
