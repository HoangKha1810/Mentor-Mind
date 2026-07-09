import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminCodeProblemsPage() {
  return <WorkspacePage role="admin" title="Code Problems" subtitle="CRUD coding problems, starter code, samples, hidden tests and solution explanations." highlights={['Public and hidden test cases', 'Language starter code', 'Judge0-compatible constraints']} />;
}
