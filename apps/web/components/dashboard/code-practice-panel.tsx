'use client';

import Link from 'next/link';
import { Code2, History } from 'lucide-react';
import { CodeProblem, CodeSubmission } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function CodePracticePanel({ requireAuth = false }: { requireAuth?: boolean }) {
  const problems = useLiveQuery<CodeProblem[]>('/code/problems');
  const submissions = useLiveQuery<CodeSubmission[]>('/code/submissions/me', { auth: true });

  if (problems.loading) return <LoadingCard label="Đang tải bài luyện code..." />;
  if (problems.error) return <ErrorCard message={problems.error} onRetry={problems.reload} />;
  if (!problems.data?.length) {
    return (
      <EmptyState
        title="Chưa có bài code đã publish"
        description="Admin cần tạo và publish bài code trước khi học viên có thể luyện tập."
      />
    );
  }

  const accepted = new Set(
    submissions.data
      ?.filter((submission) => submission.verdict === 'ACCEPTED')
      .map((submission) => submission.problem?.slug),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/dashboard/code-practice/submissions">
          <Button variant="outline">
            <History className="h-4 w-4" />
            Lịch sử nộp bài
          </Button>
        </Link>
      </div>
      {requireAuth && submissions.unauthenticated ? (
        <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          Đăng nhập để nộp bài, lưu lịch sử và nhận gợi ý AI.
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {problems.data.map((problem) => (
          <Card key={problem.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={problem.difficulty} />
                <Badge>{problem.category}</Badge>
              </div>
              <Badge>{accepted.has(problem.slug) ? 'Đã giải' : 'Chưa giải'}</Badge>
            </div>
            <CardHeader className="mt-3">
              <CardTitle>{problem.title}</CardTitle>
              <CardDescription>
                {problem.timeLimitMs ? `${problem.timeLimitMs}ms` : 'Có bộ test'} ·{' '}
                {problem.memoryLimitMb ? `${problem.memoryLimitMb}MB` : 'Giới hạn bộ nhớ'}
              </CardDescription>
            </CardHeader>
            <Link href={`/dashboard/code-practice/${problem.slug}`}>
              <Button>
                <Code2 className="h-4 w-4" />
                Mở bài
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CodeSubmissionsPanel() {
  const query = useLiveQuery<CodeSubmission[]>('/code/submissions/me', { auth: true });

  if (query.unauthenticated) {
    return (
      <EmptyState
        title="Cần đăng nhập"
        description="Đăng nhập để xem lịch sử nộp bài của tài khoản."
        actionHref="/login"
        actionLabel="Đăng nhập"
      />
    );
  }
  if (query.loading) return <LoadingCard label="Đang tải lịch sử nộp bài..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="Chưa có bài nộp"
        description="Mở một bài code, chạy thử và nộp lời giải để lưu lịch sử thật."
        actionHref="/dashboard/code-practice"
        actionLabel="Mở luyện code"
      />
    );
  }

  return (
    <div className="space-y-4">
      {query.data.map((submission) => (
        <Card key={submission.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardHeader>
              <CardTitle>{submission.problem?.title ?? 'Bài code'}</CardTitle>
              <CardDescription>{formatDateTime(submission.createdAt)}</CardDescription>
            </CardHeader>
            <StatusBadge value={submission.verdict} />
          </div>
          <p className="text-sm text-mutedText">
            Passed {submission.passedTests}/{submission.totalTests}
            {submission.runtimeMs ? ` · ${submission.runtimeMs}ms` : ''}
            {submission.memoryKb ? ` · ${submission.memoryKb}KB` : ''}
          </p>
          {submission.errorMessage ? (
            <pre className="mt-3 overflow-auto rounded-md border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
              {submission.errorMessage}
            </pre>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
