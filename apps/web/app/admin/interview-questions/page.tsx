import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminInterviewQuestionsPage() {
  return <WorkspacePage role="admin" title="Interview Questions" subtitle="Manage role-specific technical, behavioral, HR, English and project-defense question sets." highlights={['Expected answer points', 'Sample answers', 'Common mistakes and tags']} />;
}
