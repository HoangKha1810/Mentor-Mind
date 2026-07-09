import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorStudentDetailPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Student Detail"
      subtitle="Roadmap, sessions, homework, previous notes and AI learning insights for one student."
      highlights={['Goal and level context', 'Roadmap items editable by mentor', 'Resource recommendations']}
    />
  );
}
