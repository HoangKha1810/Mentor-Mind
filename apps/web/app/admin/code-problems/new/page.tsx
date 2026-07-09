import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewCodeProblemPage() {
  return <WorkspacePage role="admin" title="New Code Problem" subtitle="Author a new coding challenge with examples, constraints and hidden tests." highlights={['Statement and formats', 'Starter code per language', 'Time/memory limits']} />;
}
