import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiUsagePage() {
  return <WorkspacePage role="admin" title="AI Usage Logs" subtitle="Inspect provider, model, tokens, estimated cost, latency and failures." highlights={['Cost by feature', 'Failed AI calls', 'Per-user daily budget audit']} />;
}
