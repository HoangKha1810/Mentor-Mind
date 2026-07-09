import { AdminAuditLogsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminAuditLogsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Nhật ký hệ thống"
      subtitle="Theo dõi các thao tác quan trọng để kiểm soát bảo mật, phân quyền và thay đổi dữ liệu."
    >
      <AdminAuditLogsPanel />
    </DashboardShell>
  );
}
