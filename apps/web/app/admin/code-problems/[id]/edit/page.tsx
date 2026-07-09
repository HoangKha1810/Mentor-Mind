import { WorkspacePage } from '@/components/layout/workspace-page';

export default function EditCodeProblemPage() {
  return <WorkspacePage role="admin" title="Edit Code Problem" subtitle="Update problem text, tags, test cases and publication status." highlights={['Do not leak hidden tests', 'Solution explanation admin-only', 'Status draft/published/archive']} />;
}
