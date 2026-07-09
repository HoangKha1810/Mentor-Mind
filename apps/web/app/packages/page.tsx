import { PageShell } from '@/components/layout/page-shell';
import { PackageBrowser } from '@/components/packages/package-browser';

export default function PackagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium text-secondary">Gói học 1-1</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            Chọn gói học theo mục tiêu nghề nghiệp
          </h1>
          <p className="mt-3 text-slate-300">
            Mỗi gói học kết hợp mentor 1-1, bài tập, đánh giá tiến độ và công cụ AI để rút ngắn thời
            gian đạt mục tiêu.
          </p>
        </div>
        <PackageBrowser />
      </section>
    </PageShell>
  );
}
