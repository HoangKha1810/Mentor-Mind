import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NotificationsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Thông báo"
      subtitle="Duyệt lộ trình, lịch tư vấn, xác nhận buổi học, phản hồi bài tập và trạng thái thanh toán."
      highlights={[
        'Nhận cập nhật quan trọng theo đúng thời điểm',
        'Đánh dấu đã đọc để giữ dashboard gọn gàng',
        'Mở nhanh đến lộ trình, buổi học, bài tập hoặc thanh toán liên quan',
      ]}
    />
  );
}
