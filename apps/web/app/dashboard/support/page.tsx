import { SupportCenter } from '@/components/dashboard/support-center';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function SupportPage() {
  return (
    <DashboardShell
      title="Yêu cầu hỗ trợ"
      subtitle="Gửi vấn đề cần hỗ trợ và theo dõi phản hồi/trạng thái từ admin."
    >
      <SupportCenter />
    </DashboardShell>
  );
}
