import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminRoadmapRequestsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Yêu cầu lộ trình"
      subtitle="Duyệt bản nháp AI, phân mentor, lên lịch tư vấn và duyệt kế hoạch cuối."
      highlights={['Bộ lọc trạng thái', 'Bộ lọc admin/mentor phụ trách', 'Hàng chờ duyệt']}
    />
  );
}
