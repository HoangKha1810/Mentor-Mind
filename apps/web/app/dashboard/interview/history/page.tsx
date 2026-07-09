import { WorkspacePage } from '@/components/layout/workspace-page';

export default function InterviewHistoryPage() {
  return (
    <WorkspacePage
      role="student"
      title="Interview History"
      subtitle="Saved sessions, score trends and repeated weak areas."
      highlights={['Overall score per session', 'Weak area clustering', 'Next practice suggestions']}
    />
  );
}
