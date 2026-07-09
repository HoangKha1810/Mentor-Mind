import { NotificationsList } from '@/components/dashboard/notifications-list';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function NotificationsPage() {
  return (
    <DashboardShell
      title="Thông báo"
      subtitle="Duyệt lộ trình, lịch tư vấn, xác nhận buổi học, phản hồi bài tập và trạng thái thanh toán."
    >
      <NotificationsList />
    </DashboardShell>
  );
}
