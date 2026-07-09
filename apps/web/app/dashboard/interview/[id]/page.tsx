import { InterviewSessionPanel } from '@/components/dashboard/interview-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function InterviewSessionPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      title="Buổi phỏng vấn"
      subtitle="Giao diện trả lời dạng chat, có điểm đánh giá, câu trả lời tốt hơn và thao tác kết thúc buổi."
    >
      <InterviewSessionPanel id={params.id} />
    </DashboardShell>
  );
}
