import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorSessionDetailPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Session Detail"
      subtitle="Add notes, assign homework and review previous session context."
      highlights={['Session notes', 'Strengths and weaknesses', 'Next steps and private note']}
    />
  );
}
