import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminRoadmapRequestDetailPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Chi tiết yêu cầu lộ trình"
      subtitle="Thông tin học viên, bản nháp AI, editor admin, phân mentor và quy trình duyệt."
      highlights={['Sửa lộ trình theo tuần', 'Phân mentor', 'Duyệt lộ trình cuối']}
    />
  );
}
