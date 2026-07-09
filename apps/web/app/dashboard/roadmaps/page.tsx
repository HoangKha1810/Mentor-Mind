import { RoadmapsPanel } from '@/components/dashboard/roadmaps-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function RoadmapsPage() {
  return (
    <DashboardShell
      title="Lộ trình của tôi"
      subtitle="Theo dõi lộ trình từ lúc gửi yêu cầu, được duyệt, bắt đầu học đến khi hoàn thành mục tiêu."
    >
      <RoadmapsPanel />
    </DashboardShell>
  );
}
