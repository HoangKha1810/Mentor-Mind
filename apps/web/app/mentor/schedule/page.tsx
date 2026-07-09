import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorSchedulePage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Lịch dạy mentor"
      subtitle="Quản lý lịch rảnh hằng tuần và chấp nhận hoặc từ chối lịch đặt của học viên."
      highlights={[
        'Quản lý lịch rảnh',
        'Danh sách lịch đặt đang chờ và đã xác nhận',
        'Mô hình khung giờ theo múi giờ',
      ]}
    />
  );
}
