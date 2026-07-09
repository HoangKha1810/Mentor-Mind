import { AdminMentorsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminMentorsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Mentor"
      subtitle="Danh sách mentor, phân công và tổng quan lịch rảnh."
    >
      <AdminMentorsPanel />
    </DashboardShell>
  );
}
