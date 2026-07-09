import { PageShell } from '@/components/layout/page-shell';
import { PackageDetail } from '@/components/packages/package-detail';

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PackageDetail slug={params.slug} />
      </section>
    </PageShell>
  );
}
