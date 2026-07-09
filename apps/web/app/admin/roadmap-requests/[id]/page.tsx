import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminRoadmapRequestDetailPage() {
  return <WorkspacePage role="admin" title="Roadmap Request Detail" subtitle="Student info, AI draft roadmap, admin editor, mentor assignment and approval workflow." highlights={['Edit weekly roadmap', 'Assign mentor', 'Approve final roadmap']} />;
}
