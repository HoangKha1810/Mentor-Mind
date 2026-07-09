import { WorkspacePage } from '@/components/layout/workspace-page';

export default function SubmissionsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Submission History"
      subtitle="Review verdicts, runtime, memory, failed public samples and AI review notes."
      highlights={['ACCEPTED and failure verdicts', 'AI review per submission', 'Solved problem tracking']}
    />
  );
}
