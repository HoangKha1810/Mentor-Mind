import { WorkspacePage } from '@/components/layout/workspace-page';

export default function ProfilePage() {
  return (
    <WorkspacePage
      role="student"
      title="Profile Settings"
      subtitle="Manage learning goals, current level, weekly hours, budget range, timezone and bio."
      highlights={['Student profile fields', 'Secure change-password extension point', 'Timezone-aware sessions']}
    />
  );
}
