import { BookingsPanel } from '@/components/dashboard/bookings-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function BookingsPage() {
  return (
    <DashboardShell
      title="Lịch học"
      subtitle="Xem các buổi học 1-1 sắp tới và đã diễn ra theo dạng lịch hoặc danh sách."
    >
      <BookingsPanel />
    </DashboardShell>
  );
}
