import { AdminSupportPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminSupportPage() {
  return (
    <DashboardShell
      role="admin"
      title="Hỗ trợ"
      subtitle="Phản hồi yêu cầu của học viên và cập nhật trạng thái/độ ưu tiên."
    >
      <AdminSupportPanel />
    </DashboardShell>
  );
}
