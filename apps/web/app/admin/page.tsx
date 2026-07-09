import { AdminOverviewPanel } from '@/components/dashboard/admin-overview-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminOverviewPage() {
  return (
    <DashboardShell
      role="admin"
      title="Tổng quan quản trị"
      subtitle="Bảng điều khiển vận hành cho duyệt lộ trình, mức sử dụng AI, lịch học, doanh thu và hỗ trợ."
    >
      <AdminOverviewPanel />
    </DashboardShell>
  );
}
