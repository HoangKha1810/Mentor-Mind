import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorStudentsPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Assigned Students"
      subtitle="View goals, levels, roadmaps, weaknesses and recent activity."
      highlights={['Student profile summary', 'Active roadmap and homework', 'AI-generated risk insights']}
    />
  );
}
