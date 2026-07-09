'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarCheck,
  Code2,
  GraduationCap,
  Map,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { apiFetch, authHeaders, ensureAccessToken } from '@/lib/api';
import {
  Account,
  Booking,
  CodeSubmission,
  InterviewSession,
  NotificationItem,
  RoadmapRequest,
} from '@/lib/domain-types';
import { formatDateTime, formatPercent } from '@/lib/format';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

type DashboardPayload = {
  account: Account;
  roadmaps: RoadmapRequest[];
  bookings: Booking[];
  submissions: CodeSubmission[];
  interviews: InterviewSession[];
  notifications: NotificationItem[];
};

function uniqueAcceptedSubmissions(submissions: CodeSubmission[]) {
  return new Set(
    submissions
      .filter((submission) => submission.verdict === 'ACCEPTED')
      .map((submission) => submission.problem?.slug ?? submission.id),
  ).size;
}

function roadmapProgress(roadmaps: RoadmapRequest[]) {
  if (!roadmaps.length) return 0;
  const scoreByStatus: Record<string, number> = {
    PENDING_ADMIN_REVIEW: 35,
    NEEDS_STUDENT_INFO: 20,
    DRAFT_AI: 45,
    APPROVED: 75,
    ACTIVE: 85,
    COMPLETED: 100,
    REJECTED: 0,
  };
  return Math.max(...roadmaps.map((roadmap) => scoreByStatus[roadmap.status] ?? 25));
}

function interviewAverage(sessions: InterviewSession[]) {
  const scores = sessions
    .map((session) => session.overallScore)
    .filter((score): score is number => typeof score === 'number');
  if (!scores.length) return 'Chưa có';
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
}

