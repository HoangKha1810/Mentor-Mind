import { AdminAiCenterPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminAiPage() {
  return (
    <DashboardShell
      role="admin"
      title="Trung tâm AI"
      subtitle="Biểu đồ sử dụng, chi phí, cuộc gọi lỗi, tình trạng prompt template và trạng thái nhà cung cấp."
    >
      <AdminAiCenterPanel />
    </DashboardShell>
  );
}
