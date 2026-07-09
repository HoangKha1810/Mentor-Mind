import { WorkspacePage } from '@/components/layout/workspace-page';

export default function ProfilePage() {
  return (
    <WorkspacePage
      role="student"
      title="Cài đặt hồ sơ"
      subtitle="Quản lý mục tiêu học, trình độ hiện tại, số giờ mỗi tuần, ngân sách, múi giờ và giới thiệu bản thân."
      highlights={[
        'Thông tin hồ sơ học viên',
        'Điểm mở rộng đổi mật khẩu an toàn',
        'Buổi học theo đúng múi giờ',
      ]}
    />
  );
}
