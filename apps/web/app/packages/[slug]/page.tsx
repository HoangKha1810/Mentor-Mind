import Link from 'next/link';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { packageCategoryLabel } from '@/lib/labels';
import { packages } from '@/lib/showcase-data';

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pack = packages.find((item) => item.slug === params.slug) ?? packages[0]!;

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
        <div>
          <Badge>{packageCategoryLabel(pack.category)}</Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white">{pack.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{pack.shortDescription}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              'Mục tiêu từng tuần',
              'Mentor đánh giá',
              'Luyện phỏng vấn AI',
              'Phản hồi bài code',
            ].map((item) => (
              <Card key={item} className="p-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="mt-3 font-medium text-white">{item}</div>
                <p className="mt-1 text-sm text-mutedText">
                  Được đưa vào kế hoạch học để học viên có tiến độ rõ ràng sau từng tuần.
                </p>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Công cụ AI đi kèm</CardTitle>
              <CardDescription>
                AI hỗ trợ luyện tập, phản hồi và gợi ý tài nguyên trong suốt quá trình có mentor dẫn
                dắt.
              </CardDescription>
            </CardHeader>
            <StaggerContainer className="flex flex-wrap gap-2">
              {pack.includedAiTools.map((tool) => (
                <StaggerItem key={tool} className="h-auto">
                  <Badge>{tool}</Badge>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{formatCurrency(pack.price, pack.currency)}</CardTitle>
            <CardDescription>
              {pack.recommendedSessions} buổi trong {pack.durationWeeks} tuần cho mục tiêu{' '}
              {pack.targetRole}.
            </CardDescription>
          </CardHeader>
          <Button className="w-full">
            <CalendarCheck className="h-4 w-4" />
            Yêu cầu tư vấn
          </Button>
          <Link href="/create-roadmap">
            <Button variant="outline" className="mt-3 w-full">
              Tạo lộ trình riêng
            </Button>
          </Link>
        </Card>
      </section>
    </PageShell>
  );
}
