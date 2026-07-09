import { WorkspacePage } from '@/components/layout/workspace-page';

export default function EditPackagePage() {
  return <WorkspacePage role="admin" title="Edit Package" subtitle="Update package details, status and consultation positioning." highlights={['Draft/publish/archive', 'Price and sessions', 'Included AI tools']} />;
}
