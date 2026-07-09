import { AdminPackageEditorPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function NewPackagePage() {
  return (
    <DashboardShell
      role="admin"
      title="Tạo gói học"
      subtitle="Editor cho outcome, kỹ năng, loại mentor, giá và trạng thái publish."
    >
      <AdminPackageEditorPanel />
    </DashboardShell>
  );
}