function upcomingBookings(bookings: Booking[]) {
  const now = Date.now();
  return bookings
    .filter((booking) => {
      const time = new Date(booking.startTime).getTime();
      return time >= now && !['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(booking.status);
    })
    .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
}

function nextAction(payload: DashboardPayload) {
  const unread = payload.notifications.filter((item) => !item.readAt);
  const upcoming = upcomingBookings(payload.bookings);
  if (!payload.roadmaps.length) {
    return {
      title: 'Tạo lộ trình đầu tiên',
      description: 'Tài khoản này chưa gửi yêu cầu lộ trình nào.',
      href: '/create-roadmap',
      label: 'Tạo lộ trình',
    };
  }
  if (unread.length) {
    return {
      title: `${unread.length} thông báo chưa đọc`,
      description: 'Có cập nhật mới liên quan đến lộ trình, lịch học hoặc thanh toán.',
      href: '/dashboard/notifications',
      label: 'Xem thông báo',
    };
  }
  if (upcoming[0]) {
    return {
      title: 'Buổi học sắp tới',
      description: `Bắt đầu lúc ${formatDateTime(upcoming[0].startTime)}.`,
      href: '/dashboard/bookings',
      label: 'Mở lịch học',
    };
  }
  if (!payload.interviews.length) {
    return {
      title: 'Chưa có buổi phỏng vấn',
      description: 'Tạo một buổi luyện phỏng vấn để có điểm đánh giá theo tài khoản.',
      href: '/dashboard/interview/new',
      label: 'Bắt đầu phỏng vấn',
    };
  }
  return {
    title: 'Tiếp tục luyện code',
    description: 'Mở danh sách bài luyện tập và nộp thêm lời giải.',
    href: '/dashboard/code-practice',
    label: 'Mở luyện code',
  };
}

async function loadDashboard(): Promise<DashboardPayload> {
  const headers = authHeaders();
  const [account, roadmaps, bookings, submissions, interviews, notifications] = await Promise.all([
    apiFetch<Account>('/auth/me', { headers }),
    apiFetch<RoadmapRequest[]>('/roadmap-requests/me', { headers }),
    apiFetch<Booking[]>('/bookings/me', { headers }),
    apiFetch<CodeSubmission[]>('/code/submissions/me', { headers }),
    apiFetch<InterviewSession[]>('/ai/interview/sessions/me', { headers }),
    apiFetch<NotificationItem[]>('/notifications/me', { headers }),
  ]);
  return { account, roadmaps, bookings, submissions, interviews, notifications };
}

export function LiveDashboardOverview() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthenticated, setUnauthenticated] = useState(false);

  const reloadAll = useCallback(async () => {
    if (!(await ensureAccessToken())) {
      setPayload(null);
      setLoading(false);
      setError('');
      setUnauthenticated(true);
      return;
    }

    setLoading(true);
    setError('');
    setUnauthenticated(false);
    try {
      setPayload(await loadDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  if (unauthenticated) return <AuthRequiredCard />;
  if (loading && !payload) return <LoadingCard />;
  if (error && !payload) return <ErrorCard message={error} onRetry={reloadAll} />;
  if (!payload) return <LoadingCard />;

  const next = nextAction(payload);
  const upcoming = upcomingBookings(payload.bookings);
  const latestRoadmap = payload.roadmaps[0];

  const stats = [
    {
      label: 'Tiến độ lộ trình',
      value: formatPercent(roadmapProgress(payload.roadmaps)),
      icon: GraduationCap,
      tone: 'cyan' as const,
    },
    {
      label: 'Buổi học sắp tới',
      value: String(upcoming.length),
      icon: CalendarCheck,
      tone: 'violet' as const,
    },
    {
      label: 'Bài code đã giải',
      value: String(uniqueAcceptedSubmissions(payload.submissions)),
      icon: Code2,
      tone: 'emerald' as const,
    },
    {
      label: 'Điểm phỏng vấn TB',
      value: interviewAverage(payload.interviews),
      icon: BarChart3,
      tone: 'amber' as const,
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 rounded-md border border-white/8 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-mutedText">Tài khoản đang xem</p>
          <p className="font-medium text-white">
            {payload.account.fullName} · {payload.account.email}
          </p>
        </div>
        <Button variant="outline" onClick={reloadAll}>
          Cập nhật dữ liệu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {latestRoadmap ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Lộ trình gần nhất</CardTitle>
                  <CardDescription>{latestRoadmap.goal}</CardDescription>
                </div>
                <StatusBadge value={latestRoadmap.status} />
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Vai trò mục tiêu" value={latestRoadmap.targetRole} />
              <Info label="Trình độ hiện tại" value={latestRoadmap.currentLevel} />
              <Info label="Số giờ mỗi tuần" value={`${latestRoadmap.weeklyHours} giờ`} />
              <Info label="Cập nhật" value={formatDateTime(latestRoadmap.updatedAt)} />
            </div>
            <Link className="mt-4 inline-flex" href={`/dashboard/roadmaps/${latestRoadmap.id}`}>
              <Button variant="secondary">
                Mở lộ trình
                <Map className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <EmptyState
            title="Chưa có lộ trình"
            description="Tạo lộ trình để dashboard có tiến độ, timeline và bước học tiếp theo theo đúng tài khoản."
            actionHref="/create-roadmap"
            actionLabel="Tạo lộ trình"
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>{next.title}</CardTitle>
            <CardDescription>{next.description}</CardDescription>
          </CardHeader>
          <Link href={next.href}>
            <Button className="w-full">
              {next.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-4 space-y-2 text-sm text-mutedText">
            <p>Lộ trình: {payload.roadmaps.length}</p>
            <p>Lịch học: {payload.bookings.length}</p>
            <p>
              Thông báo chưa đọc:{' '}
              {payload.notifications.filter((notification) => !notification.readAt).length}
              <Bell className="ml-2 inline h-3.5 w-3.5" />
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-md border border-white/8 bg-white/[0.03] p-3">
      <p className="text-xs text-mutedText">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value ?? 'Chưa có'}</p>
    </div>
  );
}
