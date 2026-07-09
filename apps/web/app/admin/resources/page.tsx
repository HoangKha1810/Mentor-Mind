import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminResourcesPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Tài nguyên"
      subtitle="Curate sách, docs, bài viết, video, dự án, bài code và gói học."
      highlights={['Lưu kết quả tìm kiếm bên ngoài', 'Độ khó và tag', 'Lý do được đề xuất']}
    />
  );
}
