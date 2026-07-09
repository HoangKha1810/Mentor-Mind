import { roadmapWeeks } from '@/lib/showcase-data';
import { WorkspacePage } from '@/components/layout/workspace-page';

export default function RoadmapDetailPage() {
  return (
    <WorkspacePage
      role="student"
      title="Timeline lộ trình"
      subtitle="Kế hoạch theo tuần, hạng mục lộ trình, ghi chú admin, ghi chú mentor, buổi học và tài nguyên đề xuất."
      highlights={roadmapWeeks}
    />
  );
}
