import { PageShell } from '@/components/layout/page-shell';
import { PublicFeaturePage } from '@/components/layout/public-feature-page';

export default function CodePracticeLanding() {
  return (
    <PageShell>
      <PublicFeaturePage
        eyebrow="Coding Practice"
        title="AI Coding Practice"
        subtitle="Solve problems with Monaco, public and hidden tests, safe judge provider, AI hints and review."
        highlights={['Mock judge for local development', 'Judge0-compatible production adapter', 'Progressive hints without early solution leaks']}
      />
    </PageShell>
  );
}
