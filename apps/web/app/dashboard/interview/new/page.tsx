import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewInterviewPage() {
  return (
    <WorkspacePage
      role="student"
      title="Start Interview Session"
      subtitle="Select target role, level, mode, upload JD optionally and start a practice session."
      highlights={['Technical, behavioral, HR, project defense, English and mixed modes', 'JD-tailored question generation', 'Text answer flow with optional browser voice input extension point']}
    />
  );
}
