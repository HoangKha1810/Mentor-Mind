import { resources } from '@/lib/mock-data';
import { WorkspacePage } from '@/components/layout/workspace-page';

export default function DashboardResourcesPage() {
  return (
    <WorkspacePage
      role="student"
      title="Resource Recommendations"
      subtitle="Search curated resources and save books, docs, articles, projects and practice items."
      highlights={resources}
    />
  );
}
