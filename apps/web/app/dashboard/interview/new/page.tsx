import { NewInterviewForm } from '@/components/dashboard/interview-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function NewInterviewPage({
  searchParams,
}: {
  searchParams?: { mode?: string };
}) {
  return (
    <DashboardShell
      title="Bắt đầu phỏng vấn"
      subtitle="Chọn vai trò mục tiêu, level, chế độ, có thể tải JD và bắt đầu luyện tập."
    >
      <NewInterviewForm initialMode={searchParams?.mode ?? 'TECHNICAL'} />
    </DashboardShell>
  );
}
