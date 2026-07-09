import { MentorOverviewPanel } from '@/components/dashboard/mentor-overview-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function MentorOverviewPage() {
  return (
    <DashboardShell
      role="mentor"
      title="Tổng quan mentor"
      subtitle="Buổi học sắp tới, học viên được phân công, học viên có rủi ro và bài tập đang chờ review."
    >
      <MentorOverviewPanel />
    </DashboardShell>
  );
}
