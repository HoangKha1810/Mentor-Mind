'use client';

import Link from 'next/link';
import { CalendarPlus, Video } from 'lucide-react';
import { Booking } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function BookingsPanel() {
  const query = useLiveQuery<Booking[]>('/bookings/me', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải lịch học của tài khoản..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="Chưa có buổi học"
        description="Đặt buổi học với mentor để lịch học xuất hiện theo đúng tài khoản."
        actionHref="/dashboard/bookings/new"
        actionLabel="Đặt buổi học"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/dashboard/bookings/new">
          <Button>
            <CalendarPlus className="h-4 w-4" />
            Đặt buổi học
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {query.data.map((booking) => (
          <Card key={booking.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardHeader>
                <CardTitle>{formatDateTime(booking.startTime)}</CardTitle>
                <CardDescription>Kết thúc {formatDateTime(booking.endTime)}</CardDescription>
              </CardHeader>
              <StatusBadge value={booking.status} />
            </div>
            <div className="space-y-2 text-sm text-mutedText">
              <p>Mentor: {booking.mentor?.fullName ?? booking.mentorId}</p>
              {booking.mentor?.email ? <p>Email mentor: {booking.mentor.email}</p> : null}
              <p>Múi giờ: {booking.timezone}</p>
              {booking.studentNote ? <p>Ghi chú: {booking.studentNote}</p> : null}
              {booking.mentorNote ? <p>Ghi chú mentor: {booking.mentorNote}</p> : null}
              {booking.adminNote ? <p>Ghi chú admin: {booking.adminNote}</p> : null}
            </div>
            {booking.meetingUrl ? (
              <Link href={booking.meetingUrl} target="_blank" className="mt-4 inline-flex">
                <Button variant="outline">
                  <Video className="h-4 w-4" />
                  Vào phòng học
                </Button>
              </Link>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
