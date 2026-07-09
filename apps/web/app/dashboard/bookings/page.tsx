import { WorkspacePage } from '@/components/layout/workspace-page';

export default function BookingsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Bookings"
      subtitle="Calendar/list view of upcoming and past 1-on-1 sessions."
      highlights={['REQUESTED, CONFIRMED, COMPLETED and RESCHEDULED states', 'Mentor notes and meeting links', 'Booking history by roadmap or package']}
    />
  );
}
