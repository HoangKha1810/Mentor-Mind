import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { SubscriptionPlans } from '@/components/payments/subscription-plans';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Bảng giá MentorMind - AI, luyện code và gói học',
  description:
    'Bảng giá MentorMind cho quota AI, bài code đặc biệt, tính năng học tập nâng cao và các gói hỗ trợ học lập trình.',
  keywords: ['bảng giá học lập trình', 'giá mentor 1-1', 'gói AI học tập', 'MentorMind pricing'],
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-secondary">Gói sử dụng MentorMind</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">
              Mở quota AI, bài code đặc biệt và tính năng nâng cao
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Free dùng cơ bản với 3 tin nhắn AI mỗi ngày. Khi cần học nghiêm túc hơn, bạn có thể
              mua gói tháng hoặc năm bằng số dư ví.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Chưa chắc nên chọn gói nào?</CardTitle>
              <CardDescription>
                Tạo hồ sơ mục tiêu để hệ thống sinh lộ trình và đề xuất hướng học phù hợp.
              </CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-3">
              <Link href="/create-roadmap">
                <Button>
                  <ClipboardList className="h-4 w-4" />
                  Tạo lộ trình
                </Button>
              </Link>
              <Link href="/packages">
                <Button variant="outline">
                  Xem toàn bộ gói
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
        <div className="mt-8">
          <SubscriptionPlans />
        </div>
      </section>
    </PageShell>
  );
}
