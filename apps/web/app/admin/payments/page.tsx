import { AdminPaymentsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminPaymentsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Thanh toán"
      subtitle="Log thanh toán PayOS, trạng thái giao dịch và đối soát doanh thu."
    >
      <AdminPaymentsPanel />
    </DashboardShell>
  );
}
