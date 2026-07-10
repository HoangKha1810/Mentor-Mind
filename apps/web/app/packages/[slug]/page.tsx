import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/page-shell';
import { PackageDetail } from '@/components/packages/package-detail';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return {
    title: `Gói học ${params.slug.replaceAll('-', ' ')} | MentorMind`,
    description:
      'Chi tiết gói học MentorMind với mentor 1-1, lộ trình cá nhân hóa, bài tập, luyện code, luyện phỏng vấn và hỗ trợ AI.',
    alternates: { canonical: `/packages/${params.slug}` },
  };
}

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PackageDetail slug={params.slug} />
      </section>
    </PageShell>
  );
}
