import { MentorStudentsPanel } from '@/components/mentor/mentor-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function MentorStudentsPage() {
  return (
    <DashboardShell
      role="mentor"
      title="Học viên phụ trách"
      subtitle="Xem mục tiêu, trình độ, lộ trình, điểm yếu và hoạt động gần đây của học viên."
    >
      <MentorStudentsPanel />
    </DashboardShell>
  );
}
