import Link from 'next/link';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { PackageBrowser } from '@/components/packages/package-browser';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-secondary">Gói học và tư vấn</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Chọn lộ trình theo mục tiêu thật của bạn</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Giá và nội dung gói được lấy trực tiếp từ hệ thống quản trị. Khi admin cập nhật gói, trang này đổi theo.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Chưa chắc nên chọn gói nào?</CardTitle>
              <CardDescription>Tạo hồ sơ mục tiêu để hệ thống sinh lộ trình và đề xuất hướng học phù hợp.</CardDescription>
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
          <PackageBrowser />
        </div>
      </section>
    </PageShell>
  );
}
