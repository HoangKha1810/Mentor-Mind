import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminPaymentsPage() {
  return <WorkspacePage role="admin" title="Payments" subtitle="Payment logs for mock, Stripe, VNPay and Momo-compatible providers." highlights={['Provider reference', 'Payment status', 'Revenue mock metrics']} />;
}
