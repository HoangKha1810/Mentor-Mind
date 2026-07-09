'use client';

import Link from 'next/link';
import { Map, Plus } from 'lucide-react';
import { RoadmapRequest } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function RoadmapsPanel() {
  const query = useLiveQuery<RoadmapRequest[]>('/roadmap-requests/me', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải lộ trình của tài khoản..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="Chưa có lộ trình"
        description="Tạo yêu cầu lộ trình để AI phác thảo, admin duyệt và mentor có cơ sở đồng hành."
        actionHref="/create-roadmap"
        actionLabel="Tạo lộ trình"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/create-roadmap">
          <Button>
            <Plus className="h-4 w-4" />
            Tạo lộ trình mới
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {query.data.map((roadmap) => (
          <Card key={roadmap.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardHeader>
                <CardTitle>{roadmap.targetRole}</CardTitle>
                <CardDescription>{roadmap.goal}</CardDescription>
              </CardHeader>
              <StatusBadge value={roadmap.status} />
            </div>
            <div className="grid gap-3 text-sm text-mutedText md:grid-cols-2">
              <p>Trình độ: {roadmap.currentLevel}</p>
              <p>{roadmap.weeklyHours} giờ mỗi tuần</p>
              <p>Lịch học: {roadmap.preferredSchedule}</p>
              <p>Tạo lúc: {formatDateTime(roadmap.createdAt)}</p>
            </div>
            <Link href={`/dashboard/roadmaps/${roadmap.id}`} className="mt-4 inline-flex">
              <Button variant="secondary">
                <Map className="h-4 w-4" />
                Mở chi tiết
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
