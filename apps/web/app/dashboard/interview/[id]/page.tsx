import { WorkspacePage } from '@/components/layout/workspace-page';

export default function InterviewSessionPage() {
  return (
    <WorkspacePage
      role="student"
      title="Interview Session"
      subtitle="Chat-like answer interface with score feedback, better answers and finish session action."
      highlights={['Question prompt', 'Answer input', 'Rubric score and better-answer feedback']}
    />
  );
}
