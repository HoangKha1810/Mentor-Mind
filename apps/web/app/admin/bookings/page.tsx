import { AdminBookingsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminBookingsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Lịch học"
      subtitle="Toàn bộ lịch đặt trên nền tảng, có quản lý trạng thái và quyền điều chỉnh của admin."
    >
      <AdminBookingsPanel />
    </DashboardShell>
  );
}
