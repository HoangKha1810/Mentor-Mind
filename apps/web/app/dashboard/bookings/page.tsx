import { WorkspacePage } from '@/components/layout/workspace-page';

export default function BookingsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Lịch học"
      subtitle="Xem các buổi học 1-1 sắp tới và đã diễn ra theo dạng lịch hoặc danh sách."
      highlights={[
        'Theo dõi buổi học đang chờ xác nhận, đã xác nhận, đã hoàn tất hoặc cần đổi lịch',
        'Link học, ghi chú mentor và nội dung chuẩn bị cho từng buổi',
        'Lịch sử học tập gắn với lộ trình hoặc gói học đã đăng ký',
      ]}
    />
  );
}
