import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminUsersPage() {
  return <WorkspacePage role="admin" title="Users" subtitle="Manage students, mentors and admins with role/status filters." highlights={['User table', 'Role and status filters', 'Suspend or activate account']} />;
}
