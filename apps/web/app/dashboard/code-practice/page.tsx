import { CodePracticePanel } from '@/components/dashboard/code-practice-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function CodePracticeDashboard() {
  return (
    <DashboardShell
      title="Luyện code"
      subtitle="Chọn bài luyện tập, chạy bộ test tự động, nộp lời giải và nhận gợi ý từ AI khi cần."
    >
      <CodePracticePanel requireAuth />
    </DashboardShell>
  );
}
