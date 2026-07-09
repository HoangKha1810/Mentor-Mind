import { MentorHomeworkPanel } from '@/components/mentor/mentor-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function MentorHomeworkPage() {
  return (
    <DashboardShell
      role="mentor"
      title="Chấm bài tập"
      subtitle="Danh sách bài tập đã nộp đang cần mentor phản hồi và chấm điểm."
    >
      <MentorHomeworkPanel />
    </DashboardShell>
  );
}
