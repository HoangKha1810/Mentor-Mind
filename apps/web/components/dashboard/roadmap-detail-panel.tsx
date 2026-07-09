'use client';

import { useState } from 'react';
import { Bot, CheckCircle2 } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { RoadmapDetail } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, ErrorCard, JsonBlock, LoadingCard, StatusBadge } from './live-common';

export function RoadmapDetailPanel({ id }: { id: string }) {
  const query = useLiveQuery<RoadmapDetail>(`/roadmap-requests/${id}`, { auth: true, deps: [id] });
  const [message, setMessage] = useState('');

  async function generateDraft() {
    setMessage('');
    try {
      await apiFetch(`/roadmap-requests/${id}/generate-ai-draft`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setMessage('Đã tạo bản nháp AI cho lộ trình.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tạo được bản nháp AI');
    }
  }

  async function activate(roadmapId: string) {
    setMessage('');
    try {
      await apiFetch(`/roadmaps/${roadmapId}/activate`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setMessage('Đã kích hoạt lộ trình.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không kích hoạt được lộ trình');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải chi tiết lộ trình..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const finalRoadmap = query.data.finalRoadmap;
  const roadmap = finalRoadmap ?? query.data.aiDraft;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardHeader>
            <CardTitle>{query.data.request.targetRole}</CardTitle>
            <CardDescription>{query.data.request.goal}</CardDescription>
          </CardHeader>
          <StatusBadge value={query.data.request.status} />
        </div>
        <div className="grid gap-3 text-sm text-mutedText md:grid-cols-3">
          <p>Trình độ: {query.data.request.currentLevel}</p>
          <p>{query.data.request.weeklyHours} giờ mỗi tuần</p>
          <p>Cập nhật: {formatDateTime(query.data.request.updatedAt)}</p>
        </div>
        {message ? <p className="mt-4 text-sm text-secondary">{message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {!query.data.aiDraft && !query.data.finalRoadmap ? (
            <Button onClick={generateDraft}>
              <Bot className="h-4 w-4" />
              Tạo bản nháp AI
            </Button>
          ) : null}
          {finalRoadmap?.status === 'APPROVED' ? (
            <Button variant="secondary" onClick={() => activate(finalRoadmap.id)}>
              <CheckCircle2 className="h-4 w-4" />
              Kích hoạt lộ trình
            </Button>
          ) : null}
        </div>
      </Card>

      {roadmap ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{roadmap.title}</CardTitle>
                <CardDescription>{roadmap.summary}</CardDescription>
              </div>
              <StatusBadge value={roadmap.status} />
            </div>
          </CardHeader>
          <p className="text-sm leading-6 text-slate-200">{roadmap.targetOutcome}</p>
          <div className="mt-4 space-y-3">
            {roadmap.weeks?.map((week) => (
              <div key={week.id} className="rounded-md border border-white/8 bg-white/[0.03] p-3">
                <p className="font-medium text-white">
                  Tuần {week.weekNumber}: {week.title}
                </p>
                <JsonBlock
                  value={{
                    objectives: week.objectives,
                    topics: week.topics,
                    practiceTasks: week.practiceTasks,
                    projectTasks: week.projectTasks,
                    interviewTasks: week.interviewTasks,
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có bản nháp lộ trình</CardTitle>
            <CardDescription>
              Hãy tạo bản nháp AI, sau đó admin có thể duyệt thành lộ trình chính thức.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
