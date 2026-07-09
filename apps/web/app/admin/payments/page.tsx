import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminPaymentsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Thanh toán"
      subtitle="Log thanh toán PayOS, trạng thái giao dịch và đối soát doanh thu."
      highlights={['Mã tham chiếu PayOS', 'Trạng thái thanh toán', 'Chỉ số doanh thu']}
    />
  );
}
