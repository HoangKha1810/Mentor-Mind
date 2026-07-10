'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarCheck,
  Code2,
  FileText,
  GraduationCap,
  Map,
  MessagesSquare,
  Sparkles,
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
    .sort(
      (left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
    );
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
  const actionTiles = [
    {
      title: 'Tạo lộ trình',
      description: 'AI phác thảo mục tiêu, admin/mentor duyệt và theo sát tiến độ.',
      href: '/create-roadmap',
      icon: Map,
      accent: 'from-sky-500/35 via-cyan-500/20 to-emerald-500/20',
    },
    {
      title: 'Luyện code',
      description: 'Mở 100 bài từ dễ đến khó, nộp bài và lưu lịch sử theo tài khoản.',
      href: '/dashboard/code-practice',
      icon: Code2,
      accent: 'from-emerald-500/32 via-teal-500/20 to-sky-500/18',
    },
    {
      title: 'Phỏng vấn AI',
      description: 'Tạo phiên kỹ thuật, HR, tiếng Anh hoặc bảo vệ dự án và nhận điểm ngay.',
      href: '/dashboard/interview',
      icon: MessagesSquare,
      accent: 'from-violet-500/35 via-fuchsia-500/20 to-cyan-500/16',
    },
    {
      title: 'Sửa CV',
      description: 'Upload CV/JD để AI phân tích ATS, keyword thiếu và rủi ro phỏng vấn.',
      href: '/dashboard/cv-review',
      icon: FileText,
      accent: 'from-amber-500/30 via-orange-500/18 to-rose-500/18',
    },
  ];

  return (
    <>
      <div className="dashboard-surface mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-soft">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Dữ liệu thật theo tài khoản
            </div>
            <p className="mt-4 text-sm font-medium text-mutedText">Xin chào</p>
            <p className="mt-1 text-2xl font-semibold text-white">{payload.account.fullName}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {payload.account.email}. Dashboard này chỉ hiển thị lộ trình, lịch học, bài nộp,
              phỏng vấn và thông báo lấy từ tài khoản hiện tại.
            </p>
          </div>
          <div className="grid gap-3">
            <Button className="relative z-10 w-full" variant="outline" onClick={reloadAll}>
              Cập nhật dữ liệu
            </Button>
            <Link href="/dashboard/resources">
              <Button className="relative z-10 w-full" variant="secondary">
                <BookOpenCheck className="h-4 w-4" />
                Mở tài nguyên gợi ý
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        {actionTiles.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group block">
              <div
                className={`theme-on-color relative min-h-[13rem] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${item.accent} p-5 shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20`}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/14 bg-white/12 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{item.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-white">
                    Mở ngay
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
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
          <div className="mt-5 grid gap-3 text-sm text-mutedText">
            <p className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
              Lộ trình: <span className="font-semibold text-white">{payload.roadmaps.length}</span>
            </p>
            <p className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
              Lịch học: <span className="font-semibold text-white">{payload.bookings.length}</span>
            </p>
            <p className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
              Thông báo chưa đọc:{' '}
              <span className="font-semibold text-white">
                {payload.notifications.filter((notification) => !notification.readAt).length}
              </span>
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
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3 transition hover:border-secondary/20 hover:bg-secondary/[0.08]">
      <p className="text-xs text-mutedText">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value ?? 'Chưa có'}</p>
    </div>
  );
}
