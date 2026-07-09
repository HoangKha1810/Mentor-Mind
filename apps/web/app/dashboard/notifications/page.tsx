import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NotificationsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Notifications"
      subtitle="Roadmap approvals, consultation schedules, booking confirmations, homework feedback and payment status."
      highlights={['Bell dropdown compatible model', 'Mark as read endpoint', 'Metadata for deep links']}
    />
  );
}
