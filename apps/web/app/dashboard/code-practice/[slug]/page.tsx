'use client';

import { CodeProblemWorkspace } from '@/components/dashboard/code-problem-workspace';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CodeProblem } from '@/lib/domain-types';
import { useLiveQuery } from '@/lib/live-query';

export default function CodeProblemPage({ params }: { params: { slug: string } }) {
  const query = useLiveQuery<CodeProblem>(`/code/problems/${params.slug}`, {
    deps: [params.slug],
  });

  return (
    <DashboardShell
      title={query.data?.title ?? 'Đang tải bài luyện code...'}
      subtitle="Làm bài trực tiếp, chạy test an toàn và nhận gợi ý AI khi cần cải thiện hướng giải."
    >
      <CodeProblemWorkspace
        slug={params.slug}
        problem={query.data}
        loading={query.loading}
        error={query.error}
        onRetry={query.reload}
      />
    </DashboardShell>
  );
}
