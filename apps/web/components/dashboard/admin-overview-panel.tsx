'use client';

import { BrainCircuit, CalendarCheck, Headphones, LifeBuoy, ShieldCheck, Sparkles } from 'lucide-react';
import { useLiveQuery } from '@/lib/live-query';
import { formatDateTime } from '@/lib/format';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, ErrorCard, LoadingCard } from './live-common';

type AdminOverview = {
  users: number;
  pendingRoadmapRequests: number;
  activeStudents: number;
  activeMentors: number;
  bookingsThisWeek: number;
  codingSubmissions: number;
  revenue: number;
  supportTickets: number;
  aiLogs: Array<{
    id: string;
    feature: string;
    provider: string;
    model: string;
    status: string;
    latencyMs: number;
    createdAt: string;
  }>;
  conversionFunnel: {
    visitor: number | null;
    register: number;
    roadmapRequest: number;
    consultation: number;
    activePlan: number;
  };
};

export function AdminOverviewPanel() {
  const query = useLiveQuery<AdminOverview>('/admin', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard message="Đăng nhập bằng tài khoản admin để xem vận hành." />;
  if (query.loading) return <LoadingCard label="Đang tải số liệu quản trị thật..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const stats = [
    {
      label: 'Lộ trình chờ duyệt',
      value: String(query.data.pendingRoadmapRequests),
      icon: BrainCircuit,
      tone: 'cyan' as const,
    },
    {
      label: 'Mentor hoạt động',
      value: String(query.data.activeMentors),
      icon: Headphones,
      tone: 'violet' as const,
    },
    {
      label: 'Log AI gần đây',
      value: String(query.data.aiLogs.length),
      icon: Sparkles,
      tone: 'amber' as const,
    },
    {
      label: 'Ticket cần xử lý',
      value: String(query.data.supportTickets),
      icon: LifeBuoy,
      tone: 'emerald' as const,
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phễu vận hành</CardTitle>
            <CardDescription>Chỉ dùng số liệu đang có trong database, không cộng dữ liệu ảo.</CardDescription>
          </CardHeader>
          <div className="space-y-3 text-sm text-mutedText">
            <p>Người dùng: {query.data.users}</p>
            <p>Học viên hoạt động: {query.data.conversionFunnel.register}</p>
            <p>Yêu cầu lộ trình: {query.data.conversionFunnel.roadmapRequest}</p>
            <p>Lịch học tuần này: {query.data.conversionFunnel.consultation}</p>
            <p>Lộ trình active/completed: {query.data.conversionFunnel.activePlan}</p>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mức sử dụng AI gần đây</CardTitle>
            <CardDescription>Log mới nhất từ provider AI đang cấu hình.</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {query.data.aiLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-md border border-white/8 bg-white/[0.03] p-3 text-sm">
                <p className="font-medium text-white">
                  {log.feature} · {log.status}
                </p>
                <p className="text-mutedText">
                  {log.provider}/{log.model} · {log.latencyMs}ms · {formatDateTime(log.createdAt)}
                </p>
              </div>
            ))}
            {!query.data.aiLogs.length ? (
              <div className="flex items-center gap-2 text-sm text-mutedText">
                <ShieldCheck className="h-4 w-4 text-success" />
                Chưa có log AI.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </>
  );
}
