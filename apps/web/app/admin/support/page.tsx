import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminSupportPage() {
  return <WorkspacePage role="admin" title="Support" subtitle="Respond to student tickets and update status/priority." highlights={['Open tickets', 'Admin ownership', 'Status workflow']} />;
}
