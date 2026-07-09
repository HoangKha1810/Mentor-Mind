import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProfileSettings } from '@/components/dashboard/profile-settings';

export default function ProfilePage() {
  return (
    <DashboardShell
      title="Cài đặt hồ sơ"
      subtitle="Quản lý mục tiêu học, trình độ hiện tại, số giờ mỗi tuần, ngân sách, múi giờ và giới thiệu bản thân."
    >
      <ProfileSettings />
    </DashboardShell>
  );
}
