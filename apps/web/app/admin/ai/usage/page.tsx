import { AdminAiUsagePanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminAiUsagePage() {
  return (
    <DashboardShell
      role="admin"
      title="Log sử dụng AI"
      subtitle="Theo dõi mức sử dụng AI, chi phí, độ trễ và chất lượng phản hồi theo từng tính năng."
    >
      <AdminAiUsagePanel />
    </DashboardShell>
  );
}
