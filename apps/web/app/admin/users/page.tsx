import { AdminUsersPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminUsersPage() {
  return (
    <DashboardShell
      role="admin"
      title="Người dùng"
      subtitle="Quản lý học viên, mentor và admin với bộ lọc role/trạng thái."
    >
      <AdminUsersPanel />
    </DashboardShell>
  );
}
