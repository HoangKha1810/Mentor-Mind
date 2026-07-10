import type { Metadata } from 'next';
import { ResourceSearchPanel } from '@/components/dashboard/resource-search-panel';
import { PageShell } from '@/components/layout/page-shell';

export const metadata: Metadata = {
  title: 'Tài nguyên học lập trình, AI, phỏng vấn và CV',
  description:
    'Tìm tài nguyên học lập trình bằng AI: sách, docs, bài viết, dự án, bài code, gói học và tài liệu theo lộ trình.',
  keywords: ['tài nguyên học lập trình', 'docs lập trình', 'bài viết lập trình', 'tài nguyên AI', 'học frontend'],
  alternates: { canonical: '/resources' },
};

export default function PublicResourcesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium text-secondary">Tài nguyên</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Tìm tài nguyên học bằng AI</h1>
          <p className="mt-3 text-slate-300">
            Tìm sách, docs, bài viết, dự án, bài code và gói học từ kho nội bộ, Tavily và AI.
          </p>
        </div>
        <ResourceSearchPanel />
      </section>
    </PageShell>
  );
}
