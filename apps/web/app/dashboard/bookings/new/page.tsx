import { NewBookingForm } from '@/components/dashboard/new-booking-form';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function NewBookingPage() {
  return (
    <DashboardShell
      title="Đặt buổi học"
      subtitle="Chọn mentor, ngày giờ và thêm ghi chú học viên trước khi xác nhận."
    >
      <NewBookingForm />
    </DashboardShell>
  );
}
