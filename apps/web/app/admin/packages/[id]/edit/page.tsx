import { AdminPackageEditorPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function EditPackagePage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      role="admin"
      title="Sửa gói học"
      subtitle="Cập nhật chi tiết gói, trạng thái và thông điệp tư vấn."
    >
      <AdminPackageEditorPanel id={params.id} />
    </DashboardShell>
  );
}
