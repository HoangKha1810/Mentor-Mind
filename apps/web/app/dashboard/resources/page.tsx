import { ResourceSearchPanel } from '@/components/dashboard/resource-search-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardResourcesPage() {
  return (
    <DashboardShell
      title="Tài nguyên gợi ý"
      subtitle="Tìm tài nguyên nội bộ, Tavily và đề xuất AI theo đúng mục tiêu học tập."
    >
      <ResourceSearchPanel />
    </DashboardShell>
  );
}
