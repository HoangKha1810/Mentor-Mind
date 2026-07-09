import { MentorStudentDetailPanel } from '@/components/mentor/mentor-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function MentorStudentDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      role="mentor"
      title="Chi tiết học viên"
      subtitle="Lộ trình, buổi học, bài tập, ghi chú trước đó và insight học tập AI của một học viên."
    >
      <MentorStudentDetailPanel id={params.id} />
    </DashboardShell>
  );
}
