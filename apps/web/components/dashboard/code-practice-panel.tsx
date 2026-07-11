'use client';

import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Code2,
  Crown,
  Filter,
  Flame,
  History,
  LockKeyhole,
  Search,
  Trophy,
} from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { CodeProblem, CodeSubmission } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function CodePracticePanel({ requireAuth = false }: { requireAuth?: boolean }) {
  const problems = useLiveQuery<CodeProblem[]>('/code/problems');
  const submissions = useLiveQuery<CodeSubmission[]>('/code/submissions/me', { auth: true });
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả');
  const data = problems.data ?? [];
  const accepted = useMemo(
    () =>
      new Set(
        submissions.data
          ?.filter((submission) => submission.verdict === 'ACCEPTED')
          .map((submission) => submission.problem?.slug),
      ),
    [submissions.data],
  );
  const premiumCount = data.filter((problem) => problem.isPremium).length;
  const categories = useMemo(
    () => ['Tất cả', ...Array.from(new Set(data.map((problem) => problem.category))).slice(0, 12)],
    [data],
  );
  const difficulties = useMemo(
    () => ['Tất cả', ...Array.from(new Set(data.map((problem) => problem.difficulty))).slice(0, 8)],
    [data],
  );
  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return data.filter((problem) => {
      const haystack = [
        problem.title,
        problem.category,
        problem.difficulty,
        Array.isArray(problem.tags) ? problem.tags.join(' ') : String(problem.tags ?? ''),
      ]
        .join(' ')
        .toLowerCase();
      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        (difficulty === 'Tất cả' || problem.difficulty === difficulty) &&
        (category === 'Tất cả' || problem.category === category)
      );
    });
  }, [category, data, difficulty, search]);

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

  return (
    <div className="space-y-5">
      <section className="dashboard-surface overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-soft">
        <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <Flame className="h-3.5 w-3.5" />
              Code lab từ dễ đến siêu khó
            </div>
            <CardHeader className="mb-0 mt-4">
              <CardTitle className="text-2xl">Luyện code theo lộ trình</CardTitle>
              <CardDescription>
                Lọc nhanh bài theo chủ đề, độ khó, trạng thái đã giải và mở khóa bài đặc biệt bằng
                ví/gói học.
              </CardDescription>
            </CardHeader>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/dashboard/code-practice/submissions">
                <Button variant="outline">
                  <History className="h-4 w-4" />
                  Lịch sử nộp bài
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary">
                  <Crown className="h-4 w-4" />
                  Mở toàn bộ bài đặc biệt
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <CodeMetric
              icon={<Code2 className="h-4 w-4" />}
              label="Tổng bài"
              value={String(data.length)}
            />
            <CodeMetric
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Đã accepted"
              value={String(accepted.size)}
            />
            <CodeMetric
              icon={<LockKeyhole className="h-4 w-4" />}
              label="Bài đặc biệt"
              value={String(premiumCount)}
            />
          </div>
        </div>
        <div className="relative z-10 mt-5 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex min-w-max gap-2">
            {data.slice(0, 36).map((problem, index) => (
              <Link
                key={problem.id}
                href={`/dashboard/code-practice/${problem.slug}`}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-semibold transition active:scale-95 ${
                  accepted.has(problem.slug)
                    ? 'border-success/35 bg-success/15 text-success'
                    : problem.isPremium
                      ? 'border-warning/30 bg-warning/12 text-warning'
                      : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-secondary/35 hover:text-secondary'
                }`}
                title={problem.title}
              >
                {index + 1}
              </Link>
            ))}
          </div>
        </div>
      </section>
      {requireAuth && submissions.unauthenticated ? (
        <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          Đăng nhập để nộp bài, lưu lịch sử và nhận gợi ý AI.
        </p>
      ) : null}
      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_0.45fr_0.45fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-mutedText" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
              placeholder="Tìm theo tên bài, tag, chủ đề..."
            />
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger aria-label="Lọc theo độ khó">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === 'Tất cả' ? 'Mọi độ khó' : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Lọc theo chủ đề">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === 'Tất cả' ? 'Mọi chủ đề' : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-mutedText">
          <Filter className="h-4 w-4 text-secondary" />
          Đang hiển thị {filtered.length}/{data.length} bài.
        </p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((problem, index) => (
          <Card key={problem.id} className="flex min-h-[18rem] flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={problem.difficulty} />
                <Badge>{problem.category}</Badge>
                {problem.isPremium ? (
                  <Badge className="gap-1.5 border-secondary/30 bg-secondary/10 text-secondary">
                    <Crown className="h-3.5 w-3.5" />
                    Đặc biệt {formatCurrency(problem.unlockPrice ?? 20_000, 'VND')}
                  </Badge>
                ) : null}
              </div>
              <Badge>{accepted.has(problem.slug) ? 'Đã giải' : 'Chưa giải'}</Badge>
            </div>
            <div className="mt-4 flex h-20 items-center justify-between rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,212,255,0.15),rgba(109,93,254,0.13),rgba(87,184,70,0.14))] px-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-mutedText">
                  Bài {index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{problem.category}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-secondary">
                {accepted.has(problem.slug) ? (
                  <Trophy className="h-5 w-5" />
                ) : (
                  <Code2 className="h-5 w-5" />
                )}
              </div>
            </div>
            <CardHeader className="mt-3">
              <CardTitle>{problem.title}</CardTitle>
              <CardDescription>
                {problem.timeLimitMs ? `${problem.timeLimitMs}ms` : 'Có bộ test'} ·{' '}
                {problem.memoryLimitMb ? `${problem.memoryLimitMb}MB` : 'Giới hạn bộ nhớ'}
              </CardDescription>
            </CardHeader>
            <Link href={`/dashboard/code-practice/${problem.slug}`} className="mt-auto inline-flex">
              <Button variant={problem.isPremium ? 'secondary' : 'primary'}>
                <Code2 className="h-4 w-4" />
                {problem.isPremium ? 'Mở bài đặc biệt' : 'Mở bài'}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CodeMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-mutedText">
        <span className="text-secondary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
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
