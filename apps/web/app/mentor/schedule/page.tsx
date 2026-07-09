import { MentorSchedulePanel } from '@/components/mentor/mentor-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function MentorSchedulePage() {
  return (
    <DashboardShell
      role="mentor"
      title="Lịch dạy mentor"
      subtitle="Quản lý lịch rảnh hằng tuần và chấp nhận hoặc từ chối lịch đặt của học viên."
    >
      <MentorSchedulePanel />
    </DashboardShell>
  );
}
