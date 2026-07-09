import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewBookingPage() {
  return (
    <WorkspacePage
      role="student"
      title="Book a Session"
      subtitle="Choose mentor, date/time and add student notes before confirmation."
      highlights={['Mentor availability lookup', 'Timezone-aware schedule fields', 'Admin override compatible booking model']}
    />
  );
}
