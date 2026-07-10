import { DashboardShell } from '@/components/layout/dashboard-shell';
import { TopUpPage } from '@/components/payments/top-up-page';

export default function WalletTopUpPage() {
  return (
    <DashboardShell
      title="Nạp tiền"
      subtitle="Nạp số dư ví bằng PayOS để mua gói sử dụng, mở bài code đặc biệt và thanh toán dịch vụ."
    >
      <TopUpPage />
    </DashboardShell>
  );
}
