import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminBookingsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Lịch học"
      subtitle="Toàn bộ lịch đặt trên nền tảng, có quản lý trạng thái và quyền điều chỉnh của admin."
      highlights={[
        'Xác nhận, hoàn tất hoặc đổi lịch buổi học',
        'Theo dõi lịch mentor và lịch học viên',
        'Link meeting, ghi chú và lịch sử điều chỉnh',
      ]}
    />
  );
}
