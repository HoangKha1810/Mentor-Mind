import Link from 'next/link';
import type { Metadata } from 'next';
import { History, MessageSquarePlus, Sparkles } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const modes = [
  { label: 'Kỹ thuật', mode: 'TECHNICAL', description: 'Câu hỏi theo vai trò, level và kỹ năng cốt lõi.' },
  { label: 'Bảo vệ dự án', mode: 'PROJECT_DEFENSE', description: 'Luyện cách trình bày kiến trúc, trade-off và kết quả.' },
  { label: 'Tiếng Anh', mode: 'ENGLISH', description: 'Rèn phản xạ trả lời phỏng vấn bằng tiếng Anh.' },
];

export const metadata: Metadata = {
  title: 'Luyện phỏng vấn AI cho IT, HR, tiếng Anh và dự án',
  description:
    'Luyện phỏng vấn AI theo vai trò, level và mode. Nhận điểm, feedback, câu trả lời tốt hơn và lưu lịch sử theo tài khoản.',
  keywords: ['luyện phỏng vấn AI', 'mock interview IT', 'phỏng vấn frontend', 'phỏng vấn tiếng Anh IT'],
  alternates: { canonical: '/ai-interview' },
};

export default function AiInterviewLanding() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-secondary">Phỏng vấn AI</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold text-white">
              Luyện phỏng vấn và lưu tiến độ theo tài khoản
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Tạo phiên luyện tập, trả lời từng câu, nhận điểm và phản hồi từ AI. Lịch sử được lưu để bạn xem lại điểm yếu lặp lại.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard/interview/new">
                <Button>
                  <MessageSquarePlus className="h-4 w-4" />
                  Bắt đầu phỏng vấn
                </Button>
              </Link>
              <Link href="/dashboard/interview/history">
                <Button variant="outline">
                  <History className="h-4 w-4" />
                  Xem lịch sử
                </Button>
              </Link>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Quy trình đang hoạt động</CardTitle>
              <CardDescription>
                Trang này dùng cùng API với dashboard: tạo session, gửi câu trả lời, chấm điểm và lưu lịch sử thật.
              </CardDescription>
            </CardHeader>
            <div className="grid gap-3 sm:grid-cols-3">
              {modes.map((item) => (
                <Link key={item.mode} href={`/dashboard/interview/new?mode=${item.mode}`}>
                  <Button variant="secondary" className="h-auto w-full flex-col items-start rounded-lg px-4 py-4 text-left">
                    <Sparkles className="h-4 w-4" />
                    <span>{item.label}</span>
                    <span className="text-xs font-normal leading-5 text-slate-300">{item.description}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
