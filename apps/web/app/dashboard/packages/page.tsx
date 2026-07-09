import { WorkspacePage } from '@/components/layout/workspace-page';

export default function DashboardPackagesPage() {
  return (
    <WorkspacePage
      role="student"
      title="Gói học của tôi"
      subtitle="Xem các gói học 1-1 đã đăng ký hoặc đã gửi yêu cầu tư vấn."
      highlights={[
        'Trạng thái tư vấn',
        'Kết quả đầu ra của gói học',
        'Nút đặt lịch và mở lộ trình',
      ]}
    />
  );
}
