'use client';

import Link from 'next/link';
import { BookOpenCheck, Clock, Map, Plus } from 'lucide-react';
import { sampleRoadmapTemplates } from '@mentormind/shared';
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
      <div className="space-y-6">
        <EmptyState
          title="Chưa có lộ trình"
          description="Tạo yêu cầu lộ trình để AI phác thảo, admin duyệt và mentor có cơ sở đồng hành."
          actionHref="/create-roadmap"
          actionLabel="Tạo lộ trình"
        />
        <SampleRoadmapTemplateGrid />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <SampleRoadmapTemplateGrid />
    </div>
  );
}

function SampleRoadmapTemplateGrid() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Lộ trình mẫu từ đề cương</h2>
          <p className="mt-1 text-sm text-mutedText">
            Các mẫu được dựng từ file Excel bạn cung cấp, có thể dùng làm điểm bắt đầu cho lộ trình cá nhân.
          </p>
        </div>
        <Link href="/create-roadmap">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Tạo mới
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {sampleRoadmapTemplates.map((template) => (
          <Card key={template.slug}>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={template.level} />
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-mutedText">
                {template.sourceFile}
              </span>
            </div>
            <CardHeader className="mt-3">
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.summary}</CardDescription>
            </CardHeader>
            <div className="grid gap-3 text-sm text-mutedText md:grid-cols-2">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                {template.durationWeeks} tuần · {template.weeklyHours} giờ/tuần
              </p>
              <p className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-secondary" />
                {template.lessons.length} buổi/chủ đề
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {template.lessons.slice(0, 4).map((lesson) => (
                <div key={lesson.title} className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
                  <p className="text-sm font-semibold text-white">{lesson.title}</p>
                  <p className="mt-1 text-xs leading-5 text-mutedText">{lesson.objective}</p>
                </div>
              ))}
              {template.lessons.length > 4 ? (
                <p className="text-xs text-secondary">+{template.lessons.length - 4} buổi/chủ đề tiếp theo</p>
              ) : null}
            </div>
            <Link href={`/create-roadmap?template=${encodeURIComponent(template.slug)}`} className="mt-4 inline-flex">
              <Button variant="secondary">
                <Map className="h-4 w-4" />
                Dùng mẫu này
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
