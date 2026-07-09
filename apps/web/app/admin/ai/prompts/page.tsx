import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiPromptsPage() {
  return <WorkspacePage role="admin" title="AI Prompt Templates" subtitle="Edit, version and test prompt templates for roadmap, interview, code, resources and CV review." highlights={['ROADMAP_GENERATION', 'CODE_REVIEW', 'LEARNING_ASSISTANT']} />;
}
