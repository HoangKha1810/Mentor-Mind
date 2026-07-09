import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminBookingsPage() {
  return <WorkspacePage role="admin" title="Bookings" subtitle="All platform bookings with status management and admin override." highlights={['REQUESTED/CONFIRMED/COMPLETED', 'Reschedule support', 'Meeting URL and notes']} />;
}
