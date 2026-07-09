import { AdminRoadmapRequestDetailPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminRoadmapRequestDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      role="admin"
      title="Chi tiết yêu cầu lộ trình"
      subtitle="Thông tin học viên, bản nháp AI, editor admin, phân mentor và quy trình duyệt."
    >
      <AdminRoadmapRequestDetailPanel id={params.id} />
    </DashboardShell>
  );
}
