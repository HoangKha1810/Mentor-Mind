import { InterviewOverviewPanel } from '@/components/dashboard/interview-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function InterviewDashboard() {
  return (
    <DashboardShell
      title="Phỏng vấn AI"
      subtitle="Bắt đầu phỏng vấn thử, theo dõi xu hướng điểm và xem các điểm yếu lặp lại."
    >
      <InterviewOverviewPanel />
    </DashboardShell>
  );
}
