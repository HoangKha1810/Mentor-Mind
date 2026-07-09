import { InterviewHistoryPanel } from '@/components/dashboard/interview-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function InterviewHistoryPage() {
  return (
    <DashboardShell
      title="Lịch sử phỏng vấn"
      subtitle="Các buổi đã lưu, xu hướng điểm và nhóm điểm yếu lặp lại."
    >
      <InterviewHistoryPanel />
    </DashboardShell>
  );
}
