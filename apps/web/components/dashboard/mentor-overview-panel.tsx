'use client';

import { CalendarCheck, CheckCircle2, Clock, Users } from 'lucide-react';
import { Booking } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function MentorOverviewPanel() {
  const query = useLiveQuery<Booking[]>('/mentor/bookings', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard message="Đăng nhập bằng tài khoản mentor để xem lịch dạy." />;
  if (query.loading) return <LoadingCard label="Đang tải lịch mentor thật..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const now = Date.now();
  const upcoming = query.data.filter((booking) => new Date(booking.startTime).getTime() >= now);
  const completed = query.data.filter((booking) => booking.status === 'COMPLETED');
  const students = new Set(query.data.map((booking) => booking.studentId));

  const stats = [
    { label: 'Buổi sắp tới', value: String(upcoming.length), icon: CalendarCheck, tone: 'cyan' as const },
    { label: 'Học viên đã gặp', value: String(students.size), icon: Users, tone: 'violet' as const },
    { label: 'Buổi hoàn tất', value: String(completed.length), icon: CheckCircle2, tone: 'emerald' as const },
    { label: 'Tổng booking', value: String(query.data.length), icon: Clock, tone: 'amber' as const },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lịch dạy gần nhất</CardTitle>
          <CardDescription>Danh sách lấy từ booking được gán cho mentor đang đăng nhập.</CardDescription>
        </CardHeader>
        {query.data.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {query.data.slice(0, 6).map((booking) => (
              <div key={booking.id} className="rounded-md border border-white/8 bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{formatDateTime(booking.startTime)}</p>
                  <StatusBadge value={booking.status} />
                </div>
                <p className="text-sm text-mutedText">
                  Học viên: {booking.student?.fullName ?? booking.studentId}
                </p>
                {booking.student?.email ? (
                  <p className="text-sm text-mutedText">Email: {booking.student.email}</p>
                ) : null}
                {booking.studentNote ? <p className="mt-2 text-sm text-slate-200">{booking.studentNote}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có booking"
            description="Khi học viên hoặc admin tạo lịch với mentor này, dữ liệu sẽ xuất hiện tại đây."
          />
        )}
      </Card>
    </>
  );
}
