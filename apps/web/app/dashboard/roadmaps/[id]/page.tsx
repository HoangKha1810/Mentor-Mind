import { RoadmapDetailPanel } from '@/components/dashboard/roadmap-detail-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function RoadmapDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      title="Timeline lộ trình"
      subtitle="Kế hoạch theo tuần, hạng mục lộ trình, ghi chú admin, ghi chú mentor, buổi học và tài nguyên đề xuất."
    >
      <RoadmapDetailPanel id={params.id} />
    </DashboardShell>
  );
}
