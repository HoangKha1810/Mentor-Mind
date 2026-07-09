import { WorkspacePage } from '@/components/layout/workspace-page';

export default function RoadmapsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Lộ trình của tôi"
      subtitle="Theo dõi lộ trình từ lúc gửi yêu cầu, được duyệt, bắt đầu học đến khi hoàn thành mục tiêu."
      highlights={[
        'Trạng thái rõ ràng cho từng lộ trình',
        'Timeline theo tuần kèm ghi chú mentor và tài nguyên đề xuất',
        'Tạo lộ trình mới khi mục tiêu học tập thay đổi',
      ]}
    />
  );
}
