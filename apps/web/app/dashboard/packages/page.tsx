import { WorkspacePage } from '@/components/layout/workspace-page';

export default function DashboardPackagesPage() {
  return (
    <WorkspacePage
      role="student"
      title="My Packages"
      subtitle="View enrolled or consultation-requested 1-on-1 tutoring packages."
      highlights={['Consultation status', 'Package outcomes', 'Booking and roadmap CTAs']}
    />
  );
}
