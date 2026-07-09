import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminRoadmapRequestsPage() {
  return <WorkspacePage role="admin" title="Roadmap Requests" subtitle="Review AI drafts, assign mentors, schedule consultation and approve final plans." highlights={['Status filters', 'Assigned admin/mentor filters', 'Pending review queue']} />;
}
