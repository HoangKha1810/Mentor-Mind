import { CodeProblemWorkspace } from '@/components/dashboard/code-problem-workspace';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function CodeProblemPage({ params }: { params: { slug: string } }) {
  return (
    <DashboardShell
      title={params.slug.replaceAll('-', ' ')}
      subtitle="Làm bài trực tiếp, chạy test an toàn và nhận gợi ý AI khi cần cải thiện hướng giải."
    >
      <CodeProblemWorkspace slug={params.slug} />
    </DashboardShell>
  );
}
