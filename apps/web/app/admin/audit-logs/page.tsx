import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAuditLogsPage() {
  return <WorkspacePage role="admin" title="Audit Logs" subtitle="Sensitive auth/admin actions with actor, entity and metadata." highlights={['Register/login/logout', 'Admin user changes', 'Roadmap approval audit']} />;
}
