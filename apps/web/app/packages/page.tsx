import Link from 'next/link';
import { Search } from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { packageCategoryLabel } from '@/lib/labels';
import { packages } from '@/lib/showcase-data';

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
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-mutedText" />
            <Input className="pl-9" placeholder="Tìm frontend, backend, AI, phỏng vấn..." />
          </div>
          <Button variant="outline">Frontend</Button>
          <Button variant="outline">Backend</Button>
          <Button variant="outline">Sự nghiệp</Button>
        </div>
        <StaggerContainer className="grid gap-4 lg:grid-cols-3">
          {packages.map((pack) => (
            <StaggerItem key={pack.slug}>
              <Card>
                <div className="flex items-center justify-between">
                  <Badge>{packageCategoryLabel(pack.category)}</Badge>
                  <span className="text-sm text-mutedText">{pack.durationWeeks} tuần</span>
                </div>
                <CardHeader className="mt-4">
                  <CardTitle>{pack.title}</CardTitle>
                  <CardDescription>{pack.shortDescription}</CardDescription>
                </CardHeader>
                <div className="mb-5 flex flex-wrap gap-2">
                  {pack.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold">
                    {formatCurrency(pack.price, pack.currency)}
                  </span>
                  <Link href={`/packages/${pack.slug}`}>
                    <Button>Xem chi tiết</Button>
                  </Link>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </PageShell>
  );
}
