import { resources } from '@/lib/showcase-data';
import { WorkspacePage } from '@/components/layout/workspace-page';

export default function DashboardResourcesPage() {
  return (
    <WorkspacePage
      role="student"
      title="Tài nguyên gợi ý"
      subtitle="Tìm tài nguyên đã curate và lưu sách, docs, bài viết, dự án hoặc bài luyện tập."
      highlights={resources}
    />
  );
}
