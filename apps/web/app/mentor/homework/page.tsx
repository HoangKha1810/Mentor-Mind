import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorHomeworkPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Homework Reviews"
      subtitle="Queue of submitted homework that needs mentor feedback and scoring."
      highlights={['Submission content', 'Feedback and score', 'Student notification on review']}
    />
  );
}
