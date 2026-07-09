import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorSchedulePage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Mentor Schedule"
      subtitle="Manage weekly availability and accept or decline student bookings."
      highlights={['Availability manager', 'REQUESTED/CONFIRMED booking list', 'Timezone-aware slot model']}
    />
  );
}
