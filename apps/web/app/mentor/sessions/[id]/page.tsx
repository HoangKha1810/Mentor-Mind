import { MentorSessionDetailPanel } from '@/components/mentor/mentor-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function MentorSessionDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      role="mentor"
      title="Chi tiết buổi học"
      subtitle="Thêm ghi chú, giao bài tập và xem lại bối cảnh buổi học trước."
    >
      <MentorSessionDetailPanel id={params.id} />
    </DashboardShell>
  );
}
