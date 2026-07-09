import { DashboardShell } from '@/components/layout/dashboard-shell';
import { LiveDashboardOverview } from '@/components/dashboard/live-dashboard-overview';

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Tổng quan học viên"
      subtitle="Theo dõi dữ liệu thật của tài khoản: lộ trình, lịch học, bài code, phỏng vấn và thông báo."
    >
      <LiveDashboardOverview />
    </DashboardShell>
  );
}
