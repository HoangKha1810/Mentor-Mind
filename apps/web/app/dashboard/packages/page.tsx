import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PackageBrowser } from '@/components/packages/package-browser';

export default function DashboardPackagesPage() {
  return (
    <DashboardShell
      title="Gói học của tôi"
      subtitle="Xem các gói học đang mở và gửi yêu cầu tư vấn bằng tài khoản hiện tại."
    >
      <PackageBrowser />
    </DashboardShell>
  );
}
