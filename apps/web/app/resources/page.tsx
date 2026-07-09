import { PageShell } from '@/components/layout/page-shell';
import { PublicFeaturePage } from '@/components/layout/public-feature-page';

export default function PublicResourcesPage() {
  return (
    <PageShell>
      <PublicFeaturePage
        eyebrow="Resources"
        title="AI Resource Search"
        subtitle="Find books, docs, articles, projects, coding problems and platform packages matched to your goals."
        highlights={['Curated internal resources first', 'External results clearly labeled', 'AI explains why each result is useful']}
      />
    </PageShell>
  );
}
