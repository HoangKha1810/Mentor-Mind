import { PageShell } from '@/components/layout/page-shell';
import { PublicFeaturePage } from '@/components/layout/public-feature-page';

export default function AiInterviewLanding() {
  return (
    <PageShell>
      <PublicFeaturePage
        eyebrow="AI Interview"
        title="AI Interview Practice"
        subtitle="Practice technical, behavioral, HR, English and project-defense interviews with rubric feedback."
        highlights={['Upload a JD to tailor questions', 'Score answers by correctness, clarity and role fit', 'Save history and weak areas']}
      />
    </PageShell>
  );
}
