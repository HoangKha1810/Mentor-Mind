import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminPackagesPage() {
  return <WorkspacePage role="admin" title="Packages" subtitle="Create, edit, publish, archive and delete 1-on-1 tutoring packages." highlights={['Package management table', 'Featured flag and pricing', 'Weekly outcomes and AI tools']} />;
}
