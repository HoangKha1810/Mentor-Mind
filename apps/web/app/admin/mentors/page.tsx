import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminMentorsPage() {
  return <WorkspacePage role="admin" title="Mentors" subtitle="Mentor list, assignments and availability overview." highlights={['Availability snapshot', 'Skill/category filters', 'Assigned students']} />;
}
