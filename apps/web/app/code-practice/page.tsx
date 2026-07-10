import type { Metadata } from 'next';
import { CodePracticePanel } from '@/components/dashboard/code-practice-panel';
import { PageShell } from '@/components/layout/page-shell';

export const metadata: Metadata = {
  title: 'Luyện code online với test tự động và gợi ý AI',
  description:
    'Luyện code online trên MentorMind: chọn bài, mở editor, chạy test, lưu submission và nhận gợi ý AI khi bị kẹt.',
  keywords: ['luyện code online', 'luyện thuật toán', 'bài tập lập trình', 'AI gợi ý code'],
  alternates: { canonical: '/code-practice' },
};

export default function CodePracticeLanding() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium text-secondary">Luyện code</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Luyện thuật toán với AI</h1>
          <p className="mt-3 text-slate-300">
            Chọn bài đã publish, mở editor, chạy test và đăng nhập để nộp bài hoặc nhận gợi ý AI.
          </p>
        </div>
        <CodePracticePanel />
      </section>
    </PageShell>
  );
}
