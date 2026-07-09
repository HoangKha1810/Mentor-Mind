import { AdminCodeProblemsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminCodeProblemsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Bài code"
      subtitle="Quản lý ngân hàng bài luyện code, bộ test chấm điểm, gợi ý lời giải và cấu hình Judge0."
    >
      <AdminCodeProblemsPanel />
    </DashboardShell>
  );
}
