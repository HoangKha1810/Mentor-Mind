import { roadmapWeeks } from '@/lib/mock-data';
import { WorkspacePage } from '@/components/layout/workspace-page';

export default function RoadmapDetailPage() {
  return (
    <WorkspacePage
      role="student"
      title="Roadmap Timeline"
      subtitle="Weekly plan, roadmap items, admin notes, mentor notes, recommended sessions and resources."
      highlights={roadmapWeeks}
    />
  );
}
