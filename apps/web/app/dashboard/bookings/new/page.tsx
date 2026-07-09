import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewBookingPage() {
  return (
    <WorkspacePage
      role="student"
      title="Đặt buổi học"
      subtitle="Chọn mentor, ngày giờ và thêm ghi chú học viên trước khi xác nhận."
      highlights={[
        'Xem khung giờ phù hợp với mentor',
        'Tự động rõ ràng theo múi giờ của học viên',
        'Admin có thể hỗ trợ điều chỉnh khi lịch học thay đổi',
      ]}
    />
  );
}
