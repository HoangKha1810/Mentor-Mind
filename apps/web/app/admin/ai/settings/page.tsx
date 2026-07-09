import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiSettingsPage() {
  return <WorkspacePage role="admin" title="AI Settings" subtitle="Enable/disable AI tools, set cost limits and configure provider placeholders." highlights={['Tool toggles', 'Token and cost limits', 'Provider config placeholders']} />;
}
