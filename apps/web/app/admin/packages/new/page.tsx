import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewPackagePage() {
  return <WorkspacePage role="admin" title="New Package" subtitle="Package editor for outcomes, skills, mentor type, pricing and publishing status." highlights={['Title and slug', 'Target audience and role', 'Hero config and featured flag']} />;
}
