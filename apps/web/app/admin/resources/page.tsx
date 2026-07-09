import { AdminResourcesPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminResourcesPage() {
  return (
    <DashboardShell
      role="admin"
      title="Tài nguyên"
      subtitle="Curate sách, docs, bài viết, video, dự án, bài code và gói học."
    >
      <AdminResourcesPanel />
    </DashboardShell>
  );
}
