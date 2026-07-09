import { WorkspacePage } from '@/components/layout/workspace-page';

export default function RoadmapsPage() {
  return (
    <WorkspacePage
      role="student"
      title="My Roadmaps"
      subtitle="View AI drafts, admin-approved roadmaps and active 1-on-1 learning journeys."
      highlights={['Status badges for DRAFT_AI, APPROVED and ACTIVE', 'Timeline by week with mentor notes', 'CTA to create a new roadmap']}
    />
  );
}
