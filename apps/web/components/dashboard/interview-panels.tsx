'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { MessageSquarePlus, Send, SquareCheckBig } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, authHeaders } from '@/lib/api';
import { InterviewQuestion, InterviewSession } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, EmptyState, ErrorCard, JsonBlock, LoadingCard, StatusBadge } from './live-common';

type CreateSessionResponse = {
  session: InterviewSession;
  suggestedQuestions: InterviewQuestion[];
};

export function InterviewOverviewPanel() {
  const query = useLiveQuery<InterviewSession[]>('/ai/interview/sessions/me', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải phiên phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;

  const latest = query.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['TECHNICAL', 'Phỏng vấn kỹ thuật'],
          ['PROJECT_DEFENSE', 'Bảo vệ dự án'],
          ['ENGLISH', 'Phỏng vấn tiếng Anh'],
        ].map(([mode, label]) => (
          <Card key={mode}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>Tạo phiên luyện tập, trả lời từng câu và nhận đánh giá AI.</CardDescription>
            </CardHeader>
            <Link href={`/dashboard/interview/new?mode=${mode}`}>
              <Button>
                <MessageSquarePlus className="h-4 w-4" />
                Bắt đầu
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {!query.data?.length ? (
        <EmptyState
          title="Chưa có phiên phỏng vấn"
          description="Tạo phiên đầu tiên để điểm số và phản hồi được lưu theo tài khoản."
          actionHref="/dashboard/interview/new"
          actionLabel="Bắt đầu phỏng vấn"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {latest.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

export function NewInterviewForm({ initialMode = 'TECHNICAL' }: { initialMode?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await apiFetch<CreateSessionResponse>('/ai/interview/sessions', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          targetRole: form.get('targetRole'),
          level: form.get('level'),
          mode: form.get('mode'),
        }),
      });
      router.push(`/dashboard/interview/${response.session.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tạo được phiên phỏng vấn');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo phiên phỏng vấn mới</CardTitle>
        <CardDescription>
          Session sẽ được lưu trong tài khoản, các câu trả lời sau đó được AI chấm điểm.
        </CardDescription>
      </CardHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input name="targetRole" placeholder="Vai trò mục tiêu" required />
          <Input name="level" placeholder="Level: Intern, Junior..." required />
          <select
            name="mode"
            defaultValue={initialMode}
            className="h-11 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none"
          >
            <option value="TECHNICAL">Kỹ thuật</option>
            <option value="BEHAVIORAL">Hành vi</option>
            <option value="HR">HR</option>
            <option value="PROJECT_DEFENSE">Bảo vệ dự án</option>
            <option value="ENGLISH">Tiếng Anh</option>
            <option value="MIXED">Tổng hợp</option>
          </select>
        </div>
        {message ? <p className="text-sm text-warning">{message}</p> : null}
        <Button>
          <MessageSquarePlus className="h-4 w-4" />
          Tạo và vào phiên
        </Button>
      </form>
    </Card>
  );
}

export function InterviewHistoryPanel() {
  const query = useLiveQuery<InterviewSession[]>('/ai/interview/sessions/me', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải lịch sử phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="Chưa có lịch sử phỏng vấn"
        description="Tạo phiên phỏng vấn đầu tiên để lưu điểm, phản hồi và câu trả lời tốt hơn."
        actionHref="/dashboard/interview/new"
        actionLabel="Bắt đầu phỏng vấn"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {query.data.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

export function InterviewSessionPanel({ id }: { id: string }) {
  const query = useLiveQuery<InterviewSession>(`/ai/interview/sessions/${id}`, { auth: true, deps: [id] });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadQuestions() {
      if (!query.data) return;
      try {
        const params = new URLSearchParams({
          role: query.data.targetRole,
          level: query.data.level,
        });
        setQuestions(await apiFetch<InterviewQuestion[]>(`/interview-questions?${params.toString()}`));
      } catch {
        setQuestions([]);
      }
    }
    void loadQuestions();
  }, [query.data]);

  async function answer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch(`/ai/interview/sessions/${id}/answer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          question: form.get('question'),
          answer: form.get('answer'),
        }),
      });
      event.currentTarget.reset();
      setMessage('Đã lưu câu trả lời và điểm đánh giá AI.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không gửi được câu trả lời');
    }
  }

  async function finish() {
    setMessage('');
    try {
      await apiFetch(`/ai/interview/sessions/${id}/finish`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setMessage('Đã kết thúc phiên phỏng vấn.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không kết thúc được phiên');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải phiên phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const defaultQuestion =
    questions[query.data.answers?.length ?? 0]?.question ??
    questions[0]?.question ??
    `Hãy trình bày một kinh nghiệm quan trọng liên quan đến vị trí ${query.data.targetRole}.`;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardHeader>
            <CardTitle>{query.data.targetRole}</CardTitle>
            <CardDescription>
              {query.data.level} · {formatDateTime(query.data.createdAt)}
            </CardDescription>
          </CardHeader>
          <StatusBadge value={query.data.status} />
        </div>
        <form onSubmit={answer} className="space-y-4">
          <Textarea name="question" defaultValue={defaultQuestion} required />
          <Textarea name="answer" placeholder="Nhập câu trả lời của bạn" required className="min-h-44" />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button>
              <Send className="h-4 w-4" />
              Gửi câu trả lời
            </Button>
            <Button type="button" variant="secondary" onClick={finish}>
              <SquareCheckBig className="h-4 w-4" />
              Kết thúc phiên
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {query.data.answers?.length ? (
          query.data.answers.map((item) => (
            <Card key={item.id}>
              <p className="text-sm font-medium text-white">{item.question}</p>
              <p className="mt-2 text-sm text-mutedText">Điểm: {item.score}/10</p>
              {item.betterAnswer ? (
                <p className="mt-3 text-sm leading-6 text-slate-200">Gợi ý tốt hơn: {item.betterAnswer}</p>
              ) : null}
              <JsonBlock value={item.feedback} />
            </Card>
          ))
        ) : (
          <EmptyState
            title="Chưa có câu trả lời"
            description="Gửi câu trả lời đầu tiên để AI chấm điểm và lưu lịch sử."
          />
        )}
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: InterviewSession }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CardHeader>
          <CardTitle>{session.targetRole}</CardTitle>
          <CardDescription>{formatDateTime(session.createdAt)}</CardDescription>
        </CardHeader>
        <StatusBadge value={session.status} />
      </div>
      <p className="text-sm text-mutedText">
        Mode: {session.mode} · Số câu trả lời: {session.answers?.length ?? 0} · Điểm:{' '}
        {session.overallScore ?? 'Chưa có'}
      </p>
      <Link href={`/dashboard/interview/${session.id}`} className="mt-4 inline-flex">
        <Button variant="outline">Mở phiên</Button>
      </Link>
    </Card>
  );
}
