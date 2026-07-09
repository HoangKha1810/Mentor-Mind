import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminResourcesPage() {
  return <WorkspacePage role="admin" title="Resources" subtitle="Curate books, docs, articles, videos, projects, coding problems and packages." highlights={['Save external search results', 'Difficulty and tags', 'Why recommended']} />;
}
