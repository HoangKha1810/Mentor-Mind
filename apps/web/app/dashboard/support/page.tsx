import { WorkspacePage } from '@/components/layout/workspace-page';

export default function SupportPage() {
  return (
    <WorkspacePage
      role="student"
      title="Support Tickets"
      subtitle="Submit issues and track admin responses/status."
      highlights={['Create ticket', 'View own tickets', 'Admin status workflow']}
    />
  );
}
