import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiPage() {
  return <WorkspacePage role="admin" title="AI Control Center" subtitle="Usage chart, cost chart, failed calls, prompt template health and provider status." highlights={['Prompt templates', 'Usage logs and cost', 'Feature enable/disable controls']} />;
}
