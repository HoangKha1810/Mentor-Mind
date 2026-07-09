import { AdminPackagesPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminPackagesPage() {
  return (
    <DashboardShell
      role="admin"
      title="Gói học"
      subtitle="Tạo, sửa, publish, archive và xóa gói học 1-1."
    >
      <AdminPackagesPanel />
    </DashboardShell>
  );
}
