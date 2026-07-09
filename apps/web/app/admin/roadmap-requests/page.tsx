import { AdminRoadmapRequestsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminRoadmapRequestsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Yêu cầu lộ trình"
      subtitle="Duyệt bản nháp AI, phân mentor, lên lịch tư vấn và duyệt kế hoạch cuối."
    >
      <AdminRoadmapRequestsPanel />
    </DashboardShell>
  );
}
