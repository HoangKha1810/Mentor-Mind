import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { dashboardStats, roadmapWeeks } from '@/lib/showcase-data';

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Tổng quan học viên"
      subtitle="Theo dõi tiến độ lộ trình, buổi học, luyện code và mức sẵn sàng phỏng vấn trong một không gian gọn gàng."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lộ trình đang học</CardTitle>
            <CardDescription>Lộ trình Frontend Intern 1-1 đã được mentor duyệt</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {roadmapWeeks.map((week, index) => (
              <div
                key={week}
                className="flex items-center gap-3 rounded-md border border-white/8 bg-white/[0.03] p-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary/10 text-sm text-secondary">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-200">{week}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Việc nên làm tiếp theo</CardTitle>
            <CardDescription>
              Chuẩn bị câu trả lời cho buổi phỏng vấn thử tiếp theo với mentor.
            </CardDescription>
          </CardHeader>
          <Link href="/dashboard/interview/new">
            <Button className="w-full">
              Bắt đầu luyện phỏng vấn
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}
