import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { dashboardStats } from '@/lib/showcase-data';

export default function MentorOverviewPage() {
  return (
    <DashboardShell
      role="mentor"
      title="Tổng quan mentor"
      subtitle="Buổi học sắp tới, học viên được phân công, học viên có rủi ro và bài tập đang chờ review."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Học viên cần chú ý</CardTitle>
          <CardDescription>
            Insight từ AI giúp phát hiện hạng mục lộ trình bị chậm và điểm phỏng vấn thấp.
          </CardDescription>
        </CardHeader>
      </Card>
    </DashboardShell>
  );
}
